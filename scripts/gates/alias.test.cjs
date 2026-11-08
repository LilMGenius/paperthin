'use strict';
// The paperthin skill is an alias a stranger types instead of learning the catalog: it hands the request to re0-workflow and does nothing else, and re0-workflow never routes back to it, so the alias adds no behavior and no loop. Read from the repository's own skills through the gate's call parser.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { test } = require('node:test');
const { edges } = require('./skills.cjs');

const root = path.join(__dirname, '..', '..');

test('the paperthin alias makes one Skill tool call, to re0-workflow, and nothing else', () => {
  const calls = edges(root).filter((edge) => edge.from === 'paperthin').map(({ to, prose }) => ({ to, prose }));
  assert.deepEqual(calls, [{ to: 're0-workflow', prose: false }]);
});

test('re0-workflow never depends on itself or on its alias', () => {
  assert.deepEqual(edges(root).filter((edge) => edge.from === 're0-workflow' && ['re0-workflow', 'paperthin'].includes(edge.to)), []);
});


// A planted call in a copy of the real skills folder, written as a bare word, must show up as an edge, or the alias test above could pass over a second call.
test('a bare-word call planted in the alias is seen as a second edge', (t) => {
  const copy = fs.mkdtempSync(path.join(os.tmpdir(), 'paperthin-alias-'));
  t.after(() => fs.rmSync(copy, { recursive: true, force: true }));
  fs.cpSync(path.join(root, 'skills'), path.join(copy, 'skills'), { recursive: true });
  execFileSync('git', ['init', '-q'], { cwd: copy });
  const file = path.join(copy, 'skills', 'coil', 'paperthin', 'SKILL.md');
  const text = fs.readFileSync(file, 'utf8');
  assert.ok(text.includes('\n\n## Rules'));
  fs.writeFileSync(file, text.replace('\n\n## Rules', '\n2. Then run nba on the result.\n\n## Rules'));
  assert.deepEqual(edges(copy).filter((edge) => edge.from === 'paperthin').map(({ to }) => to), ['re0-workflow', 'nba']);
});
