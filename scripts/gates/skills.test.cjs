'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { check } = require('./skills.cjs');
const { fixture, edit, messages, skill } = require('./fixture.cjs');

const run = (t, files) => messages(check(fixture(t, files)));

test('a valid catalog passes', (t) => {
  assert.deepEqual(run(t), []);
});

test('a plain description holding ": " fails at its line and column under YAML', (t) => {
  const [message] = run(t, edit('skills/depth/foo/SKILL.md', (text) => text.replace('"Do foo. Use when foo is due."', 'Do foo: builds and tips.')));
  assert.match(message, /^skills\/depth\/foo\/SKILL\.md:3: column \d+: not valid YAML 1\.1/);
});

test('a name that is not its directory fails', (t) => {
  assert.match(run(t, edit('skills/depth/foo/SKILL.md', (text) => text.replace('name: foo', 'name: food'))).join(), /does not match its directory foo/);
});

test('a lane set in SKILL.md but not in agents/openai.yaml fails', (t) => {
  assert.match(run(t, { 'skills/breadth/re0-upgrade/agents/openai.yaml': 'interface:\n  display_name: "x"\n  short_description: "x"\n' }).join(), /must pair with disable-model-invocation/);
});

test('a missing agents/openai.yaml and a missing section fail', (t) => {
  const problems = run(t, { 'skills/depth/foo/agents/openai.yaml': null, 'skills/depth/foo/SKILL.md': skill('foo', 'Do foo.').replace('## Rules\n', '') });
  assert.match(problems.join(), /openai\.yaml: missing/);
  assert.match(problems.join(), /missing the ## Rules section/);
});

test('a user-invoked description with "Use when" triggers fails', (t) => {
  assert.match(run(t, edit('skills/breadth/re0-upgrade/SKILL.md', (text) => text.replace('Install the current catalog.', 'Install. Use when asked.'))).join(), /user-invoked description/);
});

test('a Skill tool call naming a user-invoked skill fails, and one naming a model-invoked skill passes', (t) => {
  const call = (name) => edit('skills/depth/foo/SKILL.md', (text) => text.replace('## Workflow\n', '## Workflow\n\n1. Call the Skill tool with "' + name + '".\n'));
  assert.match(run(t, call('re0-upgrade')).join(), /SKILL\.md:\d+: calls the Skill tool with "re0-upgrade", which is user-invoked/);
  assert.deepEqual(run(t, call('foo')), []);
});

test('a ../ link out of a skill fails', (t) => {
  assert.match(run(t, edit('skills/depth/foo/SKILL.md', (text) => text + '\nSee [bar](../bar/SKILL.md).\n')).join(), /deep cross-file reference/);
});

test('a bundled script that does not parse fails', (t) => {
  assert.match(run(t, { 'skills/depth/foo/scripts/x.mjs': 'export const = 1;\n' }).join(), /scripts\/x\.mjs: does not parse/);
});
// The Codex rules in skills.cjs were ported from this file; a different installed copy means the host changed them, so re-read it, port the change, then move the pin.
const QUICK_VALIDATE = path.join(os.homedir(), '.codex', 'skills', '.system', 'skill-creator', 'scripts', 'quick_validate.py');
const QUICK_VALIDATE_SHA256 = '6068513d924ed3559e186dfcdead7439129828dcf402167fd925c06dffbf2806';

test('the installed quick_validate.py is the copy the Codex rules were ported from', (t) => {
  if (!fs.existsSync(QUICK_VALIDATE)) return t.skip('no Codex install here, so there is no copy to compare');
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(QUICK_VALIDATE)).digest('hex'), QUICK_VALIDATE_SHA256);
});

test('the Codex description and placeholder rules fail what quick_validate.py rejects', (t) => {
  const description = (text) => edit('skills/depth/foo/SKILL.md', (body) => body.replace('Do foo. Use when foo is due.', text));
  assert.match(run(t, description('Plan -> build -> check.')).join(), /angle bracket/);
  assert.match(run(t, description('[TODO: describe foo]')).join(), /unfinished \[TODO: placeholder/);
  assert.match(run(t, edit('skills/depth/foo/SKILL.md', (body) => body.replace('name: foo', 'name: foo\nversion: 1'))).join(), /frontmatter key version/);
  assert.match(run(t, edit('skills/depth/foo/SKILL.md', (body) => body + '\n[TODO: steps]\n')).join(), /SKILL\.md:\d+: unfinished \[TODO: placeholder/);
  assert.deepEqual(run(t, edit('skills/depth/foo/SKILL.md', (body) => body + '\n\x60\x60\x60md\n[TODO: steps]\n\x60\x60\x60\n')), []);
});
