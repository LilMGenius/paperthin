'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync, execFileSync } = require('node:child_process');
const { test } = require('node:test');

const source = path.join(__dirname, 'check-skill-refs.sh');

function bashPath() {
  if (process.platform !== 'win32') return 'bash';
  const core = execFileSync('git', ['--exec-path'], { encoding: 'utf8' }).trim();
  return path.join(core, '..', '..', '..', 'bin', 'bash.exe');
}

function fixture(files) {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-refs-'));
  const write = (name, body) => {
    fs.mkdirSync(path.dirname(path.join(repo, name)), { recursive: true });
    fs.writeFileSync(path.join(repo, name), body);
  };
  write('scripts/gates/check-skill-refs.sh', fs.readFileSync(source));
  write('skills/depth/foo/SKILL.md', '---\nname: foo\n---\n');
  write('README.md', '| [foo](./skills/depth/foo/SKILL.md) |\n');
  write('.gitignore', '*.local*\n');
  for (const [name, body] of Object.entries(files)) write(name, body);
  execFileSync('git', ['init', '-q'], { cwd: repo });
  execFileSync('git', ['-c', 'core.autocrlf=false', 'add', '-A'], { cwd: repo });
  return repo;
}

function check(repo) {
  return spawnSync(bashPath(), ['scripts/gates/check-skill-refs.sh'], { cwd: repo, encoding: 'utf8' });
}

test('a gitignored draft naming a planned skill is not scanned', () => {
  const repo = fixture({ 'TODO.local.md': 'next: build \x60foo-next\x60\n' });
  try {
    const run = check(repo);
    assert.equal(run.status, 0, run.stdout + run.stderr);
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
});

test('the same near-miss name in a tracked doc still fails', () => {
  const repo = fixture({ 'NOTES.md': 'next: build \x60foo-next\x60\n' });
  try {
    const run = check(repo);
    assert.equal(run.status, 1);
    assert.match(run.stdout, /NOTES\.md: backticked '\x60foo-next\x60'/);
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
});

test('an untracked doc that is not ignored is scanned', () => {
  const repo = fixture({});
  try {
    fs.mkdirSync(path.join(repo, 'docs'), { recursive: true });
    fs.writeFileSync(path.join(repo, 'docs', 'draft.md'), 'see \x60foo-next\x60\n');
    const run = check(repo);
    assert.equal(run.status, 1);
    assert.match(run.stdout, /docs\/draft\.md/);
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
});

test('a doc with a non-ASCII name is scanned', () => {
  const repo = fixture({ 'docs/노트.md': 'see \x60foo-next\x60\n' });
  try {
    const run = check(repo);
    assert.equal(run.status, 1);
    assert.match(run.stdout, /docs\/노트\.md: backticked/);
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
});
