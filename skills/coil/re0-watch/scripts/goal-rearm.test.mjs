import { test } from 'node:test';
import assert from 'node:assert/strict';
import { check, plan, verify, watchIds } from './goal-rearm.mjs';
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const prose = 'Keep these answered until merged or closed: oven-sh/bun #43901, router-for-me/CLIProxyAPI #6124 and issue #6250, lidge-jun/opencodex #6262, #6269 and #6274. Each continuation runs node C:/Users/x/stallwatch.mjs --repo oven-sh/bun --once.';
const goal = (objective, status = 'active') => ({ goal: { objective, status } });

test('reads ids from prose written before the Watch ids line existed', () => {
  assert.deepEqual(watchIds(prose), ['oven-sh/bun#43901', 'router-for-me/CLIProxyAPI#6124', 'router-for-me/CLIProxyAPI#6250', 'lidge-jun/opencodex#6262', 'lidge-jun/opencodex#6269', 'lidge-jun/opencodex#6274']);
});

test('supersedes an unfinished goal and carries every id the new objective forgot', () => {
  const result = plan({ current: goal(prose), objective: 'Watch until merged.\nWatch ids: code-yeongyu/oh-my-openagent#8298' });
  assert.equal(result.action, 'supersede');
  assert.equal(result.ids.length, 7);
  assert.equal(result.carried.length, 6);
  assert.match(result.objective, /^Watch ids: code-yeongyu\/oh-my-openagent#8298 oven-sh\/bun#43901 /m);
  assert.equal(result.steps[0], 'update_goal({status: "complete"})');
});

test('drops only ids proven terminal', () => {
  const result = plan({ current: goal('Watch ids: a/b#1 a/b#2', 'blocked'), objective: 'Watch ids: a/b#3', terminal: ['a/b#1'] });
  assert.deepEqual(result.ids, ['a/b#3', 'a/b#2']);
  assert.deepEqual(result.dropped, ['a/b#1']);
});

test('keeps an active goal that already holds the planned objective', () => {
  const objective = 'Watch.\nWatch ids: a/b#1';
  assert.equal(plan({ current: goal(objective), objective }).action, 'keep');
  assert.equal(plan({ current: goal(objective, 'paused'), objective }).action, 'supersede');
});

test('creates when no goal or only a complete one exists', () => {
  assert.equal(plan({ current: { goal: null }, objective: 'Watch ids: a/b#1' }).action, 'create');
  assert.equal(plan({ current: goal('Watch ids: a/b#9', 'complete'), objective: 'Watch ids: a/b#1' }).carried.length, 0);
});

test('refuses an objective with no watch id or past the host limit', () => {
  assert.ok(plan({ current: { goal: null }, objective: 'keep watching' }).refused);
  assert.ok(plan({ current: { goal: null }, objective: 'x'.repeat(4000) + '\nWatch ids: a/b#1' }).refused);
});

test('verify accepts only the planned objective, active', () => {
  const planned = plan({ current: { goal: null }, objective: 'Watch ids: a/b#1' });
  assert.equal(verify(planned, goal(planned.objective)), null);
  assert.match(verify(planned, goal(planned.objective, 'complete')), /status/);
  assert.match(verify(planned, goal('Watch ids: a/b#2')), /differs/);
  assert.match(verify(planned, { goal: null }), /no goal/);
});

test('check reports a registration that stopped waking the session', () => {
  assert.equal(check(goal('Watch ids: a/b#1')), null);
  assert.match(check(goal('Watch ids: a/b#1', 'blocked')), /blocked/);
  assert.match(check(goal('Watch ids: a/b#1', 'budgetLimited')), /budgetLimited/);
  assert.match(check(goal('no ids here')), /no watch id/);
  assert.match(check({ goal: null }), /no goal/);
});

// The CLI is called through a link to the skill folder, the way an installed skill is reached.
const skillDir = dirname(dirname(fileURLToPath(import.meta.url)));
const scratchDir = mkdtempSync(join(tmpdir(), 'goal-rearm-'));
const linkDir = join(scratchDir, 're0-watch');
symlinkSync(skillDir, linkDir, process.platform === 'win32' ? 'junction' : 'dir');
test.after(() => rmSync(scratchDir, { recursive: true, force: true }));

function cli(...args) {
  const run = spawnSync(process.execPath, [join(linkDir, 'scripts', 'goal-rearm.mjs'), ...args], { encoding: 'utf8' });
  return { status: run.status, stdout: run.stdout, stderr: run.stderr };
}
function file(name, body) {
  const path = join(scratchDir, name);
  writeFileSync(path, typeof body === 'string' ? body : JSON.stringify(body));
  return path;
}

test('CLI check prints LIVE for an active goal and LAPSED with exit 2 for a blocked one', () => {
  const live = cli('check', '--current', file('live.json', goal('Watch ids: a/b#1')));
  assert.equal(live.status, 0);
  assert.equal(live.stdout.trim(), 'LIVE');
  const lapsed = cli('check', '--current', file('blocked.json', goal('Watch ids: a/b#1', 'blocked')));
  assert.equal(lapsed.status, 2);
  assert.match(lapsed.stdout, /^LAPSED: the goal is blocked/);
});

test('CLI plan prints the planned JSON for a valid objective and exits 2 when it names no watch id', () => {
  const current = file('none.json', { goal: null });
  const ok = cli('plan', '--current', current, '--objective', file('ok.txt', 'Watch.\nWatch ids: a/b#1'));
  assert.equal(ok.status, 0);
  const planned = JSON.parse(ok.stdout);
  assert.equal(planned.action, 'create');
  assert.deepEqual(planned.ids, ['a/b#1']);
  const refused = cli('plan', '--current', current, '--objective', file('bad.txt', 'keep watching'));
  assert.equal(refused.status, 2);
  assert.match(JSON.parse(refused.stdout).refused, /no watch id/);
});

test('CLI verify accepts the readback of its own plan and rejects a different one', () => {
  const current = file('none2.json', { goal: null });
  const planned = cli('plan', '--current', current, '--objective', file('o.txt', 'Watch ids: a/b#1'));
  const planFile = file('plan.json', planned.stdout);
  const armed = cli('verify', '--plan', planFile, '--readback', file('r1.json', goal(JSON.parse(planned.stdout).objective)));
  assert.equal(armed.status, 0);
  assert.equal(armed.stdout.trim(), 'ARMED');
  const mismatch = cli('verify', '--plan', planFile, '--readback', file('r2.json', goal('Watch ids: a/b#2')));
  assert.equal(mismatch.status, 2);
  assert.match(mismatch.stdout, /^MISMATCH: .*differs/);
});

test('CLI without a subcommand or its required options is a usage error and exits 1', () => {
  assert.equal(cli().status, 1);
  const missing = cli('plan', '--current', file('c.json', { goal: null }));
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /^Name plan, verify or check/);
  assert.equal(cli('--help').status, 0);
});
