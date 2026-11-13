'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const { fixture } = require('./fixture.cjs');
const { BASE_URL, check } = require('./llms.cjs');

const gate = path.join(__dirname, 'llms.cjs');
const run = (root, ...args) => spawnSync(process.execPath, [gate, '--root', root, ...args], { encoding: 'utf8' });

test('llms.txt lists every manifest skill at its raw address, and a description edited afterwards makes it stale', (t) => {
  const root = fixture(t);
  assert.equal(run(root).status, 0);
  assert.deepEqual(check(root), []);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, '.claude-plugin', 'plugin.json'), 'utf8'));
  const listed = fs.readFileSync(path.join(root, 'llms.txt'), 'utf8').split('\n').filter((l) => l.startsWith('- [')).map((l) => /^- \[([^\]]+)\]\(([^)]+)\)/.exec(l));
  const files = ['README.md', ...manifest.skills.map((d) => d.replace(/^\.\//, '') + '/SKILL.md')];
  assert.deepEqual(listed.map((m) => m[1]), files);
  assert.deepEqual(listed.map((m) => m[2]), files.map((f) => BASE_URL + f));
  const skill = path.join(root, files[1]);
  fs.writeFileSync(skill, fs.readFileSync(skill, 'utf8').replace(/^description: .*$/m, 'description: "Something else entirely"'));
  const [found] = check(root);
  assert.equal(found.file, 'llms.txt');
  assert.match(found.message, /differs from what node scripts\/gates\/llms\.cjs builds/);
});

test('--check exits 1 naming the stale file and writes nothing; a bad flag is a usage error', (t) => {
  const root = fixture(t);
  run(root);
  fs.writeFileSync(path.join(root, 'llms.txt'), '# stale\n');
  const result = run(root, '--check');
  assert.equal(result.status, 1);
  assert.equal(result.stderr, 'llms.txt is stale; run node scripts/gates/llms.cjs\n');
  assert.equal(fs.readFileSync(path.join(root, 'llms.txt'), 'utf8'), '# stale\n');
  assert.equal(run(root, '--bogus').status, 2);
});

