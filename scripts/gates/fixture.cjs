'use strict';
// A throwaway git repository holding a small valid catalog (foo, model-invoked; re0-upgrade, user-invoked) with any file replaced or removed (null), deleted when the test ends. The Korean README words each Index cell its own way, in Hangul.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const INSTALL = "npx skills@latest add LilMGenius/paperthin --global --agent '*' && node \"$HOME/.agents/skills/re0-upgrade/scripts/schedule/schedule.mjs\" install";
const skill = (name, description, extra = '') => '---\nname: ' + name + '\ndescription: "' + description + '"\n' + extra + '---\n\nOne line.\n\n## Goal\n\n## Workflow\n\n## Rules\n\n## Verification\n';
const readme = (switcher, up, model, user, what) => [
  '# Paperthin', '', '<sub>Read in: ' + switcher + '</sub>', '', '## Quickstart', '', '\x60\x60\x60bash', INSTALL, '\x60\x60\x60', '', 'Then run \x60/re0-upgrade\x60.', '',
  '## The Index', '', '| Skill | What | Invoker | Read-only |', '|---|---|---|---|',
  '| **[foo](' + up + 'skills/depth/foo/SKILL.md)** | ' + what[0] + ' | ' + model + ' | |',
  '| **[re0-upgrade](' + up + 'skills/breadth/re0-upgrade/SKILL.md)** | ' + what[1] + ' | ' + user + ' | |', '',
].join('\n');

const BASE = {
  '.gitignore': '*.local*\n',
  'package.json': JSON.stringify({ version: '0.1.0', description: 'One line.' }),
  '.claude-plugin/plugin.json': JSON.stringify({ name: 'paperthin', version: '0.1.0', description: 'One line.', skills: ['./skills/depth/foo', './skills/breadth/re0-upgrade'] }),
  '.claude-plugin/marketplace.json': JSON.stringify({ name: 'paperthin', owner: { name: 'x' }, plugins: [{ name: 'paperthin', source: './', description: 'One line.' }] }),
  'skills/depth/foo/SKILL.md': skill('foo', 'Do foo. Use when foo is due.'),
  'skills/depth/foo/agents/openai.yaml': 'interface:\n  display_name: "foo"\n  short_description: "Do foo whenever foo is due"\n  default_prompt: "Use $foo on this."\n',
  'skills/breadth/re0-upgrade/SKILL.md': skill('re0-upgrade', 'Install the current catalog.', 'disable-model-invocation: true\n') + '\n## Deprecations\n\n| Deprecated | Renamed to | Since |\n| --- | --- | --- |\n| \x60bar\x60 | \x60foo\x60 | 0.1.0 |\n\n## Current catalog\n\n\x60foo\x60, \x60re0-upgrade\x60\n',
  'skills/breadth/re0-upgrade/agents/openai.yaml': 'interface:\n  display_name: "re0-upgrade"\n  short_description: "Install the current catalog"\n  default_prompt: "Use $re0-upgrade to update."\npolicy:\n  allow_implicit_invocation: false\n',
  '.agents/install-block.md': '<canonical-block name="install">\n\n\x60\x60\x60bash\n' + INSTALL + '\n\x60\x60\x60\n\n</canonical-block>\n',
  'README.md': readme('English · [한국어](./assets/i18n/README.ko.md)', './', 'model', 'user', ['Does foo', 'Installs the catalog']),
  'assets/i18n/README.ko.md': readme('[English](../../README.md) · 한국어', '../../', '모델', '사용자', ['푸를 처리합니다', '카탈로그를 설치합니다']),
};

function fixture(t, files = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'paperthin-gate-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const [rel, body] of Object.entries({ ...BASE, ...files })) {
    if (body === null) continue;
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), body);
  }
  execFileSync('git', ['init', '-q'], { cwd: root });
  return root;
}

const edit = (rel, change) => ({ [rel]: change(BASE[rel]) });
const messages = (problems) => problems.map((p) => p.file + (p.line ? ':' + p.line : '') + ': ' + p.message);

module.exports = { fixture, edit, messages, skill, BASE };
