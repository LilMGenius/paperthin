import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const skill = dirname(dirname(fileURLToPath(import.meta.url)));
const temps = [];
const hasSh = spawnSync('sh', ['-c', 'true']).status === 0;
const OLD_DATE = '2026-01-02T03:04:05+0000';
const ARCHIVE = 'archive/20260102-030405';

const git = (cwd, ...args) => {
  const run = spawnSync('git', args, { cwd, encoding: 'utf8', env: { ...process.env, GIT_COMMITTER_DATE: OLD_DATE, GIT_AUTHOR_DATE: OLD_DATE } });
  assert.equal(run.status, 0, 'git ' + args.join(' ') + ': ' + run.stderr);
  return run.stdout.trim();
};

// A checkout on main whose tip was committed at a fixed time, a bare remote holding that tip, and a prepared tree.
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'restart-handoff-'));
  temps.push(root);
  const remote = join(root, 'remote.git');
  const repo = join(root, 'repo');
  const prepared = join(root, 'prepared');
  mkdirSync(repo);
  mkdirSync(prepared);
  git(root, 'init', '--bare', '-b', 'main', remote);
  git(repo, 'init', '-b', 'main');
  git(repo, 'config', 'user.name', 'Tester');
  git(repo, 'config', 'user.email', 'tester@example.com');
  git(repo, 'config', 'core.hooksPath', 'no-hooks');
  writeFileSync(join(repo, 'old.txt'), 'old line\n');
  git(repo, 'add', '.');
  git(repo, 'commit', '-m', 'old work');
  git(repo, 'remote', 'add', 'origin', remote);
  git(repo, 'push', 'origin', 'main');
  writeFileSync(join(prepared, 'fresh.txt'), 'restarted\n');
  return { root, remote, repo, prepared, oldTip: git(repo, 'rev-parse', 'HEAD') };
}

// Every call goes through a link to the skill folder, the way an installed skill is reached.
const linkRoot = mkdtempSync(join(tmpdir(), 'restart-handoff-link-'));
temps.push(linkRoot);
const link = join(linkRoot, 're0-work');
symlinkSync(skill, link, process.platform === 'win32' ? 'junction' : 'dir');

function cli(...args) {
  const run = spawnSync(process.execPath, [join(link, 'scripts', 'restart-handoff.mjs'), ...args], { encoding: 'utf8' });
  return { status: run.status, stdout: run.stdout, stderr: run.stderr };
}

test.after(() => {
  for (const dir of temps) rmSync(dir, { recursive: true, force: true });
});

test('--snapshot-only prints a handoff whose archive branch sits at the old tip and whose restart holds the prepared tree', { skip: !hasSh && 'sh is not available' }, () => {
  const f = fixture();
  const run = cli('--repo', f.repo, '--prepared', f.prepared, '--snapshot-only', '--snapshot', join(f.root, 'snap'));
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stderr, /PASS: archive branch name unused locally and remotely: archive\/20260102-030405/);
  assert.match(run.stdout, /# STOP: human action 1 of 3; .* push\./);
  assert.match(run.stdout, /# STOP: human action 2 of 3; .* commit\./);
  assert.match(run.stdout, /# STOP: human action 3 of 3; .* push\./);

  // The script only prints; running its output is the human step it stops at.
  const script = join(f.root, 'handoff.sh');
  writeFileSync(script, run.stdout);
  const ran = spawnSync('sh', [script], { encoding: 'utf8' });
  assert.equal(ran.status, 0, ran.stderr + ran.stdout);

  assert.equal(git(f.remote, 'rev-parse', 'refs/heads/' + ARCHIVE), f.oldTip);
  assert.equal(git(f.repo, 'rev-parse', ARCHIVE), f.oldTip);
  assert.equal(git(f.remote, 'rev-list', '--count', 'main'), '1');
  assert.equal(git(f.remote, 'ls-tree', '-r', '--name-only', 'main'), 'fresh.txt');
  assert.equal(git(f.remote, 'show', 'main:fresh.txt'), 'restarted');
  assert.equal(git(f.remote, 'show', ARCHIVE + ':old.txt'), 'old line');
  assert.equal(spawnSync('git', ['-C', f.remote, 'merge-base', '--is-ancestor', f.oldTip, 'main']).status, 1, 'restart main shares no history with the old tip');
});

test('a dirty checkout is refused with exit 2 and prints no handoff', () => {
  const f = fixture();
  writeFileSync(join(f.repo, 'old.txt'), 'edited\n');
  const run = cli('--repo', f.repo, '--prepared', f.prepared, '--snapshot-only');
  assert.equal(run.status, 2);
  assert.match(run.stderr, /FAIL: working tree has no pending changes/);
  assert.equal(run.stdout, '');
  assert.equal(git(f.remote, 'rev-parse', 'main'), f.oldTip);
});

test('a remote main that moved past the recorded tip is refused with exit 2', () => {
  const f = fixture();
  const other = join(f.root, 'other');
  git(f.root, 'clone', f.remote, other);
  git(other, 'config', 'user.name', 'Other');
  git(other, 'config', 'user.email', 'other@example.com');
  git(other, 'config', 'core.hooksPath', 'no-hooks');
  writeFileSync(join(other, 'more.txt'), 'more\n');
  git(other, 'add', '.');
  git(other, 'commit', '-m', 'ahead');
  git(other, 'push', 'origin', 'main');
  const run = cli('--repo', f.repo, '--prepared', f.prepared, '--snapshot-only');
  assert.equal(run.status, 2);
  assert.match(run.stderr, /FAIL: remote main tip matches recorded old tip/);
  assert.equal(run.stdout, '');
});

test('a prepared tree that holds a .git is refused with exit 2', () => {
  const f = fixture();
  mkdirSync(join(f.prepared, '.git'));
  const run = cli('--repo', f.repo, '--prepared', f.prepared, '--snapshot-only');
  assert.equal(run.status, 2);
  assert.match(run.stderr, /FAIL: prepared directory contains no \.git/);
});

test('missing --repo or both prepared forms is a usage error and exits 1', () => {
  const f = fixture();
  assert.equal(cli('--prepared', f.prepared).status, 1);
  assert.equal(cli('--repo', f.repo).status, 1);
  assert.equal(cli('--repo', f.repo, '--prepared', f.prepared, '--prepared-branch', 'x').status, 1);
  const help = cli('--help');
  assert.equal(help.status, 0);
  assert.match(help.stdout, /^Usage:/);
});
