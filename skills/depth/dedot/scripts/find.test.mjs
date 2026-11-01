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
const spots = (result) => result.dots.map((d) => d.line + ':' + d.column + ':' + d.kind);

test.after(() => {
  for (const dir of temps) rmSync(dir, { recursive: true, force: true });
});

test('a middle dot in Korean prose is listed for review with its line, UTF-16 column and text, and the scan exits 0', () => {
  const root = repo({ 'a.md': '첫 줄.\n사과' + D + '배' + D + '귤 등을 먹었다.\n' });
  const run = cli(root, 'a.md', '--json');
  assert.equal(run.status, 0);
  const result = run.json();
  assert.deepEqual(spots(result), ['2:3:review', '2:5:review']);
  assert.equal(result.dots[0].text, '사과' + D + '배' + D + '귤 등을 먹었다.');
  assert.equal(result.inScope, 2);
});

test('dots in protected contexts are listed and counted with their kind instead of being hidden', () => {
  const body = [
    '> "빠르게' + D + '가볍게" 슬로건',
    'Prose ' + TICK + 'a' + D + 'b' + TICK + ' and https://example.com/a' + D + 'b now.',
    TICK.repeat(3) + 'js',
    'const s = "x' + D + 'y";',
    TICK.repeat(3),
    '3' + D + '1절, 1' + D + '2차, CuSO\u2084' + D + '5H\u2082O, col' + D + 'legi',
    D + ' 첫 항목',
    '밖' + D + '안',
    '',
  ].join('\n');
  const root = repo({ 'a.md': body });
  const result = cli(root, 'a.md', '--json').json();
  assert.deepEqual(spots(result), ['1:7:quote', '2:9:code', '2:38:url', '4:13:code', '6:2:digits', '6:8:digits', '6:18:formula', '6:28:catalan', '7:1:bullet', '8:2:review']);
  assert.equal(result.inScope, 10);
  assert.deepEqual(result.byKind, { quote: 1, code: 2, url: 1, digits: 2, formula: 1, catalan: 1, bullet: 1, review: 1 });
});

test('look-alikes such as U+318D and U+2027 are reported apart and never counted', () => {
  const root = repo({ 'a.md': '간식\u318D음료 주류\u2027담배 \u30FB \u2022 \u22C5 과일' + D + '채소 등\n' });
  const run = cli(root, 'a.md', '--json');
  const result = run.json();
  assert.equal(result.inScope, 1);
  assert.deepEqual(result.lookalikes.map((l) => l.codepoint), ['U+318D', 'U+2027', 'U+30FB', 'U+2022', 'U+22C5']);
  assert.match(cli(root, 'a.md').stdout, /look-alikes, not U\+00B7 and not counted: U\+318D/);
});

test('--lines keeps only the named lines in scope and reports the dots outside without counting them', () => {
  const root = repo({ 'a.md': '가' + D + '나 등\n## 3\n다' + D + '라 등\n마' + D + '바\n## 4\n사' + D + '아 등\n' });
  const result = cli(root, 'a.md', '--lines', '3-4', '--json').json();
  assert.deepEqual(spots(result), ['3:2:review', '4:2:review']);
  assert.equal(result.inScope, 2);
  assert.deepEqual(result.outside.map((d) => d.line), [1, 6]);
  assert.match(cli(root, 'a.md', '--lines', '3-4').stdout, /outside --lines, not reviewed or counted: 2 U\+00B7 at a\.md:1, a\.md:6/);
});

test('a directory is walked and .git and node_modules are skipped', () => {
  const root = repo({ 'docs/a.md': '가' + D + '나\n', 'node_modules/p/b.md': '가' + D + '나\n', '.git/c.md': '가' + D + '나\n' });
  const result = cli(root, '.', '--json').json();
  assert.deepEqual(result.dots.map((d) => d.file + ':' + d.line), ['docs/a.md:1']);
});

test('the text report ends with the in-scope total split by kind', () => {
  const root = repo({ 'a.md': '가' + D + '나 3' + D + '1\n' });
  const run = cli(root, 'a.md');
  assert.equal(run.status, 0);
  assert.match(run.stdout, /^in scope: 2 U\+00B7 in 1 file\(s\) \(review 1, digits 1\)$/m);
});

test('a bad flag, no path, a missing path or a bad range is a usage error and exits 2', () => {
  const root = repo({ 'a.md': 'clean\n' });
  assert.equal(cli(root, 'a.md', '--bogus').status, 2);
  assert.equal(cli(root).status, 2);
  assert.equal(cli(root, 'absent').status, 2);
  assert.equal(cli(root, 'a.md', '--lines', '5-2').status, 2);
});
