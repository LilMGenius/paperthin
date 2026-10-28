import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const skill = dirname(dirname(fileURLToPath(import.meta.url)));
const temps = [];

const root = mkdtempSync(join(tmpdir(), 'same-set-'));
temps.push(root);
function file(name, lines) {
  writeFileSync(join(root, name), lines.join('\n') + '\n');
  return name;
}

// Every call goes through a link to the skill folder, the way an installed skill is reached.
const linkRoot = mkdtempSync(join(tmpdir(), 'same-set-link-'));
temps.push(linkRoot);
const link = join(linkRoot, 're0-order');
symlinkSync(skill, link, process.platform === 'win32' ? 'junction' : 'dir');

function cli(...args) {
  const run = spawnSync(process.execPath, [join(link, 'scripts', 'same-set.mjs'), ...args], { cwd: root, encoding: 'utf8' });
  return { status: run.status, stdout: run.stdout, stderr: run.stderr, json: () => JSON.parse(run.stdout) };
}

test.after(() => {
  for (const dir of temps) rmSync(dir, { recursive: true, force: true });
});

const before = file('before.md', ['- cherry', '- apple', '', '- banana']);

test('a pure reorder, blank lines aside, passes', () => {
  const after = file('after.md', ['- apple', '- banana', '- cherry']);
  const run = cli(before, after);
  assert.equal(run.status, 0);
  assert.match(run.stdout, /same set of 3 item/);
});

test('a reworded item fails and is reported as changed', () => {
  const after = file('reworded.md', ['- apple', '- bananas', '- cherry']);
  const run = cli(before, after, '--json');
  assert.equal(run.status, 1);
  assert.deepEqual(run.json().changed, [{ before: '- banana', after: '- bananas' }]);
});

test('a dropped item fails and is reported as removed', () => {
  const after = file('dropped.md', ['- apple', '- cherry']);
  const run = cli(before, after, '--json');
  assert.equal(run.status, 1);
  assert.deepEqual(run.json().removed, ['- banana']);
});

test('an added item and a duplicated item fail', () => {
  assert.equal(cli(before, file('added.md', ['- apple', '- banana', '- cherry', '- date'])).status, 1);
  const dup = cli(before, file('dup.md', ['- apple', '- apple', '- banana', '- cherry']), '--json');
  assert.equal(dup.status, 1);
  assert.deepEqual(dup.json().added, ['- apple']);
});

test('a mirror in the same order passes, with its own extra lines ignored', () => {
  const after = file('after2.md', ['- apple', '- banana', '- cherry']);
  const mirror = file('mirror-ok.md', ['intro', '- apple', '- banana', 'note', '- cherry']);
  assert.equal(cli(before, after, '--mirror', mirror).status, 0);
});

test('a mirror in a different order fails and names the first divergence', () => {
  const after = file('after3.md', ['- apple', '- banana', '- cherry']);
  const mirror = file('mirror-bad.md', ['- apple', '- cherry', '- banana']);
  const run = cli(before, after, '--mirror', mirror, '--json');
  assert.equal(run.status, 1);
  assert.deepEqual(run.json().mirrors[0], { file: mirror, ordered: false, position: 2, expected: '- banana', found: '- cherry' });
});

test('a bad flag, a wrong file count or a missing file is a usage error and exits 2', () => {
  assert.equal(cli(before, before, '--bogus').status, 2);
  assert.equal(cli(before).status, 2);
  assert.equal(cli(before, 'absent.md').status, 2);
  assert.equal(cli(before, before, '--mirror', 'absent.md').status, 2);
});
