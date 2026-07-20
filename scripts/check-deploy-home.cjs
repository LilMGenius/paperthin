#!/usr/bin/env node
'use strict';
/*
 * Deploy-home SSOT drift-guard (Gate 1 for the ~/.re0/ deploy home, v0.16.2).
 *
 * Two invariants, both binary:
 *   1. The deploy home is defined in EXACTLY ONE place — scripts/catalog.cjs exports STATE_DIR and
 *      NOTICE_STAMP — and imported everywhere else. Before v0.16.2 the literal was re-hardcoded in
 *      each adapter (AP-3: five sites, a rename = five edits, miss one = split-brain).
 *   2. The retired home name `.paperthin` appears NOWHERE in the shipped runtime or in re0-upgrade's
 *      wiring prose. We deliberately do NOT migrate pre-rename installs (they keep their own
 *      self-contained ~/.paperthin/ runtime until reinstalled), so shipped code carries zero
 *      knowledge of the old home — no legacy fallback, no migrator, no dangling reference.
 *
 * Mirrors scripts/check-catalog-sync.cjs; run from ci.yml and locally. This guard file is not
 * self-scanned, so the literal below is fine here.
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.env.PAPERTHIN_REPO || path.join(__dirname, '..');
const SCRIPTS = path.join(ROOT, 'scripts');
const RETIRED = '.' + 'paperthin'; // the old home segment; must not appear in shipped runtime/prose
const RUNTIME = ['catalog.cjs', 'session-check.cjs', 'opencode-discovery.js'];

let bad = 0;

// 1) SSOT exists and exports the constants.
try {
  const catalog = fs.readFileSync(path.join(SCRIPTS, 'catalog.cjs'), 'utf-8');
  for (const name of ['STATE_DIR', 'NOTICE_STAMP']) {
    if (!new RegExp('\\b' + name + '\\b').test(catalog)) {
      console.error('::error::deploy-home guard: catalog.cjs does not define/export ' + name + ' (the SSOT)');
      bad++;
    }
  }
} catch {
  console.error('::error::deploy-home guard: scripts/catalog.cjs not readable');
  bad++;
}

// 2) No shipped runtime file may mention the retired home at all.
for (const file of RUNTIME) {
  let text;
  try { text = fs.readFileSync(path.join(SCRIPTS, file), 'utf-8'); } catch { continue; }
  text.split('\n').forEach((line, i) => {
    if (line.includes(RETIRED)) {
      console.error('::error::deploy-home guard: ' + file + ':' + (i + 1) +
        ' references the retired home `' + RETIRED + '` — shipped runtime must know only ~/.re0/');
      console.error('    ' + line.trim());
      bad++;
    }
  });
}

// 3) re0-upgrade must not place the runtime under, or otherwise reference, the retired home.
try {
  const skill = fs.readFileSync(path.join(ROOT, 'skills', 'breadth', 're0-upgrade', 'SKILL.md'), 'utf-8');
  if (skill.includes('~/' + RETIRED + '/')) {
    console.error('::error::deploy-home guard: re0-upgrade SKILL.md still references ~/' + RETIRED + '/ (deploy home is ~/.re0/; legacy installs are left alone, not named)');
    bad++;
  }
} catch {}

if (bad) process.exit(1);
console.log('deploy-home SSOT OK: home defined once in catalog.cjs; zero retired-home references');
