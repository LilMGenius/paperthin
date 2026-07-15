---
name: ssotize
description: "Audit and consolidate a fact that's scattered across places into one canonical source, after approval, and replace the rest with references. Use when asked to find duplication, check consistency, locate the source of truth, deduplicate, consolidate, unify, or establish SSOT across artifacts or platforms. Starts read-only, reports the map and plan, then mutates only after explicit approval."
---

Find where one truth lives, get approval for the consolidation plan, then collapse it into one canonical home.

## Goal

Enforce Single Source of Truth (SSOT): one fact = one home, and every other place that needs it references that home instead of copying it. References don't drift; copies do. This mutates artifacts, so it is deliberate and loss-averse.

`ssotize` starts as a read-only audit. It names the truth in scope, finds every copy, chooses the canonical home, and reports the exact consolidation plan. Only after the user approves that plan does it mutate artifacts.

Use this to **establish or repair** SSOT — messy, legacy, or freshly-scaffolded states. Once SSOT holds, don't overuse it: consolidation is a one-time repair, not ongoing upkeep. When a read-only checker and a mutating follow-up have become one inseparable workflow, fold the checker into the consolidator and keep the approval gate; splitting the reflex only makes the safer first half easier to skip.

## Workflow

1. Name the truth in scope — the specific fact, value, spec, decision, status, or definition being tracked, not the whole document.
2. Audit read-only first: enumerate every occurrence across the given artifacts and platforms.
3. Re-enumerate by a second method — a different search term, synonym, or tool — and confirm it surfaces no occurrence the first pass missed.
4. Classify each occurrence: exact copy, paraphrase, partial, stale, or contradictory.
5. Pick the canonical home — the most authoritative and most-maintained location, closest to where the fact actually changes. Never promote a weak copy just because it is convenient; extract a new canonical home if none exists.
6. Decide the action per non-canonical occurrence: **dedupe** (redundant copy), **reference** (docs should link to canonical, code should import/source/include it, config should use a shared read), or **reconcile** (it disagrees and needs a human call).
7. Report the audit before editing: a table of occurrences (location · kind · action), the proposed canonical home with a one-line justification, unique details that must be folded into it, contradictions that need a decision, and the exact mutation plan.
8. Ask for explicit approval to execute the mutation plan. If approval is not given, stop after the read-only report.
9. Make or extract the canonical home complete and current — fold in any unique detail that lived only in a copy. Never lose information to consolidation.
10. Reconcile contradictions in the canonical home first; when the correct value is ambiguous, confirm it before replacing anything.
11. Replace each duplicate with a live reference to the canonical home — for docs, use a link, a "see <home>", a quote-with-link, or a transclude where the platform supports it; for code, use an import/source/include of the shared home; for config, use a shared read from the one maintained file.
12. Remove the now-redundant copies. Where removal would orphan a reader, leave a one-line pointer instead of deleting outright.

## Rules

- A pass that finds no scatter to consolidate changes nothing.
- The audit phase is read-only. Do not edit, move, or delete before the user approves the mutation plan.
- An empty findings list is a valid result — never invent drift to justify a consolidation.
- Keep contradictions separate from plain duplicates; never silently decide which conflicting value is "true".
- Flag any detail that lives only in a non-canonical copy — it must be folded into the canonical home before that copy can be cut.
- Don't consolidate across a trust/permission boundary (private → public, customer-facing → internal) without explicit confirmation.
- Mutate with edit-safety: assert each replace target exists before touching it (report a MISS, never a silent no-op), edit unicode-safe (`PYTHONUTF8=1`), and act per occurrence, never a blanket sweep; make structural code moves with language-aware tools or scripted AST/parser edits, never scripted text rewrites.
- Be platform-aware: transclude where possible, else link to a stable anchor the reader can follow; prefer a reference over a hard deletion when a platform can't link back.
- When the same project fact is split between a read-only audit artifact and a mutating artifact, and the audit has no independent durable use, treat that as SSOT scatter: propose folding the audit into the mutating artifact, then execute only after approval.

## Verification

Before finishing:

1. The audit was reported before mutation and approval was received, unless the run stayed read-only.
2. The canonical home holds the complete, current truth on its own.
3. Every former copy now references it, and each reference resolves.
4. No unique detail was lost and nothing was orphaned.
5. Contradictions were reconciled to one value, not left duplicated.
6. Report what was consolidated, where the canonical home is, what was only audited, and what still needs a human decision.
