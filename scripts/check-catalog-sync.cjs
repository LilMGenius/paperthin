#!/usr/bin/env node
'use strict';
/*
 * Catalog SSOT drift-guard.
 *
 * The 21-skill roster necessarily exists in two places — re0-upgrade's "Current catalog" (the
 * human/doc canonical) and scripts/catalog.cjs (the code copy the notice adapters share).
 * Physical single-sourcing is blocked by paperthin's self-containment (re0-upgrade must ship alone,
 * so it inlines its roster) and no-build-step invariants. This check is the enforcement: it fails
 * CI when the two diverge. Run from ci.yml and locally.
 */

const fs = require('fs');
const path = require('path');
const { CATALOG } = require('./catalog.cjs');

const skillPath = path.join(__dirname, '..', 'skills', 'breadth', 're0-upgrade', 'SKILL.md');
const md = fs.readFileSync(skillPath, 'utf-8');

const afterHeading = md.split(/^##\s+Current catalog\s*$/m)[1];
if (!afterHeading) {
  console.error('::error::drift-guard: "## Current catalog" section not found in re0-upgrade SKILL.md');
  process.exit(1);
}
const section = afterHeading.split(/^##\s+/m)[0];
// Roster names are single backticked tokens; `npx skills list` (has spaces) won't match.
const roster = [...section.matchAll(/`([a-z0-9][a-z0-9-]*)`/g)].map((m) => m[1]);

const inScript = new Set(CATALOG);
const inSkill = new Set(roster);
const onlyScript = CATALOG.filter((x) => !inSkill.has(x));
const onlySkill = roster.filter((x) => !inScript.has(x));

if (onlyScript.length || onlySkill.length) {
  console.error('::error::catalog drift between scripts/catalog.cjs and re0-upgrade SKILL.md');
  if (onlyScript.length) console.error('  in script CATALOG, missing from re0-upgrade Current catalog: ' + onlyScript.join(', '));
  if (onlySkill.length) console.error('  in re0-upgrade Current catalog, missing from script CATALOG: ' + onlySkill.join(', '));
  process.exit(1);
}

console.log('catalog SSOT OK: ' + CATALOG.length + ' skills match re0-upgrade Current catalog');
