#!/usr/bin/env node
// Turn a repository's git commits and its coding-agent session logs into one append-only event file, and check that
// procedure cards still cite events that exist and rule files that have not changed since the card was written.
// Usage:
//   node events.mjs events --repo <path> [--codex-sessions <dir>] [--claude-sessions <dir>] [--since-cursor <file>] --out <events.jsonl> [--json]
//   node events.mjs cards-check --cards <dir> --events <events.jsonl> [--repo <path>] [--json]
//   node events.mjs hash --repo <path> <file>...
// Exit codes: 0 ok; 1 cards-check findings; 2 usage error or an unreadable input.
import { createHash } from 'node:crypto';
import { closeSync, existsSync, openSync, readFileSync, readSync, readdirSync, realpathSync, statSync, writeFileSync, appendFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const USAGE = [
  'usage: node events.mjs events --repo <path> [--codex-sessions <dir>] [--claude-sessions <dir>] [--since-cursor <file>] --out <events.jsonl> [--json]',
  '       node events.mjs cards-check --cards <dir> --events <events.jsonl> [--repo <path>] [--json]',
  '       node events.mjs hash --repo <path> <file>...',
].join('\n');
const TEXT_MAX = 1000;
const STATUSES = ['hypothesis', 'accepted'];
const ACCEPTING_ROLES = ['verification', 'acceptance'];

export class InputError extends Error {}

const sha256 = (data) => createHash('sha256').update(data).digest('hex');
const eventId = (parts) => 'ev-' + sha256(JSON.stringify(parts)).slice(0, 16);
const isDir = (path) => existsSync(path) && statSync(path).isDirectory();
const isFile = (path) => existsSync(path) && statSync(path).isFile();

// Session logs record the working folder as the host saw it; compare real, case-folded paths on Windows.
function canon(path) {
  let full = resolve(path);
  try {
    full = realpathSync.native(full);
  } catch {}
  return process.platform === 'win32' ? full.toLowerCase() : full;
}
const inside = (child, root) => child === root || child.startsWith(root.endsWith(sep) ? root : root + sep);

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

function listJsonl(dir) {
  const found = [];
  const walk = (at) => {
    for (const entry of readdirSync(at, { withFileTypes: true })) {
      const full = join(at, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.jsonl')) found.push(full);
    }
  };
  walk(dir);
  return found.sort();
}

// Bytes after the recorded offset, cut at the last newline so a line the host is still writing waits for the next run.
function readNew(file, offset) {
  const size = statSync(file).size;
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

// One record of a Codex rollout. Typed requests are user-role message items; older rollouts also carry an
// event_msg/user_message for each, and in those files the event is the request and the message item is skipped.
function codexRecord(record, state, ref, skip) {
  const payload = record.payload ?? {};
  const at = isoOrNull(record.timestamp);
  const key = record.type + '/' + (payload.type ?? '');
  if (record.type === 'session_meta') {
    state.session = String(payload.id ?? payload.session_id ?? state.session);
    if (payload.cwd) state.cwd = payload.cwd;
    return [];
  }
  if (record.type === 'turn_context') {
    if (!state.cwd && payload.cwd) state.cwd = payload.cwd;
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
  if (key === 'response_item/agent_message' || (key === 'event_msg/item_completed' && payload.item?.type === 'AgentMessage')) {
    state.assistant = true;
    return [];
  }
  if (/^response_item\/(function_call|custom_tool_call|local_shell_call)$/.test(key)) {
    return [toolEvent(state, 'codex', at, payload.name ?? payload.type, payload.arguments ?? payload.input ?? payload.action, ref)];
  }
  return skip('codex/' + key);
}

// One record of a Claude Code project log: user and assistant turns, tool_use blocks inside assistant turns.
function claudeRecord(record, state, ref, skip) {
  const at = isoOrNull(record.timestamp);
  if (record.sessionId) state.session = String(record.sessionId);
  if (!state.cwd && record.cwd) state.cwd = record.cwd;
  if (record.type === 'user') {
    if (record.isMeta) return skip('claude/user-meta');
    const content = record.message?.content;
    if (Array.isArray(content) && content.length && content.every((part) => part?.type === 'tool_result')) return skip('claude/tool_result');
    const text = textOf(content);
    if (!text.trim() || injected(text)) return skip('claude/context');
    return [userEvent(state, 'claude', at, text, ref)];
  }
  if (record.type === 'assistant') {
    state.assistant = true;
    const blocks = Array.isArray(record.message?.content) ? record.message.content : [];
    return blocks.filter((block) => block?.type === 'tool_use').map((block) => toolEvent(state, 'claude', at, block.name, block.input, ref));
  }
  return skip('claude/' + record.type);
}

const freshState = () => ({ offset: 0, line: 0, session: null, cwd: null, inRepo: null, link: null, assistant: false, userMessageEvents: false });

// The forms a repository's path takes inside a session log: as given and as resolved, each with forward slashes and JSON-escaped.
function pathMarkers(...roots) {
  const forms = roots.flatMap((root) => [root, root.split('\\').join('/'), root.split('\\').join('\\\\')]);
  return [...new Set(forms.map((marker) => marker.toLowerCase()))];
}
const mentions = (text, markers) => {
  const low = text.toLowerCase();
  return markers.some((marker) => low.includes(marker));
};

// A session belongs to the repository when its working folder is inside it or its records name the repository's path,
// since agents often work on one checkout from another folder. A session ruled out is watched for a later mention, and
// the first mention re-reads the file from its start; the event ids keep that re-read from appending twice.
// Each event carries its link ('cwd' or 'mention'): a mention is the weaker tie, held for review before a card cites it.
function sessionEvents(file, source, repoRoot, markers, prior, stats) {
  const size = statSync(file).size;
  let state = prior && prior.offset <= size ? { ...prior } : freshState();
  if (state.inRepo === false) {
    const { text, end } = readNew(file, state.offset);
    if (!mentions(text, markers)) {
      state.offset = end;
      stats.sessionsOutside += 1;
      return { state, events: [] };
    }
    state = freshState();
  }
  const { text, end } = readNew(file, state.offset);
  if (!state.session) state.session = file.split(/[\\/]/).pop().replace(/\.jsonl$/, '');
  if (source === 'codex' && text.includes('"type":"user_message"')) state.userMessageEvents = true;
  const skip = (type) => {
    stats.skipped[type] = (stats.skipped[type] ?? 0) + 1;
    return [];
  };
  const pending = [];
  for (const raw of text.split('\n').slice(0, -1)) {
    state.line += 1;
    if (!raw.trim()) continue;
    let record;
    try {
      record = JSON.parse(raw);
    } catch {
      skip(source + '/unparsed-line');
      continue;
    }
    if (!record || typeof record !== 'object') {
      skip(source + '/not-an-object');
      continue;
    }
    const ref = { file, line: state.line };
    pending.push(...(source === 'codex' ? codexRecord(record, state, ref, skip) : claudeRecord(record, state, ref, skip)));
  }
  state.offset = end;
  if (state.inRepo === null) {
    state.link = state.cwd && inside(canon(state.cwd), repoRoot) ? 'cwd' : mentions(text, markers) ? 'mention' : null;
    state.inRepo = state.link !== null;
  }
  if (!state.inRepo) {
    stats.sessionsOutside += 1;
    return { state, events: [] };
  }
  if (pending.length) stats.sessionsRead += 1;
  return { state, events: pending.map((event) => ({ ...event, link: state.link })) };
}

export function collect({ repo, codexSessions, claudeSessions, cursorFile, out }) {
  if (!repo || !isDir(repo)) throw new InputError('--repo ' + repo + ' is not a directory');
  if (!out) throw new InputError('--out is required');
  for (const [flag, dir] of [['--codex-sessions', codexSessions], ['--claude-sessions', claudeSessions]]) {
    if (dir && !isDir(dir)) throw new InputError(flag + ' ' + dir + ' is not a directory');
  }
  const repoRoot = canon(repo);
  const markers = pathMarkers(resolve(repo), repoRoot);
  const cursor = cursorFile && existsSync(cursorFile) ? readJsonFile(cursorFile, 'cursor') : { version: 1, git: {}, files: {} };
  cursor.git ??= {};
  cursor.files ??= {};
  const stats = { byKind: {}, duplicates: 0, sessionsRead: 0, sessionsOutside: 0, skipped: {} };
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
  const commits = commitEvents(repo, cursor.git[repoRoot]);
  take(commits.events);
  if (commits.head) cursor.git[repoRoot] = commits.head;
  for (const [source, dir] of [['codex', codexSessions], ['claude', claudeSessions]]) {
    if (!dir) continue;
    for (const file of listJsonl(dir)) {
      const key = canon(file);
      const { state, events } = sessionEvents(file, source, repoRoot, markers, cursor.files[key], stats);
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
    'codex-sessions': { type: 'string' },
    'claude-sessions': { type: 'string' },
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
      const result = collect({ repo: values.repo, codexSessions: values['codex-sessions'], claudeSessions: values['claude-sessions'], cursorFile: values['since-cursor'], out: values.out });
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

