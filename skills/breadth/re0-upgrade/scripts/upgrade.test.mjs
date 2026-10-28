import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const scratch = mkdtempSync(join(tmpdir(), 're0-upgrade-'));
// Every call goes through a junction to this folder, the way an installed skill links its source.
symlinkSync(here, join(scratch, 'scripts'), process.platform === 'win32' ? 'junction' : 'dir');
const cli = join(scratch, 'scripts', 'upgrade.mjs');
process.on('exit', () => rmSync(scratch, { recursive: true, force: true }));

function run(args) {
  const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
  let json = null;
  try {
    json = JSON.parse(result.stdout);
  } catch {
    json = null;
  }
  return { status: result.status, stdout: result.stdout, stderr: result.stderr, json };
}
const write = (path, text) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
  return path;
};

// A SKILL.md shaped like re0-upgrade's own: old-a is renamed twice (old-a -> mid-a -> new-a), old-b once.
const RULES = [
  '# fixture', '', '## Deprecations', '', 'Prose before the table.', '',
  '| Deprecated | Renamed to | Since |', '| --- | --- | --- |',
  '| \x60old-a\x60 | \x60mid-a\x60 | 0.1.0 |', '| \x60old-b\x60 | \x60new-b\x60 | 0.2.0 |', '| \x60mid-a\x60 | \x60new-a\x60 | 0.3.0 |', '',
  '## Current catalog', '', 'Install these.', '', '\x60new-a\x60, \x60new-b\x60, \x60kept\x60, \x60fresh\x60', '', '## Workflow', '', '1. \x60not-a-skill\x60', '',
].join('\n');
const skillMd = write(join(scratch, 'rules', 'SKILL.md'), RULES);

function installDir(name, slugs) {
  const dir = join(scratch, name);
  for (const [slug, frontName] of Object.entries(slugs)) write(join(dir, slug, 'SKILL.md'), '---\nname: ' + frontName + '\n---\n');
  write(join(dir, '.skill-lock.json'), '{}');
  return dir;
}

test('classify sorts a skills directory into stale, missing, present and unknown, resolving the rename chain', () => {
  // old-b's folder already says new-b in its frontmatter; it is still stale by its slug. new-b is installed, so it is
  // present and never added again. old-a's chain ends at new-a, which is not installed, so new-a is missing.
  const dir = installDir('install', { 'old-a': 'old-a', 'old-b': 'new-b', 'new-b': 'new-b', kept: 'kept', stray: 'stray' });
  const out = run(['classify', '--skill-md', skillMd, '--installed', dir]);
  assert.equal(out.status, 1, out.stderr);
  assert.deepEqual(out.json, {
    stale: [{ name: 'old-a', replacement: 'new-a', replacementInstalled: false }, { name: 'old-b', replacement: 'new-b', replacementInstalled: true }],
    missing: ['new-a', 'fresh'],
    present: ['new-b', 'kept'],
    unknown: ['stray'],
  });
});

test('classify reads a names file and exits 0 when nothing is stale or missing', () => {
  const names = write(join(scratch, 'names.txt'), '# from the scoped list\nnew-a\r\nnew-b\n\nkept\nfresh\nother\n');
  const out = run(['classify', '--skill-md', skillMd, '--installed', names]);
  assert.equal(out.status, 0, out.stderr);
  assert.deepEqual(out.json, { stale: [], missing: [], present: ['new-a', 'new-b', 'kept', 'fresh'], unknown: ['other'] });
});

test('classify reads the real re0-upgrade SKILL.md and resolves its longest chain', () => {
  const out = run(['classify', '--skill-md', join(here, '..', 'SKILL.md'), '--installed', write(join(scratch, 'real.txt'), 'ssot-check\nsip\n')]);
  assert.equal(out.status, 1, out.stderr);
  assert.deepEqual(out.json.stale, [{ name: 'ssot-check', replacement: 'ssotize', replacementInstalled: false }]);
  assert.ok(out.json.missing.includes('ssotize') && !out.json.missing.includes('sip'));
  assert.deepEqual(out.json.present, ['sip']);
});

test('classify refuses a table it cannot read confidently with exit 2', () => {
  const names = write(join(scratch, 'one.txt'), 'kept\n');
  const loop = write(join(scratch, 'loop', 'SKILL.md'), RULES.replace('| \x60mid-a\x60 | \x60new-a\x60 |', '| \x60mid-a\x60 | \x60old-a\x60 |'));
  assert.match(run(['classify', '--skill-md', loop, '--installed', names]).stderr, /loops/);
  const outside = write(join(scratch, 'outside', 'SKILL.md'), RULES.replace('\x60new-a\x60, ', ''));
  assert.equal(run(['classify', '--skill-md', outside, '--installed', names]).status, 2);
  assert.equal(run(['classify', '--skill-md', write(join(scratch, 'bare', 'SKILL.md'), '## Current catalog\n\n\x60kept\x60\n'), '--installed', names]).status, 2);
  assert.equal(run(['classify', '--skill-md', skillMd, '--installed', write(join(scratch, 'bad.txt'), 'two names\n')]).status, 2);
});

// Integrity fixtures: v3 is the newest published tag, v2 and v1 older, v0 predates the skill (no file), and v4 is a draft
// whose bytes equal the local edit, so a walk that read drafts would call that edit clean.
const PATH = 'skills/breadth/demo/SKILL.md';
const lockOf = (entry) => write(join(mkdtempSync(join(scratch, 'lock-')), '.skill-lock.json'), JSON.stringify({ version: 3, skills: entry === undefined ? {} : { demo: entry } }));
const goodEntry = { source: 'LilMGenius/paperthin', sourceType: 'github', sourceUrl: 'https://github.com/LilMGenius/paperthin.git', skillPath: PATH, skillFolderHash: 'f'.repeat(40) };
const release = (tag, day, draft = false) => ({ tag_name: tag, draft, published_at: draft ? null : '2026-01-0' + day + 'T00:00:00Z', created_at: '2026-01-0' + day + 'T00:00:00Z' });
const releases = write(join(scratch, 'releases.json'), JSON.stringify([release('v4', 9, true), release('v3', 4), release('v1', 2), release('v2', 3), release('v0', 1)]));
const rawDir = join(scratch, 'raw');
write(join(rawDir, 'v4', PATH), 'local edit\n');
write(join(rawDir, 'v3', PATH), 'third\n');
write(join(rawDir, 'v2', PATH), 'second\n');
write(join(rawDir, 'v1', PATH), 'first\n');
mkdirSync(join(rawDir, 'v0'), { recursive: true });
const installed = (text) => write(join(mkdtempSync(join(scratch, 'installed-')), 'SKILL.md'), text);
const integrity = (file, lock, extra = []) => run(['integrity', '--installed-file', file, '--skill', 'demo', '--lock', lock, '--releases-json', releases, '--raw-dir', rawDir, ...extra]);

test('integrity is clean when an older published tag holds the same bytes', () => {
  const out = integrity(installed('first\n'), lockOf(goodEntry));
  assert.equal(out.status, 0, out.stdout + out.stderr);
  assert.equal(out.json.result, 'clean');
  assert.equal(out.json.match, 'v1');
  assert.deepEqual(out.json.walked.map((step) => step.tag + ':' + step.status), ['v3:differs', 'v2:differs', 'v1:match']);
});

test('integrity is divergent-or-unknown after a full walk with no match, drafts skipped', () => {
  const out = integrity(installed('local edit\n'), lockOf(goodEntry));
  assert.equal(out.status, 1);
  assert.equal(out.json.result, 'divergent-or-unknown');
  assert.deepEqual(out.json.walked.map((step) => step.tag + ':' + step.status), ['v3:differs', 'v2:differs', 'v1:differs', 'v0:absent']);
  assert.equal(integrity(installed('first\r\n'), lockOf(goodEntry)).json.result, 'divergent-or-unknown', 'bytes are compared, so a CRLF copy is not clean');
});

test('integrity cannot compare a missing or foreign lock entry or a path outside a catalog skill folder', () => {
  const file = installed('first\n');
  const reasons = [
    [lockOf(undefined), /no entry for demo/],
    [lockOf({ ...goodEntry, source: 'someone/paperthin' }), /lock source is/],
    [lockOf({ ...goodEntry, sourceUrl: 'https://github.com/someone/paperthin.git' }), /source URL/],
    [lockOf({ ...goodEntry, skillPath: 'skills/breadth/../breadth/demo/SKILL.md' }), /\.\. part/],
    [lockOf({ ...goodEntry, skillPath: '/skills/breadth/demo/SKILL.md' }), /absolute/],
    [lockOf({ ...goodEntry, skillPath: 'skills/misc/demo/SKILL.md' }), /is not skills\//],
    [lockOf({ ...goodEntry, skillPath: 'skills/breadth/other/SKILL.md' }), /is not skills\//],
  ];
  for (const [lock, reason] of reasons) {
    const out = integrity(file, lock);
    assert.equal(out.status, 1, out.stderr);
    assert.equal(out.json.result, 'cannot-compare');
    assert.match(out.json.reason, reason);
  }
});

test('integrity cannot compare when a fetch failed and nothing matched, or the release list is unreadable', () => {
  const gap = write(join(scratch, 'gap.json'), JSON.stringify([release('v3', 4), release('v9', 3), release('v1', 2)]));
  const out = run(['integrity', '--installed-file', installed('local edit\n'), '--skill', 'demo', '--lock', lockOf(goodEntry), '--releases-json', gap, '--raw-dir', rawDir]);
  assert.equal(out.status, 1);
  assert.equal(out.json.result, 'cannot-compare');
  assert.match(out.json.reason, /v9: no .*walk is incomplete/);
  const unreadable = run(['integrity', '--installed-file', installed('first\n'), '--skill', 'demo', '--lock', lockOf(goodEntry), '--releases-json', write(join(scratch, 'object.json'), '{}'), '--raw-dir', rawDir]);
  assert.equal(unreadable.json.result, 'cannot-compare');
  assert.match(unreadable.json.reason, /release list/);
});

test('usage errors exit 2 and help exits 0 through the junction', () => {
  assert.equal(run(['--help']).status, 0);
  assert.equal(run(['frobnicate']).status, 2);
  assert.equal(run(['classify', '--skill-md', skillMd]).status, 2);
  assert.equal(run(['integrity', '--installed-file', skillMd, '--skill', 'demo', '--lock', lockOf(goodEntry), '--raw-dir', rawDir]).status, 2, 'neither --releases-json nor --fetch');
  assert.equal(run(['integrity', '--installed-file', skillMd, '--skill', 'demo', '--lock', lockOf(goodEntry), '--releases-json', releases]).status, 2, 'neither --raw-dir nor --fetch');
  assert.equal(run(['integrity', '--installed-file', skillMd, '--skill', '../demo', '--lock', lockOf(goodEntry), '--releases-json', releases, '--raw-dir', rawDir]).status, 2);
});
