#!/usr/bin/env node
// List candidates for a test double, a swallowed failure or a placeholder standing on a real code path, outside the test paths.
// A candidate is a lead for a reader, never a verdict: the skill decides whether it reaches the real path and what it is.
// Usage: node scan.mjs <paths...> [--test-glob <glob>]... [--json]
// Exit codes: 0 no candidate; 3 one or more candidates; 2 usage or an unreadable input.
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { basename, dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const USAGE = 'usage: node scan.mjs <paths...> [--test-glob <glob>]... [--json]';
export const KINDS = Object.freeze(['mock-import', 'double-name', 'not-implemented', 'swallow', 'placeholder-return']);

export class InputError extends Error {}

const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist', 'build']);
const SOURCE = new Set(['.js', '.mjs', '.cjs', '.jsx', '.ts', '.mts', '.cts', '.tsx', '.py', '.go', '.java', '.kt', '.kts', '.scala', '.cs', '.rb', '.rs', '.php', '.swift']);
const TEST_DIRS = new Set(['test', 'tests', '__tests__', 'spec', 'fixtures']);
const TEST_FILES = [/\.test\.[^/]+$/, /\.spec\.[^/]+$/, /^test_[^/]*\.py$/, /_test\.py$/, /_test\.go$/, /^conftest\.py$/];

// A glob without a slash matches any one path segment, as in .gitignore; with a slash it matches the whole path.
export function globToRegExp(glob) {
  let out = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*' && glob[i + 1] === '*') {
      const slash = glob[i + 2] === '/';
      out += slash ? '(?:.*/)?' : '.*';
      i += slash ? 2 : 1;
    } else if (c === '*') out += '[^/]*';
    else if (c === '?') out += '[^/]';
    else out += c.replace(/[.+^$\{}()|[\]\\]/g, '\\$&');
  }
  return new RegExp('^' + out + '$');
}

export function isTestPath(rel, globs = []) {
  const segments = rel.split('/');
  const name = segments.at(-1);
  if (segments.slice(0, -1).some((s) => TEST_DIRS.has(s))) return true;
  if (TEST_FILES.some((re) => re.test(name))) return true;
  return globs.some((glob) => {
    const re = globToRegExp(glob);
    return glob.includes('/') ? re.test(rel) : segments.some((s) => re.test(s));
  });
}

// Values a failure is commonly turned into: an empty collection, null, a boolean, an empty string, zero, or a named default.
const JS_DEFAULT = '(?:\\[\\s*\\]|\\{\\s*\\}|null|undefined|nil|true|false|\x27\x27|""|\x60\x60|-?[01]|new\\s+(?:Map|Set|Array)\\(\\s*\\)|[\\w$.]*(?:default|fallback|empty)[\\w$]*)';
const JS_RETURN = new RegExp('(?:^|[\\s;{])return(?:\\s+' + JS_DEFAULT + ')?\\s*(?:;|\\}|$)', 'im');
const JS_ARROW_VALUE = new RegExp('^' + JS_DEFAULT + '\\s*\\)');
const PY_RETURN = /^\s*return(?:\s+(?:None|True|False|\[\s*\]|\{\s*\}|\(\s*\)|''|""|-?[01]|set\(\)|dict\(\)|list\(\)|\w*(?:default|fallback|empty)\w*))?\s*(?:#.*)?$/i;

const LINE_RULES = [
  ['mock-import', /\bunittest\.mock\b|^\s*from\s+unittest\s+import\s+.*\bmock\b|^\s*(?:import|from)\s+mock\b/],
  ['mock-import', /\b(?:jest|vi)\.(?:mock|doMock)\s*\(/],
  ['mock-import', /(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)['"](?:sinon|testdouble|nock|msw)(?:\/[^'"]*)?['"]/],
  ['mock-import', /["'][\w./-]*\/gomock["']/],
  ['mock-import', /^\s*import\s+(?:static\s+)?org\.mockito\b/],
  ['double-name', /\b(?:class|interface|struct|type|function|def|const|let|var|fn|enum|record|object|func\s+(?:\([^)]*\)\s*)?)\s*\*?\s*(?:(?:Fake|Stub|Mock|Dummy)(?![a-z])|(?:fake|stub|mock|dummy)_)\w*/],
  ['not-implemented', /\braise\s+NotImplementedError\b|\b(?:throw|panic)\b.*\bnot\s+implemented\b|\b(?:todo|unimplemented)!\s*\(/i],
  ['placeholder-return', /\breturn\b.*\b(?:TODO|FIXME|placeholder)\b/i],
];

function lineOf(starts, index) {
  let lo = 0;
  let hi = starts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (starts[mid] <= index) lo = mid;
    else hi = mid - 1;
  }
  return lo + 1;
}

// The index just past the brace that closes the one at open, skipping strings and comments.
function blockEnd(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (c === '/' && text[i + 1] === '/') i = text.indexOf('\n', i) === -1 ? text.length : text.indexOf('\n', i);
    else if (c === '/' && text[i + 1] === '*') i = text.indexOf('*/', i + 2) === -1 ? text.length : text.indexOf('*/', i + 2) + 1;
    else if (c === '"' || c === "'" || c === '`') {
      for (i++; i < text.length && text[i] !== c; i++) if (text[i] === '\\') i++;
    } else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return i + 1;
  }
  return text.length;
}

function braceSwallows(text, starts, lines, hits) {
  const evidence = (at, body) => (lines[lineOf(starts, at) - 1].trim() + (body.includes('\n') ? ' ... ' + body.match(JS_RETURN)[0].trim() : '')).slice(0, 160);
  for (const m of text.matchAll(/(?<![\w$.])catch\s*(?:\([^)]*\))?\s*\{/g)) {
    const open = m.index + m[0].length - 1;
    const body = text.slice(open + 1, blockEnd(text, open) - 1);
    if (JS_RETURN.test(body)) hits.push({ line: lineOf(starts, m.index), kind: 'swallow', evidence: evidence(m.index, body) });
  }
  for (const m of text.matchAll(/\.catch\s*\(\s*(?:async\s+)?(?:\([^)]*\)|[\w$]+)?\s*=>\s*/g)) {
    const at = m.index + m[0].length;
    const swallows = text[at] === '{' ? JS_RETURN.test(text.slice(at + 1, blockEnd(text, at) - 1)) : JS_ARROW_VALUE.test(text.slice(at));
    if (swallows) hits.push({ line: lineOf(starts, m.index), kind: 'swallow', evidence: lines[lineOf(starts, m.index) - 1].trim().slice(0, 160) });
  }
}

// A Python except block is the inline statement after its colon, or the lines indented deeper than the except.
function pythonSwallows(lines, hits) {
  const indent = (line) => line.match(/^\s*/)[0].length;
  lines.forEach((line, i) => {
    const m = line.match(/^(\s*)except\b[^:]*:\s*(.*)$/);
    if (!m) return;
    const body = [];
    if (m[2] && !m[2].startsWith('#')) body.push(m[2]);
    else {
      for (let j = i + 1; j < lines.length; j++) {
        if (!lines[j].trim() || lines[j].trim().startsWith('#')) continue;
        if (indent(lines[j]) <= m[1].length) break;
        body.push(lines[j]);
      }
    }
    const ret = body.find((stmt) => PY_RETURN.test(stmt));
    if (ret !== undefined) hits.push({ line: i + 1, kind: 'swallow', evidence: (line.trim() + (ret === m[2] ? '' : ' ... ' + ret.trim())).slice(0, 160) });
  });
}

export function scanText(text, ext) {
  const lines = text.split(/\r?\n/);
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === '\n') starts.push(i + 1);
  const hits = [];
  lines.forEach((line, i) => {
    const seen = new Set();
    for (const [kind, re] of LINE_RULES) {
      if (!seen.has(kind) && re.test(line)) {
        seen.add(kind);
        hits.push({ line: i + 1, kind, evidence: line.trim().slice(0, 160) });
      }
    }
  });
  if (ext === '.py') pythonSwallows(lines, hits);
  else braceSwallows(text, starts, lines, hits);
  return hits.sort((a, b) => a.line - b.line || KINDS.indexOf(a.kind) - KINDS.indexOf(b.kind));
}

const toPosix = (path) => path.split(sep).join('/');

// The path a test convention is read against: relative to the working directory when the file sits inside it, else
// relative to the parent of the argument that reached it, so a scanned tests/ folder still counts as tests.
function conventionPath(file, arg) {
  const fromCwd = relative(process.cwd(), file);
  if (fromCwd && !fromCwd.startsWith('..') && !isAbsolute(fromCwd)) return toPosix(fromCwd);
  return toPosix(relative(dirname(arg), file));
}

function walk(dir, files) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(full, files);
    } else if (entry.isFile() && SOURCE.has(extname(entry.name))) files.push(full);
  }
}

export function scan(paths, { testGlobs = [] } = {}) {
  const candidates = [];
  let scanned = 0;
  let testFiles = 0;
  for (const raw of paths) {
    const arg = resolve(raw);
    if (!existsSync(arg)) throw new InputError('no such path: ' + raw);
    const files = [];
    if (statSync(arg).isDirectory()) walk(arg, files);
    else files.push(arg);
    for (const file of files.sort()) {
      const rel = conventionPath(file, arg);
      if (isTestPath(rel, testGlobs)) {
        testFiles++;
        continue;
      }
      scanned++;
      for (const hit of scanText(readFileSync(file, 'utf8'), extname(file))) candidates.push({ file: rel.startsWith('..') ? toPosix(file) : rel, ...hit });
    }
  }
  return { scanned, testFiles, testGlobs, candidates };
}

export function format(result) {
  const out = result.candidates.map((c) => c.file + ':' + c.line + '  ' + c.kind + '  ' + c.evidence);
  out.push(result.candidates.length + ' candidate(s) in ' + result.scanned + ' file(s); ' + result.testFiles + ' test file(s) skipped');
  return out.join('\n');
}

export function main(argv) {
  let values;
  let positionals;
  try {
    ({ values, positionals } = parseArgs({ args: argv, allowPositionals: true, options: {
      'test-glob': { type: 'string', multiple: true, default: [] }, json: { type: 'boolean' }, help: { type: 'boolean' },
    } }));
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
    result = scan(positionals, { testGlobs: values['test-glob'] });
  } catch (error) {
    if (error instanceof InputError) {
      console.error('scan: ' + error.message + '\n' + USAGE);
      return 2;
    }
    throw error;
  }
  console.log(values.json ? JSON.stringify(result) : format(result));
  return result.candidates.length ? 3 : 0;
}

// An installed skill is often a link to its source folder; Node resolves import.meta.url through the link while argv keeps
// the link path, so both sides are compared as real paths or a call through the link exits 0 having done nothing.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) process.exitCode = main(process.argv.slice(2));
