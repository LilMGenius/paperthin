#!/usr/bin/env node
'use strict';
/*
 * paperthin — SessionStart discovery notice (command-hook adapter).
 *
 * Class-A hosts whose SessionStart hook runs a command and adds its stdout /
 * hookSpecificOutput.additionalContext to the model's context: Claude Code, Codex. The catalog +
 * notice logic lives in ./catalog.cjs (shared with the OpenCode plugin adapter).
 *
 * Channel reality (see .re0/iteration/v0.13.0-session-notice/): the output is injected into the
 * MODEL's context, not shown to the human directly — the model relays it. Notice only; never installs.
 * Throttled once/day, silent when current, every path exits 0 with valid JSON so a hook can never
 * break the session.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { missingSkills, noticeText } = require('./catalog.cjs');

const STATE_DIR = path.join(os.homedir(), '.paperthin');
const NOTIFY_STAMP = path.join(STATE_DIR, 'last-notice.json');
const THROTTLE_MS = 24 * 60 * 60 * 1000;

function emitSilent() {
  process.stdout.write(JSON.stringify({ continue: true, suppressOutput: true }));
  process.exit(0);
}

function emitNotice(text) {
  process.stdout.write(JSON.stringify({
    continue: true,
    hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: text },
  }));
  process.exit(0);
}

function throttledWithin24h() {
  try {
    const s = JSON.parse(fs.readFileSync(NOTIFY_STAMP, 'utf-8'));
    return s && s.ts && (Date.now() - s.ts) < THROTTLE_MS;
  } catch { return false; }
}

function stampNotice(missing) {
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true });
    fs.writeFileSync(NOTIFY_STAMP, JSON.stringify({ ts: Date.now(), missing }));
  } catch {}
}

try {
  const missing = missingSkills();
  if (!missing || missing.length === 0) emitSilent();  // null (can't tell) or fully current
  if (throttledWithin24h()) emitSilent();               // at most one notice per 24h

  stampNotice(missing);
  emitNotice(noticeText(missing));
} catch {
  emitSilent();
}
