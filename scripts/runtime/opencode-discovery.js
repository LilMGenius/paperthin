/*
 * paperthin — discovery notice, OpenCode plugin (class-B adapter).
 *
 * OpenCode's hooks are JS/TS plugins, not command hooks, so the class-A command script can't be
 * pointed at directly. This plugin injects the same notice into the system prompt via the
 * `system.transform` hook (the verified injection seam omo uses: push onto output.system, guarded
 * against re-injection after compaction), once per session, throttled once/day, silent when current.
 * The catalog + notice text come from the shared ./catalog.cjs, so nothing is duplicated.
 *
 * The `opencode-` prefix names the platform this adapter targets (it lands in opencode.json's shared
 * `plugin` array); no project prefix is needed — the repo and ~/.re0/ already namespace it.
 *
 * Install: add this file's path (or its npm package) to opencode.json's "plugin" array — the same
 * mechanism omo uses (packages/omo-opencode add-plugin-to-opencode-config writes the plugin entry).
 */

import { createRequire } from 'node:module';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const { missingSkills, noticeText, STATE_DIR, NOTICE_STAMP } = require('./catalog.cjs');

const THROTTLE_MS = 24 * 60 * 60 * 1000;

function throttledWithin24h() {
  try {
    const s = JSON.parse(fs.readFileSync(NOTICE_STAMP, 'utf-8'));
    return s && s.ts && (Date.now() - s.ts) < THROTTLE_MS;
  } catch { return false; }
}

function stampNotice(missing) {
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true });
    fs.writeFileSync(NOTICE_STAMP, JSON.stringify({ ts: Date.now(), missing }));
  } catch {}
}

export const PaperthinDiscovery = async () => {
  const seenSessions = new Set();
  return {
    'system.transform': async (input, output) => {
      try {
        const sid = (input && input.sessionID) || '';
        if (seenSessions.has(sid)) return;
        // Don't double-inject if a rebuilt system prompt (e.g. post-compaction) already has it.
        if (output.system.some((part) => part.includes('paperthin discovery notice'))) return;
        if (throttledWithin24h()) return;

        const missing = missingSkills();
        if (!missing || missing.length === 0) return;

        output.system.push(noticeText(missing));
        seenSessions.add(sid);
        stampNotice(missing);
      } catch {
        /* never break the session */
      }
    },
  };
};

export default PaperthinDiscovery;
