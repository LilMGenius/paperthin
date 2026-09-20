#!/usr/bin/env node
'use strict';
/*
 * Catalog SSOT drift-guard: the roster set across the code copy and the doc canonical, and the roster order across the four hand-written surfaces.
 *
 * The 21-skill roster necessarily exists in two places — re0-upgrade's "Current catalog" (the
 * human/doc canonical) and scripts/runtime/catalog.cjs (the code copy the notice adapters share).
 * Physical single-sourcing is blocked by paperthin's self-containment (re0-upgrade must ship alone,
 * so it inlines its roster) and no-build-step invariants. This check is the enforcement: it fails
 * CI when the two diverge. Run from ci.yml and locally.
 */

const fs = require('fs');
const path = require('path');
const { CATALOG } = require('../runtime/catalog.cjs');

const skillPath = path.join(__dirname, '..', '..', 'skills', 'breadth', 're0-upgrade', 'SKILL.md');
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
  console.error('::error::catalog drift between scripts/runtime/catalog.cjs and re0-upgrade SKILL.md');
  if (onlyScript.length) console.error('  in script CATALOG, missing from re0-upgrade Current catalog: ' + onlyScript.join(', '));
  if (onlySkill.length) console.error('  in re0-upgrade Current catalog, missing from script CATALOG: ' + onlySkill.join(', '));
  process.exit(1);
}

const pluginPath = path.join(__dirname, '..', '..', '.claude-plugin', 'plugin.json');
const plugin = JSON.parse(fs.readFileSync(pluginPath, 'utf-8')).skills.map((p) => p.split('/').pop());
const readmePath = path.join(__dirname, '..', '..', 'README.md');
const readme = [...fs.readFileSync(readmePath, 'utf-8').matchAll(/^\|[^\n]*\*\*\[([a-z0-9-]+)\]\([^)]*\/SKILL\.md\)\*\*/gm)].map((m) => m[1]);
const surfaces = { 'scripts/runtime/catalog.cjs': CATALOG, 're0-upgrade Current catalog': roster, '.claude-plugin/plugin.json': plugin, 'README.md index': readme };
const reference = CATALOG.join(' ');
let disorder = 0;
for (const [name, list] of Object.entries(surfaces)) {
  if (list.join(' ') !== reference) {
    console.error('::error::catalog order drift: ' + name + ' lists the roster in a different order than scripts/runtime/catalog.cjs');
    console.error('  ' + name + ': ' + list.join(', '));
    disorder++;
  }
}
if (disorder) process.exit(1);

console.log('catalog SSOT OK: ' + CATALOG.length + ' skills match re0-upgrade Current catalog, plugin.json and README in one order');
