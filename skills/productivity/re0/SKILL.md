---
name: re0
description: "Refresh an existing artifact into the current best v0. Use when the user asks to clean up, sync up, dedupe, de-noise, rewrite, or update an artifact after iteration; when nearby docs, metadata, plans, drafts, or generated outputs may have drifted; or when changes in one place should be reflected across related artifacts while keeping the result minimal."
---

Refresh the target artifact as if it were the first clean version.

## Goal

Use this when the user asks to clean up, sync up, dedupe, or rewrite an existing
artifact into the current best v0.

The result must be lighter, more current, and more accurate than the input. It
should not read like a changelog, cleanup note, or patch over an older draft.

## Workflow

1. Identify the target artifact from the user's request or the active context.
2. Read the target artifact end to end before editing.
3. Check nearby artifacts that must stay aligned with it.
4. Remove scaffolding residue, stale deltas, duplicated process noise, deprecated
   information, and over-specific history.
5. Fold durable lessons into the place they should have lived from the start.
6. Rewrite instead of appending when appending would preserve noise.
7. Preserve the artifact's useful voice and structure; simplify everything else.
8. Re-read the result and cut again.

## Rules

- Prefer editing existing sections over adding new ones.
- Convert "what changed" into "what is true now".
- Keep only details that improve future execution, accuracy, or recall.
- Do not leave old/new traces unless the artifact is explicitly a changelog.
- Do not create extra files unless the user asks.

## Verification

Before finishing:

1. Re-read the changed sections.
2. Confirm related artifacts still point in the same direction.
3. Confirm the output is smaller or cleaner unless the user explicitly wanted expansion.
4. Report what noise was removed and what durable truth was kept.
