#!/usr/bin/env node
// List every dash dedash may need to replace: U+2014, U+2015, U+2E3A, U+2E3B, and a U+2013 standing between two words.
// A hit is a lead for a reader, never a verdict: the skill judges its grammatical role and chooses the replacement.
// Protected contexts (fenced code, inline code, URLs, a U+2013 between digits) are masked before matching, as the skill's LEAVE-ALONE step defines them.
// Usage: node find.mjs <paths...> [--json]
// Exit codes: 0 no dash; 3 one or more dashes; 2 usage or an unreadable input.
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { resolve, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const USAGE = 'usage: node find.mjs <paths...> [--json]';

export class InputError extends Error {}

const SKIP_DIRS = new Set(['.git', 'node_modules']);
const ALWAYS = new Set([0x2014, 0x2015, 0x2e3a, 0x2e3b]);
const EN = 0x2013;
const FENCE = /^\s*(\x60{3,}|~{3,})/;
const INLINE_CODE = /(\x60+)(?:(?!\1).)+?\1/g;
const URL = /\b[a-z][a-z0-9+.-]*:\/\/\S+/gi;

const mask = (text, re) => text.replace(re, (m) => ' '.repeat(m.length));
const isDigit = (c) => c !== undefined && /\p{Nd}/u.test(c);
const isWordChar = (c) => c !== undefined && /[\p{L}\p{N}]/u.test(c);

// Returns the dash hits of one line whose inline code and URLs are already blanked out.
function lineHits(raw, masked) {
  const hits = [];
  const chars = Array.from(masked);
  const rawChars = Array.from(raw);
  let offset = 0;
  for (let i = 0; i < chars.length; i++) {
    const cp = chars[i].codePointAt(0);
    if (ALWAYS.has(cp)) hits.push(i);
    else if (cp === EN) {
      let l = i - 1;
      let r = i + 1;
      while (chars[l] === ' ' || chars[l] === '\t') l--;
      while (chars[r] === ' ' || chars[r] === '\t') r++;
      const rangeOfNumbers = isDigit(chars[l]) && isDigit(chars[r]);
      if (!rangeOfNumbers && isWordChar(chars[l]) && isWordChar(chars[r])) hits.push(i);
    }
  }
  return hits.map((i) => ({ column: i + 1 + offset, codepoint: 'U+' + rawChars[i].codePointAt(0).toString(16).toUpperCase().padStart(4, '0') }));
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
    for (const hit of lineHits(raw, masked)) found.push({ line: index + 1, ...hit, text: raw });
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
      for (const hit of findText(buffer.toString('utf8'))) dashes.push({ file: display(file), ...hit });
    }
  }
  return { scanned, dashes };
}

export function format(result) {
  const out = result.dashes.map((d) => d.file + ':' + d.line + ':' + d.column + '  ' + d.codepoint + '  ' + d.text.trim());
  out.push(result.dashes.length + ' dash(es) in ' + result.scanned + ' file(s)');
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
  return result.dashes.length ? 3 : 0;
}

// An installed skill is often a link to its source folder; Node resolves import.meta.url through the link while argv keeps
// the link path, so both sides are compared as real paths or a call through the link exits 0 having done nothing.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) process.exitCode = main(process.argv.slice(2));
