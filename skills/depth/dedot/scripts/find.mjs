#!/usr/bin/env node
// List every U+00B7 middle dot dedot may need to review: file, line, column and line text.
// A hit is a lead for a reader, never a verdict: the skill judges open enumeration against sanctioned use.
// Protected contexts the skill defines mechanically are masked first: fenced code, inline code, URLs, a dot between digits (3\u00B71) and Catalan l\u00B7l.
// U+318D and every other look-alike are never matched, because only U+00B7 is the target.
// Usage: node find.mjs <paths...> [--json]
// Exit codes: 0 no middle dot; 3 one or more; 2 usage or an unreadable input.
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { resolve, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const USAGE = 'usage: node find.mjs <paths...> [--json]';

export class InputError extends Error {}

const SKIP_DIRS = new Set(['.git', 'node_modules']);
const DOT = 0xb7;
const FENCE = /^\s*(\x60{3,}|~{3,})/;
const INLINE_CODE = /(\x60+)(?:(?!\1).)+?\1/g;
const URL = /\b[a-z][a-z0-9+.-]*:\/\/\S+/gi;

const mask = (text, re) => text.replace(re, (m) => ' '.repeat(m.length));
const isDigit = (c) => c !== undefined && /\p{Nd}/u.test(c);
const isEll = (c) => c === 'l' || c === 'L';

// Returns the columns (1-based, in code points) of the dots in one line whose inline code and URLs are already blanked out.
function lineHits(masked) {
  const chars = Array.from(masked);
  const hits = [];
  for (let i = 0; i < chars.length; i++) {
    if (chars[i].codePointAt(0) !== DOT) continue;
    if (isDigit(chars[i - 1]) && isDigit(chars[i + 1])) continue;
    if (isEll(chars[i - 1]) && isEll(chars[i + 1])) continue;
    hits.push(i + 1);
  }
  return hits;
}

export function findText(text) {
  const found = [];
  let fence = null;
  text.split(/\r?\n/).forEach((raw, index) => {
    const open = FENCE.exec(raw);
    if (fence) {
      if (open && open[1][0] === fence.char && open[1].length >= fence.length && raw.trim() === open[1]) fence = null;
      return;
    }
    if (open) {
      fence = { char: open[1][0], length: open[1].length };
      return;
    }
    const masked = mask(mask(raw, URL), INLINE_CODE);
    for (const column of lineHits(masked)) found.push({ line: index + 1, column, text: raw });
  });
  return found;
}

const toPosix = (path) => path.split(sep).join('/');

function walk(dir, files) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(full, files);
    } else if (entry.isFile()) files.push(full);
  }
}

const display = (file) => {
  const rel = relative(process.cwd(), file);
  return toPosix(rel && !rel.startsWith('..') && !isAbsolute(rel) ? rel : file);
};

export function find(paths) {
  const dots = [];
  let scanned = 0;
  for (const raw of paths) {
    const arg = resolve(raw);
    if (!existsSync(arg)) throw new InputError('no such path: ' + raw);
    const files = [];
    if (statSync(arg).isDirectory()) walk(arg, files);
    else files.push(arg);
    for (const file of files.sort()) {
      const buffer = readFileSync(file);
      if (buffer.includes(0)) continue;
      scanned++;
      for (const hit of findText(buffer.toString('utf8'))) dots.push({ file: display(file), ...hit });
    }
  }
  return { scanned, dots };
}

export function format(result) {
  const out = result.dots.map((d) => d.file + ':' + d.line + ':' + d.column + '  ' + d.text.trim());
  out.push(result.dots.length + ' middle dot(s) in ' + result.scanned + ' file(s)');
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
  if (!positionals.length) {
    console.error('name at least one file or directory\n' + USAGE);
    return 2;
  }
  let result;
  try {
    result = find(positionals);
  } catch (error) {
    if (error instanceof InputError) {
      console.error('find: ' + error.message + '\n' + USAGE);
      return 2;
    }
    throw error;
  }
  console.log(values.json ? JSON.stringify(result) : format(result));
  return result.dots.length ? 3 : 0;
}

// An installed skill is often a link to its source folder; Node resolves import.meta.url through the link while argv keeps
// the link path, so both sides are compared as real paths or a call through the link exits 0 having done nothing.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) process.exitCode = main(process.argv.slice(2));
