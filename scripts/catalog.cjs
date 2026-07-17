'use strict';
/*
 * paperthin — shared catalog + discovery-notice logic (single code home).
 *
 * Consumed by both platform adapters so the roster and the notice text live in ONE place:
 *   - scripts/session-check.cjs      (command-hook hosts: Claude Code, Codex)
 *   - scripts/opencode-discovery.js  (OpenCode plugin)
 *
 * The 21-name roster mirrors re0-upgrade's "Current catalog" (the human/doc SSOT). Physical single
 * sourcing across the SKILL.md and this module is blocked by paperthin's self-containment + no-build-step
 * invariants, so scripts/check-catalog-sync.cjs asserting this array equals re0-upgrade's Current
 * catalog is the enforcement of record. See .re0/iteration/v0.13.0-session-notice/.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const CATALOG = [
  'readchk', 'modelchk', 'macrothink', 'hate', 'autobahn', 're0', 'detool', 'shower',
  'factchk', 'mandela', 'sip', 'dedash', 're0-git', 're0-release', 'ssotize',
  're0-upgrade', 're0-memo', 're0-work', 're0-loop', 'catchup', 'nba',
];

const HOME = os.homedir();
// Cheap, local install locations (no network, no npx spawn). npx skills global installs land in
// ~/.agents/skills and are symlinked into per-agent dirs, so this reads across agents.
const SKILL_DIRS = [
  path.join(HOME, '.agents', 'skills'),
  path.join(HOME, '.claude', 'skills'),
];

function installedNames() {
  const found = new Set();
  for (const dir of SKILL_DIRS) {
    try { for (const name of fs.readdirSync(dir)) found.add(name); } catch {}
  }
  return found;
}

// Returns: null when no skills are visible at all (can't tell missing from a non-standard install
// location — caller should stay silent), else the array of catalog skills not installed.
function missingSkills() {
  const installed = installedNames();
  if (installed.size === 0) return null;
  return CATALOG.filter((s) => !installed.has(s));
}

function formatList(missing) {
  return missing.length <= 8
    ? missing.join(', ')
    : missing.slice(0, 8).join(', ') + ', +' + (missing.length - 8) + ' more';
}

// Phrased as a RELAY CUE to the model (not pure-informational): a relay test showed this form
// surfaces to the human ~2/3 of realistic first turns, where the prior-art informational form did not.
// It also forbids the model from auto-running /re0-upgrade (keeps install human-decided).
function noticeText(missing) {
  return 'paperthin discovery notice: the user is missing ' + missing.length +
    ' skill(s) from the current catalog (' + formatList(missing) + '). If it fits naturally, tell ' +
    'the user they can run /re0-upgrade to install the full current catalog in one confirmed step. ' +
    'Notice only — do NOT run /re0-upgrade or install anything yourself; it is the user\'s to run.';
}

module.exports = { CATALOG, installedNames, missingSkills, formatList, noticeText };
