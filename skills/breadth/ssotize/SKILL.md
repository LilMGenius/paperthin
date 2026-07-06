---
name: ssotize
description: "Consolidate a fact that's scattered across places into one canonical source and replace the rest with references — mutating. Use when the user asks to deduplicate, consolidate, unify, or establish a single source of truth across artifacts or platforms; or when the same fact lives in many places and copies are drifting. Folds unique details into the canonical home and reconciles contradictions before removing any copy."
---

Collapse a scattered truth into one canonical home; make every other place point to it.

## Goal

Enforce Single Source of Truth (SSOT): one fact = one home, and every other place that needs it references that home instead of copying it. References don't drift; copies do. This mutates artifacts, so it is deliberate and loss-averse.

Use this to **establish or repair** SSOT — messy, legacy, or freshly-scaffolded states. Once SSOT holds, don't overuse it: consolidation is a one-time repair, not ongoing upkeep.

## Workflow

1. Audit first — run the `ssotchk` workflow (or reuse its result) for the canonical home and the per-occurrence action plan. Don't consolidate blind.
2. Make or extract the canonical home complete and current — fold in any unique detail that lived only in a copy. When no existing copy is canonical, extract a new canonical home instead of promoting a weak copy. Never lose information to consolidation.
3. Reconcile contradictions in the canonical home FIRST (confirm the correct value with the human when ambiguous); only then point others at it.
4. Replace each duplicate with a live reference to the canonical home — for docs, use a link, a "see <home>", a quote-with-link, or a transclude where the platform supports it; for code, use an import/source/include of the shared home; for config, use a shared read from the one maintained file.
5. Remove the now-redundant copies. Where removal would orphan a reader, leave a one-line pointer instead of deleting outright.

## Rules

- A pass that finds no scatter to consolidate changes nothing.
- Don't consolidate across a trust/permission boundary (private → public, customer-facing → internal) without explicit confirmation.
- Mutate with edit-safety: assert each replace target exists before touching it (report a MISS, never a silent no-op), edit unicode-safe (`PYTHONUTF8=1`), and act per occurrence, never a blanket sweep; make structural code moves with language-aware tools or scripted AST/parser edits, never scripted text rewrites.
- Be platform-aware: transclude where possible, else link to a stable anchor the reader can follow; prefer a reference over a hard deletion when a platform can't link back.

## Verification

Before finishing:

1. The canonical home holds the complete, current truth on its own.
2. Every former copy now references it, and each reference resolves.
3. No unique detail was lost and nothing was orphaned.
4. Contradictions were reconciled to one value, not left duplicated.
5. Report what was consolidated, where the canonical home is, and what (if anything) still needs a human decision.
