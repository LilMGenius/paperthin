#!/usr/bin/env node
// Pre-write guard for re0-import: refuse any destination that leaves the target root, and hash every file about to change.
// A path is refused when it is absolute, climbs out with "..", resolves through a link to somewhere outside the root,
// or (for an edit) does not exist. A --create path must not exist yet and must sit in a folder inside the root.
// Usage: node guard.mjs <target-root> <files-to-edit...> [--create <new-file>]... [--json]
// Exit codes: 0 every path allowed; 3 one or more refused; 2 usage or an unreadable root.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const USAGE = 'usage: node guard.mjs <target-root> <files-to-edit...> [--create <new-file>]... [--json]';

export class InputError extends Error {}

const inside = (root, path) => {
  const rel = relative(root, path);
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
};

// The nearest ancestor that exists decides where a not-yet-created path really lands once links are followed.
function realAncestor(path) {
  let dir = path;
  while (!existsSync(dir)) dir = dirname(dir);
  return realpathSync(dir);
}

function refusal(root, realRoot, raw, create) {
  if (isAbsolute(raw)) return 'absolute path';
  const full = resolve(root, raw);
  if (!inside(root, full)) return 'path leaves the target root';
  if (create) {
    if (existsSync(full)) return 'create path already exists';
    return inside(realRoot, realAncestor(dirname(full))) ? null : 'resolves through a link outside the target root';
  }
  if (!existsSync(full)) return 'MISS: file does not exist';
  if (!statSync(full).isFile()) return 'not a file';
  return inside(realRoot, realpathSync(full)) ? null : 'resolves through a link outside the target root';
}

export function guard(rootArg, edits, creates) {
  if (!existsSync(rootArg) || !statSync(rootArg).isDirectory()) throw new InputError('target root is not a folder: ' + rootArg);
  const root = resolve(rootArg);
  const realRoot = realpathSync(root);
  const allowed = [];
  const refused = [];
  for (const [list, create] of [[edits, false], [creates, true]]) {
    for (const raw of list) {
      const reason = refusal(root, realRoot, raw, create);
      if (reason) refused.push({ path: raw, reason });
      else if (create) allowed.push({ path: raw, create: true });
      else allowed.push({ path: raw, sha256: createHash('sha256').update(readFileSync(resolve(root, raw))).digest('hex') });
    }
  }
  return { root, allowed, refused };
}

export function format(result) {
  const out = result.allowed.map((a) => (a.create ? 'create ' + a.path : a.sha256 + '  ' + a.path));
  for (const r of result.refused) out.push('REFUSED ' + r.path + ': ' + r.reason);
  out.push(result.allowed.length + ' allowed, ' + result.refused.length + ' refused');
  return out.join('\n');
}

export function main(argv) {
  let values;
  let positionals;
  try {
    ({ values, positionals } = parseArgs({
      args: argv,
      allowPositionals: true,
      options: { create: { type: 'string', multiple: true }, json: { type: 'boolean' }, help: { type: 'boolean' } },
    }));
  } catch (error) {
    if (typeof error.code === 'string' && error.code.startsWith('ERR_PARSE_ARGS')) {
      console.error(error.message + '\n' + USAGE);
      return 2;
    }
    throw error;
  }
  if (values.help) {
    console.log(USAGE);
    return 0;
  }
  const [root, ...edits] = positionals;
  const creates = values.create ?? [];
  if (!root || (!edits.length && !creates.length)) {
    console.error('name the target root and at least one file\n' + USAGE);
    return 2;
  }
  let result;
  try {
    result = guard(root, edits, creates);
  } catch (error) {
    if (error instanceof InputError) {
      console.error('guard: ' + error.message + '\n' + USAGE);
      return 2;
    }
    throw error;
  }
  console.log(values.json ? JSON.stringify(result) : format(result));
  return result.refused.length ? 3 : 0;
}

// An installed skill is often a link to its source folder; Node resolves import.meta.url through the link while argv keeps
// the link path, so both sides are compared as real paths or a call through the link exits 0 having done nothing.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) process.exitCode = main(process.argv.slice(2));
