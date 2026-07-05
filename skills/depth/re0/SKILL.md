---
name: re0
description: "Refresh an existing artifact into the current best v0. Use when the user asks to clean up, sync up, dedupe, de-noise, smooth, rewrite, or update an artifact after iteration; when nearby artifacts may have drifted; or when changes in one place should be reflected across related artifacts while keeping the result minimal."
---

Refresh the target artifact as if it were the first clean version.

## Goal

The result must be lighter, more current, and more accurate than the input. It should not read like a changelog, cleanup note, or patch over an older draft.

## Workflow

1. Identify the target artifact from the user's request or the active context.
2. Read the target artifact end to end before editing.
3. Check nearby artifacts that must stay aligned with it.
4. Remove scaffolding residue, stale deltas, duplicated process noise, deprecated information, and over-specific history.
5. Fold durable lessons into the place they should have lived from the start.
6. Rewrite instead of appending when appending would preserve noise.
7. Preserve the artifact's useful voice and structure; simplify everything else.
8. Smooth prose noise: fold a parenthetical that interrupts a sentence or list into its own clause or cut it, keep a word or point repeated within reach of itself only once, and unwind padding that adds length but not meaning.
9. Smooth source noise: unwrap a hard line break that splits a sentence mid-flow so each paragraph or list item lives on one source line, matching how sibling artifacts format theirs; make a plain-text pointer to a named section or file followable, a link where the medium supports one; leave code, tables, and quoted material as formatted.
10. Re-read the result and cut again.

## Rules

- A pass that finds nothing to genuinely improve changes nothing.
- Prefer editing existing sections over adding new ones.
- Convert "what changed" into "what is true now".
- Keep only details that improve future execution, accuracy, or recall.
- Do not leave old/new traces unless the artifact is explicitly a changelog.
- Fix machine-clear residue; surface judgment calls — never auto-resolve an ambiguity or "fix" a deliberate look-alike.
- Repair from the source of truth — the canonical or sibling artifact, not the damaged surface — and mutate with edit-safety: assert the target exists (report a MISS, never a silent no-op), edit unicode-safe (`PYTHONUTF8=1`), replace positional targets per occurrence rather than by blanket sweep, and script large structural moves.
- Do not create extra files unless the user asks.

## Verification

The result reads as a clean v0 to fresh eyes — no trace of the older draft, no sign it was patched rather than rewritten. If unsure, re-read it cold, as a stranger with no prior context would. Report what noise was removed and what durable truth was kept.
