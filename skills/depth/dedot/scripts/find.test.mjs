import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const skill = dirname(dirname(fileURLToPath(import.meta.url)));
const temps = [];
const D = '\u00B7';
const TICK = '\x60';

function repo(files) {
  const root = mkdtempSync(join(tmpdir(), 'dedot-'));
  temps.push(root);
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), body);
  }
  return root;
}

// Every call goes through a link to the skill folder, the way an installed skill is reached.
const linkRoot = mkdtempSync(join(tmpdir(), 'dedot-link-'));
temps.push(linkRoot);
const link = join(linkRoot, 'dedot');
symlinkSync(skill, link, process.platform === 'win32' ? 'junction' : 'dir');

function cli(cwd, ...args) {
  const run = spawnSync(process.execPath, [join(link, 'scripts', 'find.mjs'), ...args], { cwd, encoding: 'utf8' });
  return { status: run.status, stdout: run.stdout, stderr: run.stderr, json: () => JSON.parse(run.stdout) };
}
const spots = (run) => run.json().dots.map((d) => d.file + ':' + d.line + ':' + d.column);

test.after(() => {
  for (const dir of temps) rmSync(dir, { recursive: true, force: true });
});

test('a middle dot in Korean prose is found with its line, column and text', () => {
  const root = repo({ 'a.md': '첫 줄.\n사과' + D + '배' + D + '귤을 먹었다.\n' });
  const run = cli(root, 'a.md', '--json');
  assert.equal(run.status, 3);
  assert.deepEqual(spots(run), ['a.md:2:3', 'a.md:2:5']);
  assert.equal(run.json().dots[0].text, '사과' + D + '배' + D + '귤을 먹었다.');
});

test('a dot in a label row is found', () => {
  const root = repo({ 'a.md': '| 가격 ' + D + ' 품질 ' + D + ' 속도 |\n' });
  assert.equal(cli(root, 'a.md').status, 3);
});

test('dots inside a code fence, inline code or a URL are left alone', () => {
  const body = [
    'Prose ' + TICK + 'a' + D + 'b' + TICK + ' and https://example.com/a' + D + 'b now.',
    TICK.repeat(3) + 'js',
    'const s = "x' + D + 'y";',
    TICK.repeat(3),
    '밖' + D + '안.',
    '',
  ].join('\n');
  const root = repo({ 'a.md': body });
  assert.deepEqual(spots(cli(root, 'a.md', '--json')), ['a.md:5:2']);
});

test('a dotted date or number form and Catalan l' + D + 'l are left alone', () => {
  const root = repo({ 'a.md': '3' + D + '1 운동, 12' + D + '25, col' + D + 'legi, Col' + D + 'LEGI.\n' });
  const run = cli(root, 'a.md');
  assert.equal(run.status, 0);
  assert.match(run.stdout, /^0 middle dot\(s\) in 1 file\(s\)/m);
});

test('U+318D and other look-alikes are not matched', () => {
  const root = repo({ 'a.md': '가\u318D나 \u2022 \u22C5 \u2219 \u30FB\n' });
  assert.equal(cli(root, 'a.md').status, 0);
});

test('a directory is walked and .git and node_modules are skipped', () => {
  const root = repo({ 'docs/a.md': '가' + D + '나\n', 'node_modules/p/b.md': '가' + D + '나\n', '.git/c.md': '가' + D + '나\n' });
  assert.deepEqual(spots(cli(root, '.', '--json')), ['docs/a.md:1:2']);
});

test('a bad flag, no path or a missing path is a usage error and exits 2', () => {
  const root = repo({ 'a.md': 'clean\n' });
  assert.equal(cli(root, 'a.md', '--bogus').status, 2);
  assert.equal(cli(root).status, 2);
  assert.equal(cli(root, 'absent').status, 2);
});
