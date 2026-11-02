'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync, execFileSync } = require('node:child_process');
const { test } = require('node:test');

const source = path.join(__dirname, 'check-em-dashes.cjs');

function run(files) {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'em-dashes-'));
  try {
    fs.mkdirSync(path.join(repo, 'scripts', 'gates'), { recursive: true });
    fs.copyFileSync(source, path.join(repo, 'scripts', 'gates', 'check-em-dashes.cjs'));
    for (const [name, body] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(repo, name)), { recursive: true });
      fs.writeFileSync(path.join(repo, name), body);
    }
    execFileSync('git', ['init', '-q'], { cwd: repo });
    return spawnSync(process.execPath, ['scripts/gates/check-em-dashes.cjs'], { cwd: repo, encoding: 'utf8' });
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
}

test('an em-dash in a skill fails', () => {
  const result = run({ 'skills/depth/foo/SKILL.md': 'one idea \u2014 another\n' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /SKILL\.md:1: em-dash/);
});

test('an escaped em-dash in a regex and an em-dash outside the scope pass', () => {
  const result = run({ 'scripts/gates/x.cjs': 'const re = /a \\u2014 b/;\n', 'README.md': 'one idea \u2014 another\n' });
  assert.equal(result.status, 0, result.stderr);
});
