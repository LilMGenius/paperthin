import { copyFileSync, existsSync, globSync, lstatSync, mkdirSync, realpathSync, statSync } from 'node:fs';
import { basename, dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const usage = 'Usage: node restart-handoff.mjs --repo <path> --prepared <directory> [--remote origin] [--ledger <glob or path>] [--restart-branch restart-v0] [--snapshot <directory>]\nExit codes: 0 handoff printed (or --help), 2 precondition failed, 1 usage. Preconditions go to stderr; executable handoff goes to stdout.';
const quote = value => `'${value.replaceAll("'", "'\\''")}'`;
const portable = value => value.split(sep).join('/');
const inside = (parent, child) => {
  const path = relative(parent, child);
  return path === '' || (!isAbsolute(path) && path !== '..' && !path.startsWith(`..${sep}`));
};
let options;
try {
  options = parseArgs({ options: {
    repo: { type: 'string' }, prepared: { type: 'string' },
    remote: { type: 'string', default: 'origin' },
    ledger: { type: 'string', multiple: true, default: [] },
    'restart-branch': { type: 'string', default: 'restart-v0' },
    snapshot: { type: 'string' }, help: { type: 'boolean' },
  } }).values;
  if (options.help) {
    console.log(usage);
    process.exit(0);
  }
  if (!options.repo || !options.prepared || Object.values(options).some(value => value === '')) {
    throw new Error('Both --repo and --prepared are required; option values must not be empty.');
  }
} catch (error) {
  console.error(`${error.message}\n${usage}`);
  process.exit(1);
}

try {
  const repo = realpathSync(resolve(options.repo));
  const git = (...args) => {
    const result = spawnSync('git', ['-C', repo, ...args], {
      encoding: 'utf8', env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' },
    });
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
  const restart = options['restart-branch'];
  git('check-ref-format', `refs/heads/${restart}`);
  const refs = git('ls-remote', '--heads', remote);
  const remoteRefs = new Map(refs.split('\n').filter(Boolean).map(line => {
    const [tip, ref] = line.split(/\s+/);
    return [ref, tip];
  }));
  check(git('status', '--porcelain') === '', 'working tree has no pending changes (git status --porcelain empty)');
  check(git('for-each-ref', '--format=%(refname)', `refs/heads/${archive}`) === '' && !remoteRefs.has(`refs/heads/${archive}`), `archive branch name unused locally and remotely: ${archive}`);
  check(git('for-each-ref', '--format=%(refname)', `refs/heads/${restart}`) === '' && !remoteRefs.has(`refs/heads/${restart}`), `restart branch name unused locally and remotely: ${restart}`);
  check(remoteRefs.get('refs/heads/main') === oldTip, `remote main tip matches recorded old tip ${oldTip}; remote main=${remoteRefs.get('refs/heads/main') ?? 'missing'}${remoteRefs.get('refs/heads/main') === oldTip ? '' : ' (mismatch)'}`);
  const prepared = resolve(options.prepared);
  check(existsSync(prepared) && statSync(prepared).isDirectory(), `prepared directory exists: ${portable(prepared)}`);
  if (existsSync(prepared) && statSync(prepared).isDirectory()) {
    check(globSync('**/.git', { cwd: prepared }).length === 0, 'prepared directory contains no .git');
    check(!inside(repo, realpathSync(prepared)) && !inside(realpathSync(prepared), repo), 'prepared tree is separate from the checkout');
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
  const snapshot = resolve(options.snapshot ?? resolve(dirname(repo), `${basename(repo)}-restart-snapshot`));
  let ancestor = snapshot;
  while (!existsSync(ancestor)) ancestor = dirname(ancestor);
  const actualSnapshot = resolve(realpathSync(ancestor), relative(ancestor, snapshot));
  if (inside(repo, actualSnapshot) || inside(actualSnapshot, repo) || inside(prepared, actualSnapshot) || inside(actualSnapshot, prepared)) {
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
  console.error(`PASS: snapshotted ${files.length} ignored ledger file(s) to ${portable(snapshot)}`);
  let readback = `${snapshot}-readback`;
  for (let suffix = 1; existsSync(readback); suffix++) readback = `${snapshot}-readback-${suffix}`;
  const cloneSource = existsSync(resolve(repo, url)) ? portable(realpathSync(resolve(repo, url))) : url;
  const pathQuote = path => quote(portable(path));
  const stop = (number, action) => `# STOP: human action ${number} of 4; the skill does not execute this ${action}.`;
  const block = ['set -eu', `cd ${pathQuote(repo)}`, `git switch -c ${quote(archive)} ${quote(oldTip)}`];
  for (const file of files) {
    block.push(`mkdir -p ${pathQuote(dirname(resolve(repo, file)))}`, `cp ${pathQuote(resolve(snapshot, file))} ${pathQuote(resolve(repo, file))}`);
  }
  if (files.length) block.push(`git add -f -- ${files.map(file => pathQuote(resolve(repo, file))).join(' ')}`);
  block.push('git diff --cached --stat', stop(1, 'commit'), `git commit -m "Archive restart ledger"${files.length ? '' : ' --allow-empty'}`,
    stop(2, 'push'), `git push ${quote(remote)} ${quote(archive)}`,
    `git switch --orphan ${quote(restart)}`, `cp -R ${pathQuote(`${prepared}/.`)} .`, 'git add --all',
    stop(3, 'commit'), 'git commit -m "v0.1.0: Restart from proven contracts"', 'git branch -M main',
    stop(4, 'push'), `git push --force-with-lease=refs/heads/main:${oldTip} ${quote(remote)} main`,
    `git clone --branch main -- ${quote(cloneSource)} ${pathQuote(readback)}`, `cd ${pathQuote(readback)}`, `git checkout ${quote(archive)}`,
    ...files.map(file => `cat ${pathQuote(resolve(readback, file))}`), 'git rev-list --count main');
  console.log(block.join('\n'));
} catch (error) {
  console.error(`FAIL: ${error.message.replace(/[\r\n]+/g, ' ')}`);
  process.exitCode = 2;
}
