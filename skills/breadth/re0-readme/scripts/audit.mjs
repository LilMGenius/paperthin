#!/usr/bin/env node
// Report the lines of a repository's README.md written for an agent and the lines of its AGENTS.md written for a person.
// The rules are one table with stable ids; every matching rule is reported, sorted by file, line and id.
// Usage: node audit.mjs [<repo-root>] [--kind app|cli|library|skills] [--loop-dir <name>]... [--strict] [--json] [--rules]
// Exit codes: 0 no fail finding; 1 a fail finding, any finding under --strict, or no AGENTS.md; 2 usage or an unreadable input.
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

export const KINDS = Object.freeze(['app', 'cli', 'library', 'skills']);
const USAGE = 'usage: node audit.mjs [<repo-root>] [--kind ' + KINDS.join('|') + '] [--loop-dir <name>]... [--strict] [--json] [--rules]';

export class InputError extends Error {}

const isDir = (path) => existsSync(path) && statSync(path).isDirectory();
const subdirs = (dir) => (isDir(dir) ? readdirSync(dir).filter((name) => !name.startsWith('.') && name !== 'node_modules' && isDir(join(dir, name))) : []);

function readPackage(dir) {
  const file = join(dir, 'package.json');
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    if (error instanceof SyntaxError) throw new InputError(file + ' does not parse: ' + error.message);
    throw error;
  }
}

// The same line is product surface in one kind and drift in another: commands are the product of a CLI, agent
// vocabulary is the subject of a skills catalog, pictures are the product of an app. Read from files, never from prose.
export function detectKind(dir) {
  const has = (path) => existsSync(join(dir, path));
  const skillsAt = (base, depth) => subdirs(base).reduce((n, name) => n + (existsSync(join(base, name, 'SKILL.md')) ? 1 : 0) + (depth > 0 ? skillsAt(join(base, name), depth - 1) : 0), 0);
  const skillFolders = skillsAt(dir, 0) + (has('skills') ? skillsAt(join(dir, 'skills'), 1) : 0);
  const pkg = readPackage(dir);
  if (skillFolders >= 2 && !(pkg && (pkg.bin || pkg.workspaces))) return 'skills';
  const workspaceBin = pkg && pkg.workspaces && has('packages') && subdirs(join(dir, 'packages')).some((name) => readPackage(join(dir, 'packages', name))?.bin);
  if ((pkg && pkg.bin) || workspaceBin) return 'cli';
  if (has('Cargo.toml') && has(join('src', 'main.rs'))) return 'cli';
  if (has('pyproject.toml') && /\[project\.scripts\]/.test(readFileSync(join(dir, 'pyproject.toml'), 'utf8'))) return 'cli';
  if (pkg && (pkg.workspaces || has('apps') || has('index.html') || has('public'))) return 'app';
  if (pkg && (pkg.main || pkg.exports || pkg.module)) return 'library';
  if (has('Cargo.toml') || has('pyproject.toml') || has('go.mod')) return 'library';
  return 'app';
}

// A dot-directory the repository's own .gitignore excludes never exists in a clone, so a README pointing a reader into it
// points at an agent's or a tool's local state. Names come from the repository, never from a list of harnesses.
export function ignoredDotDirs(dir) {
  const file = join(dir, '.gitignore');
  if (!existsSync(file)) return [];
  const names = readFileSync(file, 'utf8').split(/\r?\n/).map((line) => line.trim().replace(/^\//, '').replace(/\/$/, ''));
  return [...new Set(names.filter((name) => /^\.[\w.-]+$/.test(name)))];
}

const escape = (text) => text.replace(/[.*+?^$\{}()|[\]\\]/g, '\\$&');
const LOCAL_FILE = '\\.local\\.(md|json|txt|log|sqlite)\\b|\\*\\.local\\*';
const CHECK_WORDS = /^(\$\s*)?(pnpm|npm|yarn|bun|corepack|npx|cargo|make|go|python3?|uv)\s+(run\s+|-r\s+)?(check|lint|test|typecheck|verify|sweep|walk|gate|audit)/i;
const README_SEV = { app: 'fail', cli: 'note', library: 'note', skills: 'note' };
const AGENTS_SEV = { app: 'fail', cli: 'fail', library: 'fail', skills: 'fail' };

// Severity per kind: "fail" exits 1, "note" is reported, "off" is not checked. --strict raises note to fail.
export function buildRules(localDirs) {
  const dirs = localDirs.length ? '(^|[\\s\x60(/])(' + localDirs.map(escape).join('|') + ')/|' : '';
  const rule = (id, file, why, re, sev) => ({ id, file, why, re, sev });
  return [
    rule('R1', 'README.md', 'a check, lint, test or gate command', /(^|[\s\x60])(pnpm|npm|yarn|bun|corepack|npx|cargo|make|go|python3?|uv|poetry|mvn|gradle)\s+(run\s+|-r\s+)?(check|lint|test|typecheck|verify|sweep|walk|gate|audit)[\w:.-]*/i, README_SEV),
    rule('R2', 'README.md', 'a repository script invoked by path', /(^|[\s\x60])(node|python3?|bash|sh|bun|deno)\s+[\w./-]*scripts\/[\w./-]+/, README_SEV),
    rule('R3', 'README.md', 'a port number', /\b(localhost|127\.0\.0\.1|0\.0\.0\.0):\d{2,5}\b|\bport\s*:?\s*\d{2,5}\b/i, README_SEV),
    rule('R4', 'README.md', 'an environment variable being set or prescribed', /(^|[\s\x60(])[A-Z][A-Z0-9]*_[A-Z0-9_]{2,}=|\b(set|export|give|pass|with)\s+\x60?[A-Z][A-Z0-9]*_[A-Z0-9_]{2,}\x60?(\s|=|$)/, README_SEV),
    rule('R5', 'README.md', 'a loop-state or local-only path', new RegExp(dirs + LOCAL_FILE), README_SEV),
    rule('R6', 'README.md', 'an evidence, capture or transcript path', /(?<![\w-])(evidence|transcripts?|screencasts?|captures?|rollouts?)\/[\w.-]+/i, README_SEV),
    rule('R7', 'README.md', 'loop or harness vocabulary', /\b(checkpoint(ed|s)?|sub-?agents?|context window|compaction|force[- ]with[- ]lease|orphan commit|signed commits?|--porcelain|quality gate|gate is green|gates? (are|were) green)\b/i, { ...README_SEV, skills: 'off' }),
    rule('R8', 'README.md', 'a process obligation on the reader (before committing, must pass, run before)', /\b(before (committing|merging|opening a PR|a commit)|must (be|pass|stay) green|run (this|these|it) before)\b/i, README_SEV),
    rule('R9', 'README.md', 'a code fence whose first command is a check', null, README_SEV),
    rule('A1', 'AGENTS.md', 'an image', /!\[[^\]]*\]\([^)]*\.(gif|png|jpe?g|webp|svg)\)|<img\s/i, AGENTS_SEV),
    rule('A2', 'AGENTS.md', 'a badge', /img\.shields\.io|\[!\[/i, AGENTS_SEV),
    rule('A3', 'AGENTS.md', 'a pitch sentence', /\b(imagine|your team will|the best way to|world[- ]class|blazing(ly)? fast|delightful|effortless(ly)?|seamless(ly)?)\b/i, AGENTS_SEV),
    rule('A4', 'AGENTS.md', 'an instruction phrased for a player or end user', /^(press|tap|drag|walk|click)\s+(the\s+)?[A-Z][^\x60{}<>]{0,50}$/im, AGENTS_SEV),
  ];
}

// One pass over the file: prose lines and fenced blocks, each fence with its first command line.
const FENCE = /^\s*(\x60{3,}|~{3,})/;
export function parse(text) {
  const lines = [];
  const fences = [];
  let open = null;
  text.split(/\r?\n/).forEach((raw, i) => {
    const n = i + 1;
    if (FENCE.test(raw)) {
      if (open) {
        fences.push(open);
        open = null;
      } else open = { start: n, first: '' };
      lines.push({ n, raw, code: true });
      return;
    }
    if (open) {
      if (!open.first && raw.trim()) open.first = raw.trim();
      lines.push({ n, raw, code: true });
      return;
    }
    lines.push({ n, raw, code: false });
  });
  if (open) fences.push(open);
  return { lines, fences };
}

function scan(root, file, kind, rules) {
  const path = join(root, file);
  if (!existsSync(path)) return { file, missing: true, hits: [] };
  const { lines, fences } = parse(readFileSync(path, 'utf8'));
  const hits = [];
  const live = rules.filter((r) => r.file === file && r.re && r.sev[kind] !== 'off');
  for (const line of lines) {
    if (!line.raw.trim()) continue;
    if (line.code && (file === 'AGENTS.md' || kind !== 'app')) continue;
    for (const r of live) if (r.re.test(line.raw)) hits.push({ line: line.n, id: r.id, sev: r.sev[kind], why: r.why, text: line.raw.trim().slice(0, 120) });
  }
  const r9 = rules.find((r) => r.id === 'R9');
  if (file === 'README.md' && r9.sev[kind] !== 'off') {
    for (const fence of fences) if (CHECK_WORDS.test(fence.first)) hits.push({ line: fence.start, id: 'R9', sev: r9.sev[kind], why: r9.why, text: fence.first.slice(0, 120) });
  }
  hits.sort((a, b) => a.line - b.line || a.id.localeCompare(b.id));
  return { file, missing: false, lines: lines.length, hits };
}

export function audit(root, { kind, loopDirs = [], strict = false } = {}) {
  if (!isDir(root)) throw new InputError('not a directory: ' + root);
  if (kind !== undefined && !KINDS.includes(kind)) throw new InputError('kind must be one of ' + KINDS.join(', '));
  const resolvedKind = kind ?? detectKind(root);
  const localDirs = [...new Set([...ignoredDotDirs(root), ...loopDirs])];
  const rules = buildRules(localDirs);
  const readme = scan(root, 'README.md', resolvedKind, rules);
  const agents = scan(root, 'AGENTS.md', resolvedKind, rules);
  const failing = (hit) => hit.sev === 'fail' || (strict && hit.sev === 'note');
  for (const hit of [...readme.hits, ...agents.hits]) hit.failing = failing(hit);
  const all = [...readme.hits, ...agents.hits];
  const fails = all.filter((hit) => hit.failing).length + (agents.missing ? 1 : 0);
  const notes = all.length - all.filter((hit) => hit.failing).length;
  return { root, kind: resolvedKind, kindSource: kind ? 'given' : 'detected', strict, localDirs, readme, agents, fails, notes, ok: fails === 0 };
}

export function format(result) {
  const out = ['kind ' + result.kind + ' (' + result.kindSource + ')' + (result.strict ? ', strict' : '')];
  for (const r of [result.readme, result.agents]) {
    if (r.missing) {
      out.push(r.file + ': missing' + (r.file === 'AGENTS.md' ? ' (agent material in README usually means this file does not exist yet)' : ''));
      continue;
    }
    const failed = r.hits.filter((hit) => hit.failing).length;
    out.push(r.file + ': ' + (r.hits.length ? failed + ' fail, ' + (r.hits.length - failed) + ' note' : 'clean') + ' (' + r.lines + ' lines)');
    for (const hit of r.hits) out.push('  ' + (hit.failing ? 'FAIL ' : 'note ') + hit.id + ' L' + hit.line + ' ' + hit.why + ': ' + hit.text);
  }
  out.push(result.fails ? 'AUDIENCE RED ' + result.fails : 'AUDIENCE GREEN' + (result.notes ? ' (' + result.notes + ' note)' : ''));
  return out.join('\n');
}

export function main(argv) {
  let values;
  let positionals;
  try {
    ({ values, positionals } = parseArgs({ args: argv, allowPositionals: true, options: {
      kind: { type: 'string' }, 'loop-dir': { type: 'string', multiple: true, default: [] },
      strict: { type: 'boolean' }, json: { type: 'boolean' }, rules: { type: 'boolean' }, help: { type: 'boolean' },
    } }));
  } catch (error) {
    if (error instanceof TypeError) {
      console.error(error.message + '\n' + USAGE);
      return 2;
    }
    throw error;
  }
  if (values.help) {
    console.log(USAGE);
    return 0;
  }
  if (values.rules) {
    for (const r of buildRules([])) console.log(r.id + '  ' + r.file.padEnd(9) + ' ' + KINDS.map((k) => k + '=' + r.sev[k]).join(' ') + '  ' + r.why);
    return 0;
  }
  if (positionals.length > 1) {
    console.error('one repository root at most\n' + USAGE);
    return 2;
  }
  let result;
  try {
    result = audit(positionals[0] ?? process.cwd(), { kind: values.kind, loopDirs: values['loop-dir'], strict: values.strict === true });
  } catch (error) {
    if (error instanceof InputError) {
      console.error('audit: ' + error.message + '\n' + USAGE);
      return 2;
    }
    throw error;
  }
  console.log(values.json ? JSON.stringify(result) : format(result));
  return result.fails ? 1 : 0;
}

// An installed skill is often a link to its source folder; Node resolves import.meta.url through the link while argv keeps
// the link path, so both sides are compared as real paths or a call through the link exits 0 having done nothing.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) process.exitCode = main(process.argv.slice(2));
