import { test } from 'node:test';
import assert from 'node:assert/strict';
import { plan, verify, watchIds } from './goal-rearm.mjs';

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
