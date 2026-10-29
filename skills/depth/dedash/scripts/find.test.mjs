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
const slots = (run) => run.json().dashes.map((d) => d.line + ':' + d.column + ':' + d.codepoint + ':' + d.slot);
const scan = (body, name = 'a.md') => cli(repo({ [name]: body }), name, '--json');

test.after(() => {
  for (const dir of temps) rmSync(dir, { recursive: true, force: true });
});

test('an em dash inside a sentence is an in-sentence finding, and the same dash after a bold lead is a label', () => {
  const run = scan('First line.\nIt works ' + EM + ' mostly.\n');
  assert.equal(run.status, 3);
  assert.deepEqual(slots(run), ['2:10:U+2014:sentence']);
  assert.equal(run.json().dashes[0].text, 'It works ' + EM + ' mostly.');
  const lead = scan('- **Setup** ' + EM + ' we asked.\n');
  assert.equal(lead.status, 0);
  assert.deepEqual(slots(lead), ['1:13:U+2014:label']);
});

test('an en dash standing in for an em dash is an in-sentence finding, and a spaced one between numbers is a range', () => {
  const run = scan('The plan ' + EN + ' as written ' + EN + 'fails.\n');
  assert.equal(run.status, 3);
  assert.deepEqual(slots(run), ['1:10:U+2013:sentence', '1:23:U+2013:sentence']);
  const range = scan('Pages 3 ' + EN + ' 5 apply.\n');
  assert.equal(range.status, 0);
  assert.deepEqual(slots(range), ['1:9:U+2013:range']);
});

test('label slots: list and numbered leads, a table cell lead, a heading number and a name before its tagline', () => {
  const body = [
    '3. **Stay current** ' + EM + ' run it.',
    '| **Built on** ' + EM + ' its design |',
    '### #1 ' + EM + ' Artifacts rot',
    '<img alt="Paperthin ' + EM + ' Trust the artifact." src="x.svg">',
    '<svg aria-label="Paperthin ' + EM + ' Trust the artifact.">',
    '![Paperthin ' + EM + ' a tagline](x.svg)',
    '',
  ].join('\n');
  const run = scan(body);
  assert.equal(run.status, 0);
  assert.deepEqual(run.json().dashes.map((d) => d.slot), ['label', 'label', 'label', 'label', 'label', 'label']);
});

test('the same dashes leave their label slot when the text before them is a sentence', () => {
  const body = [
    'It **adds** ' + EM + ' more files.',
    '### #1 ' + EM + ' Artifacts rot ' + EM + ' slowly',
    '<img alt="The map, drawn by hand ' + EM + ' four regions." src="x.svg">',
    '',
  ].join('\n');
  assert.deepEqual(slots(scan(body)), ['1:13:U+2014:sentence', '2:8:U+2014:label', '2:24:U+2014:sentence', '3:34:U+2014:sentence']);
});

test('a hyphen is never a candidate, wherever it stands', () => {
  const run = scan('- **Setup** - we asked.\nA plain - aside and a well-known compound.\n');
  assert.equal(run.status, 0);
  assert.deepEqual(run.json().dashes, []);
  assert.match(cli(repo({ 'a.md': 'clean - text\n' }), 'a.md').stdout, /^0 dash\(es\) in 1 file\(s\): 0 sentence, 0 label, 0 range, 0 protected/m);
  assert.equal(scan('A plain ' + EM + ' aside.\n').json().dashes.length, 1);
});

test('a range en dash stays: numbers with or without spaces and an unspaced word pair', () => {
  const run = scan('Years 1990' + EN + '2000, pages 3 ' + EN + ' 5 and the London' + EN + 'Paris route.\n');
  assert.equal(run.status, 0);
  assert.deepEqual(run.json().dashes.map((d) => d.slot), ['range', 'range', 'range']);
  assert.deepEqual(slots(scan('the London ' + EN + ' Paris route\n')), ['1:12:U+2013:sentence']);
});

test('code, URLs, other attributes and quotations in prose are protected, and a JSON string is prose to check', () => {
  const body = [
    'Prose ' + TICK + 'a ' + EM + ' b' + TICK + ' and https://example.com/a' + EM + 'b now.',
    TICK.repeat(3) + 'js',
    'const s = "x ' + EM + ' y";',
    TICK.repeat(3),
    'He said "wait ' + EM + ' no" and <a href="x' + EM + 'y">left</a>.',
    'Outside ' + EM + ' fence.',
    '',
  ].join('\n');
  assert.deepEqual(scan(body).json().dashes.map((d) => d.line + ':' + d.slot), ['1:protected', '1:protected', '3:protected', '5:protected', '5:protected', '6:sentence']);
  assert.deepEqual(slots(scan('{ "description": "on its own' + EM + 'on any agent." }\n', 'package.json')), ['1:29:U+2014:sentence']);
});

test('the per-slot counts sum to every dash found', () => {
  const run = scan('- **A** ' + EM + ' x ' + EM + ' y, 1' + EN + '2, ' + TICK + EM + TICK + '\n');
  const { counts, dashes } = run.json();
  assert.deepEqual(counts, { sentence: 1, label: 1, range: 1, protected: 1 });
  assert.equal(Object.values(counts).reduce((a, b) => a + b, 0), dashes.length);
});

test('a directory is walked and .git and node_modules are skipped', () => {
  const root = repo({ 'docs/a.md': 'x ' + EM + ' y\n', 'node_modules/p/b.md': 'x ' + EM + ' y\n', '.git/c.md': 'x ' + EM + ' y\n' });
  assert.deepEqual(cli(root, '.', '--json').json().dashes.map((d) => d.file + ':' + d.slot), ['docs/a.md:sentence']);
});

test('a bad flag, no path or a missing path is a usage error and exits 2', () => {
  const root = repo({ 'a.md': 'clean\n' });
  assert.equal(cli(root, 'a.md', '--bogus').status, 2);
  assert.equal(cli(root).status, 2);
  assert.equal(cli(root, 'absent').status, 2);
});
