'use strict';
// Line rules over tracked text: no em-dash, no in-sentence dash in the READMEs and brand surfaces, one spelling of the skills CLI, generic examples in durable docs, backticked names that resolve, and the install command every README copies.
const path = require('node:path');
const { listFiles, read, problem } = require('./repo.cjs');
// dedash owns the one classifier of em and en dashes by slot; the gate loads it rather than keeping a second copy.
const { findText, isProse } = require(path.join(__dirname, '..', '..', 'skills', 'depth', 'dedash', 'scripts', 'find.mjs'));

const EM_DASH_SCOPE = ['skills', '.agents', 'AGENTS.md', 'scripts', '.github'];
// Where a dash may stand as a label separator: only one inside a sentence fails.
const SENTENCE_DASH_SCOPE = ['README.md', 'assets', 'package.json', '.claude-plugin'];
const INSTALL_BLOCK = '.agents/install-block.md';

// A real PR number, handle or SHA in a durable doc ages into residue a later reader takes for current fact; (#123, @handle) is the generic form.
const INSTANCES = [
  [/(?:\b(?:PR|pull request|issue) #|\(#)(?!123\b)\d+(?=,? @|\b(?!\)))/i, 'a real PR or issue number'],
  [/github\.com\/[^/\s)]+\/[^/\s)]+\/(?:pull|issues|commit)\/\w+/, 'a link to a real PR, issue or commit'],
  [/(?<![\w.@\/\x60-])@(?!handle\b)[A-Za-z][A-Za-z0-9-]*(?![\w\/-])/, 'a real handle'],
  [/\b(?=[0-9a-f]*\d)(?=[0-9a-f]*[a-f])[0-9a-f]{7,40}\b/, 'a commit SHA'],
];

function durable(file) {
  return file === 'AGENTS.md' || file.startsWith('.agents/') || /^skills\/.+\/SKILL\.md$/.test(file);
}

function check(root) {
  const problems = [];
  const shipped = new Set(listFiles(root, 'skills').filter((file) => file.endsWith('/SKILL.md')).map((file) => file.split('/').at(-2)));
  for (const file of listFiles(root, ...EM_DASH_SCOPE)) {
    read(root, file).split('\n').forEach((line, i) => {
      if (line.includes('\u2014')) problems.push(problem(file, i + 1, 'em-dash; rewrite the sentence with the punctuation it wants'));
    });
  }
  for (const file of listFiles(root, ...SENTENCE_DASH_SCOPE)) {
    const text = read(root, file);
    if (text.includes('\0')) continue;
    for (const dash of findText(text, { prose: isProse(file) }).filter((d) => d.slot === 'sentence')) {
      problems.push(problem(file, dash.line, 'in-sentence ' + dash.codepoint + ' at column ' + dash.column + '; rewrite it with the punctuation the sentence wants, keeping a dash only as a label separator'));
    }
  }
  for (const file of listFiles(root, '*.md')) {
    read(root, file).split('\n').forEach((line, i) => {
      if (/npx skills(?!@latest)\b/.test(line)) problems.push(problem(file, i + 1, 'spell the CLI npx skills@latest'));
      for (const [, token] of line.matchAll(/\x60([a-z][a-z0-9-]*[a-z0-9])\x60/g)) {
        const near = !shipped.has(token) && token.includes('-') && [...shipped].find((name) => token.startsWith(name + '-') || token.endsWith('-' + name));
        if (near) problems.push(problem(file, i + 1, '\x60' + token + '\x60 is one affix from the skill ' + near + ' but names no skill; rename or remove it'));
      }
      if (!durable(file)) return;
      for (const [pattern, what] of INSTANCES) {
        const hit = line.match(pattern);
        if (hit) problems.push(problem(file, i + 1, hit[0] + ' is ' + what + '; a durable doc keeps the generic (#123, @handle) form'));
      }
    });
  }
  checkInstall(root, problems);
  return problems;
}

// .agents/install-block.md owns the install command; every README copies it verbatim and points at /re0-upgrade for updates.
function checkInstall(root, problems) {
  const block = read(root, INSTALL_BLOCK).match(/<canonical-block name="install">[\s\S]*?\x60\x60\x60bash\n(.+)\n\x60\x60\x60/);
  if (!block) {
    problems.push(problem(INSTALL_BLOCK, 0, 'has no install canonical block with a bash command'));
    return;
  }
  const command = block[1].trim();
  for (const readme of ['README.md', ...listFiles(root, 'assets/i18n').filter((file) => /\/README\.[^/]+\.md$/.test(file))]) {
    const text = read(root, readme);
    if (!text.includes(command)) problems.push(problem(readme, 0, 'does not carry the install command from ' + INSTALL_BLOCK + ': ' + command));
    if (!text.includes('/re0-upgrade')) problems.push(problem(readme, 0, 'does not point at /re0-upgrade for updates'));
  }
}

module.exports = { check };
