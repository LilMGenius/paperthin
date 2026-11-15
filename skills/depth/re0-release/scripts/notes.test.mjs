import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..', '..', '..', '..');
const scratch = mkdtempSync(join(tmpdir(), 're0-release-notes-'));
// Every call goes through a junction to this folder, the way an installed skill links its source.
symlinkSync(here, join(scratch, 'scripts'), process.platform === 'win32' ? 'junction' : 'dir');
const cli = join(scratch, 'scripts', 'notes.mjs');
process.on('exit', () => rmSync(scratch, { recursive: true, force: true }));

let count = 0;
function check(note, args = [], { root = repo, cwd } = {}) {
  const file = join(scratch, 'note-' + count++ + '.md');
  writeFileSync(file, note);
  const result = spawnSync(process.execPath, [cli, file, '--root', root, ...args], { encoding: 'utf8', cwd, windowsHide: true });
  return { status: result.status, out: result.stdout + result.stderr };
}

// The Install sections come from the real install-block.md, so a note passes only with what that file holds today.
const block = (name) => new RegExp('<canonical-block name="' + name + '">\\n\\n\x60\x60\x60markdown\\n([\\s\\S]*?)\\n\x60\x60\x60').exec(readFileSync(join(repo, '.agents', 'install-block.md'), 'utf8').replace(/\r\n/g, '\n'))[1];
const INSTALL = block('release-notes');
const INSTALL_0X = block('release-notes-0.x');

const v070 = [
  '## The iteration-hygiene layer',
  '',
  "Paperthin's third layer lands. Beyond keeping one artifact **clean** (\x60depth/\x60) and one truth consistent across many (\x60breadth/\x60), this release adds **\x60coil/\x60**.",
  '',
  '### New: \x60coil/\x60 skills',
  '',
  '- **\x60retro\x60** turns a finished or failed cycle into portable lessons, anti-patterns, and quality gates.',
  '- **\x60nba\x60** reads the live cycle state and returns the single next best action, not a menu.',
  '',
  '### Also',
  '',
  '- \x60redteam\x60 is now **\x60hate\x60**: the same adversarial-review reflex, named for what it does.',
  '',
  '### The catalog (4 skills)',
  '',
  '- **\x60depth/\x60** (one artifact): \x60re0\x60, \x60hate\x60',
  '- **\x60coil/\x60** (one project, across iterations): \x60retro\x60, \x60nba\x60',
  '',
  INSTALL_0X,
  '',
].join('\n');

const v100 = [
  '## Type /paperthin, then your dream',
  '',
  'Paperthin 1.0 is the skillbook for recursive self-improvement (RSI).',
  '',
  '### New',
  '',
  '- **One command.** \x60/paperthin\x60 hands your request to \x60re0-workflow\x60, which runs the right skills in order.',
  '',
  '### Also',
  '',
  '- **Renamed and retired.** \x60readchk\x60 is now \x60readback\x60.',
  '- Every translated README lists the skills in the same order as the English one (#123, @handle).',
  '',
  '### The catalog (3 skills)',
  '',
  '- \x60depth/\x60: \x60re0\x60, \x60readback\x60',
  '- \x60mesh/\x60: \x60multithink\x60',
  '',
  INSTALL,
  '',
].join('\n');

// v1.0.1 as it first shipped: a ### Changed section the house style never allowed, and no Install.
const v101 = [
  "## One less file, on every directory's clock",
  '',
  "Paperthin 1.0.1 drops \x60llms-full.txt\x60. That 337 KB file held the README and every skill in one fetch, and it made Anthropic's plugin directory time out while reading the repository.",
  '',
  '### Changed',
  '',
  '- **Web chats read \x60llms.txt\x60.** Give ChatGPT or Claude on the web the address of \x60llms.txt\x60.',
  '- A bookmark to \x60llms-full.txt\x60 now answers 404. Use \x60llms.txt\x60 instead.',
  '',
].join('\n');

// v0.11.0's shape: New and Also items as paragraphs without bullets or bold leads, and an em dash in the intro.
const v0110 = [
  '## Five new skills, and a lifecycle that names its mechanism instead of its brand',
  '',
  'Every clean-version lifecycle command now carries the \x60re0-\x60 prefix \u2014 so a name states the mechanism it runs.',
  '',
  '### New',
  '',
  '\x60readchk\x60 checks the model\'s read of a non-trivial request before the work is spent.',
  '',
  '\x60modelchk\x60 recommends the cheapest sufficient capability tier.',
  '',
  '### Also',
  '',
  '\x60ssotchk\x60 folds into \x60ssotize\x60, which now owns the full path.',
  '',
  INSTALL_0X,
  '',
].join('\n');

const rules = (out) => [...new Set([...out.matchAll(/:\d+: ([a-z-]+): /g)].map((match) => match[1]))].sort();

test('a v0.7.0-shaped note passes against the pre-1.0 Install', () => {
  const { status, out } = check(v070, ['--version', '0.7.0']);
  assert.equal(status, 0, out);
  assert.match(out, /ok \(release-notes-0\.x\)/);
});

test('a v1.0.0-shaped note passes against the plugin-route Install', () => {
  const { status, out } = check(v100, ['--version', '1.0.0']);
  assert.equal(status, 0, out);
  assert.match(out, /ok \(release-notes\)/);
});

test('v1.0.1 as first shipped fails on its Changed section and its missing Install', () => {
  const { status, out } = check(v101, ['--version', '1.0.1']);
  assert.equal(status, 1, out);
  assert.deepEqual(rules(out), ['install', 'section']);
  assert.match(out, /### Changed is not a house-style section/);
});

test('a v0.11.0-shaped note fails on paragraph items and the em dash', () => {
  const { status, out } = check(v0110, ['--version', '0.11.0']);
  assert.equal(status, 1, out);
  assert.deepEqual(rules(out), ['bullets', 'em-dash']);
});

test('the Install era follows the version, read from a vX.Y.Z.md file name when no flag names it', () => {
  const file = join(scratch, 'v0.9.0.md');
  writeFileSync(file, v100);
  const result = spawnSync(process.execPath, [cli, file, '--root', repo], { encoding: 'utf8', windowsHide: true });
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.deepEqual(rules(result.stderr), ['install']);
  assert.match(result.stderr, /differs from the release-notes-0\.x block/);
});

test('a New bullet without a bold lead, a section out of order, a version heading and a short catalog each fail by name', () => {
  const note = v100
    .replace('## Type /paperthin, then your dream', '## v1.0.0: type /paperthin')
    .replace('- **One command.** ', '- ')
    .replace('- \x60mesh/\x60: \x60multithink\x60\n', '')
    .replace('### New', '### Also\n\n- moved up\n\n### New');
  const { status, out } = check(note, ['--version', '1.0.0']);
  assert.equal(status, 1, out);
  assert.deepEqual(rules(out), ['bold-lead', 'catalog', 'heading', 'order', 'section']);
});

test('a credit outside the (#123, @handle) form fails', () => {
  const { status, out } = check(v100.replace('(#123, @handle)', '(PR #123 by @handle)'), ['--version', '1.0.0']);
  assert.equal(status, 1, out);
  assert.deepEqual(rules(out), ['credit']);
});

test('a release-notes block whose commands drift from the route blocks fails every note', () => {
  const root = join(scratch, 'drifted');
  mkdirSync(join(root, '.agents'), { recursive: true });
  const text = readFileSync(join(repo, '.agents', 'install-block.md'), 'utf8').replace(/\r\n/g, '\n');
  // Only the codex route block ends its command line with a closing fence; the release-notes copy continues with prose.
  const drifted = text.replace('&& codex plugin add paperthin@paperthin\n\x60\x60\x60', '&& codex plugin install paperthin@paperthin\n\x60\x60\x60');
  assert.ok(drifted !== text, 'the codex route block was not found');
  writeFileSync(join(root, '.agents', 'install-block.md'), drifted);
  const { status, out } = check(v100, ['--version', '1.0.0'], { root });
  assert.equal(status, 1, out);
  assert.deepEqual(rules(out), ['install-block']);
});

test('--tag reads an annotated tag message in the current repository', () => {
  const dir = mkdtempSync(join(scratch, 'repo-'));
  const git = (args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8', windowsHide: true, env: { ...process.env, GIT_CONFIG_GLOBAL: join(scratch, 'none'), GIT_CONFIG_NOSYSTEM: '1' } });
  git(['init', '-q']);
  git(['-c', 'user.name=Me', '-c', 'user.email=me@example.com', 'commit', '-q', '--allow-empty', '-m', 'init']);
  writeFileSync(join(dir, 'msg'), v101);
  git(['-c', 'user.name=Me', '-c', 'user.email=me@example.com', 'tag', '-a', 'v1.0.1', '-F', 'msg', '--cleanup=verbatim']);
  const result = spawnSync(process.execPath, [cli, '--tag', 'v1.0.1', '--root', repo], { encoding: 'utf8', cwd: dir, windowsHide: true });
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.deepEqual(rules(result.stderr), ['install', 'section']);
});

test('a usage error exits 2', () => {
  const result = spawnSync(process.execPath, [cli], { encoding: 'utf8', windowsHide: true });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /usage: node notes\.mjs/);
});
