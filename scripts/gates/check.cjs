#!/usr/bin/env node
'use strict';
// The release gate: every deterministic rule AGENTS.md names, run by npm run check locally and in CI. Each failure prints as file:line, and as an annotation on GitHub.
const path = require('node:path');

const gates = ['skills', 'catalog', 'links', 'prose'];
const root = path.join(__dirname, '..', '..');
let failed = 0;
for (const name of gates) {
  const problems = require('./' + name + '.cjs').check(root);
  for (const { file, line, message } of problems) {
    const where = file + (line ? ':' + line : '');
    console.error(process.env.GITHUB_ACTIONS ? '::error file=' + file + (line ? ',line=' + line : '') + '::' + where + ': ' + message : where + ': ' + message);
  }
  console.log(name + ': ' + (problems.length ? problems.length + ' problem(s)' : 'ok'));
  failed += problems.length;
}
process.exit(failed ? 1 : 0);
