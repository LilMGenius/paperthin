'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { check } = require('./prose.cjs');
const { fixture, edit, messages } = require('./fixture.cjs');

const run = (t, files) => messages(check(fixture(t, files)));

test('a valid catalog passes', (t) => {
  assert.deepEqual(run(t), []);
});

test('an em-dash in a skill fails, and one outside the scope or escaped passes', (t) => {
  assert.match(run(t, edit('skills/depth/foo/SKILL.md', (text) => text + 'one \u2014 two\n')).join(), /SKILL\.md:\d+: em-dash/);
  assert.deepEqual(run(t, { 'NOTES.md': 'one \u2014 two\n', 'scripts/x.cjs': 'const re = /\\u2014/;\n' }), []);
});

test('a README, translation or brand line fails on an in-sentence dash and keeps a label-slot one', (t) => {
  const add = (rel, line) => edit(rel, (text) => text + line + '\n');
  assert.match(run(t, add('README.md', 'It **adds** \u2014 more files.')).join(), /README\.md:\d+: in-sentence U\+2014 at column \d+/);
  assert.match(run(t, add('assets/i18n/README.ko.md', '\uC5D0\uC774\uC804\uD2B8\uB294 \u2013 \uB354\uD569\uB2C8\uB2E4.')).join(), /README\.ko\.md:\d+: in-sentence U\+2013 at column \d+/);
  assert.match(run(t, { 'package.json': JSON.stringify({ description: 'On its own\u2014on any agent.' }) }).join(), /package\.json:1: in-sentence U\+2014 at column \d+/);
  const labels = ['- **Setup** \u2014 we asked.', '### #1 \u2014 Artifacts rot', '<img alt="Paperthin \u2014 Trust the artifact." src="x.svg">', 'Years 1990\u20132000.'].join('\n');
  assert.deepEqual(run(t, add('README.md', labels)), []);
  assert.deepEqual(run(t, { 'assets/banner.svg': '<svg aria-label="Paperthin \u2014 Trust the artifact."></svg>\n' }), []);
});

test('an unpinned npx skills and a translation without the install command fail', (t) => {
  assert.match(run(t, { 'NOTES.md': 'run npx skills update\n' }).join(), /NOTES\.md:1: spell the CLI npx skills@latest/);
  assert.match(run(t, edit('assets/i18n/README.ko.md', (text) => text.replace(' --global', ''))).join(), /README\.ko\.md: does not carry the install command/);
});

test('a backticked name one affix from a skill fails in a tracked file, never in a gitignored draft', (t) => {
  assert.match(run(t, { 'NOTES.md': 'next: \x60foo-next\x60\n' }).join(), /\x60foo-next\x60 is one affix from the skill foo/);
  assert.deepEqual(run(t, { 'TODO.local.md': 'next: \x60foo-next\x60\n' }), []);
});

test('a real PR number, handle or SHA in a durable doc fails, and the generic form passes', (t) => {
  const line = (text) => edit('skills/depth/foo/SKILL.md', (body) => body + text + '\n');
  assert.match(run(t, line('Fixed in (#42, @octocat).')).join(), /\(#42 is a real PR or issue number/);
  assert.match(run(t, line('Fixed by @octocat.')).join(), /@octocat is a real handle/);
  assert.match(run(t, line('Landed as 3b42f3d.')).join(), /3b42f3d is a commit SHA/);
  assert.deepEqual(run(t, line('Credit inline (\x60(#123, @handle)\x60); patterns #3 through #5 apply.')), []);
  assert.deepEqual(run(t, { 'NOTES.md': 'Fixed in (#42, @octocat).\n' }), []);
});
