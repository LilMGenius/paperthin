import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const skill = dirname(dirname(fileURLToPath(import.meta.url)));
const temps = [];

function repo(files) {
  const root = mkdtempSync(join(tmpdir(), 'demock-'));
  temps.push(root);
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), body);
  }
  return root;
}

// Every call goes through a link to the skill folder, the way an installed skill is reached.
const linkRoot = mkdtempSync(join(tmpdir(), 'demock-link-'));
temps.push(linkRoot);
const link = join(linkRoot, 'demock');
symlinkSync(skill, link, process.platform === 'win32' ? 'junction' : 'dir');

function cli(cwd, ...args) {
  const run = spawnSync(process.execPath, [join(link, 'scripts', 'scan.mjs'), ...args], { cwd, encoding: 'utf8' });
  return { status: run.status, stdout: run.stdout, stderr: run.stderr, json: () => JSON.parse(run.stdout) };
}
const found = (run) => run.json().candidates.map((c) => c.file + ':' + c.line + ':' + c.kind);

test.after(() => {
  for (const dir of temps) rmSync(dir, { recursive: true, force: true });
});

test('a jest.mock on the real path is a candidate, the same call under tests/ is not', () => {
  const body = "import { send } from './mailer';\njest.mock('./mailer');\nexport const notify = (to) => send(to);\n";
  const root = repo({ 'src/notify.js': body, 'tests/notify.js': body });
  const run = cli(root, '.', '--json');
  assert.equal(run.status, 3);
  assert.deepEqual(found(run), ['src/notify.js:2:mock-import']);
  assert.equal(run.json().testFiles, 1);
});

test('a catch that returns an empty list is a candidate, one that logs and rethrows is not', () => {
  const root = repo({
    'src/load.js': 'export function load(read) {\n  try {\n    return read();\n  } catch (e) { return [] }\n}\n',
    'src/save.js': "export function save(write) {\n  try {\n    return write();\n  } catch (e) {\n    console.error('save failed', e);\n    throw e;\n  }\n}\n",
  });
  const run = cli(root, 'src', '--json');
  assert.equal(run.status, 3);
  assert.deepEqual(found(run), ['src/load.js:4:swallow']);
});

test('a Python except that returns None is a candidate', () => {
  const root = repo({ 'app/fetch.py': 'def fetch(client):\n    try:\n        return client.get()\n    except Exception:\n        return None\n' });
  const run = cli(root, 'app', '--json');
  assert.equal(run.status, 3);
  assert.deepEqual(found(run), ['app/fetch.py:4:swallow']);
  assert.match(run.json().candidates[0].evidence, /except Exception: \.\.\. return None/);
});

test('--test-glob adds a test path the default conventions miss', () => {
  const root = repo({ 'qa/notify.js': "jest.mock('./mailer');\n" });
  assert.equal(cli(root, '.').status, 3);
  assert.equal(cli(root, '.', '--test-glob', 'qa').status, 0);
});

test('empty input finds nothing and exits 0', () => {
  const root = repo({ 'src/.keep': '' });
  const run = cli(root, 'src');
  assert.equal(run.status, 0);
  assert.match(run.stdout, /^0 candidate\(s\) in 0 file\(s\)/m);
});

test('a bad flag, no path or a missing path is a usage error and exits 2', () => {
  const root = repo({ 'src/a.js': 'export const a = 1;\n' });
  assert.equal(cli(root, 'src', '--bogus').status, 2);
  assert.equal(cli(root).status, 2);
  assert.equal(cli(root, 'absent').status, 2);
});
