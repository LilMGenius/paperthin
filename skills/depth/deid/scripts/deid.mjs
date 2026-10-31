#!/usr/bin/env node
// Find one person's or one organization's values (needles) in a shared tree, replace them from a recorded decision file, and
// list the commits whose patches or messages carry them. Output names each needle by its label, never by its value.
// Usage: node deid.mjs scan <root> --needles <file> [--decisions <file>] [--no-git] [--json]
//        node deid.mjs apply <root> --needles <file> --decisions <file> [--no-git] [--json]
//        node deid.mjs history <root> --needles <file> [--decisions <file>] [--rev <rev>]... [--json]
// Exit codes: 0 nothing left to decide; 3 a hit remains (scan, apply) or history carries a needle; 2 usage or a broken input file.
import { existsSync, readFileSync, readdirSync, realpathSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const USAGE = 'usage: node deid.mjs <scan|apply|history> <root> --needles <file> [--decisions <file>] [--rev <rev>]... [--no-git] [--json]';
const MIN_LENGTH = 3;
const SKIP_DIRS = new Set(['.git', 'node_modules']);

export class InputError extends Error {}

const toPosix = (path) => path.split(sep).join('/');
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function readJson(file, what) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    throw new InputError(what + ' ' + file + ' is not readable JSON: ' + error.message.split('\n')[0]);
  }
}

// A needle is { label, value, ci?, regex? }. Each becomes one global regular expression, so a case-insensitive match keeps its
// true position and length, which lowercasing the text would not.
export function loadNeedles(file) {
  const rows = readJson(file, 'needle file');
  if (!Array.isArray(rows) || !rows.length) throw new InputError('needle file ' + file + ' must be a non-empty JSON array');
  const labels = new Set();
  return rows.map((row, i) => {
    if (!row || typeof row.label !== 'string' || !row.label.trim()) throw new InputError('needle ' + (i + 1) + ' has no label');
    if (labels.has(row.label)) throw new InputError('needle ' + (i + 1) + ' repeats the label ' + row.label);
    labels.add(row.label);
    if (typeof row.value !== 'string' || !row.value) throw new InputError('needle ' + row.label + ' has no value');
    if (!row.regex && row.value.trim().length < MIN_LENGTH) throw new InputError('needle ' + row.label + ' is shorter than ' + MIN_LENGTH + ' characters, too short to mean one value; write it as a regex with boundaries');
    let re;
    try {
      re = new RegExp(row.regex ? row.value : escapeRegExp(row.value), 'g' + (row.ci ? 'i' : ''));
    } catch (error) {
      throw new InputError('needle ' + row.label + ' is not a valid regular expression: ' + error.message);
    }
    if (re.test('')) throw new InputError('needle ' + row.label + ' matches the empty string');
    return { label: row.label, re };
  });
}

export function matches(needle, text) {
  const found = [];
  needle.re.lastIndex = 0;
  for (const m of text.matchAll(needle.re)) if (m[0]) found.push({ label: needle.label, start: m.index, end: m.index + m[0].length });
  return found;
}

// A path glob: ** crosses folders, * and ? stay inside one; a glob with no wildcard also names a folder and everything under it.
function globToRegExp(glob) {
  let out = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*' && glob[i + 1] === '*') {
      const slash = glob[i + 2] === '/';
      out += slash ? '(?:.*/)?' : '.*';
      i += slash ? 2 : 1;
    } else if (c === '*') out += '[^/]*';
    else if (c === '?') out += '[^/]';
    else out += escapeRegExp(c);
  }
  return new RegExp('^' + out + (/[*?]/.test(glob) ? '' : '(?:/.*)?') + '$');
}

// A decision is { needle: <label>, replace: <text> } or { needle, keep: <reason> }, optionally scoped by paths: [globs]. The first
// row in file order whose needle and paths fit a hit decides it. A replacement that itself carries a needle is refused.
export function loadDecisions(file, needles) {
  const rows = readJson(file, 'decision file');
  if (!Array.isArray(rows)) throw new InputError('decision file ' + file + ' must be a JSON array');
  const labels = new Set(needles.map((n) => n.label));
  return rows.map((row, i) => {
    const where = 'decision ' + (i + 1);
    if (!row || !labels.has(row.needle)) throw new InputError(where + ' names ' + JSON.stringify(row && row.needle) + ', which is no needle label');
    const replace = typeof row.replace === 'string';
    const keep = typeof row.keep === 'string' && row.keep.trim() !== '';
    if (replace === keep) throw new InputError(where + ' (' + row.needle + ') needs exactly one of replace or keep, and a keep states its reason');
    if (replace) {
      const carried = needles.filter((n) => matches(n, row.replace).length).map((n) => n.label);
      if (carried.length) throw new InputError(where + ' replaces ' + row.needle + ' with text that still carries the needle ' + carried.join(', '));
    }
    if (row.paths !== undefined && (!Array.isArray(row.paths) || !row.paths.every((p) => typeof p === 'string' && p))) throw new InputError(where + ' paths must be an array of globs');
    return { needle: row.needle, replace: replace ? row.replace : null, keep: keep ? row.keep : null, paths: row.paths ? row.paths.map(globToRegExp) : null };
  });
}

export function decide(decisions, label, file) {
  return decisions.find((d) => d.needle === label && (!d.paths || d.paths.some((re) => re.test(file)))) || null;
}

function git(root, args) {
  const run = spawnSync('git', ['-C', root, '-c', 'core.quotePath=false', ...args], { maxBuffer: 1 << 30 });
  if (run.error) throw run.error;
  return { status: run.status, stdout: run.stdout, stderr: run.stderr.toString() };
}

function walk(root, dir, files) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(root, full, files);
    } else if (entry.isFile()) files.push(toPosix(relative(root, full)));
  }
}

// The shared artifact: inside a git work tree, every tracked or untracked file git does not ignore; elsewhere, every file.
// The needle and decision files are left out wherever they sit, since they hold the values themselves.
export function listFiles(root, { useGit = true, exclude = [] } = {}) {
  let files;
  if (useGit && git(root, ['rev-parse', '--is-inside-work-tree']).stdout.toString().trim() === 'true') {
    const run = git(root, ['ls-files', '-z', '--cached', '--others', '--exclude-standard']);
    if (run.status !== 0) throw new InputError('git ls-files failed: ' + run.stderr.trim());
    files = [...new Set(run.stdout.toString('utf8').split('\0').filter(Boolean))].filter((f) => existsSync(join(root, f)) && statSync(join(root, f)).isFile());
  } else {
    files = [];
    walk(root, root, files);
  }
  const skip = new Set(exclude.map((f) => realpathSync(f)));
  return files.filter((f) => !skip.has(realpathSync(join(root, f)))).sort();
}

const UTF8 = new TextDecoder('utf-8', { fatal: true });

// Text is UTF-8 with no NUL byte; anything else is searched byte for byte as latin1 and only ever reported, never rewritten.
function readText(path) {
  const bytes = readFileSync(path);
  if (!bytes.includes(0)) {
    try {
      return { text: UTF8.decode(bytes), binary: false };
    } catch (error) {
      if (!(error instanceof TypeError)) throw error;
    }
  }
  return { text: bytes.toString('latin1'), binary: true };
}

function lineStarts(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === '\n') starts.push(i + 1);
  return starts;
}

function position(starts, index) {
  let lo = 0;
  let hi = starts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (starts[mid] <= index) lo = mid;
    else hi = mid - 1;
  }
  return { line: lo + 1, column: index - starts[lo] + 1 };
}

const hitAt = (file, binary, starts, m) => (binary ? { file, line: 0, column: 0, label: m.label, binary: true } : { file, ...position(starts, m.start), label: m.label, binary: false });

// Every hit of every needle; a hit a keep decision covers is counted as kept rather than reported.
export function scan(root, needles, { decisions = [], useGit = true, exclude = [] } = {}) {
  const hits = [];
  let kept = 0;
  const files = listFiles(root, { useGit, exclude });
  for (const file of files) {
    const { text, binary } = readText(join(root, file));
    const starts = binary ? null : lineStarts(text);
    for (const needle of needles) {
      for (const m of matches(needle, text)) {
        if (decide(decisions, m.label, file)?.keep) kept++;
        else hits.push(hitAt(file, binary, starts, m));
      }
    }
  }
  hits.sort((a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : a.line - b.line || a.column - b.column || (a.label < b.label ? -1 : 1)));
  return { files: files.length, kept, hits };
}

// Overlapping hits resolve to the earliest, then the longest, so a full name is replaced before the first name inside it.
export function rewrite(text, needles, decisions, file) {
  const all = needles.flatMap((n) => matches(n, text)).sort((a, b) => a.start - b.start || b.end - a.end);
  const chosen = [];
  for (const m of all) if (!chosen.length || m.start >= chosen.at(-1).end) chosen.push(m);
  let out = '';
  let at = 0;
  let replaced = 0;
  let kept = 0;
  const open = [];
  for (const m of chosen) {
    const d = decide(decisions, m.label, file);
    if (d && d.replace !== null) {
      out += text.slice(at, m.start) + d.replace;
      at = m.end;
      replaced++;
    } else if (d) kept++;
    else open.push(m);
  }
  return { text: out + text.slice(at), replaced, kept, open };
}

// A changed file is written beside its target and renamed over it, so a failed write leaves the old copy whole; an equal file
// is never written. A file that is not UTF-8 text is only reported.
export function apply(root, needles, decisions, { useGit = true, exclude = [] } = {}) {
  const changed = [];
  const unresolved = [];
  let kept = 0;
  for (const file of listFiles(root, { useGit, exclude })) {
    const path = join(root, file);
    const { text, binary } = readText(path);
    if (binary) {
      for (const m of needles.flatMap((n) => matches(n, text))) {
        if (decide(decisions, m.label, file)?.keep) kept++;
        else unresolved.push(hitAt(file, true, null, m));
      }
      continue;
    }
    const result = rewrite(text, needles, decisions, file);
    kept += result.kept;
    const starts = lineStarts(text);
    for (const m of result.open) unresolved.push(hitAt(file, false, starts, m));
    if (result.text !== text) {
      const temp = path + '.deid-' + process.pid;
      writeFileSync(temp, result.text);
      renameSync(temp, path);
      changed.push({ file, replaced: result.replaced });
    }
  }
  return { changed, kept, unresolved };
}

// Read-only: the commits whose patch adds a needle to a file, and the commits whose message carries one. Nothing is moved or written.
export function history(root, needles, { decisions = [], revs = ['--all'] } = {}) {
  if (git(root, ['rev-parse', '--git-dir']).status !== 0) throw new InputError('history needs a git repository: ' + root);
  const byLabel = new Map(needles.map((n) => [n.label, { label: n.label, content: [], messages: [] }]));
  const patch = git(root, ['log', ...revs, '-p', '-U0', '--text', '--no-color', '--no-ext-diff', '--no-textconv', '--no-renames', '--diff-merges=first-parent', '--format=%x1eDEID %H']);
  if (patch.status !== 0) throw new InputError('git log failed: ' + patch.stderr.trim());
  let commit = null;
  let path = null;
  let added = [];
  let oldLeft = 0;
  let newLeft = 0;
  const flush = () => {
    if (commit && path && added.length) {
      const body = added.join('\n');
      for (const needle of needles) {
        if (!matches(needle, body).length || decide(decisions, needle.label, path)?.keep) continue;
        const entries = byLabel.get(needle.label).content;
        if (!entries.some((e) => e.commit === commit && e.path === path)) entries.push({ commit, path });
      }
    }
    added = [];
  };
  for (const line of patch.stdout.toString('utf8').split('\n')) {
    if (oldLeft > 0 || newLeft > 0) {
      if (line.startsWith('+')) {
        added.push(line.slice(1));
        newLeft--;
      } else if (line.startsWith('-')) oldLeft--;
      else if (line.startsWith(' ')) {
        oldLeft--;
        newLeft--;
      }
      continue;
    }
    if (line.startsWith('\x1eDEID ')) {
      flush();
      commit = line.slice(6).trim();
      path = null;
    } else if (line.startsWith('diff --git ')) {
      flush();
      path = null;
    } else if (line.startsWith('+++ ')) {
      const target = line.slice(4).replace(/^"(.*)"$/, '$1');
      path = target === '/dev/null' ? null : target.replace(/^b\//, '');
    } else if (line.startsWith('@@ ')) {
      const hunk = line.match(/^@@ -\d+(?:,(\d+))? \+\d+(?:,(\d+))? @@/);
      if (hunk) {
        oldLeft = hunk[1] === undefined ? 1 : Number(hunk[1]);
        newLeft = hunk[2] === undefined ? 1 : Number(hunk[2]);
      }
    }
  }
  flush();
  const log = git(root, ['log', ...revs, '--format=%H%x1f%B%x1e']);
  if (log.status !== 0) throw new InputError('git log failed: ' + log.stderr.trim());
  let commits = 0;
  for (const entry of log.stdout.toString('utf8').split('\x1e')) {
    const [id, body] = entry.replace(/^\n/, '').split('\x1f');
    if (!id || body === undefined) continue;
    commits++;
    for (const needle of needles) if (matches(needle, body).length) byLabel.get(needle.label).messages.push(id);
  }
  return { revs, commits, needles: [...byLabel.values()].filter((e) => e.content.length || e.messages.length) };
}

const where = (h) => h.file + (h.binary ? ' (not UTF-8 text)' : ':' + h.line + ':' + h.column);

function formatScan(result) {
  const out = result.hits.map((h) => where(h) + '  ' + h.label);
  out.push(result.hits.length + ' hit(s) in ' + result.files + ' file(s); ' + result.kept + ' kept by decision');
  return out.join('\n');
}

function formatApply(result) {
  const out = result.changed.map((c) => 'rewrote ' + c.file + ' (' + c.replaced + ' replacement(s))');
  for (const h of result.unresolved) out.push('open ' + where(h) + '  ' + h.label + (h.binary ? '  (never rewritten; decide it by hand)' : '  (no decision fits)'));
  out.push(result.changed.length + ' file(s) rewritten; ' + result.kept + ' kept by decision; ' + result.unresolved.length + ' hit(s) still open');
  return out.join('\n');
}

function formatHistory(result) {
  const out = [];
  for (const e of result.needles) {
    out.push(e.label);
    for (const c of e.content) out.push('  content ' + c.commit.slice(0, 12) + ' ' + c.path);
    for (const id of e.messages) out.push('  message ' + id.slice(0, 12));
  }
  out.push(result.commits + ' commit(s) read from ' + result.revs.join(' ') + '; ' + result.needles.length + ' needle(s) found in history; nothing was rewritten');
  if (result.needles.some((e) => e.content.length)) out.push('Past file contents carry needles. Removing them means rewriting every listed commit and its descendants with a content-rewriting tool, then a force push of each ref; clones, forks and the host may still serve the old commits. That decision is the owner\'s, and this scan ran none of it.');
  if (result.needles.some((e) => e.messages.length)) out.push('Commit messages carry needles: hand the listed commits to the human to run /re0-git.');
  return out.join('\n');
}

export function main(argv) {
  let values;
  let positionals;
  try {
    ({ values, positionals } = parseArgs({ args: argv, allowPositionals: true, options: {
      needles: { type: 'string' }, decisions: { type: 'string' }, rev: { type: 'string', multiple: true, default: [] },
      'no-git': { type: 'boolean' }, json: { type: 'boolean' }, help: { type: 'boolean' },
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
  const [command, rootArg] = positionals;
  try {
    if (!['scan', 'apply', 'history'].includes(command) || !rootArg || positionals.length > 2) throw new InputError('name one command and one root');
    const root = resolve(rootArg);
    if (!existsSync(root) || !statSync(root).isDirectory()) throw new InputError('no such folder: ' + rootArg);
    if (!values.needles) throw new InputError('--needles is required');
    if (command === 'apply' && !values.decisions) throw new InputError('apply needs --decisions');
    const needles = loadNeedles(values.needles);
    const decisions = values.decisions ? loadDecisions(values.decisions, needles) : [];
    const options = { decisions, useGit: !values['no-git'], exclude: [values.needles, values.decisions].filter(Boolean) };
    let result;
    let open;
    let text;
    if (command === 'scan') {
      result = scan(root, needles, options);
      open = result.hits.length;
      text = formatScan(result);
    } else if (command === 'apply') {
      result = apply(root, needles, decisions, options);
      open = result.unresolved.length;
      text = formatApply(result);
    } else {
      result = history(root, needles, { decisions, revs: values.rev.length ? values.rev : ['--all'] });
      open = result.needles.length;
      text = formatHistory(result);
    }
    console.log(values.json ? JSON.stringify(result) : text);
    return open ? 3 : 0;
  } catch (error) {
    if (error instanceof InputError) {
      console.error('deid: ' + error.message + '\n' + USAGE);
      return 2;
    }
    throw error;
  }
}

// An installed skill is often a link to its source folder; Node resolves import.meta.url through the link while argv keeps
// the link path, so both sides are compared as real paths or a call through the link exits 0 having done nothing.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) process.exitCode = main(process.argv.slice(2));

