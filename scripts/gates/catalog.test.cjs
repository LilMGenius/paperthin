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

test('a Problem list missing a skill, naming a retired or unknown one, or out of catalog order fails in any README', (t) => {
  const ko = 'assets/i18n/README.ko.md';
  assert.match(run(t, edit(ko, (text) => text.replace('- \x60re0-upgrade\x60 removes another.\n', ''))).join(), /README\.ko\.md: the Problem list does not name re0-upgrade/);
  assert.match(run(t, edit('README.md', (text) => text.replace('- \x60foo\x60', '- \x60bar\x60'))).join(), /README\.md:\d+: the Problem list names \x60bar\x60, retired as \x60foo\x60/);
  assert.match(run(t, edit('README.md', (text) => text.replace('removes another.', 'removes another.\n- \x60baz\x60 too.'))).join(), /README\.md:\d+: the Problem list names \x60baz\x60, which is no catalog skill/);
  const swapped = (text) => text.replace('- \x60foo\x60 removes one thing,\n- \x60re0-upgrade\x60 removes another.', '- \x60re0-upgrade\x60 removes another,\n- \x60foo\x60 removes one thing.');
  assert.match(run(t, edit(ko, swapped)).join(), /README\.ko\.md: the Problem list names the skills as \[re0-upgrade, foo\], out of catalog order/);
  assert.match(run(t, edit(ko, (text) => text.replace('<a id="the-problem"></a>', ''))).join(), /README\.ko\.md: has no Problem section/);
});

test('a brand line that differs and an .npmignore fail', (t) => {
  const problems = run(t, { 'package.json': JSON.stringify({ description: 'Other.' }), '.npmignore': 'x\n' });
  assert.match(problems.join(), /description differs from package\.json/);
  assert.match(problems.join(), /\.npmignore: publishing reads \.gitignore/);
});

test('plugin.json that is not JSON fails with a problem, not a crash', (t) => {
  assert.match(run(t, { '.claude-plugin/plugin.json': BASE['.claude-plugin/plugin.json'] + ',' }).join(), /plugin\.json: is not valid JSON/);
});
