import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const json = argv.includes('--json');
const args = argv.filter(x => x !== '--json');
const command = args.shift();
const events = [];
const fail = message => { throw new Error(message); };
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const exists = p => { try { fs.lstatSync(p); return true; } catch (e) { if (e.code === 'ENOENT') return false; throw e; } };
const stat = p => fs.statSync(p, { bigint: true });
const same = (a, b) => a.dev === b.dev && a.ino === b.ino;
const fields = s => ({ dev: String(s.dev), ino: String(s.ino), nlink: String(s.nlink), size: String(s.size), mtime: s.mtime.toISOString(), mtimeNs: String(s.mtimeNs) });
const native = (exe, values) => {
  const operation = { command: [exe, ...values] };
  events.push(operation);
  const r = spawnSync(exe, values, { encoding: 'utf8', windowsHide: true });
  Object.assign(operation, { exit: r.status, stdout: r.stdout, stderr: r.stderr });
  if (r.error || r.status !== 0) fail('Native inspection failed: ' + JSON.stringify(operation) + (r.error?.message || ''));
  return r.stdout;
};
function identity(p) {
  p = path.resolve(p);
  if (!exists(p)) return { path: p, missing: true };
  const entry = fs.lstatSync(p, { bigint: true });
  let mechanism = 'ordinary';
  let target = null;
  if (entry.isSymbolicLink()) {
    target = fs.readlinkSync(p);
    mechanism = 'symlink';
    if (process.platform === 'win32') {
      const output = native('fsutil.exe', ['reparsepoint', 'query', p]);
      if (/0xa0000003/i.test(output)) mechanism = 'junction';
      else if (!/0xa000000c/i.test(output)) fail('Unknown reparse point: ' + p);
    }
  }
  const s = stat(p);
  return { path: p, realpath: fs.realpathSync.native(p), mechanism, target, type: s.isDirectory() ? 'directory' : s.isFile() ? 'file' : 'unsupported', ...fields(s), entry: fields(entry) };
}
function digest(p) {
  p = path.resolve(p);
  if (!exists(p)) return { path: p, missing: true, members: [] };
  const members = [];
  function walk(current, relative, ancestors) {
    const s = stat(current);
    const id = String(s.dev) + ':' + String(s.ino);
    if (ancestors.has(id)) fail('Cycle at ' + current);
    const row = { path: current, member: relative, type: s.isDirectory() ? 'directory' : 'file', ...fields(s) };
    if (s.isDirectory()) {
      members.push(row);
      for (const name of fs.readdirSync(current).sort()) walk(path.join(current, name), relative === '.' ? name : relative + '/' + name, new Set([...ancestors, id]));
    } else if (s.isFile()) {
      const before = fields(s);
      row.sha256 = sha(fs.readFileSync(current));
      const after = fields(stat(current));
      if (JSON.stringify(before) !== JSON.stringify(after)) fail('Changed while hashing ' + current + ': ' + JSON.stringify({ before, after }));
      members.push(row);
    } else fail('Unsupported entry: ' + current);
  }
  walk(p, '.', new Set());
  members.sort((a, b) => a.member < b.member ? -1 : a.member > b.member ? 1 : 0);
  return { path: p, type: members[0].type, members, manifestSha256: sha(JSON.stringify(members.map(x => [x.member, x.type, x.sha256 ?? null]))) };
}
function compare(a, b) {
  const left = digest(a), right = digest(b);
  const lm = new Map(left.members.map(x => [x.member, x]));
  const rm = new Map(right.members.map(x => [x.member, x]));
  const unique = [...new Set([...lm.keys(), ...rm.keys()])].sort().filter(x => !lm.has(x) || !rm.has(x)).map(member => ({ member, side: lm.has(member) ? 'left' : 'right' }));
  if (left.missing || right.missing || unique.length) return { classification: 'present-in-one-place', left, right, unique };
  for (const [member, l] of lm) {
    const r = rm.get(member);
    if (l.type !== r.type || l.sha256 !== r.sha256) return { classification: 'divergent', member, leftSha256: l.sha256 ?? left.manifestSha256, rightSha256: r.sha256 ?? right.manifestSha256, left, right };
  }
  const ai = identity(a), bi = identity(b);
  const linked = left.type === 'file' ? same(ai, bi) : bi.mechanism !== 'ordinary' && bi.realpath === ai.realpath;
  return { classification: linked ? 'already-linked' : 'identical-bytes', leftIdentity: ai, rightIdentity: bi, left, right };
}
const good = r => ['identical-bytes', 'already-linked'].includes(r.classification);
function verify(canonical, aliases) {
  const ci = identity(canonical);
  const names = [...new Set([canonical, ...aliases].map(p => path.resolve(p)))];
  const hardNames = names.filter(p => identity(p).mechanism === 'ordinary');
  const results = aliases.map(alias => {
    const ai = identity(alias);
    const bytes = compare(canonical, alias);
    const linked = ai.mechanism !== 'ordinary' ? ai.realpath === ci.realpath && same(ci, ai) : ci.type === 'file' && same(ci, ai) && BigInt(ci.nlink) >= BigInt(hardNames.length);
    return { alias, identity: ai, bytes, identityProven: linked, ok: linked && good(bytes) };
  });
  return { canonical: ci, results, ok: results.every(x => x.ok) };
}
function snapshot(p) { return { identity: identity(p), digest: digest(p) }; }
function stable(p, before, allowNlink = false) {
  const after = snapshot(p);
  const normalize = value => JSON.parse(JSON.stringify(value, (k, v) => allowNlink && k === 'nlink' ? undefined : v));
  if (JSON.stringify(normalize(before)) !== JSON.stringify(normalize(after))) fail('Changed ' + p + ': ' + JSON.stringify({ before, after }));
}
function operation(name, paths, action) {
  const before = paths.map(identity);
  const event = { operation: name, paths, before };
  events.push(event);
  action();
  event.after = paths.map(identity);
}
function absent(p) { if (exists(p)) fail('Staging name exists: ' + p); }
function outside(parent, child) {
  const relative = path.relative(parent, child);
  return relative !== '' && (relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative));
}
function noNestedLinks(p, root = true) {
  if (!root && fs.lstatSync(p).isSymbolicLink()) fail('Nested link needs an explicit scope/preservation plan: ' + p);
  if (stat(p).isDirectory()) for (const name of fs.readdirSync(p)) noNestedLinks(path.join(p, name), false);
}
function link(canonical, alias, mechanism, staged) {
  canonical = fs.realpathSync.native(canonical);
  alias = path.resolve(alias);
  if (!['hardlink', 'symlink', 'junction'].includes(mechanism)) fail('Choose hardlink, symlink, or junction');
  const ci = identity(canonical);
  if (ci.type === 'directory' && mechanism === 'hardlink') fail('Directory hardlinks are impossible: ' + canonical);
  if (mechanism === 'junction' && (process.platform !== 'win32' || ci.type !== 'directory' || canonical.startsWith('\\'))) fail('Junction requires a local directory on this host');
  if (canonical === alias || !outside(canonical, path.join(fs.realpathSync.native(path.dirname(alias)), path.basename(alias)))) fail('Alias must be outside canonical');
  noNestedLinks(canonical);
  const beforeCanonical = snapshot(canonical), beforeAlias = snapshot(alias);
  if (exists(alias)) {
    noNestedLinks(alias);
    const comparison = compare(canonical, alias);
    if (!good(comparison)) fail('Refusing ' + alias + ': ' + JSON.stringify(comparison));
    if (comparison.classification === 'already-linked') return { noop: true, proof: verify(canonical, [alias]) };
  }
  staged = staged ? path.resolve(staged) : path.join(path.dirname(alias), '.' + path.basename(alias) + '.link-' + crypto.randomUUID());
  if (path.dirname(staged) !== path.dirname(alias)) fail('Staged link must be an absent sibling');
  absent(staged);
  const displaced = staged + '.displaced';
  absent(displaced);
  stable(canonical, beforeCanonical);
  stable(alias, beforeAlias);
  operation('fs.' + (mechanism === 'hardlink' ? 'linkSync' : 'symlinkSync') + ' type=' + mechanism, [canonical, staged], () => mechanism === 'hardlink' ? fs.linkSync(canonical, staged) : fs.symlinkSync(canonical, staged, mechanism === 'junction' ? 'junction' : ci.type === 'directory' ? 'dir' : 'file'));
  const proof = verify(canonical, [staged]);
  if (!proof.ok) fail('Staged identity failed: ' + JSON.stringify(proof));
  stable(canonical, beforeCanonical, true);
  stable(alias, beforeAlias, true);
  if (exists(alias)) operation('fs.renameSync preserve displaced entry', [alias, displaced], () => fs.renameSync(alias, displaced));
  operation('fs.renameSync install staged link', [staged, alias], () => fs.renameSync(staged, alias));
  const final = verify(canonical, [alias]);
  if (!final.ok) fail('Installed identity failed: ' + JSON.stringify(final));
  return { displaced: exists(displaced) ? displaced : null, proof: final };
}
function unlink(alias, stageDir) {
  alias = path.resolve(alias);
  const before = snapshot(alias), ai = before.identity;
  if (ai.missing || (ai.mechanism === 'ordinary' && (ai.type !== 'file' || BigInt(ai.nlink) < 2n))) fail('Not an extra linked name: ' + alias);
  noNestedLinks(alias);
  const stageRoot = fs.realpathSync.native(stageDir);
  const parent = fs.realpathSync.native(path.dirname(alias));
  if (!outside(ai.realpath, stageRoot) || !outside(alias, stageRoot)) fail('Stage must be outside the reached tree and alias');
  if (stat(stageRoot).dev !== stat(parent).dev) fail('Stage must be on the alias volume');
  const staged = path.join(stageRoot, 'independent-' + crypto.randomUUID());
  absent(staged);
  const canonical = ai.mechanism === 'ordinary' ? null : ai.realpath;
  const original = canonical ? snapshot(canonical) : null;
  const fd = ai.type === 'file' ? fs.openSync(alias, 'r') : null;
  try {
    stable(alias, before);
    if (canonical) stable(canonical, original);
    operation('fs.cpSync independent copy', [alias, staged], () => fs.cpSync(alias, staged, { recursive: true, dereference: true, preserveTimestamps: true, errorOnExist: true, force: false }));
    const copy = snapshot(staged);
    if (!good(compare(alias, staged)) || same(ai, copy.identity)) fail('Independent stage proof failed');
    for (let i = 0; i < before.digest.members.length; i++) if (same(before.digest.members[i], copy.digest.members[i])) fail('Stage member is not independent: ' + copy.digest.members[i].path);
    stable(alias, before);
    stable(staged, copy);
    if (canonical) stable(canonical, original);
    operation(ai.mechanism === 'junction' ? 'fs.rmdirSync junction entry only' : 'fs.unlinkSync entry only', [alias], () => ai.mechanism === 'junction' ? fs.rmdirSync(alias) : fs.unlinkSync(alias));
    operation('fs.renameSync restore independent entry', [staged, alias], () => fs.renameSync(staged, alias));
    const after = snapshot(alias);
    if (after.identity.mechanism !== 'ordinary' || same(ai, after.identity) || after.digest.manifestSha256 !== before.digest.manifestSha256) fail('Restored identity/content proof failed');
    let canonicalProof;
    if (canonical) {
      stable(canonical, original);
      canonicalProof = snapshot(canonical);
    } else {
      const s = fs.fstatSync(fd, { bigint: true });
      const hash = sha(fs.readFileSync(fd));
      canonicalProof = { witness: 'open original object handle', ...fields(s), sha256: hash };
      if (!same(ai, fields(s)) || s.nlink !== BigInt(ai.nlink) - 1n || hash !== before.digest.members[0].sha256) fail('Original object was changed');
    }
    return { before, after, canonicalProof, independent: true };
  } finally { if (fd !== null) fs.closeSync(fd); }
}
function probe(paths) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'identity-probe-'));
  const file = path.join(root, 'file'), dir = path.join(root, 'dir');
  fs.writeFileSync(file, 'probe');
  fs.mkdirSync(dir);
  const capabilities = [];
  try {
    for (const mechanism of ['hardlink', 'symlink', ...(process.platform === 'win32' ? ['junction'] : [])]) {
      const alias = path.join(root, mechanism);
      try {
        if (mechanism === 'hardlink') fs.linkSync(file, alias);
        else fs.symlinkSync(dir, alias, mechanism === 'junction' ? 'junction' : 'dir');
        capabilities.push({ mechanism, status: 'supported', probeDirectory: root });
      } catch (e) { capabilities.push({ mechanism, status: 'unsupported', error: e.message, probeDirectory: root }); }
      finally { if (exists(alias)) { if (mechanism === 'junction') fs.rmdirSync(alias); else fs.unlinkSync(alias); } }
    }
  } finally { fs.unlinkSync(file); fs.rmdirSync(dir); fs.rmdirSync(root); }
  return paths.map(p => {
    const id = identity(p);
    let mountRoot = id.realpath;
    if (id.type !== 'directory') mountRoot = path.dirname(mountRoot);
    while (path.dirname(mountRoot) !== mountRoot && stat(path.dirname(mountRoot)).dev === BigInt(id.dev)) mountRoot = path.dirname(mountRoot);
    let filesystem;
    try { filesystem = String(fs.statfsSync(p, { bigint: true }).type); } catch (e) { filesystem = 'unknown: ' + e.message; }
    return { ...id, mountRoot, mountRootEvidence: 'device boundary or filesystem root; same-device bind mounts require separate inspection', filesystem, capabilities, preservationContract: 'ACLs, named streams, xattrs and required timestamp preservation unproven; inspect separately before approval', exclusiveAccess: 'requires explicit human answer', destinationPermission: 'unproven by temp probe' };
  });
}
function option(name) {
  const i = args.indexOf(name);
  if (i < 0) return undefined;
  if (!args[i + 1] || args[i + 1].startsWith('--')) fail('Missing value for ' + name);
  return args.splice(i, 2)[1];
}
let result, exitCode = 0;
try {
  const mechanism = option('--mechanism'), staged = option('--staged'), stage = option('--stage');
  if (args.some(x => x.startsWith('--'))) fail('Unknown option');
  if (command !== 'link' && (mechanism || staged) || command !== 'unlink' && stage) fail('Option does not apply to this subcommand');
  if (['probe', 'digest'].includes(command) && args.length) result = command === 'probe' ? probe(args) : args.map(digest);
  else if (command === 'compare' && args.length === 2) { result = compare(...args); exitCode = good(result) ? 0 : 3; }
  else if (command === 'verify' && args.length >= 2) { result = verify(args[0], args.slice(1)); exitCode = result.ok ? 0 : 1; }
  else if (command === 'link' && args.length === 2 && mechanism) result = link(...args, mechanism, staged);
  else if (command === 'unlink' && args.length === 1 && stage) result = unlink(args[0], stage);
  else fail('Usage: identity.mjs probe|digest <path>...; compare <a> <b>; verify <canonical> <alias>...; link <canonical> <alias> --mechanism hardlink|symlink|junction [--staged <path>]; unlink <alias> --stage <dir>; optional --json');
} catch (e) { result = { error: e.message }; exitCode = 1; }
console.log(JSON.stringify({ command, observedAt: new Date().toISOString(), events, result, exitCode }, null, json ? 0 : 2));
process.exitCode = exitCode;
