#!/usr/bin/env node
// Check the plan re0-workflow builds before it is shown, and the interruption or final report built from it (--report).
// The plan arrives as JSON on stdin and nothing is written anywhere: the coordinator keeps its plan in the conversation.
// Plan: readback, understood_as, requirements [{id, text, unmet?}], steps [{id, target, predecessors, serves, type, precondition,
// output, skippable, cost_owner, writes, lane, destructive?, members?, judgment_only?, added?, reason?, handoff?, bring_back?}],
// stop, or reject naming the cycle. A report adds approval, stop_reached, outcome and result per step, status and reason per requirement.
// Usage: <plan json> | node plan.mjs [-] [--report] [--json]
// Exit codes: 0 every invariant holds; 1 one or more broken, each named; 2 usage error or invalid JSON.
import { readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const USAGE = 'usage: <plan json> | node plan.mjs [-] [--report] [--json]';

const COST = { skip: 'none', 'user-handoff': 'human', 'invoke-model-skill': 'run', 'session-step': 'run' };
const TYPES = Object.keys(COST);
// A target is a model-invoked skill, a user-only skill, a skill not installed, or no skill (session work, a human action or decision).
const LANES = ['model', 'user', 'missing', 'none'];
const READBACKS = ['ran', 'single-named-step', 'missing'];
// The checks a router adds on its own: one sip closing each stretch that writes, or an outside read after a judgment no sip tastes.
const ADDED = { sip: new Set(['sip']), 'outside-read': new Set(['shower', 'factchk', 'mandela']) };
const SELF = new Set(['re0-workflow', 'paperthin']);
const OUTCOMES = ['ran', 'returned', 'skipped', 'handed-off', 'waiting', 'failed'];
const STATUSES = ['served', 'handed-off', 'waiting', 'skipped', 'unmet'];
const APPROVALS = ['approved', 'not-needed', 'order-only', 'pending'];

export class InputError extends Error {}

const filled = (value) => typeof value === 'string' && value.trim() !== '';
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
// A conditional step lists the types it can take, expected type first; a typed step has one.
const typesOf = (step) => (Array.isArray(step.type) ? step.type : [step.type]);
const only = (step, type) => typesOf(step).length === 1 && typesOf(step)[0] === type;
const can = (step, type) => typesOf(step).includes(type);
const runs = (step) => can(step, 'invoke-model-skill') || can(step, 'session-step');
// A step that writes content and is not itself the closing sip; a pipeline whose members include sip closes its own writes.
const writer = (step) => step.writes === true && step.target !== 'sip' && !(step.members || []).includes('sip');

function shape(plan, add) {
  if (!READBACKS.includes(plan.readback)) add('readback', 'readback', 'readback must be one of ' + READBACKS.join(', ') + ': how the intent was read before planning');
  if (!filled(plan.understood_as)) add('shape', 'understood_as', 'missing the "understood as" line the readback produced');
  const requirements = Array.isArray(plan.requirements) ? plan.requirements.filter(isObject) : [];
  if (!Array.isArray(plan.requirements) || !requirements.length || requirements.length !== plan.requirements.length) add('shape', 'requirements', 'requirements must be a non-empty list of objects');
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
    if (s.added !== undefined && !(s.added in ADDED)) add('shape', where, 'added must be one of ' + Object.keys(ADDED).join(', '));
  }
  return { requirements, steps };
}

function graph(steps, add) {
  const byId = new Map(steps.map((s) => [s.id, s]));
  const preds = (s) => (Array.isArray(s.predecessors) ? s.predecessors.filter((p) => byId.has(p) && p !== s.id) : []);
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
  return {
    byId,
    preds,
    children,
    ancestors: (s) => reach(s, (x) => preds(x).map((p) => byId.get(p))),
    descendants: (s) => [...reach(s, (x) => children.get(x.id) || [])].map((id) => byId.get(id)),
  };
}

// A reject names one cycle in run order: "a -> b -> a", each arrow pointing from a step to one that lists it as a predecessor.
function checkReject(plan, steps, add) {
  if (plan.stop !== undefined && plan.stop !== null) add('stop', 'stop', 'a reject ends at its own report and has no stop condition');
  if (!filled(plan.reject)) return add('reject', 'reject', 'a reject names the whole cycle, written as "a -> b -> a"');
  const names = plan.reject.split('->').map((n) => n.trim());
  const resolve = (name) => {
    const byId = steps.filter((s) => s.id === name);
    const byTarget = steps.filter((s) => s.target === name);
    return byId.length === 1 ? byId[0] : byTarget.length === 1 ? byTarget[0] : null;
  };
  const nodes = names.map(resolve);
  const missing = names.filter((_, i) => !nodes[i]);
  if (missing.length) return add('reject', 'reject', 'names ' + missing.map((n) => JSON.stringify(n)).join(', ') + ', which is no single step id or target in the plan');
  if (nodes.length < 3 || nodes[0] !== nodes[nodes.length - 1] || new Set(nodes.slice(1)).size !== nodes.length - 1) return add('reject', 'reject', 'a cycle returns to its first step and visits every other step once, as "a -> b -> a"');
  for (let i = 0; i + 1 < nodes.length; i++) {
    const [from, to] = [nodes[i], nodes[i + 1]];
    if (!(to.predecessors || []).includes(from.id)) add('reject', 'reject', 'the arrow ' + names[i] + ' -> ' + names[i + 1] + ' is not a declared edge: ' + to.id + ' does not list ' + from.id + ' as a predecessor; write the cycle in run order, each step before the one that needs it');
  }
}

export function checkPlan(plan) {
  const problems = [];
  const add = (rule, where, message) => problems.push({ rule, where, message });
  if (!isObject(plan)) {
    add('shape', 'plan', 'the plan is not a JSON object');
    return problems;
  }
  const { requirements, steps } = shape(plan, add);
  const g = graph(steps, add);

  // The readback is how the intent was read, never a planned action.
  for (const s of steps) if (s.target === 'readback') add('readback', String(s.id), 'readback is the router\'s intake, shown as the requirements and the understood-as line, never a plan step');

  if (plan.reject !== undefined && plan.reject !== null) {
    checkReject(plan, steps, add);
    return problems;
  }

  const actions = steps.filter((s) => s.added === undefined);
  if (!actions.length) add('no-match', 'steps', 'a plan with no action is a no-match: report that the goal was not done and why, without a plan');
  if (plan.readback === 'single-named-step' && (requirements.length !== 1 || actions.length !== 1)) add('readback', 'readback', 'single-named-step holds only for one requirement served by one action');

  // No cycle: a depth-first walk over predecessors names the first loop it closes.
  const state = new Map();
  const path = [];
  const visit = (s) => {
    state.set(s.id, 'open');
    path.push(s.id);
    for (const p of g.preds(s)) {
      if (state.get(p) === 'open') add('cycle', String(s.id), 'the steps form a cycle; reject the request naming ' + [...path.slice(path.indexOf(p)), p].reverse().join(' -> '));
      else if (!state.has(p)) visit(g.byId.get(p));
    }
    path.pop();
    state.set(s.id, 'done');
  };
  for (const s of steps) if (!state.has(s.id)) visit(s);

  // The list is the run order, so every step comes after its predecessors.
  steps.forEach((s, i) => {
    for (const p of g.preds(s)) if (steps.indexOf(g.byId.get(p)) > i) add('sequence', String(s.id), 'is listed before its predecessor ' + p + '; the list is the run order');
  });

  if (Array.isArray(plan.stop)) add('stop', 'stop', 'the plan names ' + plan.stop.length + ' stop conditions; give exactly one');
  else if (!filled(plan.stop)) add('stop', 'stop', 'missing the one observable stop condition');

  // Every requirement traces to a step or is recorded as unmet, and every step serves one.
  const reqIds = new Set(requirements.map((r) => r.id));
  for (const s of steps) {
    if (!Array.isArray(s.serves)) continue;
    for (const r of s.serves) if (!reqIds.has(r)) add('requirement', String(s.id), 'serves an unknown requirement ' + JSON.stringify(r));
    if (!s.serves.length) add('serves', String(s.id), 'serves no requirement; a step no requirement needs is cut');
  }
  for (const r of requirements) {
    const serving = actions.filter((s) => Array.isArray(s.serves) && s.serves.includes(r.id));
    if (!serving.length && !filled(r.unmet)) add('requirement', String(r.id), 'no action serves it and it is not recorded as unmet');
    else if (serving.length && serving.every((s) => only(s, 'skip')) && !filled(r.unmet)) add('requirement', String(r.id), 'every action serving it is a skip, so it is recorded as unmet with the reason');
  }

  for (const s of steps) {
    const where = String(s.id);
    if (SELF.has(s.target)) add('self', where, 'targets ' + s.target + ', which would route back into this router');
    if (s.lane === 'user' && runs(s)) add('user-only', where, 'targets a user-only skill but can be run by the session; it is a user-handoff');
    if (s.lane === 'missing' && !only(s, 'skip')) add('missing', where, 'targets a skill that is not installed, so it is a skip that stays visible');
    if (s.destructive === true && runs(s)) add('destructive', where, 'is destructive or irreversible, so the human does it as a user-handoff');
    if (can(s, 'session-step') && s.lane !== 'none') add('session', where, 'a session step is work no skill covers, so its lane is none');
    if (s.lane === 'none' && can(s, 'invoke-model-skill')) add('session', where, 'targets no skill, so it cannot be typed invoke-model-skill');
    if (filled(s.cost_owner) && TYPES.includes(typesOf(s)[0]) && COST[typesOf(s)[0]] !== s.cost_owner) add('cost', where, 'cost owner ' + JSON.stringify(s.cost_owner) + ' does not match its first type ' + typesOf(s)[0] + ', whose owner is ' + COST[typesOf(s)[0]]);
    if (can(s, 'skip') && !filled(s.reason)) add('skip', where, 'can be a skip but records no reason');
    if (can(s, 'user-handoff') && (!filled(s.handoff) || !filled(s.bring_back))) add('handoff', where, 'a user-handoff names what the human does (handoff) and what to bring back (bring_back)');
    if (s.added !== undefined && s.added in ADDED && !ADDED[s.added].has(s.target)) add('added', where, 'an added ' + s.added + ' targets ' + [...ADDED[s.added]].join(' or '));
    if (s.added !== undefined && !runs(s) && !only(s, 'skip')) add('added', where, 'an added check is run by the session, or skipped when its skill is missing');
    // A skipped step's dependents are skipped too, and their reason names the step they lost.
    if (only(s, 'skip')) {
      for (const c of g.children.get(s.id) || []) {
        if (!only(c, 'skip')) add('skip', String(c.id), 'depends on the skipped step ' + where + ', so it is skipped too');
        else if (filled(c.reason) && !c.reason.includes(s.id) && !c.reason.includes(s.target)) add('skip', String(c.id), 'is skipped after ' + where + ' but its reason does not name it; a dependent inherits the reason');
      }
    }
    if (Array.isArray(s.members) && Array.isArray(s.serves)) {
      for (const t of steps) if (t !== s && s.members.includes(t.target) && t.added === undefined && Array.isArray(t.serves) && t.serves.some((r) => s.serves.includes(r))) add('pipeline', String(t.id), 'reproduces ' + t.target + ', a member of the pipeline step ' + where + ' serving the same requirement');
    }
  }

  // Stops split the run: a handoff ends a stretch, and its own writes open the next one. A stretch that writes closes with exactly one sip,
  // its last step, after every write it covers; a stretch with no write adds none.
  const stretches = [{ steps: [], opened: null }];
  for (const s of steps) {
    if (can(s, 'user-handoff')) stretches.push({ steps: [], opened: s });
    else stretches[stretches.length - 1].steps.push(s);
  }
  for (const stretch of stretches) {
    const writes = [...(stretch.opened && writer(stretch.opened) ? [stretch.opened] : []), ...stretch.steps.filter((s) => runs(s) && writer(s))];
    const sips = stretch.steps.filter((s) => s.target === 'sip');
    const end = stretch.steps[stretch.steps.length - 1];
    const where = end ? String(end.id) : String(stretch.opened?.id);
    if (!writes.length) {
      for (const s of sips) if (s.added === 'sip') add('sip', String(s.id), 'is an added sip in a stretch that writes nothing; cut it');
      continue;
    }
    if (sips.length !== 1) {
      add('sip', where, 'the stretch writing ' + writes.map((s) => s.id).join(', ') + ' needs exactly one closing sip, found ' + sips.length);
      continue;
    }
    const sip = sips[0];
    if (sip !== end) add('sip', String(sip.id), 'the closing sip is the last step before the stop, so nothing runs after it');
    const covered = g.ancestors(sip);
    const missed = writes.filter((s) => !covered.has(s.id));
    if (missed.length) add('sip', String(sip.id), 'does not follow ' + missed.map((s) => s.id).join(', ') + '; the closing sip covers every write since the last stop');
    const served = new Set(writes.flatMap((s) => (Array.isArray(s.serves) ? s.serves : [])));
    if (sip.added === 'sip' && Array.isArray(sip.serves) && sip.serves.some((r) => !served.has(r))) add('sip', String(sip.id), 'an added sip serves only the requirements of the writes it covers');
  }

  // A judgment the run delivers gets one outside read, unless the stretch's sip already tastes it; never both.
  const stretchOf = new Map();
  stretches.forEach((stretch, i) => stretch.steps.forEach((s) => stretchOf.set(s.id, i)));
  for (const s of steps) {
    if (s.added === 'outside-read' && ![...g.ancestors(s)].some((id) => g.byId.get(id).judgment_only === true)) add('outside', String(s.id), 'is an added outside read with no judgment-only step before it; cut it');
    if (s.judgment_only !== true) continue;
    const reads = g.descendants(s).filter((d) => d.added === 'outside-read');
    const sipped = stretches[stretchOf.get(s.id)]?.steps.some((d) => d.target === 'sip');
    if (sipped && reads.length) add('outside', String(s.id), 'is tasted by its stretch\'s sip and also given an outside read; keep one');
    else if (!sipped && reads.length !== 1) add('outside', String(s.id), 'is a judgment the run delivers with no sip to taste it, so exactly one outside read (shower, factchk or mandela) follows it');
  }
  return problems;
}

export function checkReport(plan) {
  const problems = checkPlan(plan);
  if (!isObject(plan) || !Array.isArray(plan.steps) || !Array.isArray(plan.requirements) || (plan.reject !== undefined && plan.reject !== null)) return problems;
  const add = (rule, where, message) => problems.push({ rule, where, message });
  const steps = plan.steps.filter(isObject);
  const byId = new Map(steps.map((s) => [s.id, s]));
  const stopped = new Set(['waiting', 'handed-off', 'failed']);
  const started = steps.filter((s) => ['ran', 'returned', 'failed', 'handed-off'].includes(s.outcome));
  for (const s of steps) {
    const where = String(s.id);
    if (!OUTCOMES.includes(s.outcome)) add('outcome', where, 'outcome must be one of ' + OUTCOMES.join(', '));
    else if (s.outcome !== 'waiting' && !filled(s.result)) add('outcome', where, 'outcome ' + s.outcome + ' records no result or reason');
    if (only(s, 'skip') && s.outcome !== 'skipped') add('outcome', where, 'is typed skip but its outcome is ' + s.outcome);
    if (!runs(s) && s.outcome === 'ran') add('outcome', where, 'only a skill step or a session step runs; a handoff whose result came back is returned');
    if (!can(s, 'user-handoff') && ['returned', 'handed-off'].includes(s.outcome)) add('outcome', where, 'outcome ' + s.outcome + ' belongs to a user-handoff');
    if (['ran', 'returned'].includes(s.outcome)) {
      for (const p of Array.isArray(s.predecessors) ? s.predecessors : []) if (stopped.has(byId.get(p)?.outcome)) add('order', where, 'ran after ' + p + ', where the run had stopped');
    }
  }
  const stops = steps.filter((s) => s.outcome === 'handed-off' || s.outcome === 'failed');
  if (stops.length > 1) add('order', 'steps', 'the run stops at the first handoff or failure, but ' + stops.map((s) => s.id).join(', ') + ' all stopped it');

  // Nothing runs before the shown plan is approved when a step the session runs writes.
  const writesRun = steps.some((s) => runs(s) && s.writes === true);
  if (!APPROVALS.includes(plan.approval)) add('approval', 'approval', 'approval must be one of ' + APPROVALS.join(', '));
  else if (plan.approval === 'not-needed' && writesRun) add('approval', 'approval', 'a step the session runs writes, so the shown plan needs approval');
  else if (['order-only', 'pending'].includes(plan.approval) && started.length) add('approval', 'approval', 'approval is ' + plan.approval + ', so nothing runs, but ' + started.map((s) => s.id).join(', ') + ' started');

  for (const r of plan.requirements.filter(isObject)) {
    const where = String(r.id);
    const serving = steps.filter((s) => s.added === undefined && Array.isArray(s.serves) && s.serves.includes(r.id));
    if (!STATUSES.includes(r.status)) add('status', where, 'status must be one of ' + STATUSES.join(', '));
    else if (['skipped', 'unmet'].includes(r.status) && !filled(r.reason)) add('status', where, r.status + ' records no reason');
    else if (r.status === 'served' && !(serving.some((s) => ['ran', 'returned'].includes(s.outcome)) && serving.every((s) => ['ran', 'returned', 'skipped'].includes(s.outcome)))) add('status', where, 'is served only when an action serving it ran and none of them is still open');
    else if (r.status === 'handed-off' && !serving.some((s) => s.outcome === 'handed-off')) add('status', where, 'is handed off but no action serving it is the handoff the run stopped at');
    else if (r.status === 'waiting' && !(serving.some((s) => s.outcome === 'waiting') && !serving.some((s) => s.outcome === 'handed-off'))) add('status', where, 'is waiting only when an action serving it waits behind the stop and none is the handoff itself');
  }
  if (typeof plan.stop_reached !== 'boolean') add('stop-reached', 'stop_reached', 'stop_reached must be true or false');
  else if (plan.stop_reached) {
    const open = steps.filter((s) => stopped.has(s.outcome)).map((s) => s.id);
    const unserved = plan.requirements.filter((r) => isObject(r) && !['served', 'skipped'].includes(r.status)).map((r) => r.id);
    if (open.length || unserved.length) add('stop-reached', 'stop_reached', 'the stop condition is claimed reached while ' + [...open, ...unserved].join(', ') + ' is still open');
  }
  return problems;
}

export function parse(raw) {
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new InputError('stdin is not valid JSON: ' + error.message);
  }
}

export function format(problems, plan, report) {
  if (!problems.length) return (report ? 'report' : 'plan') + ' holds: ' + plan.steps.length + ' step(s), ' + plan.requirements.length + ' requirement(s)';
  return [...problems.map((p) => p.rule + ' ' + p.where + ': ' + p.message), 'FAIL: ' + problems.length + ' problem(s)'].join('\n');
}

export function main(argv, stdin) {
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
  if (positionals.length > 1 || (positionals.length === 1 && positionals[0] !== '-')) {
    console.error('the plan is read from stdin only; pass - or nothing\n' + USAGE);
    return 2;
  }
  let plan;
  try {
    plan = parse(stdin());
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
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) process.exitCode = main(process.argv.slice(2), () => readFileSync(0, 'utf8'));
