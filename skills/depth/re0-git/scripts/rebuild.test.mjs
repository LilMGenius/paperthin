import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const scratch = mkdtempSync(join(tmpdir(), 're0-git-'));
// The CLI reads git config like any user would, so the machine's global config (a signing key, commit.gpgsign) is shut
// out: these repositories have no user.signingkey, and -S must be skipped with signing reported unavailable.
const globalConfig = join(scratch, 'gitconfig');
writeFileSync(globalConfig, '');
const env = { ...process.env, GIT_CONFIG_GLOBAL: globalConfig, GIT_CONFIG_NOSYSTEM: '1' };
// Every call goes through a junction to this folder, the way an installed skill links its source.
symlinkSync(here, join(scratch, 'scripts'), process.platform === 'win32' ? 'junction' : 'dir');
const cli = join(scratch, 'scripts', 'rebuild.mjs');
process.on('exit', () => rmSync(scratch, { recursive: true, force: true }));

function run(args) {
  const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', env });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr, json: result.status === 0 || args[0] === 'verify' ? safeJson(result.stdout) : null };
}
const safeJson = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

// A linear repository whose commits carry distinct authors, committers and odd raw dates, so a restamp shows. The committer
// of every commit but one is the repository user, which makes the signing rule observable.
function repository(name) {
  const dir = mkdtempSync(join(scratch, name + '-'));
  const git = (args, extra = {}) => execFileSync('git', args, { cwd: dir, encoding: 'utf8', env: { ...env, ...extra } }).trim();
  git(['init', '-q', '-b', 'main']);
  git(['config', 'user.email', 'me@example.com']);
  git(['config', 'user.name', 'Me']);
  git(['config', 'core.autocrlf', 'false']);
  const commit = (file, text, message, { author = ['Ann', 'ann@example.com'], committer = ['Me', 'me@example.com'], ad, cd }) => {
    writeFileSync(join(dir, file), text);
    git(['add', file]);
    git(['commit', '-q', '-m', message], { GIT_AUTHOR_NAME: author[0], GIT_AUTHOR_EMAIL: author[1], GIT_AUTHOR_DATE: '@' + ad, GIT_COMMITTER_NAME: committer[0], GIT_COMMITTER_EMAIL: committer[1], GIT_COMMITTER_DATE: '@' + cd });
    return git(['rev-parse', 'HEAD']);
  };
  return { dir, git, commit };
}
const lines = (git, range) => git(['log', '--reverse', '--date=raw', '--format=%an %ae %ad %cn %ce %cd', range]).split('\n');
const diffOf = (git, sha) => git(['diff', sha + '^', sha]);

function threeCommits(name) {
  const repo = repository(name);
  const base = repo.commit('base.txt', 'base\n', 'chore: base', { ad: '1000 +0000', cd: '1000 +0000' });
  const a = repo.commit('a.txt', 'a\n', 'feat(a): add a', { ad: '2000 +0900', cd: '2600 -0130' });
  const b = repo.commit('b.txt', 'b\n', 'feat(b): add b', { author: ['Bob', 'bob@example.com'], committer: ['Bob', 'bob@example.com'], ad: '3000 +0100', cd: '3100 +0100' });
  const c = repo.commit('c.txt', 'c\n', 'fix(c): add c', { ad: '4000 +0530', cd: '4200 +0530' });
  return { ...repo, base, a, b, c };
}

test('messages rewrites one message and keeps every tree and all six identity and date fields', () => {
  const { dir, git, base, a, b, c } = threeCommits('messages');
  const messages = mkdtempSync(join(scratch, 'msgs-'));
  writeFileSync(join(messages, a + '.txt'), 'feat(a): add the a file\n\n- a reader finds a.txt\n');
  const before = lines(git, base + '..HEAD');
  const out = run(['messages', '--repo', dir, '--base', base, '--messages', messages]);
  assert.equal(out.status, 0, out.stderr);
  const { map, new: tip, old, signing } = out.json;
  assert.equal(old, c);
  assert.equal(git(['rev-parse', 'HEAD']), c, 'no ref moved');
  assert.deepEqual(Object.keys(map), [a, b, c]);
  assert.equal(git(['diff', c, tip]), '');
  for (const sha of [a, b, c]) assert.equal(git(['rev-parse', map[sha] + '^{tree}']), git(['rev-parse', sha + '^{tree}']));
  assert.deepEqual(lines(git, base + '..' + tip), before);
  assert.equal(git(['log', '-1', '--format=%B', map[a]]), 'feat(a): add the a file\n\n- a reader finds a.txt');
  assert.equal(git(['log', '-1', '--format=%B', map[b]]), 'feat(b): add b');
  assert.equal(git(['log', '-1', '--format=%G?', map[b]]), 'N', 'Bob committed b, so it is never signed as ours');
  assert.match(signing, /^unavailable/);
  const checked = run(['verify', '--repo', dir, '--old', c, '--new', tip]);
  assert.equal(checked.status, 0, checked.stdout + checked.stderr);
  assert.equal(checked.json.checks.signing, 'unavailable', 'unsigned is reported as unavailable, never as a pass');
  assert.deepEqual(checked.json.unsigned, [map[a], map[c]]);
});

test('a merge in range is refused with exit 2 before anything is written', () => {
  const { dir, git, base } = threeCommits('merge');
  const tip = git(['rev-parse', 'HEAD']);
  git(['checkout', '-q', '-b', 'side', base]);
  writeFileSync(join(dir, 'side.txt'), 'side\n');
  git(['add', 'side.txt']);
  git(['commit', '-q', '-m', 'feat(side): side']);
  git(['checkout', '-q', 'main']);
  git(['merge', '-q', '--no-ff', '-m', 'merge side', 'side']);
  const objects = git(['count-objects']);
  const messages = mkdtempSync(join(scratch, 'msgs-'));
  const out = run(['messages', '--repo', dir, '--base', base, '--messages', messages]);
  assert.equal(out.status, 2);
  assert.match(out.stderr, /not linear/);
  assert.equal(git(['count-objects']), objects);
  assert.notEqual(git(['rev-parse', 'HEAD']), tip);
  assert.equal(run(['place', '--repo', dir, '--base', base, '--late', 'HEAD', '--date', '3500 +0900']).status, 2);
});

test('place puts a late commit at its date and every later commit keeps its own diff and fields', () => {
  const { dir, git, commit, base, a, b, c } = threeCommits('place');
  const late = commit('late.txt', 'late\n', 'feat(late): add late', { ad: '9000 +0900', cd: '9000 +0900' });
  const before = lines(git, base + '..' + c);
  const out = run(['place', '--repo', dir, '--base', base, '--late', late, '--date', '2800 +0900']);
  assert.equal(out.status, 0, out.stderr);
  const { map, new: tip, placed } = out.json;
  assert.equal(git(['rev-parse', 'HEAD']), late, 'no ref moved');
  assert.deepEqual(placed, [map[late]]);
  assert.equal(map[a], a, 'a commit before the placed one keeps its id');
  assert.deepEqual(git(['rev-list', '--reverse', base + '..' + tip]).split('\n'), [a, map[late], map[b], map[c]]);
  assert.equal(git(['log', '-1', '--date=raw', '--format=%ad|%cd', map[late]]), '2800 +0900|2800 +0900');
  for (const sha of [late, b, c]) assert.equal(diffOf(git, map[sha]), diffOf(git, sha));
  assert.deepEqual(lines(git, base + '..' + tip).filter((_, i) => i !== 1), before);
  assert.equal(git(['diff', late, tip]), '');
  const checked = run(['verify', '--repo', dir, '--old', late, '--new', tip, '--placed', map[late]]);
  assert.equal(checked.status, 0, checked.stdout + checked.stderr);
  assert.equal(checked.json.checks.placed, 'pass');
  assert.equal(run(['place', '--repo', dir, '--base', base, '--late', late, '--date', 'tomorrow']).status, 2);
});

test('verify exits 1 and names the line when a rebuild restamped a date', () => {
  const { dir, git, base, a, b, c } = threeCommits('restamp');
  // A rebase-style rebuild: same trees and messages, but b's committer date moved to now.
  let parent = base;
  for (const sha of [a, b, c]) {
    const [an, ae, ad, cn, ce, cd, message] = git(['log', '-1', '--date=raw', '--format=%an%x00%ae%x00%ad%x00%cn%x00%ce%x00%cd%x00%B', sha]).split('\0');
    const stamp = sha === b ? '99999 +0000' : cd;
    parent = git(['commit-tree', sha + '^{tree}', '-p', parent, '-m', message], { GIT_AUTHOR_NAME: an, GIT_AUTHOR_EMAIL: ae, GIT_AUTHOR_DATE: '@' + ad, GIT_COMMITTER_NAME: cn, GIT_COMMITTER_EMAIL: ce, GIT_COMMITTER_DATE: '@' + stamp });
  }
  const out = run(['verify', '--repo', dir, '--old', c, '--new', parent]);
  assert.equal(out.status, 1);
  assert.equal(out.json.checks.identity, 'fail');
  assert.equal(out.json.checks.tree, 'pass');
  assert.match(out.json.failures.join('\n'), new RegExp('identity: .* of ' + b + ' changed from .*3100 \\+0100.*99999 \\+0000'));
});

test('usage errors exit 2 and help exits 0 through the junction', () => {
  assert.equal(run(['--help']).status, 0);
  assert.equal(run(['frobnicate']).status, 2);
  assert.equal(run(['verify', '--repo', scratch]).status, 2);
  assert.equal(run(['messages', '--repo', join(scratch, 'missing'), '--base', 'HEAD', '--messages', scratch]).status, 2);
});
