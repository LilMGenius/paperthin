import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const skill = dirname(dirname(fileURLToPath(import.meta.url)));
const temps = [];
const sha = (text) => createHash('sha256').update(text).digest('hex');

function repo(files) {
  const root = mkdtempSync(join(tmpdir(), 'snapshot-candidates-'));
  temps.push(root);
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), body);
  }
  return root;
}

// Every call goes through a link to the skill folder, the way an installed skill is reached.
const linkRoot = mkdtempSync(join(tmpdir(), 'snapshot-candidates-link-'));
temps.push(linkRoot);
const link = join(linkRoot, 'ssotize');
symlinkSync(skill, link, process.platform === 'win32' ? 'junction' : 'dir');

function cli(cwd, ...args) {
  const run = spawnSync(process.execPath, [join(link, 'scripts', 'snapshot-candidates.mjs'), ...args], { cwd, encoding: 'utf8' });
  return { status: run.status, stdout: run.stdout, stderr: run.stderr, json: () => JSON.parse(run.stdout) };
}

test.after(() => {
  for (const dir of temps) rmSync(dir, { recursive: true, force: true });
});

test('a file becomes a Markdown row with its mtime, size and sha256', () => {
  const root = repo({ 'a.txt': 'hello' });
  const run = cli(root, 'a.txt');
  assert.equal(run.status, 0);
  const lines = run.stdout.trim().split('\n');
  assert.equal(lines[0], '| path | mtime (ISO 8601 UTC) | size | sha256 |');
  assert.equal(lines[1], '| --- | --- | --- | --- |');
  const mtime = statSync(join(root, 'a.txt')).mtime.toISOString();
  assert.equal(lines[2], '| a.txt | ' + mtime + ' | 5 | ' + sha('hello') + ' |');
  assert.equal(lines.length, 3);
});

test('--json prints the same rows as an array', () => {
  const root = repo({ 'a.txt': 'hello', 'b.txt': '' });
  const run = cli(root, '--json', 'a.txt', 'b.txt');
  assert.equal(run.status, 0);
  const rows = run.json();
  assert.deepEqual(rows.map((r) => [r.path, r.size, r.sha256]), [['a.txt', 5, sha('hello')], ['b.txt', 0, sha('')]]);
  assert.equal(rows[0].mtime, statSync(join(root, 'a.txt')).mtime.toISOString());
});

test('a directory is walked, rows sort by path, .git and node_modules are skipped', () => {
  const root = repo({ 'z.txt': 'z', 'docs/b.md': 'b', 'docs/a.md': 'a', 'node_modules/p/x.js': 'x', '.git/HEAD': 'ref' });
  const rows = cli(root, '.', '--json').json();
  assert.deepEqual(rows.map((r) => r.path), ['docs/a.md', 'docs/b.md', 'z.txt']);
});

test('a file named twice appears once', () => {
  const root = repo({ 'a.txt': 'a', 'd/b.txt': 'b' });
  const rows = cli(root, 'a.txt', '.', '--json').json();
  assert.deepEqual(rows.map((r) => r.path), ['a.txt', 'd/b.txt']);
});

test('a pipe in a path is escaped so the Markdown row keeps four cells', { skip: process.platform === 'win32' }, () => {
  const root = repo({ 'a|b.txt': 'x' });
  const row = cli(root, 'a|b.txt').stdout.trim().split('\n')[2];
  assert.ok(row.startsWith('| a&#124;b.txt | '));
});

test('no path or a missing path exits 2 with a message on stderr and nothing on stdout', () => {
  const root = repo({ 'a.txt': 'x' });
  const none = cli(root);
  assert.equal(none.status, 2);
  assert.match(none.stderr, /^snapshot-candidates: usage:/);
  assert.equal(none.stdout, '');
  const missing = cli(root, 'absent.txt');
  assert.equal(missing.status, 2);
  assert.match(missing.stderr, /^snapshot-candidates: /);
  assert.equal(missing.stdout, '');
  assert.equal(cli(root, '--json').status, 2);
});
