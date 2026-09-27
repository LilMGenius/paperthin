#!/usr/bin/env node
'use strict';
/*
 * Install wording drift-guard. .agents/install-block.md owns the install story; README.md and every
 * translation copy its install command verbatim and point at /re0-upgrade, and every Markdown file
 * spells the CLI as npx skills@latest, the pinned spelling re0-upgrade also carries inline.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..', '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const block = read('.agents/install-block.md').match(/<canonical-block name="install">[\s\S]*?```bash\r?\n(.+)\r?\n```/);
if (!block) {
  console.error('::error::.agents/install-block.md has no install canonical block with a bash command');
  process.exit(1);
}
const command = block[1].trim();

const readmes = ['README.md', ...fs.readdirSync(path.join(root, 'assets', 'i18n')).filter((f) => /^README\..+\.md$/.test(f)).map((f) => 'assets/i18n/' + f)];
const markdown = execFileSync('git', ['-c', 'core.quotePath=false', 'ls-files', '--cached', '--others', '--exclude-standard', '--', '*.md'], { cwd: root, encoding: 'utf8' })
  .split('\n').filter(Boolean);

let fail = 0;
const err = (msg) => { console.error('::error::' + msg); fail++; };
for (const rel of readmes) {
  const text = read(rel);
  if (!text.includes(command)) err(rel + ': does not carry the install command from .agents/install-block.md: ' + command);
  if (!text.includes('/re0-upgrade')) err(rel + ': does not point at /re0-upgrade for updates');
}
for (const rel of markdown) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file) || fs.lstatSync(file).isSymbolicLink()) continue;
  read(rel).split('\n').forEach((line, i) => {
    if (/npx skills(?!@latest)\b/.test(line)) err(rel + ':' + (i + 1) + ': spell the CLI npx skills@latest');
  });
}

if (fail) process.exit(1);
console.log('install block OK: ' + readmes.length + ' READMEs carry "' + command + '"; npx skills@latest across ' + markdown.length + ' Markdown files');
