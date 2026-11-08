#!/usr/bin/env node
// Read an elon removal ledger and report, per month and in total, how many approved removals were later added back.
// Each line is one JSON event: {"date": "YYYY-MM-DD", "item": "<name>", "event": "remove" | "add-back"}, with any other fields kept for the reader.
// An add-back counts in the month of the removal it undoes, so a month's rate is fixed once its removals have had time to come back.
// A rate below 10% is flagged as possibly too conservative: Musk's rule of thumb that a team deleting enough adds back at least 10%, not a validated target.
// Usage: node ledger.mjs <ledger.jsonl> [--json]
// Exit codes: 0 report printed; 2 usage, an unreadable file or a malformed event.
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const USAGE = 'usage: node ledger.mjs <ledger.jsonl> [--json]';
export const LINE = 0.1;

export class InputError extends Error {}

const DAY = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export function parse(text) {
  const events = [];
  text.split(/\r?\n/).forEach((raw, index) => {
    if (!raw.trim()) return;
    let event;
    try {
      event = JSON.parse(raw);
    } catch {
      throw new InputError('line ' + (index + 1) + ' is not JSON');
    }
    if (!event || typeof event.item !== 'string' || !event.item) throw new InputError('line ' + (index + 1) + ' has no item');
    if (typeof event.date !== 'string' || !DAY.test(event.date)) throw new InputError('line ' + (index + 1) + ' needs a date as YYYY-MM-DD');
    if (event.event !== 'remove' && event.event !== 'add-back') throw new InputError('line ' + (index + 1) + ' event must be remove or add-back');
    events.push({ ...event, line: index + 1 });
  });
  return events;
}

const rate = (removed, addedBack) => (removed ? Math.round((addedBack / removed) * 1000) / 1000 : null);
const tally = (removed, addedBack) => {
  const r = rate(removed, addedBack);
  return { removed, addedBack, rate: r, low: r !== null && r < LINE };
};

export function report(events) {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date) || a.line - b.line);
  const open = new Map();
  const months = new Map();
  const month = (date) => {
    const key = date.slice(0, 7);
    if (!months.has(key)) months.set(key, { removed: 0, addedBack: 0 });
    return months.get(key);
  };
  for (const e of sorted) {
    if (e.event === 'remove') {
      month(e.date).removed++;
      if (!open.has(e.item)) open.set(e.item, []);
      open.get(e.item).push(e.date);
    } else {
      const dates = open.get(e.item);
      if (!dates || !dates.length) throw new InputError('line ' + e.line + ' adds back ' + e.item + ', which no earlier event removed');
      month(dates.pop()).addedBack++;
    }
  }
  const periods = [...months.keys()].sort().map((period) => ({ period, ...tally(months.get(period).removed, months.get(period).addedBack) }));
  const removed = periods.reduce((s, p) => s + p.removed, 0);
  const addedBack = periods.reduce((s, p) => s + p.addedBack, 0);
  return { periods, total: tally(removed, addedBack) };
}

const pct = (r) => (r === null ? 'no removals' : Math.round(r * 1000) / 10 + '%');
export function format(result) {
  const line = (name, t) => name + ': ' + t.removed + ' removed, ' + t.addedBack + ' added back, ' + pct(t.rate) + (t.low ? ' (below 10%: possibly too conservative)' : '');
  const out = result.periods.map((p) => line(p.period, p));
  out.push(line('total', result.total));
  if (result.total.low) out.push("10% is Musk's rule of thumb for a team that deletes enough, not a validated target; read it over many runs, never as a quota for one.");
  return out.join('\n');
}

export function main(argv) {
  let values;
  let positionals;
  try {
    ({ values, positionals } = parseArgs({ args: argv, allowPositionals: true, options: { json: { type: 'boolean' }, help: { type: 'boolean' } } }));
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
    console.error('name exactly one ledger file\n' + USAGE);
    return 2;
  }
  let result;
  try {
    if (!existsSync(positionals[0])) throw new InputError('no such file: ' + positionals[0]);
    result = report(parse(readFileSync(positionals[0], 'utf8')));
  } catch (error) {
    if (error instanceof InputError) {
      console.error('ledger: ' + error.message + '\n' + USAGE);
      return 2;
    }
    throw error;
  }
  console.log(values.json ? JSON.stringify(result) : format(result));
  return 0;
}

// An installed skill is often a link to its source folder; Node resolves import.meta.url through the link while argv keeps
// the link path, so both sides are compared as real paths or a call through the link exits 0 having done nothing.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) process.exitCode = main(process.argv.slice(2));

