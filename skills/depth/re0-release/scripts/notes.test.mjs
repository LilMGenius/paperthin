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

test('a credit for a run of pull requests or several authors passes', () => {
  const { status, out } = check(v100.replace('(#123, @handle)', '(#12-#14, @handle) (#15, @handle, @other)'), ['--version', '1.0.0']);
  assert.equal(status, 0, out);
});

test('a 0.x note checked without a version takes package.json, which names 1.x, and fails its Install', () => {
  const { status, out } = check(v070);
  assert.equal(status, 1, out);
  assert.deepEqual(rules(out), ['install']);
  assert.match(out, /differs from the release-notes block/);
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

test('a release-notes block whose route sentence drifts from its route block fails every note', () => {
  const root = join(scratch, 'drifted-prose');
  mkdirSync(join(root, '.agents'), { recursive: true });
  const text = readFileSync(join(repo, '.agents', 'install-block.md'), 'utf8').replace(/\r\n/g, '\n');
  const drifted = text.replace('\n\nUpdates itself at startup.\n', '\n\nUpdates itself daily.\n');
  assert.ok(drifted !== text, 'the codex route sentence was not found');
  writeFileSync(join(root, '.agents', 'install-block.md'), drifted);
  const { status, out } = check(v100, ['--version', '1.0.0'], { root });
  assert.equal(status, 1, out);
  assert.deepEqual(rules(out), ['install-block']);
  assert.match(out, /not the note/);
});

test('a repository with no install block and no package.json passes the other rules and reports Install as not checked', () => {
  const root = mkdtempSync(join(scratch, 'bare-'));
  const { status, out } = check(v100, [], { root });
  assert.equal(status, 0, out);
  assert.match(out, /Install not checked against a block: the repository has no \.agents\/install-block\.md/);
});

test('a repository with no install block still fails every rule that needs no block', () => {
  const root = mkdtempSync(join(scratch, 'bare-'));
  const { status, out } = check(v101, [], { root });
  assert.equal(status, 1, out);
  assert.deepEqual(rules(out), ['install', 'section']);
});

test('an install block without the block for the note\'s era reports Install as not checked', () => {
  const root = mkdtempSync(join(scratch, 'routes-only-'));
  mkdirSync(join(root, '.agents'));
  writeFileSync(join(root, '.agents', 'install-block.md'), '<canonical-block name="codex">\n\n\x60\x60\x60bash\ncodex plugin add x@x\n\x60\x60\x60\n\nUpdates itself.\n\n</canonical-block>\n');
  const { status, out } = check(v100, ['--version', '1.0.0'], { root });
  assert.equal(status, 0, out);
  assert.match(out, /has no release-notes block/);
});

test('an install block that exists but cannot be read exits 2', () => {
  const root = mkdtempSync(join(scratch, 'unreadable-'));
  mkdirSync(join(root, '.agents', 'install-block.md'), { recursive: true });
  const { status, out } = check(v100, ['--version', '1.0.0'], { root });
  assert.equal(status, 2, out);
  assert.match(out, /cannot read the install block/);
});

test('an Also bullet that leads with what a New bullet already covers fails', () => {
  const note = v100.replace('- **Renamed and retired.** \x60readchk\x60 is now \x60readback\x60.', '- **One command.** \x60/paperthin\x60 now runs the right skills in order.');
  assert.ok(note !== v100, 'the Also bullet was not found');
  const { status, out } = check(note, ['--version', '1.0.0']);
  assert.equal(status, 1, out);
  assert.deepEqual(rules(out), ['repeats-new']);
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


// Outside git means no parent folder is a repository either, so the search stops at the scratch folder.
const outsideGit = { ...process.env, GIT_CEILING_DIRECTORIES: dirname(scratch) };

test('this repository keeps both release-notes blocks in its install block', () => {
  const text = readFileSync(join(repo, '.agents', 'install-block.md'), 'utf8').replace(/\r\n/g, '\n');
  for (const name of ['release-notes', 'release-notes-0.x']) {
    assert.match(text, new RegExp('<canonical-block name="' + name.replace('.', '\\.') + '">\\n\\n\x60\x60\x60markdown\\n### Install\\n'), name + ' block is missing');
  }
});

test('run from a subfolder with no --root, the check finds the git top level and its install block', () => {
  const dir = mkdtempSync(join(scratch, 'toplevel-'));
  execFileSync('git', ['init', '-q'], { cwd: dir, windowsHide: true });
  mkdirSync(join(dir, '.agents'));
  copyFileSync(join(repo, '.agents', 'install-block.md'), join(dir, '.agents', 'install-block.md'));
  mkdirSync(join(dir, 'deep', 'er'), { recursive: true });
  const file = join(scratch, 'note-subfolder.md');
  writeFileSync(file, v100.replace('codex plugin add paperthin@paperthin', 'pip install paperthin'));
  const result = spawnSync(process.execPath, [cli, file, '--version', '1.0.0'], { encoding: 'utf8', cwd: join(dir, 'deep', 'er'), windowsHide: true });
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.deepEqual(rules(result.stderr), ['install']);
});

test('--tag outside a git repository exits 2 with a plain message', () => {
  const dir = mkdtempSync(join(scratch, 'nogit-'));
  const result = spawnSync(process.execPath, [cli, '--tag', 'v1.0.0', '--root', repo], { encoding: 'utf8', cwd: dir, env: outsideGit, windowsHide: true });
  assert.equal(result.status, 2, result.stdout + result.stderr);
  assert.match(result.stderr, /is not inside a git repository/);
  assert.doesNotMatch(result.stderr, /at .*notes\.mjs/);
});

test('a catalog of one skill reads (1 skill), and (1 skills) fails', () => {
  const one = v100.replace('### The catalog (3 skills)', '### The catalog (1 skill)').replace('- \x60depth/\x60: \x60re0\x60, \x60readback\x60\n', '');
  assert.ok(one !== v100, 'the catalog was not found');
  assert.equal(check(one, ['--version', '1.0.0']).status, 0, check(one, ['--version', '1.0.0']).out);
  const { status, out } = check(one.replace('(1 skill)', '(1 skills)'), ['--version', '1.0.0']);
  assert.equal(status, 1, out);
  assert.deepEqual(rules(out), ['catalog']);
});

test('a # in a link target or URL is not read as a credit', () => {
  const note = v100.replace('runs the right skills in order.', 'runs the right skills in order ([steps](README.md#10-steps), https://example.com/a#2).');
  assert.ok(note !== v100);
  const { status, out } = check(note, ['--version', '1.0.0']);
  assert.equal(status, 0, out);
});

test('an empty Install fails even where no block is there to compare', () => {
  const root = mkdtempSync(join(scratch, 'bare-'));
  const { status, out } = check(v100.slice(0, v100.indexOf('### Install') + '### Install'.length) + '\n', [], { root });
  assert.equal(status, 1, out);
  assert.deepEqual(rules(out), ['install']);
  assert.match(out, /Install is empty/);
});



test('a fenced bash block in Install is code: its # comment and #34 are neither a heading nor a credit', () => {
  const root = mkdtempSync(join(scratch, 'fenced-'));
  const note = v100.slice(0, v100.indexOf('### Install')) + '### Install\n\n\x60\x60\x60bash\n# install the CLI\nnpm i -g foo  # see #34\n\x60\x60\x60\n';
  const { status, out } = check(note, [], { root });
  assert.equal(status, 0, out);
});

test('a relative notes path run from a subfolder is read from the repository root', () => {
  const dir = mkdtempSync(join(scratch, 'relative-'));
  execFileSync('git', ['init', '-q'], { cwd: dir, windowsHide: true });
  mkdirSync(join(dir, '.re0', 'release'), { recursive: true });
  writeFileSync(join(dir, '.re0', 'release', 'RELEASE_NOTES.local.md'), v101);
  mkdirSync(join(dir, 'sub'));
  const result = spawnSync(process.execPath, [cli, '.re0/release/RELEASE_NOTES.local.md'], { encoding: 'utf8', cwd: join(dir, 'sub'), windowsHide: true });
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.deepEqual(rules(result.stderr), ['install', 'section']);
});

test('an install block with no release-notes block needs no version and no package.json', () => {
  const root = mkdtempSync(join(scratch, 'other-shape-'));
  mkdirSync(join(root, '.agents'));
  writeFileSync(join(root, '.agents', 'install-block.md'), '# Install\n\nRun the installer.\n');
  const { status, out } = check(v100, [], { root });
  assert.equal(status, 0, out);
  assert.match(out, /has no release-notes block/);
});

test('text after the Install block is reported at the text, not at the blank line before it', () => {
  const note = v100 + '\nThanks to everyone.\n';
  const { status, out } = check(note, ['--version', '1.0.0']);
  assert.equal(status, 1, out);
  const want = note.replace(/\s+$/, '').split('\n').length;
  assert.match(out, new RegExp(':' + want + ': install: text after the end'));
});


test('an install block with release-notes blocks and no package.json exits 2 asking for --version', () => {
  const root = mkdtempSync(join(scratch, 'no-manifest-'));
  mkdirSync(join(root, '.agents'));
  copyFileSync(join(repo, '.agents', 'install-block.md'), join(root, '.agents', 'install-block.md'));
  const { status, out } = check(v100, [], { root });
  assert.equal(status, 2, out);
  assert.match(out, /pass --version X\.Y\.Z/);
});

test('a usage error exits 2', () => {
  const result = spawnSync(process.execPath, [cli], { encoding: 'utf8', windowsHide: true });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /usage: node notes\.mjs/);
});
