import { copyFileSync, existsSync, globSync, lstatSync, mkdirSync, mkdtempSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const usage = 'Usage: node restart-handoff.mjs --repo <path> (--prepared <directory> | --prepared-branch <ref>) [--remote origin] [--ledger <glob or path>] [--snapshot-only] [--snapshot <directory>] [--restart-branch restart-v0] [--archive-message <message>] [--restart-message <message>]\nExit codes: 0 handoff printed (or --help), 2 precondition failed, 1 usage. Preconditions go to stderr; executable handoff goes to stdout.';
const defaultArchiveMessage = 'chore(archive): keep the ledgers of the replaced line';
const defaultRestartMessage = 'feat(v0.1.0): restart from proven contracts';
const quote = value => `'${value.replaceAll("'", "'\\''")}'`;
const portable = value => value.split(sep).join('/');
const inside = (parent, child) => {
  const path = relative(parent, child);
  return path === '' || (!isAbsolute(path) && path !== '..' && !path.startsWith(`..${sep}`));
};
let options;
try {
  options = parseArgs({ options: {
    repo: { type: 'string' }, prepared: { type: 'string' }, 'prepared-branch': { type: 'string' },
    remote: { type: 'string', default: 'origin' },
    ledger: { type: 'string', multiple: true, default: [] },
    'snapshot-only': { type: 'boolean', default: false }, snapshot: { type: 'string' },
    'restart-branch': { type: 'string' },
    'archive-message': { type: 'string' }, 'restart-message': { type: 'string' },
    help: { type: 'boolean' },
  } }).values;
  if (options.help) {
    console.log(usage);
    process.exit(0);
  }
  if (!options.repo || !options.prepared === !options['prepared-branch'] || Object.values(options).some(value => value === '')) {
    throw new Error('--repo and exactly one of --prepared or --prepared-branch are required; option values must not be empty.');
  }
  if (options['prepared-branch'] && (options['restart-branch'] || options['restart-message'])) {
    throw new Error('--restart-branch and --restart-message apply only to --prepared; a prepared branch already holds its commits.');
  }
  if (options['snapshot-only'] && options['archive-message']) {
    throw new Error('--archive-message does not apply with --snapshot-only, which makes no archive commit.');
  }
} catch (error) {
  console.error(`${error.message}\n${usage}`);
  process.exit(1);
}

try {
  const repo = realpathSync(resolve(options.repo));
  const run = (...args) => spawnSync('git', ['-C', repo, ...args], {
    encoding: 'utf8', env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' },
  });
  const git = (...args) => {
    const result = run(...args);
    if (result.error || result.status !== 0) {
      throw new Error(`git ${args[0]} failed: ${result.error?.message ?? result.stderr.trim()}`);
    }
    return result.stdout.trim();
  };
  let failed = false;
  const check = (condition, message) => {
    console.error(`${condition ? 'PASS' : 'FAIL'}: ${message}`);
    if (!condition) failed = true;
  };
  if (realpathSync(git('rev-parse', '--show-toplevel')) !== repo) {
    throw new Error('--repo must name the checkout root');
  }
  const remote = options.remote;
  if (remote.startsWith('-')) throw new Error('Invalid remote name');
  const url = git('remote', 'get-url', remote);
  check(url === git('remote', 'get-url', '--push', remote), 'remote fetch and push destinations agree');
  const oldTip = git('rev-parse', '--verify', 'refs/heads/main');
  const timestamp = git('log', '-1', '--date=format:%Y%m%d-%H%M%S', '--format=%cd', oldTip);
  const archive = `archive/${timestamp}`;
  const snapshotOnly = options['snapshot-only'];
  const branchMode = Boolean(options['prepared-branch']);
  const restart = options['restart-branch'] ?? 'restart-v0';
  const refs = git('ls-remote', '--heads', remote);
  const remoteRefs = new Map(refs.split('\n').filter(Boolean).map(line => {
    const [tip, ref] = line.split(/\s+/);
    return [ref, tip];
  }));
  check(git('status', '--porcelain') === '', 'working tree has no pending changes (git status --porcelain empty)');
  check(git('for-each-ref', '--format=%(refname)', `refs/heads/${archive}`) === '' && !remoteRefs.has(`refs/heads/${archive}`), `archive branch name unused locally and remotely: ${archive}`);
  check(remoteRefs.get('refs/heads/main') === oldTip, `remote main tip matches recorded old tip ${oldTip}; remote main=${remoteRefs.get('refs/heads/main') ?? 'missing'}${remoteRefs.get('refs/heads/main') === oldTip ? '' : ' (mismatch)'}`);

  const hook = resolve(repo, git('rev-parse', '--git-path', 'hooks/commit-msg'));
  const hasHook = existsSync(hook) && statSync(hook).isFile();
  const checkMessage = (label, message) => {
    if (!hasHook) return;
    const scratch = mkdtempSync(join(tmpdir(), 're0-work-message-'));
    try {
      const file = join(scratch, 'COMMIT_EDITMSG');
      writeFileSync(file, `${message}\n`);
      const result = run('hook', 'run', 'commit-msg', '--', file);
      const said = `${result.stdout ?? ''} ${result.stderr ?? ''}`.replace(/\s+/g, ' ').trim();
      check(result.status === 0, `${label} passes the repository's commit-msg hook${result.status === 0 ? '' : `: ${said || result.error?.message || `exit ${result.status}`}`}`);
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  };
  if (!hasHook) console.error(`INFO: no commit-msg hook resolves at ${portable(hook)}; commit messages meet no repository check`);
  const archiveMessage = options['archive-message'] ?? defaultArchiveMessage;
  const restartMessage = options['restart-message'] ?? defaultRestartMessage;
  if (!snapshotOnly) checkMessage('archive message', archiveMessage);

  let prepared;
  let preparedTip;
  if (branchMode) {
    const ref = options['prepared-branch'];
    if (ref.startsWith('-')) throw new Error('Invalid prepared branch');
    preparedTip = git('rev-parse', '--verify', `${ref}^{commit}`);
    check(preparedTip !== oldTip, `prepared branch ${ref} differs from main (${preparedTip})`);
    check(run('merge-base', oldTip, preparedTip).status === 1, `prepared branch ${ref} is an orphan line sharing no history with main`);
    for (const commit of git('rev-list', preparedTip).split('\n').filter(Boolean)) {
      checkMessage(`prepared commit ${commit.slice(0, 12)} message`, git('log', '-1', '--format=%B', commit));
    }
  } else {
    git('check-ref-format', `refs/heads/${restart}`);
    check(git('for-each-ref', '--format=%(refname)', `refs/heads/${restart}`) === '' && !remoteRefs.has(`refs/heads/${restart}`), `restart branch name unused locally and remotely: ${restart}`);
    checkMessage('restart message', restartMessage);
    prepared = resolve(options.prepared);
    check(existsSync(prepared) && statSync(prepared).isDirectory(), `prepared directory exists: ${portable(prepared)}`);
    if (existsSync(prepared) && statSync(prepared).isDirectory()) {
      check(globSync('**/.git', { cwd: prepared }).length === 0, 'prepared directory contains no .git');
      check(!inside(repo, realpathSync(prepared)) && !inside(realpathSync(prepared), repo), 'prepared tree is separate from the checkout');
    }
  }
  if (failed) process.exit(2);

  const patterns = ['.omo/evidence/*/ROUNDS.md', '.omo/ulw-execute/ledger.jsonl', '.omo/ulw-loop/*/ledger.jsonl', ...options.ledger];
  const ledgers = new Set();
  for (const pattern of patterns) {
    const literal = resolve(repo, pattern);
    const matches = existsSync(literal) ? [literal] : globSync(portable(pattern), { cwd: repo }).map(path => resolve(repo, path));
    if (options.ledger.includes(pattern) && matches.length === 0) throw new Error(`Ledger path matched no files: ${pattern}`);
    for (const path of matches) {
      const name = portable(relative(repo, path));
      if (!inside(repo, path) || !inside(repo, realpathSync(path)) || !lstatSync(path).isFile()) {
        throw new Error(`Ledger must be a regular file inside the checkout: ${name}`);
      }
      if (name.startsWith('docs/')) throw new Error(`Ledger cannot be carried under docs/: ${name}`);
      git('check-ignore', '--quiet', '--', name);
      ledgers.add(name);
    }
  }
  const files = [...ledgers].sort();
  if (branchMode && files.length) {
    const tracked = git('ls-tree', '-r', '--name-only', preparedTip, '--', ...files);
    check(tracked === '', `prepared branch tracks no ledger${tracked ? `: ${tracked.split('\n').join(', ')}` : ''}`);
    if (failed) process.exit(2);
  }
  const snapshot = resolve(options.snapshot ?? resolve(dirname(repo), `${basename(repo)}-restart-snapshot`));
  let ancestor = snapshot;
  while (!existsSync(ancestor)) ancestor = dirname(ancestor);
  const actualSnapshot = resolve(realpathSync(ancestor), relative(ancestor, snapshot));
  if (inside(repo, actualSnapshot) || inside(actualSnapshot, repo) || (prepared && (inside(prepared, actualSnapshot) || inside(actualSnapshot, prepared)))) {
    throw new Error('Snapshot directory must be separate from the checkout and prepared tree');
  }
  for (const file of files) {
    const destination = resolve(snapshot, file);
    let parent = dirname(destination);
    while (!existsSync(parent)) parent = dirname(parent);
    if (!inside(actualSnapshot, resolve(realpathSync(parent), relative(parent, destination)))) {
      throw new Error(`Snapshot path escapes its directory: ${file}`);
    }
    if (existsSync(destination) && !lstatSync(destination).isFile()) throw new Error(`Snapshot target is not a regular file: ${file}`);
  }
  for (const file of files) {
    const destination = resolve(snapshot, file);
    mkdirSync(dirname(destination), { recursive: true });
    copyFileSync(resolve(repo, file), destination);
  }
  console.error(`PASS: snapshotted ${files.length} ignored ledger file(s) to ${portable(snapshot)}${snapshotOnly ? '; the snapshot is their only address' : ''}`);

  let readback = `${snapshot}-readback`;
  for (let suffix = 1; existsSync(readback); suffix++) readback = `${snapshot}-readback-${suffix}`;
  const cloneSource = existsSync(resolve(repo, url)) ? portable(realpathSync(resolve(repo, url))) : url;
  const pathQuote = path => quote(portable(path));
  const inRepo = file => pathQuote(resolve(repo, file));
  const restore = () => files.flatMap(file => [`mkdir -p ${pathQuote(dirname(resolve(repo, file)))}`, `cp ${pathQuote(resolve(snapshot, file))} ${inRepo(file)}`]);
  const lines = ['set -eu', `cd ${pathQuote(repo)}`];
  const human = action => lines.push({ action });
  if (snapshotOnly) {
    lines.push(`git branch ${quote(archive)} ${quote(oldTip)}`);
  } else {
    lines.push(`git switch -c ${quote(archive)} ${quote(oldTip)}`, ...restore());
    if (files.length) lines.push(`git add -f -- ${files.map(inRepo).join(' ')}`);
    lines.push('git diff --cached --stat');
    human('commit');
    lines.push(`git commit -m ${quote(archiveMessage)}${files.length ? '' : ' --allow-empty'}`);
  }
  human('push');
  lines.push(`git push ${quote(remote)} ${quote(`refs/heads/${archive}:refs/heads/${archive}`)}`);
  if (branchMode) {
    lines.push('git switch --detach --quiet',
      `git update-ref -m ${quote(`restart: main to ${options['prepared-branch']}`)} refs/heads/main ${preparedTip} ${oldTip}`,
      'git switch main');
  } else {
    lines.push(`git switch --orphan ${quote(restart)}`, `cp -R ${pathQuote(`${prepared}/.`)} .`, 'git add --all');
    if (files.length) lines.push(`test -z "$(git ls-files -- ${files.map(inRepo).join(' ')})"`);
    human('commit');
    lines.push(`git commit -m ${quote(restartMessage)}`, 'git branch -M main');
  }
  if (!snapshotOnly) lines.push(...restore());
  human('push');
  lines.push(`git push --force-with-lease=refs/heads/main:${oldTip} ${quote(remote)} main`,
    `git clone --branch main -- ${quote(cloneSource)} ${pathQuote(readback)}`, `cd ${pathQuote(readback)}`, `git checkout ${quote(archive)}`);
  if (snapshotOnly) {
    lines.push(`test "$(git rev-parse HEAD)" = ${oldTip}`, ...files.map(file => `test -f ${pathQuote(resolve(snapshot, file))}`));
  } else {
    lines.push(...files.map(file => `cat ${pathQuote(resolve(readback, file))}`));
  }
  lines.push(...(branchMode
    ? ['git rev-parse main', `test "$(git rev-parse main)" = ${preparedTip}`]
    : ['git rev-list --count main', 'test "$(git rev-list --count main)" = 1']));
  const total = lines.filter(line => typeof line !== 'string').length;
  let number = 0;
  console.log(lines.map(line => typeof line === 'string' ? line
    : `# STOP: human action ${++number} of ${total}; the skill does not execute this ${line.action}.`).join('\n'));
} catch (error) {
  console.error(`FAIL: ${error.message.replace(/[\r\n]+/g, ' ')}`);
  process.exitCode = 2;
}
