---
name: re0
description: "Refresh an existing artifact into the current best v0. Use when the user asks to clean up, sync up, dedupe, de-noise, smooth, rewrite, or update an artifact after iteration; when nearby artifacts may have drifted; or when changes in one place should be reflected across related artifacts while keeping the result minimal."
---

Refresh the target artifact as if it were the first clean version.

## Goal

Make the artifact lighter, more current, and more accurate. It should read as a clean version without changelog language, cleanup notes, or patches over an older draft.

## Workflow

1. Identify the target from the user's request or active context.
2. Read it end to end before editing.
3. Check nearby artifacts that must stay aligned.
4. Remove scaffolding residue, stale deltas, duplicated process noise, deprecated information, and over-specific history.
5. Fold durable lessons into the place they should have lived from the start.
6. Rewrite instead of appending when appending would preserve noise.
7. Preserve useful voice and structure; simplify everything else.
8. Smooth prose: give an interrupting parenthetical its own clause or cut it, keep nearby repeated words or points once, and remove padding that adds no meaning.
9. Smooth source text: unwrap breaks that split sentences so each paragraph or list item occupies one source line, matching sibling formatting. Make pointers to named sections or files followable, using links where supported. Preserve formatting in code, tables, and quoted material.
10. Re-read the result and cut again.

## Rules

- Refresh to the current best v0. Within the de- family, remove shape-class machine-writing tells by rewriting across sentence boundaries. Never compress for its own sake or edit punctuation choice alone; the punctuation pass runs after any rewrite. Report an unsourced claim as an observation; never delete it or invent a source.
- A pass that finds nothing to genuinely improve changes nothing.
- Prefer editing existing sections over adding new ones.
- Convert "what changed" into "what is true now".
- Keep only details that improve future execution, accuracy, or recall.
- Do not leave old/new traces unless the artifact is explicitly a changelog.
- Fix machine-clear residue and surface judgment calls. Never auto-resolve ambiguity or "fix" a deliberate look-alike.
- Repair from the canonical or sibling source of truth, not the damaged surface. Edit safely: assert the target exists and report a MISS rather than a silent no-op; edit unicode-safe (`PYTHONUTF8=1`), replace positional targets per occurrence rather than by blanket sweep, and script large structural moves.
- Do not create extra files unless the user asks.

## Verification

A fresh reader sees a clean v0 with no trace of the older draft or signs of patching. If unsure, re-read as a stranger with no prior context. Report the noise removed and the durable truth kept.
