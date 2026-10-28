#!/usr/bin/env node
// The mechanical half of re0-upgrade: sort an install against the skill's own Deprecations table and Current catalog
// (classify), and compare one installed SKILL.md with the published releases of LilMGenius/paperthin (integrity). Both read
// their rules from SKILL.md or from the upstream and decide nothing a person must; the skill prints the plan and asks.
// Usage: node upgrade.mjs classify --skill-md <re0-upgrade SKILL.md> --installed <skills-dir | names-file>
//        node upgrade.mjs integrity --installed-file <SKILL.md> --skill <name> --lock <.skill-lock.json>
//                                   (--releases-json <file> | --fetch) [--raw-dir <dir>]
// Exit codes: 0 nothing stale or missing, or clean; 1 something stale or missing, or not clean; 2 usage or refused input.
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const USAGE = 'usage: node upgrade.mjs classify --skill-md <SKILL.md> --installed <skills-dir | names-file>\n       node upgrade.mjs integrity --installed-file <SKILL.md> --skill <name> --lock <.skill-lock.json> (--releases-json <file> | --fetch) [--raw-dir <dir>]';
const UPSTREAM = 'LilMGenius/paperthin';
const SOURCE_URL = /^https:\/\/github\.com\/lilmgenius\/paperthin(?:\.git)?\/?$/i;
const RELEASES = 'https://api.github.com/repos/' + UPSTREAM + '/releases';
const RAW = 'https://raw.githubusercontent.com/' + UPSTREAM + '/';
const PERSPECTIVES = ['breadth', 'coil', 'depth', 'mesh'];
const SLUG = /^[a-z0-9][a-z0-9-]*$/;
const NAME = /^\x60([a-z0-9][a-z0-9-]*)\x60$/;

export class Refusal extends Error {}

// The body of one "## <title>" section, up to the next level-two heading.
function section(text, title) {
  const parts = text.replace(/\r\n/g, '\n').split(/^## +/m);
  const hit = parts.slice(1).find((part) => part.split('\n')[0].trim() === title);
  if (!hit) throw new Refusal('the SKILL.md has no "## ' + title + '" section');
  return hit.slice(hit.indexOf('\n') + 1);
}

// Deprecations rows (deprecated, renamed to) in table order, each resolved to its final current name, and the Current
// catalog in roster order. A row that does not parse, a loop, or a chain ending outside the catalog is refused.
export function readRules(text) {
  const rows = section(text, 'Deprecations').split('\n').filter((line) => line.trim().startsWith('|'));
  if (rows.length < 2) throw new Refusal('the Deprecations section holds no table');
  const renames = rows.slice(2).map((row) => {
    const cells = row.split('|').slice(1, -1).map((cell) => cell.trim());
    const from = NAME.exec(cells[0] ?? '');
    const to = NAME.exec(cells[1] ?? '');
    if (!from || !to) throw new Refusal('Deprecations row does not read as \x60old\x60 | \x60new\x60: ' + row.trim());
    return [from[1], to[1]];
  });
  const catalog = [...section(text, 'Current catalog').matchAll(/\x60([a-z0-9][a-z0-9-]*)\x60/g)].map((m) => m[1]);
  if (!catalog.length) throw new Refusal('the Current catalog section names no skill');
  const next = new Map(renames);
  if (next.size !== renames.length) throw new Refusal('a deprecated name has two rows in Deprecations');
  const current = new Set(catalog);
  const finals = new Map();
  for (const [from] of renames) {
    if (current.has(from)) throw new Refusal(from + ' is both deprecated and in the Current catalog');
    const seen = [from];
    let name = next.get(from);
    while (next.has(name)) {
      if (seen.includes(name)) throw new Refusal('rename chain loops: ' + [...seen, name].join(' -> '));
      seen.push(name);
      name = next.get(name);
    }
    if (!current.has(name)) throw new Refusal('rename chain ' + [...seen, name].join(' -> ') + ' ends outside the Current catalog');
    finals.set(from, name);
  }
  return { renames, finals, catalog };
}

// Installed names: the folder slugs of a skills directory, or one name per line of a text file. A slug is sorted as a slug,
// whatever its SKILL.md frontmatter says, since the CLI removes it by that slug.
export function readInstalled(path) {
  if (!existsSync(path)) throw new Refusal('--installed ' + path + ' does not exist');
  if (statSync(path).isDirectory()) return readdirSync(path, { withFileTypes: true }).filter((entry) => !entry.name.startsWith('.') && (entry.isDirectory() || (entry.isSymbolicLink() && statSync(join(path, entry.name), { throwIfNoEntry: false })?.isDirectory()))).map((entry) => entry.name);
  const names = [];
  readFileSync(path, 'utf8').split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith('#')) return;
    if (!/^[^\s\/\\]+$/.test(line)) throw new Refusal('--installed line ' + (i + 1) + ' is not one skill name: ' + JSON.stringify(raw));
    names.push(line);
  });
  return names;
}

// stale: a deprecated name; missing: a current name not installed; present: current and installed; unknown: neither.
// An installed replacement is present, so only its stale name is retired and the replacement is never added again.
export function classify(rules, installed) {
  const have = new Set(installed);
  const stale = rules.renames.filter(([from]) => have.has(from)).map(([from]) => ({ name: from, replacement: rules.finals.get(from), replacementInstalled: have.has(rules.finals.get(from)) }));
  const known = new Set([...rules.catalog, ...rules.finals.keys()]);
  return {
    stale,
    missing: rules.catalog.filter((name) => !have.has(name)),
    present: rules.catalog.filter((name) => have.has(name)),
    unknown: [...have].filter((name) => !known.has(name)).sort(),
  };
}

const cannot = (skill, reason, extra = {}) => ({ skill, result: 'cannot-compare', reason, ...extra });

// The lock is a lookup hint: its source must be the pinned upstream and its path one catalog skill folder's SKILL.md.
export function lockPath(lock, skill) {
  const entry = lock?.skills?.[skill];
  if (!entry || typeof entry !== 'object') return { reason: 'the lock has no entry for ' + skill };
  if (String(entry.source).toLowerCase() !== UPSTREAM.toLowerCase()) return { reason: 'the lock source is ' + JSON.stringify(entry.source) + ', not ' + UPSTREAM };
  if (!SOURCE_URL.test(String(entry.sourceUrl))) return { reason: 'the lock source URL is ' + JSON.stringify(entry.sourceUrl) + ', not https://github.com/' + UPSTREAM + '.git' };
  const path = entry.skillPath;
  if (typeof path !== 'string' || /\\|^\/|^[A-Za-z]:/.test(path)) return { reason: 'the lock skill path ' + JSON.stringify(path) + ' is absolute or not a forward-slash path' };
  const parts = path.split('/');
  if (parts.some((part) => part === '' || part === '.' || part === '..')) return { reason: 'the lock skill path ' + JSON.stringify(path) + ' has an empty, . or .. part' };
  if (parts.length !== 4 || parts[0] !== 'skills' || !PERSPECTIVES.includes(parts[1]) || parts[2] !== skill || parts[3] !== 'SKILL.md') {
    return { reason: 'the lock skill path ' + JSON.stringify(path) + ' is not skills/<' + PERSPECTIVES.join('|') + '>/' + skill + '/SKILL.md' };
  }
  return { path };
}

// Every published release, drafts skipped, newest first. The order only decides which tag is fetched first; no tag is
// excluded by its date.
export function releaseTags(releases) {
  if (!Array.isArray(releases)) throw new Error('the release list is not an array');
  return releases.filter((release) => release && !release.draft).map((release) => ({ tag: release.tag_name, at: Date.parse(release.published_at ?? release.created_at ?? '') || 0 })).sort((a, b) => b.at - a.at).map((release) => release.tag);
}

async function fetchReleases() {
  const all = [];
  for (let page = 1; ; page += 1) {
    const response = await fetch(RELEASES + '?per_page=100&page=' + page, { headers: { accept: 'application/vnd.github+json', 'user-agent': 're0-upgrade' } });
    if (response.status !== 200) throw new Error('GET ' + RELEASES + ' page ' + page + ' answered ' + response.status);
    const batch = await response.json();
    if (!Array.isArray(batch)) throw new Error('GET ' + RELEASES + ' page ' + page + ' is not a list');
    all.push(...batch);
    if (batch.length < 100) return all;
  }
}

// One raw file at one tag: its bytes, absent (a 404: the tag does not hold the path) or failed (anything else).
async function fromNetwork(tag, path) {
  try {
    const response = await fetch(RAW + tag.split('/').map(encodeURIComponent).join('/') + '/' + path, { headers: { 'user-agent': 're0-upgrade' } });
    if (response.status === 404) return { status: 'absent' };
    if (response.status !== 200) return { status: 'failed', reason: 'answered ' + response.status };
    return { status: 'ok', bytes: Buffer.from(await response.arrayBuffer()) };
  } catch (error) {
    return { status: 'failed', reason: error.message };
  }
}

// The offline layout <dir>/<tag>/<path>: a missing tag folder is a failed fetch, a missing file inside it a 404.
const fromDir = (dir) => async (tag, path) => {
  if (!existsSync(join(dir, tag))) return { status: 'failed', reason: 'no ' + join(dir, tag) };
  const file = join(dir, tag, ...path.split('/'));
  return existsSync(file) ? { status: 'ok', bytes: readFileSync(file) } : { status: 'absent' };
};

// A byte match at any published tag is clean. Otherwise every tag must have answered: a full walk is
// divergent-or-unknown, and a walk with a failed fetch or an unusable tag is cannot-compare. The lock's folder hash is
// never read.
export async function integrity({ installed, skill, lock, releases, raw }) {
  const located = lockPath(lock, skill);
  if (!located.path) return cannot(skill, located.reason);
  const { path } = located;
  let tags;
  try {
    tags = releaseTags(await releases());
  } catch (error) {
    return cannot(skill, 'the release list could not be read: ' + error.message, { path });
  }
  if (!tags.length) return cannot(skill, 'no published release to compare with', { path });
  const walked = [];
  for (const tag of tags) {
    if (typeof tag !== 'string' || !/^[A-Za-z0-9._\/+-]+$/.test(tag) || tag.split('/').some((part) => part === '' || part === '.' || part === '..')) {
      walked.push({ tag: String(tag), status: 'failed', reason: 'not a plain tag name' });
      continue;
    }
    const got = await raw(tag, path);
    if (got.status === 'ok' && got.bytes.equals(installed)) return { skill, result: 'clean', reason: 'matches ' + path + ' at ' + tag, path, match: tag, walked: [...walked, { tag, status: 'match' }] };
    walked.push(got.status === 'ok' ? { tag, status: 'differs' } : got.status === 'absent' ? { tag, status: 'absent' } : { tag, status: 'failed', reason: got.reason });
  }
  const failed = walked.filter((step) => step.status === 'failed');
  if (failed.length) return cannot(skill, 'no tag matched and ' + failed.length + ' of ' + tags.length + ' could not be fetched (' + failed.map((step) => step.tag + ': ' + step.reason).join('; ') + '), so the walk is incomplete', { path, walked });
  const held = walked.filter((step) => step.status === 'differs').length;
  return { skill, result: 'divergent-or-unknown', reason: 'all ' + tags.length + ' release tags were fetched; ' + held + ' hold ' + path + ' and none matches the installed bytes', path, walked };
}

export async function main(argv) {
  let values;
  let command;
  try {
    ({ values, positionals: [command] } = parseArgs({ args: argv, allowPositionals: true, options: {
      'skill-md': { type: 'string' }, installed: { type: 'string' }, 'installed-file': { type: 'string' }, skill: { type: 'string' }, lock: { type: 'string' },
      'releases-json': { type: 'string' }, 'raw-dir': { type: 'string' }, fetch: { type: 'boolean' }, help: { type: 'boolean' },
    } }));
    if (values.help) {
      console.log(USAGE);
      return 0;
    }
    if (!['classify', 'integrity'].includes(command)) throw new Refusal('name classify or integrity');
    const required = { classify: ['skill-md', 'installed'], integrity: ['installed-file', 'skill', 'lock'] }[command];
    const missing = required.filter((name) => !values[name]);
    if (missing.length) throw new Refusal('missing ' + missing.map((name) => '--' + name).join(', '));
    if (command === 'classify') {
      if (!existsSync(values['skill-md'])) throw new Refusal('--skill-md ' + values['skill-md'] + ' does not exist');
      const result = classify(readRules(readFileSync(values['skill-md'], 'utf8')), readInstalled(values.installed));
      console.log(JSON.stringify(result, null, 2));
      return result.stale.length || result.missing.length ? 1 : 0;
    }
    if (!values['releases-json'] && !values.fetch) throw new Refusal('pass --releases-json <file> or --fetch');
    if (!values['raw-dir'] && !values.fetch) throw new Refusal('pass --raw-dir <dir> or --fetch');
    if (!SLUG.test(values.skill)) throw new Refusal('--skill ' + values.skill + ' is not a skill slug');
    if (!statSync(values['installed-file'], { throwIfNoEntry: false })?.isFile()) throw new Refusal('--installed-file ' + values['installed-file'] + ' is not a file');
  } catch (error) {
    if (error instanceof TypeError || error instanceof Refusal) {
      console.error('re0-upgrade: ' + error.message + '\n' + USAGE);
      return 2;
    }
    throw error;
  }
  let lock;
  try {
    lock = JSON.parse(readFileSync(values.lock, 'utf8'));
  } catch (error) {
    console.log(JSON.stringify(cannot(values.skill, 'the lock ' + values.lock + ' could not be read as JSON: ' + error.message), null, 2));
    return 1;
  }
  const releasesFile = values['releases-json'];
  const result = await integrity({
    installed: readFileSync(values['installed-file']),
    skill: values.skill,
    lock,
    releases: releasesFile ? async () => JSON.parse(readFileSync(releasesFile, 'utf8')) : fetchReleases,
    raw: values['raw-dir'] ? fromDir(values['raw-dir']) : fromNetwork,
  });
  console.log(JSON.stringify(result, null, 2));
  return result.result === 'clean' ? 0 : 1;
}

// An installed skill is often a link to its source folder; Node resolves import.meta.url through the link while argv keeps
// the link path, so both sides are compared as real paths or a call through the link exits 0 having done nothing.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) process.exitCode = await main(process.argv.slice(2));
