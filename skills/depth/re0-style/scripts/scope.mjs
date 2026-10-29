#!/usr/bin/env node
// Scan target files for what re0-style step 2 excludes before any counting or editing.
// Per file: linguist-generated and linguist-vendored attributes (read with git check-attr), a generated-file header in the first lines,
// formatter and linter off markers with their line numbers, and the style config files that apply from the file's folder up to the repository root.
// A hit is a lead for a reader, never a verdict: the skill judges what each config says and which regions to protect.
// Usage: node scope.mjs <files...> [--json]
// Exit codes: 0 no file is flagged; 3 one or more files are flagged; 2 usage error or an unreadable input.
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, isAbsolute, join, parse, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const USAGE = 'usage: node scope.mjs <files...> [--json]';

export class InputError extends Error {}

const HEADER_LINES = 10;
const HEADER = /@generated|\bdo not (?:edit|modify)\b|\bauto-?generated\b|\b(?:code )?generated (?:by|from|file)\b|\bthis file (?:is|was) generated\b/i;
const MARKERS = [
  /prettier-ignore/,
  /eslint-disable/,
  /biome-ignore/,
  /stylelint-disable/,
  /@formatter:(?:off|on)/,
  /\bfmt:\s*(?:off|on|skip)\b/,
  /\byapf:\s*disable/,
  /\bisort:\s*skip/,
  /\bblack:\s*off/,
  /\bnoqa\b/,
  /\bpylint:\s*disable/,
  /rustfmt::skip/,
  /clang-format\s+(?:off|on)/,
  /\bnolint\b/,
  /\brubocop:disable/,
  /\bdprint-ignore/,
  /\bautopep8:\s*off/,
];
const CONFIG_EXACT = new Set([
  '.editorconfig', '.eslintignore', '.prettierignore', '.stylelintignore', '.git-blame-ignore-revs', 'biome.json', 'biome.jsonc', 'deno.json', 'deno.jsonc',
  'pyproject.toml', 'setup.cfg', 'tox.ini', '.flake8', 'ruff.toml', '.ruff.toml', '.pylintrc', 'rustfmt.toml', '.rustfmt.toml', 'clippy.toml',
  '.clang-format', '.clang-tidy', '.rubocop.yml', '.golangci.yml', '.golangci.yaml', 'dprint.json', '.dprint.json', '.gitattributes',
]);
const CONFIG_PREFIX = ['.prettierrc', 'prettier.config.', '.eslintrc', 'eslint.config.', '.stylelintrc', 'stylelint.config.', '.golangci.'];

const toPosix = (path) => path.split(sep).join('/');
const isConfig = (name) => CONFIG_EXACT.has(name) || CONFIG_PREFIX.some((p) => name.startsWith(p));

function git(cwd, args) {
  const run = spawnSync('git', args, { cwd, encoding: 'utf8' });
  return run.status === 0 ? run.stdout : null;
}

export function repoRoot(dir) {
  const out = git(dir, ['rev-parse', '--show-toplevel']);
  return out ? resolve(out.trim()) : null;
}

// Returns the attribute names among linguist-generated and linguist-vendored that are set for the file.
export function attributes(file) {
  const out = git(dirname(file), ['check-attr', '-z', 'linguist-generated', 'linguist-vendored', '--', file]);
  if (!out) return [];
  const parts = out.split('\0');
  const set = [];
  for (let i = 0; i + 2 < parts.length; i += 3) {
    if (parts[i + 2] === 'set' || parts[i + 2] === 'true') set.push(parts[i + 1]);
  }
  return set;
}

export function scanText(text) {
  const lines = text.split(/\r?\n/);
  const header = lines.slice(0, HEADER_LINES).findIndex((line) => HEADER.test(line));
  const markers = [];
  lines.forEach((line, index) => {
    if (MARKERS.some((re) => re.test(line))) markers.push({ line: index + 1, text: line.trim() });
  });
  return { header: header < 0 ? null : { line: header + 1, text: lines[header].trim() }, markers };
}

// Style config files from the file's folder up to the repository root, or to the filesystem root outside a repository.
export function configsAbove(file, root) {
  const found = [];
  let dir = dirname(file);
  const top = root ?? parse(dir).root;
  for (;;) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isFile() && isConfig(entry.name)) found.push(join(dir, entry.name));
    }
    if (dir === top || dirname(dir) === dir) break;
    dir = dirname(dir);
  }
  return found;
}

const display = (file) => {
  const rel = relative(process.cwd(), file);
  return toPosix(rel && !rel.startsWith('..') && !isAbsolute(rel) ? rel : file);
};

export function scope(paths) {
  const files = [];
  for (const raw of paths) {
    const file = resolve(raw);
    if (!existsSync(file)) throw new InputError('no such path: ' + raw);
    if (!statSync(file).isFile()) throw new InputError('not a file: ' + raw);
    const buffer = readFileSync(file);
    const text = buffer.includes(0) ? { header: null, markers: [] } : scanText(buffer.toString('utf8'));
    const root = repoRoot(dirname(file));
    const attrs = root ? attributes(file) : [];
    files.push({
      file: display(file),
      attributes: attrs,
      header: text.header,
      markers: text.markers,
      configs: configsAbove(file, root).map(display),
      flagged: attrs.length > 0 || text.header !== null || text.markers.length > 0,
    });
  }
  return { files };
}

export function format(result) {
  const out = [];
  for (const f of result.files) {
    out.push(f.file + (f.flagged ? '  FLAGGED' : '  clean'));
    for (const a of f.attributes) out.push('  attribute: ' + a);
    if (f.header) out.push('  generated header: line ' + f.header.line + '  ' + f.header.text);
    for (const m of f.markers) out.push('  off marker: line ' + m.line + '  ' + m.text);
    out.push('  configs: ' + (f.configs.length ? f.configs.join(', ') : 'none'));
  }
  const flagged = result.files.filter((f) => f.flagged).length;
  out.push(flagged + ' flagged in ' + result.files.length + ' file(s)');
  return out.join('\n');
}

export function main(argv) {
  let values;
  let positionals;
  try {
    ({ values, positionals } = parseArgs({ args: argv, allowPositionals: true, options: { json: { type: 'boolean' }, help: { type: 'boolean' } } }));
  } catch (error) {
    if (typeof error.code === 'string' && error.code.startsWith('ERR_PARSE_ARGS')) {
      console.error(error.message + '\n' + USAGE);
      return 2;
    }
    throw error;
  }
  if (values.help) {
    console.log(USAGE);
    return 0;
  }
  if (!positionals.length) {
    console.error('name at least one file\n' + USAGE);
    return 2;
  }
  let result;
  try {
    result = scope(positionals);
  } catch (error) {
    if (error instanceof InputError) {
      console.error('scope: ' + error.message + '\n' + USAGE);
      return 2;
    }
    throw error;
  }
  console.log(values.json ? JSON.stringify(result) : format(result));
  return result.files.some((f) => f.flagged) ? 3 : 0;
}

// An installed skill is often a link to its source folder; Node resolves import.meta.url through the link while argv keeps
// the link path, so both sides are compared as real paths or a call through the link exits 0 having done nothing.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) process.exitCode = main(process.argv.slice(2));
