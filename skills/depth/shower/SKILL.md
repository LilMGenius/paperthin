---
name: shower
description: "Cold-read the artifact you're focused on from a fresh, zero-context sub-session to confirm it stands on its own: a shower-thought reset for accumulated session bias. Use when a long session has worn away your fresh eyes and you can no longer tell whether the artifact in focus is clear to someone with no prior context; before a handoff, publish, or merge; or when you want a clean-room comprehension smoke test. Spawns a separate context-free reviewer; it diagnoses, it does not fix."
---

Have a reader outside the session check whether the artifact stands on its own.

## Goal

A long session makes it hard to notice what the artifact leaves unsaid. A separate sub-session that never saw the conversation reads the artifact and reports where a first-time reader would stall. This comprehension and handoff smoke test diagnoses gaps; the main session makes the fixes.

## Workflow

1. Pin the artifact or set in focus. If the scope is ambiguous, confirm with the user or take the artifact just produced or under discussion. Privately note its purpose and audience in one line for the comparison in step 4; the reviewer never sees it.
2. Launch a **fresh, context-free sub-session**. Give it the artifact's **contents**, inline or as a copy, never a repository path. Tell it not to open the project's README, docs, or neighboring files that would spoil the cold read. Give it no intent or reasoning.
3. Have it cold-read blind and report, from the artifact alone:
   - what it takes the artifact to be, do, and expect;
   - what is unclear, ambiguous, or assumed-but-unstated;
   - what it would need to act confidently, and what it had to guess.
4. Compare its blind understanding with the private intent from step 1. Treat every mismatch as an artifact defect, not a reader error.
5. Report defects and concrete fixes in order of how badly they block a fresh reader.

## Rules

- The read must come from a separate, context-free sub-session. Never substitute self-assessment in the author session; its context cannot be unseen.
- Pass the artifact's contents, never your intent.
- A forced "I had to assume…" is a finding, not a reader failure.
- Medium-agnostic: adapt the cold-read questions to what the artifact is.
- One cold read is the default and can still be confidently wrong. Escalate to multiple independent reads when the stakes justify the cost.
- Read end to end. A pattern search catches only known patterns and misses stale references, dead links, fact drift, and silent edit damage. Track how much was actually read; never report "clean" from a pattern search alone.

## Verification

Before finishing:

1. The read came from a fresh sub-session blind to your intent.
2. Report the verdict (stands on its own / minor gaps / needs work) and hand the fixes to the main session.
