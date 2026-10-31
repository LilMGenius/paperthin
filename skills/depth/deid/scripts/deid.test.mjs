import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, statSync, symlinkSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const skill = dirname(dirname(fileURLToPath(import.meta.url)));
const temps = [];
const temp = (prefix) => {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  temps.push(dir);
  return dir;
};

function tree(files) {
  const root = temp('deid-');
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), body);
  }
  return root;
}

// Needle and decision files sit outside the tree under test, the way a person's records stay off the shared artifact.
function records(name, value) {
  const file = join(temp('deid-rec-'), name);
  writeFileSync(file, JSON.stringify(value));
  return file;
}

// Every call goes through a link to the skill folder, the way an installed skill is reached.
const linkRoot = temp('deid-link-');
const link = join(linkRoot, 'deid');
symlinkSync(skill, link, process.platform === 'win32' ? 'junction' : 'dir');

// Git never looks above the temp folder, so a fixture outside git stays outside git wherever the temp folder sits.
const env = { ...process.env, GIT_CEILING_DIRECTORIES: tmpdir() };

function cli(...args) {
  const run = spawnSync(process.execPath, [join(link, 'scripts', 'deid.mjs'), ...args], { encoding: 'utf8', env });
  return { status: run.status, out: run.stdout + run.stderr, json: () => JSON.parse(run.stdout) };
}

function git(cwd, ...args) {
  const run = spawnSync('git', ['-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=.no-hooks', '-c', 'user.name=Tester', '-c', 'user.email=tester@example.com', ...args], { cwd, encoding: 'utf8', env });
  assert.equal(run.status, 0, run.stderr);
  return run.stdout.trim();
}

test.after(() => {
  for (const dir of temps) rmSync(dir, { recursive: true, force: true });
});

const NEEDLES = [
  { label: 'person.name', value: 'Jane Roe' },
  { label: 'person.first', value: 'Jane' },
  { label: 'person.email', value: 'jane.roe@corp-mail.net', ci: true },
  { label: 'client.id', value: 'C-\\d{6}', regex: true },
];

test('a planted needle is found with its label, and its value never reaches the output', () => {
  const root = tree({ 'src/a.js': "const owner = 'Jane Roe';\n", 'docs/b.md': 'Mail JANE.ROE@corp-mail.net about C-123456.\n', 'clean.txt': 'nothing here\n' });
  const needles = records('needles.json', NEEDLES);
  const run = cli('scan', root, '--needles', needles, '--no-git');
  assert.equal(run.status, 3);
  assert.match(run.out, /src\/a\.js:1:\d+  person\.name/);
  assert.match(run.out, /docs\/b\.md:1:\d+  person\.email/);
  assert.match(run.out, /docs\/b\.md:1:\d+  client\.id/);
  assert.doesNotMatch(run.out, /Jane|JANE|corp-mail|123456/);
  const { hits } = cli('scan', root, '--needles', needles, '--no-git', '--json').json();
  assert.deepEqual(hits.map((h) => h.file + ':' + h.label).sort(), ['docs/b.md:client.id', 'docs/b.md:person.email', 'src/a.js:person.first', 'src/a.js:person.name']);
});

test('a tree without a needle exits 0', () => {
  const root = tree({ 'a.txt': 'the operator\n' });
  assert.equal(cli('scan', root, '--needles', records('n.json', NEEDLES), '--no-git').status, 0);
});

test('apply replaces from the decision file, longest needle first, writes only changed files, and a rerun changes nothing', () => {
  const root = tree({ 'src/a.js': "const owner = 'Jane Roe';\r\nconst first = 'Jane';\r\n", 'docs/b.md': 'Mail jane.roe@corp-mail.net about C-123456.\n', 'untouched.txt': 'the operator\n' });
  const old = new Date('2020-01-01T00:00:00Z');
  utimesSync(join(root, 'untouched.txt'), old, old);
  const needles = records('needles.json', NEEDLES);
  const decisions = records('decisions.json', [
    { needle: 'person.name', replace: 'Alex Example' },
    { needle: 'person.first', replace: 'Alex' },
    { needle: 'person.email', replace: 'operator@example.com' },
    { needle: 'client.id', replace: 'C-XXXXXX' },
  ]);
  const run = cli('apply', root, '--needles', needles, '--decisions', decisions, '--no-git');
  assert.equal(run.status, 0, run.out);
  assert.equal(readFileSync(join(root, 'src/a.js'), 'utf8'), "const owner = 'Alex Example';\r\nconst first = 'Alex';\r\n");
  assert.equal(readFileSync(join(root, 'docs/b.md'), 'utf8'), 'Mail operator@example.com about C-XXXXXX.\n');
  assert.equal(statSync(join(root, 'untouched.txt')).mtimeMs, old.getTime());
  const before = statSync(join(root, 'src/a.js')).mtimeMs;
  const again = cli('apply', root, '--needles', needles, '--decisions', decisions, '--no-git', '--json');
  assert.equal(again.status, 0);
  assert.deepEqual(again.json().changed, []);
  assert.equal(statSync(join(root, 'src/a.js')).mtimeMs, before);
  assert.equal(cli('scan', root, '--needles', needles, '--decisions', decisions, '--no-git').status, 0);
});

test('a keep decision scoped to a path leaves that copy, and scan with the decisions passes', () => {
  const root = tree({ 'README.md': 'Built by Jane Roe.\n', 'src/a.js': "// Jane Roe's quote\n" });
  const needles = records('needles.json', [{ label: 'person.name', value: 'Jane Roe' }]);
  const decisions = records('decisions.json', [
    { needle: 'person.name', keep: 'the public author credit', paths: ['README.md'] },
    { needle: 'person.name', replace: 'the operator' },
  ]);
  assert.equal(cli('scan', root, '--needles', needles, '--decisions', decisions, '--no-git').status, 3);
  assert.equal(cli('apply', root, '--needles', needles, '--decisions', decisions, '--no-git').status, 0);
  assert.equal(readFileSync(join(root, 'README.md'), 'utf8'), 'Built by Jane Roe.\n');
  assert.equal(readFileSync(join(root, 'src/a.js'), 'utf8'), "// the operator's quote\n");
  assert.equal(cli('scan', root, '--needles', needles, '--decisions', decisions, '--no-git').status, 0);
});

test('a hit with no decision is left in place and apply exits 3', () => {
  const root = tree({ 'a.txt': 'Jane Roe and C-123456\n' });
  const needles = records('needles.json', NEEDLES);
  const decisions = records('decisions.json', [{ needle: 'client.id', replace: 'C-XXXXXX' }]);
  const run = cli('apply', root, '--needles', needles, '--decisions', decisions, '--no-git');
  assert.equal(run.status, 3);
  assert.equal(readFileSync(join(root, 'a.txt'), 'utf8'), 'Jane Roe and C-XXXXXX\n');
});

test('a replacement that still carries a needle is a broken decision file: exit 2 and nothing is written', () => {
  const root = tree({ 'a.txt': 'Jane Roe\n' });
  const needles = records('needles.json', NEEDLES);
  const decisions = records('decisions.json', [{ needle: 'person.name', replace: 'Jane R.' }]);
  const run = cli('apply', root, '--needles', needles, '--decisions', decisions, '--no-git');
  assert.equal(run.status, 2);
  assert.match(run.out, /person\.name.*person\.first/);
  assert.doesNotMatch(run.out, /Jane/);
  assert.equal(readFileSync(join(root, 'a.txt'), 'utf8'), 'Jane Roe\n');
});

test('a file that is not UTF-8 text is reported and never rewritten', () => {
  const root = tree({ 'a.bin': Buffer.concat([Buffer.from([0, 1, 2]), Buffer.from('Jane Roe'), Buffer.from([0])]) });
  const needles = records('needles.json', [{ label: 'person.name', value: 'Jane Roe' }]);
  const decisions = records('decisions.json', [{ needle: 'person.name', replace: 'the operator' }]);
  const scan = cli('scan', root, '--needles', needles, '--no-git', '--json');
  assert.equal(scan.status, 3);
  assert.equal(scan.json().hits[0].binary, true);
  const run = cli('apply', root, '--needles', needles, '--decisions', decisions, '--no-git');
  assert.equal(run.status, 3);
  assert.match(readFileSync(join(root, 'a.bin'), 'latin1'), /Jane Roe/);
});

test('the needle and decision files are never scanned when they sit inside the tree', () => {
  const root = tree({ 'a.txt': 'the operator\n' });
  writeFileSync(join(root, 'needles.local.json'), JSON.stringify([{ label: 'person.name', value: 'Jane Roe' }]));
  assert.equal(cli('scan', root, '--needles', join(root, 'needles.local.json'), '--no-git').status, 0);
});

test('inside a git work tree, an ignored file is not part of the shared artifact', () => {
  const root = tree({ '.gitignore': '*.local*\n', 'notes.local.md': 'Jane Roe\n', 'shared.md': 'Jane Roe\n' });
  git(root, 'init', '-q');
  const run = cli('scan', root, '--needles', records('n.json', [{ label: 'person.name', value: 'Jane Roe' }]), '--json');
  assert.equal(run.status, 3);
  assert.deepEqual(run.json().hits.map((h) => h.file), ['shared.md']);
});

test('history reports the commit that introduced each needle and the messages that carry one, and moves nothing', () => {
  const root = tree({ 'a.txt': 'start\n' });
  git(root, 'init', '-q');
  git(root, 'add', '.');
  git(root, 'commit', '-q', '-m', 'chore: start');
  writeFileSync(join(root, 'a.txt'), 'owner Jane Roe\n');
  git(root, 'commit', '-q', '-am', 'feat: add owner');
  const planted = git(root, 'rev-parse', 'HEAD');
  writeFileSync(join(root, 'a.txt'), 'owner the operator\n');
  git(root, 'commit', '-q', '-am', 'fix: drop the name Jane Roe gave');
  const message = git(root, 'rev-parse', 'HEAD');
  const needles = records('n.json', [{ label: 'person.name', value: 'Jane Roe' }]);
  const run = cli('history', root, '--needles', needles, '--json');
  assert.equal(run.status, 3, run.out);
  const [entry] = run.json().needles;
  assert.equal(entry.label, 'person.name');
  assert.deepEqual(entry.content.map((c) => c.commit + ':' + c.path), [planted + ':a.txt']);
  assert.deepEqual(entry.messages, [message]);
  assert.equal(git(root, 'rev-parse', 'HEAD'), message);
  assert.equal(git(root, 'status', '--porcelain'), '');
  const text = cli('history', root, '--needles', needles);
  assert.doesNotMatch(text.out, /Jane/);
  assert.match(text.out, /re0-git/);
  assert.match(text.out, /force push/);
});

test('history over a clean repository exits 0', () => {
  const root = tree({ 'a.txt': 'the operator\n' });
  git(root, 'init', '-q');
  git(root, 'add', '.');
  git(root, 'commit', '-q', '-m', 'chore: start');
  assert.equal(cli('history', root, '--needles', records('n.json', [{ label: 'person.name', value: 'Jane Roe' }])).status, 0);
});

test('usage errors exit 2: no needles, an unknown needle in the decisions, a needle too short to mean one value, history outside git', () => {
  const root = tree({ 'a.txt': 'x\n' });
  const needles = records('n.json', [{ label: 'person.name', value: 'Jane Roe' }]);
  assert.equal(cli('scan', root, '--no-git').status, 2);
  assert.equal(cli('bogus', root, '--needles', needles).status, 2);
  assert.equal(cli('apply', root, '--needles', needles, '--decisions', records('d.json', [{ needle: 'nobody', replace: 'x' }]), '--no-git').status, 2);
  assert.equal(cli('scan', root, '--needles', records('s.json', [{ label: 'short', value: 'Jo' }]), '--no-git').status, 2);
  assert.equal(cli('history', root, '--needles', needles).status, 2);
});
