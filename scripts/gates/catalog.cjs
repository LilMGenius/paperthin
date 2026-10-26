'use strict';
// The roster has no build step to generate it, so it is hand-written onto surfaces that cannot reference each other: the skill folders, plugin.json, the runtime CATALOG, re0-upgrade's Current catalog and every README Index. They must hold one set in one order.
const path = require('node:path');
const { listFiles, isFile, read, problem } = require('./repo.cjs');
const { frontmatter } = require('./skills.cjs');

const UPGRADE = 'skills/breadth/re0-upgrade/SKILL.md';
const ROW = /^\|[^\n]*\*\*\[([a-z0-9-]+)\]\(([^)]*)\/SKILL\.md\)\*\*[^\n]*$/gm;

// A translation translates the Index heading, so a README's Index is its ## section holding the most roster rows; a skill named in prose or in another table does not count.
function indexRows(text) {
  let offset = 0;
  const sections = text.split(/^(?=## )/m).map((section) => {
    const start = offset;
    offset += section.length;
    return { section, start };
  });
  const rowsOf = ({ section, start }) => [...section.matchAll(ROW)].map((m) => ({ name: m[1], target: m[2], row: m[0], line: text.slice(0, start + m.index).split('\n').length }));
  return sections.map(rowsOf).reduce((a, b) => (b.length > a.length ? b : a), []);
}

function upgradeRoster(text) {
  const after = text.split(/^##\s+Current catalog\s*$/m)[1];
  return after === undefined ? null : [...after.split(/^##\s+/m)[0].matchAll(/\x60([a-z0-9][a-z0-9-]*)\x60/g)].map((m) => m[1]);
}

function check(root) {
  const problems = [];
  const json = (rel) => {
    try {
      return JSON.parse(read(root, rel));
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
      problems.push(problem(rel, 0, 'is not valid JSON: ' + error.message));
      return { skills: [], description: null };
    }
  };
  const onDisk = listFiles(root, 'skills').filter((file) => file.endsWith('/SKILL.md')).map((file) => path.posix.dirname(file));
  const plugin = json('.claude-plugin/plugin.json');
  const { CATALOG } = require(path.join(root, 'scripts', 'runtime', 'catalog.cjs'));
  const roster = upgradeRoster(read(root, UPGRADE));
  if (!roster) problems.push(problem(UPGRADE, 0, 'has no "## Current catalog" section'));

  const registered = plugin.skills.map((p) => p.replace(/^\.\//, ''));
  for (const dir of onDisk.filter((dir) => !registered.includes(dir))) problems.push(problem('.claude-plugin/plugin.json', 0, dir + ' is not registered'));
  for (const dir of registered.filter((dir) => !onDisk.includes(dir))) problems.push(problem('.claude-plugin/plugin.json', 0, dir + ' has no SKILL.md'));

  const readmes = ['README.md', ...listFiles(root, 'assets/i18n').filter((file) => /\/README\.[^/]+\.md$/.test(file))];
  const surfaces = { '.claude-plugin/plugin.json': registered.map((dir) => path.posix.basename(dir)), [UPGRADE]: roster || [] };
  const invocation = new Map(onDisk.map((dir) => [path.posix.basename(dir), frontmatter(dir, read(root, dir + '/SKILL.md')).data?.['disable-model-invocation'] === true]));
  for (const readme of readmes) {
    const rows = indexRows(read(root, readme));
    surfaces[readme + ' Index'] = rows.map((row) => row.name);
    checkInvoker(readme, rows, invocation, problems);
  }
  for (const [surface, list] of Object.entries(surfaces)) {
    if (list.join(' ') !== CATALOG.join(' ')) problems.push(problem(surface, 0, 'lists the roster as [' + list.join(', ') + '], which is not the set and order of scripts/runtime/catalog.cjs'));
  }

  const descriptions = [json('package.json').description, plugin.description];
  if (descriptions[0] !== descriptions[1]) problems.push(problem('.claude-plugin/plugin.json', 0, 'description differs from package.json; the brand one-liner is one sentence in both'));
  if (isFile(root, '.npmignore')) problems.push(problem('.npmignore', 0, 'publishing reads .gitignore; an .npmignore replaces it and ships the *.local files'));
  return problems;
}

// Translations translate the lane names, so each lane's word is the one most of its rows carry, and a row off its lane's word fails.
function checkInvoker(readme, rows, invocation, problems) {
  const known = rows.filter((row) => invocation.has(row.name)).map((row) => ({ ...row, cell: row.row.split('|')[4].trim(), lane: invocation.get(row.name) ? 'user' : 'model' }));
  const word = {};
  for (const lane of ['user', 'model']) {
    const counts = new Map();
    for (const row of known.filter((row) => row.lane === lane)) counts.set(row.cell, (counts.get(row.cell) || 0) + 1);
    word[lane] = [...counts].sort((a, b) => b[1] - a[1])[0]?.[0];
  }
  if (word.user !== undefined && word.user === word.model) problems.push(problem(readme, 0, 'the Invoker column uses ' + JSON.stringify(word.user) + ' for both lanes'));
  for (const row of known.filter((row) => row.cell !== word[row.lane])) {
    problems.push(problem(readme, row.line, row.name + ' is ' + row.lane + '-invoked, but its Invoker cell reads ' + JSON.stringify(row.cell) + ' where the lane reads ' + JSON.stringify(word[row.lane])));
  }
}

module.exports = { check };

