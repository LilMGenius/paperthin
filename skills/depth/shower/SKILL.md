---
name: shower
description: "Cold-read the artifact you're focused on from a fresh, zero-context sub-session to confirm it stands on its own — a shower-thought reset for accumulated session bias. Use when a long session has worn away your fresh eyes and you can no longer tell whether the artifact in focus is clear to someone with no prior context; before a handoff, publish, or merge; or when you want a clean-room comprehension smoke test. Spawns a separate context-free reviewer; it diagnoses, it does not fix."
---

Step out of the session and let a clean mind read it: does the artifact stand on its own?

## Goal

A long session quietly accumulates context you can't un-see, so you lose the ability to judge whether your work reads clearly to a first-timer — you no longer know what you left unsaid (the unknown-unknowns). The fix is a literally fresh brain: a separate sub-session that never saw this conversation cold-reads the artifact in focus and reports where a clean reader would stall. A smoke test for comprehension and handoff. This skill diagnoses; the fixing happens back in the main session.

## Workflow

1. Pin the scope: the artifact (or set) currently in focus. If "in focus" is ambiguous, confirm with the user or take the artifact just produced or under discussion. Privately note, in one line, what it is meant to be and who it is for — your yardstick for step 4; the reviewer never sees it.
2. Launch a **fresh sub-session** (a subagent / Task — it starts context-free). Hand it the artifact's **contents** (inline, or a copy), not a repo path, and tell it not to open the project's README, docs, or neighboring files that would spoil the cold read. Give it nothing about your intent or reasoning.
3. Have it cold-read blind and report, from the artifact alone:
   - what it takes the artifact to be, do, and expect;
   - what is unclear, ambiguous, or assumed-but-unstated;
   - what it would need to act confidently, and what it had to guess.
4. Compare its blind understanding against the intent you noted in step 1 (which it never saw). Every mismatch is a defect in the artifact, not a reader error.
5. Report the defects and concrete fixes, ordered by how badly each blocks a fresh reader.

## Rules

- The read MUST come from a separate, context-free sub-session — never self-assess in this session, because you can't un-see the context (that is the whole point).
- Pass the artifact's contents, never your intent.
- A forced "I had to assume…" is a finding, not a reader failure.
- Medium-agnostic: adapt the cold-read questions to what the artifact is.
- **Read, don't sweep.** The cold-read is an end-to-end read, not a pattern-grep — a sweep catches only known patterns and misses stale refs, dead links, fact drift, and silent edit-damage. Track how much was actually read; never report "clean" from a grep alone.

## Verification

Before finishing:

1. The read came from a fresh sub-session blind to your intent.
2. Report the verdict (stands on its own / minor gaps / needs work) and hand the fixes to the main session.
