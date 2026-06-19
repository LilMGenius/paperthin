---
name: ssotize
description: "Consolidate a fact that's scattered across places into one canonical source and replace the rest with references — mutating. Use when the user asks to deduplicate, consolidate, unify, or establish a single source of truth across artifacts or platforms (files, docs, Notion, Slack, Jira, GitHub); or when the same fact lives in many places and copies are drifting. Folds unique details into the canonical home and reconciles contradictions before removing any copy."
---

Collapse a scattered truth into one canonical home; make every other place point to it.

## Goal

Enforce Single Source of Truth (SSOT): one fact = one home, and every other place that needs it references that home instead of copying it. References don't drift; copies do. This mutates artifacts, so it is deliberate and loss-averse.

Use this to **establish or repair** SSOT — messy, legacy, or freshly-scaffolded states. Audit first with `/ssotchk`. Once SSOT holds, don't overuse `/ssotize`: maintain artifacts with `re0` instead. (See `/ssotchk` for how the SSOT vector differs from `re0`.)

## Workflow

1. Audit first — run the `/ssotchk` workflow (or reuse its result) for the canonical home and the per-occurrence action plan. Don't consolidate blind.
2. Make the canonical home complete and current — fold in any unique detail that lived only in a copy. Never lose information to consolidation.
3. Reconcile contradictions in the canonical home FIRST (confirm the correct value with the human when ambiguous); only then point others at it.
4. Replace each duplicate with a reference to the canonical home — a link, a "see <home>", a quote-with-link, or a transclude where the platform supports it.
5. Remove the now-redundant copies. Where removal would orphan a reader, leave a one-line pointer instead of deleting outright.
6. Re-read the canonical home: it must now carry the whole truth on its own.

## Rules

- Fold before you cut — never delete the only place a detail exists.
- One canonical home per fact; prefer a reference over a copy everywhere else.
- Reconcile, don't duplicate, contradictions — resolve the conflicting value in one place, never preserve it in two.
- Don't consolidate across a trust/permission boundary (private → public, customer-facing → internal) without explicit confirmation.
- Be platform-aware: transclude where possible (Notion), else link to a stable anchor (GitHub permalink, Jira/Slack/Notion deep link); never replace a copy with a link the reader can't follow.
- Keep it reversible: prefer a reference over a hard deletion when a platform can't link back.

## Verification

Before finishing:

1. The canonical home holds the complete, current truth on its own.
2. Every former copy now references it, and each reference resolves.
3. No unique detail was lost and nothing was orphaned.
4. Contradictions were reconciled to one value, not left duplicated.
5. Report what was consolidated, where the canonical home is, and what (if anything) still needs a human decision.
