#!/usr/bin/env node
// Report the lines of a repository's README.md written for an agent, the lines of its AGENTS.md written for a person, and
// the manifests (package.json, plugin and marketplace files, agents/openai.yaml) whose names or addresses disagree.
// The rules are one table with stable ids; every matching rule is reported, sorted by file, line and id.
// Usage: node audit.mjs [<repo-root>] [--kind app|cli|library|skills] [--loop-dir <name>]... [--host <owner/repo>] [--strict] [--json] [--rules]
// Exit codes: 0 no fail finding; 1 a fail finding, any finding under --strict, or no AGENTS.md; 2 usage or an unreadable input.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

export const KINDS = Object.freeze(['app', 'cli', 'library', 'skills']);
const USAGE = 'usage: node audit.mjs [<repo-root>] [--kind ' + KINDS.join('|') + '] [--loop-dir <name>]... [--host <owner/repo>] [--strict] [--json] [--rules]';

export class InputError extends Error {}

const COMMUNITY = ['readme', 'code_of_conduct', 'contributing', 'license', 'security', 'issue_template', 'pull_request_template'];

function fetchImage(url) {
  const result = spawnSync('curl', ['-fsSL', url], { maxBuffer: 20 * 1024 * 1024 });
  if (result.status !== 0 || !Buffer.isBuffer(result.stdout)) throw new InputError('cannot fetch social preview');
  return result.stdout;
}

export function readHost(name, run = spawnSync, fetcher = fetchImage) {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(name)) throw new InputError('expected owner/repo');
  const [owner, repo] = name.split('/');
  const call = (args) => {
    const result = run('gh', args, { encoding: 'utf8' });
    if (result.status !== 0) throw new InputError('gh api failed: ' + (result.stderr || 'unknown error'));
    try { return JSON.parse(result.stdout); } catch { throw new InputError('gh api returned invalid JSON'); }
  };
  const info = call(['api', 'repos/' + name]);
  const readme = call(['api', 'repos/' + name + '/readme']);
  const community = call(['api', 'repos/' + name + '/community/profile']);
  const graph = call(['api', 'graphql', '-f', 'query=query($owner:String!,$name:String!){repository(owner:$owner,name:$name){usesCustomOpenGraphImage openGraphImageUrl}}', '-f', 'owner=' + owner, '-f', 'name=' + repo]);
  const preview = graph?.data?.repository;
  if (!(typeof info.description === 'string' || info.description === null) || !Array.isArray(info.topics) || !info.topics.every(t => typeof t === 'string') || !(typeof info.homepage === 'string' || info.homepage === null) || readme.encoding !== 'base64' || typeof readme.content !== 'string' || !community.files || !COMMUNITY.filter(k => k !== 'security').every(k => Object.hasOwn(community.files, k)) || typeof preview?.usesCustomOpenGraphImage !== 'boolean' || typeof preview.openGraphImageUrl !== 'string') throw new InputError('host response missing required fields');
  let image;
  if (preview.usesCustomOpenGraphImage) {
    try { image = fetcher(preview.openGraphImageUrl); } catch (error) { throw new InputError('cannot fetch social preview: ' + error.message); }
    if (!Buffer.isBuffer(image)) throw new InputError('social preview is not bytes');
  }
  return { description: info.description, topics: info.topics, homepage: info.homepage, readme: Buffer.from(readme.content, 'base64').toString('utf8'), community: community.files, customPreview: preview.usesCustomOpenGraphImage, previewUrl: preview.openGraphImageUrl, image };
}

function dimensions(b) {
  if (!Buffer.isBuffer(b)) return null;
  if (b.length >= 24 && b.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')) && b.toString('ascii',12,16) === 'IHDR') return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b.length >= 10 && ['GIF87a','GIF89a'].includes(b.toString('ascii',0,6))) return [b.readUInt16LE(6), b.readUInt16LE(8)];
  if (b.length >= 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 3 < b.length) {
      if (b[i++] !== 0xff) return null;
      while (b[i] === 0xff) i++;
      const marker = b[i++];
      if (marker === 0xd9 || marker === 0xda) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (i + 2 > b.length) break;
      const length = b.readUInt16BE(i);
      if (length < 2 || i + length > b.length) break;
      if ([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker) && length >= 7) return [b.readUInt16BE(i+5), b.readUInt16BE(i+3)];
      i += length;
    }
  }
  return null;
}

export function auditHost(surface, { strict = false } = {}) {
  const findings = [];
  const options = [];
  const add = (id, text) => findings.push({ id, text });
  const offer = (id, text) => options.push({ id, text });
  const opening = surface.readme.split(/\r?\n/).map(line => line.trim()).find(line => line && !line.startsWith('#') && !line.startsWith('[') && !line.startsWith('<')) || '';
  // A description of several sentences is compared with as many opening sentences.
  const sentences = (text) => text.match(/[^.!?]*[.!?]+(?=\s|$)/g)?.map(s => s.trim()) || [text];
  const count = sentences(surface.description || '').length;
  const sentence = sentences(opening).slice(0, count).join(' ') || opening;
  if (surface.description !== sentence) add('H1', 'Review description against README opening and claims');
  if (surface.topics.some(t => !/^[a-z0-9-]+$/.test(t) || t.length > 50)) add('H2', 'Invalid topic');
  if (surface.topics.length > 20) add('H3', 'More than 20 topics');
  if (!surface.homepage) add('H4', 'Homepage missing');
  if (!surface.customPreview) offer('H5', 'Optional: a custom social preview replaces the default card, which shows live stars, forks and contributors; upload one only if the image is worth more than those counts');
  const missing = COMMUNITY.filter(k => !surface.community[k]);
  if (missing.length) add('H6', 'Community profile gaps: ' + missing.join(', '));
  if (Buffer.byteLength(surface.readme) > 500 * 1024) add('H7', 'README exceeds 500 KiB');
  if (surface.customPreview) {
    const size = dimensions(surface.image);
    if (!size || surface.image.length >= 1000000 || size[0] < 640 || size[1] < 320) add('H8', 'Social preview must be PNG, JPEG or GIF under 1 MB and at least 640x320; 1280x640 recommended');
  }
  return { findings, options, ok: !strict || findings.length === 0 };
}

const isDir = (path) => existsSync(path) && statSync(path).isDirectory();
const subdirs = (dir) => (isDir(dir) ? readdirSync(dir).filter((name) => !name.startsWith('.') && name !== 'node_modules' && isDir(join(dir, name))) : []);

function readPackage(dir) {
  const file = join(dir, 'package.json');
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    if (error instanceof SyntaxError) throw new InputError(file + ' does not parse: ' + error.message);
    throw error;
  }
}

// The same line is product surface in one kind and drift in another: commands are the product of a CLI, agent
// vocabulary is the subject of a skills catalog, pictures are the product of an app. Read from files, never from prose.
export function detectKind(dir) {
  const has = (path) => existsSync(join(dir, path));
  const skillsAt = (base, depth) => subdirs(base).reduce((n, name) => n + (existsSync(join(base, name, 'SKILL.md')) ? 1 : 0) + (depth > 0 ? skillsAt(join(base, name), depth - 1) : 0), 0);
  const skillFolders = skillsAt(dir, 0) + (has('skills') ? skillsAt(join(dir, 'skills'), 1) : 0);
  const pkg = readPackage(dir);
  if (skillFolders >= 2 && !(pkg && (pkg.bin || pkg.workspaces))) return 'skills';
  const workspaceBin = pkg && pkg.workspaces && has('packages') && subdirs(join(dir, 'packages')).some((name) => readPackage(join(dir, 'packages', name))?.bin);
  if ((pkg && pkg.bin) || workspaceBin) return 'cli';
  if (has('Cargo.toml') && has(join('src', 'main.rs'))) return 'cli';
  if (has('pyproject.toml') && /\[project\.scripts\]/.test(readFileSync(join(dir, 'pyproject.toml'), 'utf8'))) return 'cli';
  if (pkg && (pkg.workspaces || has('apps') || has('index.html') || has('public'))) return 'app';
  if (pkg && (pkg.main || pkg.exports || pkg.module)) return 'library';
  if (has('Cargo.toml') || has('pyproject.toml') || has('go.mod')) return 'library';
  return 'app';
}

// A dot-directory the repository's own .gitignore excludes never exists in a clone, so a README pointing a reader into it
// points at an agent's or a tool's local state. Names come from the repository, never from a list of harnesses.
export function ignoredDotDirs(dir) {
  const file = join(dir, '.gitignore');
  if (!existsSync(file)) return [];
  const names = readFileSync(file, 'utf8').split(/\r?\n/).map((line) => line.trim().replace(/^\//, '').replace(/\/$/, ''));
  return [...new Set(names.filter((name) => /^\.[\w.-]+$/.test(name)))];
}

const escape = (text) => text.replace(/[.*+?^$\{}()|[\]\\]/g, '\\$&');
const LOCAL_FILE = '\\.local\\.(md|json|txt|log|sqlite)\\b|\\*\\.local\\*';
const CHECK_WORDS = /^(\$\s*)?(pnpm|npm|yarn|bun|corepack|npx|cargo|make|go|python3?|uv)\s+(run\s+|-r\s+)?(check|lint|test|typecheck|verify|sweep|walk|gate|audit)/i;
const README_SEV = { app: 'fail', cli: 'note', library: 'note', skills: 'note' };
const AGENTS_SEV = { app: 'fail', cli: 'fail', library: 'fail', skills: 'fail' };

// Severity per kind: "fail" exits 1, "note" is reported, "off" is not checked. --strict raises note to fail.
export function buildRules(localDirs) {
  const dirs = localDirs.length ? '(^|[\\s\x60(/])(' + localDirs.map(escape).join('|') + ')/|' : '';
  const rule = (id, file, why, re, sev) => ({ id, file, why, re, sev });
  return [
    rule('R1', 'README.md', 'a check, lint, test or gate command', /(^|[\s\x60])(pnpm|npm|yarn|bun|corepack|npx|cargo|make|go|python3?|uv|poetry|mvn|gradle)\s+(run\s+|-r\s+)?(check|lint|test|typecheck|verify|sweep|walk|gate|audit)[\w:.-]*/i, README_SEV),
    rule('R2', 'README.md', 'a repository script invoked by path', /(^|[\s\x60])(node|python3?|bash|sh|bun|deno)\s+[\w./-]*scripts\/[\w./-]+/, README_SEV),
    rule('R3', 'README.md', 'a port number', /\b(localhost|127\.0\.0\.1|0\.0\.0\.0):\d{2,5}\b|\bport\s*:?\s*\d{2,5}\b/i, README_SEV),
    rule('R4', 'README.md', 'an environment variable being set or prescribed', /(^|[\s\x60(])[A-Z][A-Z0-9]*_[A-Z0-9_]{2,}=|\b(set|export|give|pass|with)\s+\x60?[A-Z][A-Z0-9]*_[A-Z0-9_]{2,}\x60?(\s|=|$)/, README_SEV),
    rule('R5', 'README.md', 'a loop-state or local-only path', new RegExp(dirs + LOCAL_FILE), README_SEV),
    rule('R6', 'README.md', 'an evidence, capture or transcript path', /(?<![\w-])(evidence|transcripts?|screencasts?|captures?|rollouts?)\/[\w.-]+/i, README_SEV),
    rule('R7', 'README.md', 'loop or harness vocabulary', /\b(checkpoint(ed|s)?|sub-?agents?|context window|compaction|force[- ]with[- ]lease|orphan commit|signed commits?|--porcelain|quality gate|gate is green|gates? (are|were) green)\b/i, { ...README_SEV, skills: 'off' }),
    rule('R8', 'README.md', 'a process obligation on the reader (before committing, must pass, run before)', /\b(before (committing|merging|opening a PR|a commit)|must (be|pass|stay) green|run (this|these|it) before)\b/i, README_SEV),
    rule('R9', 'README.md', 'a code fence whose first command is a check', null, README_SEV),
    rule('R10', 'README.md', 'repeated first-column groups: consider one section per group', null, { app: 'warn', cli: 'warn', library: 'warn', skills: 'warn' }),
    rule('R11', 'README.md', 'status column: consider icons with words and a one-sentence legend', null, { app: 'note', cli: 'note', library: 'note', skills: 'note' }),
    rule('R12', 'README.md', 'mobile support without a phone screenshot', null, { app: 'fail', cli: 'off', library: 'off', skills: 'off' }),
    rule('A1', 'AGENTS.md', 'an image', /!\[[^\]]*\]\([^)]*\.(gif|png|jpe?g|webp|svg)\)|<img\s/i, AGENTS_SEV),
    rule('A2', 'AGENTS.md', 'a badge', /img\.shields\.io|\[!\[/i, AGENTS_SEV),
    rule('A3', 'AGENTS.md', 'a pitch sentence', /\b(imagine|your team will|the best way to|world[- ]class|blazing(ly)? fast|delightful|effortless(ly)?|seamless(ly)?)\b/i, AGENTS_SEV),
    rule('A4', 'AGENTS.md', 'an instruction phrased for a player or end user', /^(press|tap|drag|walk|click)\s+(the\s+)?[A-Z][^\x60{}<>]{0,50}$/im, AGENTS_SEV),
  ];
}

// One pass over the file: prose lines and fenced blocks, each fence with its first command line.
const FENCE = /^\s*(\x60{3,}|~{3,})/;
export function parse(text) {
  const lines = [];
  const fences = [];
  let open = null;
  text.split(/\r?\n/).forEach((raw, i) => {
    const n = i + 1;
    if (FENCE.test(raw)) {
      if (open) {
        fences.push(open);
        open = null;
      } else open = { start: n, first: '' };
      lines.push({ n, raw, code: true });
      return;
    }
    if (open) {
      if (!open.first && raw.trim()) open.first = raw.trim();
      lines.push({ n, raw, code: true });
      return;
    }
    lines.push({ n, raw, code: false });
  });
  if (open) fences.push(open);
  return { lines, fences };
}

function scan(root, file, kind, rules) {
  const path = join(root, file);
  if (!existsSync(path)) return { file, missing: true, hits: [] };
  const { lines, fences } = parse(readFileSync(path, 'utf8'));
  const hits = [];
  const live = rules.filter((r) => r.file === file && r.re && r.sev[kind] !== 'off');
  for (const line of lines) {
    if (!line.raw.trim()) continue;
    if (line.code && (file === 'AGENTS.md' || kind !== 'app')) continue;
    for (const r of live) if (r.re.test(line.raw)) hits.push({ line: line.n, id: r.id, sev: r.sev[kind], why: r.why, text: line.raw.trim().slice(0, 120) });
  }
  const r9 = rules.find((r) => r.id === 'R9');
  if (file === 'README.md' && r9.sev[kind] !== 'off') {
    for (const fence of fences) if (CHECK_WORDS.test(fence.first)) hits.push({ line: fence.start, id: 'R9', sev: r9.sev[kind], why: r9.why, text: fence.first.slice(0, 120) });
  }
  if (file === 'README.md' && kind === 'app') {
    const walk = (dir) => readdirSync(dir, { withFileTypes: true }).some((entry) => {
      if (entry.name.startsWith('.') || ['node_modules', 'dist', 'build'].includes(entry.name)) return false;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return walk(path);
      if (!entry.isFile()) return false;
      if (/^(manifest.*\.webmanifest|manifest\.json|capacitor\.config\.[cm]?[jt]s|app\.json)$/i.test(entry.name)) return true;
      if (!/\.(html?|[cm]?[jt]sx?)$/i.test(entry.name)) return false;
      const content = readFileSync(path, 'utf8');
      return /<meta\b[^>]*\bname\s*=\s*["']viewport["']/i.test(content) || /(?:viewport|width)[^\n]{0,80}\b320\b/i.test(content);
    });
    // Alt text and filenames identify the intended device even when images are remote or composite.
    const phone = lines.some(({ raw, code }) => !code && /(?:!\[[^\]]*(?:phone|mobile)[^\]]*\]\([^)]*\)|!\[[^\]]*\]\([^)]*(?:phone|mobile)[^)]*\)|<img\b[^>]*(?:phone|mobile)[^>]*>)/i.test(raw));
    if (walk(root) && !phone) {
      const rule = rules.find((r) => r.id === 'R12');
      hits.push({ line: 1, id: rule.id, sev: rule.sev[kind], why: rule.why, text: 'README has no phone image' });
    }
  }
  if (file === 'README.md') {
    const tableRow = (raw) => raw.trim().startsWith('|') ? raw.trim().slice(1).replace(/\|$/, '').split(/(?<!\\)\|/).map((cell) => cell.trim()) : null;
    for (let i = 0; i + 2 < lines.length; i++) {
      const header = !lines[i].code && tableRow(lines[i].raw);
      const separator = !lines[i + 1].code && tableRow(lines[i + 1].raw);
      if (!header || !separator || separator.length !== header.length || !separator.every((cell) => /^:?-{3,}:?$/.test(cell))) continue;
      const rows = [];
      let j = i + 2;
      while (j < lines.length && !lines[j].code) {
        const cells = tableRow(lines[j].raw);
        if (!cells || cells.length !== header.length) break;
        rows.push(cells);
        j++;
      }
      const add = (id) => {
        const rule = rules.find((r) => r.id === id);
        hits.push({ line: lines[i].n, id, sev: rule.sev[kind], why: rule.why, text: lines[i].raw.trim().slice(0, 120) });
      };
      if (rows.some((row, index) => index && row[0] && row[0] === rows[index - 1][0])) add('R10');
      if (header.some((_, col) => {
        const values = rows.map((row) => row[col]);
        const unique = new Set(values);
        return values.length >= 2 && unique.size >= 2 && unique.size <= 5 && values.every((value) => /^[A-Za-z]+$/.test(value)) && unique.size < values.length;
      })) add('R11');
      i = j - 1;
    }
  }
  hits.sort((a, b) => a.line - b.line || a.id.localeCompare(b.id));
  return { file, missing: false, lines: lines.length, hits };
}

// The files a host or registry reads before any person opens README: the package manifest, the plugin and marketplace
// manifests and each skill's agents/openai.yaml. One repository answers to one name in all of them, its addresses point
// at its own origin, and a plugin lists exactly the skill folders it ships.
export const MANIFESTS = Object.freeze(['package.json', '.claude-plugin/plugin.json', '.claude-plugin/marketplace.json', '.codex-plugin/plugin.json', '.agents/plugins/marketplace.json']);
export const MANIFEST_RULES = Object.freeze([
  { id: 'M1', why: 'a manifest name differs from the repository name' },
  { id: 'M2', why: 'a manifest address names another repository of the same owner' },
  { id: 'M3', why: 'a plugin skills list and the skill folders disagree' },
  { id: 'M4', why: 'a skill folder whose agents/openai.yaml is missing or never names $<skill>' },
]);
export const normalizeName = (name) => String(name).replace(/^@[^/]+\//, '').toLowerCase().replace(/[^a-z0-9]/g, '');

export function repositoryName(root) {
  const run = spawnSync('git', ['-C', root, 'remote', 'get-url', 'origin'], { encoding: 'utf8' });
  const match = run.status === 0 && run.stdout.trim().match(/github\.com[:/]([^/]+)\/([^/]+?)(\.git)?$/);
  return match ? { owner: match[1], name: match[2] } : { owner: null, name: basename(root) };
}

// Skill folders, as paths relative to the root: one level at the root, or up to two below skills/.
export function skillFolders(root) {
  const found = [];
  const walk = (base, rel, depth) => {
    for (const name of subdirs(base)) {
      const path = rel + '/' + name;
      if (existsSync(join(base, name, 'SKILL.md'))) found.push(path);
      else if (depth > 0) walk(join(base, name), path, depth - 1);
    }
  };
  for (const name of subdirs(root)) if (existsSync(join(root, name, 'SKILL.md'))) found.push(name);
  if (isDir(join(root, 'skills'))) walk(join(root, 'skills'), 'skills', 1);
  return found.sort();
}

const strings = (value) => (typeof value === 'string' ? [value] : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : []);

export function auditManifests(root) {
  const repo = repositoryName(root);
  const hits = [];
  const hit = (id, file, text) => hits.push({ file, line: 1, id, sev: 'fail', why: MANIFEST_RULES.find((r) => r.id === id).why, text });
  const folders = skillFolders(root);
  for (const file of MANIFESTS) {
    if (!existsSync(join(root, file))) continue;
    let data;
    try {
      data = JSON.parse(readFileSync(join(root, file), 'utf8'));
    } catch (error) {
      if (error instanceof SyntaxError) throw new InputError(file + ' does not parse: ' + error.message);
      throw error;
    }
    const names = [data.name, ...(Array.isArray(data.plugins) ? data.plugins.map((p) => p?.name) : [])].filter((n) => typeof n === 'string');
    for (const name of names) if (normalizeName(name) !== normalizeName(repo.name)) hit('M1', file, name + ' (repository ' + repo.name + ')');
    if (repo.owner) {
      for (const text of strings(data)) {
        for (const m of text.matchAll(/github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?(?=[/#?]|$)/gi)) {
          if (m[1].toLowerCase() === repo.owner.toLowerCase() && m[2].toLowerCase() !== repo.name.toLowerCase()) hit('M2', file, m[0]);
        }
      }
    }
    if (Array.isArray(data.skills)) {
      const listed = data.skills.map((s) => String(s).replace(/^\.\//, '').replace(/\/$/, ''));
      for (const f of folders) if (!listed.includes(f)) hit('M3', file, f + ' is not listed');
      for (const l of listed) if (!folders.includes(l)) hit('M3', file, l + ' is listed but is not a skill folder');
    }
  }
  for (const folder of folders) {
    const file = folder + '/agents/openai.yaml';
    const name = folder.split('/').at(-1);
    if (!existsSync(join(root, file))) hit('M4', file, 'missing');
    else if (!readFileSync(join(root, file), 'utf8').includes('$' + name)) hit('M4', file, 'never names $' + name);
  }
  hits.sort((a, b) => a.file.localeCompare(b.file) || a.id.localeCompare(b.id));
  return { file: 'manifests', missing: false, repository: repo.name, hits };
}


export function audit(root, { kind, loopDirs = [], strict = false } = {}) {
  if (!isDir(root)) throw new InputError('not a directory: ' + root);
  if (kind !== undefined && !KINDS.includes(kind)) throw new InputError('kind must be one of ' + KINDS.join(', '));
  const resolvedKind = kind ?? detectKind(root);
  const localDirs = [...new Set([...ignoredDotDirs(root), ...loopDirs])];
  const rules = buildRules(localDirs);
  const readme = scan(root, 'README.md', resolvedKind, rules);
  const agents = scan(root, 'AGENTS.md', resolvedKind, rules);
  const manifests = auditManifests(root);
  const failing = (hit) => hit.sev === 'fail' || (strict && (hit.sev === 'note' || hit.sev === 'warn'));
  const all = [...readme.hits, ...agents.hits, ...manifests.hits];
  for (const hit of all) hit.failing = failing(hit);
  const fails = all.filter((hit) => hit.failing).length + (agents.missing ? 1 : 0);
  const notes = all.length - all.filter((hit) => hit.failing).length;
  return { root, kind: resolvedKind, kindSource: kind ? 'given' : 'detected', strict, localDirs, readme, agents, manifests, fails, notes, ok: fails === 0 };
}

export function format(result) {
  const out = ['kind ' + result.kind + ' (' + result.kindSource + ')' + (result.strict ? ', strict' : '')];
  for (const r of [result.readme, result.agents]) {
    if (r.missing) {
      out.push(r.file + ': missing' + (r.file === 'AGENTS.md' ? ' (agent material in README usually means this file does not exist yet)' : ''));
      continue;
    }
    const failed = r.hits.filter((hit) => hit.failing).length;
    out.push(r.file + ': ' + (r.hits.length ? failed + ' fail, ' + (r.hits.length - failed) + ' note' : 'clean') + ' (' + r.lines + ' lines)');
    for (const hit of r.hits) out.push('  ' + (hit.failing ? 'FAIL ' : hit.sev + ' ') + hit.id + ' L' + hit.line + ' ' + hit.why + ': ' + hit.text);
  }
  const m = result.manifests;
  out.push('manifests: ' + (m.hits.length ? m.hits.length + ' fail' : 'clean') + ' (repository ' + m.repository + ')');
  for (const hit of m.hits) out.push('  FAIL ' + hit.id + ' ' + hit.file + ' ' + hit.why + ': ' + hit.text);
  out.push(result.fails ? 'AUDIENCE RED ' + result.fails : 'AUDIENCE GREEN' + (result.notes ? ' (' + result.notes + ' note)' : ''));
  return out.join('\n');
}

export function main(argv) {
  let values;
  let positionals;
  try {
    ({ values, positionals } = parseArgs({ args: argv, allowPositionals: true, options: {
      host: { type: 'string' }, kind: { type: 'string' }, 'loop-dir': { type: 'string', multiple: true, default: [] },
      strict: { type: 'boolean' }, json: { type: 'boolean' }, rules: { type: 'boolean' }, help: { type: 'boolean' },
    } }));
  } catch (error) {
    if (error instanceof TypeError) {
      console.error(error.message + '\n' + USAGE);
      return 2;
    }
    throw error;
  }
  if (values.help) {
    console.log(USAGE);
    return 0;
  }
  if (values.host !== undefined) {
    if (positionals.length || values.kind !== undefined || values['loop-dir'].length || values.rules) {
      console.error('host cannot be combined with a root, --kind, --loop-dir or --rules');
      return 2;
    }
    try {
      const result = auditHost(readHost(values.host), { strict: values.strict });
      console.log(values.json ? JSON.stringify(result) : [...result.findings.map(f => f.id + ' ' + f.text), ...result.options.map(o => 'option ' + o.id + ' ' + o.text)].join('\n') || 'HOST GREEN');
      return result.ok ? 0 : 1;
    } catch (error) {
      if (!(error instanceof InputError)) throw error;
      console.error('audit: ' + error.message);
      return 2;
    }
  }
  if (values.rules) {
    for (const r of buildRules([])) console.log(r.id + '  ' + r.file.padEnd(9) + ' ' + KINDS.map((k) => k + '=' + r.sev[k]).join(' ') + '  ' + r.why);
    for (const r of MANIFEST_RULES) console.log(r.id + '  manifests ' + KINDS.map((k) => k + '=fail').join(' ') + '  ' + r.why);
    return 0;
  }
  if (positionals.length > 1) {
    console.error('one repository root at most\n' + USAGE);
    return 2;
  }
  let result;
  try {
    result = audit(positionals[0] ?? process.cwd(), { kind: values.kind, loopDirs: values['loop-dir'], strict: values.strict === true });
  } catch (error) {
    if (error instanceof InputError) {
      console.error('audit: ' + error.message + '\n' + USAGE);
      return 2;
    }
    throw error;
  }
  console.log(values.json ? JSON.stringify(result) : format(result));
  return result.fails ? 1 : 0;
}

// An installed skill is often a link to its source folder; Node resolves import.meta.url through the link while argv keeps
// the link path, so both sides are compared as real paths or a call through the link exits 0 having done nothing.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) process.exitCode = main(process.argv.slice(2));
