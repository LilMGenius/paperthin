import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const skill = dirname(dirname(fileURLToPath(import.meta.url)));
// Every call goes through a link to the skill folder, the way an installed skill is reached.
const linkRoot = mkdtempSync(join(tmpdir(), 'workflow-plan-link-'));
const link = join(linkRoot, 're0-workflow');
symlinkSync(skill, link, process.platform === 'win32' ? 'junction' : 'dir');
test.after(() => rmSync(linkRoot, { recursive: true, force: true }));

const script = join(link, 'scripts', 'plan.mjs');
function cli(plan, ...flags) {
  const run = spawnSync(process.execPath, [script, '--json', ...flags], { input: typeof plan === 'string' ? plan : JSON.stringify(plan), encoding: 'utf8' });
  return { status: run.status, rules: run.status === 2 ? [] : JSON.parse(run.stdout).problems.map((p) => p.rule), stdout: run.stdout };
}

// The closing sip writes, since its cleanup pass edits the changed docs.
const step = (id, target, predecessors, serves, extra = {}) => ({ id, target, predecessors, serves, type: 'invoke-model-skill', precondition: 'its predecessors produced their output', output: 'what the skill contract returns', skippable: 'never', cost_owner: 'run', writes: extra.added === 'sip', lane: 'model', ...(extra.added === 'sip' ? { members: ['shower', 'factchk', 'ssotize', 're0'] } : {}), ...extra });
const skip = { type: 'skip', cost_owner: 'none', lane: 'missing', searched: 'the installed roster' };
const handoff = { type: 'user-handoff', cost_owner: 'human', lane: 'user', destructive: true, handoff: 'type /skill-c', bring_back: 'the published version' };

// A request read into three requirements: rewrite a section, check its claims, publish it. One sip closes the writing stretch before the handoff.
function valid() {
  return {
    intent: 'rewrite the setup section, check it, then publish it',
    readback: 'applied',
    understood_as: 'understood as: rewrite one section, verify its claims, then hand the publish to the human',
    requirements: [{ id: 'r1', text: 'rewrite the setup section' }, { id: 'r2', text: 'check its claims' }, { id: 'r3', text: 'publish it' }],
    steps: [
      step('s1', 'skill-a', [], ['r1'], { writes: true }),
      step('s2', 'skill-b', ['s1'], ['r2']),
      step('s3', 'sip', ['s2'], ['r1'], { added: 'sip' }),
      step('s4', 'skill-c', ['s3'], ['r3'], handoff),
    ],
    stop: 'the section is published with its claims checked',
  };
}
const at = (plan, id) => plan.steps.find((s) => s.id === id);
function planted(edit, ...flags) {
  const plan = valid();
  edit(plan);
  return cli(plan, ...flags);
}

test('a valid plan passes', () => {
  const run = cli(valid());
  assert.equal(run.status, 0, run.stdout);
});

test('readback: listing the readback as a plan step, or leaving how the intent was read unstated, fails', () => {
  assert.deepEqual(planted((p) => { p.steps.unshift(step('s0', 'readback', [], ['r1'])); at(p, 's1').predecessors = ['s0']; }).rules, ['readback']);
  assert.deepEqual(planted((p) => { delete p.readback; }).rules, ['readback']);
  assert.equal(planted((p) => { p.readback = 'missing'; }).status, 0);
  assert.deepEqual(planted((p) => { p.readback = 'ran'; }).rules, ['readback']);
});

test('readback: single-named-step holds for one action and its closing sip, never for two actions', () => {
  const one = valid();
  one.readback = 'single-named-step';
  one.requirements = [one.requirements[0]];
  one.steps = [step('s1', 'skill-a', [], ['r1'], { writes: true }), step('s2', 'sip', ['s1'], ['r1'], { added: 'sip' })];
  assert.equal(cli(one).status, 0);
  one.steps.splice(1, 0, step('s9', 'skill-b', ['s1'], ['r1']));
  one.steps[2].predecessors = ['s9'];
  assert.deepEqual(cli(one).rules, ['readback']);
});

test('no-match: a plan with no action fails, since a no-match is a plain report', () => {
  assert.deepEqual(planted((p) => { p.steps = []; p.requirements.forEach((r) => { r.unmet = 'no installed skill serves it'; }); }).rules, ['no-match']);
});

test('no-match: a plan of session steps alone is a no-match, and one skill step makes the session work connective', () => {
  const session = () => ({ type: 'session-step', target: 'work no skill covers', lane: 'none' });
  const alone = (p) => { p.requirements = [p.requirements[0]]; p.steps = [step('s1', 'x', [], ['r1'], { ...session(), writes: false })]; };
  assert.deepEqual(planted(alone).rules, ['no-match']);
  assert.equal(planted((p) => { Object.assign(at(p, 's1'), session()); }).status, 0);
});

test('requirements: an unmapped one fails unless recorded as unmet, and one only skips serve is unmet', () => {
  assert.deepEqual(planted((p) => { p.requirements.push({ id: 'r4', text: 'translate it' }); }).rules, ['requirement']);
  assert.equal(planted((p) => { p.requirements.push({ id: 'r4', text: 'translate it', unmet: 'no installed skill translates' }); }).status, 0);
  const skipped = (p) => Object.assign(at(p, 's2'), skip, { reason: 'skill-b is not installed' });
  assert.ok(planted(skipped).rules.includes('requirement'));
  assert.equal(planted((p) => { skipped(p); p.requirements[1].unmet = 'skill-b is not installed'; at(p, 's3').predecessors = ['s1']; }).status, 0);
});

test('requirements: a step that serves none fails', () => {
  assert.deepEqual(planted((p) => { at(p, 's2').serves = []; p.requirements[1].unmet = 'dropped'; }).rules, ['serves']);
});

test('requirements: one recorded as unmet while a step that runs still serves it fails', () => {
  assert.deepEqual(planted((p) => { p.requirements[1].unmet = 'nothing serves it'; }).rules, ['requirement']);
});

test('cycle: steps that depend on each other fail, and the cycle is named in run order', () => {
  const run = planted((p) => { at(p, 's1').predecessors = ['s2']; });
  assert.ok(run.rules.includes('cycle'));
  assert.match(run.stdout, /s1 requires s2 requires s1/);
});

test('sequence: a step listed before its predecessor fails', () => {
  assert.deepEqual(planted((p) => { p.steps = [p.steps[1], p.steps[0], ...p.steps.slice(2)]; }).rules, ['sequence']);
});

test('user-only: a user-invoked target the session could run fails, even as one of a conditional step\'s types', () => {
  assert.deepEqual(planted((p) => { at(p, 's2').lane = 'user'; }).rules, ['user-only']);
  assert.deepEqual(planted((p) => { Object.assign(at(p, 's4'), { type: ['user-handoff', 'invoke-model-skill'], destructive: false }); }).rules, ['user-only']);
});

test('user-only: a step holding a user-only member is user work on lane user', () => {
  const pipeline = { members: ['skill-x', 'skill-y'], user_members: ['skill-y'] };
  assert.deepEqual(planted((p) => { Object.assign(at(p, 's2'), pipeline); }).rules, ['user-only']);
  assert.equal(planted((p) => { Object.assign(at(p, 's4'), pipeline); }).status, 0);
  assert.deepEqual(planted((p) => { Object.assign(at(p, 's4'), pipeline, { user_members: ['skill-q'] }); }).rules, ['shape']);
});

test('sip: a writing stretch needs exactly one closing sip after every write', () => {
  const drop = (p) => { p.steps = p.steps.filter((s) => s.id !== 's3'); at(p, 's4').predecessors = ['s2']; };
  assert.deepEqual(planted(drop).rules, ['sip']);
  assert.deepEqual(planted((p) => { p.steps.splice(3, 0, step('s5', 'sip', ['s3'], ['r1'], { added: 'sip' })); at(p, 's4').predecessors = ['s5']; }).rules, ['sip']);
  assert.deepEqual(planted((p) => { p.steps = [p.steps[0], p.steps[2], p.steps[1], p.steps[3]]; at(p, 's3').predecessors = ['s1']; at(p, 's2').predecessors = ['s3']; at(p, 's2').writes = true; at(p, 's4').predecessors = ['s2']; }).rules, ['sip']);
  assert.deepEqual(planted((p) => { at(p, 's3').predecessors = []; p.steps = [p.steps[2], p.steps[0], p.steps[1], p.steps[3]]; at(p, 's4').predecessors = ['s3', 's2']; p.steps = [p.steps[1], p.steps[2], p.steps[0], p.steps[3]]; }).rules, ['sip']);
  assert.equal(planted((p) => { drop(p); at(p, 's1').members = ['skill-x', 'sip']; }).status, 0);
});

test('sip: stretches split on each step\'s expected type, so only an expected handoff ends one', () => {
  const conditional = (first) => (p) => Object.assign(at(p, 's2'), { type: first === 'run' ? ['invoke-model-skill', 'user-handoff'] : ['user-handoff', 'invoke-model-skill'], cost_owner: first === 'run' ? 'run' : 'human', writes: true, handoff: 'decide the claims', bring_back: 'the verdict' });
  assert.equal(planted(conditional('run')).status, 0);
  const split = planted(conditional('handoff'));
  assert.ok(split.rules.includes('sip'));
  assert.match(split.stdout, /the stretch writing s1 needs exactly one closing sip, found 0/);
});

test('sip: an added sip in a stretch that writes nothing is padding', () => {
  assert.deepEqual(planted((p) => { at(p, 's1').writes = false; }).rules, ['sip']);
});

test('sip: a human step that writes is closed by a sip once its result returns', () => {
  assert.deepEqual(planted((p) => { at(p, 's4').writes = true; }).rules, ['sip']);
  assert.equal(planted((p) => { at(p, 's4').writes = true; p.steps.push(step('s5', 'sip', ['s4'], ['r3'], { added: 'sip' })); }).status, 0);
});

test('added: an added check names the skill it adds', () => {
  assert.deepEqual(planted((p) => { at(p, 's3').target = 'shower'; }).rules, ['added', 'sip']);
});

test('added: the closing sip writes, so a closing sip marked as not writing fails', () => {
  assert.deepEqual(planted((p) => { at(p, 's3').writes = false; }).rules, ['added']);
});

test('added: the closing sip lists the checks it runs, so none of its calls is unshown', () => {
  assert.deepEqual(planted((p) => { delete at(p, 's3').members; }).rules, ['added']);
  assert.deepEqual(planted((p) => { at(p, 's3').members = []; }).rules, ['added']);
});

test('outside read: a delivered judgment no sip tastes gets exactly one, and never both', () => {
  const judged = (p) => { p.steps = p.steps.filter((s) => s.id !== 's3'); at(p, 's1').writes = false; at(p, 's2').judgment_only = true; at(p, 's4').predecessors = ['s2']; };
  assert.deepEqual(planted(judged).rules, ['outside']);
  const read = (p) => { judged(p); p.steps.splice(2, 0, step('s5', 'shower', ['s2'], ['r2'], { added: 'outside-read' })); at(p, 's4').predecessors = ['s5']; };
  assert.equal(planted(read).status, 0);
  assert.deepEqual(planted((p) => { at(p, 's2').judgment_only = true; p.steps.splice(3, 0, step('s5', 'shower', ['s3'], ['r2'], { added: 'outside-read' })); at(p, 's4').predecessors = ['s5']; }).rules, ['outside']);
  assert.deepEqual(planted((p) => { read(p); delete at(p, 's2').judgment_only; }).rules, ['outside']);
});

test('outside read: a sip tastes a judgment only when it comes after it in the same stretch, and a read serves only the judgment', () => {
  const late = (p) => { p.steps.push(step('s5', 'skill-d', ['s4'], ['r3'], { judgment_only: true })); };
  assert.deepEqual(planted(late).rules, ['outside']);
  const readLate = (serves) => (p) => { late(p); p.steps.push(step('s6', 'factchk', ['s5'], serves, { added: 'outside-read', writes: false })); };
  assert.equal(planted(readLate(['r3'])).status, 0);
  assert.deepEqual(planted(readLate(['r1'])).rules, ['outside']);
});

test('outside read: a sip listed before a judgment does not taste it', () => {
  const early = (p) => {
    p.requirements = p.requirements.slice(0, 2);
    p.steps = [step('s1', 'sip', [], ['r1'], { writes: true }), step('s2', 'skill-b', ['s1'], ['r2'], { judgment_only: true })];
  };
  assert.deepEqual(planted(early).rules, ['outside']);
  assert.equal(planted((p) => { early(p); p.steps.push(step('s3', 'shower', ['s2'], ['r2'], { added: 'outside-read' })); }).status, 0);
});

test('judgment: a delivered judgment that writes fails', () => {
  assert.deepEqual(planted((p) => { Object.assign(at(p, 's1'), { judgment_only: true }); }).rules, ['judgment']);
});

test('stop: a missing stop condition or two of them fail', () => {
  assert.deepEqual(planted((p) => { delete p.stop; }).rules, ['stop']);
  assert.deepEqual(planted((p) => { p.stop = ['published', 'checked']; }).rules, ['stop']);
});

test('typing: a wrong cost owner, a missing skill that runs, a destructive run step or a self target fails', () => {
  assert.deepEqual(planted((p) => { at(p, 's2').cost_owner = 'human'; }).rules, ['cost']);
  assert.deepEqual(planted((p) => { Object.assign(at(p, 's2'), { lane: 'missing', searched: 'the installed roster' }); }).rules, ['missing']);
  assert.deepEqual(planted((p) => { at(p, 's2').destructive = true; }).rules, ['destructive']);
  assert.deepEqual(planted((p) => { at(p, 's2').target = 'paperthin'; }).rules, ['self']);
});

test('session step: work no skill covers is the session\'s own step, never on a skill lane and never destructive', () => {
  const session = { type: 'session-step', target: 'rebase the branch locally', lane: 'none' };
  assert.equal(planted((p) => { Object.assign(at(p, 's1'), session); }).status, 0);
  assert.deepEqual(planted((p) => { Object.assign(at(p, 's1'), session, { lane: 'model' }); }).rules, ['session']);
  assert.deepEqual(planted((p) => { Object.assign(at(p, 's1'), session, { destructive: true }); }).rules, ['destructive']);
  assert.deepEqual(planted((p) => { at(p, 's2').lane = 'none'; }).rules, ['session']);
});

test('skip: a skip needs a reason, its dependents are skipped too, and they inherit its reason', () => {
  // skill-a is missing, so the write never happens and no sip closes the stretch; the handoff does not need its output.
  const lose = (p) => {
    Object.assign(at(p, 's1'), skip, { reason: 'skill-a is not installed' });
    p.requirements[0].unmet = 'skill-a is not installed';
    p.steps = p.steps.filter((s) => s.id !== 's3');
    at(p, 's4').predecessors = [];
  };
  assert.ok(planted((p) => { lose(p); delete at(p, 's1').reason; }).rules.includes('skip'));
  assert.ok(planted(lose).rules.includes('skip'));
  const inherit = (reason) => (p) => { lose(p); Object.assign(at(p, 's2'), skip, { lane: 'model', reason }); p.requirements[1].unmet = 'its input is missing'; };
  assert.deepEqual(planted(inherit('nothing to check')).rules, ['skip']);
  assert.equal(planted(inherit('needs the output of s1, skill-a is not installed')).status, 0);
  assert.deepEqual(planted((p) => { inherit('lost s10')(p); }).rules, ['skip']);
});

test('pipeline: a member of a pipeline step reproduced for the same requirement fails', () => {
  assert.deepEqual(planted((p) => { at(p, 's1').members = ['skill-b']; at(p, 's2').serves = ['r1', 'r2']; }).rules, ['pipeline']);
  assert.equal(planted((p) => { at(p, 's1').members = ['skill-b']; }).status, 0);
});

test('reject: a plan carrying a reject fails, since a cycle is reported to the human and never checked', () => {
  assert.deepEqual(planted((p) => { at(p, 's1').predecessors = ['s2']; p.reject = 'skill-a requires skill-b requires skill-a'; delete p.stop; }).rules, ['reject']);
});

test('examples: the plan and the report in SKILL.md pass their checks as written', () => {
  const blocks = [...readFileSync(join(link, 'SKILL.md'), 'utf8').matchAll(/```json\n([\s\S]*?)```/g)].map((m) => m[1]);
  assert.equal(blocks.length, 2);
  assert.equal(cli(blocks[0]).status, 0);
  assert.equal(cli(blocks[1], '--report').status, 0);
});

test('shape: a plan without its understood-as line fails', () => {
  assert.deepEqual(planted((p) => { delete p.understood_as; }).rules, ['shape']);
});

// A run that stopped at the handoff after the approved writes ran.
function report() {
  const plan = valid();
  plan.approval = 'approved';
  for (const id of ['s1', 's2', 's3']) Object.assign(at(plan, id), { outcome: 'ran', result: 'done' });
  Object.assign(at(plan, 's4'), { outcome: 'handed-off', result: 'asked the human to type /skill-c' });
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

test('report: a run stopped at its handoff passes, and a plan without outcomes fails as a report', () => {
  assert.equal(cli(report(), '--report').status, 0);
  assert.equal(cli(valid(), '--report').status, 1);
});

test('report: a step that ran after the stop, or two stops, fails', () => {
  assert.deepEqual(reported((p) => { at(p, 's2').outcome = 'waiting'; p.requirements[1].status = 'waiting'; }).rules, ['order']);
  assert.ok(reported((p) => { at(p, 's2').outcome = 'failed'; }).rules.includes('order'));
});

test('report: no step after the first stop shows ran, while a skip from a broken precondition is no stop', () => {
  assert.ok(reported((p) => { at(p, 's2').predecessors = []; Object.assign(at(p, 's1'), { outcome: 'failed', result: 'no output' }); p.requirements[0].status = 'unmet'; p.requirements[0].reason = 's1 failed'; }).rules.includes('order'));
  const after = (p) => { p.steps.push(step('s5', 'skill-d', [], ['r3'], { outcome: 'ran', result: 'done' })); };
  assert.ok(reported(after).rules.includes('order'));
  assert.equal(reported((p) => { Object.assign(at(p, 's2'), { outcome: 'skipped', result: 'its precondition broke' }); at(p, 's3').predecessors = ['s1']; p.requirements[1].status = 'skipped'; p.requirements[1].reason = 's1 left nothing to check'; }).status, 0);
});

test('report: a step that depends on a step skipped at run time cannot have run', () => {
  const broke = (p) => { Object.assign(at(p, 's2'), { outcome: 'skipped', result: 'its precondition broke' }); p.requirements[1].status = 'skipped'; p.requirements[1].reason = 's1 left nothing to check'; };
  assert.ok(reported((p) => { broke(p); p.steps.splice(2, 0, step('s5', 'skill-d', ['s2'], ['r2'], { outcome: 'ran', result: 'done' })); }).rules.includes('order'));
  assert.equal(reported((p) => { broke(p); at(p, 's3').predecessors = ['s1']; }).status, 0);
});

test('report: a requirement only a missing skill serves is never served', () => {
  const missing = (p) => { Object.assign(at(p, 's2'), skip, { reason: 'skill-b is not installed', outcome: 'skipped', result: 'skill-b is not installed' }); at(p, 's3').predecessors = ['s1']; p.requirements[1].unmet = 'skill-b is not installed'; };
  assert.ok(reported((p) => { missing(p); p.requirements[1].status = 'served'; }).rules.includes('status'));
  assert.equal(reported((p) => { missing(p); p.requirements[1].status = 'unmet'; p.requirements[1].reason = 'skill-b is not installed'; }).status, 0);
  assert.ok(reported((p) => { missing(p); p.requirements[1].status = 'unmet'; p.requirements[1].reason = 'skill-b is not installed'; Object.assign(at(p, 's4'), { outcome: 'returned', result: 'published' }); p.requirements[2].status = 'served'; p.stop_reached = true; }).rules.includes('stop-reached'));
});

test('report: a missing closing check takes nothing from the steps after it', () => {
  const missing = (p) => { Object.assign(at(p, 's3'), skip, { reason: 'sip is not installed', writes: false, outcome: 'skipped', result: 'sip is not installed, so the write went untasted' }); delete at(p, 's3').members; };
  const back = (p) => { missing(p); Object.assign(at(p, 's4'), { outcome: 'returned', result: 'published' }); p.requirements[2].status = 'served'; };
  assert.equal(planted(missing).status, 0);
  assert.equal(reported(back).status, 0);
  assert.deepEqual(reported((p) => { back(p); p.stop_reached = true; }).rules, ['stop-reached']);
});

test('report: a status the outcomes do not back, or a stop claimed reached while a step waits, fails', () => {
  assert.deepEqual(reported((p) => { p.requirements[2].status = 'served'; }).rules, ['status']);
  assert.deepEqual(reported((p) => { p.requirements[2].status = 'unmet'; }).rules, ['status']);
  assert.deepEqual(reported((p) => { p.stop_reached = true; }).rules, ['stop-reached']);
  assert.deepEqual(reported((p) => { at(p, 's4').outcome = 'ran'; p.requirements[2].status = 'served'; }).rules, ['outcome']);
});

test('report: writes run only under approval, and a pending plan runs nothing', () => {
  assert.deepEqual(reported((p) => { p.approval = 'not-needed'; }).rules, ['approval']);
  assert.deepEqual(reported((p) => { p.approval = 'pending'; }).rules, ['approval']);
  const order = (p) => { p.approval = 'pending'; for (const s of p.steps) { s.outcome = 'waiting'; delete s.result; } p.requirements.forEach((r) => { r.status = 'waiting'; }); };
  assert.equal(reported(order).status, 0);
  assert.ok(reported((p) => { order(p); Object.assign(at(p, 's1'), { outcome: 'ran', result: 'done' }); }).rules.includes('approval'));
});

test('usage: a file path, extra arguments or invalid JSON exits 2, and - reads stdin', () => {
  assert.equal(spawnSync(process.execPath, [script, 'plan.json'], { input: '{}', encoding: 'utf8' }).status, 2);
  assert.equal(cli('{not json').status, 2);
  assert.equal(spawnSync(process.execPath, [script, '-'], { input: JSON.stringify(valid()), encoding: 'utf8' }).status, 0);
});

test('usage: an empty pipe or a terminal on stdin exits 2 at once instead of waiting', async () => {
  const empty = spawnSync(process.execPath, [script, '-'], { input: '', encoding: 'utf8', timeout: 10000 });
  assert.equal(empty.status, 2);
  assert.match(empty.stderr, /no plan on stdin/);
  const { main } = await import(pathToFileURL(script).href);
  let read = false;
  const quiet = console.error;
  console.error = () => {};
  try {
    assert.equal(main(['-'], () => { read = true; return ''; }, true), 2);
  } finally {
    console.error = quiet;
  }
  assert.equal(read, false);
});


test('pipeline: the closing sip lists its checks without reproducing a step that runs one of them', () => {
  assert.equal(planted((p) => { at(p, 's1').target = 're0'; }).status, 0);
});

test('sip: a missing closing sip is a plain skip and tastes no judgment', () => {
  const missing = (p) => { Object.assign(at(p, 's3'), skip, { reason: 'sip is not installed', writes: false }); delete at(p, 's3').members; };
  assert.equal(planted(missing).status, 0);
  assert.deepEqual(planted((p) => { missing(p); at(p, 's3').members = ['shower']; }).rules, ['added']);
  assert.deepEqual(planted((p) => { missing(p); at(p, 's2').judgment_only = true; }).rules, ['outside']);
});

test('outside read: a judgment that is itself an outside read needs no second one', () => {
  const alone = (p) => { p.requirements = [p.requirements[0]]; p.steps = [step('s1', 'factchk', [], ['r1'], { judgment_only: true })]; };
  assert.equal(planted(alone).status, 0);
  assert.deepEqual(planted((p) => { alone(p); p.steps.push(step('s2', 'shower', ['s1'], ['r1'], { added: 'outside-read' })); }).rules, ['outside']);
});

test('report: the closing sip runs when any write it covers ran, and its skip then leaves the stop unreached', () => {
  const two = (p) => { at(p, 's2').writes = true; p.requirements[1].status = 'skipped'; p.requirements[1].reason = 'its precondition broke'; Object.assign(at(p, 's2'), { outcome: 'skipped', result: 'its precondition broke' }); };
  assert.equal(reported(two).status, 0);
  const done = (p) => { Object.assign(at(p, 's4'), { outcome: 'returned', result: 'published' }); p.requirements[2].status = 'served'; p.stop_reached = true; };
  assert.equal(reported((p) => { two(p); done(p); }).status, 0);
  assert.deepEqual(reported((p) => { two(p); done(p); Object.assign(at(p, 's3'), { outcome: 'skipped', result: 'skipped with s2' }); }).rules, ['stop-reached']);
});

test('report: a commit or history rewrite the session runs needs approval though no sip tastes it', () => {
  const commit = (p) => { p.steps.splice(3, 0, step('s5', 'commit the change', ['s3'], ['r1'], { type: 'session-step', lane: 'none', vcs: true, outcome: 'ran', result: 'committed' })); at(p, 's4').predecessors = ['s5']; };
  assert.equal(reported(commit).status, 0);
  assert.deepEqual(reported((p) => { commit(p); at(p, 's1').writes = false; p.steps = p.steps.filter((s) => s.id !== 's3'); at(p, 's5').predecessors = ['s2']; p.approval = 'not-needed'; }).rules, ['approval']);
});

test('report: a pending report keeps a skip step skipped, and order-only reports do not exist', () => {
  assert.deepEqual(reported((p) => { p.approval = 'order-only'; }).rules, ['approval']);
  const order = (p) => { p.approval = 'pending'; Object.assign(at(p, 's2'), skip, { reason: 'skill-b is not installed', outcome: 'skipped', result: 'skill-b is not installed' }); at(p, 's3').predecessors = ['s1']; p.requirements[1].unmet = 'skill-b is not installed'; p.requirements[1].status = 'unmet'; p.requirements[1].reason = 'skill-b is not installed'; for (const id of ['s1', 's3', 's4']) { at(p, id).outcome = 'waiting'; delete at(p, id).result; } p.requirements[0].status = 'waiting'; p.requirements[2].status = 'waiting'; };
  assert.equal(reported(order).status, 0);
  assert.deepEqual(reported((p) => { order(p); at(p, 's2').outcome = 'waiting'; delete at(p, 's2').result; }).rules, ['outcome']);
});

test('sip: a fixed write gets no closing sip, while it still needs approval', () => {
  const fixedOnly = (p) => { at(p, 's1').fixed = true; p.steps = p.steps.filter((s) => s.id !== 's3'); at(p, 's4').predecessors = ['s2']; };
  assert.equal(planted(fixedOnly).status, 0);
  assert.deepEqual(planted((p) => { at(p, 's1').fixed = true; }).rules, ['sip']);
  assert.deepEqual(planted((p) => { at(p, 's2').fixed = true; }).rules, ['fixed']);
  assert.deepEqual(reported((p) => { fixedOnly(p); p.approval = 'not-needed'; }).rules, ['approval']);
});

test('missing: a skill that is not installed is never offered as an invocation', () => {
  const absent = (p) => { Object.assign(at(p, 's2'), skip, { reason: 'skill-b is not installed' }); at(p, 's3').predecessors = ['s1']; p.requirements[1].unmet = 'skill-b is not installed'; };
  assert.equal(planted(absent).status, 0);
  assert.deepEqual(planted((p) => { absent(p); at(p, 's2').handoff = 'type /skill-b'; }).rules, ['missing']);
});

test('runs-last: a pass its contract runs last takes the sip before it and nothing rewrites after it', () => {
  const last = (p) => Object.assign(at(p, 's4'), { writes: true, runs_last: true });
  assert.equal(planted(last).status, 0);
  assert.ok(planted((p) => { last(p); p.steps.push(step('s5', 'sip', ['s4'], ['r3'], { added: 'sip' })); }).rules.includes('runs-last'));
  const inline = (p) => { Object.assign(at(p, 's2'), { writes: true, runs_last: true }); at(p, 's3').predecessors = ['s2']; };
  assert.ok(planted(inline).rules.includes('runs-last'));
  assert.equal(planted((p) => { Object.assign(at(p, 's1'), { runs_last: true }); p.steps = [p.steps[1], p.steps[2], p.steps[0], p.steps[3]]; at(p, 's1').predecessors = ['s3']; at(p, 's2').predecessors = []; at(p, 's3').predecessors = ['s2']; at(p, 's3').serves = ['r2']; at(p, 's2').writes = true; at(p, 's4').predecessors = ['s1']; }).status, 0);
});

test('sip: the closing sip still runs while a write it covers can, and is never typed skip then', () => {
  const lost = (p) => { p.steps.splice(1, 0, step('s5', 'skill-e', [], ['r2'], { type: 'skip', cost_owner: 'none', reason: 'its condition does not apply' })); at(p, 's3').predecessors = ['s2', 's5']; };
  assert.equal(planted(lost).status, 0);
  assert.deepEqual(planted((p) => { lost(p); Object.assign(at(p, 's3'), { type: 'skip', cost_owner: 'none', reason: 'follows s5', writes: false }); delete at(p, 's3').members; }).rules, ['added']);
});

test('report: the closing sip covers only its own stretch, a returned handoff write included', () => {
  const two = (p) => { at(p, 's4').writes = true; p.steps.push(step('s5', 'sip', ['s4'], ['r3'], { added: 'sip' })); };
  const back = (p) => { two(p); Object.assign(at(p, 's4'), { outcome: 'returned', result: 'published', check: 'match: the published version' }); p.requirements[2].status = 'served'; };
  assert.equal(reported((p) => { back(p); Object.assign(at(p, 's5'), { outcome: 'ran', result: 'tasted' }); p.stop_reached = true; }).status, 0);
  assert.deepEqual(reported((p) => { back(p); Object.assign(at(p, 's5'), { outcome: 'skipped', result: 'not run' }); p.stop_reached = true; }).rules, ['stop-reached']);
  assert.ok(reported((p) => { two(p); Object.assign(at(p, 's4'), { outcome: 'skipped', result: 'not needed' }); Object.assign(at(p, 's5'), { outcome: 'ran', result: 'tasted' }); p.requirements[2].status = 'skipped'; p.requirements[2].reason = 'not needed'; }).rules.includes('order'));
});

test('no-match: a request whose only skill is not installed is reported as not installed', () => {
  const run = planted((p) => { p.requirements = [{ id: 'r1', text: 'run it', unmet: 'skill-a is not installed' }]; p.steps = [step('s1', 'skill-a', [], ['r1'], { ...skip, reason: 'skill-a is not installed' })]; });
  assert.deepEqual(run.rules, ['no-match']);
  assert.match(run.stdout, /not installed/);
});

test('missing: a missing skill records where it was searched, and every dependent is a skip naming it', () => {
  const absent = (p) => { Object.assign(at(p, 's2'), skip, { reason: 'skill-b is not installed' }); at(p, 's3').predecessors = ['s1']; p.requirements[1].unmet = 'skill-b is not installed'; };
  assert.equal(planted(absent).status, 0);
  assert.deepEqual(planted((p) => { absent(p); delete at(p, 's2').searched; }).rules, ['missing']);
  assert.ok(planted((p) => { absent(p); at(p, 's3').predecessors = ['s1', 's2']; }).rules.includes('skip'));
});

test('report: a step after a returned handoff runs only once the returned result was checked', () => {
  const back = (p, check) => { at(p, 's4').writes = true; p.steps.push(step('s5', 'sip', ['s4'], ['r3'], { added: 'sip', outcome: 'ran', result: 'tasted' })); Object.assign(at(p, 's4'), { outcome: 'returned', result: 'published' }, check ? { check } : {}); p.requirements[2].status = 'served'; };
  assert.equal(reported((p) => back(p, 'match: the published version against the expected output')).status, 0);
  assert.deepEqual(reported((p) => back(p)).rules, ['returned']);
});

