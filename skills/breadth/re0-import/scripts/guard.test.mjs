import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const skill = dirname(dirname(fileURLToPath(import.meta.url)));
const temps = [];

function tree(files) {
  const base = mkdtempSync(join(tmpdir(), 'import-'));
  temps.push(base);
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(dirname(join(base, path)), { recursive: true });
    writeFileSync(join(base, path), body);
  }
  return base;
}

// Every call goes through a link to the skill folder, the way an installed skill is reached.
const linkRoot = mkdtempSync(join(tmpdir(), 'import-link-'));
temps.push(linkRoot);
const link = join(linkRoot, 're0-import');
symlinkSync(skill, link, process.platform === 'win32' ? 'junction' : 'dir');

function cli(cwd, ...args) {
  const run = spawnSync(process.execPath, [join(link, 'scripts', 'guard.mjs'), ...args], { cwd, encoding: 'utf8' });
  return { status: run.status, stdout: run.stdout, stderr: run.stderr, json: () => JSON.parse(run.stdout) };
}
const reasons = (run) => run.json().refused.map((r) => r.path + ' | ' + r.reason);

test.after(() => {
  for (const dir of temps) rmSync(dir, { recursive: true, force: true });
});

test('files inside the root are allowed and hashed, and a new path is allowed with --create', () => {
  const base = tree({ 'kb/map.md': 'map\n', 'kb/tier/a.md': 'a\n' });
  const run = cli(base, 'kb', 'map.md', 'tier/a.md', '--create', 'tier/new.md', '--json');
  assert.equal(run.status, 0);
  const { allowed } = run.json();
  assert.equal(allowed[0].sha256, createHash('sha256').update('map\n').digest('hex'));
  assert.deepEqual(allowed.map((a) => a.path), ['map.md', 'tier/a.md', 'tier/new.md']);
  assert.equal(allowed[2].create, true);
});

test('a path that climbs out of the root is refused', () => {
  const base = tree({ 'kb/map.md': 'm', 'outside.md': 'o' });
  const run = cli(base, 'kb', 'map.md', '../outside.md', '--json');
  assert.equal(run.status, 3);
  assert.deepEqual(reasons(run), ['../outside.md | path leaves the target root']);
});

test('an absolute path is refused even when it points inside the root', () => {
  const base = tree({ 'kb/map.md': 'm' });
  const run = cli(base, 'kb', resolve(base, 'kb', 'map.md'), '--json');
  assert.equal(run.status, 3);
  assert.match(reasons(run)[0], /absolute path$/);
});

test('a file reached through a link out of the root is refused', () => {
  const base = tree({ 'kb/map.md': 'm', 'elsewhere/secret.md': 's' });
  symlinkSync(join(base, 'elsewhere'), join(base, 'kb', 'jump'), process.platform === 'win32' ? 'junction' : 'dir');
  const run = cli(base, 'kb', 'jump/secret.md', '--create', 'jump/new.md', '--json');
  assert.equal(run.status, 3);
  assert.deepEqual(reasons(run), [
    'jump/secret.md | resolves through a link outside the target root',
    'jump/new.md | resolves through a link outside the target root',
  ]);
});

test('an edit target that does not exist is reported as a MISS', () => {
  const base = tree({ 'kb/map.md': 'm' });
  const run = cli(base, 'kb', 'gone.md', '--json');
  assert.equal(run.status, 3);
  assert.deepEqual(reasons(run), ['gone.md | MISS: file does not exist']);
});

test('a --create path that already exists is refused', () => {
  const base = tree({ 'kb/map.md': 'm' });
  const run = cli(base, 'kb', '--create', 'map.md', '--json');
  assert.equal(run.status, 3);
  assert.deepEqual(reasons(run), ['map.md | create path already exists']);
});

test('a bad flag, a missing path or a root that is not a folder is a usage error and exits 2', () => {
  const base = tree({ 'kb/map.md': 'm' });
  assert.equal(cli(base, 'kb', 'map.md', '--bogus').status, 2);
  assert.equal(cli(base).status, 2);
  assert.equal(cli(base, 'kb').status, 2);
  assert.equal(cli(base, 'absent', 'map.md').status, 2);
});
