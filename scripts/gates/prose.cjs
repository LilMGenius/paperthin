'use strict';
// Line rules over tracked text: no em-dash, no in-sentence dash in the READMEs and brand surfaces, one spelling of the skills CLI, generic examples in durable docs, backticked names that resolve, and the install command every README copies.
const path = require('node:path');
const { listFiles, read, problem } = require('./repo.cjs');
const { indexRows } = require('./catalog.cjs');
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
  checkTranslatedIndex(root, problems);
  return problems;
}

// A translation paraphrases the English Index in natural prose of its own language. Two signs of a copy are mechanical and checked here: a translated "What it does" cell equal to the English cell for the same skill, and, in a language with its own script, a cell whose letters are mostly Latin once skill names, code spans, links and bold are set aside. Whether the wording reads as natural or word for word stays a reviewer's judgment.
const SCRIPTS = {
  ko: /\p{Script=Hangul}/gu,
  ja: /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/gu,
  'zh-CN': /\p{Script=Han}/gu,
  ru: /\p{Script=Cyrillic}/gu,
  ar: /\p{Script=Arabic}/gu,
  hi: /\p{Script=Devanagari}/gu,
};

function whatCells(text) {
  return new Map(indexRows(text).map((row) => [row.name, { cell: row.row.split('|')[2].trim(), line: row.line }]));
}

function checkTranslatedIndex(root, problems) {
  const english = whatCells(read(root, 'README.md'));
  for (const readme of listFiles(root, 'assets/i18n').filter((file) => /\/README\.[^/]+\.md$/.test(file))) {
    const script = SCRIPTS[readme.match(/README\.([^/]+)\.md$/)[1]];
    for (const [name, { cell, line }] of whatCells(read(root, readme))) {
      if (english.get(name)?.cell === cell) problems.push(problem(readme, line, name + "'s What it does cell is the English one; paraphrase it in the translation's own language"));
      if (!script) continue;
      const bare = cell.replace(/\x60[^\x60]*\x60/g, '').replace(/\[[^\]]*\]\([^)]*\)/g, '').replace(/\*\*[^*]*\*\*/g, '').replace(/[a-z0-9]+(?:-[a-z0-9]+)*/g, (word) => (english.has(word) ? '' : word));
      const native = (bare.match(script) || []).length;
      const latin = (bare.match(/[A-Za-z]/g) || []).length;
      if (native <= latin) problems.push(problem(readme, line, name + "'s What it does cell has " + latin + ' Latin letters to ' + native + ' in the ' + readme.match(/README\.([^/]+)\.md$/)[1] + ' script; write it in that script'));
    }
  }
}

// .agents/install-block.md owns the install commands, one canonical block per route; every README carries each command line verbatim and points at /re0-upgrade for older installs.
function checkInstall(root, problems) {
  const blocks = [...read(root, INSTALL_BLOCK).matchAll(/<canonical-block name="([^"]+)">[\s\S]*?\x60\x60\x60bash\n([\s\S]+?)\n\x60\x60\x60/g)];
  if (!blocks.length) {
    problems.push(problem(INSTALL_BLOCK, 0, 'has no canonical block with a bash command'));
    return;
  }
  const commands = blocks.flatMap((block) => block[2].split('\n').map((line) => line.trim()).filter(Boolean));
  for (const readme of ['README.md', ...listFiles(root, 'assets/i18n').filter((file) => /\/README\.[^/]+\.md$/.test(file))]) {
    const text = read(root, readme);
    for (const command of commands) if (!text.includes(command)) problems.push(problem(readme, 0, 'does not carry the install command from ' + INSTALL_BLOCK + ': ' + command));
    if (!text.includes('/re0-upgrade')) problems.push(problem(readme, 0, 'does not point at /re0-upgrade for updates'));
  }
}

module.exports = { check };
