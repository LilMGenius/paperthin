'use strict';
// Every relative Markdown link resolves to a file, and a fragment to a heading GitHub renders there. Images, external links and links inside code are out of scope.
const fs = require('node:fs');
const path = require('node:path');
const { listFiles, read, problem } = require('./repo.cjs');

// Lines with fenced code blanked and inline code removed, so a link written as an example is not followed.
function proseLines(text) {
  let fence = null;
  return text.split('\n').map((line) => {
    const marker = line.match(/^\s*(\x60{3,}|~{3,})/);
    if (marker && (!fence || marker[1].startsWith(fence))) {
      fence = fence ? null : marker[1];
      return '';
    }
    return fence ? '' : line.replace(/(\x60+)[^\x60]*?\1/g, '');
  });
}

// GitHub's heading id: lowercase, punctuation and emoji dropped, spaces to hyphens, a repeat suffixed -1, -2.
function anchors(text) {
  const seen = new Map();
  const ids = new Set();
  for (const line of proseLines(text)) {
    for (const [, id] of line.matchAll(/<a\s[^>]*(?:id|name)="([^"]+)"/g)) ids.add(id);
    const heading = line.match(/^#{1,6}\s+(.*?)\s*#*\s*$/);
    if (!heading) continue;
    const base = heading[1].replace(/<[^>]+>/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '').replace(/ /g, '-');
    const count = seen.get(base) || 0;
    seen.set(base, count + 1);
    ids.add(count ? base + '-' + count : base);
  }
  return ids;
}

function linksIn(text) {
  const lines = proseLines(text).map((line) => line.replace(/!\[[^\]]*\]\([^)]*\)/g, ''));
  const refs = new Map();
  for (const line of lines) {
    const def = line.match(/^\s*\[([^\]]+)\]:\s+(\S+)/);
    if (def) refs.set(def[1].toLowerCase(), def[2]);
  }
  const links = [];
  lines.forEach((line, i) => {
    for (const [, target] of line.matchAll(/\]\(<?([^)\s>]+)>?(?:\s+"[^"]*")?\)/g)) links.push({ line: i + 1, target });
    for (const [, ref] of line.matchAll(/\]\[([^\]]+)\]/g)) links.push({ line: i + 1, target: refs.get(ref.toLowerCase()), ref });
  });
  return links;
}

function check(root) {
  const problems = [];
  const files = listFiles(root, '*.md');
  const anchorCache = new Map();
  const anchorsOf = (rel) => {
    if (!anchorCache.has(rel)) anchorCache.set(rel, anchors(read(root, rel)));
    return anchorCache.get(rel);
  };
  for (const file of files) {
    for (const { line, target, ref } of linksIn(read(root, file))) {
      if (target === undefined) {
        problems.push(problem(file, line, 'reference [' + ref + '] has no [' + ref + ']: definition'));
        continue;
      }
      if (/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(target)) continue;
      const [pathPart, fragment] = target.split('?')[0].split('#');
      const rel = pathPart ? path.posix.normalize(pathPart.startsWith('/') ? pathPart.slice(1) : path.posix.join(path.posix.dirname(file), decodeURI(pathPart))) : file;
      if (!fs.existsSync(path.join(root, rel))) {
        problems.push(problem(file, line, 'link ' + target + ' does not resolve (' + rel + ')'));
        continue;
      }
      if (fragment && rel.endsWith('.md') && !anchorsOf(rel).has(decodeURIComponent(fragment).toLowerCase())) problems.push(problem(file, line, 'link ' + target + ' names no heading in ' + rel));
    }
  }
  checkSwitchers(root, problems);
  return problems;
}

// Every README carries the <sub>Read in: line linking each of the others, its links rebased from its own directory.
function checkSwitchers(root, problems) {
  const readmes = ['README.md', ...listFiles(root, 'assets/i18n').filter((file) => /\/README\.[^/]+\.md$/.test(file))];
  for (const readme of readmes) {
    const lines = read(root, readme).split('\n');
    const index = lines.findIndex((line) => line.includes('<sub>Read in:'));
    if (index < 0) {
      problems.push(problem(readme, 0, 'has no <sub>Read in: ...</sub> language switcher'));
      continue;
    }
    const linked = new Set([...lines[index].matchAll(/\]\(([^)]+)\)/g)].map((m) => path.posix.normalize(path.posix.join(path.posix.dirname(readme), m[1]))));
    for (const other of readmes.filter((other) => other !== readme && !linked.has(other))) problems.push(problem(readme, index + 1, 'the language switcher does not link ' + other));
  }
}

module.exports = { check, anchors };
