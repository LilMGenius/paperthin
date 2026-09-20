#!/usr/bin/env node
'use strict';
/*
 * TODO casebook and execution-plan drift guard.
 * Follows check-catalog-sync.cjs's local checker and error-reporting convention.
 * Execution coverage is advisory; missing casebooks and oversized unowned entries fail.
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const md = fs.readFileSync(path.join(root, 'TODO.local.md'), 'utf8');
const links = (text) => [...text.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1].trim());
const entries = md.split(/\r?\n/).flatMap((line) => {
  const match = line.match(/^\*\*(.+?)\*\*(.*?) — \*\*(진행|통합실험|보류|기각|외부)\*\*/);
  return match ? [{ name: match[1], status: match[3], line, links: links(line) }] : [];
});
const planDir = path.join(root, '.omo', 'plans');
const titles = fs.existsSync(planDir) ? fs.readdirSync(planDir).filter((name) => name.endsWith('.md')).sort().flatMap((name) =>
  [...fs.readFileSync(path.join(planDir, name), 'utf8').matchAll(/^- \[[ x]\] (\d+[a-z]?|F\d+)\. (.+)$/gm)].map((m) => m[2].toLowerCase())
) : [];
let fail = 0;
let warn = 0;
console.log('check | subject | result');
console.log('--- | --- | ---');
function row(check, subject, result, detail = '') {
  if (result === 'FAIL') fail++;
  if (result === 'WARN') warn++;
  console.log(`${result === 'FAIL' ? '::error::' : ''}${check} | ${subject} | ${result}${detail ? ' ' + detail : ''}`);
}

for (const entry of entries.filter((entry) => ['진행', '통합실험'].includes(entry.status))) {
  const targets = entry.links.filter((target) => target.includes('.re0/iteration/'));
  const unresolved = targets.filter((target) => {
    const p = path.resolve(root, target.replace(/^\.\//, '').split(/[?#]/)[0]);
    return !(fs.existsSync(p) && fs.statSync(p).isFile());
  });
  row('casebook-link', entry.name, targets.length && !unresolved.length ? 'PASS' : 'FAIL',
    !targets.length ? 'missing casebook link' : unresolved.length ? 'unresolved: ' + unresolved.join(', ') : '');
}

const iterationDir = path.join(root, '.re0', 'iteration');
for (const dir of fs.readdirSync(iterationDir, { withFileTypes: true }).filter((dir) => dir.isDirectory() && dir.name.startsWith('v')).map((dir) => dir.name).sort()) {
  const owned = entries.some((entry) => entry.links.some((target) => target.includes(`.re0/iteration/${dir}/`)));
  row('casebook-owned', dir, owned ? 'PASS' : 'FAIL', owned ? '' : 'unowned');
}

for (const entry of entries.filter((entry) => entry.status === '진행')) {
  const names = entry.name.toLowerCase().split('→').map((name) => name.trim());
  const found = titles.some((title) => names.some((name) => title.includes(name)));
  row('execution-row', entry.name, found ? 'PASS' : 'WARN', found ? '' : 'no execution row');
}

for (const entry of entries.filter((entry) => ['진행', '통합실험'].includes(entry.status))) {
  const bytes = Buffer.byteLength(entry.line, 'utf8');
  if (bytes > 600 && !entry.links.some((target) => target.includes('.re0/iteration/'))) {
    row('oversize', entry.name, 'FAIL', `${bytes} bytes`);
  }
}
console.log(`check-todo-sync: ${fail} fail, ${warn} warn`);
if (fail) process.exit(1);
