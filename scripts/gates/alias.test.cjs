'use strict';
// The paperthin skill is an alias a stranger types instead of learning the catalog: it hands the request to re0-workflow and does nothing else, and re0-workflow never routes back to it, so the alias adds no behavior and no loop. Read from the repository's own skills through the gate's call parser.
const assert = require('node:assert/strict');
const path = require('node:path');
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

