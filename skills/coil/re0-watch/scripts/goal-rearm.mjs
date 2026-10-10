import { readFileSync, realpathSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

// Codex thread goals (openai/codex, codex-rs/ext/goal/src/tool.rs): create_goal refuses while any goal is
// unfinished, and complete is the only status a model may set that frees the slot. Completing the old goal
// is honest only when its replacement still owes every watch id the old one owed, so this script decides
// that and the caller performs the host calls it prints.
const usage = 'Usage: node goal-rearm.mjs plan --current <get_goal.json|-> --objective <file|-> [--terminal <id>]... [--gh]\n       node goal-rearm.mjs verify --plan <plan.json> --readback <get_goal.json|->\n       node goal-rearm.mjs check --current <get_goal.json|->\nExit codes: 0 plan printed, readback matches or registration live, 2 refused, mismatch or lapsed, 1 usage.';
const MAX_OBJECTIVE_CHARS = 4000; // MAX_THREAD_GOAL_OBJECTIVE_CHARS in codex-rs/protocol/src/protocol.rs
const ID_LINE = /^Watch ids:[ \t]*(.*)$/im;

export function watchIds(text) {
  const line = ID_LINE.exec(text);
  if (line) return [...new Set(line[1].split(/[\s,]+/).filter(Boolean))];
  const ids = [];
  let repo = null;
  for (const match of text.matchAll(/(?<![\w./:-])([A-Za-z0-9][\w-]*\/[\w.-]*[\w-])|(?<![\w&/])#(\d+)\b/g)) {
    if (match[1]) repo = match[1];
    else if (repo && !ids.includes(repo + '#' + match[2])) ids.push(repo + '#' + match[2]);
  }
  return ids;
}

export function withIds(objective, ids) {
  const line = 'Watch ids: ' + ids.join(' ');
  return (ID_LINE.test(objective) ? objective.replace(ID_LINE, line) : objective.trimEnd() + '\n' + line).trim();
}

export function plan({ current, objective, terminal = [] }) {
  const goal = current?.goal ?? null;
  const unfinished = goal !== null && goal.status !== 'complete';
  const wanted = watchIds(objective);
  const owed = unfinished ? watchIds(goal.objective) : [];
  const carried = owed.filter(id => !wanted.includes(id) && !terminal.includes(id));
  const dropped = owed.filter(id => !wanted.includes(id) && terminal.includes(id));
  const ids = [...wanted, ...carried];
  if (ids.length === 0) return { refused: 'the objective names no watch id, so nothing proves what the goal owes' };
  const text = withIds(objective, ids);
  if (text.length > MAX_OBJECTIVE_CHARS) return { refused: 'objective is ' + text.length + ' characters; the host accepts ' + MAX_OBJECTIVE_CHARS };
  const record = { objective: text, ids, carried, dropped };
  if (!unfinished) return { action: 'create', ...record, steps: ['create_goal({objective})', 'get_goal({}), then verify'] };
  if (goal.status === 'active' && goal.objective.trim() === text) return { action: 'keep', ...record, steps: [] };
  return {
    action: 'supersede', ...record, previous: { status: goal.status, objective: goal.objective },
    steps: ['update_goal({status: "complete"})', 'create_goal({objective})', 'get_goal({}), then verify'],
  };
}

export function verify(planned, readback) {
  const goal = readback?.goal;
  if (!goal) return 'readback has no goal';
  if (goal.status !== 'active') return 'readback status is ' + goal.status;
  if (goal.objective.trim() !== planned.objective) return 'readback objective differs from the planned one';
  return null;
}

// A goal that stops being active stops waking the session, and nothing else notices: the host can move it
// to blocked or budget-limited after verify printed ARMED. Each wake reads the registration before any rung.
export function check(current) {
  const goal = current?.goal;
  if (!goal) return 'no goal is registered';
  if (watchIds(goal.objective).length === 0) return 'the goal names no watch id';
  if (goal.status !== 'active') return 'the goal is ' + goal.status + ', so no wake is scheduled';
  return null;
}

const githubState = id => {
  const match = /^([\w.-]+)\/([\w.-]+)#(\d+)$/.exec(id);
  if (!match) return null;
  const result = spawnSync('gh', ['api', 'repos/' + match[1] + '/' + match[2] + '/issues/' + match[3], '--jq', '.state'], { encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : null;
};

const read = path => readFileSync(path === '-' ? 0 : path, 'utf8');

// The installed skill is a junction to the source, and Node resolves import.meta.url through it while argv
// keeps the junction path, so both sides are compared as real paths or the CLI silently exits 0.
if (process.argv[1] && realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1])) {
  let command, values;
  try {
    ({ values, positionals: [command] } = parseArgs({ allowPositionals: true, options: {
      current: { type: 'string' }, objective: { type: 'string' }, terminal: { type: 'string', multiple: true, default: [] },
      gh: { type: 'boolean' }, plan: { type: 'string' }, readback: { type: 'string' }, help: { type: 'boolean' },
    } }));
    if (values.help) {
      console.log(usage);
      process.exit(0);
    }
    const ready = command === 'plan' ? values.current && values.objective
      : command === 'check' ? values.current
      : command === 'verify' && values.plan && values.readback;
    if (!ready) throw new Error('Name plan, verify or check with its required options.');
  } catch (error) {
    console.error(error.message + '\n' + usage);
    process.exit(1);
  }
  if (command === 'verify') {
    const problem = verify(JSON.parse(read(values.plan)), JSON.parse(read(values.readback)));
    console.log(problem ? 'MISMATCH: ' + problem : 'ARMED');
    process.exit(problem ? 2 : 0);
  }
  if (command === 'check') {
    const problem = check(JSON.parse(read(values.current)));
    console.log(problem ? 'LAPSED: ' + problem : 'LIVE');
    process.exit(problem ? 2 : 0);
  }
  const current = JSON.parse(read(values.current));
  const objective = read(values.objective);
  const terminal = [...values.terminal];
  if (values.gh && current?.goal && current.goal.status !== 'complete') {
    const wanted = watchIds(objective);
    for (const id of watchIds(current.goal.objective)) {
      if (!wanted.includes(id) && !terminal.includes(id) && githubState(id) === 'closed') terminal.push(id);
    }
  }
  const result = plan({ current, objective, terminal });
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.refused ? 2 : 0);
}
