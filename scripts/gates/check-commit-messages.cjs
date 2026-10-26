#!/usr/bin/env node
'use strict';
/*
 * Commit message form check. AGENTS.md's Commit messages section owns the rules; this script
 * checks only what a machine can decide: the subject's type(scope) shape, case, period and
 * length, a body made of single-line bullets, and an optional closing paragraph of
 * Co-authored-by trailers that credit a human contributor on a squashed or carried
 * contribution. Whether a bullet says something worth keeping stays a reviewer's judgment.
 * Run from ci.yml and locally with a revision range.
 */

const { spawnSync } = require('child_process');

const TYPES = ['feat', 'fix', 'docs', 'refactor', 'chore', 'ci'];
const SUBJECT = new RegExp('^(' + TYPES.join('|') + ')\\(([a-z0-9][a-z0-9.-]*)\\): (.+)$');
const MAX_SUBJECT = 72;
const TRAILER = /^Co-authored-by: (.+) <([^<>\s]+@[^<>\s]+)>$/;
// A machine co-author: an agent or assistant by name, a [bot] account, or a provider noreply
// address. A person's GitHub noreply address (<id>+<login>@users.noreply.github.com) passes.
const MACHINE = /\b(claude|codex|copilot|chatgpt|openai|anthropic|gemini|cursor|devin|sisyphus)\b|\[bot\]|^noreply@|^no-reply@/i;

function checkMessage(message) {
  const problems = [];
  const lines = message.replace(/\r\n/g, '\n').replace(/\s+$/, '').split('\n');
  const subject = lines[0];
  const match = SUBJECT.exec(subject);
  if (!match) problems.push('subject is not type(scope): description');
  else if (!/^[a-z0-9\x60]/.test(match[3])) problems.push('description does not start lowercase');
  if (/\.$/.test(subject)) problems.push('subject ends with a period');
  if (subject.length > MAX_SUBJECT) problems.push('subject is ' + subject.length + ' characters, over ' + MAX_SUBJECT);
  if (lines.length > 1 && lines[1] !== '') problems.push('no blank line after the subject');
  let body = lines.slice(2);
  const lastBreak = body.lastIndexOf('');
  const closing = body.slice(lastBreak + 1);
  if (closing.length && closing.every((line) => TRAILER.test(line))) {
    body = body.slice(0, Math.max(lastBreak, 0));
    for (const line of closing) {
      const [, name, email] = TRAILER.exec(line);
      if (MACHINE.test(name) || MACHINE.test(email)) problems.push('co-author is not a human contributor: ' + line.slice(0, 60));
    }
  }
  for (const line of body) {
    if (!line.trim()) continue;
    if (!line.startsWith('- ')) problems.push('body line is not a bullet: ' + line.slice(0, 60));
    else if (/(^|[^.])\.$/.test(line)) problems.push('bullet ends with a period: ' + line.slice(0, 60));
  }
  return problems;
}

function main() {
  const range = process.argv[2];
  if (!range) {
    console.error('usage: node scripts/gates/check-commit-messages.cjs <revision-range>');
    process.exit(2);
  }
  const git = spawnSync('git', ['log', '--no-merges', '--format=%h%x00%B%x1e', range], { encoding: 'utf8' });
  if (git.status !== 0) {
    console.error('::error::cannot read commit range ' + range + ': ' + (git.stderr || '').trim().split('\n')[0]);
    process.exit(2);
  }
  const log = git.stdout;
  let failed = 0;
  let checked = 0;
  for (const entry of log.split('\x1e')) {
    const trimmed = entry.replace(/^\n+/, '');
    if (!trimmed) continue;
    const [sha, message] = trimmed.split('\x00');
    checked++;
    const problems = checkMessage(message);
    if (!problems.length) continue;
    failed++;
    console.error('::error::' + sha + ' ' + message.split('\n')[0]);
    for (const problem of problems) console.error('  ' + problem);
  }
  console.log('check-commit-messages: ' + checked + ' checked, ' + failed + ' failed');
  if (failed) process.exit(1);
}

if (require.main === module) main();

module.exports = { checkMessage };
