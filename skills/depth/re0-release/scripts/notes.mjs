#!/usr/bin/env node
// Check one release note against the deterministic part of the house style in re0-release's SKILL.md, step 6; step 7
// names what this script decides and what stays judgment. It also fails .agents/install-block.md when its release-notes
// block drifts from the route blocks it restates. A repository with no install block, or none for the note's era, has its
// Install reported as not checked against a block while every other rule still runs.
// Usage: node notes.mjs <notes-file> [--version X.Y.Z] [--root <repo>]
//        node notes.mjs --tag vX.Y.Z [--root <repo>]
// The version picks the Install era when an install block exists: --version, else the tag, else a vX.Y.Z.md file name,
// else <repo>/package.json.
// Exit codes: 0 the note passes; 1 named failures; 2 the check could not run (usage, or a file it needs but cannot read).
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const USAGE = 'usage: node notes.mjs <notes-file> [--version X.Y.Z] [--root <repo>]\n       node notes.mjs --tag vX.Y.Z [--root <repo>]';
const INSTALL_BLOCK = '.agents/install-block.md';
const SIGNATURE = /-----BEGIN PGP SIGNATURE-----[\s\S]*?-----END PGP SIGNATURE-----\n?/;
const CREDIT = /\(#\d+(?:-#\d+)?(?:, @[A-Za-z0-9][A-Za-z0-9-]*)+\)/g;
const CATALOG = /^The catalog \((\d+) skills\)$/;
const CATALOG_BULLET = /^- (?:\*\*\x60[a-z]+\/\x60\*\* \([^)]+\)|\x60[a-z]+\/\x60): (.+)$/;
// The sections a note may carry, in the only order it may carry them.
const SECTIONS = [
  { name: 'New', matches: (heading) => heading === 'New' || /^New: \S/.test(heading) },
  { name: 'Also', matches: (heading) => heading === 'Also' },
  { name: 'The catalog (N skills)', matches: (heading) => CATALOG.test(heading) },
  { name: 'Install', matches: (heading) => heading === 'Install' },
];

export class Usage extends Error {}

export function parseVersion(text) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(text ?? '');
  return match ? match.slice(1).map(Number) : null;
}

const lf = (text) => text.replace(/\r\n/g, '\n');

function readText(path, what) {
  try {
    return lf(readFileSync(path, 'utf8'));
  } catch (error) {
    if (error instanceof Error && 'code' in error) throw new Usage('cannot read ' + what + ' ' + path + ': ' + error.code);
    throw error;
  }
}

// The blocks of .agents/install-block.md, or null when the repository has none; a file that exists and cannot be read is
// a read error.
function canonicalBlocks(root) {
  const path = join(root, INSTALL_BLOCK);
  if (!existsSync(path)) return null;
  const text = readText(path, 'the install block');
  return new Map([...text.matchAll(/<canonical-block name="([^"]+)">\n([\s\S]*?)<\/canonical-block>/g)].map((match) => [match[1], match[2]]));
}

const fenced = (body, lang) => new RegExp('\x60\x60\x60' + lang + '\\n([\\s\\S]*?)\\n\x60\x60\x60').exec(body)?.[1] ?? null;

// A note before 1.0 shipped one skills.sh route; every note from 1.0 on carries the plugin routes. The version is read
// only here, so a repository without an install block needs none.
export function installRendering(root, version) {
  const blocks = canonicalBlocks(root);
  if (blocks === null) return { name: null, reason: 'the repository has no ' + INSTALL_BLOCK };
  const [major] = version();
  const name = major === 0 ? 'release-notes-0.x' : 'release-notes';
  const body = blocks.get(name);
  const rendering = body === undefined ? null : fenced(body, 'markdown');
  if (rendering === null) return { name: null, reason: INSTALL_BLOCK + ' has no ' + name + ' block holding a markdown fence' };
  return { name, rendering };
}

// The release-notes block restates the route blocks in another layout: each command, and each route's parenthetical,
// which is the first sentence after that route's command with its first letter lowered and its period dropped.
export function blockDrift(root) {
  const blocks = canonicalBlocks(root);
  if (blocks === null) return [];
  const routeBlocks = [...blocks].filter(([name]) => !name.startsWith('release-notes')).map(([, body]) => body);
  const routes = routeBlocks.flatMap((body) => (fenced(body, 'bash') ?? '').split('\n').map((line) => line.trim()).filter(Boolean));
  const sentences = routeBlocks.map((body) => {
    const prose = body.slice(body.lastIndexOf('\x60\x60\x60') + 3).trim();
    const first = /^[\s\S]*?\.(?=\s|$)/.exec(prose)?.[0] ?? prose;
    return first.charAt(0).toLowerCase() + first.slice(1, -1);
  });
  const notes = fenced(blocks.get('release-notes') ?? '', 'markdown');
  if (notes === null) return [];
  const problems = [];
  const commands = notes.split('\n').filter((line) => line.startsWith('    ')).map((line) => line.trim());
  if (commands.length !== routes.length || commands.some((command, i) => command !== routes[i])) {
    problems.push({ line: 0, rule: 'install-block', message: 'fix ' + INSTALL_BLOCK + ', not the note: its release-notes block carries the commands ' + JSON.stringify(commands) + ' where the route blocks carry ' + JSON.stringify(routes) });
  }
  const parentheticals = notes.split('\n').flatMap((line) => /^\S.*? \((.+)\):$/.exec(line)?.slice(1) ?? []);
  if (parentheticals.length !== sentences.length || parentheticals.some((text, i) => text !== sentences[i])) {
    problems.push({ line: 0, rule: 'install-block', message: 'fix ' + INSTALL_BLOCK + ', not the note: its release-notes block says ' + JSON.stringify(parentheticals) + ' where the route blocks say ' + JSON.stringify(sentences) });
  }
  return problems;
}

// The subject a bullet leads with: its bold lead, else its first code span, compared without backticks or end punctuation.
function leadSubject(line) {
  const lead = /^- (?:\*\*(.+?)\*\*|(\x60[^\x60]+\x60))/.exec(line);
  return lead ? (lead[1] ?? lead[2]).replace(/\x60/g, '').replace(/[.:]$/, '').toLowerCase() : null;
}

export function checkNotes(text, era) {
  const problems = [];
  const fail = (index, rule, message) => problems.push({ line: index + 1, rule, message });
  const lines = lf(text).replace(/\s+$/, '').split('\n');

  lines.forEach((line, i) => {
    if (line.includes('\u2014')) fail(i, 'em-dash', 'an em dash; rewrite the sentence with the punctuation it wants');
    const bare = line.replace(/\x60[^\x60]*\x60/g, '');
    const credited = [...bare.matchAll(CREDIT)].map((match) => [match.index, match.index + match[0].length]);
    for (const ref of bare.matchAll(/#\d+/g)) {
      if (!credited.some(([from, to]) => ref.index >= from && ref.index < to)) fail(i, 'credit', ref[0] + ' is not in the (#123, @handle) credit form');
    }
  });

  const first = lines.findIndex((line) => line.trim());
  const h2 = lines.flatMap((line, i) => (/^## /.test(line) ? [i] : []));
  if (first < 0 || !/^## /.test(lines[first])) fail(Math.max(first, 0), 'heading', 'the note opens with one ## heading');
  if (h2.length > 1) for (const i of h2.slice(1)) fail(i, 'heading', 'a second ## heading; a note has one');
  lines.forEach((line, i) => {
    if (/^#(?:#{3,})? /.test(line) || /^#{1,6}[^#\s]/.test(line)) fail(i, 'heading', 'only one ## heading and ### sections');
  });
  if (h2.length && /\bv?\d+\.\d+\.\d+\b/.test(lines[h2[0]])) fail(h2[0], 'heading', "the heading names a version; name the release's durable idea");

  const sections = lines.flatMap((line, i) => (/^### /.test(line) ? [{ index: i, heading: line.slice(4) }] : []));
  const introEnd = sections.length ? sections[0].index : lines.length;
  const intro = lines.slice((h2[0] ?? -1) + 1, introEnd).map((line, k) => ({ line, i: (h2[0] ?? -1) + 1 + k })).filter(({ line }) => line.trim());
  if (intro.length !== 1) fail(intro[1]?.i ?? h2[0] ?? 0, 'intro', 'the heading is followed by ' + intro.length + ' intro lines; write one paragraph on one line');
  else if (/^(?:- |\s|#|>|\||\d+\. )/.test(intro[0].line)) fail(intro[0].i, 'intro', 'the intro is a paragraph, not a list, quote, table or code');

  let last = -1;
  const seen = new Set();
  const newSubjects = new Set();
  sections.forEach((section, k) => {
    const kind = SECTIONS.findIndex((spec) => spec.matches(section.heading));
    if (kind < 0) return fail(section.index, 'section', '### ' + section.heading + ' is not a house-style section (' + SECTIONS.map((spec) => spec.name).join(', ') + ')');
    if (seen.has(kind)) return fail(section.index, 'section', '### ' + section.heading + ' appears twice');
    if (kind < last) fail(section.index, 'order', '### ' + section.heading + ' comes after ### ' + SECTIONS[last].name + '; the order is ' + SECTIONS.map((spec) => spec.name).join(', '));
    seen.add(kind);
    last = Math.max(last, kind);
    const end = sections[k + 1]?.index ?? lines.length;
    const body = lines.slice(section.index + 1, end).map((line, j) => ({ line, i: section.index + 1 + j })).filter(({ line }) => line.trim());
    if (SECTIONS[kind].name === 'Install') return;
    if (!body.length) fail(section.index, 'bullets', '### ' + section.heading + ' is empty');
    for (const { line, i } of body) {
      if (!line.startsWith('- ')) fail(i, 'bullets', 'write each item under ### ' + section.heading + ' as one single-line - bullet');
      else if (kind === 0 && !line.startsWith('- **')) fail(i, 'bold-lead', 'a ### New bullet opens with a bold lead');
      const subject = line.startsWith('- ') ? leadSubject(line) : null;
      if (kind === 0 && subject) newSubjects.add(subject);
      if (kind === 1 && subject && newSubjects.has(subject)) fail(i, 'repeats-new', 'this ### Also bullet leads with ' + subject + ', which ### New already covers; Also holds only what New does not say');
    }
    if (kind === 2) checkCatalog(Number(CATALOG.exec(section.heading)[1]), section.index, body, fail);
  });

  const install = sections.find((section) => section.heading === 'Install');
  if (!install) fail(lines.length - 1, 'install', 'there is no ### Install; it is always the last section');
  else if (era.name !== null) {
    const { name, rendering } = era;
    const want = rendering.split('\n').map((line) => line.trimEnd());
    const have = lines.slice(install.index).map((line) => line.trimEnd());
    const off = want.findIndex((line, j) => have[j] !== line);
    if (off >= 0 || have.length !== want.length) {
      const j = off >= 0 ? off : Math.min(have.length, want.length);
      fail(install.index + j, 'install', '### Install differs from the ' + name + ' block of ' + INSTALL_BLOCK + ' at its line ' + (j + 1) + ': expected ' + JSON.stringify(want[j] ?? '(end of note)') + ', found ' + JSON.stringify(have[j] ?? '(end of note)'));
    }
  }
  return problems.sort((a, b) => a.line - b.line);
}

function checkCatalog(count, index, body, fail) {
  const names = [];
  for (const { line, i } of body) {
    const match = CATALOG_BULLET.exec(line);
    if (!match) {
      if (line.startsWith('- ')) fail(i, 'catalog', 'a catalog bullet reads - \x60<perspective>/\x60: \x60<skill>\x60, ...');
      continue;
    }
    names.push(...[...match[1].matchAll(/\x60([^\x60]+)\x60/g)].map((name) => name[1]));
  }
  const dupes = names.filter((name, k) => names.indexOf(name) !== k);
  if (dupes.length) fail(index, 'catalog', 'the catalog lists ' + dupes.join(', ') + ' more than once');
  if (names.length !== count) fail(index, 'catalog', 'the heading counts ' + count + ' skills and the bullets list ' + names.length);
}

export function tagMessage(tag) {
  const out = execFileSync('git', ['for-each-ref', 'refs/tags/' + tag, '--format=%(objecttype)%00%(contents)'], { encoding: 'utf8', windowsHide: true });
  if (!out) throw new Usage('no tag ' + tag);
  const [type, ...rest] = out.split('\0');
  if (type !== 'tag') throw new Usage(tag + ' is a lightweight tag; release notes live in an annotated tag message');
  return lf(rest.join('\0')).replace(SIGNATURE, '');
}

export function run(argv) {
  const { values, positionals } = parseArgs({ args: argv, allowPositionals: true, options: { version: { type: 'string' }, root: { type: 'string' }, tag: { type: 'string' } } });
  if (Boolean(values.tag) === (positionals.length === 1) || positionals.length > 1) throw new Usage(USAGE);
  const root = values.root ?? process.cwd();
  const label = values.tag ?? positionals[0];
  const text = values.tag ? tagMessage(values.tag) : readText(positionals[0], 'the notes');
  const version = () => {
    const named = values.version ?? values.tag ?? /^(v?\d+\.\d+\.\d+)\.md$/.exec(basename(label))?.[1] ?? JSON.parse(readText(join(root, 'package.json'), 'package.json')).version;
    const parsed = parseVersion(named);
    if (!parsed) throw new Usage('not a version: ' + named + '; pass --version X.Y.Z');
    return parsed;
  };
  if (values.version !== undefined && !parseVersion(values.version)) throw new Usage('not a version: ' + values.version);
  const era = installRendering(root, version);
  return { label, problems: [...blockDrift(root), ...checkNotes(text, era)], era };
}

const invoked = process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (invoked) {
  try {
    const { label, problems, era } = run(process.argv.slice(2));
    for (const { line, rule, message } of problems) console.error(label + ':' + line + ': ' + rule + ': ' + message);
    if (problems.length) process.exit(1);
    console.log(label + ': ok (' + (era.name ?? 'Install not checked against a block: ' + era.reason + '; it must carry the repository\'s own documented install commands verbatim') + ')');
  } catch (error) {
    if (!(error instanceof Usage) && !(error instanceof TypeError && 'code' in error && String(error.code).startsWith('ERR_PARSE_ARGS'))) throw error;
    console.error(error.message);
    process.exit(2);
  }
}
