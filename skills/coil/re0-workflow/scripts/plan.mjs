#!/usr/bin/env node
// Check the plan re0-workflow writes before it shows a skill graph, and the same file once each step's outcome is recorded (--report).
// The plan is JSON: understood_as, requirements [{id, text, unmet?}], steps [{id, target, predecessors, type, precondition, output, skippable,
// cost_owner, serves, writes, lane, destructive?, judgment_only?, members?, reason?, handoff?, bring_back?}], stop, and optionally
// readback_skip or reject. A report adds outcome and result on each step, status and reason on each requirement, and stop_reached.
// Usage: node plan.mjs <plan-file> [--report] [--json]
// Exit codes: 0 every invariant holds; 1 one or more broken, each named; 2 usage error, unreadable file or invalid JSON.
import { readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const USAGE = 'usage: node plan.mjs <plan-file> [--report] [--json]';

const COST = { skip: 'none', 'user-handoff': 'human', 'invoke-model-skill': 'run' };
const TYPES = Object.keys(COST);
const LANES = ['model', 'user', 'missing'];
// The skills that read a step's result from outside the session that made it.
const OUTSIDE = new Set(['sip', 'shower', 'factchk', 'mandela']);
const SELF = new Set(['re0-workflow', 'paperthin']);
const READBACK_SKIPS = ['single-named-step'];
const OUTCOMES = ['ran', 'returned', 'skipped', 'handed-off', 'waiting', 'failed'];
const STATUSES = ['served', 'handed-off', 'waiting', 'skipped', 'unmet'];

export class InputError extends Error {}

const filled = (value) => typeof value === 'string' && value.trim() !== '';
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
// A conditional step lists the types it can take; a typed step has one.
const typesOf = (step) => (Array.isArray(step.type) ? step.type : [step.type]);
const only = (step, type) => typesOf(step).length === 1 && typesOf(step)[0] === type;
const can = (step, type) => typesOf(step).includes(type);

function shape(plan, add) {
  if (!filled(plan.understood_as)) add('shape', 'understood_as', 'missing the "understood as" line the readback produced');
  const requirements = Array.isArray(plan.requirements) ? plan.requirements.filter(isObject) : [];
  if (!Array.isArray(plan.requirements) || requirements.length !== plan.requirements.length) add('shape', 'requirements', 'requirements must be a list of objects');
  const steps = Array.isArray(plan.steps) ? plan.steps.filter(isObject) : [];
  if (!Array.isArray(plan.steps) || steps.length !== plan.steps.length) add('shape', 'steps', 'steps must be a list of objects');
  const seen = new Set();
  for (const r of requirements) {
    if (!filled(r.id) || seen.has(r.id)) add('shape', 'requirements', 'every requirement needs a unique id; found ' + JSON.stringify(r.id));
    seen.add(r.id);
    if (!filled(r.text)) add('shape', String(r.id), 'requirement has no text');
  }
  const ids = new Set();
  for (const s of steps) {
    const where = String(s.id);
    if (!filled(s.id) || ids.has(s.id)) add('shape', 'steps', 'every step needs a unique id; found ' + JSON.stringify(s.id));
    ids.add(s.id);
    for (const field of ['target', 'precondition', 'output', 'skippable', 'cost_owner']) if (!filled(s[field])) add('shape', where, 'missing ' + field);
    const types = typesOf(s);
    if (!types.length || !types.every((t) => TYPES.includes(t)) || new Set(types).size !== types.length || (Array.isArray(s.type) && types.length < 2)) add('shape', where, 'type must be one of ' + TYPES.join(', ') + ', or a list of two or more of them for a conditional step');
    if (!Array.isArray(s.predecessors) || !s.predecessors.every(filled)) add('shape', where, 'predecessors must be a list of step ids');
    if (!Array.isArray(s.serves) || !s.serves.every(filled)) add('shape', where, 'serves must be a list of requirement ids');
    if (typeof s.writes !== 'boolean') add('shape', where, 'writes must be true or false');
    if (!LANES.includes(s.lane)) add('shape', where, 'lane must be one of ' + LANES.join(', '));
    if (s.members !== undefined && (!Array.isArray(s.members) || !s.members.every(filled))) add('shape', where, 'members must be a list of skill names');
  }
  return { requirements, steps };
}

export function checkPlan(plan) {
  const problems = [];
  const add = (rule, where, message) => problems.push({ rule, where, message });
  if (!isObject(plan)) {
    add('shape', 'plan', 'the plan is not a JSON object');
    return problems;
  }
  const { requirements, steps } = shape(plan, add);
  const byId = new Map(steps.map((s) => [s.id, s]));
  const preds = (s) => (Array.isArray(s.predecessors) ? s.predecessors.filter((p) => byId.has(p)) : []);
  const children = new Map(steps.map((s) => [s.id, []]));
  for (const s of steps) {
    for (const p of Array.isArray(s.predecessors) ? s.predecessors : []) {
      if (p === s.id) add('cycle', String(s.id), 'lists itself as a predecessor');
      else if (!byId.has(p)) add('shape', String(s.id), 'names an unknown predecessor ' + JSON.stringify(p));
      else children.get(p).push(s);
    }
  }
  const reach = (start, next) => {
    const found = new Set();
    const stack = [...next(start)];
    while (stack.length) {
      const s = stack.pop();
      if (found.has(s.id)) continue;
      found.add(s.id);
      stack.push(...next(s));
    }
    return found;
  };
  const ancestors = (s) => reach(s, (x) => preds(x).map((p) => byId.get(p)));
  const descendants = (s) => [...reach(s, (x) => children.get(x.id) || [])].map((id) => byId.get(id));

  // No cycle: a depth-first walk over predecessors names the first loop it closes.
  const state = new Map();
  const path = [];
  const visit = (s) => {
    state.set(s.id, 'open');
    path.push(s.id);
    for (const p of preds(s)) {
      if (state.get(p) === 'open') add('cycle', String(s.id), 'the steps form a cycle: ' + [...path.slice(path.indexOf(p)), p].join(' -> '));
      else if (!state.has(p)) visit(byId.get(p));
    }
    path.pop();
    state.set(s.id, 'done');
  };
  for (const s of steps) if (!state.has(s.id)) visit(s);

  // The readback runs first and every later step follows it, unless the recorded skip reason holds.
  const readbacks = steps.filter((s) => s.target === 'readback');
  if (plan.readback_skip !== undefined && plan.readback_skip !== null) {
    if (!READBACK_SKIPS.includes(plan.readback_skip)) add('readback-first', 'readback_skip', 'the readback may be skipped only for ' + READBACK_SKIPS.join(', ') + '; found ' + JSON.stringify(plan.readback_skip));
    else {
      if (readbacks.length) add('readback-first', 'readback_skip', 'the readback is recorded as skipped but a readback step is in the plan');
      if (requirements.length !== 1 || steps.filter((s) => s.target !== 'sip').length !== 1) add('readback-first', 'readback_skip', 'single-named-step holds only for one requirement served by one step, a sip step aside');
    }
  } else if (readbacks.length !== 1) add('readback-first', 'steps', 'the plan has ' + readbacks.length + ' readback steps; it needs exactly one, first, or a recorded skip reason');
  else {
    const rb = readbacks[0];
    if (preds(rb).length) add('readback-first', String(rb.id), 'the readback step has predecessors; it runs first');
    if (!only(rb, 'invoke-model-skill') && !(only(rb, 'skip') && rb.lane === 'missing')) add('readback-first', String(rb.id), 'the readback step runs, or is a skip only when readback is not installed');
    for (const s of steps) if (s !== rb && !ancestors(s).has(rb.id)) add('readback-first', String(s.id), 'does not follow the readback step');
  }

  // A reject is the whole result: nothing past the readback, and no stop condition.
  const work = steps.filter((s) => s.target !== 'readback');
  if (plan.reject !== undefined && plan.reject !== null) {
    if (!filled(plan.reject)) add('reject', 'reject', 'a reject names what made the request unservable, the whole cycle when cyclic');
    if (work.length) add('reject', 'reject', 'a reject carries no steps past the readback');
    if (plan.stop !== undefined && plan.stop !== null) add('stop', 'stop', 'a reject ends at its own report and has no stop condition');
  } else if (work.length || (plan.stop !== undefined && plan.stop !== null)) {
    if (Array.isArray(plan.stop)) add('stop', 'stop', 'the plan names ' + plan.stop.length + ' stop conditions; give exactly one');
    else if (!filled(plan.stop)) add('stop', 'stop', 'missing the one observable stop condition');
  }

  // Every requirement traces to a step or is recorded as unmet, and every step past the readback serves one.
  const reqIds = new Set(requirements.map((r) => r.id));
  for (const s of work) {
    if (!Array.isArray(s.serves)) continue;
    for (const r of s.serves) if (!reqIds.has(r)) add('requirement', String(s.id), 'serves an unknown requirement ' + JSON.stringify(r));
    if (!s.serves.length) add('serves', String(s.id), 'serves no requirement; a step no requirement needs is cut');
  }
  for (const r of requirements) {
    const serving = work.filter((s) => Array.isArray(s.serves) && s.serves.includes(r.id));
    if (!serving.length && !filled(r.unmet)) add('requirement', String(r.id), 'no step serves it and it is not recorded as unmet');
    else if (serving.length && serving.every((s) => only(s, 'skip')) && !filled(r.unmet)) add('requirement', String(r.id), 'every step serving it is a skip, so it is recorded as unmet with the reason');
  }

  for (const s of steps) {
    const where = String(s.id);
    if (SELF.has(s.target)) add('self', where, 'targets ' + s.target + ', which would route back into this router');
    if (s.lane === 'user' && can(s, 'invoke-model-skill')) add('user-only', where, 'targets a user-only skill but can be typed invoke-model-skill; it is a user-handoff');
    if (s.lane === 'missing' && !only(s, 'skip')) add('missing', where, 'targets a skill that is not installed, so it is a skip');
    if (s.destructive === true && can(s, 'invoke-model-skill')) add('destructive', where, 'is destructive or irreversible, so the human runs it as a user-handoff');
    // A conditional step lists its expected type first and carries that type's owner.
    if (filled(s.cost_owner) && TYPES.includes(typesOf(s)[0]) && COST[typesOf(s)[0]] !== s.cost_owner) add('cost', where, 'cost owner ' + JSON.stringify(s.cost_owner) + ' does not match its first type ' + typesOf(s)[0] + ', whose owner is ' + COST[typesOf(s)[0]]);
    if (can(s, 'skip') && !filled(s.reason)) add('skip', where, 'can be a skip but records no reason');
    if (can(s, 'user-handoff') && (!filled(s.handoff) || !filled(s.bring_back))) add('handoff', where, 'a user-handoff names what the human does (handoff) and what to bring back (bring_back)');
    // A skipped step's dependents are skipped too; a missing readback is the exception, since the router writes the read itself.
    if (only(s, 'skip') && s.target !== 'readback') for (const c of children.get(s.id) || []) if (!only(c, 'skip')) add('skip', String(c.id), 'depends on the skipped step ' + where + ', so it is skipped too');
    if (can(s, 'invoke-model-skill') && s.writes === true && s.target !== 'sip' && !(s.members || []).includes('sip') && !descendants(s).some((d) => d.target === 'sip')) add('sip', where, 'writes but no sip step follows it');
    if (s.judgment_only === true && !descendants(s).some((d) => OUTSIDE.has(d.target))) add('outside', where, 'rests on the session\'s own judgment but no outside read (' + [...OUTSIDE].join(', ') + ') follows it');
    if (Array.isArray(s.members) && Array.isArray(s.serves)) {
      for (const t of steps) if (t !== s && s.members.includes(t.target) && Array.isArray(t.serves) && t.serves.some((r) => s.serves.includes(r))) add('pipeline', String(t.id), 'reproduces ' + t.target + ', a member of the pipeline step ' + where + ' serving the same requirement');
    }
  }
  return problems;
}

export function checkReport(plan) {
  const problems = checkPlan(plan);
  if (!isObject(plan) || !Array.isArray(plan.steps) || !Array.isArray(plan.requirements)) return problems;
  const add = (rule, where, message) => problems.push({ rule, where, message });
  const steps = plan.steps.filter(isObject);
  const byId = new Map(steps.map((s) => [s.id, s]));
  const stopped = new Set(['waiting', 'handed-off', 'failed']);
  for (const s of steps) {
    const where = String(s.id);
    if (!OUTCOMES.includes(s.outcome)) add('outcome', where, 'outcome must be one of ' + OUTCOMES.join(', '));
    else if (s.outcome !== 'waiting' && !filled(s.result)) add('outcome', where, 'outcome ' + s.outcome + ' records no result or reason');
    if (only(s, 'skip') && s.outcome !== 'skipped') add('outcome', where, 'is typed skip but its outcome is ' + s.outcome);
    if (!can(s, 'invoke-model-skill') && s.outcome === 'ran') add('outcome', where, 'the router never runs a step it cannot type invoke-model-skill; a handoff whose result came back is returned');
    if (!can(s, 'user-handoff') && ['returned', 'handed-off'].includes(s.outcome)) add('outcome', where, 'outcome ' + s.outcome + ' belongs to a user-handoff');
    if (['ran', 'returned'].includes(s.outcome)) {
      for (const p of Array.isArray(s.predecessors) ? s.predecessors : []) if (stopped.has(byId.get(p)?.outcome)) add('order', where, 'ran after ' + p + ', where the run had stopped');
    }
  }
  const stops = steps.filter((s) => s.outcome === 'handed-off' || s.outcome === 'failed');
  if (stops.length > 1) add('order', 'steps', 'the run stops at the first handoff or failure, but ' + stops.map((s) => s.id).join(', ') + ' all stopped it');
  for (const r of plan.requirements.filter(isObject)) {
    const where = String(r.id);
    const serving = steps.filter((s) => Array.isArray(s.serves) && s.serves.includes(r.id));
    if (!STATUSES.includes(r.status)) add('status', where, 'status must be one of ' + STATUSES.join(', '));
    else if (['skipped', 'unmet'].includes(r.status) && !filled(r.reason)) add('status', where, r.status + ' records no reason');
    else if (r.status === 'served' && !(serving.some((s) => ['ran', 'returned'].includes(s.outcome)) && serving.every((s) => ['ran', 'returned', 'skipped'].includes(s.outcome)))) add('status', where, 'is served only when a step serving it ran and none of them is still open');
    else if (r.status === 'handed-off' && !serving.some((s) => s.outcome === 'handed-off')) add('status', where, 'is handed off but no step serving it is the handoff the run stopped at');
    else if (r.status === 'waiting' && !(serving.some((s) => s.outcome === 'waiting') && !serving.some((s) => s.outcome === 'handed-off'))) add('status', where, 'is waiting only when a step serving it waits behind the stop and none is the handoff itself');
  }
  if (typeof plan.stop_reached !== 'boolean') add('stop-reached', 'stop_reached', 'stop_reached must be true or false');
  else if (plan.stop_reached) {
    const open = steps.filter((s) => stopped.has(s.outcome)).map((s) => s.id);
    const unserved = plan.requirements.filter((r) => isObject(r) && !['served', 'skipped'].includes(r.status)).map((r) => r.id);
    if (open.length || unserved.length) add('stop-reached', 'stop_reached', 'the stop condition is claimed reached while ' + [...open, ...unserved].join(', ') + ' is still open');
  }
  return problems;
}

export function read(file) {
  let raw;
  try {
    raw = readFileSync(file, 'utf8');
  } catch (error) {
    throw new InputError('cannot read ' + file + ': ' + error.code);
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new InputError(file + ' is not valid JSON: ' + error.message);
  }
}

export function format(problems, plan, report) {
  if (!problems.length) return (report ? 'report' : 'plan') + ' holds: ' + plan.steps.length + ' step(s), ' + plan.requirements.length + ' requirement(s)';
  return [...problems.map((p) => p.rule + ' ' + p.where + ': ' + p.message), 'FAIL: ' + problems.length + ' problem(s)'].join('\n');
}

export function main(argv) {
  let values;
  let positionals;
  try {
    ({ values, positionals } = parseArgs({ args: argv, allowPositionals: true, options: { report: { type: 'boolean' }, json: { type: 'boolean' }, help: { type: 'boolean' } } }));
  } catch (error) {
    if (typeof error.code === 'string' && error.code.startsWith('ERR_PARSE_ARGS')) {
      console.error(error.message + '\n' + USAGE);
      return 2;
    }
    throw error;
  }
  if (values.help) {
    console.log(USAGE);
    return 0;
  }
  if (positionals.length !== 1) {
    console.error('name exactly one plan file\n' + USAGE);
    return 2;
  }
  let plan;
  try {
    plan = read(positionals[0]);
  } catch (error) {
    if (error instanceof InputError) {
      console.error('plan: ' + error.message + '\n' + USAGE);
      return 2;
    }
    throw error;
  }
  const problems = values.report ? checkReport(plan) : checkPlan(plan);
  console.log(values.json ? JSON.stringify({ ok: !problems.length, problems }) : format(problems, plan, values.report));
  return problems.length ? 1 : 0;
}

// An installed skill is often a link to its source folder; Node resolves import.meta.url through the link while argv keeps
// the link path, so both sides are compared as real paths or a call through the link exits 0 having done nothing.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) process.exitCode = main(process.argv.slice(2));
