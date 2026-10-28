import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const skill = dirname(dirname(fileURLToPath(import.meta.url)));
const temps = [];
const T3 = '\x60'.repeat(3);
const T4 = '\x60'.repeat(4);

function repo(files) {
  const root = mkdtempSync(join(tmpdir(), 'unwrap-'));
  temps.push(root);
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), body);
  }
  return root;
}

// Every call goes through a link to the skill folder, the way an installed skill is reached.
const linkRoot = mkdtempSync(join(tmpdir(), 'unwrap-link-'));
temps.push(linkRoot);
const link = join(linkRoot, 're0');
symlinkSync(skill, link, process.platform === 'win32' ? 'junction' : 'dir');

function cli(cwd, ...args) {
  const run = spawnSync(process.execPath, [join(link, 'scripts', 'unwrap.mjs'), ...args], { cwd, encoding: 'utf8' });
  return { status: run.status, stdout: run.stdout, stderr: run.stderr, json: () => JSON.parse(run.stdout) };
}
const read = (root, path) => readFileSync(join(root, path), 'utf8');
const spots = (run) => run.json().wrapped.map((w) => w.file + ':' + w.line + ':' + w.lines);
const clean = (body) => {
  const root = repo({ 'a.md': body });
  const run = cli(root, 'a.md', '--json');
  assert.equal(run.status, 0, run.stdout + run.stderr);
  assert.deepEqual(run.json().wrapped, []);
};

test.after(() => {
  for (const dir of temps) rmSync(dir, { recursive: true, force: true });
});

test('a wrapped paragraph is reported with its start line and line count, then joined by --write', () => {
  const root = repo({ 'a.md': '# Title\n\nFirst line of a\nparagraph that was\nwrapped by hand.\n\nOne line.\n' });
  const run = cli(root, 'a.md', '--json');
  assert.equal(run.status, 3);
  assert.deepEqual(spots(run), ['a.md:3:3']);
  assert.equal(read(root, 'a.md').split('\n').length, 8);
  const fix = cli(root, 'a.md', '--write');
  assert.equal(fix.status, 0, fix.stdout + fix.stderr);
  assert.equal(read(root, 'a.md'), '# Title\n\nFirst line of a paragraph that was wrapped by hand.\n\nOne line.\n');
  assert.equal(cli(root, 'a.md').status, 0);
});

test('a wrapped list item is reported and joined, and its sibling items stay apart', () => {
  const root = repo({ 'a.md': '- first item that runs\n  onto a second line\n- second item\n1. numbered that also\n   wraps here\n' });
  const run = cli(root, 'a.md', '--json');
  assert.equal(run.status, 3);
  assert.deepEqual(spots(run), ['a.md:1:2', 'a.md:4:2']);
  assert.deepEqual(run.json().wrapped.map((w) => w.kind), ['list item', 'list item']);
  assert.equal(cli(root, 'a.md', '--write').status, 0);
  assert.equal(read(root, 'a.md'), '- first item that runs onto a second line\n- second item\n1. numbered that also wraps here\n');
});

test('a fence nested in a longer fence is content, so joining never merges cd <dir> with the next line', () => {
  const block = T4 + 'md\n' + T3 + '\ncd <dir>\n' + T3 + '\ncodex resume <id>\n' + T4 + '\n';
  const body = 'Wrapped intro\nbefore the block.\n\n' + block;
  const root = repo({ 'a.md': body });
  const run = cli(root, 'a.md', '--json');
  assert.equal(run.status, 3);
  assert.deepEqual(spots(run), ['a.md:1:2']);
  assert.equal(cli(root, 'a.md', '--write').status, 0);
  assert.equal(read(root, 'a.md'), 'Wrapped intro before the block.\n\n' + block);
});

test('the proof passes a faithful join and fails one that changes words or a fenced block', async () => {
  const { prove, unwrapLines, analyze } = await import(pathToFileURL(join(link, 'scripts', 'unwrap.mjs')).href);
  const lines = ['para one', 'para two', '', T3, 'a', 'b', T3];
  const seps = lines.map(() => '\n');
  assert.equal(prove(lines, unwrapLines(lines, seps, analyze(lines)).lines), null);
  // A joiner that merged the fenced lines would keep the words and break the block.
  assert.equal(prove(lines, ['para one para two', '', T3, 'a b', T3]), 'a fenced block changed');
  assert.equal(prove(lines, ['para one para three', '', T3, 'a', 'b', T3]), 'whitespace-normalized text differs');
});

test('a fenced block, tilde fence and unclosed fence keep their breaks', () => {
  clean(T3 + 'sh\nline one\nline two\n' + T3 + '\n');
  clean('~~~\nline one\nline two\n~~~\n');
  clean(T3 + '\nline one\nline two\n');
});

test('a table, blockquote, heading, thematic break and reference definition are not joined', () => {
  clean('| a | b |\n| - | - |\n| 1 | 2 |\n');
  clean('> quoted line one\n> quoted line two\n');
  clean('# Heading\n\n---\n\n[ref]: https://example.com\n');
});

test('frontmatter keeps its own lines', () => {
  clean('---\nname: x\ndescription: "two\n  lines"\n---\n\nBody.\n');
});

test('an HTML block and an indented code block keep their breaks', () => {
  clean('<div>\nline one\nline two\n</div>\n');
  clean('<!-- comment\nover two lines -->\n\nText.\n');
  clean('Intro.\n\n    code one\n    code two\n');
});

test('a two-space or backslash hard break is left, and only the lines around it join', () => {
  const root = repo({ 'a.md': 'keep this  \nbreak then wrapped\ncontinuation here\n' });
  const run = cli(root, 'a.md', '--json');
  assert.deepEqual(spots(run), ['a.md:2:2']);
  assert.equal(cli(root, 'a.md', '--write').status, 0);
  assert.equal(read(root, 'a.md'), 'keep this  \nbreak then wrapped continuation here\n');
  clean('keep this\\\nand this\\\n');
});

test('a list item continued by a nested fence or code keeps the fence intact', () => {
  clean('- item\n\n  ' + T3 + '\n  one\n  two\n  ' + T3 + '\n\n- next\n');
});

test('CRLF files are joined with CRLF kept', () => {
  const root = repo({ 'a.md': 'wrapped one\r\nwrapped two\r\n\r\nOther.\r\n' });
  assert.equal(cli(root, 'a.md', '--write').status, 0);
  assert.equal(read(root, 'a.md'), 'wrapped one wrapped two\r\n\r\nOther.\r\n');
});

test('a directory is walked for markdown only, skipping .git and node_modules', () => {
  const wrapped = 'one\ntwo\n';
  const root = repo({ 'docs/a.md': wrapped, 'docs/b.txt': wrapped, 'node_modules/p/c.md': wrapped, '.git/d.md': wrapped });
  assert.deepEqual(spots(cli(root, '.', '--json')), ['docs/a.md:1:2']);
});

test('a bad flag, no path or a missing path is a usage error and exits 2', () => {
  const root = repo({ 'a.md': 'clean\n' });
  assert.equal(cli(root, 'a.md', '--bogus').status, 2);
  assert.equal(cli(root).status, 2);
  assert.equal(cli(root, 'absent').status, 2);
});

