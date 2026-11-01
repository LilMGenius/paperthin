#!/usr/bin/env node
// List every U+00B7 middle dot in the named files or folders, each with its line, its 1-based UTF-16 column and a kind label.
// Nothing is hidden: dots in contexts the skill protects mechanically are listed and counted with their label, so the in-scope total is exact.
// Kinds: review (read and judge), code (fenced or inline), url, quote (inside paired double quotes or 「」『』), digits (between two digits),
// formula (in a token holding sub- or superscript digits), catalan (l·l), bullet (a dot used as a list marker).
// Look-alikes (U+318D, U+2027, U+0387 and others) are reported apart and never counted. --lines keeps only those lines in scope.
// Usage: node find.mjs <paths...> [--lines A-B[,C-D]] [--json]
// Exit codes: 0 after a scan, 2 on a usage error or a missing path.
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { resolve, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const USAGE = 'usage: node find.mjs <paths...> [--lines A-B[,C-D]] [--json]';

export class InputError extends Error {}

const SKIP_DIRS = new Set(['.git', 'node_modules']);
const DOT = '\u00B7';
export const LOOKALIKES = {
  0x318d: 'HANGUL LETTER ARAEA',
  0x2027: 'HYPHENATION POINT',
  0x0387: 'GREEK ANO TELEIA',
  0x2022: 'BULLET',
  0x2219: 'BULLET OPERATOR',
  0x22c5: 'DOT OPERATOR',
  0x30fb: 'KATAKANA MIDDLE DOT',
  0xff65: 'HALFWIDTH KATAKANA MIDDLE DOT',
  0x2e31: 'WORD SEPARATOR MIDDLE DOT',
  0x16eb: 'RUNIC SINGLE PUNCTUATION',
};
const FENCE = /^\s*(\x60{3,}|~{3,})/;
// Ranges are found in this order; a dot takes the first kind whose range covers it.
const RANGES = [
  ['code', /(\x60+)(?:(?!\1).)+?\1/g],
  ['url', /\b(?:[a-z][a-z0-9+.-]*:\/\/|www\.)\S+/gi],
  ['quote', /"[^"]*"|\u201C[^\u201D]*\u201D|\u300C[^\u300D]*\u300D|\u300E[^\u300F]*\u300F/g],
];
const DIGIT = /\p{Nd}/u;
const SCRIPT_DIGIT = /[\u2070-\u209F\u00B2\u00B3\u00B9]/;
const isEll = (c) => c === 'l' || c === 'L';

function tokenAround(line, i) {
  let start = i;
  let end = i + 1;
  while (start > 0 && !/\s/.test(line[start - 1])) start--;
  while (end < line.length && !/\s/.test(line[end])) end++;
  return line.slice(start, end);
}

// Kind of the dot at UTF-16 index i of one line outside a fence.
function kindAt(line, i, ranges) {
  for (const [kind, spans] of ranges) if (spans.some(([s, e]) => i >= s && i < e)) return kind;
  const before = line[i - 1];
  const after = line[i + 1];
  if (before && after && DIGIT.test(before) && DIGIT.test(after)) return 'digits';
  if (SCRIPT_DIGIT.test(tokenAround(line, i))) return 'formula';
  if (isEll(before) && isEll(after)) return 'catalan';
  if (line.slice(0, i).trim() === '' && (after === undefined || /\s/.test(after))) return 'bullet';
  return 'review';
}

function rangesOf(line) {
  return RANGES.map(([kind, re]) => [kind, Array.from(line.matchAll(re), (m) => [m.index, m.index + m[0].length])]);
}

// Every U+00B7 and every look-alike in one text, with 1-based line and UTF-16 column.
export function scanText(text) {
  const dots = [];
  const lookalikes = [];
  let fence = null;
  text.split(/\r?\n/).forEach((line, index) => {
    const lineNo = index + 1;
    const open = FENCE.exec(line);
    let inFence = fence !== null;
    if (fence) {
      if (open && open[1][0] === fence.char && open[1].length >= fence.length && line.trim() === open[1]) fence = null;
    } else if (open) {
      fence = { char: open[1][0], length: open[1].length };
      inFence = true;
    }
    const ranges = inFence ? null : rangesOf(line);
    for (let i = 0; i < line.length; i++) {
      const code = line.charCodeAt(i);
      if (line[i] === DOT) dots.push({ line: lineNo, column: i + 1, kind: inFence ? 'code' : kindAt(line, i, ranges), text: line });
      else if (LOOKALIKES[code]) lookalikes.push({ line: lineNo, column: i + 1, codepoint: 'U+' + code.toString(16).toUpperCase().padStart(4, '0'), name: LOOKALIKES[code] });
    }
  });
  return { dots, lookalikes };
}

export function parseLines(spec) {
  if (spec === undefined) return null;
  const ranges = spec.split(',').map((part) => {
    const m = /^\s*(\d+)\s*(?:-\s*(\d+)\s*)?$/.exec(part);
    if (!m) throw new InputError('bad --lines range: ' + part);
    const start = Number(m[1]);
    const end = m[2] === undefined ? start : Number(m[2]);
    if (start < 1 || end < start) throw new InputError('bad --lines range: ' + part);
    return [start, end];
  });
  return ranges;
}

const toPosix = (path) => path.split(sep).join('/');
const display = (file) => {
  const rel = relative(process.cwd(), file);
  return toPosix(rel && !rel.startsWith('..') && !isAbsolute(rel) ? rel : file);
};

function walk(dir, files) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(full, files);
    } else if (entry.isFile()) files.push(full);
  }
}

export function find(paths, lines = null) {
  const inRange = (n) => lines === null || lines.some(([s, e]) => n >= s && n <= e);
  const result = { scanned: 0, skippedBinary: 0, dots: [], outside: [], lookalikes: [] };
  for (const raw of paths) {
    const arg = resolve(raw);
    if (!existsSync(arg)) throw new InputError('no such path: ' + raw);
    const files = [];
    if (statSync(arg).isDirectory()) walk(arg, files);
    else files.push(arg);
    for (const file of files.sort()) {
      const buffer = readFileSync(file);
      if (buffer.includes(0)) {
        result.skippedBinary++;
        continue;
      }
      result.scanned++;
      const name = display(file);
      const { dots, lookalikes } = scanText(buffer.toString('utf8').replace(/^\uFEFF/, ''));
      for (const d of dots) (inRange(d.line) ? result.dots : result.outside).push({ file: name, ...d });
      for (const l of lookalikes) if (inRange(l.line)) result.lookalikes.push({ file: name, ...l });
    }
  }
  result.inScope = result.dots.length;
  result.byKind = {};
  for (const d of result.dots) result.byKind[d.kind] = (result.byKind[d.kind] || 0) + 1;
  return result;
}

export function format(result) {
  const out = result.dots.map((d) => d.file + ':' + d.line + ':' + d.column + '  ' + d.kind.padEnd(7) + '  ' + d.text.trim());
  const kinds = Object.entries(result.byKind).map(([k, n]) => k + ' ' + n).join(', ');
  out.push('in scope: ' + result.inScope + ' U+00B7 in ' + result.scanned + ' file(s)' + (kinds ? ' (' + kinds + ')' : ''));
  if (result.outside.length) {
    const where = [...new Set(result.outside.map((d) => d.file + ':' + d.line))].join(', ');
    out.push('outside --lines, not reviewed or counted: ' + result.outside.length + ' U+00B7 at ' + where);
  }
  if (result.lookalikes.length) {
    const list = result.lookalikes.map((l) => l.codepoint + ' ' + l.name + ' at ' + l.file + ':' + l.line + ':' + l.column).join('; ');
    out.push('look-alikes, not U+00B7 and not counted: ' + list);
  }
  if (result.skippedBinary) out.push('binary files skipped: ' + result.skippedBinary);
  return out.join('\n');
}

export function main(argv) {
  let values;
  let positionals;
  try {
    ({ values, positionals } = parseArgs({ args: argv, allowPositionals: true, options: { json: { type: 'boolean' }, lines: { type: 'string' }, help: { type: 'boolean' } } }));
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
    result = find(positionals, parseLines(values.lines));
  } catch (error) {
    if (error instanceof InputError) {
      console.error('find: ' + error.message + '\n' + USAGE);
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
