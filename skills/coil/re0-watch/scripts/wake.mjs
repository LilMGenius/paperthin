import { readFileSync, realpathSync } from 'node:fs';
import { createHmac, createPublicKey, timingSafeEqual, verify as verifySignature } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

// Decides the part of one wake that its inputs decide: the order of the re0-watch ladder, the silence against
// the accepted threshold, the alert cooldown for the same run and frozen signals, a declared pause and an
// authoritative terminal. Settings are read from the arm record and never defaulted. A pause signature is
// checked only when the arm record names an algorithm and key node:crypto can verify; every other case
// that needs meaning is reported as needs-judgment and left to the skill.
const usage = [
  'Usage: node wake.mjs --arm <arm.json|-> --observation <observation.json|-> [--json]',
  'arm.json: {runId, settings: {thresholdSeconds, frequencySeconds, cooldownSeconds}, signals: {<name>: {kind: "progress"|"heartbeat", value, movedAt}},',
  '           pause?: {algorithm: "hmac-sha256"|"hmac-sha512"|"ed25519", key}, lastAlert?: {at, runId, outcome, signals}}',
  'observation.json: {runId, wakeAt, terminal: {state: "running"|"completed"|"failed"|"cancelled", runId?}, pause: {status: "read"|"unreadable", declaration?, signature?},',
  '           signals: {<name>: {value, observedAt}}, fileActivity?: "none"|"appending"}',
  'Times are UTC ISO strings ending in Z. A signature is hex: an HMAC digest, or an ed25519 signature over the declaration line with a PEM public key.',
  'Prints the outcome and reason, or with --json the rung, outcome, alert flag and the updated {signals, lastAlert} to persist.',
  'Exit codes: 0 nothing to send (healthy, paused, terminal, frozen-silent-in-cooldown), 2 alert (frozen-alert, rejected-pause, unknown-alert, identity-mismatch, unresolved-advisory),',
  '            3 needs-judgment (a pause the arm record cannot let this script verify), 1 usage.',
].join('\n');

const SILENT = new Set(['healthy', 'paused', 'terminal', 'frozen-silent-in-cooldown']);
const UTC = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z$/;
const PAUSE = /^PAUSE_UNTIL=(\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ) RUN=(\S+) REASON=(\S+)$/;

const time = text => (typeof text === 'string' && UTC.test(text) && !Number.isNaN(Date.parse(text)) ? Date.parse(text) : null);
const positive = n => typeof n === 'number' && Number.isFinite(n) && n > 0;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Signature check for the algorithms node:crypto verifies without a library. Returns true, false, or null when
// the arm record's algorithm or key is something this script cannot run, which the skill must judge.
function signatureHolds(protocol, declaration, signature) {
  const { algorithm, key } = protocol;
  try {
    if (typeof key !== 'string' || key === '') return null;
    if (algorithm === 'hmac-sha256' || algorithm === 'hmac-sha512') {
      const expected = createHmac(algorithm.slice(5), key).update(declaration).digest();
      const given = typeof signature === 'string' && /^[0-9a-f]+$/i.test(signature) && signature.length % 2 === 0 ? Buffer.from(signature, 'hex') : null;
      return given !== null && given.length === expected.length && timingSafeEqual(given, expected);
    }
    if (algorithm === 'ed25519') {
      const given = typeof signature === 'string' && /^[0-9a-f]+$/i.test(signature) ? Buffer.from(signature, 'hex') : Buffer.alloc(0);
      return verifySignature(null, Buffer.from(declaration), createPublicKey(key), given);
    }
  } catch {
    return null;
  }
  return null;
}

export function decide(arm, observation) {
  const settings = arm?.settings ?? {};
  const record = { signals: arm?.signals ?? {}, lastAlert: arm?.lastAlert ?? null };
  const wakeAt = time(observation?.wakeAt);
  const result = (rung, outcome, reason, extra = {}) => {
    const alert = !SILENT.has(outcome) && outcome !== 'needs-judgment';
    const next = { signals: record.signals, lastAlert: record.lastAlert };
    if (alert && wakeAt !== null) next.lastAlert = { at: observation.wakeAt, runId: arm?.runId, outcome, signals: extra.frozen ?? {} };
    const { frozen, ...rest } = extra;
    return { rung, outcome, reason, alert, ...rest, record: next };
  };

  // Before rung 1: accepted settings. Missing or unreadable threshold or frequency leaves the watch unresolved.
  if (!arm || typeof arm.runId !== 'string' || arm.runId === '') return result(0, 'unresolved-advisory', 'the arm record names no run identity');
  if (!positive(settings.thresholdSeconds)) return result(0, 'unresolved-advisory', 'the accepted silence threshold is missing or unreadable, and no default is substituted');
  if (!positive(settings.frequencySeconds)) return result(0, 'unresolved-advisory', 'the accepted check frequency is missing or unreadable, and no default is substituted');
  if (settings.frequencySeconds >= settings.thresholdSeconds) return result(0, 'unresolved-advisory', 'the accepted check frequency is not strictly below the accepted threshold');
  const progressNames = Object.keys(record.signals).filter(name => record.signals[name]?.kind === 'progress');
  if (progressNames.length === 0) return result(0, 'unresolved-advisory', 'the arm record declares no progress signal, so meaningful progress cannot be established');

  // Rung 1: identity.
  if (!observation || typeof observation !== 'object') return result(1, 'unknown-alert', 'the observation is missing or unreadable');
  if (observation.runId !== arm.runId || (observation.terminal?.runId !== undefined && observation.terminal.runId !== arm.runId)) {
    return result(1, 'identity-mismatch', 'the observed record names a run other than ' + arm.runId + '; foreign evidence is discarded');
  }
  if (wakeAt === null) return result(1, 'unknown-alert', 'the wake time is missing or not a UTC time');

  // Rung 2: authoritative termination.
  const state = observation.terminal?.state;
  if (state === 'completed' || state === 'failed' || state === 'cancelled') {
    return result(2, 'terminal', 'the host reports ' + state + '; the registering owner disarms' + (state === 'cancelled' ? ' and recovery stays refused' : ''));
  }
  if (state !== 'running') return result(2, 'unknown-alert', 'the terminal source is unreadable or names no known state, which is unknown and not evidence of a running job');

  // Rung 3: pause declaration.
  const pause = observation.pause;
  if (pause?.status !== 'read') return result(3, 'unknown-alert', 'the pause artifact is absent, unreadable or truncated, which is unknown and not a no-pause answer');
  let expiredPause = false;
  if (typeof pause.declaration === 'string' && pause.declaration !== '') {
    if (arm.pause !== undefined && arm.pause !== null) {
      const holds = signatureHolds(arm.pause, pause.declaration, pause.signature);
      if (holds === null) return result(3, 'needs-judgment', 'the arm record declares a pause protocol (' + String(arm.pause.algorithm) + ') this script cannot verify with node:crypto');
      if (!holds) return result(3, 'rejected-pause', 'the pause signature does not verify against the arm record\'s algorithm and key');
    }
    const parsed = PAUSE.exec(pause.declaration);
    const until = parsed ? Date.parse(parsed[1]) : NaN;
    if (!parsed || Number.isNaN(until) || new Date(until).toISOString().slice(0, 19) + 'Z' !== parsed[1]) return result(3, 'rejected-pause', 'the pause declaration is malformed');
    if (parsed[2] !== arm.runId) return result(3, 'rejected-pause', 'the pause declaration names run ' + parsed[2] + ', not ' + arm.runId);
    if (until > wakeAt) return result(3, 'paused', 'a valid pause for this run runs until ' + parsed[1] + ' (' + parsed[3] + '); keep watching without intervention', { until: parsed[1] });
    expiredPause = true;
  }

  // Rung 4: progress and heartbeat. A heartbeat is recorded and never moves the progress clock.
  const signals = {};
  for (const [name, known] of Object.entries(record.signals)) signals[name] = { ...known };
  let advanced = false;
  for (const name of Object.keys(signals)) {
    const seen = observation.signals?.[name];
    if (signals[name].kind === 'heartbeat') {
      if (seen && time(seen.observedAt) !== null) signals[name].lastSeenAt = seen.observedAt;
      continue;
    }
    if (!seen || !('value' in seen)) return result(4, 'unknown-alert', 'progress signal ' + name + ' is missing from the observation');
    if (!same(seen.value, signals[name].value)) {
      if (time(seen.observedAt) === null) return result(4, 'unknown-alert', 'progress signal ' + name + ' changed without a readable UTC movement time');
      signals[name] = { ...signals[name], value: seen.value, movedAt: seen.observedAt };
      advanced = true;
    }
  }
  record.signals = signals;
  if (advanced) return result(4, 'healthy', 'progress advanced since the last recorded value');
  const movedAt = progressNames.map(name => time(signals[name].movedAt));
  if (movedAt.some(at => at === null || at > wakeAt)) return result(4, 'unknown-alert', 'a recorded progress movement time is unreadable or after the wake time');
  const frozenSeconds = (wakeAt - Math.max(...movedAt)) / 1000;
  if (frozenSeconds < settings.thresholdSeconds) return result(4, 'healthy', 'progress is frozen ' + frozenSeconds + ' s, inside the accepted ' + settings.thresholdSeconds + ' s threshold');

  // Rung 5: suspicion. File activity is read only now, and only colours the reason.
  const frozen = Object.fromEntries(progressNames.map(name => [name, signals[name].value]));
  const kind = observation.fileActivity === 'appending' ? 'noisy nonprogress' : 'unexplained silence';
  const why = kind + ' for ' + frozenSeconds + ' s against the accepted ' + settings.thresholdSeconds + ' s threshold' + (expiredPause ? ', after a pause that expired' : '');

  // Rung 6: alert cooldown, for the same run and the same frozen signals only.
  const last = arm.lastAlert;
  const cooldown = settings.cooldownSeconds;
  const extra = { frozen, frozenSeconds, recoveryProposalMayFollow: true };
  if (last?.outcome === 'frozen-alert' && last.runId === arm.runId && same(last.signals, frozen)) {
    if (!positive(cooldown)) return result(6, 'frozen-alert', why + '; the accepted cooldown is missing or unreadable, so the alert is sent with no default', extra);
    const sinceAlert = time(last.at) === null ? null : (wakeAt - time(last.at)) / 1000;
    if (sinceAlert !== null && sinceAlert >= 0 && sinceAlert < cooldown) {
      return { rung: 6, outcome: 'frozen-silent-in-cooldown', reason: 'the same frozen signals were alerted ' + sinceAlert + ' s ago, inside the accepted ' + cooldown + ' s cooldown; the observation is recorded and the last alert time is kept', alert: false, frozenSeconds, recoveryProposalMayFollow: true, record };
    }
  }
  return result(6, 'frozen-alert', why, extra);
}

const read = path => readFileSync(path === '-' ? 0 : path, 'utf8');
const parse = path => {
  try {
    return JSON.parse(read(path));
  } catch {
    return undefined;
  }
};

// The installed skill is a junction to the source, and Node resolves import.meta.url through it while argv
// keeps the junction path, so both sides are compared as real paths or the CLI silently exits 0.
if (process.argv[1] && realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1])) {
  let values;
  try {
    ({ values } = parseArgs({ options: { arm: { type: 'string' }, observation: { type: 'string' }, json: { type: 'boolean' }, help: { type: 'boolean' } } }));
    if (values.help) {
      console.log(usage);
      process.exit(0);
    }
    if (!values.arm || !values.observation) throw new Error('Name --arm and --observation.');
  } catch (error) {
    console.error(error.message + '\n' + usage);
    process.exit(1);
  }
  const result = decide(parse(values.arm), parse(values.observation));
  console.log(values.json ? JSON.stringify(result, null, 2) : result.outcome.toUpperCase() + ' (rung ' + result.rung + '): ' + result.reason);
  process.exit(result.outcome === 'needs-judgment' ? 3 : result.alert ? 2 : 0);
}
