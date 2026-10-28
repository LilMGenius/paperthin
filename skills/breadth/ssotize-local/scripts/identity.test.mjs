import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const skill = dirname(dirname(fileURLToPath(import.meta.url)));
const temps = [];

function scratch(prefix = 'identity-') {
  const root = mkdtempSync(join(tmpdir(), prefix));
  temps.push(root);
  return root;
}

// Every call goes through a link to the skill folder, the way an installed skill is reached.
const linkRoot = scratch('identity-link-');
const link = join(linkRoot, 'ssotize-local');
symlinkSync(skill, link, process.platform === 'win32' ? 'junction' : 'dir');

function cli(...args) {
  const run = spawnSync(process.execPath, [join(link, 'scripts', 'identity.mjs'), ...args], { encoding: 'utf8' });
  let out = null;
  try { out = JSON.parse(run.stdout); } catch { /* usage errors still print JSON; anything else leaves null */ }
  return { status: run.status, stdout: run.stdout, stderr: run.stderr, out };
}
const ino = (path) => statSync(path, { bigint: true }).ino;

test.after(() => {
  for (const dir of temps) rmSync(dir, { recursive: true, force: true });
});

test('probe reports which link mechanisms a directory supports', () => {
  const root = scratch();
  const run = cli('probe', root, '--json');
  assert.equal(run.status, 0);
  const [row] = run.out.result;
  assert.equal(row.type, 'directory');
  assert.equal(row.mechanism, 'ordinary');
  const names = row.capabilities.map((c) => c.mechanism);
  assert.deepEqual(names, process.platform === 'win32' ? ['hardlink', 'symlink', 'junction'] : ['hardlink', 'symlink']);
  assert.equal(row.capabilities.find((c) => c.mechanism === 'hardlink').status, 'supported');
});

test('compare exits 0 for identical files and 3 for divergent ones', () => {
  const root = scratch();
  writeFileSync(join(root, 'a.txt'), 'same');
  writeFileSync(join(root, 'b.txt'), 'same');
  writeFileSync(join(root, 'c.txt'), 'different');
  const same = cli('compare', join(root, 'a.txt'), join(root, 'b.txt'), '--json');
  assert.equal(same.status, 0);
  assert.equal(same.out.result.classification, 'identical-bytes');
  const diff = cli('compare', join(root, 'a.txt'), join(root, 'c.txt'), '--json');
  assert.equal(diff.status, 3);
  assert.equal(diff.out.result.classification, 'divergent');
});

test('compare exits 3 when one side is missing', () => {
  const root = scratch();
  writeFileSync(join(root, 'a.txt'), 'x');
  const run = cli('compare', join(root, 'a.txt'), join(root, 'absent.txt'), '--json');
  assert.equal(run.status, 3);
  assert.equal(run.out.result.classification, 'present-in-one-place');
});

test('a hardlink verifies, shares one identity, and unlink makes the name independent again', () => {
  const root = scratch();
  const canonical = join(root, 'canonical.txt');
  const alias = join(root, 'alias.txt');
  writeFileSync(canonical, 'shared bytes');
  writeFileSync(alias, 'shared bytes');
  assert.notEqual(ino(canonical), ino(alias));

  const linked = cli('link', canonical, alias, '--mechanism', 'hardlink', '--json');
  assert.equal(linked.status, 0, linked.stdout);
  assert.equal(ino(canonical), ino(alias));

  const verified = cli('verify', canonical, alias, '--json');
  assert.equal(verified.status, 0);
  assert.equal(verified.out.result.ok, true);
  assert.equal(verified.out.result.results[0].identityProven, true);

  const stage = scratch('identity-stage-');
  const unlinked = cli('unlink', alias, '--stage', stage, '--json');
  assert.equal(unlinked.status, 0, unlinked.stdout);
  assert.notEqual(ino(canonical), ino(alias));
  assert.equal(readFileSync(alias, 'utf8'), 'shared bytes');
  assert.equal(readFileSync(canonical, 'utf8'), 'shared bytes');

  assert.equal(cli('verify', canonical, alias, '--json').status, 1);
});

test('link refuses to replace an alias whose bytes differ and leaves it untouched', () => {
  const root = scratch();
  const canonical = join(root, 'canonical.txt');
  const alias = join(root, 'alias.txt');
  writeFileSync(canonical, 'one');
  writeFileSync(alias, 'two');
  const run = cli('link', canonical, alias, '--mechanism', 'hardlink', '--json');
  assert.equal(run.status, 1);
  assert.match(run.out.result.error, /Refusing/);
  assert.equal(readFileSync(alias, 'utf8'), 'two');
  assert.notEqual(ino(canonical), ino(alias));
});

test('a missing subcommand, an unknown option or a bad mechanism is a usage error and exits 1', () => {
  const root = scratch();
  writeFileSync(join(root, 'a.txt'), 'x');
  const none = cli('--json');
  assert.equal(none.status, 1);
  assert.match(none.out.result.error, /^Usage:/);
  const unknown = cli('probe', root, '--bogus');
  assert.equal(unknown.status, 1);
  assert.match(unknown.out.result.error, /Unknown option/);
  const mechanism = cli('link', join(root, 'a.txt'), join(root, 'b.txt'), '--mechanism', 'magic', '--json');
  assert.equal(mechanism.status, 1);
  assert.match(mechanism.out.result.error, /Choose hardlink/);
});
