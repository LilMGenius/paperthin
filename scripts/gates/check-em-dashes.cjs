#!/usr/bin/env node
'use strict';
/*
 * Em-dash guard. AGENTS.md bans the em-dash from this repo's prose; this check holds the tracked
 * files it can already hold to that: every SKILL.md and skill script, .agents/, AGENTS.md, scripts/
 * and .github/. The READMEs and the brand one-liner join once they are rewritten. A regex that has to
 * match one spells it \u2014.
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const scope = ['skills', '.agents', 'AGENTS.md', 'scripts', '.github'];
const files = execFileSync('git', ['-c', 'core.quotePath=false', 'ls-files', '--cached', '--others', '--exclude-standard', '--', ...scope], { cwd: root, encoding: 'utf8' })
  .split('\n').filter(Boolean);

let hits = 0;
for (const rel of files) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file) || fs.lstatSync(file).isSymbolicLink()) continue;
  fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (line.includes('\u2014')) {
      console.error('::error::' + rel + ':' + (i + 1) + ': em-dash; rewrite the sentence with the punctuation it wants');
      hits++;
    }
  });
}
if (hits) process.exit(1);
console.log('em-dash guard OK: ' + files.length + ' files');
