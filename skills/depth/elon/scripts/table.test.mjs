import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const skill = dirname(dirname(fileURLToPath(import.meta.url)));
const temps = [];
const root = mkdtempSync(join(tmpdir(), 'elon-table-'));
temps.push(root);

// Every call goes through a link to the skill folder, the way an installed skill is reached.
const linkRoot = mkdtempSync(join(tmpdir(), 'elon-table-link-'));
temps.push(linkRoot);
const link = join(linkRoot, 'elon');
symlinkSync(skill, link, process.platform === 'win32' ? 'junction' : 'dir');

test.after(() => {
  for (const dir of temps) rmSync(dir, { recursive: true, force: true });
});

const header = '| Item | Serves | Source | Holds | Bought | Orphans | Re-add | Verdict | Reason |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- |\n';
let n = 0;
function table(...rows) {
  const name = 'table-' + n++ + '.md';
  writeFileSync(join(root, name), 'Goal: ship the release.\n\n' + header + rows.join('\n') + '\n');
  return name;
}
function cli(...args) {
  const run = spawnSync(process.execPath, [join(link, 'scripts', 'table.mjs'), ...args], { cwd: root, encoding: 'utf8' });
  return { status: run.status, stdout: run.stdout, stderr: run.stderr, json: () => JSON.parse(run.stdout) };
}

const keep = '| export step | the release | the owner, by name | yes | users get files | the import step | high | keep | still needed |';
const mandated = '| licence notice | the release | the licence | yes | legal use | none | n/a | mandated | the licence requires it |';
const remove = '| legacy flag | the release | a past maintainer, gone | no | nothing now | none | low, one line | remove | no caller reads it |';
const defer = '| second format | the release | the owner, by name | yes | reach | the docs page | medium | defer | resume when a user asks, else stop on 2026-12-01 |';
const ask = '| retry loop | the release | no one found | unknown |  |  |  | ask | who asked for three retries? |';

test('a filled table with every verdict passes', () => {
  const run = cli(table(keep, mandated, remove, defer, ask), '--json');
  assert.equal(run.status, 0, run.stdout + run.stderr);
  assert.equal(run.json().rows, 5);
});

test('a removal whose source does not hold is fine, one whose source is unknown fails', () => {
  const run = cli(table('| retry loop | the release | no one found | unknown | speed | none | low | remove | looks unused |'), '--json');
  assert.equal(run.status, 1);
  assert.match(run.json().problems[0].message, /unknown source/);
});

test('a removal without what it orphans or what re-adding costs fails', () => {
  const run = cli(table('| legacy flag | the release | a past maintainer, gone | no | nothing now |  |  | remove | no caller reads it |'), '--json');
  assert.equal(run.status, 1);
  const messages = run.json().problems.map((p) => p.message).join('\n');
  assert.match(messages, /Orphans/);
  assert.match(messages, /Re-add/);
});

test('a deferral without a date fails', () => {
  const run = cli(table('| second format | the release | the owner, by name | yes | reach | the docs page | medium | defer | later |'), '--json');
  assert.equal(run.status, 1);
  assert.match(run.json().problems[0].message, /date/);
});

test('a verdict outside the set and a row with no goal fail', () => {
  const run = cli(table('| export step |  | the owner, by name | yes | users get files | none | high | maybe | unsure |'), '--json');
  assert.equal(run.status, 1);
  const messages = run.json().problems.map((p) => p.message).join('\n');
  assert.match(messages, /verdict/);
  assert.match(messages, /Serves/);
});

test('an owner question needs its question, whatever the source holds', () => {
  const run = cli(table('| retry loop | the release | the owner, by name | yes |  |  |  | ask |  |'), '--json');
  assert.equal(run.status, 1);
  assert.match(run.json().problems[0].message, /Reason/);
  assert.equal(cli(table('| audit log | the release | the owner, by name | yes | a record | none | high | ask | is a retention law behind it? |')).status, 0);
});

test('a row a mandate conflict stopped needs only its item and the reason it stopped', () => {
  assert.equal(cli(table('| export step |  |  | unknown |  |  |  | stopped | not reached: the run stopped at the licence conflict |')).status, 0);
  const run = cli(table('| export step |  |  | unknown |  |  |  | stopped |  |'), '--json');
  assert.equal(run.status, 1);
  assert.match(run.json().problems[0].message, /Reason/);
});

test('one row may carry several of simplify, accelerate and automate, never one of them with a removal', () => {
  assert.equal(cli(table('| export step | the release | the owner, by name | yes | users get files | none | high | simplify + automate | one pass; a check runs it |')).status, 0);
  const run = cli(table('| export step | the release | the owner, by name | yes | users get files | none | high | remove + automate | gone |'), '--json');
  assert.equal(run.status, 1);
  assert.match(run.json().problems[0].message, /stands alone/);
});

test('an escaped pipe stays inside its cell', () => {
  const run = cli(table('| a \\| b step | the release | the owner, by name | yes | both | none | high | keep | needed |'), '--json');
  assert.equal(run.status, 0, run.stdout);
});

test('a file with no item table, a missing file or a bad flag exits 2', () => {
  writeFileSync(join(root, 'prose.md'), 'no table here\n');
  assert.equal(cli('prose.md').status, 2);
  assert.equal(cli('absent.md').status, 2);
  assert.equal(cli('--bogus').status, 2);
  assert.equal(cli().status, 2);
});

