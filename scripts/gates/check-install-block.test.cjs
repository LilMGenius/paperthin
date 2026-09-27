'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync, execFileSync } = require('node:child_process');
const { test } = require('node:test');

const source = path.join(__dirname, 'check-install-block.cjs');
const command = "npx skills@latest add LilMGenius/paperthin --global --agent '*'";
const block = '<canonical-block name="install">\n\n```bash\n' + command + '\n```\n\n</canonical-block>\n';
const readme = '```bash\n' + command + '\n```\nThen run `/re0-upgrade`.\n';

function fixture(files) {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'install-block-'));
  const all = { '.agents/install-block.md': block, 'README.md': readme, 'assets/i18n/README.ko.md': readme, ...files };
  fs.mkdirSync(path.join(repo, 'scripts', 'gates'), { recursive: true });
  fs.copyFileSync(source, path.join(repo, 'scripts', 'gates', 'check-install-block.cjs'));
  for (const [name, body] of Object.entries(all)) {
    fs.mkdirSync(path.dirname(path.join(repo, name)), { recursive: true });
    fs.writeFileSync(path.join(repo, name), body);
  }
  execFileSync('git', ['init', '-q'], { cwd: repo });
  return repo;
}

function check(repo) {
  return spawnSync(process.execPath, ['scripts/gates/check-install-block.cjs'], { cwd: repo, encoding: 'utf8' });
}

function withFixture(files, assertions) {
  const repo = fixture(files);
  try {
    assertions(check(repo));
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
}

test('READMEs that carry the install command and /re0-upgrade pass', () => {
  withFixture({}, (run) => assert.equal(run.status, 0, run.stderr));
});

test('a translation that drops the install command fails', () => {
  withFixture({ 'assets/i18n/README.ko.md': 'npx skills@latest add LilMGenius/paperthin\nThen run `/re0-upgrade`.\n' }, (run) => {
    assert.equal(run.status, 1);
    assert.match(run.stderr, /README\.ko\.md: does not carry the install command/);
  });
});

test('an unpinned npx skills in any Markdown file fails', () => {
  withFixture({ 'skills/depth/foo/SKILL.md': 'run `npx skills update foo`\n' }, (run) => {
    assert.equal(run.status, 1);
    assert.match(run.stderr, /SKILL\.md:1: spell the CLI npx skills@latest/);
  });
});
