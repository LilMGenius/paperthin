import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CommandError, Refusal, audit, main, parseRepo, republish, squash } from './squash.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const REPO = 'acme/widget';

// A real repository with two commits. Signing belongs to git and needs a key this machine may lack, so the test drops -S
// and checks what the script owns: the tree, the bundle, the refusals.
function checkout() {
  const dir = mkdtempSync(join(tmpdir(), 'squash-'));
  const run = (args, env) => execFileSync('git', args, { cwd: dir, encoding: 'utf8', env: { ...process.env, ...env } }).trim();
  run(['init', '-q', '-b', 'main']);
  run(['config', 'user.email', 'a@example.com']);
  run(['config', 'user.name', 'A']);
  run(['config', 'commit.gpgsign', 'false']);
  run(['config', 'core.autocrlf', 'false']);
  writeFileSync(join(dir, 'a.txt'), 'one\n');
  run(['add', '.']);
  run(['commit', '-qm', 'first']);
  writeFileSync(join(dir, 'b.txt'), 'two\n');
  run(['add', '.']);
  run(['commit', '-qm', 'second']);
  const git = (args, { env } = {}) => run(args.filter((arg) => arg !== '-S'), env);
  return { dir, run, git };
}

// gh answers from a route table; every call is recorded so a test can prove what ran and in which order.
function fakeGh(routes = {}, { onCall } = {}) {
  const calls = [];
  const gh = (args) => {
    calls.push(args.join(' '));
    onCall?.(args);
    if (args[0] !== 'api' || args.includes('-X')) return '';
    const route = args[1];
    if (route in routes) {
      const answer = routes[route];
      if (answer instanceof Error) throw answer;
      return JSON.stringify(answer);
    }
    return '[]';
  };
  return { gh, calls };
}
const meta = { owner: { login: 'acme' }, default_branch: 'main', visibility: 'private', description: 'd', homepage: '', topics: ['x'], forks_count: 0, stargazers_count: 0, has_issues: true, has_wiki: false, has_projects: false, has_discussions: false, allow_squash_merge: true, allow_merge_commit: false, allow_rebase_merge: false, delete_branch_on_merge: true };
const quiet = { 'repos/acme/widget': meta, 'search/issues?q=repo:acme/widget+is:issue': { total_count: 0 }, 'search/issues?q=repo:acme/widget+is:pr': { total_count: 0 }, 'repos/acme/widget/branches?per_page=100': [{ name: 'main' }], 'repos/acme/widget/collaborators?per_page=100': [{ login: 'acme' }], 'repos/acme/widget/actions/secrets': { total_count: 0, secrets: [] }, 'repos/acme/widget/actions/variables': { total_count: 0, variables: [] }, 'repos/acme/widget/pages': new CommandError('gh', ['api'], 'HTTP 404: Not Found') };

test('reads owner/name from an https or ssh origin and refuses anything else', () => {
  assert.equal(parseRepo('https://github.com/acme/widget.git'), REPO);
  assert.equal(parseRepo('git@github.com:acme/widget.git'), REPO);
  assert.throws(() => parseRepo('https://gitlab.com/acme/widget.git'), Refusal);
});

test('squash keeps the tree byte-identical, bundles the old history and leaves one commit', () => {
  const { dir, run, git } = checkout();
  const tree = run(['rev-parse', 'HEAD^{tree}']);
  const outside = mkdtempSync(join(tmpdir(), 'squash-out-'));
  const message = join(outside, 'msg');
  writeFileSync(message, 'widget: one commit\n\n- does the thing\n');
  const bundle = join(outside, 'history.bundle');
  const result = squash({ messageFile: message, bundle }, { git, now: () => '2026-01-01T00:00:00Z', home: dir });
  assert.equal(result.commits, 1);
  assert.equal(run(['rev-parse', 'HEAD^{tree}']), tree);
  assert.equal(run(['log', '-1', '--format=%at %ct']), '1767225600 1767225600');
  assert.match(execFileSync('git', ['bundle', 'list-heads', bundle], { cwd: dir, encoding: 'utf8' }), /refs\/heads\/main/);
  assert.equal(execFileSync('git', ['rev-list', '--count', 'refs/heads/main'], { cwd: dir, encoding: 'utf8' }).trim(), '1');
  rmSync(dir, { recursive: true, force: true });
  rmSync(outside, { recursive: true, force: true });
});

test('squash refuses a dirty tree before writing anything', () => {
  const { dir, run, git } = checkout();
  const head = run(['rev-parse', 'HEAD']);
  writeFileSync(join(dir, 'a.txt'), 'changed\n');
  const message = join(dir, 'msg');
  writeFileSync(message, 'x\n');
  assert.throws(() => squash({ messageFile: message, bundle: join(dir, 'h.bundle') }, { git, now: () => 'x', home: dir }), /dirty/);
  assert.equal(run(['rev-parse', 'HEAD']), head);
  rmSync(dir, { recursive: true, force: true });
});

test('audit counts what the delete would lose and treats an unreadable list as a blocker', () => {
  const { dir, git } = checkout();
  const { gh } = fakeGh({ ...quiet, 'repos/acme/widget/hooks': new CommandError('gh', ['api'], 'HTTP 403: Resource not accessible'), 'repos/acme/widget/releases?per_page=100': [{}, {}] });
  const result = audit(REPO, { git, gh });
  assert.equal(result.remote.releases, 2);
  assert.equal(result.remote.pages, false);
  assert.deepEqual(result.remote.collaborators, []);
  assert.deepEqual(result.blockers, ['releases: 2', 'webhooks: unreadable, so its loss cannot be ruled out']);
  assert.deepEqual(audit(REPO, { git, gh: fakeGh(quiet).gh }).blockers, []);
  rmSync(dir, { recursive: true, force: true });
});

test('republish deletes nothing without the exact confirmation, with unaccepted blockers, or before the squash', () => {
  const { dir, git } = checkout();
  for (const [routes, options, reason] of [
    [quiet, { confirm: 'acme/other' }, /confirm must repeat acme\/widget/],
    [{ ...quiet, 'repos/acme/widget/releases?per_page=100': [{}] }, { confirm: REPO }, /blockers present/],
    [quiet, { confirm: REPO }, /has 2 commits; run squash first/],
  ]) {
    const { gh, calls } = fakeGh(routes);
    assert.throws(() => republish(REPO, options, { git, gh }), reason);
    assert.equal(calls.filter((call) => call.startsWith('repo delete')).length, 0);
  }
  rmSync(dir, { recursive: true, force: true });
});

test('republish recreates with the recorded settings, pushes, and reports drift as a failure', () => {
  const { dir, run, git } = checkout();
  run(['reset', '--soft', run(['commit-tree', run(['rev-parse', 'HEAD^{tree}']), '-m', 'one'])]);
  const head = run(['rev-parse', 'HEAD']);
  const order = [];
  const pushGit = (args, opts) => {
    if (args[0] === 'push') return order.push('push'), '';
    if (args[0] === 'ls-remote') return head + '\trefs/heads/main';
    return git(args, opts);
  };
  const { gh } = fakeGh(quiet, { onCall: (args) => order.push(args.slice(0, 3).join(' ')) });
  const result = republish(REPO, { confirm: REPO }, { git: pushGit, gh });
  const step = (prefix) => order.findIndex((entry) => entry.startsWith(prefix));
  assert.ok(step('repo delete acme/widget') < step('repo create acme/widget'));
  assert.ok(step('repo create') < step('push'));
  assert.equal(result.matchesLocal, true);
  assert.deepEqual(result.settingsDrift, []);
  assert.equal(result.ok, true);
  const recreated = fakeGh(quiet);
  let created = false;
  const driftGh = (args) => {
    if (args[0] === 'repo' && args[1] === 'create') created = true;
    if (created && args[0] === 'api' && args[1] === 'repos/acme/widget' && !args.includes('-X')) return JSON.stringify({ ...meta, has_wiki: true });
    return recreated.gh(args);
  };
  const drifted = republish(REPO, { confirm: REPO }, { git: pushGit, gh: driftGh });
  assert.deepEqual(drifted.settingsDrift, ['has_wiki']);
  assert.equal(drifted.ok, false);
  rmSync(dir, { recursive: true, force: true });
});

test('main maps usage, refusal and blockers to exit codes, and runs through a linked skill folder', () => {
  const { dir, git } = checkout();
  const silent = { log: console.log, error: console.error };
  console.log = () => {};
  console.error = () => {};
  try {
    assert.equal(main(['frobnicate'], { git, gh: fakeGh(quiet).gh }), 2);
    assert.equal(main(['republish', '--confirm', 'acme/other', '--repo', REPO], { git, gh: fakeGh(quiet).gh }), 1);
    assert.equal(main(['audit', '--repo', REPO], { git, gh: fakeGh({ ...quiet, 'repos/acme/widget/hooks': [{}] }).gh }), 3);
    assert.equal(main(['audit', '--repo', REPO], { git, gh: fakeGh(quiet).gh }), 0);
  } finally {
    Object.assign(console, silent);
  }
  const linkRoot = mkdtempSync(join(tmpdir(), 'squash-link-'));
  symlinkSync(here, join(linkRoot, 'scripts'), process.platform === 'win32' ? 'junction' : 'dir');
  const help = spawnSync(process.execPath, [join(linkRoot, 'scripts', 'squash.mjs'), '--help'], { encoding: 'utf8' });
  const bad = spawnSync(process.execPath, [join(linkRoot, 'scripts', 'squash.mjs'), 'nope'], { encoding: 'utf8' });
  rmSync(linkRoot, { recursive: true, force: true });
  rmSync(dir, { recursive: true, force: true });
  assert.equal(help.status, 0);
  assert.match(help.stdout, /republish --confirm/);
  assert.equal(bad.status, 2);
});
