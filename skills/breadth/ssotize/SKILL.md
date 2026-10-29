---
name: ssotize
description: "Audit and consolidate a fact that's scattered across places into one canonical source, after approval, and replace the rest with references. Use when asked to find duplication, check consistency, locate the source of truth, deduplicate, consolidate, unify, or establish SSOT across artifacts or platforms. Starts read-only, reports the map and plan, then mutates only after explicit approval."
---

Find every copy of one scattered fact, consolidate it into one canonical home after approval, and replace the rest with references.

## Goal

One fact has one home, and every other place references it: references do not drift, copies do. `ssotize` establishes or repairs that state in messy, legacy, or freshly scaffolded work. Consolidation is deliberate and loses no information, and it is a one-time repair: once SSOT holds, the fact needs no further consolidation.

The skill starts as a read-only audit that names the truth, finds every copy, chooses the canonical home, and reports the exact plan. It mutates only after the user approves that plan. The audit and the consolidation stay in one workflow with the approval gate between them, because a separate checker makes the audit easy to skip.

## Workflow

1. **Name the truth** in scope: the specific fact, value, spec, decision, status, or definition being tracked, not the whole document.
2. **Audit read-only.** List every occurrence across the given artifacts and platforms. For the candidate occurrences that are files, run `node scripts/snapshot-candidates.mjs [--json] <path>...` from this skill's folder: it prints path, mtime, size and sha256 per file (directories walked) as a Markdown table, or JSON with `--json`, and exits 2 on a usage error or an unreadable path. Report that table.
3. **Enumerate again by a second method** (another search term, a synonym, or another tool) and confirm it finds nothing the first pass missed.
4. **Classify** each occurrence by kind: exact copy, paraphrase, partial, stale, contradictory.
5. **Choose the canonical home**: the most authoritative and most maintained location, closest to where the fact changes. Never promote a weak copy for convenience; when no location qualifies, extract a new canonical home.
6. **Choose an action** for each non-canonical occurrence:
   - **dedupe**: a redundant copy.
   - **reference**: docs link to the canonical home, code imports, sources, or includes it, and config reads a shared file.
   - **reconcile**: the occurrence disagrees and needs a human call.
7. **Report before any edit**, in the reply to the user: an occurrence table (location, kind, action); the proposed canonical home with a one-line justification; unique details that must be folded into it; contradictions needing a decision; the exact mutation plan.
8. **Ask the user for explicit approval** of the mutation plan. Without approval, stop after the read-only report.
9. **Re-check, then build the home.** Immediately before the first write, run the same script on every candidate file and compare its path, mtime, size, and sha256 with the audit table. If any changed since the audit, stop before writing and report the file, each changed field, and its old and new values; report missing or unreadable files too. A stopped run reports and re-audits rather than writing. Otherwise, make or extract a complete, current canonical home that folds in every unique detail from the copies.
10. **Reconcile contradictions** in the canonical home first. When the right value is ambiguous, have the user confirm it before replacing anything.
11. **Replace each duplicate with a live reference.** Docs use a link, a "see <home>", a quote with link, or a transclude where supported; code imports, sources, or includes the shared home; config reads the one maintained file.
12. **Remove the now-redundant copies.** Where removal would orphan a reader, leave a one-line pointer instead of deleting outright.

## Rules

- Mtime is a staleness gate for the audit, never a rule for choosing the canonical home: never newest wins.
- A pass that finds no scatter changes nothing. An empty findings list is a valid result and is reported as one; never invent drift to justify consolidating.
- The audit is read-only: no edit, move, or delete before the user approves the plan.
- Keep contradictions apart from plain duplicates, and never silently decide which conflicting value is true.
- Flag any detail found only in a non-canonical copy and fold it into the canonical home before cutting that copy.
- Never consolidate across a trust or permission boundary (private to public, customer-facing to internal) without the user's explicit confirmation.
- Edit safely: assert each replace target exists before touching it and report a MISS, never a silent no-op; read and write files as UTF-8 (`PYTHONUTF8=1` for Python); act per occurrence, never by blanket sweep; make structural code moves with language-aware tools or scripted AST or parser edits, never scripted text rewrites.
- Be platform-aware: transclude where possible, otherwise link to a stable anchor the reader can follow. Where a platform cannot link back, prefer a reference over hard deletion.
- When one project fact is split between a read-only audit artifact and a mutating artifact, and the audit has no independent durable use, treat that as SSOT scatter: propose folding the audit into the mutating artifact, and do it only after approval.

## Verification

Before finishing, confirm:

1. The audit was reported and approval received before any mutation, unless the run stayed read-only.
2. The canonical home holds the complete, current truth on its own.
3. Every former copy references it, and every reference resolves.
4. No unique detail was lost and nothing is orphaned.
5. Contradictions are reconciled to one value, not left duplicated, or the report names each one still waiting on a human decision.
6. The final report states what was consolidated, where the canonical home is, what was only audited, and what still needs a human decision.
