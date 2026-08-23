#!/usr/bin/env node
'use strict';
/*
 * README bold-link roster drift-guard (EN vs localized).
 *
 * The English README.md at repo root is the source of truth for the skill roster's presentation
 * to human readers. The 10 localized copies under docs/readme/README.<lang>.md are hand-maintained
 * translations that snapshotted at ba9ae6e and have received no content updates since — every
 * skill added or renamed on the English side needs to be mirrored, and CLAUDE.md's shipping
 * checklist (step 2) already requires it. This check enforces the mechanical half of that rule:
 * each translation must list the same **[<skill>](path) bold-links as English, in the same order.
 *
 * Scope — intentionally narrow. This script verifies only the bold-link skill SET and ORDER; it
 * does not judge translated prose, tone, or completeness. The "not the order" carve-out from
 * check-catalog-sync applies to the four internal roster surfaces (plugin.json / catalog.cjs /
 * re0-upgrade / EN README) which the maintainer holds by hand; localized READMEs are outside
 * that boundary because they are downstream mirrors of the EN README, not peers of it.
 *
 * Default is warn-only (exit 0) so a translation lag never blocks CI. Pass --strict to fail on
 * drift once the maintainer wants to promote enforcement.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EN_PATH = path.join(ROOT, 'README.md');
const L10N_DIR = path.join(ROOT, 'docs', 'readme');
const STRICT = process.argv.includes('--strict');

// Bold-link skill token: **[name](path) — name is lowercase-alnum with hyphens.
// The path group anchors it to a real Markdown link so plain **[foo]** emphasis
// (no link target) is ignored. Fenced code blocks are stripped first to avoid
// matching example snippets that document the syntax.
const SKILL_RE = /\*\*\[([a-z][a-z0-9-]*)\]\([^)]+\)/g;

function stripFences(src) {
  const lines = src.split('\n');
  let inFence = false;
  const out = [];
  for (const line of lines) {
    if (/^\s*```/.test(line)) { inFence = !inFence; continue; }
    if (!inFence) out.push(line);
  }
  return out.join('\n');
}

function extract(file) {
  const src = stripFences(fs.readFileSync(file, 'utf8'));
  const seen = new Set();
  const order = [];
  for (const m of src.matchAll(SKILL_RE)) {
    const name = m[1];
    if (seen.has(name)) continue; // dedupe: switcher/footer relinks would double-count
    seen.add(name);
    order.push(name);
  }
  return order;
}

if (!fs.existsSync(EN_PATH)) {
  console.error('::error::check-readme-sync: README.md not found at repo root');
  process.exit(1);
}
if (!fs.existsSync(L10N_DIR)) {
  console.error('::error::check-readme-sync: docs/readme/ not found');
  process.exit(1);
}

const en = extract(EN_PATH);
const localized = fs.readdirSync(L10N_DIR)
  .filter((f) => /^README\.[a-zA-Z-]+\.md$/.test(f))
  .sort();

let anyDrift = false;
const report = [];

for (const f of localized) {
  const local = extract(path.join(L10N_DIR, f));
  const localSet = new Set(local);
  const missing = en.filter((s) => !localSet.has(s));
  const extras = local.filter((s) => !en.includes(s));
  const enSubset = en.filter((s) => localSet.has(s));
  const orderMismatch = enSubset.join(',') !== local.filter((s) => en.includes(s)).join(',');

  if (missing.length || extras.length || orderMismatch) {
    anyDrift = true;
    const parts = [];
    if (missing.length) parts.push(`${missing.length} missing (${missing.join(', ')})`);
    if (extras.length) parts.push(`${extras.length} unknown (${extras.join(', ')})`);
    if (orderMismatch) parts.push('order mismatch');
    report.push(`${f}: ${parts.join('; ')}`);
  }
}

const level = STRICT ? 'error' : 'warning';
if (anyDrift) {
  console.error(`::${level}::README bold-link roster drift across ${localized.length} localizations (EN has ${en.length} skills)`);
  for (const line of report) console.error(`  ${line}`);
  if (STRICT) process.exit(1);
  console.error('  (warn-only; pass --strict to fail CI)');
  process.exit(0);
}

console.log(`README sync OK: ${en.length} bold-link skills match across ${localized.length} localizations`);
