#!/usr/bin/env node
'use strict';
// llms.txt, the plain-text entry for a web chat handed this repository's address (the llmstxt.org shape). GitHub's robots.txt bars /*/raw/ and /*/tree/ and a blob page is hundreds of KB of HTML with relative links, so llms.txt lists the README and every skill with its description at its absolute raw URL. There is no llms-full.txt: a 337 KB file carrying every SKILL.md pushed Anthropic's plugin directory Validate past its time limit (504 at 47 s with it, 200 at 20 s without, 2026-11-11). Adapted from LilMGenius/openflirt scripts/lib/llms.mjs (d722425): the listed set here is the plugin manifest's skill list instead of a lecture registry, and the generator and the gate are one CommonJS file to sit beside the other gates.
// node scripts/gates/llms.cjs writes the file when it differs; --check writes nothing and exits 1 naming it stale; --root builds another checkout.
const fs = require('node:fs');
const path = require('node:path');
const { read, problem } = require('./repo.cjs');

const BASE_URL = 'https://raw.githubusercontent.com/LilMGenius/paperthin/main/';
const COMMAND = 'node scripts/gates/llms.cjs';

const rawUrl = (file) => BASE_URL + file;

function frontmatterField(text, field) {
  const head = /^---\n([\s\S]*?)\n---/.exec(text);
  const line = head && head[1].split('\n').find((l) => l.startsWith(field + ':'));
  return line ? line.slice(field.length + 1).trim().replace(/^"(.*)"$/, '$1') : '';
}

// The file as the generator writes it. The skill list is the plugin manifest's, which the catalog gate holds to the README index.
function build(root) {
  const manifest = JSON.parse(read(root, '.claude-plugin/plugin.json'));
  const skills = manifest.skills.map((dir) => path.posix.join(dir.replace(/^\.\//, ''), 'SKILL.md')).filter((file) => fs.existsSync(path.join(root, file)));
  const entry = (file, description) => '- [' + file + '](' + rawUrl(file) + '): ' + description;
  const index = [
    '# paperthin',
    '',
    '> ' + manifest.description,
    '',
    'Every file below is at its absolute raw address, so a tool reading this repository over the web fetches the README or any skill directly.',
    '',
    '## Start here',
    '',
    entry('README.md', 'what paperthin is, how to install it, and the index of every skill'),
    '',
    '## Skills',
    '',
    ...skills.map((file) => entry(file, frontmatterField(read(root, file), 'description'))),
    '',
  ];
  return { 'llms.txt': index.join('\n').replace(/\n*$/, '\n') };
}

// The committed file must equal what build writes; a problem names the first line that differs.
function check(root) {
  return Object.entries(build(root)).flatMap(([file, built]) => {
    if (!fs.existsSync(path.join(root, file))) return [problem(file, 1, 'missing; run ' + COMMAND)];
    const have = fs.readFileSync(path.join(root, file), 'utf8').split('\n');
    const want = built.split('\n');
    if (have.join('\n') === want.join('\n')) return [];
    let line = 0;
    while (line < have.length && have[line] === want[line]) line += 1;
    return [problem(file, line + 1, 'differs from what ' + COMMAND + ' builds; run it and commit the result')];
  });
}

module.exports = { build, check, BASE_URL };

if (require.main === module) {
  const args = process.argv.slice(2);
  const at = args.indexOf('--root');
  const root = at >= 0 ? path.resolve(args[at + 1] || '') : path.join(__dirname, '..', '..');
  const unknown = args.filter((a, i) => a !== '--check' && a !== '--root' && args[i - 1] !== '--root');
  if (unknown.length || (at >= 0 && !args[at + 1])) {
    process.stderr.write('usage: node scripts/gates/llms.cjs [--check] [--root <dir>]\n');
    process.exit(2);
  }
  const stale = Object.entries(build(root)).filter(([file, text]) => !fs.existsSync(path.join(root, file)) || fs.readFileSync(path.join(root, file), 'utf8') !== text);
  if (args.includes('--check')) {
    for (const [file] of stale) process.stderr.write(file + ' is stale; run ' + COMMAND + '\n');
    process.exit(stale.length ? 1 : 0);
  }
  for (const [file, text] of stale) {
    fs.writeFileSync(path.join(root, file), text);
    process.stdout.write('wrote ' + file + '\n');
  }
}
