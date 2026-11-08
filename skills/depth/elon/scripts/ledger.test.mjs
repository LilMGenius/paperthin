import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const skill = dirname(dirname(fileURLToPath(import.meta.url)));
const temps = [];
const root = mkdtempSync(join(tmpdir(), 'elon-ledger-'));
temps.push(root);

// Every call goes through a link to the skill folder, the way an installed skill is reached.
const linkRoot = mkdtempSync(join(tmpdir(), 'elon-ledger-link-'));
temps.push(linkRoot);
const link = join(linkRoot, 'elon');
symlinkSync(skill, link, process.platform === 'win32' ? 'junction' : 'dir');

test.after(() => {
  for (const dir of temps) rmSync(dir, { recursive: true, force: true });
});

let n = 0;
function ledger(...events) {
  const name = 'ledger-' + n++ + '.jsonl';
  writeFileSync(join(root, name), events.map((e) => (typeof e === 'string' ? e : JSON.stringify(e))).join('\n') + '\n');
  return name;
}
function cli(...args) {
  const run = spawnSync(process.execPath, [join(link, 'scripts', 'ledger.mjs'), ...args], { cwd: root, encoding: 'utf8' });
  return { status: run.status, stdout: run.stdout, stderr: run.stderr, json: () => JSON.parse(run.stdout) };
}
const removed = (item, date) => ({ date, item, event: 'remove' });
const back = (item, date) => ({ date, item, event: 'add-back' });

test('ten removals with one add-back reach the 10% line and raise no flag', () => {
  const events = [];
  for (let i = 0; i < 10; i++) events.push(removed('item' + i, '2026-11-0' + (i % 9 + 1)));
  events.push(back('item3', '2026-12-02'));
  const run = cli(ledger(...events), '--json');
  assert.equal(run.status, 0, run.stderr);
  const all = run.json().total;
  assert.deepEqual([all.removed, all.addedBack, all.rate, all.low], [10, 1, 0.1, false]);
});

test('an add-back counts in the period of the removal it undoes', () => {
  const run = cli(ledger(removed('a', '2026-10-05'), removed('b', '2026-11-05'), back('a', '2026-11-20')), '--json');
  assert.equal(run.status, 0, run.stderr);
  const byPeriod = Object.fromEntries(run.json().periods.map((p) => [p.period, p]));
  assert.equal(byPeriod['2026-10'].addedBack, 1);
  assert.equal(byPeriod['2026-11'].addedBack, 0);
});

test('a rate below 10% is flagged as possibly too conservative', () => {
  const run = cli(ledger(removed('a', '2026-11-01'), removed('b', '2026-11-02')));
  assert.equal(run.status, 0);
  assert.match(run.stdout, /below 10%/);
  assert.equal(cli(ledger(removed('a', '2026-11-01')), '--json').json().total.low, true);
});

test('an empty ledger reports no rate and no flag', () => {
  writeFileSync(join(root, 'empty.jsonl'), '');
  const run = cli('empty.jsonl', '--json');
  assert.equal(run.status, 0);
  assert.deepEqual(run.json().total, { removed: 0, addedBack: 0, rate: null, low: false });
});

test('an add-back of an item never removed before it, a bad line or a bad date exits 2', () => {
  assert.equal(cli(ledger(back('a', '2026-11-01'))).status, 2);
  assert.equal(cli(ledger(removed('a', '2026-11-05'), back('a', '2026-11-01'))).status, 2);
  assert.equal(cli(ledger('{not json')).status, 2);
  assert.equal(cli(ledger({ date: '11/05', item: 'a', event: 'remove' })).status, 2);
  assert.equal(cli(ledger({ date: '2026-11-05', item: 'a', event: 'drop' })).status, 2);
  assert.equal(cli('absent.jsonl').status, 2);
  assert.equal(cli().status, 2);
});

