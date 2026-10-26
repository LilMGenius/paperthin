import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { audit, detectKind } from './audit.mjs';

const here = dirname(fileURLToPath(import.meta.url));

function repo(files) {
  const root = mkdtempSync(join(tmpdir(), 'audit-'));
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), body);
  }
  return root;
}

const ids = (side) => side.hits.map((hit) => hit.id + ':' + hit.line);

test('detects the kind from files, never from prose', () => {
  assert.equal(detectKind(repo({ 'skills/a/one/SKILL.md': 'x', 'skills/a/two/SKILL.md': 'x', 'README.md': 'a cli tool' })), 'skills');
  assert.equal(detectKind(repo({ 'package.json': JSON.stringify({ bin: { tool: 'cli.js' } }) })), 'cli');
  assert.equal(detectKind(repo({ 'package.json': JSON.stringify({ main: 'index.js' }) })), 'library');
  assert.equal(detectKind(repo({ 'package.json': '{}', 'index.html': '<html></html>' })), 'app');
});

test('a check command in an app README fails, in a skills README it is a note until --strict', () => {
  const files = { 'README.md': 'Run it.\n\nThen npm run check before committing.\n', 'AGENTS.md': '# Agents\n' };
  const app = audit(repo(files), { kind: 'app' });
  assert.deepEqual(ids(app.readme), ['R1:3', 'R8:3']);
  assert.equal(app.ok, false);
  const skills = audit(repo(files), { kind: 'skills' });
  assert.equal(skills.ok, true);
  assert.equal(skills.notes, 2);
  assert.equal(audit(repo(files), { kind: 'skills', strict: true }).ok, false);
});

test('a missing AGENTS.md is a failure, a missing README.md is only reported', () => {
  const result = audit(repo({ 'README.md': 'A tool for people.\n' }), { kind: 'library' });
  assert.equal(result.agents.missing, true);
  assert.equal(result.fails, 1);
  const noReadme = audit(repo({ 'AGENTS.md': '# Agents\n' }), { kind: 'library' });
  assert.equal(noReadme.readme.missing, true);
  assert.equal(noReadme.ok, true);
});

test('a local-only path is one the repository ignores, so a tracked dot folder is not flagged', () => {
  const root = repo({
    '.gitignore': '/.state/\n*.local*\n!.keep\n',
    'README.md': 'See .agents/contract.md for the contract.\nProgress lives in .state/run.json.\nDraft in notes.local.md.\n',
    'AGENTS.md': '# Agents\n',
  });
  const result = audit(root, { kind: 'app' });
  assert.deepEqual(result.localDirs, ['.state']);
  assert.deepEqual(ids(result.readme), ['R5:2', 'R5:3']);
  assert.deepEqual(ids(audit(root, { kind: 'app', loopDirs: ['.agents'] }).readme), ['R5:1', 'R5:2', 'R5:3']);
});

test('a fence whose first command is a check is reported once at the fence', () => {
  const root = repo({ 'README.md': 'Setup:\n\n\x60\x60\x60bash\npnpm test\nmore\n\x60\x60\x60\n', 'AGENTS.md': '# Agents\n' });
  assert.deepEqual(ids(audit(root, { kind: 'cli' }).readme), ['R9:3']);
});

test('AGENTS.md carrying an image, a badge or a pitch fails in every kind', () => {
  const root = repo({ 'README.md': 'A tool.\n', 'AGENTS.md': '![shot](docs/a.png)\n[![ci](https://img.shields.io/x)](y)\nThe best way to work.\n' });
  for (const kind of ['app', 'cli', 'library', 'skills']) assert.deepEqual(ids(audit(root, { kind }).agents), ['A1:1', 'A2:2', 'A3:3']);
});

test('the CLI runs through a linked skill folder and keeps its exit codes', () => {
  const linkRoot = mkdtempSync(join(tmpdir(), 'audit-link-'));
  const link = join(linkRoot, 'scripts');
  symlinkSync(here, link, process.platform === 'win32' ? 'junction' : 'dir');
  try {
    const red = repo({ 'README.md': 'Run npm test first.\n', 'AGENTS.md': '# Agents\n' });
    const cli = (...args) => spawnSync(process.execPath, [join(link, 'audit.mjs'), ...args], { encoding: 'utf8' });
    const fail = cli(red, '--kind', 'app');
    assert.equal(fail.status, 1);
    assert.match(fail.stdout, /AUDIENCE RED 1/);
    const json = cli(red, '--kind', 'skills', '--json');
    assert.equal(json.status, 0);
    assert.equal(JSON.parse(json.stdout).notes, 1);
    assert.equal(cli(red, '--kind', 'web').status, 2);
    assert.equal(cli(join(red, 'absent')).status, 2);
    assert.match(cli('--rules').stdout, /^R1 /m);
  } finally {
    rmSync(linkRoot, { recursive: true, force: true });
  }
});
