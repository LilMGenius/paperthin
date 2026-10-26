#!/usr/bin/env node
// Republish a GitHub repository as one signed commit: audit what the delete would lose, squash the branch into one commit
// with the same tree, then delete the remote, recreate it with the same settings and push. git and gh do the work; this
// file orders their calls and checks each result.
// Usage: node squash.mjs audit [--repo <owner/name>]
//        node squash.mjs squash --message-file <file> [--bundle <path>]
//        node squash.mjs republish --confirm <owner/name> [--accept-loss] [--repo <owner/name>]
// Exit codes: 0 done; 1 refused or failed; 2 usage; 3 audit found blockers.
import { execFileSync } from 'node:child_process';
import { existsSync, realpathSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const USAGE = 'usage: node squash.mjs audit [--repo <owner/name>]\n       node squash.mjs squash --message-file <file> [--bundle <path>]\n       node squash.mjs republish --confirm <owner/name> [--accept-loss] [--repo <owner/name>]';

export class Refusal extends Error {}
export class UsageError extends Error {}
export class CommandError extends Error {
  constructor(bin, args, stderr) {
    super(bin + ' ' + args.join(' ') + ': ' + (stderr.trim().split('\n')[0] || 'failed'));
    this.stderr = stderr;
  }
}

export function runner(bin) {
  return (args, { env } = {}) => {
    try {
      return execFileSync(bin, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 26, env: env ? { ...process.env, ...env } : process.env }).trim();
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error) throw new CommandError(bin, args, String(error.stderr ?? ''));
      throw error;
    }
  };
}

const defaults = () => ({ git: runner('git'), gh: runner('gh'), now: () => new Date().toISOString(), home: homedir() });

export function parseRepo(url) {
  const match = /github\.com[/:]([^/\s]+\/[^/\s]+?)(?:\.git)?\/?$/.exec(url);
  if (!match) throw new Refusal('origin is not a GitHub repository: ' + url);
  return match[1];
}

// Anything gh cannot read is a blocker, never a zero: a webhook list the token may not read is not an empty one.
const UNREADABLE = 'unreadable';
function readJson(gh, route) {
  try {
    return { value: JSON.parse(gh(['api', route]) || 'null') };
  } catch (error) {
    if (error instanceof CommandError) return { error };
    throw error;
  }
}
function count(gh, route) {
  const { value, error } = readJson(gh, route);
  if (error) return UNREADABLE;
  if (Array.isArray(value)) return value.length;
  if (value && typeof value.total_count === 'number') return value.total_count;
  if (value && Array.isArray(value.secrets)) return value.secrets.length;
  if (value && Array.isArray(value.variables)) return value.variables.length;
  return UNREADABLE;
}
function names(gh, route, pick) {
  const { value, error } = readJson(gh, route);
  return error || !Array.isArray(value) ? UNREADABLE : value.map(pick);
}

export const SETTINGS = Object.freeze(['has_issues', 'has_wiki', 'has_projects', 'has_discussions', 'allow_squash_merge', 'allow_merge_commit', 'allow_rebase_merge', 'delete_branch_on_merge']);

// Every key whose value is not empty, zero or false is something the delete takes with it.
export function blockersOf(local, remote, defaultBranch) {
  const blockers = [];
  for (const [key, value] of Object.entries(remote)) {
    if (value === UNREADABLE) blockers.push(key + ': unreadable, so its loss cannot be ruled out');
    else if (Array.isArray(value) ? value.length : value) blockers.push(key + ': ' + (Array.isArray(value) ? value.join(', ') : value));
  }
  if (local.dirty) blockers.push('working tree has uncommitted changes');
  if (local.branch !== defaultBranch) blockers.push('current branch ' + local.branch + ' is not the default ' + defaultBranch);
  return blockers;
}

export function audit(repo, deps = defaults()) {
  const { git, gh } = deps;
  const meta = JSON.parse(gh(['api', 'repos/' + repo]));
  const owner = meta.owner.login;
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const lines = (text) => text.split('\n').filter(Boolean);
  const local = {
    branch,
    head: git(['rev-parse', 'HEAD']),
    commits: Number(git(['rev-list', '--count', 'HEAD'])),
    dirty: git(['status', '--porcelain']) !== '',
    otherBranches: lines(git(['for-each-ref', '--format=%(refname:short)', 'refs/heads'])).filter((name) => name !== branch),
    tags: lines(git(['tag'])),
    stashes: lines(git(['stash', 'list'])).length,
  };
  const branches = names(gh, 'repos/' + repo + '/branches?per_page=100', (b) => b.name);
  const collaborators = names(gh, 'repos/' + repo + '/collaborators?per_page=100', (c) => c.login);
  const pages = readJson(gh, 'repos/' + repo + '/pages');
  const remote = {
    issues: count(gh, 'search/issues?q=repo:' + repo + '+is:issue'),
    pullRequests: count(gh, 'search/issues?q=repo:' + repo + '+is:pr'),
    releases: count(gh, 'repos/' + repo + '/releases?per_page=100'),
    otherBranches: branches === UNREADABLE ? UNREADABLE : branches.filter((name) => name !== meta.default_branch),
    tags: count(gh, 'repos/' + repo + '/tags?per_page=100'),
    webhooks: count(gh, 'repos/' + repo + '/hooks'),
    secrets: count(gh, 'repos/' + repo + '/actions/secrets'),
    variables: count(gh, 'repos/' + repo + '/actions/variables'),
    rulesets: count(gh, 'repos/' + repo + '/rulesets'),
    deployKeys: count(gh, 'repos/' + repo + '/keys'),
    pages: pages.error ? (/HTTP 404/.test(pages.error.stderr) ? false : UNREADABLE) : pages.value?.html_url || true,
    collaborators: collaborators === UNREADABLE ? UNREADABLE : collaborators.filter((login) => login !== owner),
    forks: meta.forks_count,
    stars: meta.stargazers_count,
  };
  const settings = {
    visibility: meta.visibility, description: meta.description || '', homepage: meta.homepage || '', topics: meta.topics || [],
    default_branch: meta.default_branch, ...Object.fromEntries(SETTINGS.map((key) => [key, meta[key]])),
  };
  const notes = [];
  if (local.otherBranches.length || local.tags.length) notes.push('local branches and tags keep the old commits and are not pushed');
  if (typeof remote.secrets === 'number' && remote.secrets > 0) notes.push('secret values cannot be read back; they must be re-entered by hand');
  return { repo, local, remote, settings, blockers: blockersOf(local, remote, meta.default_branch), notes };
}

export function squash({ messageFile, bundle }, deps = defaults()) {
  const { git, now, home } = deps;
  if (!messageFile || !existsSync(messageFile)) throw new UsageError('--message-file <file> is required');
  if (git(['status', '--porcelain']) !== '') throw new Refusal('working tree is dirty; commit or stash first');
  const old = git(['rev-parse', 'HEAD']);
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  if (branch === 'HEAD') throw new Refusal('HEAD is detached; check out the branch to republish');
  const target = bundle ?? join(home, basename(git(['rev-parse', '--show-toplevel'])) + '-history-' + old.slice(0, 7) + '.bundle');
  git(['bundle', 'create', target, branch]);
  git(['bundle', 'verify', target]);
  const tree = git(['rev-parse', 'HEAD^{tree}']);
  const stamp = now();
  const commit = git(['commit-tree', tree, '-S', '-F', messageFile], { env: { GIT_AUTHOR_DATE: stamp, GIT_COMMITTER_DATE: stamp } });
  git(['reset', '--soft', commit]);
  if (git(['rev-parse', 'HEAD^{tree}']) !== tree || git(['diff', old, 'HEAD']) !== '') throw new Refusal('tree changed after squash; the old tip is ' + old);
  const signature = git(['log', '-1', '--format=%G?']);
  return { old, new: commit, commits: Number(git(['rev-list', '--count', 'HEAD'])), signature, bundle: target };
}

export function republish(repo, { confirm, acceptLoss = false }, deps = defaults()) {
  const { git, gh } = deps;
  if (confirm !== repo) throw new Refusal('--confirm must repeat ' + repo + ' exactly');
  const before = audit(repo, deps);
  if (before.blockers.length && !acceptLoss) throw new Refusal('blockers present; brief the user, then pass --accept-loss if they accept: ' + before.blockers.join('; '));
  if (before.local.commits !== 1) throw new Refusal('local ' + before.local.branch + ' has ' + before.local.commits + ' commits; run squash first');
  const s = before.settings;
  gh(['repo', 'delete', repo, '--yes']);
  const create = ['repo', 'create', repo, '--' + (s.visibility === 'public' ? 'public' : s.visibility === 'internal' ? 'internal' : 'private')];
  if (s.description) create.push('--description', s.description);
  if (s.homepage) create.push('--homepage', s.homepage);
  gh(create);
  gh(['api', '-X', 'PATCH', 'repos/' + repo, ...SETTINGS.flatMap((key) => ['-F', key + '=' + s[key]]), '--silent']);
  if (s.topics.length) gh(['api', '-X', 'PUT', 'repos/' + repo + '/topics', ...s.topics.flatMap((topic) => ['-f', 'names[]=' + topic]), '--silent']);
  git(['push', '-u', 'origin', before.local.branch]);
  gh(['api', '-X', 'PATCH', 'repos/' + repo, '-f', 'default_branch=' + before.local.branch, '--silent']);
  const after = JSON.parse(gh(['api', 'repos/' + repo]));
  const pushed = git(['ls-remote', 'origin', 'refs/heads/' + before.local.branch]).split(/\s/)[0];
  const settingsDrift = Object.keys(s).filter((key) => key !== 'topics' && after[key] !== undefined && String(after[key] ?? '') !== String(s[key] ?? ''));
  const matchesLocal = pushed === before.local.head;
  return { repo, pushed, matchesLocal, settingsDrift, notRestored: ['secrets', 'variables', 'webhooks', 'rulesets', 'deploy keys', 'collaborators'], ok: matchesLocal && settingsDrift.length === 0 };
}

export function main(argv, deps = defaults()) {
  let values;
  let command;
  try {
    ({ values, positionals: [command] } = parseArgs({ args: argv, allowPositionals: true, options: {
      repo: { type: 'string' }, 'message-file': { type: 'string' }, bundle: { type: 'string' },
      confirm: { type: 'string' }, 'accept-loss': { type: 'boolean' }, help: { type: 'boolean' },
    } }));
    if (values.help) {
      console.log(USAGE);
      return 0;
    }
    if (!['audit', 'squash', 'republish'].includes(command)) throw new UsageError('name audit, squash or republish');
  } catch (error) {
    if (error instanceof TypeError || error instanceof UsageError) {
      console.error(error.message + '\n' + USAGE);
      return 2;
    }
    throw error;
  }
  try {
    const repo = () => values.repo ?? parseRepo(deps.git(['remote', 'get-url', 'origin']));
    const result = command === 'audit' ? audit(repo(), deps)
      : command === 'squash' ? squash({ messageFile: values['message-file'], bundle: values.bundle }, deps)
      : republish(repo(), { confirm: values.confirm, acceptLoss: values['accept-loss'] === true }, deps);
    console.log(JSON.stringify(result, null, 2));
    if (command === 'audit') return result.blockers.length ? 3 : 0;
    if (command === 'republish') return result.ok ? 0 : 1;
    return 0;
  } catch (error) {
    if (error instanceof UsageError) {
      console.error(error.message + '\n' + USAGE);
      return 2;
    }
    if (error instanceof Refusal || error instanceof CommandError) {
      console.error('re0-squash: ' + error.message);
      return 1;
    }
    throw error;
  }
}

// An installed skill is often a link to its source folder; Node resolves import.meta.url through the link while argv keeps
// the link path, so both sides are compared as real paths or a call through the link exits 0 having done nothing.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) process.exitCode = main(process.argv.slice(2));
