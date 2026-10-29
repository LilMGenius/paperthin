import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const skill = dirname(dirname(fileURLToPath(import.meta.url)));
const temps = [];

function work(files) {
  const root = mkdtempSync(join(tmpdir(), 'attempt-'));
  temps.push(root);
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), body);
  }
  return root;
}

// Every call goes through a link to the skill folder, the way an installed skill is reached.
const linkRoot = mkdtempSync(join(tmpdir(), 'attempt-link-'));
temps.push(linkRoot);
const link = join(linkRoot, 're0-tutorial');
symlinkSync(skill, link, process.platform === 'win32' ? 'junction' : 'dir');

function cli(cwd, ...args) {
  const run = spawnSync(process.execPath, [join(link, 'scripts', 'attempt.mjs'), ...args], { cwd, encoding: 'utf8' });
  return { status: run.status, stdout: run.stdout, stderr: run.stderr, json: () => JSON.parse(run.stdout) };
}
const resume = (root, version, ...extra) => cli(root, '--exercise', 'ex1', '--skills', 'skills/alpha', 'skills/beta', '--version', version, '--json', ...extra);

const skills = { 'skills/alpha/SKILL.md': 'alpha body\n', 'skills/beta/SKILL.md': 'beta body\n' };
const record = (version, digest, names = 'alpha, beta') => 'exercise: ex1\nversion: ' + version + '\nskills: ' + names + '\nskill-set digest: ' + digest + '\n';

// The digest the current install produces, read from a run with no record.
const probe = () => resume(work(skills), '1.0.0').json().currentDigest;

test.after(() => {
  for (const dir of temps) rmSync(dir, { recursive: true, force: true });
});

test('no record is fresh and the next path is attempt 1 under the current version', () => {
  const run = resume(work(skills), '1.0.0');
  assert.equal(run.status, 0);
  assert.equal(run.json().status, 'fresh');
  assert.match(run.json().nextPath, /\.re0\/tutorial\/ex1\/1\.0\.0-1\.local\.md$/);
  assert.equal(run.json().latest, null);
});

test('the same version and digest is a match and the next path is past the highest attempt', () => {
  const digest = probe();
  const root = work({ ...skills, '.re0/tutorial/ex1/1.0.0-1.local.md': record('1.0.0', 'old'), '.re0/tutorial/ex1/1.0.0-2.local.md': record('1.0.0', digest) });
  const run = resume(root, '1.0.0');
  assert.equal(run.status, 0);
  assert.equal(run.json().status, 'match');
  assert.equal(run.json().latest.attempt, 2);
  assert.match(run.json().nextPath, /1\.0\.0-3\.local\.md$/);
});

test('a newer version with an unchanged digest is a version-only difference', () => {
  const root = work({ ...skills, '.re0/tutorial/ex1/1.0.0-1.local.md': record('1.0.0', probe()) });
  const run = resume(root, '1.1.0');
  assert.equal(run.status, 0);
  assert.equal(run.json().status, 'version-only');
  assert.match(run.json().nextPath, /1\.1\.0-2\.local\.md$/);
});

test('an edited skill body is a content difference and exits 3', () => {
  const root = work({ ...skills, 'skills/beta/SKILL.md': 'beta changed\n', '.re0/tutorial/ex1/1.0.0-1.local.md': record('1.0.0', probe()) });
  const run = resume(root, '1.0.0');
  assert.equal(run.status, 3);
  assert.equal(run.json().status, 'content-difference');
});

test('a recorded skill that is no longer among the folders is stale and exits 3', () => {
  const root = work({ ...skills, '.re0/tutorial/ex1/1.0.0-1.local.md': record('1.0.0', probe(), 'alpha, gamma') });
  const run = resume(root, '1.0.0');
  assert.equal(run.status, 3);
  assert.equal(run.json().status, 'stale');
});

test('line endings alone do not change the digest', () => {
  const crlf = work({ 'skills/alpha/SKILL.md': 'alpha body\r\n', 'skills/beta/SKILL.md': 'beta body\r\n' });
  assert.equal(resume(crlf, '1.0.0').json().currentDigest, probe());
});

test('a missing skill folder or a record with no digest is unreadable and exits 4', () => {
  const missing = work({ 'skills/alpha/SKILL.md': 'a\n', '.re0/tutorial/ex1/1.0.0-1.local.md': record('1.0.0', 'x') });
  const a = resume(missing, '1.0.0');
  assert.equal(a.status, 4);
  assert.equal(a.json().status, 'unreadable');
  assert.match(a.json().digestError, /skills[\\/]beta/);
  const blank = work({ ...skills, '.re0/tutorial/ex1/1.0.0-1.local.md': 'exercise: ex1\nversion: 1.0.0\n' });
  assert.equal(resume(blank, '1.0.0').status, 4);
});

test('a missing argument, an unknown option and an unsafe exercise id exit 2', () => {
  const root = work(skills);
  assert.equal(cli(root, '--exercise', 'ex1', '--version', '1.0.0').status, 2);
  assert.equal(cli(root, '--skills', 'skills/alpha', '--version', '1.0.0').status, 2);
  assert.equal(cli(root, '--bogus').status, 2);
  assert.equal(cli(root, '--exercise', '../x', '--skills', 'skills/alpha', '--version', '1.0.0').status, 2);
});

test('the plain output names the status and the next path', () => {
  const run = cli(work(skills), '--exercise', 'ex1', '--skills', 'skills/alpha', 'skills/beta', '--version', '1.0.0');
  assert.match(run.stdout, /^status: fresh$/m);
  assert.match(run.stdout, /^next path: .*1\.0\.0-1\.local\.md$/m);
});
