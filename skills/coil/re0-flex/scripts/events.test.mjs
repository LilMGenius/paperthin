import { test } from 'node:test';
import assert from 'node:assert/strict';
import { appendFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const temps = [];
const temp = (prefix) => {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  temps.push(dir);
  return dir;
};
process.on('exit', () => temps.forEach((dir) => rmSync(dir, { recursive: true, force: true })));

// Every CLI call goes through a junction to this folder, the way an installed skill runs, and with every home variable
// pointed at an empty folder, so no run reads this machine's real session logs.
const linkRoot = temp('flex-link-');
const link = join(linkRoot, 'scripts');
const junction = (target, path) => symlinkSync(target, path, process.platform === 'win32' ? 'junction' : 'dir');
junction(here, link);
const emptyHome = temp('flex-home-');
const homeEnv = { HOME: emptyHome, USERPROFILE: emptyHome, CODEX_HOME: emptyHome, CLAUDE_CONFIG_DIR: emptyHome };
const cliWith = (env, ...args) => spawnSync(process.execPath, [join(link, 'events.mjs'), ...args], { encoding: 'utf8', env: { ...process.env, ...homeEnv, ...env } });
const cli = (...args) => cliWith({}, ...args);

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
  commit('a.md', 'one\n', 'docs: first');
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
const fnCall = (at, name, args) => ({ timestamp: at, type: 'response_item', payload: { type: 'function_call', name, arguments: JSON.stringify(args) } });
let commandIds = 0;
const ran = (command, output, exitCode, cwd, extra = {}) => {
  commandIds += 1;
  const item = { type: 'CommandExecution', id: 'exec-' + commandIds, command, cwd: pathToFileURL(cwd).href, aggregated_output: output, exit_code: exitCode, status: exitCode === 0 ? 'completed' : 'failed', ...extra };
  return { timestamp: new Date(Date.UTC(2026, 0, 1, 1) + commandIds * 1000).toISOString(), type: 'event_msg', payload: { type: 'item_completed', item } };
};
const bash = (script) => ['/bin/bash', '-lc', script];

function claudeSession(dir, name, cwd, records) {
  mkdirSync(dir, { recursive: true });
  const file = join(dir, name);
  writeFileSync(file, records.map((record, i) => line({ sessionId: 'claude-' + name, uuid: name + '-' + i, timestamp: '2026-01-01T00:0' + i + ':00Z', cwd, ...record })).join(''));
  return file;
}
const claudeUser = (text) => ({ type: 'user', message: { role: 'user', content: text } });
const claudeUse = (id, name, input) => ({ type: 'assistant', message: { role: 'assistant', content: [{ type: 'tool_use', id, name, input }] } });
const claudeResult = (id, content, isError) => ({ type: 'user', message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: id, content, is_error: isError }] } });

const events = (file) => readFileSync(file, 'utf8').split('\n').filter(Boolean).map((row) => JSON.parse(row));
const kinds = (rows) => rows.map((row) => row.kind).sort();
const outFile = () => join(temp('flex-out-'), 'events.jsonl');
const collectRun = (repo, sessions, ...extra) => {
  const out = outFile();
  const run = cli('events', '--repo', repo, ...sessions.flatMap((dir) => ['--sessions', dir]), '--out', out, '--json', ...extra);
  assert.equal(run.status, 0, run.stderr);
  return { out, result: JSON.parse(run.stdout), rows: events(out) };
};
const checks = (rows) => rows.filter((row) => row.kind === 'verification');
const sessionRows = (rows) => rows.filter((row) => row.kind !== 'commit');

test('an incremental run appends only the commits and session records written since the cursor', () => {
  const { repo, commit } = gitRepo();
  const sessions = temp('flex-codex-');
  const session = codexSession(sessions, 's1.jsonl', repo, [user('2026-01-01T00:01:00Z', 'fix the order'), call('2026-01-01T00:02:00Z', 'exec', 'git status')]);
  const out = outFile();
  const cursor = out + '.cursor.json';
  const first = cli('events', '--repo', repo, '--sessions', sessions, '--since-cursor', cursor, '--out', out, '--json');
  assert.equal(first.status, 0, first.stderr);
  assert.deepEqual(kinds(events(out)), ['commit', 'request', 'tool']);

  // A run from the cursor rereads nothing, so it adds nothing and has nothing to collapse.
  const again = JSON.parse(cli('events', '--repo', repo, '--sessions', sessions, '--since-cursor', cursor, '--out', out, '--json').stdout);
  assert.deepEqual([again.added, again.duplicates], [0, 0]);

  commit('b.md', 'two\n', 'docs: second');
  appendFileSync(session, line(assistant('2026-01-01T00:03:00Z', 'done')) + line(user('2026-01-01T00:04:00Z', 'no, keep the old order')));
  const third = JSON.parse(cli('events', '--repo', repo, '--sessions', sessions, '--since-cursor', cursor, '--out', out, '--json').stdout);
  assert.deepEqual([third.added, third.duplicates], [2, 0]);
  const rows = events(out);
  assert.deepEqual(kinds(rows), ['commit', 'commit', 'correction', 'request', 'tool']);
  assert.deepEqual(rows.find((row) => row.kind === 'commit' && row.text === 'docs: second').files, ['b.md']);
  assert.equal(rows.find((row) => row.kind === 'correction').text, 'no, keep the old order');
});

test('the same records reached twice collapse to one event, and unknown record types are skipped and counted', () => {
  const { repo } = gitRepo();
  const sessions = temp('flex-codex-');
  const records = [user('2026-01-01T00:01:00Z', 'rename it'), { timestamp: '2026-01-01T00:01:30Z', type: 'future_record', payload: {} }, 'not json'];
  const body = line({ timestamp: '2026-01-01T00:00:00Z', type: 'session_meta', payload: { id: 'same', cwd: repo } }) + records.map((r) => (typeof r === 'string' ? r + '\n' : line(r))).join('');
  mkdirSync(join(sessions, 'live'), { recursive: true });
  mkdirSync(join(sessions, 'archived'), { recursive: true });
  writeFileSync(join(sessions, 'live', 'x.jsonl'), body);
  writeFileSync(join(sessions, 'archived', 'x.jsonl'), body);
  const { result, rows } = collectRun(repo, [sessions]);
  assert.equal(result.duplicates, 1);
  assert.deepEqual(kinds(rows), ['commit', 'request']);
  assert.equal(result.skipped['codex/future_record/'], 2);
  assert.equal(result.skipped['codex/unparsed-line'], 2);
});

test('each file in a --sessions folder is read in the format it is written in, and unknown files are skipped and counted', () => {
  const { repo } = gitRepo();
  const first = temp('flex-mixed-');
  const second = temp('flex-mixed-');
  codexSession(first, 'rollout.jsonl', repo, [user('2026-01-01T00:01:00Z', 'from codex')]);
  claudeSession(join(second, 'project'), 'claude.jsonl', repo, [claudeUser('from claude')]);
  writeFileSync(join(first, 'other.jsonl'), line({ some: 'record' }));
  writeFileSync(join(second, 'notes.md'), '# notes\n');
  const { result, rows } = collectRun(repo, [first, second]);
  assert.deepEqual(sessionRows(rows).map((row) => [row.source, row.text]).sort(), [['claude', 'from claude'], ['codex', 'from codex']]);
  assert.equal(result.filesUnknown, 2);
  assert.deepEqual(result.folders, [first, second]);
});

test('with no --sessions the run reads the Codex and Claude Code folders under CODEX_HOME and CLAUDE_CONFIG_DIR', () => {
  const { repo } = gitRepo();
  const codexHome = temp('flex-codex-home-');
  const claudeHome = temp('flex-claude-home-');
  codexSession(join(codexHome, 'sessions', '2026'), 'live.jsonl', repo, [user('2026-01-01T00:01:00Z', 'live')]);
  codexSession(join(codexHome, 'archived_sessions'), 'old.jsonl', repo, [user('2026-01-01T00:01:00Z', 'archived')]);
  claudeSession(join(claudeHome, 'projects', 'p'), 'c.jsonl', repo, [claudeUser('claude')]);
  const out = outFile();
  const run = cliWith({ CODEX_HOME: codexHome, CLAUDE_CONFIG_DIR: claudeHome }, 'events', '--repo', repo, '--out', out);
  assert.equal(run.status, 0, run.stderr);
  assert.deepEqual(sessionRows(events(out)).map((row) => row.text).sort(), ['archived', 'claude', 'live']);
  const folders = [join(codexHome, 'sessions'), join(codexHome, 'archived_sessions'), join(claudeHome, 'projects')];
  assert.match(run.stdout, new RegExp('folders read: ' + folders.join(', ').replace(/[\\.^$()[\]{}*+?|]/g, '\\$&')));

  // The empty homes every other test runs under read no folder at all.
  const empty = cli('events', '--repo', repo, '--out', outFile(), '--json');
  assert.deepEqual(JSON.parse(empty.stdout).folders, []);
});

test('the host-named session flags are gone and exit as a usage error', () => {
  const { repo } = gitRepo();
  const sessions = temp('flex-codex-');
  for (const flag of ['--codex-sessions', '--claude-sessions']) {
    const run = cli('events', '--repo', repo, flag, sessions, '--out', outFile());
    assert.equal(run.status, 2, flag);
    assert.match(run.stderr, /usage: node events\.mjs events/);
  }
});

test('a test runner summary becomes a verification event only when the command ran that runner', () => {
  const { repo } = gitRepo();
  const sessions = temp('flex-codex-');
  const nodeSummary = 'ok 1 - a\n\u2139 tests 3\n\u2139 suites 0\n\u2139 pass 2\n\u2139 fail 1\n\u2139 cancelled 0\n\u2139 skipped 0\n\u2139 todo 0\n';
  codexSession(sessions, 'runners.jsonl', repo, [
    ran(bash('node --test'), nodeSummary, 1, repo),
    ran(['C:\\Program Files\\PowerShell\\7\\pwsh.exe', '-Command', 'npx jest'], 'Tests:       1 failed, 4 passed, 5 total\n', 1, repo),
    ran(bash('pnpm exec vitest run'), ' Test Files  1 passed (1)\n      Tests  6 passed (6)\n', 0, repo),
    ran(bash('python -m pytest -q'), '===== 1 failed, 7 passed, 2 skipped in 0.42s =====\n', 1, repo),
    ran(bash('cargo test'), 'test result: ok. 3 passed; 0 failed; 1 ignored; 0 measured; 0 filtered out\n\ntest result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out\n', 0, repo),
    ran(bash('go test ./...'), 'ok  \texample.com/a\t0.01s\n?   \texample.com/b\t[no test files]\n--- FAIL: TestX (0.00s)\nFAIL\texample.com/c\t0.02s\nFAIL\n', 1, repo),
    // The same summaries printed by a command that did not run the runner record nothing.
    ran(bash('cat test-output.txt'), nodeSummary, 0, repo),
    ran(bash('node scripts/run.js --test'), nodeSummary, 0, repo),
  ]);
  const found = checks(collectRun(repo, [sessions]).rows).map((row) => [row.check, row.runner, row.result, row.counts, row.exitCode, row.compound]);
  assert.deepEqual(found, [
    ['test', 'node --test', 'fail', { tests: 3, suites: 0, pass: 2, fail: 1, cancelled: 0, skipped: 0, todo: 0 }, 1, false],
    ['test', 'jest', 'fail', { fail: 1, pass: 4, tests: 5 }, 1, false],
    ['test', 'vitest', 'pass', { pass: 6, tests: 6 }, 0, false],
    ['test', 'pytest', 'fail', { fail: 1, pass: 7, skipped: 2 }, 1, false],
    ['test', 'cargo test', 'pass', { pass: 5, fail: 0, ignored: 1 }, 0, false],
    ['test', 'go test', 'fail', { ok: 1, fail: 1, noTests: 1 }, 1, false],
  ]);
});

test('a compound command is flagged, its test summary still counts and its exit code decides nothing', () => {
  const { repo } = gitRepo();
  const sessions = temp('flex-codex-');
  codexSession(sessions, 'compound.jsonl', repo, [
    ran(bash('cd sub && node --test; echo done'), '# tests 2\n# pass 1\n# fail 1\n', 0, repo),
    ran(bash('eslint . ; echo done'), '', 0, repo),
    ran(bash('tsc --noEmit | tail -5'), '', 0, repo),
  ]);
  const { rows, result } = collectRun(repo, [sessions]);
  assert.deepEqual(checks(rows).map((row) => [row.runner, row.result, row.exitCode, row.compound]), [['node --test', 'fail', 0, true]]);
  assert.equal(result.skipped['check/compound-lint'], 1);
  assert.equal(result.skipped['check/compound-typecheck'], 1);
});

test('a lint or type-check counts by exit code when the command is that single invocation', () => {
  const { repo } = gitRepo();
  const sessions = temp('flex-codex-');
  const sub = join(repo, 'pkg');
  mkdirSync(sub);
  codexSession(sessions, 'lint.jsonl', repo, [
    ran(bash('npx eslint .'), 'error  no-unused-vars\n', 1, sub),
    ran(bash('tsc --noEmit'), '', 0, repo),
    ran(bash('prettier --check .'), '', 0, repo),
    // Writing files is not a check, and a check with no exit code says nothing.
    ran(bash('prettier --write .'), '', 0, repo),
    ran(bash('ruff check'), '', null, repo),
  ]);
  const found = checks(collectRun(repo, [sessions]).rows).map((row) => [row.check, row.runner, row.result, row.counts, row.exitCode, row.cwd]);
  assert.deepEqual(found, [
    ['lint', 'eslint', 'fail', null, 1, sub],
    ['typecheck', 'tsc', 'pass', null, 0, repo],
    ['lint', 'prettier', 'pass', null, 0, repo],
  ]);
});

test('a CI result is read only from unfiltered gh run view or list --json output', () => {
  const { repo } = gitRepo();
  const sessions = temp('flex-codex-');
  const listed = JSON.stringify([{ status: 'completed', conclusion: 'success' }, { status: 'completed', conclusion: 'failure' }, { status: 'in_progress', conclusion: '' }]);
  const viewed = JSON.stringify({ status: 'completed', conclusion: 'success', databaseId: 7 });
  codexSession(sessions, 'ci.jsonl', repo, [
    ran(bash('gh run list --limit 3 --json status,conclusion'), listed, 0, repo),
    ran(bash('gh run view 7 --json status,conclusion,databaseId'), viewed, 0, repo),
    ran(bash('gh run list --json conclusion --jq ".[0]"'), viewed, 0, repo),
    ran(bash('gh run list --json conclusion | jq ".[0]"'), viewed, 0, repo),
    ran(bash('gh run list --json conclusion --template "{{.}}"'), viewed, 0, repo),
    ran(bash('gh run list'), 'completed success ci main\n', 0, repo),
  ]);
  const found = checks(collectRun(repo, [sessions]).rows).map((row) => [row.check, row.runner, row.result, row.counts]);
  assert.deepEqual(found, [
    ['ci', 'gh run list', 'fail', { success: 1, failure: 1, in_progress: 1 }],
    ['ci', 'gh run view', 'pass', { success: 1 }],
  ]);
});

test('a Claude Code shell result gives its exit code, and a result arriving in a later run still makes exactly one event', () => {
  const { repo } = gitRepo();
  const sessions = temp('flex-claude-');
  const dir = join(sessions, 'project');
  const file = claudeSession(dir, 'shell.jsonl', repo, [
    claudeUser('run the tests'),
    claudeUse('toolu_1', 'Bash', { command: 'npx jest' }),
    claudeResult('toolu_1', 'Exit code 1\nTests:       2 failed, 3 passed, 5 total\n', true),
    claudeUse('toolu_2', 'PowerShell', { command: 'pytest' }),
  ]);
  const out = outFile();
  const cursor = out + '.cursor.json';
  const run = (expectAdded) => {
    const result = JSON.parse(cli('events', '--repo', repo, '--sessions', sessions, '--since-cursor', cursor, '--out', out, '--json').stdout);
    assert.equal(result.byKind.verification ?? 0, expectAdded);
  };
  run(1);
  appendFileSync(file, line({ sessionId: 'claude-shell.jsonl', uuid: 'late', timestamp: '2026-01-01T00:09:00Z', cwd: repo, ...claudeResult('toolu_2', '5 passed in 0.10s\n', false) }));
  run(1);
  run(0);
  assert.deepEqual(checks(events(out)).map((row) => [row.runner, row.result, row.exitCode, row.counts, row.cwd]), [
    ['jest', 'fail', 1, { fail: 2, pass: 3, tests: 5 }, repo],
    ['pytest', 'pass', 0, { pass: 5 }, repo],
  ]);
});

test('a path named only in injected context does not tie a session, while a tool run there does', () => {
  const { repo } = gitRepo();
  const elsewhere = temp('flex-elsewhere-');
  const injectedOnly = temp('flex-codex-');
  const context = [
    { timestamp: '2026-01-01T00:00:30Z', type: 'world_state', payload: { full: true, state: { agents_md: { directory: repo }, environments: { local: { cwd: repo } } } } },
    user('2026-01-01T00:01:00Z', '<environment_context><cwd>' + repo + '</cwd></environment_context>'),
    user('2026-01-01T00:01:30Z', 'look at ' + repo),
  ];
  codexSession(injectedOnly, 'context.jsonl', elsewhere, context);
  assert.deepEqual(kinds(collectRun(repo, [injectedOnly]).rows), ['commit']);

  // The same session ties once a tool runs in the repository, and its earlier request counts with it.
  const withTool = temp('flex-codex-');
  const file = codexSession(withTool, 'context.jsonl', elsewhere, context);
  const out = outFile();
  const cursor = out + '.cursor.json';
  cli('events', '--repo', repo, '--sessions', withTool, '--since-cursor', cursor, '--out', out);
  assert.deepEqual(kinds(events(out)), ['commit']);
  appendFileSync(file, line(fnCall('2026-01-01T00:02:00Z', 'exec_command', { cmd: 'git status', workdir: repo })));
  cli('events', '--repo', repo, '--sessions', withTool, '--since-cursor', cursor, '--out', out);
  const rows = sessionRows(events(out));
  assert.deepEqual(kinds(rows), ['request', 'tool']);
  assert.ok(rows.every((row) => row.link === 'tool'));

  // A command whose text names the repository is not a tool that ran there.
  const named = temp('flex-codex-');
  codexSession(named, 'named.jsonl', elsewhere, [fnCall('2026-01-01T00:02:00Z', 'exec_command', { cmd: 'git -C ' + repo + ' status', workdir: elsewhere })]);
  assert.deepEqual(kinds(collectRun(repo, [named]).rows), ['commit']);
});

test('a working folder written as a file URL, or a file the host parsed out of the command, ties the session', () => {
  const { repo } = gitRepo();
  const elsewhere = temp('flex-elsewhere-');
  const sessions = temp('flex-codex-');
  codexSession(sessions, 'url.jsonl', elsewhere, [user('2026-01-01T00:01:00Z', 'check it'), ran(bash('git status'), '', 0, repo)]);
  assert.deepEqual(sessionRows(collectRun(repo, [sessions]).rows).map((row) => [row.kind, row.link]), [['request', 'tool']]);
  const read = temp('flex-codex-');
  const parsed = (path) => ({ parsed_cmd: [{ type: 'read', cmd: 'cat ' + path, name: 'a.md', path }] });
  codexSession(read, 'read.jsonl', elsewhere, [user('2026-01-01T00:01:00Z', 'check it'), ran(bash('cat a.md'), '', 0, elsewhere, parsed(join(repo, 'a.md')))]);
  assert.deepEqual(sessionRows(collectRun(repo, [read]).rows).map((row) => [row.kind, row.link]), [['request', 'tool']]);
  const other = temp('flex-codex-');
  codexSession(other, 'url.jsonl', elsewhere, [user('2026-01-01T00:01:00Z', 'check it'), ran(bash('cat a.md'), '', 0, elsewhere, parsed('a.md'))]);
  assert.deepEqual(kinds(collectRun(repo, [other]).rows), ['commit']);
});

test('a relative file argument resolves against the folder the tool ran in', () => {
  const { repo } = gitRepo();
  const parent = dirname(repo);
  const sessions = temp('flex-claude-');
  claudeSession(join(sessions, 'p'), 'rel.jsonl', parent, [claudeUser('read it'), claudeUse('toolu_r', 'Read', { file_path: join(basename(repo), 'a.md') })]);
  const rows = sessionRows(collectRun(repo, [sessions]).rows);
  assert.deepEqual(kinds(rows), ['request', 'tool']);
  assert.ok(rows.every((row) => row.link === 'tool'));
  const other = temp('flex-claude-');
  claudeSession(join(other, 'p'), 'rel.jsonl', parent, [claudeUser('read it'), claudeUse('toolu_r', 'Read', { file_path: join('somewhere-else', 'a.md') })]);
  assert.deepEqual(kinds(collectRun(repo, [other]).rows), ['commit']);
});

test('a Git Bash drive path ties the session', { skip: process.platform !== 'win32' && 'Git Bash drive paths exist only on Windows' }, () => {
  const { repo } = gitRepo();
  const elsewhere = temp('flex-elsewhere-');
  const gitBash = '/' + repo[0].toLowerCase() + repo.slice(2).split('\\').join('/');
  const sessions = temp('flex-claude-');
  claudeSession(join(sessions, 'p'), 'gb.jsonl', elsewhere, [claudeUser('search'), claudeUse('toolu_g', 'Grep', { pattern: 'x', path: gitBash })]);
  assert.deepEqual(kinds(sessionRows(collectRun(repo, [sessions]).rows)), ['request', 'tool']);
  const other = temp('flex-claude-');
  claudeSession(join(other, 'p'), 'gb.jsonl', elsewhere, [claudeUser('search'), claudeUse('toolu_g', 'Grep', { pattern: 'x', path: '/' + repo[0].toLowerCase() + '/nowhere' })]);
  assert.deepEqual(kinds(collectRun(repo, [other]).rows), ['commit']);
});

test('a folder is compared as written and as resolved, so junctions in and out of the checkout both tie', () => {
  const { repo } = gitRepo();
  const outside = temp('flex-outside-');
  junction(outside, join(repo, 'linked'));
  const intoRepo = join(temp('flex-pointer-'), 'into');
  junction(repo, intoRepo);
  const sessions = temp('flex-codex-');
  codexSession(sessions, 'written.jsonl', join(repo, 'linked'), [user('2026-01-01T00:01:00Z', 'inside by its written path')]);
  codexSession(sessions, 'resolved.jsonl', intoRepo, [user('2026-01-01T00:01:00Z', 'inside by its resolved path')]);
  codexSession(sessions, 'outside.jsonl', outside, [user('2026-01-01T00:01:00Z', 'outside')]);
  const rows = sessionRows(collectRun(repo, [sessions]).rows);
  assert.deepEqual(rows.map((row) => [row.text, row.link]).sort(), [['inside by its resolved path', 'cwd'], ['inside by its written path', 'cwd']]);
});

function cardsFixture() {
  const { repo, commit } = gitRepo();
  commit('rules.md', 'keep the order\n', 'docs: rule');
  const out = outFile();
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
  assert.equal(cli('events', '--repo', here, '--sessions', join(tmpdir(), 'flex-absent-sessions'), '--out', 'x.jsonl').status, 2);
  assert.equal(cli('cards-check', '--cards', tmpdir()).status, 2);
  assert.equal(cli('events', '--bogus').status, 2);
});
