'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { check } = require('./catalog.cjs');
const { fixture, edit, messages, BASE } = require('./fixture.cjs');

const run = (t, files) => messages(check(fixture(t, files)));
const swapRows = (text) => {
  const [first, second] = text.split('\n').filter((line) => line.includes('/SKILL.md)**'));
  return text.replace(first, '\0').replace(second, first).replace('\0', second);
};

test('a valid catalog passes', (t) => {
  assert.deepEqual(run(t), []);
});

test('a translated Index out of catalog order fails, and rows elsewhere do not count', (t) => {
  assert.match(run(t, edit('assets/i18n/README.ko.md', swapRows)).join(), /README\.ko\.md Index: lists the roster as \[re0-upgrade, foo\]/);
  const elsewhere = '## Elsewhere\n\n| **[re0-upgrade](./skills/breadth/re0-upgrade/SKILL.md)** | x |\n\n## Quickstart';
  assert.deepEqual(run(t, edit('README.md', (text) => text.replace('## Quickstart', elsewhere))), []);
});

test('a skill missing from plugin.json or the upgrade roster fails', (t) => {
  const plugin = JSON.stringify({ description: 'One line.', skills: ['./skills/depth/foo'] });
  assert.match(run(t, { '.claude-plugin/plugin.json': plugin }).join(), /skills\/breadth\/re0-upgrade is not registered/);
  assert.match(run(t, edit('skills/breadth/re0-upgrade/SKILL.md', (text) => text.replace(', \x60re0-upgrade\x60', ''))).join(), /re0-upgrade\/SKILL\.md: lists the roster as \[foo\]/);
});

test('an Invoker cell off its lane fails in any language', (t) => {
  const problems = run(t, edit('assets/i18n/README.ko.md', (text) => text.replace('| 사용자 |', '| 모델 |')));
  assert.match(problems.join(), /README\.ko\.md: the Invoker column uses "모델" for both lanes/);
});

test('a brand line that differs and an .npmignore fail', (t) => {
  const problems = run(t, { 'package.json': JSON.stringify({ description: 'Other.' }), '.npmignore': 'x\n' });
  assert.match(problems.join(), /description differs from package\.json/);
  assert.match(problems.join(), /\.npmignore: publishing reads \.gitignore/);
});

test('plugin.json that is not JSON fails with a problem, not a crash', (t) => {
  assert.match(run(t, { '.claude-plugin/plugin.json': BASE['.claude-plugin/plugin.json'] + ',' }).join(), /plugin\.json: is not valid JSON/);
});
