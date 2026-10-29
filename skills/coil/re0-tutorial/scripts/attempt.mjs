#!/usr/bin/env node
// Compute the resume state of one tutorial exercise: digest its skill folders, read the exercise's attempt records,
// compare the latest record with the current install, and print the status with the next unused attempt path.
// The digest covers each folder's files by relative path and content with line endings normalized, so a CRLF checkout equals an LF one.
// A record is read for three fields: version, skills (comma separated folder names) and skill-set digest, written as "key: value" lines.
// Status: fresh (no record), match, version-only, content-difference, stale (a recorded skill is no longer among the current folders), unreadable (a folder or the latest record's digest cannot be read).
// Usage: node attempt.mjs --exercise <id> --skills <folder> [more folders...] [--version <current>] [--dir <tutorial dir>] [--json]
//   --version defaults to the version in the nearest package.json above the working directory; --dir defaults to .re0/tutorial.
// Exit codes: 0 fresh, match or version-only (resume or begin); 3 content-difference or stale (judgment needed); 4 unreadable; 2 usage error.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const USAGE = 'usage: node attempt.mjs --exercise <id> --skills <folders...> [--version <current>] [--dir <tutorial dir>] [--json]';

export class InputError extends Error {}
export class DigestError extends Error {}

const SKIP_DIRS = new Set(['.git', 'node_modules']);
const RECORD = /^(.+)-(\d+)\.local\.md$/;

const toPosix = (path) => path.split(sep).join('/');

function filesUnder(dir, base = dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) filesUnder(full, base, out);
    } else if (entry.isFile()) out.push(toPosix(full.slice(base.length + 1)));
  }
  return out;
}

// One digest per skill folder; each file contributes its relative path and its content with CRLF turned into LF.
export function digestFolder(folder) {
  let files;
  try {
    if (!statSync(folder).isDirectory()) throw new Error('not a folder');
    files = filesUnder(folder).sort();
    const hash = createHash('sha256');
    for (const file of files) {
      hash.update(file + '\0');
      hash.update(readFileSync(join(folder, file), 'utf8').replace(/\r\n/g, '\n') + '\0');
    }
    return hash.digest('hex');
  } catch (error) {
    throw new DigestError('cannot digest ' + folder + ': ' + error.message);
  }
}

// The skill-set digest joins the folders' names and digests in name order.
export function digestSet(folders) {
  const entries = folders.map((folder) => ({ name: basename(resolve(folder)), digest: digestFolder(folder) })).sort((a, b) => (a.name < b.name ? -1 : 1));
  const hash = createHash('sha256');
  for (const e of entries) hash.update(e.name + ':' + e.digest + '\n');
  return { names: entries.map((e) => e.name), digest: hash.digest('hex') };
}

function field(text, key) {
  const re = new RegExp('^[\\s>*-]*\\**' + key + '\\**\\s*:\\s*(.+)$', 'im');
  const match = re.exec(text);
  return match ? match[1].replace(/[`*]/g, '').trim() : null;
}

export function readRecords(dir) {
  if (!existsSync(dir)) return [];
  const records = [];
  for (const name of readdirSync(dir)) {
    const match = RECORD.exec(name);
    if (!match) continue;
    const text = readFileSync(join(dir, name), 'utf8');
    const skills = field(text, 'skills');
    records.push({
      file: name,
      version: match[1],
      attempt: Number(match[2]),
      recordedVersion: field(text, 'version'),
      digest: field(text, 'skill-set digest'),
      skills: skills ? skills.split(/[,\s]+/).filter(Boolean) : null,
    });
  }
  return records.sort((a, b) => a.attempt - b.attempt);
}

export function packageVersion(from) {
  for (let dir = resolve(from); ; dir = dirname(dir)) {
    const file = join(dir, 'package.json');
    if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8')).version ?? null;
    if (dirname(dir) === dir) return null;
  }
}

export function status({ records, current, version }) {
  if (!records.length) return 'fresh';
  const latest = records[records.length - 1];
  if (!latest.digest) return 'unreadable';
  if (current.error) return 'unreadable';
  const recordedVersion = latest.recordedVersion ?? latest.version;
  if (latest.skills && latest.skills.some((name) => !current.names.includes(name))) return 'stale';
  if (latest.digest !== current.digest) return 'content-difference';
  return recordedVersion === version ? 'match' : 'version-only';
}

export function resume({ exercise, skills, version, dir }) {
  const folder = join(dir, exercise);
  const records = readRecords(folder);
  let current;
  try {
    current = digestSet(skills);
  } catch (error) {
    if (!(error instanceof DigestError)) throw error;
    current = { error: error.message, names: skills.map((s) => basename(resolve(s))), digest: null };
  }
  const state = status({ records, current, version });
  const latest = records[records.length - 1] ?? null;
  const next = Math.max(0, ...records.map((r) => r.attempt)) + 1;
  return {
    exercise,
    version,
    status: state,
    currentDigest: current.digest,
    ...(current.error ? { digestError: current.error } : {}),
    latest: latest && { file: toPosix(join(folder, latest.file)), version: latest.recordedVersion ?? latest.version, attempt: latest.attempt, digest: latest.digest },
    nextPath: toPosix(join(folder, version + '-' + next + '.local.md')),
  };
}

export function format(result) {
  const out = ['status: ' + result.status, 'exercise: ' + result.exercise, 'current version: ' + result.version, 'current digest: ' + (result.currentDigest ?? 'unreadable')];
  if (result.digestError) out.push('digest error: ' + result.digestError);
  out.push(result.latest ? 'latest record: ' + result.latest.file + ' (version ' + result.latest.version + ', attempt ' + result.latest.attempt + ')' : 'latest record: none');
  out.push('next path: ' + result.nextPath);
  return out.join('\n');
}

const EXIT = { fresh: 0, match: 0, 'version-only': 0, 'content-difference': 3, stale: 3, unreadable: 4 };

export function main(argv) {
  let values;
  let positionals;
  try {
    ({ values, positionals } = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        exercise: { type: 'string' },
        skills: { type: 'string', multiple: true },
        version: { type: 'string' },
        dir: { type: 'string' },
        json: { type: 'boolean' },
        help: { type: 'boolean' },
      },
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
  const version = values.version ?? packageVersion(process.cwd());
  const skills = [...(values.skills ?? []), ...positionals];
  if (!values.exercise || !skills.length || !version) {
    console.error('name --exercise and --skills, and give --version when no package.json is above the working directory\n' + USAGE);
    return 2;
  }
  if (!/^[\w.-]+$/.test(values.exercise)) {
    console.error('the exercise id may hold only letters, digits, dot, dash and underscore\n' + USAGE);
    return 2;
  }
  const result = resume({ exercise: values.exercise, skills, version, dir: resolve(values.dir ?? '.re0/tutorial') });
  console.log(values.json ? JSON.stringify(result) : format(result));
  return EXIT[result.status];
}

// An installed skill is often a link to its source folder; Node resolves import.meta.url through the link while argv keeps
// the link path, so both sides are compared as real paths or a call through the link exits 0 having done nothing.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) process.exitCode = main(process.argv.slice(2));
