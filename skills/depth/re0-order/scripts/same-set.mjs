#!/usr/bin/env node
// Check that a reorder moved items only: the multiset of items is the same before and after, and each mirror lists them in the order of the after file.
// An item is one non-blank line (a paragraph, Markdown list item or table row is one line), compared after trimming trailing whitespace.
// Mirror check: among the items a mirror shares with the after file, the sequence must match; lines only one side holds (translations, extra prose) are ignored.
// Usage: node same-set.mjs <before-file> <after-file> [--mirror <file>]... [--json]
// Exit codes: 0 pass; 1 the sets differ or a mirror diverges; 2 usage or an unreadable input.
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const USAGE = 'usage: node same-set.mjs <before-file> <after-file> [--mirror <file>]... [--json]';

export class InputError extends Error {}

export const items = (text) => text.split(/\r?\n/).map((l) => l.trimEnd()).filter((l) => l.trim() !== '');

const counts = (list) => {
  const map = new Map();
  for (const item of list) map.set(item, (map.get(item) ?? 0) + 1);
  return map;
};

// Items present in a more often than in b, in a's order.
const surplus = (a, b) => {
  const left = new Map(counts(b));
  const out = [];
  for (const item of a) {
    const n = left.get(item) ?? 0;
    if (n > 0) left.set(item, n - 1);
    else out.push(item);
  }
  return out;
};

export function compareSets(before, after) {
  const removed = surplus(before, after);
  const added = surplus(after, before);
  const changed = [];
  const paired = Math.min(removed.length, added.length);
  for (let i = 0; i < paired; i++) changed.push({ before: removed[i], after: added[i] });
  return { removed: removed.slice(paired), added: added.slice(paired), changed, same: !removed.length && !added.length };
}

export function compareMirror(after, mirror) {
  const inMirror = new Set(mirror);
  const inAfter = new Set(after);
  const want = after.filter((i) => inMirror.has(i));
  const got = mirror.filter((i) => inAfter.has(i));
  const length = Math.max(want.length, got.length);
  for (let i = 0; i < length; i++) {
    if (want[i] !== got[i]) return { ordered: false, position: i + 1, expected: want[i] ?? null, found: got[i] ?? null };
  }
  return { ordered: true };
}

function read(path) {
  if (!existsSync(path)) throw new InputError('no such file: ' + path);
  return items(readFileSync(path, 'utf8'));
}

export function check(beforePath, afterPath, mirrorPaths) {
  const before = read(beforePath);
  const after = read(afterPath);
  const sets = compareSets(before, after);
  const mirrors = mirrorPaths.map((file) => ({ file, ...compareMirror(after, read(file)) }));
  return { items: after.length, ...sets, mirrors, ok: sets.same && mirrors.every((m) => m.ordered) };
}

export function format(result) {
  const out = [];
  for (const c of result.changed) out.push('changed: ' + c.before + '  =>  ' + c.after);
  for (const r of result.removed) out.push('removed: ' + r);
  for (const a of result.added) out.push('added: ' + a);
  for (const m of result.mirrors) {
    if (!m.ordered) out.push('mirror ' + m.file + ' diverges at shared item ' + m.position + ': expected ' + m.expected + ', found ' + m.found);
  }
  out.push(result.ok ? 'same set of ' + result.items + ' item(s); ' + result.mirrors.length + ' mirror(s) in order' : 'FAIL');
  return out.join('\n');
}

export function main(argv) {
  let values;
  let positionals;
  try {
    ({ values, positionals } = parseArgs({ args: argv, allowPositionals: true, options: { json: { type: 'boolean' }, mirror: { type: 'string', multiple: true }, help: { type: 'boolean' } } }));
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
  if (positionals.length !== 2) {
    console.error('name exactly one before file and one after file\n' + USAGE);
    return 2;
  }
  let result;
  try {
    result = check(positionals[0], positionals[1], values.mirror ?? []);
  } catch (error) {
    if (error instanceof InputError) {
      console.error('same-set: ' + error.message + '\n' + USAGE);
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
