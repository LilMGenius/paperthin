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
  return spawnSync(process.execPath, ['scripts/gates/check.cjs'], { cwd: root, encoding: 'utf8', env: { ...process.env, GITHUB_ACTIONS: '' } });
}

test('the gate exits 0 on a clean catalog and 1 with file:line on any problem', (t) => {
  assert.equal(gate(t).status, 0);
  const red = gate(t, { 'NOTES.md': '[x](./gone.md)\n' });
  assert.equal(red.status, 1);
  assert.match(red.stderr, /^NOTES\.md:1: link \.\/gone\.md/m);
});
