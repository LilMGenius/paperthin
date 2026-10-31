#!/usr/bin/env node
'use strict';
// llms.txt and llms-full.txt, the plain-text entry for a web chat handed this repository's address (the llmstxt.org shape). A chat tool fetches the file it is pointed at but rarely the files it links, GitHub's robots.txt bars /*/raw/ and /*/tree/, and a blob page is hundreds of KB of HTML with relative links. So llms.txt lists the README and every skill by absolute raw URL, and llms-full.txt carries the README and every SKILL.md in one fetch with relative links made absolute. Adapted from LilMGenius/openflirt scripts/lib/llms.mjs (d722425): the carried set here is the plugin manifest's skill list instead of a lecture registry, and the generator and the gate are one CommonJS file to sit beside the other gates.
// node scripts/gates/llms.cjs writes both files when they differ; --check writes nothing and exits 1 naming each stale file; --root builds another checkout.
const fs = require('node:fs');
const path = require('node:path');
const { read, problem } = require('./repo.cjs');

const BASE_URL = 'https://raw.githubusercontent.com/LilMGenius/paperthin/main/';
const FILES = ['llms.txt', 'llms-full.txt'];
const COMMAND = 'node scripts/gates/llms.cjs';
const LINK = /\]\(([^)\s]+)\)/g;
const SCHEME = /^[a-z][a-z0-9+.-]*:/i;
const CODE_SPAN = /(`[^`]*`)/;

const rawUrl = (file) => BASE_URL + file;

// Relative markdown links outside fences and code spans become absolute raw URLs, anchors kept.
function absoluteLinks(text, file) {
  let fence = null;
  const resolve = (match, target) => (SCHEME.test(target) || target.startsWith('#') ? match : '](' + rawUrl(path.posix.normalize(path.posix.join(path.posix.dirname(file), target))) + ')');
  return text.split('\n').map((line) => {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line);
    if (marker) {
      if (fence === null) fence = marker[1][0];
      else if (marker[1][0] === fence) fence = null;
      return line;
    }
    if (fence !== null) return line;
    return line.split(CODE_SPAN).map((piece, i) => (i % 2 === 1 ? piece : piece.replace(LINK, resolve))).join('');
  }).join('\n');
}

function frontmatterField(text, field) {
  const head = /^---\n([\s\S]*?)\n---/.exec(text);
  const line = head && head[1].split('\n').find((l) => l.startsWith(field + ':'));
  return line ? line.slice(field.length + 1).trim().replace(/^"(.*)"$/, '$1') : '';
}

// Both files as the generator writes them. The skill list is the plugin manifest's, which the catalog gate holds to the README index.
function build(root) {
  const manifest = JSON.parse(read(root, '.claude-plugin/plugin.json'));
  const skills = manifest.skills.map((dir) => path.posix.join(dir.replace(/^\.\//, ''), 'SKILL.md')).filter((file) => fs.existsSync(path.join(root, file)));
  const entry = (file, description) => '- [' + file + '](' + rawUrl(file) + '): ' + description;
  const index = [
    '# paperthin',
    '',
    '> ' + manifest.description,
    '',
    'A tool reading this repository over the web needs only [llms-full.txt](' + rawUrl('llms-full.txt') + '): the README and every skill in one file, with every link absolute. Each file\'s own address follows.',
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
  const carried = ['README.md', ...skills];
  const full = [
    '# paperthin, every file',
    '',
    '> The README and every paperthin skill in one file. Each file starts with a `--- FILE: <path> (<address>) ---` line, and relative links inside it point at the original address.',
    '',
    COMMAND + ' builds this file from the repository, so it is never edited by hand. The address of each file is in [llms.txt](' + rawUrl('llms.txt') + ').',
    '',
    ...carried.flatMap((file) => ['--- FILE: ' + file + ' (' + rawUrl(file) + ') ---', '', absoluteLinks(read(root, file), file).replace(/\n*$/, ''), '']),
  ];
  return { 'llms.txt': index.join('\n').replace(/\n*$/, '\n'), 'llms-full.txt': full.join('\n').replace(/\n*$/, '\n') };
}

// The committed files must equal what build writes; a problem names the first line that differs.
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

module.exports = { build, check, absoluteLinks, BASE_URL };

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
