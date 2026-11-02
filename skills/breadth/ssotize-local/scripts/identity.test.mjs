import { test } from 'node:test';
import assert from 'node:assert/strict';
import { linkSync, lstatSync, mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, statfsSync, symlinkSync, writeFileSync } from 'node:fs';
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

// Rungs that exist only on some hosts. Each test runs where its rung exists and reports the filesystem it measured,
// so a CI run on each OS is the measurement the skill's capability matrix cites.
const fsType = (path) => { try { return String(statfsSync(path).type); } catch (e) { return 'unknown: ' + e.code; } };
const tree = (root) => {
  mkdirSync(join(root, 'sub'), { recursive: true });
  writeFileSync(join(root, 'top.txt'), 'top');
  writeFileSync(join(root, 'sub', 'leaf.txt'), 'leaf');
};
const manifest = (path) => cli('digest', path, '--json').out.result[0].manifestSha256;

// A second local volume, when the host has one: another drive letter on Windows, tmpfs at /dev/shm on Linux.
function otherVolume() {
  const home = statSync(tmpdir(), { bigint: true }).dev;
  const candidates = process.platform === 'win32' ? 'CDEFGHIJ'.split('').map((l) => l + ':\\') : process.platform === 'linux' ? ['/dev/shm'] : [];
  for (const root of candidates) {
    try {
      if (statSync(root, { bigint: true }).dev === home) continue;
      const dir = mkdtempSync(join(root, 'identity-vol-'));
      temps.push(dir);
      return dir;
    } catch { /* absent or not writable: try the next one */ }
  }
  return null;
}
// On a GitHub Windows runner D: is always there, so a missing second volume there is a broken measurement, not a skip.
const needsOtherVolume = process.env.GITHUB_ACTIONS === 'true' && process.platform === 'win32';

test('a directory hardlink is refused by the host and by link, which leaves both trees untouched', (t) => {
  const root = scratch();
  const canonical = join(root, 'canonical');
  const alias = join(root, 'alias');
  tree(canonical);
  tree(alias);
  t.diagnostic(process.platform + ' ' + fsType(root));
  assert.throws(() => linkSync(canonical, join(root, 'raw')), (e) => ['EPERM', 'EISDIR', 'EACCES'].includes(e.code));
  const before = [ino(canonical), ino(alias), manifest(canonical), manifest(alias)];
  const run = cli('link', canonical, alias, '--mechanism', 'hardlink', '--json');
  assert.equal(run.status, 1);
  assert.match(run.out.result.error, /Directory hardlinks are impossible/);
  assert.equal(run.out.events.length, 0);
  assert.deepEqual([ino(canonical), ino(alias), manifest(canonical), manifest(alias)], before);
});

test('a directory symlink installs, verifies through the link, and unlink restores an independent tree', (t) => {
  const root = scratch();
  const canonical = join(root, 'canonical');
  const alias = join(root, 'alias');
  tree(canonical);
  tree(alias);
  t.diagnostic(process.platform + ' ' + fsType(root));
  const canonicalIno = ino(canonical);
  const hash = manifest(canonical);

  const linked = cli('link', canonical, alias, '--mechanism', 'symlink', '--json');
  assert.equal(linked.status, 0, linked.stdout);
  assert.ok(lstatSync(alias).isSymbolicLink());
  assert.equal(linked.out.result.proof.results[0].identity.mechanism, 'symlink');
  assert.equal(ino(alias), canonicalIno);
  assert.equal(cli('verify', canonical, alias, '--json').status, 0);
  assert.equal(cli('compare', canonical, alias, '--json').out.result.classification, 'already-linked');
  // The displaced original tree is kept beside the alias, never deleted.
  assert.equal(manifest(linked.out.result.displaced), hash);

  const stage = scratch('identity-stage-');
  const unlinked = cli('unlink', alias, '--stage', stage, '--json');
  assert.equal(unlinked.status, 0, unlinked.stdout);
  assert.ok(!lstatSync(alias).isSymbolicLink());
  assert.notEqual(ino(alias), canonicalIno);
  assert.notEqual(ino(join(alias, 'top.txt')), ino(join(canonical, 'top.txt')));
  assert.equal(manifest(alias), hash);
  assert.equal(ino(canonical), canonicalIno);
  assert.equal(manifest(canonical), hash);
  assert.deepEqual(readdirSync(stage), []);
  assert.equal(cli('verify', canonical, alias, '--json').status, 1);
});

test('a junction installs, verifies, and unlink removes only the entry', { skip: process.platform !== 'win32' && 'junctions exist only on Windows' }, (t) => {
  const root = scratch();
  const canonical = join(root, 'canonical');
  const alias = join(root, 'alias');
  tree(canonical);
  t.diagnostic(process.platform + ' ' + fsType(root));
  const canonicalIno = ino(canonical);
  const hash = manifest(canonical);

  const linked = cli('link', canonical, alias, '--mechanism', 'junction', '--json');
  assert.equal(linked.status, 0, linked.stdout);
  assert.equal(linked.out.result.proof.results[0].identity.mechanism, 'junction');
  assert.equal(cli('verify', canonical, alias, '--json').status, 0);

  const unlinked = cli('unlink', alias, '--stage', scratch('identity-stage-'), '--json');
  assert.equal(unlinked.status, 0, unlinked.stdout);
  assert.ok(unlinked.out.events.some((e) => e.operation === 'fs.rmdirSync junction entry only'));
  assert.equal(cli('probe', alias, '--json').out.result[0].mechanism, 'ordinary');
  assert.notEqual(ino(alias), canonicalIno);
  assert.equal(manifest(alias), hash);
  assert.equal(ino(canonical), canonicalIno);
  assert.equal(manifest(canonical), hash);
});

test('a hardlink across volumes is refused and leaves no staged entry', (t) => {
  const far = otherVolume();
  if (!far) {
    assert.ok(!needsOtherVolume, 'a Windows runner must expose a second volume');
    return t.skip('no second local volume on this host');
  }
  const root = scratch();
  const canonical = join(far, 'canonical.txt');
  const alias = join(root, 'alias.txt');
  writeFileSync(canonical, 'far bytes');
  t.diagnostic(process.platform + ' ' + fsType(far) + ' -> ' + fsType(root));
  const run = cli('link', canonical, alias, '--mechanism', 'hardlink', '--json');
  assert.equal(run.status, 1);
  assert.match(run.out.result.error, /EXDEV|not permitted|different/i);
  assert.deepEqual(readdirSync(root), []);
  assert.equal(readFileSync(canonical, 'utf8'), 'far bytes');
});

test('a junction may target a directory on another local volume', { skip: process.platform !== 'win32' && 'junctions exist only on Windows' }, (t) => {
  const far = otherVolume();
  if (!far) {
    assert.ok(!needsOtherVolume, 'a Windows runner must expose a second volume');
    return t.skip('no second local volume on this host');
  }
  const canonical = join(far, 'canonical');
  tree(canonical);
  const root = scratch();
  const alias = join(root, 'alias');
  t.diagnostic(fsType(far) + ' -> ' + fsType(root));
  const linked = cli('link', canonical, alias, '--mechanism', 'junction', '--json');
  assert.equal(linked.status, 0, linked.stdout);
  assert.equal(cli('verify', canonical, alias, '--json').status, 0);
  const unlinked = cli('unlink', alias, '--stage', scratch('identity-stage-'), '--json');
  assert.equal(unlinked.status, 0, unlinked.stdout);
  assert.equal(manifest(alias), manifest(canonical));
  assert.notEqual(ino(alias), ino(canonical));
});

// The skill keeps bind mounts outside the script, so this measures the rung itself: root only, one object read through
// both names, and an unmount that leaves the source unchanged and reveals the mount point's own identity again.
const sudo = (...args) => spawnSync('sudo', ['-n', ...args], { encoding: 'utf8' });
// Root alone is not enough: a container runner grants sudo but no mount capability, so the rung is probed by mounting.
function canBindMount() {
  if (process.platform !== 'linux' || sudo('true').status !== 0) return false;
  const root = scratch();
  mkdirSync(join(root, 'from'));
  mkdirSync(join(root, 'to'));
  if (sudo('mount', '--bind', join(root, 'from'), join(root, 'to')).status !== 0) return false;
  return sudo('umount', join(root, 'to')).status === 0;
}
test('a bind mount is root-only, shares the source object, and unmounts cleanly', { skip: !canBindMount() && 'needs Linux where root may mount --bind' }, (t) => {
  const root = scratch();
  const canonical = join(root, 'canonical');
  const alias = join(root, 'alias');
  tree(canonical);
  mkdirSync(alias);
  const mountPointIno = ino(alias);
  const hash = manifest(canonical);
  t.diagnostic(fsType(root));
  const unprivileged = spawnSync('mount', ['--bind', canonical, alias], { encoding: 'utf8' });
  assert.notEqual(unprivileged.status, 0);
  const mounted = sudo('mount', '--bind', canonical, alias);
  assert.equal(mounted.status, 0, mounted.stderr);
  try {
    assert.equal(ino(alias), ino(canonical));
    assert.equal(statSync(alias, { bigint: true }).dev, statSync(canonical, { bigint: true }).dev);
    assert.equal(manifest(alias), hash);
    assert.ok(readFileSync('/proc/self/mountinfo', 'utf8').split('\n').some((l) => l.split(' ')[4] === alias));
  } finally {
    const unmounted = sudo('umount', alias);
    assert.equal(unmounted.status, 0, unmounted.stderr);
  }
  assert.ok(!readFileSync('/proc/self/mountinfo', 'utf8').split('\n').some((l) => l.split(' ')[4] === alias));
  assert.equal(ino(alias), mountPointIno);
  assert.deepEqual(readdirSync(alias), []);
  assert.equal(manifest(canonical), hash);
});

