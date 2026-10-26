'use strict';
// Reads shared by every gate. Files come from git so a gate sees what a clean checkout carries: gitignored local drafts stay out, and an untracked file that is not ignored is checked before it is added.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

function listFiles(root, ...pathspecs) {
  return execFileSync('git', ['-c', 'core.quotePath=false', 'ls-files', '--cached', '--others', '--exclude-standard', '--', ...pathspecs], { cwd: root, encoding: 'utf8' })
    .split('\n')
    .filter((rel) => rel && isFile(root, rel))
    .sort();
}

// A symlink such as CLAUDE.md is a second name for a file already listed, so it is skipped.
function isFile(root, rel) {
  const full = path.join(root, rel);
  return fs.existsSync(full) && fs.lstatSync(full).isFile();
}

function read(root, rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n');
}

function problem(file, line, message) {
  return { file, line, message };
}

module.exports = { listFiles, isFile, read, problem };
