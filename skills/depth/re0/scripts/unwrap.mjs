#!/usr/bin/env node
// Find hard-wrapped markdown paragraphs and list items, and join them onto one source line.
// One paragraph or list item is one source line. Fenced code, tables, quotes, HTML blocks, headings, indented code,
// frontmatter and two-space or backslash hard breaks keep their own breaks and are never joined.
// Fences are matched by character and length, so a three-backtick fence inside a four-backtick block is content.
// --write proves each file before saving it: whitespace-normalized text identical, every fenced block and the frontmatter byte-identical.
// A file that fails the proof is left untouched.
// Usage: node unwrap.mjs <paths...> [--json] [--write]
// Exit codes: 0 nothing wrapped (or everything joined); 3 wrapped text found (report mode); 1 proof failure; 2 usage or an unreadable input.
import { existsSync, readFileSync, readdirSync, realpathSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { resolve, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const USAGE = 'usage: node unwrap.mjs <paths...> [--json] [--write]';

export class InputError extends Error {}

const SKIP_DIRS = new Set(['.git', 'node_modules']);
const MARKDOWN = /\.(?:md|markdown)$/i;

const FENCE_OPEN = /^\s*(\x60{3,}|~{3,})(.*)$/;
const FENCE_CLOSE = /^\s*(\x60{3,}|~{3,})\s*$/;
const THEMATIC = /^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/;
const SETEXT = /^\s{0,3}(?:=+|-+)\s*$/;
const ATX = /^\s{0,3}#{1,6}(?:\s|$)/;
const QUOTE = /^\s*>/;
const TABLE_ROW = /^\s*\|/;
const TABLE_DELIM = /^\s*\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)*\|?\s*$/;
const LIST = /^(\s*)([-*+]|\d{1,9}[.)])(?:(\s+)|$)/;
const REF_DEF = /^\s{0,3}\[[^\]]+\]:/;
const MATH = /^\s*\$\$\s*$/;
const HARD_BREAK = /(?: {2,}|\\)$/;
const HTML_OPEN = /^\s{0,3}<(!--|\?|!\[CDATA\[|!|\/?([A-Za-z][A-Za-z0-9-]*))/;
const HTML_LONE_TAG = /^\s{0,3}<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^<>]*)?\/?>\s*$/;
const RAW_TEXT_TAGS = new Set(['pre', 'script', 'style', 'textarea']);
// CommonMark's block-level HTML names; a line opening with one interrupts a paragraph.
const BLOCK_TAGS = new Set(('address article aside base basefont blockquote body caption center col colgroup dd details dialog dir div dl dt fieldset ' +
  'figcaption figure footer form frame frameset h1 h2 h3 h4 h5 h6 head header hr html iframe legend li link main menu menuitem nav noframes ol ' +
  'optgroup option p param search section summary table tbody td tfoot th thead title tr track ul').split(' '));

const isBlank = (raw) => raw.trim() === '';

function indentOf(raw) {
  let width = 0;
  for (const c of raw) {
    if (c === ' ') width++;
    else if (c === '\t') width += 4 - (width % 4);
    else break;
  }
  return width;
}

// A backtick fence's info string may not contain a backtick, or the line is inline code.
function fenceOpen(raw) {
  const m = FENCE_OPEN.exec(raw);
  if (!m || (m[1][0] === '\x60' && m[2].includes('\x60'))) return null;
  return { char: m[1][0], length: m[1].length };
}

function fenceCloses(raw, fence) {
  const m = FENCE_CLOSE.exec(raw);
  return Boolean(m) && m[1][0] === fence.char && m[1].length >= fence.length;
}

// Every fenced block as its exact text, an unclosed one running to the end of the file.
export function fencedBlocks(lines) {
  const blocks = [];
  let open = null;
  lines.forEach((raw, index) => {
    if (open) {
      if (fenceCloses(raw, open)) {
        blocks.push(lines.slice(open.start, index + 1).join('\n'));
        open = null;
      }
      return;
    }
    const fence = fenceOpen(raw);
    if (fence) open = { ...fence, start: index };
  });
  if (open) blocks.push(lines.slice(open.start).join('\n'));
  return blocks;
}

// Lines before the first line that can hold prose: a leading --- block closed by --- or ...
function frontmatterEnd(lines) {
  if (!lines.length || lines[0].trimEnd() !== '---') return 0;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trimEnd();
    if (line === '---' || line === '...') return i + 1;
  }
  return 0;
}

function htmlStart(raw) {
  const m = HTML_OPEN.exec(raw);
  if (!m) return null;
  if (m[1] === '!--') return { end: /-->/ };
  if (m[1] === '?') return { end: /\?>/ };
  if (m[1].startsWith('![CDATA[')) return { end: /\]\]>/ };
  if (m[1] === '!') return { end: />/ };
  const name = m[2].toLowerCase();
  if (!m[1].startsWith('/') && RAW_TEXT_TAGS.has(name)) return { end: new RegExp('</' + name + '>', 'i') };
  if (BLOCK_TAGS.has(name) || HTML_LONE_TAG.test(raw)) return { end: null };
  return null;
}

// Runs of two or more joinable lines: { start, end (inclusive), kind }, in source order.
export function analyze(lines) {
  const groups = [];
  let cur = null;
  let mode = null;
  let fence = null;
  let list = null;
  let prevBlank = true;

  const flush = () => {
    if (!cur) return;
    const unit = cur;
    cur = null;
    if (unit.protect) return;
    if (unit.lines.slice(1).some((k) => lines[k].includes('|') && TABLE_DELIM.test(lines[k]))) return;
    let run = [unit.lines[0]];
    const close = () => {
      if (run.length > 1) groups.push({ start: run[0], end: run[run.length - 1], kind: unit.kind });
    };
    for (const k of unit.lines.slice(1)) {
      if (HARD_BREAK.test(lines[run[run.length - 1]])) {
        close();
        run = [k];
      } else run.push(k);
    }
    close();
  };

  const step = (raw, i) => {
    const blank = isBlank(raw);
    if (fence) {
      if (fenceCloses(raw, fence)) fence = null;
      return;
    }
    if (mode) {
      if (mode.type === 'math') {
        if (MATH.test(raw)) mode = null;
        return;
      }
      if (mode.type === 'html-end') {
        if (mode.end.test(raw)) mode = null;
        return;
      }
      if (blank) {
        if (mode.type !== 'code') mode = null;
        return;
      }
      if (mode.type === 'code') {
        if (indentOf(raw) >= mode.indent) return;
        mode = null;
      } else if (mode.type === 'html-blank') {
        return;
      } else if (!(LIST.test(raw) || ATX.test(raw) || fenceOpen(raw) || THEMATIC.test(raw))) {
        return;
      } else mode = null;
    }
    if (blank) {
      flush();
      return;
    }
    const indent = indentOf(raw);
    if (list && indent === 0 && prevBlank && !LIST.test(raw)) list = null;
    if (cur && SETEXT.test(raw)) {
      cur.protect = true;
      flush();
      return;
    }
    const codeBase = list ? list.contentCol : 0;
    if (prevBlank && indent >= codeBase + 4) {
      flush();
      mode = { type: 'code', indent: codeBase + 4 };
      return;
    }
    if (THEMATIC.test(raw) || ATX.test(raw)) {
      flush();
      if (indent === 0) list = null;
      return;
    }
    const opened = fenceOpen(raw);
    if (opened) {
      flush();
      fence = opened;
      return;
    }
    if (MATH.test(raw)) {
      flush();
      mode = { type: 'math' };
      return;
    }
    if (QUOTE.test(raw) || TABLE_ROW.test(raw) || REF_DEF.test(raw)) {
      flush();
      mode = { type: 'quote' };
      return;
    }
    const html = htmlStart(raw);
    if (html) {
      flush();
      if (!html.end) mode = { type: 'html-blank' };
      else if (!html.end.test(raw)) mode = { type: 'html-end', end: html.end };
      return;
    }
    const item = LIST.exec(raw);
    if (item) {
      flush();
      const pad = item[3] && item[3].length <= 4 ? item[3].length : 1;
      list = { contentCol: item[1].length + item[2].length + pad };
      const rest = raw.slice(item[0].length);
      const restFence = fenceOpen(rest);
      if (restFence) fence = restFence;
      else if (ATX.test(rest) || QUOTE.test(rest) || TABLE_ROW.test(rest) || htmlStart(rest)) mode = { type: 'quote' };
      else cur = { kind: 'list item', lines: [i] };
      return;
    }
    if (cur) cur.lines.push(i);
    else cur = { kind: list ? 'list item' : 'paragraph', lines: [i] };
  };

  for (let i = frontmatterEnd(lines); i < lines.length; i++) {
    step(lines[i], i);
    prevBlank = isBlank(lines[i]);
  }
  flush();
  return groups;
}

// Joins each group onto its first line; the joined line keeps the terminator of the group's last line.
export function unwrapLines(lines, seps, groups) {
  const outLines = [];
  const outSeps = [];
  let g = 0;
  for (let i = 0; i < lines.length; ) {
    const group = groups[g];
    if (group && group.start === i) {
      const parts = lines.slice(group.start, group.end + 1);
      const head = parts[0].replace(/\s+$/, '');
      const middle = parts.slice(1, -1).map((part) => part.trim());
      const tail = parts[parts.length - 1].replace(/^\s+/, '');
      outLines.push([head, ...middle, tail].join(' '));
      outSeps.push(seps[group.end]);
      i = group.end + 1;
      g++;
    } else {
      outLines.push(lines[i]);
      outSeps.push(seps[i]);
      i++;
    }
  }
  return { lines: outLines, seps: outSeps };
}

const normalize = (text) => text.replace(/\s+/g, ' ').trim();

// Returns the reason a rewrite is unsafe, or null when it keeps the words, every fenced block and the frontmatter.
export function prove(before, after) {
  if (normalize(before.join('\n')) !== normalize(after.join('\n'))) return 'whitespace-normalized text differs';
  const blocksBefore = fencedBlocks(before);
  const blocksAfter = fencedBlocks(after);
  if (blocksBefore.length !== blocksAfter.length || blocksBefore.some((block, k) => block !== blocksAfter[k])) return 'a fenced block changed';
  const end = frontmatterEnd(before);
  if (frontmatterEnd(after) !== end || before.slice(0, end).join('\n') !== after.slice(0, end).join('\n')) return 'frontmatter changed';
  return null;
}

function split(text) {
  const parts = text.split(/(\r?\n)/);
  const lines = [];
  const seps = [];
  for (let i = 0; i < parts.length; i += 2) {
    lines.push(parts[i]);
    seps.push(parts[i + 1] ?? '');
  }
  return { lines, seps };
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
    } else if (entry.isFile() && MARKDOWN.test(entry.name)) files.push(full);
  }
}

export function unwrap(paths, { write = false } = {}) {
  const wrapped = [];
  const written = [];
  const failed = [];
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
      let text = buffer.toString('utf8');
      const bom = text.startsWith('\uFEFF');
      if (bom) text = text.slice(1);
      const { lines, seps } = split(text);
      const groups = analyze(lines);
      const name = display(file);
      for (const group of groups) wrapped.push({ file: name, line: group.start + 1, lines: group.end - group.start + 1, kind: group.kind });
      if (!write || !groups.length) continue;
      const next = unwrapLines(lines, seps, groups);
      const reason = prove(lines, next.lines);
      if (reason) {
        failed.push({ file: name, reason });
        continue;
      }
      const body = next.lines.map((line, k) => line + next.seps[k]).join('');
      const temp = file + '.unwrap.tmp';
      writeFileSync(temp, (bom ? '\uFEFF' : '') + body);
      renameSync(temp, file);
      written.push(name);
    }
  }
  return { scanned, wrapped, written, failed };
}

export function format(result, write) {
  const out = result.wrapped.map((w) => w.file + ':' + w.line + '  ' + w.kind + ', ' + w.lines + ' lines');
  for (const f of result.failed) out.push('proof failed, left unchanged: ' + f.file + ' (' + f.reason + ')');
  const files = new Set(result.wrapped.map((w) => w.file)).size;
  out.push(result.wrapped.length + ' wrapped paragraph(s) or list item(s) in ' + files + ' of ' + result.scanned + ' file(s)' +
    (write ? ', ' + result.written.length + ' file(s) rewritten' : ''));
  return out.join('\n');
}

export function main(argv) {
  let values;
  let positionals;
  try {
    ({ values, positionals } = parseArgs({ args: argv, allowPositionals: true, options: { json: { type: 'boolean' }, write: { type: 'boolean' }, help: { type: 'boolean' } } }));
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
    result = unwrap(positionals, { write: Boolean(values.write) });
  } catch (error) {
    if (error instanceof InputError) {
      console.error('unwrap: ' + error.message + '\n' + USAGE);
      return 2;
    }
    throw error;
  }
  console.log(values.json ? JSON.stringify(result) : format(result, Boolean(values.write)));
  if (result.failed.length) return 1;
  if (values.write) return 0;
  return result.wrapped.length ? 3 : 0;
}

// An installed skill is often a link to its source folder; Node resolves import.meta.url through the link while argv keeps
// the link path, so both sides are compared as real paths or a call through the link exits 0 having done nothing.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) process.exitCode = main(process.argv.slice(2));
