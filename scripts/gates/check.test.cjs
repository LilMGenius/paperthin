'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const { fixture } = require('./fixture.cjs');

function gate(t, files) {
  const root = fixture(t, files);
  fs.mkdirSync(path.join(root, 'scripts', 'gates'), { recursive: true });
  for (const name of fs.readdirSync(__dirname).filter((name) => !name.endsWith('.test.cjs'))) fs.copyFileSync(path.join(__dirname, name), path.join(root, 'scripts', 'gates', name));
  // The prose gate classifies dashes with dedash's own script, so the copy carries it.
  const classifier = path.join('skills', 'depth', 'dedash', 'scripts', 'find.mjs');
  fs.mkdirSync(path.dirname(path.join(root, classifier)), { recursive: true });
  fs.copyFileSync(path.join(__dirname, '..', '..', classifier), path.join(root, classifier));
  // llms.txt is generated from the catalog, so a fixture writes its own before the gate runs.
  // The copied gates sit in a temp folder with no node_modules above it, so they resolve this repository's dependencies by NODE_PATH.
  const env = { ...process.env, GITHUB_ACTIONS: '', NODE_PATH: path.join(__dirname, '..', '..', 'node_modules') };
  spawnSync(process.execPath, ['scripts/gates/llms.cjs'], { cwd: root, encoding: 'utf8', env });
  return spawnSync(process.execPath, ['scripts/gates/check.cjs'], { cwd: root, encoding: 'utf8', env });
}

test('the gate exits 0 on a clean catalog and 1 with file:line on any problem', (t) => {
  const clean = gate(t);
  assert.equal(clean.status, 0, clean.stdout + clean.stderr);
  const red = gate(t, { 'NOTES.md': '[x](./gone.md)\n' });
  assert.equal(red.status, 1);
  assert.match(red.stderr, /^NOTES\.md:1: link \.\/gone\.md/m);
});
