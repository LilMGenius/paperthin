import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decide } from './wake.mjs';
import { createHmac, generateKeyPairSync, sign } from 'node:crypto';
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const T0 = '2026-01-01T00:00:00Z';
const at = seconds => new Date(Date.parse(T0) + seconds * 1000).toISOString().replace('.000Z', 'Z');
const settings = { thresholdSeconds: 1800, frequencySeconds: 300, cooldownSeconds: 3600 };
const armOf = (extra = {}) => ({ runId: 'run-1', settings, signals: { seq: { kind: 'progress', value: 7, movedAt: T0 }, beat: { kind: 'heartbeat', value: 1 } }, ...extra });
const seenAt = (seconds, over = {}) => ({
  runId: 'run-1', wakeAt: at(seconds), terminal: { state: 'running' }, pause: { status: 'read' },
  signals: { seq: { value: 7, observedAt: at(seconds) }, beat: { value: 99, observedAt: at(seconds) } }, ...over,
});

test('progress still inside the threshold is healthy and stays silent', () => {
  const out = decide(armOf(), seenAt(600));
  assert.equal(out.outcome, 'healthy');
  assert.equal(out.rung, 4);
  assert.equal(out.alert, false);
});

test('advancing progress moves the clock and is healthy even past the threshold', () => {
  const out = decide(armOf(), seenAt(5000, { signals: { seq: { value: 8, observedAt: at(4990) } } }));
  assert.equal(out.outcome, 'healthy');
  assert.deepEqual(out.record.signals.seq, { kind: 'progress', value: 8, movedAt: at(4990) });
});

test('a ticking heartbeat never resets the progress clock', () => {
  const out = decide(armOf(), seenAt(2000));
  assert.equal(out.outcome, 'frozen-alert');
  assert.equal(out.record.signals.seq.movedAt, T0);
});

test('frozen progress past the threshold alerts and records the alert for the cooldown', () => {
  const out = decide(armOf(), seenAt(1800));
  assert.equal(out.outcome, 'frozen-alert');
  assert.equal(out.rung, 6);
  assert.equal(out.alert, true);
  assert.match(out.reason, /unexplained silence/);
  assert.deepEqual(out.record.lastAlert, { at: at(1800), runId: 'run-1', outcome: 'frozen-alert', signals: { seq: 7 } });
  assert.match(decide(armOf(), seenAt(2000, { fileActivity: 'appending' })).reason, /noisy nonprogress/);
});

test('a repeat for the same run and frozen signals inside the cooldown is silent and keeps the last alert time', () => {
  const first = decide(armOf(), seenAt(1800));
  const second = decide(armOf({ lastAlert: first.record.lastAlert }), seenAt(1800 + 3599));
  assert.equal(second.outcome, 'frozen-silent-in-cooldown');
  assert.equal(second.alert, false);
  assert.equal(second.record.lastAlert.at, at(1800));
});

test('the cooldown expiring, or different frozen signals, alerts again', () => {
  const lastAlert = { at: at(1800), runId: 'run-1', outcome: 'frozen-alert', signals: { seq: 7 } };
  assert.equal(decide(armOf({ lastAlert }), seenAt(1800 + 3600)).outcome, 'frozen-alert');
  assert.equal(decide(armOf({ lastAlert: { ...lastAlert, signals: { seq: 6 } } }), seenAt(2000)).outcome, 'frozen-alert');
  assert.equal(decide(armOf({ lastAlert: { ...lastAlert, runId: 'run-0' } }), seenAt(2000)).outcome, 'frozen-alert');
});

test('a missing cooldown alerts with no default', () => {
  const lastAlert = { at: at(1800), runId: 'run-1', outcome: 'frozen-alert', signals: { seq: 7 } };
  const out = decide(armOf({ lastAlert, settings: { thresholdSeconds: 1800, frequencySeconds: 300 } }), seenAt(1900));
  assert.equal(out.outcome, 'frozen-alert');
  assert.match(out.reason, /cooldown is missing/);
});

test('missing threshold or frequency degrades to advisory with no default substituted', () => {
  assert.equal(decide(armOf({ settings: { frequencySeconds: 300, cooldownSeconds: 60 } }), seenAt(9999)).outcome, 'unresolved-advisory');
  assert.equal(decide(armOf({ settings: { thresholdSeconds: 1800 } }), seenAt(9999)).outcome, 'unresolved-advisory');
  assert.equal(decide(armOf({ settings: { thresholdSeconds: 300, frequencySeconds: 300 } }), seenAt(9999)).outcome, 'unresolved-advisory');
  assert.equal(decide(armOf({ signals: {} }), seenAt(9999)).outcome, 'unresolved-advisory');
});

test('a foreign run is discarded at rung 1', () => {
  const out = decide(armOf(), seenAt(9999, { runId: 'run-2' }));
  assert.equal(out.outcome, 'identity-mismatch');
  assert.equal(out.rung, 1);
});

test('an authoritative terminal ends the wake with no alert, even when frozen', () => {
  for (const state of ['completed', 'failed', 'cancelled']) {
    const out = decide(armOf(), seenAt(9999, { terminal: { state } }));
    assert.equal(out.outcome, 'terminal');
    assert.equal(out.alert, false);
  }
  assert.match(decide(armOf(), seenAt(9999, { terminal: { state: 'cancelled' } })).reason, /recovery stays refused/);
  assert.equal(decide(armOf(), seenAt(9999, { terminal: { state: 'unreadable' } })).outcome, 'unknown-alert');
});

const declaration = until => 'PAUSE_UNTIL=' + until + ' RUN=run-1 REASON=quota';

test('an in-date pause keeps watching, even with frozen progress', () => {
  const out = decide(armOf(), seenAt(9999, { pause: { status: 'read', declaration: declaration(at(20000)) } }));
  assert.equal(out.outcome, 'paused');
  assert.equal(out.alert, false);
});

test('a malformed, foreign or unreadable pause alerts at rung 3', () => {
  const read = d => decide(armOf(), seenAt(9999, { pause: { status: 'read', declaration: d } }));
  assert.equal(read('PAUSE_UNTIL=tomorrow RUN=run-1 REASON=x').outcome, 'rejected-pause');
  assert.equal(read('PAUSE_UNTIL=' + at(20000) + ' RUN=run-2 REASON=x').outcome, 'rejected-pause');
  assert.equal(decide(armOf(), seenAt(9999, { pause: { status: 'unreadable' } })).outcome, 'unknown-alert');
});

test('an expired pause with frozen progress alerts and says so', () => {
  const out = decide(armOf(), seenAt(9999, { pause: { status: 'read', declaration: declaration(at(100)) } }));
  assert.equal(out.outcome, 'frozen-alert');
  assert.match(out.reason, /pause that expired/);
});

test('a pause signature is verified with the arm record\'s algorithm and key', () => {
  const d = declaration(at(20000));
  const arm = armOf({ pause: { algorithm: 'hmac-sha256', key: 'secret' } });
  const good = createHmac('sha256', 'secret').update(d).digest('hex');
  assert.equal(decide(arm, seenAt(9999, { pause: { status: 'read', declaration: d, signature: good } })).outcome, 'paused');
  const bad = decide(arm, seenAt(9999, { pause: { status: 'read', declaration: d, signature: good.replace(/.$/, c => (c === '0' ? '1' : '0')) } }));
  assert.equal(bad.outcome, 'rejected-pause');
  assert.match(bad.reason, /signature/);
  assert.equal(decide(arm, seenAt(9999, { pause: { status: 'read', declaration: d } })).outcome, 'rejected-pause');
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  const edArm = armOf({ pause: { algorithm: 'ed25519', key: publicKey.export({ type: 'spki', format: 'pem' }) } });
  const edSig = sign(null, Buffer.from(d), privateKey).toString('hex');
  assert.equal(decide(edArm, seenAt(9999, { pause: { status: 'read', declaration: d, signature: edSig } })).outcome, 'paused');
});

test('a pause protocol this script cannot verify is left to judgment', () => {
  const arm = armOf({ pause: { algorithm: 'pgp', key: 'abc' } });
  const out = decide(arm, seenAt(9999, { pause: { status: 'read', declaration: declaration(at(20000)), signature: 'aa' } }));
  assert.equal(out.outcome, 'needs-judgment');
  assert.equal(out.alert, false);
});

// The CLI is called through a link to the skill folder, the way an installed skill is reached.
const skillDir = dirname(dirname(fileURLToPath(import.meta.url)));
const scratchDir = mkdtempSync(join(tmpdir(), 'wake-'));
const linkDir = join(scratchDir, 're0-watch');
symlinkSync(skillDir, linkDir, process.platform === 'win32' ? 'junction' : 'dir');
test.after(() => rmSync(scratchDir, { recursive: true, force: true }));

function cli(arm, observation, ...rest) {
  const files = [arm, observation].map((body, i) => {
    const path = join(scratchDir, 'f' + i + '.json');
    writeFileSync(path, JSON.stringify(body));
    return path;
  });
  const run = spawnSync(process.execPath, [join(linkDir, 'scripts', 'wake.mjs'), '--arm', files[0], '--observation', files[1], ...rest], { encoding: 'utf8' });
  return { status: run.status, stdout: run.stdout, stderr: run.stderr };
}

test('CLI exits 0 for healthy, 2 for a frozen alert, 3 for judgment, and prints JSON on request', () => {
  const healthy = cli(armOf(), seenAt(600));
  assert.equal(healthy.status, 0);
  assert.match(healthy.stdout, /^HEALTHY \(rung 4\)/);
  const frozen = cli(armOf(), seenAt(2000), '--json');
  assert.equal(frozen.status, 2);
  assert.equal(JSON.parse(frozen.stdout).outcome, 'frozen-alert');
  const judged = cli(armOf({ pause: { algorithm: 'pgp', key: 'k' } }), seenAt(9999, { pause: { status: 'read', declaration: declaration(at(20000)) } }));
  assert.equal(judged.status, 3);
});

test('CLI without its options is a usage error and exits 1, and --help exits 0', () => {
  const run = spawnSync(process.execPath, [join(linkDir, 'scripts', 'wake.mjs')], { encoding: 'utf8' });
  assert.equal(run.status, 1);
  assert.match(run.stderr, /^Name --arm and --observation/);
  assert.equal(spawnSync(process.execPath, [join(linkDir, 'scripts', 'wake.mjs'), '--help']).status, 0);
});
