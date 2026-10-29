#!/usr/bin/env node
// List every em dash (U+2014 and its look-alikes U+2015, U+2E3A, U+2E3B) and en dash (U+2013) and label each one by the slot it sits in.
// sentence: a dash inside running prose standing in for a comma, colon, parentheses or a sentence break, the only kind dedash replaces.
// label: a typographic separator in a fixed slot (after a bold lead in a list item or table cell, after a heading's first segment, between a name and its tagline in alt, title or aria-label text).
// range: an en dash between two numbers, or unspaced between two words (1990 to 2000 written with U+2013, or a London to Paris route).
// protected: inside fenced or inline code, a URL, another HTML attribute value, or a double-quoted span in a prose file.
// A hyphen (U+002D) is never a candidate. Every dash found is listed, so the per-slot counts sum to the total.
// Usage: node find.mjs <paths...> [--json]
// Exit codes: 0 no in-sentence dash; 3 one or more in-sentence dashes; 2 usage or an unreadable input.
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { resolve, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const USAGE = 'usage: node find.mjs <paths...> [--json]';

export class InputError extends Error {}

export const SLOTS = ['sentence', 'label', 'range', 'protected'];
const SKIP_DIRS = new Set(['.git', 'node_modules']);
const DASH = /[\u2013\u2014\u2015\u2E3A\u2E3B]/g;
const HAS_DASH = /[\u2013\u2014\u2015\u2E3A\u2E3B]/;
const EN = '\u2013';
const FENCE = /^\s*(\x60{3,}|~{3,})/;
const INLINE_CODE = /(\x60+)(?:(?!\1).)+?\1/g;
const URL = /\b[a-z][a-z0-9+.-]*:\/\/[^\s)"'>]+/gi;
const ATTRIBUTE = /([A-Za-z][\w:-]*)\s*=\s*"([^"]*)"/g;
const TEXT_ATTRIBUTES = new Set(['alt', 'title', 'aria-label']);
const IMAGE_ALT = /!\[([^\]]*)\]/g;
const QUOTED = /"[^"]*"|\u201C[^\u201D]*\u201D/g;
const HEADING = /^\s{0,3}#{1,6}\s/;
// A lead: optional blockquote and list or table-cell markers, then one bold term and nothing else before the dash.
const LEAD = /^\s*(?:>\s*)*(?:\|(?:[^|]*\|)*\s*)?(?:(?:[-*+]|\d+[.)])\s+)?(?:\*\*[^*]+\*\*|__[^_]+__|<(b|strong)>.+?<\/\1>)\s*$/;
// A name before a tagline: a few words with no sentence punctuation.
const NAME = /^\s*[^.,;:!?]+?\s*$/;

const isDigit = (c) => c !== undefined && /\p{Nd}/u.test(c);
const isWordChar = (c) => c !== undefined && /[\p{L}\p{N}]/u.test(c);

const spans = (line, re) => [...line.matchAll(re)].map((m) => ({ start: m.index, end: m.index + m[0].length }));
const inside = (list, i) => list.find((s) => i >= s.start && i < s.end);

// Labels each dash of one line outside a code fence. prose turns on quotation protection, which only a prose file has.
export function classifyLine(line, { prose = true } = {}) {
  const code = [...spans(line, INLINE_CODE), ...spans(line, URL)];
  const attributes = [];
  for (const m of line.matchAll(ATTRIBUTE)) {
    const start = m.index + m[0].lastIndexOf('"' + m[2] + '"') + 1;
    attributes.push({ start, end: start + m[2].length, text: TEXT_ATTRIBUTES.has(m[1].toLowerCase()) });
  }
  for (const m of line.matchAll(IMAGE_ALT)) attributes.push({ start: m.index + 2, end: m.index + 2 + m[1].length, text: true });
  let blanked = line;
  if (prose) {
    for (const s of [...code, ...attributes]) blanked = blanked.slice(0, s.start) + ' '.repeat(s.end - s.start) + blanked.slice(s.end);
  }
  const quotes = prose ? spans(blanked, QUOTED).map((s) => ({ start: s.start + 1, end: s.end - 1 })) : [];
  const dashes = [...line.matchAll(DASH)].map((m) => m.index);
  const firstOutside = dashes.find((i) => !inside(code, i) && !inside(attributes, i));
  return dashes.map((i) => {
    const ch = line[i];
    let slot;
    const attribute = inside(attributes, i);
    if (inside(code, i)) slot = 'protected';
    else if (attribute && !attribute.text) slot = 'protected';
    else if (attribute) {
      const head = line.slice(attribute.start, i);
      const first = !HAS_DASH.test(head);
      slot = first && NAME.test(head) && head.trim().split(/\s+/).length <= 5 ? 'label' : rangeOrSentence(line, i, ch);
    } else if (inside(quotes, i)) slot = 'protected';
    else if (ch === EN && rangeOrSentence(line, i, ch) === 'range') slot = 'range';
    else if (HEADING.test(line) && i === firstOutside) slot = 'label';
    else if (LEAD.test(line.slice(0, i))) slot = 'label';
    else slot = 'sentence';
    return { index: i, column: Array.from(line.slice(0, i)).length + 1, codepoint: 'U+' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'), slot };
  });
}

function rangeOrSentence(line, i, ch) {
  if (ch !== EN) return 'sentence';
  let l = i - 1;
  let r = i + 1;
  while (line[l] === ' ' || line[l] === '\t') l--;
  while (line[r] === ' ' || line[r] === '\t') r++;
  if (isDigit(line[l]) && isDigit(line[r])) return 'range';
  if (isWordChar(line[i - 1]) && isWordChar(line[i + 1])) return 'range';
  return 'sentence';
}

export function findText(text, { prose = true } = {}) {
  const found = [];
  let fence = null;
  text.split(/\r?\n/).forEach((raw, index) => {
    const open = FENCE.exec(raw);
    const fenced = () => {
      for (const m of raw.matchAll(DASH)) found.push({ line: index + 1, column: Array.from(raw.slice(0, m.index)).length + 1, codepoint: 'U+' + m[0].codePointAt(0).toString(16).toUpperCase().padStart(4, '0'), slot: 'protected', text: raw });
    };
    if (fence) {
      fenced();
      if (open && open[1][0] === fence.char && open[1].length >= fence.length && raw.trim() === open[1]) fence = null;
      return;
    }
    if (open) {
      fence = { char: open[1][0], length: open[1].length };
      fenced();
      return;
    }
    for (const { index: _i, ...hit } of classifyLine(raw, { prose })) found.push({ line: index + 1, ...hit, text: raw });
  });
  return found;
}

export const isProse = (file) => /\.(md|markdown|mdx|txt)$/i.test(file);

export function count(dashes) {
  const counts = Object.fromEntries(SLOTS.map((slot) => [slot, 0]));
  for (const d of dashes) counts[d.slot]++;
  return counts;
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
  const dashes = [];
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
      for (const hit of findText(buffer.toString('utf8'), { prose: isProse(file) })) dashes.push({ file: display(file), ...hit });
    }
  }
  return { scanned, counts: count(dashes), dashes };
}

export function format(result) {
  const out = result.dashes.map((d) => d.file + ':' + d.line + ':' + d.column + '  ' + d.codepoint + '  ' + d.slot + '  ' + d.text.trim());
  const c = result.counts;
  out.push(result.dashes.length + ' dash(es) in ' + result.scanned + ' file(s): ' + c.sentence + ' sentence, ' + c.label + ' label, ' + c.range + ' range, ' + c.protected + ' protected');
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
  return result.counts.sentence ? 3 : 0;
}

// An installed skill is often a link to its source folder; Node resolves import.meta.url through the link while argv keeps
// the link path, so both sides are compared as real paths or a call through the link exits 0 having done nothing.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) process.exitCode = main(process.argv.slice(2));
