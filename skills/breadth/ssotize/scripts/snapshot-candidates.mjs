#!/usr/bin/env node
'use strict';
/*
 * Produce the audit table described by ssotize Workflow 2 and 9.
 * Prior art: daedal-games/tools/snapshot-paths.mjs (relative path enumeration)
 * and skills/session-surgery/scripts/diagnose-rollout.mjs (stat mtime and size).
 * Mechanisms only, no source copied: the former is proprietary; no license
 * was found for the latter. Use Node APIs with recursive exclusions, SHA-256,
 * cwd-relative sorting, and Markdown/JSON output for candidate-file audits.
 * Usage: node skills/breadth/ssotize/scripts/snapshot-candidates.mjs [--json] <path>...
 */
import { readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { relative, resolve, sep, join } from 'node:path';
import { createHash } from 'node:crypto';

const args = process.argv.slice(2);
const json = args.includes('--json');
const paths = args.filter(arg => arg !== '--json');
const files = new Map();
const ancestors = new Set();

function visit(path) {
  const stat = statSync(path);
  if (stat.isDirectory()) {
    const real = realpathSync(path);
    if (ancestors.has(real)) return;
    ancestors.add(real);
    for (const name of readdirSync(path)) {
      if (name !== '.git' && name !== 'node_modules') visit(join(path, name));
    }
    ancestors.delete(real);
  } else if (stat.isFile()) {
    const name = relative(process.cwd(), path).split(sep).join('/');
    files.set(name, {
      path: name,
      mtime: stat.mtime.toISOString(),
      size: stat.size,
      sha256: createHash('sha256').update(readFileSync(path)).digest('hex'),
    });
  } else {
    throw new Error(`not a file or directory: ${path}`);
  }
}

try {
  if (!paths.length) throw new Error('usage: node skills/breadth/ssotize/scripts/snapshot-candidates.mjs [--json] <path>...');
  for (const path of paths) visit(resolve(path));
  const rows = [...files.values()].sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  if (json) {
    console.log(JSON.stringify(rows, null, 2));
  } else {
    console.log('| path | mtime (ISO 8601 UTC) | size | sha256 |');
    console.log('| --- | --- | --- | --- |');
    for (const row of rows) {
      const path = row.path.replaceAll('&', '&amp;').replaceAll('<', '&lt;')
        .replaceAll('|', '&#124;').replaceAll('\r', '&#13;').replaceAll('\n', '&#10;');
      console.log(`| ${path} | ${row.mtime} | ${row.size} | ${row.sha256} |`);
    }
  }
} catch (error) {
  console.error(`snapshot-candidates: ${error.message.replace(/[\r\n]+/g, ' ')}`);
  process.exitCode = 2;
}