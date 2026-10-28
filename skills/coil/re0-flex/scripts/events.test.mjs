import { test } from 'node:test';
import assert from 'node:assert/strict';
import { appendFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const temps = [];
const temp = (prefix) => {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  temps.push(dir);
  return dir;
};
process.on('exit', () => temps.forEach((dir) => rmSync(dir, { recursive: true, force: true })));

// Every CLI call goes through a junction to this folder, the way an installed skill runs.
const linkRoot = temp('flex-link-');
const link = join(linkRoot, 'scripts');
symlinkSync(here, link, process.platform === 'win32' ? 'junction' : 'dir');
const cli = (...args) => spawnSync(process.execPath, [join(link, 'events.mjs'), ...args], { encoding: 'utf8' });

function gitRepo() {
  const repo = temp('flex-repo-');
  const run = (...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' });
  run('init', '-q');
  run('config', 'user.email', 'a@example.com');
  run('config', 'user.name', 'a');
  run('config', 'commit.gpgsign', 'false');
  run('config', 'core.autocrlf', 'false');
  const commit = (file, body, subject) => {
    mkdirSync(dirname(join(repo, file)), { recursive: true });
    writeFileSync(join(repo, file), body);
    run('add', file);
    run('commit', '-q', '-m', subject);
    return run('rev-parse', 'HEAD').trim();
  };
  return { repo, commit };
}

const line = (record) => JSON.stringify(record) + '\n';
function codexSession(dir, name, cwd, records) {
  mkdirSync(dir, { recursive: true });
  const file = join(dir, name);
  writeFileSync(file, line({ timestamp: '2026-01-01T00:00:00Z', type: 'session_meta', payload: { id: 'sess-' + name, cwd } }) + records.map(line).join(''));
  return file;
}
const user = (at, text) => ({ timestamp: at, type: 'response_item', payload: { type: 'message', role: 'user', content: [{ type: 'input_text', text }] } });
const assistant = (at, text) => ({ timestamp: at, type: 'response_item', payload: { type: 'message', role: 'assistant', content: [{ type: 'output_text', text }] } });
const call = (at, name, input) => ({ timestamp: at, type: 'response_item', payload: { type: 'custom_tool_call', name, input } });

const events = (file) => readFileSync(file, 'utf8').split('\n').filter(Boolean).map((row) => JSON.parse(row));
const kinds = (rows) => rows.map((row) => row.kind).sort();

test('an incremental run appends only the commits and session records written since the cursor', () => {
  const { repo, commit } = gitRepo();
  commit('a.md', 'one\n', 'docs: first');
  const sessions = temp('flex-codex-');
  const session = codexSession(sessions, 's1.jsonl', repo, [user('2026-01-01T00:01:00Z', 'fix the order'), call('2026-01-01T00:02:00Z', 'exec', 'git status')]);
  const out = join(temp('flex-out-'), 'events.jsonl');
  const cursor = out + '.cursor.json';
  const first = cli('events', '--repo', repo, '--codex-sessions', sessions, '--since-cursor', cursor, '--out', out, '--json');
  assert.equal(first.status, 0, first.stderr);
  assert.deepEqual(kinds(events(out)), ['commit', 'request', 'tool']);

  // A run from the cursor rereads nothing, so it adds nothing and has nothing to collapse.
  const again = JSON.parse(cli('events', '--repo', repo, '--codex-sessions', sessions, '--since-cursor', cursor, '--out', out, '--json').stdout);
  assert.deepEqual([again.added, again.duplicates], [0, 0]);

  commit('b.md', 'two\n', 'docs: second');
  appendFileSync(session, line(assistant('2026-01-01T00:03:00Z', 'done')) + line(user('2026-01-01T00:04:00Z', 'no, keep the old order')));
  const third = JSON.parse(cli('events', '--repo', repo, '--codex-sessions', sessions, '--since-cursor', cursor, '--out', out, '--json').stdout);
  assert.deepEqual([third.added, third.duplicates], [2, 0]);
  const rows = events(out);
  assert.deepEqual(kinds(rows), ['commit', 'commit', 'correction', 'request', 'tool']);
  assert.deepEqual(rows.find((row) => row.kind === 'commit' && row.text === 'docs: second').files, ['b.md']);
  assert.equal(rows.find((row) => row.kind === 'correction').text, 'no, keep the old order');
});

test('the same records reached twice collapse to one event, and unknown record types are skipped and counted', () => {
  const { repo, commit } = gitRepo();
  commit('a.md', 'one\n', 'docs: first');
  const sessions = temp('flex-codex-');
  const records = [user('2026-01-01T00:01:00Z', 'rename it'), { timestamp: '2026-01-01T00:01:30Z', type: 'future_record', payload: {} }, 'not json'];
  const body = line({ timestamp: '2026-01-01T00:00:00Z', type: 'session_meta', payload: { id: 'same', cwd: repo } }) + records.map((r) => (typeof r === 'string' ? r + '\n' : line(r))).join('');
  mkdirSync(join(sessions, 'live'), { recursive: true });
  mkdirSync(join(sessions, 'archived'), { recursive: true });
  writeFileSync(join(sessions, 'live', 'x.jsonl'), body);
  writeFileSync(join(sessions, 'archived', 'x.jsonl'), body);
  const out = join(temp('flex-out-'), 'events.jsonl');
  const run = cli('events', '--repo', repo, '--codex-sessions', sessions, '--out', out, '--json');
  assert.equal(run.status, 0, run.stderr);
  const result = JSON.parse(run.stdout);
  assert.equal(result.duplicates, 1);
  assert.deepEqual(kinds(events(out)), ['commit', 'request']);
  assert.equal(result.skipped['codex/future_record/'], 2);
  assert.equal(result.skipped['codex/unparsed-line'], 2);
});

test('a session working elsewhere is left out until its records name the repository', () => {
  const { repo, commit } = gitRepo();
  commit('a.md', 'one\n', 'docs: first');
  const sessions = temp('flex-codex-');
  const other = temp('flex-elsewhere-');
  const session = codexSession(sessions, 'far.jsonl', other, [user('2026-01-01T00:01:00Z', 'unrelated')]);
  const out = join(temp('flex-out-'), 'events.jsonl');
  const cursor = out + '.cursor.json';
  cli('events', '--repo', repo, '--codex-sessions', sessions, '--since-cursor', cursor, '--out', out);
  assert.deepEqual(kinds(events(out)), ['commit']);
  appendFileSync(session, line(call('2026-01-01T00:02:00Z', 'exec', 'git -C ' + repo + ' status')));
  cli('events', '--repo', repo, '--codex-sessions', sessions, '--since-cursor', cursor, '--out', out);
  const rows = events(out).filter((row) => row.kind !== 'commit');
  assert.deepEqual(kinds(rows), ['request', 'tool']);
  assert.ok(rows.every((row) => row.link === 'mention'));
});

function cardsFixture() {
  const { repo, commit } = gitRepo();
  commit('rules.md', 'keep the order\n', 'docs: rule');
  const out = join(temp('flex-out-'), 'events.jsonl');
  assert.equal(cli('events', '--repo', repo, '--out', out).status, 0);
  const [event] = events(out);
  const watch = JSON.parse(cli('hash', '--repo', repo, 'rules.md').stdout).watch;
  const cards = temp('flex-cards-');
  const card = (name, body) => writeFileSync(join(cards, name), '# ' + name + '\n\n\x60\x60\x60json card\n' + JSON.stringify(body, null, 2) + '\n\x60\x60\x60\n');
  return { repo, out, event, watch, cards, card };
}

test('cards-check passes a card whose evidence resolves and whose watched rule is unchanged', () => {
  const { repo, out, event, watch, cards, card } = cardsFixture();
  card('order.md', { status: 'hypothesis', evidence: [{ event: event.id, role: 'origin' }], watch });
  const run = cli('cards-check', '--cards', cards, '--events', out, '--repo', repo);
  assert.equal(run.status, 0, run.stdout + run.stderr);
  assert.match(run.stdout, /CARDS OK over 1 cards/);
});

test('a card citing an event that does not exist is flagged', () => {
  const { repo, out, event, cards, card } = cardsFixture();
  card('order.md', { status: 'hypothesis', evidence: [{ event: event.id, role: 'origin' }, { event: 'ev-0000000000000000', role: 'origin' }] });
  const run = cli('cards-check', '--cards', cards, '--events', out, '--repo', repo, '--json');
  assert.equal(run.status, 1);
  assert.deepEqual(JSON.parse(run.stdout).findings.map((f) => f.code), ['missing-event']);
});

test('a card whose watched rule file changed is marked for re-review', () => {
  const { repo, out, event, watch, cards, card } = cardsFixture();
  card('order.md', { status: 'hypothesis', evidence: [{ event: event.id, role: 'origin' }], watch });
  writeFileSync(join(repo, 'rules.md'), 'sort the order\n');
  const run = cli('cards-check', '--cards', cards, '--events', out, '--repo', repo, '--json');
  assert.equal(run.status, 1);
  assert.deepEqual(JSON.parse(run.stdout).findings, [{ card: 'order.md', code: 're-review', detail: 'rules.md changed since the card was written' }]);
});

test('a card marked accepted with no verification or acceptance event stays a hypothesis', () => {
  const { repo, out, event, cards, card } = cardsFixture();
  card('order.md', { status: 'accepted', evidence: [{ event: event.id, role: 'origin' }] });
  const run = cli('cards-check', '--cards', cards, '--events', out, '--repo', repo, '--json');
  assert.equal(run.status, 1);
  assert.deepEqual(JSON.parse(run.stdout).findings.map((f) => f.code), ['unsupported-acceptance']);
  card('order.md', { status: 'accepted', evidence: [{ event: event.id, role: 'verification' }] });
  assert.equal(cli('cards-check', '--cards', cards, '--events', out, '--repo', repo).status, 0);
});

test('usage errors and unreadable inputs exit 2', () => {
  assert.equal(cli().status, 2);
  assert.equal(cli('events', '--out', 'x.jsonl').status, 2);
  assert.equal(cli('events', '--repo', join(tmpdir(), 'flex-absent-repo'), '--out', 'x.jsonl').status, 2);
  assert.equal(cli('cards-check', '--cards', tmpdir()).status, 2);
  assert.equal(cli('events', '--bogus').status, 2);
});
