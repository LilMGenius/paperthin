#!/usr/bin/env node
// Rebuild a linear commit range without moving a ref: rewrite messages, or place a late commit at the time its work was
// done, keeping every other commit's own diff, author, committer and both raw dates. git does the work (commit-tree builds
// each commit, merge-tree --write-tree replays a diff onto a new parent, %G? reads a signature); this file orders the calls
// and checks each result. The caller moves the branch afterwards, once verify passes.
// Usage: node rebuild.mjs messages --repo <path> --base <commit> --messages <dir>
//        node rebuild.mjs place --repo <path> --base <commit> --late <commit> --date "<unix-seconds> <+zone>"
//        node rebuild.mjs verify --repo <path> --old <tip> --new <tip> [--placed <new-sha>...]
// Exit codes: 0 done or passed; 1 failed (a git call, a conflict, or a named verify failure); 2 usage or refused input.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const USAGE = 'usage: node rebuild.mjs messages --repo <path> --base <commit> --messages <dir>\n       node rebuild.mjs place --repo <path> --base <commit> --late <commit> --date "<unix-seconds> <+zone>"\n       node rebuild.mjs verify --repo <path> --old <tip> --new <tip> [--placed <new-sha>...]';

export class Refusal extends Error {}
export class Failure extends Error {}
export class CommandError extends Error {
  constructor(args, stderr, stdout) {
    super('git ' + args.join(' ') + ': ' + ((stderr || stdout).trim().split('\n')[0] || 'failed'));
  }
}

export function gitIn(repo) {
  return (args, { env, input, raw = false } = {}) => {
    try {
      const out = execFileSync('git', args, { cwd: repo, encoding: 'utf8', input, stdio: ['pipe', 'pipe', 'pipe'], maxBuffer: 1 << 26, env: env ? { ...process.env, ...env } : process.env });
      return raw ? out : out.trim();
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error) throw new CommandError(args, String(error.stderr ?? ''), String(error.stdout ?? ''));
      throw error;
    }
  };
}

const FIELDS = ['an', 'ae', 'ad', 'cn', 'ce', 'cd'];
const ENV = { an: 'GIT_AUTHOR_NAME', ae: 'GIT_AUTHOR_EMAIL', ad: 'GIT_AUTHOR_DATE', cn: 'GIT_COMMITTER_NAME', ce: 'GIT_COMMITTER_EMAIL', cd: 'GIT_COMMITTER_DATE' };
const DATE = /^(\d+) ([+-]\d{4})$/;
const seconds = (raw) => Number(raw.split(' ')[0]);

// One commit as the rebuild needs it: the six identity and date fields (raw dates), tree, parents and the exact message.
export function readCommit(git, sha) {
  const [an, ae, ad, cn, ce, cd, tree, parents] = git(['log', '-1', '--date=raw', '--format=%an%x00%ae%x00%ad%x00%cn%x00%ce%x00%cd%x00%T%x00%P', sha]).split('\0');
  const body = git(['cat-file', 'commit', sha], { raw: true });
  const split = body.indexOf('\n\n');
  const encoding = /^encoding (.+)$/m.exec(split < 0 ? body : body.slice(0, split));
  if (encoding && !/^utf-?8$/i.test(encoding[1].trim())) throw new Refusal(sha + ' carries a ' + encoding[1] + ' message encoding that a rebuild would rewrite as UTF-8');
  return { sha, an, ae, ad, cn, ce, cd, tree, parents: parents ? parents.split(' ') : [], message: split < 0 ? '' : body.slice(split + 2) };
}

const config = (git, key) => {
  try {
    return git(['config', '--get', key]);
  } catch (error) {
    if (error instanceof CommandError) return '';
    throw error;
  }
};
const resolve = (git, rev, flag) => {
  try {
    return git(['rev-parse', '--verify', '--quiet', rev + '^{commit}']);
  } catch (error) {
    if (error instanceof CommandError) throw new Refusal(flag + ' ' + rev + ' is not a commit');
    throw error;
  }
};

// base..HEAD oldest first, refusing anything but one straight line from base.
export function linearRange(git, base) {
  const baseSha = resolve(git, base, '--base');
  const tipSha = resolve(git, 'HEAD', 'HEAD');
  try {
    git(['merge-base', '--is-ancestor', baseSha, tipSha]);
  } catch (error) {
    if (error instanceof CommandError) throw new Refusal('--base ' + base + ' is not an ancestor of HEAD');
    throw error;
  }
  const lines = git(['rev-list', '--reverse', '--parents', baseSha + '..' + tipSha]).split('\n').filter(Boolean);
  if (!lines.length) throw new Refusal(base + '..HEAD is empty');
  const merges = lines.filter((entry) => entry.split(' ').length > 2).map((entry) => entry.split(' ')[0]);
  if (merges.length) throw new Refusal('merge commits in range, so the history is not linear: ' + merges.join(', '));
  return { base: baseSha, tip: tipSha, commits: lines.map((entry) => readCommit(git, entry.split(' ')[0])) };
}

// Rebuild the plan oldest first on top of base. A commit whose parent and message are unchanged keeps its id, and with it
// any signature its committer made. Any other is re-made with commit-tree under its own six fields; when its parent's
// tree moved, merge-tree replays its own diff onto the new parent. -S goes only on commits the repository user committed,
// and only when user.signingkey is set; every other commit gets --no-gpg-sign so commit.gpgsign cannot sign it as ours.
function rebuild(git, base, plan) {
  const user = config(git, 'user.email');
  const key = config(git, 'user.signingkey');
  const trees = new Map();
  const treeOf = (sha) => {
    if (!trees.has(sha)) trees.set(sha, git(['rev-parse', sha + '^{tree}']));
    return trees.get(sha);
  };
  let parent = base;
  let ours = 0;
  let unsigned = 0;
  const map = {};
  for (const { commit, message = commit.message, dates } of plan) {
    const oldParent = commit.parents[0];
    if (oldParent === parent && message === commit.message && !dates) {
      map[commit.sha] = commit.sha;
      parent = commit.sha;
      continue;
    }
    let tree = commit.tree;
    if (treeOf(oldParent) !== treeOf(parent)) {
      try {
        tree = git(['merge-tree', '--write-tree', '--merge-base=' + oldParent, parent, commit.sha]).split('\n')[0];
      } catch (error) {
        if (error instanceof CommandError) throw new Failure('replaying ' + commit.sha + ' onto ' + parent + ' conflicts, so its diff does not apply at that point');
        throw error;
      }
    }
    const fields = dates ? { ...commit, ad: dates, cd: dates } : commit;
    const env = Object.fromEntries(FIELDS.map((field) => [ENV[field], field.endsWith('d') ? '@' + fields[field] : fields[field]]));
    const mine = Boolean(user) && fields.ce === user;
    if (mine) ours += 1;
    if (mine && !key) unsigned += 1;
    const sign = mine && key ? ['-S'] : ['--no-gpg-sign'];
    parent = git(['commit-tree', tree, '-p', parent, ...sign, '-F', '-'], { env, input: message });
    trees.set(parent, tree);
    map[commit.sha] = parent;
  }
  return { map, tip: parent, signing: !ours ? 'not needed' : unsigned ? 'unavailable: user.signingkey is unset, so ' + unsigned + ' commit(s) you committed were left unsigned' : 'signed' };
}

export function messages(git, { base, messages: dir }) {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) throw new Refusal('--messages ' + dir + ' is not a directory');
  const range = linearRange(git, base);
  const shas = new Set(range.commits.map((commit) => commit.sha));
  const stray = readdirSync(dir).filter((name) => /^[0-9a-f]{40,64}\.txt$/.test(name) && !shas.has(name.slice(0, -4)));
  if (stray.length) throw new Refusal('message files name commits outside ' + base + '..HEAD: ' + stray.join(', '));
  const plan = range.commits.map((commit) => {
    const file = join(dir, commit.sha + '.txt');
    return existsSync(file) ? { commit, message: readFileSync(file, 'utf8') } : { commit };
  });
  const result = rebuild(git, range.base, plan);
  return { base: range.base, old: range.tip, new: result.tip, map: result.map, signing: result.signing };
}

export function place(git, { base, late, date }) {
  if (!DATE.test(date)) throw new Refusal('--date must be "<unix-seconds> <+zone>", such as "1767225600 +0900"');
  const range = linearRange(git, base);
  const lateSha = resolve(git, late, '--late');
  const index = range.commits.findIndex((commit) => commit.sha === lateSha);
  if (index < 0) throw new Refusal('--late ' + late + ' is not in ' + base + '..HEAD');
  const when = seconds(date);
  if (seconds(readCommit(git, range.base).cd) > when) throw new Refusal('--date falls before the committer date of --base, so pass an earlier --base');
  const others = range.commits.filter((_, i) => i !== index);
  let at = -1;
  others.forEach((commit, i) => {
    if (seconds(commit.cd) <= when) at = i;
  });
  const plan = [...others.slice(0, at + 1).map((commit) => ({ commit })), { commit: range.commits[index], dates: date }, ...others.slice(at + 1).map((commit) => ({ commit }))];
  const result = rebuild(git, range.base, plan);
  return { base: range.base, old: range.tip, new: result.tip, map: result.map, placed: [result.map[lateSha]], signing: result.signing };
}

const identity = (commit) => FIELDS.map((field) => commit[field]).join(' ');

export function verify(git, { old, new: next, placed = [] }) {
  const oldSha = resolve(git, old, '--old');
  const newSha = resolve(git, next, '--new');
  const base = git(['merge-base', oldSha, newSha]);
  const range = (tip) => git(['rev-list', '--reverse', base + '..' + tip]).split('\n').filter(Boolean).map((sha) => readCommit(git, sha));
  const before = range(oldSha);
  const after = range(newSha);
  const placedCommits = placed.map((rev) => {
    const sha = resolve(git, rev, '--placed');
    const commit = after.find((candidate) => candidate.sha === sha);
    if (!commit) throw new Refusal('--placed ' + rev + ' is not in the new range');
    return commit;
  });
  const placedShas = new Set(placedCommits.map((commit) => commit.sha));
  const failures = [];
  const checks = {};

  const merges = after.filter((commit) => commit.parents.length > 1).map((commit) => commit.sha);
  checks.merges = merges.length ? 'fail' : 'pass';
  if (merges.length) failures.push('merges: the new range holds merge commits ' + merges.join(', '));

  // A placed commit either moved within the old range (its twin there has the same author and message) or was not in it;
  // only one that was not in it may change the tip's tree, and by exactly its own diff.
  const twins = new Set();
  const added = [];
  for (const commit of placedCommits) {
    const twin = before.find((candidate) => !twins.has(candidate.sha) && candidate.an === commit.an && candidate.ae === commit.ae && candidate.message === commit.message);
    if (twin) twins.add(twin.sha);
    else added.push(commit);
  }
  let expected = readCommit(git, oldSha).tree;
  checks.tree = 'pass';
  try {
    for (const commit of added) expected = git(['merge-tree', '--write-tree', '--merge-base=' + commit.parents[0], expected, commit.sha]).split('\n')[0];
    if (expected !== readCommit(git, newSha).tree) checks.tree = 'fail';
  } catch (error) {
    if (!(error instanceof CommandError)) throw error;
    checks.tree = 'fail';
  }
  if (checks.tree === 'fail') failures.push('tree: the new tip differs from the old tip by more than the placed commits\' own diffs');

  const oldKept = before.filter((commit) => !twins.has(commit.sha));
  const newKept = after.filter((commit) => !placedShas.has(commit.sha));
  const first = Array.from({ length: Math.max(oldKept.length, newKept.length) }, (_, i) => i).find((i) => !oldKept[i] || !newKept[i] || identity(oldKept[i]) !== identity(newKept[i]));
  checks.identity = first === undefined ? 'pass' : 'fail';
  if (first !== undefined) failures.push('identity: the "%an %ae %ad %cn %ce %cd" line of ' + (oldKept[first]?.sha ?? '(no old commit)') + ' changed from "' + (oldKept[first] ? identity(oldKept[first]) : '(none)') + '" to "' + (newKept[first] ? identity(newKept[first]) : '(none)') + '"');

  checks.placed = placedCommits.length ? 'pass' : 'not needed';
  for (const commit of placedCommits) {
    const parent = readCommit(git, commit.parents[0]);
    const problems = [];
    if (commit.ad !== commit.cd) problems.push('placed: ' + commit.sha + ' has author date ' + commit.ad + ' and committer date ' + commit.cd + ' where one time belongs');
    if (seconds(commit.cd) < seconds(parent.cd)) problems.push('placed: ' + commit.sha + ' is dated before its parent\'s committer date ' + parent.cd);
    if (problems.length) checks.placed = 'fail';
    failures.push(...problems);
  }

  const user = config(git, 'user.email');
  const key = config(git, 'user.signingkey');
  const own = user ? after.filter((commit) => commit.ce === user) : [];
  const unsigned = own.filter((commit) => git(['log', '-1', '--format=%G?', commit.sha]) !== 'G').map((commit) => commit.sha);
  checks.signing = !own.length ? 'not needed' : !unsigned.length ? 'pass' : key ? 'fail' : 'unavailable';
  if (checks.signing === 'fail') failures.push('signing: commits ' + user + ' committed are not signed G: ' + unsigned.join(', '));
  return { ok: failures.length === 0, base, old: oldSha, new: newSha, checks, failures, ...(checks.signing === 'unavailable' ? { unsigned } : {}) };
}

export function main(argv) {
  let values;
  let command;
  try {
    ({ values, positionals: [command] } = parseArgs({ args: argv, allowPositionals: true, options: {
      repo: { type: 'string' }, base: { type: 'string' }, messages: { type: 'string' }, late: { type: 'string' }, date: { type: 'string' },
      old: { type: 'string' }, new: { type: 'string' }, placed: { type: 'string', multiple: true }, help: { type: 'boolean' },
    } }));
    if (values.help) {
      console.log(USAGE);
      return 0;
    }
    if (!['messages', 'place', 'verify'].includes(command)) throw new Refusal('name messages, place or verify');
    const required = { messages: ['repo', 'base', 'messages'], place: ['repo', 'base', 'late', 'date'], verify: ['repo', 'old', 'new'] }[command];
    const missing = required.filter((name) => !values[name]);
    if (missing.length) throw new Refusal('missing ' + missing.map((name) => '--' + name).join(', '));
    if (!existsSync(values.repo)) throw new Refusal('--repo ' + values.repo + ' does not exist');
  } catch (error) {
    if (error instanceof TypeError || error instanceof Refusal) {
      console.error('re0-git: ' + error.message + '\n' + USAGE);
      return 2;
    }
    throw error;
  }
  const git = gitIn(values.repo);
  try {
    const result = command === 'messages' ? messages(git, values) : command === 'place' ? place(git, values) : verify(git, values);
    console.log(JSON.stringify(result, null, 2));
    return command === 'verify' && !result.ok ? 1 : 0;
  } catch (error) {
    if (error instanceof Refusal) {
      console.error('re0-git: ' + error.message);
      return 2;
    }
    if (error instanceof Failure || error instanceof CommandError) {
      console.error('re0-git: ' + error.message);
      return 1;
    }
    throw error;
  }
}

// An installed skill is often a link to its source folder; Node resolves import.meta.url through the link while argv keeps
// the link path, so both sides are compared as real paths or a call through the link exits 0 having done nothing.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) process.exitCode = main(process.argv.slice(2));
