#!/usr/bin/env node
// Check that an elon item table is filled for each row's verdict before the approval stop is shown.
// The table is the first Markdown table whose header holds the columns below; each row is one item.
// Usage: node table.mjs <file> [--json]
// Exit codes: 0 every row is filled; 1 a row misses a cell its verdict needs; 2 usage, an unreadable file or no item table.
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const USAGE = 'usage: node table.mjs <file> [--json]';
export const COLUMNS = ['Item', 'Serves', 'Source', 'Holds', 'Bought', 'Orphans', 'Re-add', 'Verdict', 'Reason'];
export const VERDICTS = ['keep', 'mandated', 'remove', 'defer', 'simplify', 'accelerate', 'automate', 'ask', 'stopped'];
// A kept item may carry several of these proposals at once, joined by +, each approved on its own.
const COMBINABLE = ['simplify', 'accelerate', 'automate'];
const HOLDS = ['yes', 'no', 'unknown'];
const DATE = /\b\d{4}-\d{2}-\d{2}\b/;

export class InputError extends Error {}

// Split a Markdown table line into trimmed cells, keeping an escaped pipe inside its cell.
export function cells(line) {
  const inner = line.trim().replace(/^\|/, '').replace(/(?<!\\)\|$/, '');
  return inner.split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'));
}

export function findTable(text) {
  const lines = text.split(/\r?\n/);
  for (let i = 0; i + 1 < lines.length; i++) {
    if (!lines[i].trim().startsWith('|')) continue;
    const head = cells(lines[i]);
    if (!COLUMNS.every((c) => head.includes(c))) continue;
    if (!/^\|?\s*:?-{3,}/.test(lines[i + 1].trim())) continue;
    const rows = [];
    for (let j = i + 2; j < lines.length && lines[j].trim().startsWith('|'); j++) {
      const values = cells(lines[j]);
      const row = Object.fromEntries(head.map((name, k) => [name, values[k] ?? '']));
      rows.push({ line: j + 1, row });
    }
    return rows;
  }
  return null;
}

export function checkRow(row) {
  const problems = [];
  const verdicts = row.Verdict.toLowerCase().split('+').map((v) => v.trim()).filter(Boolean);
  const verdict = verdicts.length === 1 ? verdicts[0] : 'several';
  const holds = row.Holds.toLowerCase().split(/[\s,;]/)[0];
  const need = (name, why) => {
    if (!row[name]) problems.push(name + ' is empty' + (why ? ': ' + why : ''));
  };
  if (verdict === 'stopped') {
    need('Item');
    need('Reason', 'say what stopped the run before this row');
    return problems;
  }
  if (verdict === 'several') {
    const alone = verdicts.filter((v) => !COMBINABLE.includes(v));
    if (alone.length) problems.push('verdict "' + row.Verdict + '" joins ' + alone.join(', ') + ', which stands alone; only ' + COMBINABLE.join(', ') + ' combine with +');
  } else if (!VERDICTS.includes(verdict)) problems.push('verdict "' + row.Verdict + '" is not one of ' + VERDICTS.join(', '));
  if (!HOLDS.includes(holds)) problems.push('Holds must be yes, no or unknown');
  if (verdict === 'remove' && holds === 'unknown') problems.push('a removal with an unknown source is an owner question: make the verdict ask');
  need('Item');
  need('Serves', 'name the goal or parent need the item serves');
  need('Source', 'name the person who gave it, or say no one was found');
  if (verdict !== 'ask') need('Bought', 'say what the item buys, or that it buys nothing now');
  if (verdict === 'remove' || verdict === 'defer') {
    need('Orphans', 'list what depends on the item, or write none');
    need('Re-add', 'say what putting it back would cost');
  }
  need('Reason', verdict === 'ask' ? 'write the question for the owner' : '');
  if (verdict === 'defer' && row.Reason && !DATE.test(row.Reason)) problems.push('a deferral names its resume or stop condition with a date (YYYY-MM-DD) in Reason');
  return problems;
}

export function check(path) {
  if (!existsSync(path)) throw new InputError('no such file: ' + path);
  const rows = findTable(readFileSync(path, 'utf8'));
  if (!rows) throw new InputError('no item table with the columns ' + COLUMNS.join(', ') + ' in ' + path);
  const problems = [];
  for (const { line, row } of rows) for (const message of checkRow(row)) problems.push({ line, item: row.Item, message });
  return { file: path, rows: rows.length, problems, ok: problems.length === 0 };
}

export function format(result) {
  const out = result.problems.map((p) => result.file + ':' + p.line + ' ' + (p.item || '(no item)') + ': ' + p.message);
  out.push(result.ok ? result.rows + ' row(s) filled for their verdicts' : 'FAIL: ' + result.problems.length + ' problem(s)');
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
    console.error('name exactly one file\n' + USAGE);
    return 2;
  }
  let result;
  try {
    result = check(positionals[0]);
  } catch (error) {
    if (error instanceof InputError) {
      console.error('table: ' + error.message + '\n' + USAGE);
      return 2;
    }
    throw error;
  }
  console.log(values.json ? JSON.stringify(result) : format(result));
  return result.ok ? 0 : 1;
}

// An installed skill is often a link to its source folder; Node resolves import.meta.url through the link while argv keeps
// the link path, so both sides are compared as real paths or a call through the link exits 0 having done nothing.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) process.exitCode = main(process.argv.slice(2));

