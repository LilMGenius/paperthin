#!/usr/bin/env node
// Preserve round-0 originals byte for byte in a report and prove the preservation later.
// pack copies each original's raw bytes between labeled delimiter lines and records offset, length and sha256 per segment;
// verify re-extracts each segment by offset and length and compares its digest, and its bytes when originals are given.
// Usage: node segments.mjs pack <out-report> <round0-file>...
//        node segments.mjs verify <report> <index.json> [<round0-file>...]
// Exit codes: 0 every segment equal; 1 a mismatch, named by segment; 2 usage or an unreadable input.
import { readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const USAGE = 'usage: node segments.mjs pack <out-report> <round0-file>...\n       node segments.mjs verify <report> <index.json> [<round0-file>...]';

export class InputError extends Error {}

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

function read(path) {
  try {
    return readFileSync(path);
  } catch (error) {
    throw new InputError('cannot read ' + path + ': ' + error.message);
  }
}

// Labels live on their own delimiter lines outside the segment, so the newline that ends a delimiter line belongs to the
// delimiter and the segment holds exactly the original's bytes.
export function pack(sources) {
  const parts = [];
  const segments = [];
  let offset = 0;
  const push = (bytes) => {
    parts.push(bytes);
    offset += bytes.length;
  };
  sources.forEach((source, i) => {
    const bytes = read(source);
    const label = 'round0-' + (i + 1);
    push(Buffer.from('<<<< begin ' + label + ' ' + bytes.length + ' bytes ' + JSON.stringify(source) + '\n', 'utf8'));
    segments.push({ source, label, offset, length: bytes.length, sha256: sha256(bytes) });
    push(bytes);
    push(Buffer.from('\n>>>> end ' + label + '\n', 'utf8'));
  });
  return { report: Buffer.concat(parts), index: { segments } };
}

function readIndex(path) {
  let index;
  try {
    index = JSON.parse(read(path).toString('utf8'));
  } catch (error) {
    if (error instanceof SyntaxError) throw new InputError(path + ' does not parse: ' + error.message);
    throw error;
  }
  const valid = (s) => s && typeof s.label === 'string' && Number.isSafeInteger(s.offset) && s.offset >= 0 && Number.isSafeInteger(s.length) && s.length >= 0 && /^[0-9a-f]{64}$/.test(s.sha256);
  if (!index || !Array.isArray(index.segments) || !index.segments.every(valid)) throw new InputError(path + ' is not a segment index');
  return index;
}

// One result per segment; a segment fails when its range leaves the report, its digest differs from the index,
// or, when originals are given, its bytes differ from the original in the same position.
export function verify(report, index, originals) {
  if (originals && originals.length !== index.segments.length) throw new InputError('index lists ' + index.segments.length + ' segments, ' + originals.length + ' originals given');
  return index.segments.map((s, i) => {
    const name = s.label + ' (' + s.source + ')';
    if (s.offset + s.length > report.length) return { ok: false, line: 'MISMATCH ' + name + ': range ' + s.offset + '+' + s.length + ' passes the report end ' + report.length };
    const bytes = report.subarray(s.offset, s.offset + s.length);
    if (sha256(bytes) !== s.sha256) return { ok: false, line: 'MISMATCH ' + name + ': sha256 differs from the index' };
    if (originals && !bytes.equals(originals[i].bytes)) return { ok: false, line: 'MISMATCH ' + name + ': bytes differ from ' + originals[i].path };
    return { ok: true, line: 'ok ' + name + ' ' + s.length + ' bytes' + (originals ? ', equal to ' + originals[i].path : ', digest only') };
  });
}

export function main(argv) {
  const [command, ...args] = argv;
  try {
    if (command === 'pack' && args.length >= 2) {
      const [out, ...sources] = args;
      const { report, index } = pack(sources);
      writeFileSync(out, report);
      writeFileSync(out + '.index.json', JSON.stringify(index, null, 2) + '\n');
      for (const s of index.segments) console.log('packed ' + s.label + ' ' + s.source + ' offset ' + s.offset + ' length ' + s.length + ' sha256 ' + s.sha256);
      return 0;
    }
    if (command === 'verify' && args.length >= 2) {
      const [reportPath, indexPath, ...given] = args;
      const report = read(reportPath);
      const index = readIndex(indexPath);
      const originals = given.length ? given.map((path) => ({ path, bytes: read(path) })) : null;
      const results = verify(report, index, originals);
      for (const r of results) (r.ok ? console.log : console.error)(r.line);
      const bad = results.filter((r) => !r.ok).length;
      console.log(bad ? 'SEGMENTS RED ' + bad : 'SEGMENTS GREEN ' + results.length);
      return bad ? 1 : 0;
    }
  } catch (error) {
    if (error instanceof InputError) {
      console.error('segments: ' + error.message + '\n' + USAGE);
      return 2;
    }
    throw error;
  }
  console.error(USAGE);
  return 2;
}

// An installed skill is often a link to its source folder; Node resolves import.meta.url through the link while argv keeps
// the link path, so both sides are compared as real paths or a call through the link exits 0 having done nothing.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) process.exitCode = main(process.argv.slice(2));
