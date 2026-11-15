import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const skill = dirname(dirname(fileURLToPath(import.meta.url)));
const root = mkdtempSync(join(tmpdir(), 'workflow-plan-'));
const linkRoot = mkdtempSync(join(tmpdir(), 'workflow-plan-link-'));
// Every call goes through a link to the skill folder, the way an installed skill is reached.
const link = join(linkRoot, 're0-workflow');
symlinkSync(skill, link, process.platform === 'win32' ? 'junction' : 'dir');
test.after(() => {
  rmSync(root, { recursive: true, force: true });
  rmSync(linkRoot, { recursive: true, force: true });
});

let count = 0;
function cli(plan, ...flags) {
  const file = join(root, 'plan-' + count++ + '.json');
  writeFileSync(file, typeof plan === 'string' ? plan : JSON.stringify(plan));
  const run = spawnSync(process.execPath, [join(link, 'scripts', 'plan.mjs'), file, '--json', ...flags], { encoding: 'utf8' });
  return { status: run.status, rules: run.status === 2 ? [] : JSON.parse(run.stdout).problems.map((p) => p.rule), stdout: run.stdout, stderr: run.stderr };
}

const step = (id, target, predecessors, serves, extra = {}) => ({ id, target, predecessors, serves, type: 'invoke-model-skill', precondition: 'its predecessors produced their output', output: 'what the skill-a contract returns', skippable: 'never', cost_owner: 'run', writes: false, lane: 'model', ...extra });

// A request read back into three requirements: rewrite a section, check its claims, publish it.
function valid() {
  return {
    intent: 'rewrite the setup section, check it, then publish it',
    understood_as: 'understood as: rewrite one section, verify its claims, then hand the publish to the human',
    requirements: [{ id: 'r1', text: 'rewrite the setup section' }, { id: 'r2', text: 'check its claims' }, { id: 'r3', text: 'publish it' }],
    steps: [
      step('s1', 'readback', [], []),
      step('s2', 'skill-a', ['s1'], ['r1'], { writes: true }),
      step('s3', 'sip', ['s2'], ['r1']),
      step('s4', 'skill-b', ['s3'], ['r2']),
      step('s5', 'skill-c', ['s3', 's4'], ['r3'], { type: 'user-handoff', cost_owner: 'human', lane: 'user', destructive: true, handoff: 'type /skill-c', bring_back: 'the published version' }),
    ],
    stop: 'the section is published with its claims checked',
  };
}
const at = (plan, id) => plan.steps.find((s) => s.id === id);
function planted(edit) {
  const plan = valid();
  edit(plan);
  return cli(plan);
}

test('a valid plan passes', () => {
  const run = cli(valid());
  assert.equal(run.status, 0, run.stdout);
  assert.deepEqual(run.rules, []);
});

test('readback first: removing the readback step fails', () => {
  const run = planted((p) => {
    p.steps = p.steps.filter((s) => s.target !== 'readback');
    at(p, 's2').predecessors = [];
  });
  assert.equal(run.status, 1);
  assert.deepEqual(run.rules, ['readback-first']);
});

test('readback first: a readback with a predecessor, or a step that does not follow it, fails', () => {
  assert.ok(planted((p) => { at(p, 's1').predecessors = ['s4']; }).rules.includes('readback-first'));
  assert.deepEqual(planted((p) => { at(p, 's4').predecessors = []; }).rules, ['readback-first']);
});

test('readback first: a skip reason outside the list fails, single-named-step on a one-step plan passes', () => {
  assert.deepEqual(planted((p) => { p.steps = p.steps.filter((s) => s.target !== 'readback'); at(p, 's2').predecessors = []; p.readback_skip = 'obvious'; }).rules, ['readback-first']);
  const one = valid();
  one.readback_skip = 'single-named-step';
  one.requirements = [one.requirements[0]];
  one.steps = [step('s2', 'skill-a', [], ['r1'], { writes: true }), step('s3', 'sip', ['s2'], ['r1'])];
  assert.equal(cli(one).status, 0);
  one.requirements.push({ id: 'r2', text: 'a second ask' });
  one.steps.push(step('s4', 'skill-b', ['s3'], ['r2']));
  assert.deepEqual(cli(one).rules, ['readback-first']);
});

test('readback first: a missing readback stays as a skip and its dependents still run', () => {
  assert.equal(planted((p) => { Object.assign(at(p, 's1'), { type: 'skip', cost_owner: 'none', lane: 'missing', reason: 'readback is not installed' }); }).status, 0);
});

test('requirements: an unmapped requirement fails unless recorded as unmet', () => {
  assert.deepEqual(planted((p) => { p.requirements.push({ id: 'r4', text: 'translate it' }); }).rules, ['requirement']);
  assert.equal(planted((p) => { p.requirements.push({ id: 'r4', text: 'translate it', unmet: 'no installed skill translates' }); }).status, 0);
});

test('requirements: one served only by skipped steps must be recorded as unmet', () => {
  const edit = (p) => {
    Object.assign(at(p, 's4'), { type: 'skip', cost_owner: 'none', lane: 'missing', reason: 'skill-b is not installed' });
    at(p, 's5').predecessors = ['s3'];
  };
  assert.deepEqual(planted(edit).rules, ['requirement']);
  assert.equal(planted((p) => { edit(p); p.requirements[1].unmet = 'skill-b is not installed'; }).status, 0);
});

test('requirements: a step that serves none, or an unknown one, fails', () => {
  assert.deepEqual(planted((p) => { at(p, 's4').serves = []; p.requirements[1].unmet = 'dropped'; }).rules, ['serves']);
  assert.deepEqual(planted((p) => { at(p, 's4').serves = ['r2', 'r9']; }).rules, ['requirement']);
});

test('cycle: steps that depend on each other fail and the loop is named', () => {
  const run = planted((p) => { at(p, 's2').predecessors = ['s1', 's4']; });
  assert.ok(run.rules.includes('cycle'));
  assert.match(run.stdout, /s2 -> s4 -> s3 -> s2|s4 -> s3 -> s2 -> s4|s3 -> s2 -> s4 -> s3/);
});

test('user-only: a user-invoked target typed invoke-model-skill fails, even as one of a conditional step\'s types', () => {
  assert.deepEqual(planted((p) => { Object.assign(at(p, 's4'), { lane: 'user' }); }).rules, ['user-only']);
  assert.deepEqual(planted((p) => { Object.assign(at(p, 's5'), { type: ['user-handoff', 'invoke-model-skill'], destructive: false }); }).rules, ['user-only']);
});

test('sip: a writing run step with no sip after it fails; a pipeline that runs sip itself passes', () => {
  const drop = (p) => {
    p.steps = p.steps.filter((s) => s.id !== 's3');
    at(p, 's4').predecessors = ['s2'];
    at(p, 's5').predecessors = ['s4'];
  };
  assert.deepEqual(planted(drop).rules, ['sip']);
  assert.equal(planted((p) => { drop(p); at(p, 's2').members = ['skill-x', 'sip']; }).status, 0);
});

test('sip: a step the human or the session performs that writes also needs a sip after it', () => {
  assert.deepEqual(planted((p) => { at(p, 's5').writes = true; }).rules, ['sip']);
  assert.equal(planted((p) => {
    at(p, 's5').writes = true;
    p.steps.push(step('s6', 'sip', ['s5'], ['r3']));
  }).status, 0);
});

test('session step: work no skill covers runs as the session\'s own step, never on a skill lane and never destructive', () => {
  const session = { type: 'session-step', target: 'rebase the branch locally', lane: 'none' };
  assert.equal(planted((p) => { Object.assign(at(p, 's2'), session); }).status, 0);
  assert.deepEqual(planted((p) => { Object.assign(at(p, 's2'), session, { lane: 'model' }); }).rules, ['session']);
  assert.deepEqual(planted((p) => { Object.assign(at(p, 's2'), session, { destructive: true }); }).rules, ['destructive']);
  assert.deepEqual(planted((p) => { Object.assign(at(p, 's2'), session, { writes: true }); p.steps = p.steps.filter((s) => s.id !== 's3'); at(p, 's4').predecessors = ['s2']; at(p, 's5').predecessors = ['s4']; }).rules, ['sip']);
  assert.deepEqual(planted((p) => { at(p, 's4').lane = 'none'; }).rules, ['session']);
});

test('sequence: a step listed before its predecessor fails', () => {
  assert.deepEqual(planted((p) => { p.steps = [p.steps[0], p.steps[2], p.steps[1], ...p.steps.slice(3)]; }).rules, ['sequence']);
});

test('stop: a missing stop condition or two of them fail', () => {
  assert.deepEqual(planted((p) => { delete p.stop; }).rules, ['stop']);
  assert.deepEqual(planted((p) => { p.stop = ['published', 'checked']; }).rules, ['stop']);
});

test('typing: a wrong cost owner, a missing skill that runs, a destructive run step or a self target fails', () => {
  assert.deepEqual(planted((p) => { at(p, 's4').cost_owner = 'human'; }).rules, ['cost']);
  assert.deepEqual(planted((p) => { Object.assign(at(p, 's4'), { type: ['user-handoff', 'invoke-model-skill'], handoff: 'decide', bring_back: 'the answer' }); }).rules, ['cost']);
  assert.deepEqual(planted((p) => { at(p, 's4').lane = 'missing'; }).rules, ['missing']);
  assert.deepEqual(planted((p) => { at(p, 's4').destructive = true; }).rules, ['destructive']);
  assert.deepEqual(planted((p) => { at(p, 's4').target = 'paperthin'; }).rules, ['self']);
});

test('skip and handoff: a skip without a reason, a skip whose dependent runs, or a handoff without its fields fails', () => {
  const skip = { type: 'skip', cost_owner: 'none', lane: 'missing' };
  assert.deepEqual(planted((p) => { Object.assign(at(p, 's4'), skip); p.requirements[1].unmet = 'missing'; }).rules, ['skip', 'skip']);
  const propagated = planted((p) => { Object.assign(at(p, 's4'), skip, { reason: 'skill-b is not installed' }); p.requirements[1].unmet = 'missing'; });
  assert.deepEqual(propagated.rules, ['skip']);
  assert.match(propagated.stdout, /s5/);
  assert.deepEqual(planted((p) => { delete at(p, 's5').bring_back; }).rules, ['handoff']);
});

test('outside eyes: a judgment-only step with no outside read after it fails', () => {
  assert.deepEqual(planted((p) => { at(p, 's4').judgment_only = true; }).rules, ['outside']);
  assert.equal(planted((p) => { at(p, 's2').judgment_only = true; }).status, 0);
});

test('pipeline: a member of a pipeline step reproduced for the same requirement fails', () => {
  assert.deepEqual(planted((p) => { at(p, 's2').members = ['skill-b']; at(p, 's4').serves = ['r1', 'r2']; }).rules, ['pipeline']);
  assert.equal(planted((p) => { at(p, 's2').members = ['skill-b']; }).status, 0);
});

test('reject and shape: a reject with steps, or a plan without its understood-as line, fails', () => {
  assert.deepEqual(planted((p) => { p.reject = 'skill-a -> skill-b -> skill-a'; delete p.stop; }).rules, ['reject']);
  const reject = valid();
  reject.steps = [reject.steps[0]];
  reject.requirements = reject.requirements.map((r) => ({ ...r, unmet: 'the request is cyclic' }));
  reject.reject = 'skill-a -> skill-b -> skill-a';
  delete reject.stop;
  assert.equal(cli(reject).status, 0);
  assert.deepEqual(planted((p) => { delete p.understood_as; }).rules, ['shape']);
});

// A run that stopped at the handoff: the first steps ran, the handoff waits on the human.
function report() {
  const plan = valid();
  for (const id of ['s1', 's2', 's3', 's4']) Object.assign(at(plan, id), { outcome: 'ran', result: 'done' });
  Object.assign(at(plan, 's5'), { outcome: 'handed-off', result: 'asked the human to type /skill-c' });
  plan.requirements[0].status = 'served';
  plan.requirements[1].status = 'served';
  plan.requirements[2].status = 'handed-off';
  plan.stop_reached = false;
  return plan;
}
const reported = (edit) => {
  const plan = report();
  edit(plan);
  return cli(plan, '--report');
};

test('report: a run that stopped at its handoff passes, and a plan without outcomes fails as a report', () => {
  assert.equal(cli(report(), '--report').status, 0);
  assert.equal(cli(valid(), '--report').status, 1);
});

test('report: a step that ran after the stop, or two stops, fails', () => {
  assert.deepEqual(reported((p) => { at(p, 's3').outcome = 'waiting'; p.requirements[0].status = 'waiting'; }).rules, ['order']);
  assert.ok(reported((p) => { at(p, 's4').outcome = 'failed'; }).rules.includes('order'));
  assert.deepEqual(reported((p) => { at(p, 's4').outcome = 'handed-off'; p.requirements[1].status = 'handed-off'; at(p, 's5').outcome = 'waiting'; p.requirements[2].status = 'waiting'; }).rules, ['outcome']);
});

test('report: a status the outcomes do not back, or a stop claimed reached while a step waits, fails', () => {
  assert.deepEqual(reported((p) => { p.requirements[2].status = 'served'; }).rules, ['status']);
  assert.deepEqual(reported((p) => { p.requirements[2].status = 'unmet'; }).rules, ['status']);
  assert.deepEqual(reported((p) => { p.stop_reached = true; }).rules, ['stop-reached']);
  assert.deepEqual(reported((p) => { at(p, 's5').outcome = 'ran'; p.requirements[2].status = 'served'; }).rules, ['outcome']);
});

test('report: a requirement whose steps wait behind the stop is waiting, and served needs every serving step closed', () => {
  const stopEarly = (p) => {
    Object.assign(at(p, 's4'), { type: 'user-handoff', cost_owner: 'human', lane: 'user', handoff: 'decide the claims', bring_back: 'the verdict', outcome: 'handed-off', result: 'asked the human' });
    Object.assign(at(p, 's5'), { outcome: 'waiting' });
    delete at(p, 's5').result;
    p.requirements[1].status = 'handed-off';
  };
  assert.deepEqual(reported((p) => { stopEarly(p); p.requirements[2].status = 'waiting'; }).rules, []);
  assert.deepEqual(reported((p) => { stopEarly(p); p.requirements[2].status = 'handed-off'; }).rules, ['status']);
  assert.deepEqual(reported((p) => { stopEarly(p); p.requirements[2].status = 'waiting'; at(p, 's3').outcome = 'waiting'; delete at(p, 's3').result; }).rules.filter((r) => r === 'status'), ['status']);
});

test('usage: no file, an unreadable file or invalid JSON exits 2', () => {
  assert.equal(spawnSync(process.execPath, [join(link, 'scripts', 'plan.mjs')], { encoding: 'utf8' }).status, 2);
  assert.equal(spawnSync(process.execPath, [join(link, 'scripts', 'plan.mjs'), join(root, 'absent.json')], { encoding: 'utf8' }).status, 2);
  assert.equal(cli('{not json').status, 2);
});
