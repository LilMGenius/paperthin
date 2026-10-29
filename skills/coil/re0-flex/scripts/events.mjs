#!/usr/bin/env node
// Turn a repository's git commits and its coding-agent session logs into one append-only event file, and check that
// procedure cards still cite events that exist and rule files that have not changed since the card was written.
// Usage:
//   node events.mjs events --repo <path> [--sessions <dir>]... [--since-cursor <file>] --out <events.jsonl> [--json]
//   node events.mjs cards-check --cards <dir> --events <events.jsonl> [--repo <path>] [--json]
//   node events.mjs hash --repo <path> <file>...
// Exit codes: 0 ok; 1 cards-check findings; 2 usage error or an unreadable input.
import { createHash } from 'node:crypto';
import { closeSync, existsSync, openSync, readFileSync, readSync, readdirSync, realpathSync, statSync, writeFileSync, appendFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const USAGE = [
  'usage: node events.mjs events --repo <path> [--sessions <dir>]... [--since-cursor <file>] --out <events.jsonl> [--json]',
  '       node events.mjs cards-check --cards <dir> --events <events.jsonl> [--repo <path>] [--json]',
  '       node events.mjs hash --repo <path> <file>...',
].join('\n');
const TEXT_MAX = 1000;
const HEAD_BYTES = 1 << 16;
const STATUSES = ['hypothesis', 'accepted'];
const ACCEPTING_ROLES = ['verification', 'acceptance'];

export class InputError extends Error {}

const sha256 = (data) => createHash('sha256').update(data).digest('hex');
const eventId = (parts) => 'ev-' + sha256(JSON.stringify(parts)).slice(0, 16);
const isDir = (path) => existsSync(path) && statSync(path).isDirectory();
const isFile = (path) => existsSync(path) && statSync(path).isFile();

// Paths compare case-folded on Windows, both as written and as the filesystem resolves them: a folder inside a
// checkout can be a junction into another checkout, so neither form alone says where a tool worked.
const fold = (path) => (process.platform === 'win32' ? path.toLowerCase() : path);
const realCache = new Map();
function real(path) {
  if (!realCache.has(path)) {
    let found = null;
    try {
      found = realpathSync.native(path);
    } catch {}
    realCache.set(path, found);
  }
  return realCache.get(path);
}
const forms = (path) => [...new Set([path, real(path)].filter(Boolean).map(fold))];
const canon = (path) => fold(real(resolve(path)) ?? resolve(path));
const inside = (child, root) => child === root || child.startsWith(root.endsWith(sep) ? root : root + sep);

// A path the way a session log writes it: a file URL, a Git Bash drive path, or relative to the folder the tool ran in.
function toPath(value, base) {
  if (typeof value !== 'string' || !value.trim()) return null;
  let path = value.trim();
  if (/^file:\/\//i.test(path)) {
    try {
      path = fileURLToPath(path);
    } catch {
      return null;
    }
  } else if (process.platform === 'win32' && /^\/[a-z](\/|$)/i.test(path)) path = path[1] + ':' + (path.slice(2) || '/');
  if (!isAbsolute(path)) {
    if (!base) return null;
    path = resolve(base, path);
  }
  return resolve(path);
}

function repoMatcher(repo) {
  const roots = forms(resolve(repo));
  return (path) => Boolean(path) && forms(path).some((form) => roots.some((root) => inside(form, root)));
}

function isoOrNull(value) {
  const date = new Date(value);
  return value && !Number.isNaN(date.getTime()) ? date.toISOString() : null;
}

function clip(text) {
  const value = String(text ?? '').trim();
  return value.length > TEXT_MAX ? { text: value.slice(0, TEXT_MAX), truncated: true, textHash: sha256(value) } : { text: value };
}

function readJsonFile(path, what) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw new InputError(what + ' ' + path + ' does not parse: ' + error.message);
  }
}

export function readEvents(path) {
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf8').split('\n').filter((line) => line.trim()).map((line, i) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      throw new InputError(path + ' line ' + (i + 1) + ' does not parse: ' + error.message);
    }
  });
}

function git(repo, args) {
  return execFileSync('git', ['-C', repo, '-c', 'core.quotePath=false', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 28 });
}

// Commits since the cursor's head when that head is still an ancestor; a rewritten history is read whole and the ids
// (one per sha) keep what was already recorded from being appended twice.
function commitEvents(repo, cursorHead) {
  let head;
  try {
    head = git(repo, ['rev-parse', '--verify', '-q', 'HEAD']).trim();
  } catch {
    return { head: null, events: [] };
  }
  let range = head;
  if (cursorHead && cursorHead !== head) {
    try {
      git(repo, ['merge-base', '--is-ancestor', cursorHead, head]);
      range = cursorHead + '..' + head;
    } catch {}
  } else if (cursorHead === head) return { head, events: [] };
  const out = git(repo, ['log', '--format=%x1e%H%x1f%cI%x1f%s', '--name-only', range]);
  const events = out.split('\x1e').filter((chunk) => chunk.trim()).map((chunk) => {
    const [meta, ...rest] = chunk.split('\n');
    const [sha, date, subject] = meta.split('\x1f');
    return { id: eventId(['commit', sha]), kind: 'commit', source: 'git', at: isoOrNull(date), sha, ...clip(subject), files: rest.map((line) => line.trim()).filter(Boolean) };
  });
  return { head, events };
}

function listFiles(dir) {
  const found = [];
  const walk = (at) => {
    for (const entry of readdirSync(at, { withFileTypes: true })) {
      const full = join(at, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) found.push(full);
    }
  };
  walk(dir);
  return found.sort();
}

// The folders the two hosts keep their session logs in, read when no --sessions is given.
function defaultSessionDirs() {
  const codex = process.env.CODEX_HOME || join(homedir(), '.codex');
  const claude = process.env.CLAUDE_CONFIG_DIR || join(homedir(), '.claude');
  return [join(codex, 'sessions'), join(codex, 'archived_sessions'), join(claude, 'projects')].filter(isDir);
}

// Bytes after the recorded offset, cut at the last newline so a line the host is still writing waits for the next run.
function readNew(file, offset, limit = Infinity) {
  const size = Math.min(statSync(file).size, offset + limit);
  if (size <= offset) return { text: '', end: offset };
  const fd = openSync(file, 'r');
  try {
    const buffer = Buffer.alloc(size - offset);
    readSync(fd, buffer, 0, buffer.length, offset);
    const last = buffer.lastIndexOf(0x0a);
    if (last < 0) return { text: '', end: offset };
    return { text: buffer.subarray(0, last + 1).toString('utf8'), end: offset + last + 1 };
  } finally {
    closeSync(fd);
  }
}

// A Codex rollout line is {timestamp, type, payload} with a rollout record type; a Claude Code project log line carries
// its sessionId or uuid, or is one of the bookkeeping records Claude Code writes before the first turn.
const CODEX_TYPES = new Set(['session_meta', 'response_item', 'event_msg', 'turn_context', 'world_state', 'compacted']);
const CLAUDE_TYPES = new Set(['summary', 'file-history-snapshot', 'queue-operation', 'last-prompt', 'ai-title', 'permission-mode', 'mode']);
function detectFormat(file) {
  for (const raw of readNew(file, 0, HEAD_BYTES).text.split('\n')) {
    let record;
    try {
      record = JSON.parse(raw);
    } catch {
      continue;
    }
    if (!record || typeof record !== 'object' || Array.isArray(record)) continue;
    if (CODEX_TYPES.has(record.type) && record.payload && typeof record.payload === 'object') return 'codex';
    if (typeof record.sessionId === 'string' || typeof record.uuid === 'string' || CLAUDE_TYPES.has(record.type)) return 'claude';
  }
  return null;
}

// Injected context (the repository's agent guide, environment blocks, reminders) arrives as a user-role message but was
// not typed by the person, so it is counted and kept out of the request stream.
const injected = (text) => /^\s*</.test(text) && !/^\s*<command-(name|message)>/.test(text) || /^\s*# AGENTS\.md instructions/.test(text);

function textOf(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content.filter((part) => part && typeof part.text === 'string' && /^(input_text|text|output_text)$/.test(part.type)).map((part) => part.text).join('\n');
}

function userEvent(state, source, at, text, ref) {
  const kind = state.assistant ? 'correction' : 'request';
  state.assistant = false;
  return { id: eventId([kind, source, state.session, at, text]), kind, source, at, session: state.session, ...ref, ...clip(text) };
}

function toolEvent(state, source, at, name, args, ref) {
  const detail = typeof args === 'string' ? args : JSON.stringify(args ?? null);
  return { id: eventId(['tool', source, state.session, at, name, detail]), kind: 'tool', source, at, session: state.session, tool: String(name), ...ref, ...clip(detail) };
}

// Command text and its statements. A shell launcher's argv carries the script after its command flag; quotes are kept
// whole when the text is cut at &&, ||, ;, | and newlines, the points after which the exit code is a later statement's.
const SHELLS = new Set(['pwsh', 'powershell', 'bash', 'sh', 'zsh', 'dash', 'cmd']);
const SHELL_FLAGS = new Set(['-c', '-lc', '-ic', '-command', '/c']);
const program = (word) => basename(String(word ?? '').split('\\').join('/')).toLowerCase().replace(/\.(exe|cmd|bat|ps1)$/, '');

function shellText(command) {
  if (typeof command === 'string') return command;
  if (!Array.isArray(command)) return '';
  const argv = command.map(String);
  if (SHELLS.has(program(argv[0]))) {
    const at = argv.findIndex((arg, i) => i > 0 && SHELL_FLAGS.has(arg.toLowerCase()));
    if (at > 0 && at + 1 < argv.length) return argv.slice(at + 1).join(' ');
  }
  return argv.join(' ');
}

function statements(text) {
  const parts = [];
  let quote = null;
  let current = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === quote) quote = null;
      current += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
    } else if (text.startsWith('&&', i) || text.startsWith('||', i)) {
      parts.push(current);
      current = '';
      i += 1;
    } else if (ch === ';' || ch === '|' || ch === '\n') {
      parts.push(current);
      current = '';
    } else current += ch;
  }
  parts.push(current);
  return parts.map((part) => part.trim()).filter(Boolean);
}

function words(statement) {
  const found = [];
  let quote = null;
  let current = null;
  for (const ch of statement) {
    if (quote) {
      if (ch === quote) quote = null;
      else current += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      current ??= '';
    } else if (/\s/.test(ch)) {
      if (current !== null) found.push(current);
      current = null;
    } else current = (current ?? '') + ch;
  }
  if (current !== null) found.push(current);
  return found;
}

// Launchers that run another program: drop them and their own flags so the first word is the program that ran.
const VALUE_FLAGS = new Set(['--with', '--python', '--from', '-p', '--package']);
function unwrap(argv) {
  let rest = argv.slice();
  for (;;) {
    while (rest.length && (rest[0] === '&' || /^[A-Za-z_][A-Za-z0-9_]*=/.test(rest[0]))) rest.shift();
    const name = program(rest[0]);
    let drop = 0;
    if (['npx', 'bunx', 'pnpx', 'env', 'time'].includes(name)) drop = 1;
    else if (['npm', 'pnpm', 'yarn', 'bun'].includes(name) && ['exec', 'dlx', 'x'].includes(rest[1])) drop = 2;
    else if (['uv', 'poetry', 'pipx', 'hatch'].includes(name) && rest[1] === 'run') drop = 2;
    else if (/^(python[\d.]*|py)$/.test(name) && rest[1] === '-m') drop = 2;
    if (!drop) return rest;
    rest = rest.slice(drop);
    while (rest.length && rest[0].startsWith('-')) {
      if (VALUE_FLAGS.has(rest.shift())) rest.shift();
    }
  }
}

const LINTERS = new Set(['eslint', 'stylelint', 'flake8', 'pylint', 'shellcheck', 'markdownlint', 'markdownlint-cli2']);
const TYPECHECKERS = new Set(['tsc', 'vue-tsc', 'mypy', 'pyright']);
const CI_FILTERS = ['--jq', '-q', '--template', '-t'];

// The check one statement runs, if it runs one: a test runner, a linter or type-checker, or a GitHub Actions read.
function checkOf(statement) {
  const [first, ...args] = unwrap(words(statement));
  const name = program(first);
  const positional = args.filter((arg) => !arg.startsWith('-') && !arg.startsWith('+'));
  const sub = positional[0];
  const has = (...flags) => args.some((arg) => flags.includes(arg) || flags.some((flag) => flag.startsWith('--') && arg.startsWith(flag + '=')));
  const test = (runner) => ({ check: 'test', runner });
  if (name === 'node') {
    const end = args.findIndex((arg) => !arg.startsWith('-'));
    return (end < 0 ? args : args.slice(0, end)).includes('--test') ? test('node --test') : null;
  }
  if (name === 'jest') return test('jest');
  if (name === 'vitest') return sub === 'bench' ? null : test('vitest');
  if (name === 'pytest' || name === 'py.test') return test('pytest');
  if (name === 'cargo' && sub === 'test') return test('cargo test');
  if (name === 'go' && sub === 'test') return test('go test');
  if (name === 'cargo' && sub === 'clippy') return { check: 'lint', runner: 'cargo clippy' };
  if (name === 'go' && sub === 'vet') return { check: 'lint', runner: 'go vet' };
  if (LINTERS.has(name) || (name === 'ruff' && sub === 'check') || (name === 'golangci-lint' && sub === 'run')) return { check: 'lint', runner: name };
  if (name === 'biome' && ['check', 'lint', 'ci'].includes(sub)) return { check: 'lint', runner: 'biome' };
  if (name === 'prettier' && has('--check', '-c', '--list-different', '-l')) return { check: 'lint', runner: 'prettier' };
  if (TYPECHECKERS.has(name)) return { check: 'typecheck', runner: name };
  if (name === 'cargo' && sub === 'check') return { check: 'typecheck', runner: 'cargo check' };
  const run = args.indexOf('run');
  if (name === 'gh' && run >= 0 && ['view', 'list'].includes(args[run + 1]) && has('--json') && !has(...CI_FILTERS)) return { check: 'ci', runner: 'gh run ' + args[run + 1] };
  return null;
}

// Each runner's own summary line; a summary that does not parse records nothing.
const plainText = (text) => String(text ?? '').replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '');
const tally = (text, names) => {
  const counts = {};
  for (const [, n, word] of text.matchAll(/(\d+) ([a-z]+)/g)) {
    const key = names[word];
    if (key) counts[key] = (counts[key] ?? 0) + Number(n);
  }
  return counts;
};
const lastMatch = (text, pattern) => [...text.matchAll(pattern)].pop();
const verdict = (counts, ...failing) => (failing.some((key) => counts[key] > 0) ? 'fail' : 'pass');
const SUMMARIES = {
  'node --test': (text) => {
    const counts = {};
    for (const [, key, n] of text.matchAll(/^\s*(?:#|\u2139)\s*(tests|suites|pass|fail|cancelled|skipped|todo)\s+(\d+)\s*$/gm)) counts[key] = Number(n);
    return 'tests' in counts && 'pass' in counts && 'fail' in counts ? { counts, result: verdict(counts, 'fail', 'cancelled') } : null;
  },
  jest: (text) => {
    const line = lastMatch(text, /^Tests:\s+(.+)$/gm);
    const counts = line && tally(line[1], { failed: 'fail', passed: 'pass', skipped: 'skipped', todo: 'todo', total: 'tests' });
    return counts && 'tests' in counts ? { counts, result: verdict(counts, 'fail') } : null;
  },
  vitest: (text) => {
    const line = lastMatch(text, /^\s*Tests\s+(.+?)\s*\((\d+)\)\s*$/gm);
    if (!line) return null;
    const counts = { ...tally(line[1], { failed: 'fail', passed: 'pass', skipped: 'skipped', todo: 'todo' }), tests: Number(line[2]) };
    return { counts, result: verdict(counts, 'fail') };
  },
  pytest: (text) => {
    const line = lastMatch(text, /^=*\s*((?:\d+ [a-z]+(?:, )?)+) in [\d.]+s\b/gm);
    const counts = line && tally(line[1], { passed: 'pass', failed: 'fail', error: 'error', errors: 'error', skipped: 'skipped', xfailed: 'xfailed', xpassed: 'xpassed', deselected: 'deselected' });
    return counts && ('pass' in counts || 'fail' in counts || 'error' in counts) ? { counts, result: verdict(counts, 'fail', 'error') } : null;
  },
  'cargo test': (text) => {
    const lines = [...text.matchAll(/^test result: (ok|FAILED)\. (\d+) passed; (\d+) failed; (\d+) ignored/gm)];
    if (!lines.length) return null;
    const counts = { pass: 0, fail: 0, ignored: 0 };
    for (const [, , pass, fail, ignored] of lines) Object.assign(counts, { pass: counts.pass + Number(pass), fail: counts.fail + Number(fail), ignored: counts.ignored + Number(ignored) });
    return { counts, result: lines.some((line) => line[1] === 'FAILED') ? 'fail' : verdict(counts, 'fail') };
  },
  'go test': (text) => {
    const counts = { ok: 0, fail: 0, noTests: 0 };
    for (const [, mark] of text.matchAll(/^(ok|FAIL|\?)[ \t]+\S+/gm)) counts[{ ok: 'ok', FAIL: 'fail', '?': 'noTests' }[mark]] += 1;
    return counts.ok + counts.fail + counts.noTests ? { counts, result: verdict(counts, 'fail') } : null;
  },
};

// gh run view|list --json prints one run or a list; a run read without its conclusion says nothing about the result.
const CI_FAILING = new Set(['failure', 'cancelled', 'timed_out', 'action_required', 'startup_failure']);
function ciResult(output) {
  let data;
  try {
    data = JSON.parse(String(output ?? '').trim());
  } catch {
    return null;
  }
  const runs = Array.isArray(data) ? data : [data];
  if (!runs.length || !runs.every((run) => run && typeof run === 'object' && 'conclusion' in run)) return null;
  const counts = {};
  for (const run of runs) {
    const key = run.conclusion || run.status || 'pending';
    counts[key] = (counts[key] ?? 0) + 1;
  }
  const result = runs.some((run) => CI_FAILING.has(run.conclusion)) ? 'fail' : runs.some((run) => !run.conclusion) ? 'pending' : 'pass';
  return { counts, result };
}

// One finished command read as a check result. A test result comes from the runner's summary, so a compound command
// still counts; a lint, type-check or CI result comes from the exit code or the raw output of that single invocation.
function verificationEvent({ state, source, at, call, command, cwd, exitCode, output, ref, skip }) {
  const parts = statements(command);
  const compound = parts.length > 1;
  for (const part of parts) {
    const found = checkOf(part);
    if (!found) continue;
    let read;
    if (found.check === 'test') read = SUMMARIES[found.runner](plainText(output));
    else if (compound) {
      skip('check/compound-' + found.check);
      continue;
    } else if (found.check === 'ci') read = ciResult(output);
    else read = exitCode === null ? null : { counts: null, result: exitCode === 0 ? 'pass' : 'fail' };
    if (!read) {
      skip('check/unread-' + found.check);
      continue;
    }
    const id = eventId(['verification', source, state.session, call ?? [at, command]]);
    return { id, kind: 'verification', source, at, session: state.session, ...ref, ...found, ...read, exitCode, cwd, compound, ...clip(command) };
  }
  return null;
}

// Where a tool ran: its working folder and every file argument, resolved against the folder the session was in.
const DIR_KEYS = ['workdir', 'cwd', 'working_directory'];
const FILE_KEYS = ['path', 'file_path', 'filePath', 'notebook_path'];
function argPaths(args) {
  let value = args;
  if (typeof value === 'string') {
    const patched = [...value.matchAll(/^\*\*\* (?:Add File|Update File|Delete File|Move to): (.+)$/gm)].map((match) => match[1]);
    if (patched.length) return patched;
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!value || typeof value !== 'object') return [];
  const paths = [...DIR_KEYS, ...FILE_KEYS].map((key) => value[key]);
  if (Array.isArray(value.paths)) paths.push(...value.paths);
  return paths.filter((path) => typeof path === 'string');
}

function tieTo(ctx, state, kind, paths, base = state.cwd) {
  if (!state.tie && paths.some((path) => ctx.inRepo(toPath(path, base)))) state.tie = kind;
}

// One record of a Codex rollout. Typed requests are user-role message items; older rollouts also carry an
// event_msg/user_message for each, and in those files the event is the request and the message item is skipped.
function codexRecord(record, state, ref, ctx) {
  const payload = record.payload ?? {};
  const at = isoOrNull(record.timestamp);
  const key = record.type + '/' + (payload.type ?? '');
  const { skip } = ctx;
  if (record.type === 'session_meta' || record.type === 'turn_context') {
    if (record.type === 'session_meta') state.session = String(payload.id ?? payload.session_id ?? state.session);
    if (payload.cwd) {
      state.cwd = toPath(payload.cwd, state.cwd) ?? state.cwd;
      tieTo(ctx, state, 'cwd', [state.cwd]);
    }
    return [];
  }
  if (key === 'event_msg/user_message') {
    const text = String(payload.message ?? '');
    if (injected(text)) return skip('codex/context');
    return [userEvent(state, 'codex', at, text, ref)];
  }
  if (key === 'response_item/message') {
    if (payload.role === 'assistant') {
      state.assistant = true;
      return [];
    }
    if (payload.role !== 'user') return skip('codex/' + key + '/' + payload.role);
    const text = textOf(payload.content);
    if (!text.trim() || injected(text)) return skip('codex/context');
    if (state.userMessageEvents) return skip('codex/message-mirrored-by-user_message');
    return [userEvent(state, 'codex', at, text, ref)];
  }
  if (key === 'event_msg/item_completed') {
    const item = payload.item ?? {};
    if (item.type === 'AgentMessage') {
      state.assistant = true;
      return [];
    }
    if (item.type === 'FileChange') {
      tieTo(ctx, state, 'tool', Object.keys(item.changes ?? {}));
      return [];
    }
    if (item.type === 'CommandExecution') {
      const cwd = toPath(item.cwd, state.cwd);
      const read = Array.isArray(item.parsed_cmd) ? item.parsed_cmd.map((part) => part?.path).filter((path) => typeof path === 'string') : [];
      tieTo(ctx, state, 'tool', [cwd, ...read].filter(Boolean), cwd ?? state.cwd);
      const exitCode = typeof item.exit_code === 'number' ? item.exit_code : null;
      const event = verificationEvent({ state, source: 'codex', at, call: item.id, command: shellText(item.command), cwd, exitCode, output: item.aggregated_output, ref, skip });
      return event ? [event] : [];
    }
    return skip('codex/' + key + '/' + item.type);
  }
  if (key === 'response_item/agent_message') {
    state.assistant = true;
    return [];
  }
  if (/^response_item\/(function_call|custom_tool_call|local_shell_call)$/.test(key)) {
    const args = payload.arguments ?? payload.input ?? payload.action;
    tieTo(ctx, state, 'tool', payload.type === 'local_shell_call' ? [payload.action?.working_directory].filter(Boolean) : argPaths(args));
    return [toolEvent(state, 'codex', at, payload.name ?? payload.type, args, ref)];
  }
  return skip('codex/' + key);
}

// The shell tools whose results are read as checks, and the exit code Claude Code reports for them: no error flag is
// exit 0, and an error result opens with "Exit code N" when the command itself failed.
const CLAUDE_SHELLS = new Set(['Bash', 'PowerShell']);
const resultText = (content) => (typeof content === 'string' ? content : textOf(content));
function claudeExit(block, text) {
  if (block.is_error === false) return 0;
  const match = block.is_error === true && /^Exit code (\d+)/.exec(text);
  return match ? Number(match[1]) : null;
}

// One record of a Claude Code project log: user and assistant turns, tool_use blocks inside assistant turns, and the
// tool_result blocks that answer them, which can land in a later run than the call; the call waits in the cursor.
function claudeRecord(record, state, ref, ctx) {
  const at = isoOrNull(record.timestamp);
  const { skip } = ctx;
  if (record.sessionId) state.session = String(record.sessionId);
  if (record.cwd) {
    state.cwd = toPath(record.cwd, state.cwd) ?? state.cwd;
    tieTo(ctx, state, 'cwd', [state.cwd]);
  }
  if (record.type === 'user') {
    if (record.isMeta) return skip('claude/user-meta');
    const content = record.message?.content;
    const results = Array.isArray(content) ? content.filter((part) => part?.type === 'tool_result') : [];
    const events = [];
    for (const block of results) {
      const call = state.pending[block.tool_use_id];
      if (!call) continue;
      delete state.pending[block.tool_use_id];
      const text = resultText(block.content);
      const event = verificationEvent({ state, source: 'claude', at, call: block.tool_use_id, command: call.command, cwd: call.cwd, exitCode: claudeExit(block, text), output: text, ref, skip });
      if (event) events.push(event);
    }
    if (results.length && results.length === content.length) return events.length ? events : skip('claude/tool_result');
    const text = textOf(content);
    if (!text.trim() || injected(text)) return events.length ? events : skip('claude/context');
    return [...events, userEvent(state, 'claude', at, text, ref)];
  }
  if (record.type === 'assistant') {
    state.assistant = true;
    const blocks = Array.isArray(record.message?.content) ? record.message.content : [];
    return blocks.filter((block) => block?.type === 'tool_use').map((block) => {
      tieTo(ctx, state, 'tool', argPaths(block.input));
      if (CLAUDE_SHELLS.has(block.name) && typeof block.input?.command === 'string') state.pending[block.id] = { command: block.input.command, cwd: state.cwd };
      return toolEvent(state, 'claude', at, block.name, block.input, ref);
    });
  }
  return skip('claude/' + record.type);
}

const freshState = (format) => ({ format, offset: 0, line: 0, session: null, cwd: null, tie: null, assistant: false, userMessageEvents: false, pending: {} });

function readChunk(file, state, ctx) {
  const { text, end } = readNew(file, state.offset);
  if (!state.session) state.session = basename(file).replace(/\.jsonl$/, '');
  if (state.format === 'codex' && text.includes('"type":"user_message"')) state.userMessageEvents = true;
  const events = [];
  for (const raw of text.split('\n').slice(0, -1)) {
    state.line += 1;
    if (!raw.trim()) continue;
    let record;
    try {
      record = JSON.parse(raw);
    } catch {
      ctx.skip(state.format + '/unparsed-line');
      continue;
    }
    if (!record || typeof record !== 'object') {
      ctx.skip(state.format + '/not-an-object');
      continue;
    }
    const ref = { file, line: state.line };
    events.push(...(state.format === 'codex' ? codexRecord(record, state, ref, ctx) : claudeRecord(record, state, ref, ctx)));
  }
  state.offset = end;
  return events;
}

// A session belongs to the repository when its working folder is inside it ('cwd') or one of its tools ran there by
// working folder or file argument ('tool'); a path named only in injected context ties nothing. A session not yet tied
// is still read, and the record that first ties it re-reads the file from its start, so its earlier events count too;
// the event ids keep that re-read from appending twice.
function sessionEvents(file, prior, ctx, stats) {
  const size = statSync(file).size;
  let state = prior && prior.offset <= size ? { ...prior, pending: { ...prior.pending } } : freshState(prior?.format ?? null);
  state.format ??= detectFormat(file);
  if (!state.format) {
    stats.filesUnknown += 1;
    return { state, events: [] };
  }
  const start = state.offset;
  const wasTied = Boolean(state.tie);
  let events = readChunk(file, state, ctx);
  if (!wasTied && state.tie && start > 0) {
    state = freshState(state.format);
    events = readChunk(file, state, ctx);
  }
  if (!state.tie) {
    stats.sessionsOutside += 1;
    return { state, events: [] };
  }
  if (events.length) stats.sessionsRead += 1;
  return { state, events: events.map((event) => ({ ...event, link: state.tie })) };
}

export function collect({ repo, sessions, cursorFile, out }) {
  if (!repo || !isDir(repo)) throw new InputError('--repo ' + repo + ' is not a directory');
  if (!out) throw new InputError('--out is required');
  for (const dir of sessions ?? []) {
    if (!isDir(dir)) throw new InputError('--sessions ' + dir + ' is not a directory');
  }
  const folders = (sessions?.length ? sessions : defaultSessionDirs()).map((dir) => resolve(dir));
  const repoKey = canon(repo);
  const cursor = cursorFile && existsSync(cursorFile) ? readJsonFile(cursorFile, 'cursor') : { version: 1, git: {}, files: {} };
  cursor.git ??= {};
  cursor.files ??= {};
  const stats = { folders, filesUnknown: 0, byKind: {}, duplicates: 0, sessionsRead: 0, sessionsOutside: 0, skipped: {} };
  const ctx = {
    inRepo: repoMatcher(repo),
    skip: (type) => {
      stats.skipped[type] = (stats.skipped[type] ?? 0) + 1;
      return [];
    },
  };
  const seen = new Set(readEvents(out).map((event) => event.id));
  const fresh = [];
  const take = (events) => {
    for (const event of events) {
      if (seen.has(event.id)) {
        stats.duplicates += 1;
        continue;
      }
      seen.add(event.id);
      fresh.push(event);
    }
  };
  const commits = commitEvents(repo, cursor.git[repoKey]);
  take(commits.events);
  if (commits.head) cursor.git[repoKey] = commits.head;
  for (const dir of folders) {
    for (const file of listFiles(dir)) {
      if (!file.endsWith('.jsonl')) {
        stats.filesUnknown += 1;
        continue;
      }
      const key = canon(file);
      const { state, events } = sessionEvents(file, cursor.files[key], ctx, stats);
      cursor.files[key] = state;
      take(events);
    }
  }
  fresh.sort((a, b) => (a.at ?? '\uffff').localeCompare(b.at ?? '\uffff') || a.id.localeCompare(b.id));
  for (const event of fresh) stats.byKind[event.kind] = (stats.byKind[event.kind] ?? 0) + 1;
  if (fresh.length) appendFileSync(out, fresh.map((event) => JSON.stringify(event)).join('\n') + '\n');
  if (cursorFile) writeFileSync(cursorFile, JSON.stringify(cursor, null, 2) + '\n');
  return { added: fresh.length, ...stats };
}

function hashFile(path) {
  return sha256(readFileSync(path).toString('utf8').replace(/\r\n/g, '\n'));
}

export function hashWatch(repo, files) {
  if (!repo || !isDir(repo)) throw new InputError('--repo ' + repo + ' is not a directory');
  if (!files.length) throw new InputError('hash needs at least one file');
  const watch = {};
  for (const file of files) {
    const full = resolve(repo, file);
    if (!isFile(full)) throw new InputError(file + ' is not a file');
    watch[relative(resolve(repo), full).split(sep).join('/')] = hashFile(full);
  }
  return { watch };
}

// A card is Markdown for people with exactly one fenced json card block for this check.
function cardBlock(text) {
  const blocks = [];
  let open = null;
  text.replace(/\r\n/g, '\n').split('\n').forEach((line) => {
    if (open === null && /^\x60{3,}json card\s*$/.test(line)) open = [];
    else if (open !== null && /^\x60{3,}\s*$/.test(line)) {
      blocks.push(open.join('\n'));
      open = null;
    } else if (open !== null) open.push(line);
  });
  return blocks;
}

export function checkCards({ cards, events, repo }) {
  if (!cards || !isDir(cards)) throw new InputError('--cards ' + cards + ' is not a directory');
  if (!events || !isFile(events)) throw new InputError('--events ' + events + ' is not a file');
  const root = repo ?? process.cwd();
  if (!isDir(root)) throw new InputError('--repo ' + root + ' is not a directory');
  const known = new Map(readEvents(events).map((event) => [event.id, event]));
  const findings = [];
  const files = readdirSync(cards).filter((name) => name.endsWith('.md')).sort();
  for (const name of files) {
    const add = (code, detail) => findings.push({ card: name, code, detail });
    const blocks = cardBlock(readFileSync(join(cards, name), 'utf8'));
    if (blocks.length !== 1) {
      add(blocks.length ? 'many-blocks' : 'no-block', blocks.length + ' json card blocks; a card carries exactly one');
      continue;
    }
    let card;
    try {
      card = JSON.parse(blocks[0]);
    } catch (error) {
      add('bad-json', error.message);
      continue;
    }
    const evidence = Array.isArray(card.evidence) ? card.evidence : [];
    if (!STATUSES.includes(card.status)) add('bad-status', 'status ' + JSON.stringify(card.status) + ' is not one of ' + STATUSES.join(', '));
    if (!evidence.length) add('no-evidence', 'the evidence index is empty');
    for (const entry of evidence) {
      if (!known.has(entry?.event)) add('missing-event', 'cites ' + JSON.stringify(entry?.event) + ', which is not in ' + events);
    }
    if (card.status === 'accepted' && !evidence.some((entry) => ACCEPTING_ROLES.includes(entry?.role) && known.has(entry.event))) {
      add('unsupported-acceptance', 'accepted without a cited event in role ' + ACCEPTING_ROLES.join(' or ') + '; keep it a hypothesis');
    }
    for (const [file, hash] of Object.entries(card.watch ?? {})) {
      const full = resolve(root, file);
      if (!isFile(full)) add('re-review', file + ' is gone since the card was written');
      else if (hashFile(full) !== hash) add('re-review', file + ' changed since the card was written');
    }
  }
  return { cards: files.length, findings };
}

function formatCollect(result) {
  const kinds = Object.entries(result.byKind).map(([kind, n]) => kind + ' ' + n).join(', ') || 'none';
  const skipped = Object.entries(result.skipped).sort().map(([type, n]) => type + ' ' + n).join(', ') || 'none';
  return [
    'EVENTS +' + result.added + ' (' + kinds + ')',
    'duplicates collapsed ' + result.duplicates,
    'sessions with new events ' + result.sessionsRead + ', outside the repo ' + result.sessionsOutside,
    'folders read: ' + (result.folders.join(', ') || 'none') + '; files of no known format ' + result.filesUnknown,
    'skipped records: ' + skipped,
  ].join('\n');
}

function formatCards(result) {
  const lines = result.findings.map((f) => f.card + ': ' + f.code + ' ' + f.detail);
  lines.push((result.findings.length ? 'CARDS RED ' + result.findings.length : 'CARDS OK') + ' over ' + result.cards + ' cards');
  return lines.join('\n');
}

export function main(argv) {
  const [command, ...rest] = argv;
  const options = {
    repo: { type: 'string' },
    sessions: { type: 'string', multiple: true },
    'since-cursor': { type: 'string' },
    out: { type: 'string' },
    cards: { type: 'string' },
    events: { type: 'string' },
    json: { type: 'boolean' },
    help: { type: 'boolean', short: 'h' },
  };
  let parsed;
  try {
    parsed = parseArgs({ args: rest, options, allowPositionals: true });
  } catch (error) {
    console.error(error.message + '\n' + USAGE);
    return 2;
  }
  const { values, positionals } = parsed;
  if (values.help || command === '--help' || command === '-h') {
    console.log(USAGE);
    return 0;
  }
  try {
    if (command === 'events' && !positionals.length) {
      const result = collect({ repo: values.repo, sessions: values.sessions, cursorFile: values['since-cursor'], out: values.out });
      console.log(values.json ? JSON.stringify(result) : formatCollect(result));
      return 0;
    }
    if (command === 'cards-check' && !positionals.length) {
      const result = checkCards({ cards: values.cards, events: values.events, repo: values.repo });
      console.log(values.json ? JSON.stringify(result) : formatCards(result));
      return result.findings.length ? 1 : 0;
    }
    if (command === 'hash') {
      console.log(JSON.stringify(hashWatch(values.repo, positionals), null, 2));
      return 0;
    }
  } catch (error) {
    if (error instanceof InputError) {
      console.error('events: ' + error.message + '\n' + USAGE);
      return 2;
    }
    throw error;
  }
  console.error(USAGE);
  return 2;
}

// An installed skill is often a link to its source folder; Node resolves import.meta.url through the link while argv keeps
// the link path, so both sides are compared as real paths or a call through the link exits 0 having done nothing.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) process.exitCode = main(process.argv.slice(2));

