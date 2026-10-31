'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const { fixture } = require('./fixture.cjs');
const { absoluteLinks, BASE_URL, check } = require('./llms.cjs');

const TICK = '`';
const gate = path.join(__dirname, 'llms.cjs');
const run = (root, ...args) => spawnSync(process.execPath, [gate, '--root', root, ...args], { encoding: 'utf8' });

test('relative links become absolute raw URLs with anchors kept, while code spans, fences and absolute links stay', () => {
  const text = ['[a](../sip/SKILL.md#goal) [b](https://x.dev) [c](#here) ' + TICK + '[d](x.md)' + TICK, TICK.repeat(3), '[e](x.md)', TICK.repeat(3)].join('\n');
  assert.deepEqual(absoluteLinks(text, 'skills/depth/re0/SKILL.md').split('\n'), [
    '[a](' + BASE_URL + 'skills/depth/sip/SKILL.md#goal) [b](https://x.dev) [c](#here) ' + TICK + '[d](x.md)' + TICK,
    TICK.repeat(3),
    '[e](x.md)',
    TICK.repeat(3),
  ]);
});

test('the generated files carry every manifest skill, and a skill edited afterwards makes llms-full.txt stale', (t) => {
  const root = fixture(t);
  assert.equal(run(root).status, 0);
  assert.deepEqual(check(root), []);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, '.claude-plugin', 'plugin.json'), 'utf8'));
  const carried = fs.readFileSync(path.join(root, 'llms-full.txt'), 'utf8').split('\n').filter((l) => l.startsWith('--- FILE: ')).map((l) => l.split(' ')[2]);
  assert.deepEqual(carried, ['README.md', ...manifest.skills.map((d) => d.replace(/^\.\//, '') + '/SKILL.md')]);
  fs.appendFileSync(path.join(root, carried[1]), '\nOne more line.\n');
  const [found] = check(root);
  assert.equal(found.file, 'llms-full.txt');
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

