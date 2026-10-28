import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const skill = dirname(dirname(fileURLToPath(import.meta.url)));
const temps = [];
const EM = '\u2014';
const EN = '\u2013';
const TICK = '\x60';

function repo(files) {
  const root = mkdtempSync(join(tmpdir(), 'dedash-'));
  temps.push(root);
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), body);
  }
  return root;
}

// Every call goes through a link to the skill folder, the way an installed skill is reached.
const linkRoot = mkdtempSync(join(tmpdir(), 'dedash-link-'));
temps.push(linkRoot);
const link = join(linkRoot, 'dedash');
symlinkSync(skill, link, process.platform === 'win32' ? 'junction' : 'dir');

function cli(cwd, ...args) {
  const run = spawnSync(process.execPath, [join(link, 'scripts', 'find.mjs'), ...args], { cwd, encoding: 'utf8' });
  return { status: run.status, stdout: run.stdout, stderr: run.stderr, json: () => JSON.parse(run.stdout) };
}
const spots = (run) => run.json().dashes.map((d) => d.file + ':' + d.line + ':' + d.column + ':' + d.codepoint);

test.after(() => {
  for (const dir of temps) rmSync(dir, { recursive: true, force: true });
});

test('an em dash in prose is found with its line, column and code point', () => {
  const root = repo({ 'a.md': 'First line.\nIt works ' + EM + ' mostly.\n' });
  const run = cli(root, 'a.md', '--json');
  assert.equal(run.status, 3);
  assert.deepEqual(spots(run), ['a.md:2:10:U+2014']);
  assert.equal(run.json().dashes[0].text, 'It works ' + EM + ' mostly.');
});

test('the horizontal bar and the two- and three-em dashes are found', () => {
  const root = repo({ 'a.md': 'a\u2015b c\u2E3Ad e\u2E3Bf\n' });
  assert.deepEqual(spots(cli(root, 'a.md', '--json')), ['a.md:1:2:U+2015', 'a.md:1:6:U+2E3A', 'a.md:1:10:U+2E3B']);
});

test('an en dash between two words is found', () => {
  const root = repo({ 'a.md': 'The plan ' + EN + ' as written ' + EN + 'fails.\n' });
  assert.deepEqual(spots(cli(root, 'a.md', '--json')), ['a.md:1:10:U+2013', 'a.md:1:23:U+2013']);
});

test('an en dash in a number range is left alone', () => {
  const root = repo({ 'a.md': 'Years 1990' + EN + '2020 and pages 3 ' + EN + ' 5 and 3' + EN + '5.\n' });
  const run = cli(root, 'a.md');
  assert.equal(run.status, 0);
  assert.match(run.stdout, /^0 dash\(es\) in 1 file\(s\)/m);
});

test('dashes inside a code fence, inline code or a URL are left alone', () => {
  const body = [
    'Prose ' + TICK + 'a ' + EM + ' b' + TICK + ' and see https://example.com/a' + EM + 'b' + EN + 'c now.',
    TICK.repeat(3) + 'js',
    'const s = "x ' + EM + ' y";',
    TICK.repeat(3),
    'Outside ' + EM + ' fence.',
    '',
  ].join('\n');
  const root = repo({ 'a.md': body });
  assert.deepEqual(spots(cli(root, 'a.md', '--json')), ['a.md:5:9:U+2014']);
});

test('a directory is walked and .git and node_modules are skipped', () => {
  const root = repo({ 'docs/a.md': 'x ' + EM + ' y\n', 'node_modules/p/b.md': 'x ' + EM + ' y\n', '.git/c.md': 'x ' + EM + ' y\n' });
  assert.deepEqual(spots(cli(root, '.', '--json')), ['docs/a.md:1:3:U+2014']);
});

test('a bad flag, no path or a missing path is a usage error and exits 2', () => {
  const root = repo({ 'a.md': 'clean\n' });
  assert.equal(cli(root, 'a.md', '--bogus').status, 2);
  assert.equal(cli(root).status, 2);
  assert.equal(cli(root, 'absent').status, 2);
});
