'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

const root = path.join(__dirname, '..', '..');
const files = ['scripts/gates/check-catalog-sync.cjs', 'scripts/runtime/catalog.cjs', 'skills/breadth/re0-upgrade/SKILL.md', '.claude-plugin/plugin.json', 'README.md'];

function copy(editReadme) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'catalog-sync-'));
  for (const name of files) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    fs.copyFileSync(path.join(root, name), path.join(dir, name));
  }
  const readme = path.join(dir, 'README.md');
  fs.writeFileSync(readme, editReadme(fs.readFileSync(readme, 'utf8')));
  return dir;
}

function run(dir) {
  return spawnSync(process.execPath, [path.join(dir, 'scripts/gates/check-catalog-sync.cjs')], { encoding: 'utf8' });
}

function indexRows(text) {
  const index = text.indexOf('## The Index');
  return [...text.slice(index).matchAll(/^\|[^\n]*\*\*\[([a-z0-9-]+)\]\([^)]*\/SKILL\.md\)\*\*[^\n]*$/gm)];
}

test('skill rows in a table outside the Index do not count as roster order', () => {
  const dir = copy((text) => text.replace('## The Index', '## Elsewhere\n\n| 🥄 **[sip](./skills/depth/sip/SKILL.md)** | x |\n| ♻️ **[re0](./skills/depth/re0/SKILL.md)** | x |\n\n## The Index'));
  try {
    const result = run(dir);
    assert.equal(result.status, 0, result.stderr);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('two Index rows out of catalog order fail', () => {
  const dir = copy((text) => {
    const [first, second] = indexRows(text);
    return text.replace(first[0], '\u0000').replace(second[0], first[0]).replace('\u0000', second[0]);
  });
  try {
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /README\.md index lists the roster in a different order/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
