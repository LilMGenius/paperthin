#!/usr/bin/env node
'use strict';
/*
 * Integration tests for scripts/check-readme-sync.cjs.
 *
 * Uses a temp scratch repo with a synthetic README.md + docs/readme/*.md so the assertions
 * pin the script's behavior without depending on the real paperthin state (which happens to
 * be in sync at the time of writing). Four cases: normal, missing, order-swap, --strict.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const SCRIPT = path.join(__dirname, '..', 'scripts', 'check-readme-sync.cjs');

function mkRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'paperthin-sync-'));
  fs.mkdirSync(path.join(dir, 'scripts'));
  fs.mkdirSync(path.join(dir, 'docs', 'readme'), { recursive: true });
  fs.copyFileSync(SCRIPT, path.join(dir, 'scripts', 'check-readme-sync.cjs'));
  return dir;
}

function boldLink(name) {
  return `**[${name}](./skills/${name}/SKILL.md)**`;
}

function readmeWith(names, opts = {}) {
  const rel = opts.rel || '.';
  const lines = ['# Test README', ''];
  for (const n of names) {
    const link = `**[${n}](${rel}/skills/${n}/SKILL.md)**`;
    lines.push(`| ${link} | desc | scope | invoker |`);
  }
  return lines.join('\n') + '\n';
}

function run(repo, args = []) {
  return spawnSync('node', [path.join(repo, 'scripts', 'check-readme-sync.cjs'), ...args], {
    cwd: repo,
    encoding: 'utf8',
  });
}

const cases = [];

// Case 1 — normal (all translations match EN)
cases.push(['normal', () => {
  const dir = mkRepo();
  const skills = ['re0', 'readchk', 'aim'];
  fs.writeFileSync(path.join(dir, 'README.md'), readmeWith(skills));
  for (const lang of ['ko', 'ja', 'de']) {
    fs.writeFileSync(
      path.join(dir, 'docs', 'readme', `README.${lang}.md`),
      readmeWith(skills, { rel: '../..' })
    );
  }
  const r = run(dir);
  return r.status === 0 && /README sync OK: 3/.test(r.stdout);
}]);

// Case 2 — one translation missing a skill (warn-only, exit 0)
cases.push(['missing', () => {
  const dir = mkRepo();
  fs.writeFileSync(path.join(dir, 'README.md'), readmeWith(['re0', 'readchk', 'aim']));
  fs.writeFileSync(
    path.join(dir, 'docs', 'readme', 'README.ko.md'),
    readmeWith(['re0', 'aim'], { rel: '../..' }) // missing readchk
  );
  const r = run(dir);
  return r.status === 0
    && /1 missing \(readchk\)/.test(r.stderr)
    && /warn-only/.test(r.stderr);
}]);

// Case 3 — order mismatch (two skills swapped)
cases.push(['order-swap', () => {
  const dir = mkRepo();
  fs.writeFileSync(path.join(dir, 'README.md'), readmeWith(['re0', 'readchk', 'aim']));
  fs.writeFileSync(
    path.join(dir, 'docs', 'readme', 'README.ko.md'),
    readmeWith(['re0', 'aim', 'readchk'], { rel: '../..' }) // swapped
  );
  const r = run(dir);
  return r.status === 0 && /order mismatch/.test(r.stderr);
}]);

// Case 4 — --strict fails on drift with exit 1
cases.push(['strict-fails', () => {
  const dir = mkRepo();
  fs.writeFileSync(path.join(dir, 'README.md'), readmeWith(['re0', 'readchk', 'aim']));
  fs.writeFileSync(
    path.join(dir, 'docs', 'readme', 'README.ko.md'),
    readmeWith(['re0', 'aim'], { rel: '../..' })
  );
  const r = run(dir, ['--strict']);
  return r.status === 1 && /::error::/.test(r.stderr);
}]);

let pass = 0;
let fail = 0;
for (const [name, fn] of cases) {
  try {
    const ok = fn();
    if (ok) { pass++; console.log(`  ok ${name}`); }
    else { fail++; console.error(`  FAIL ${name}`); }
  } catch (e) {
    fail++;
    console.error(`  FAIL ${name}: ${e.message}`);
  }
}

console.log(`\n${pass}/${cases.length} passed`);
process.exit(fail ? 1 : 0);
