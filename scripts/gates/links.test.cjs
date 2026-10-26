'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { check, anchors } = require('./links.cjs');
const { fixture, edit, messages } = require('./fixture.cjs');

const run = (t, files) => messages(check(fixture(t, files)));

test('a valid catalog passes', (t) => {
  assert.deepEqual(run(t), []);
});

test('a link to a missing file fails at its line, and links in code are not followed', (t) => {
  assert.match(run(t, { 'NOTES.md': '\n[x](./gone.md)\n' }).join(), /^NOTES\.md:2: link \.\/gone\.md does not resolve/);
  assert.deepEqual(run(t, { 'NOTES.md': '\x60[x](./gone.md)\x60\n\n\x60\x60\x60\n[y](./gone.md)\n\x60\x60\x60\n' }), []);
});

test('a fragment naming no heading fails, and one naming a heading passes', (t) => {
  assert.match(run(t, { 'NOTES.md': '[x](./README.md#the-pipelines)\n' }).join(), /names no heading in README\.md/);
  assert.deepEqual(run(t, { 'NOTES.md': '[x](./README.md#the-index)\n' }), []);
});

test('heading ids follow GitHub: punctuation dropped, repeats numbered', () => {
  assert.deepEqual([...anchors('## SKILL.md format\n## #1 \u2014 Artifacts rot\n## Goal\n## Goal\n')], ['skillmd-format', '1--artifacts-rot', 'goal', 'goal-1']);
});

test('a reference with no definition fails', (t) => {
  assert.match(run(t, { 'NOTES.md': 'see [x][nowhere]\n' }).join(), /reference \[nowhere\] has no/);
});

test('a translation whose switcher drops a language fails', (t) => {
  assert.match(run(t, edit('assets/i18n/README.ko.md', (text) => text.replace('[English](../../README.md) · ', ''))).join(), /README\.ko\.md:3: the language switcher does not link README\.md/);
});
