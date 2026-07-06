---
name: ssotchk
description: "Audit where one fact lives in many places and report the canonical source of truth plus a consolidation plan — read-only. Use when the same fact, spec, decision, config, status, or definition appears in multiple artifacts or platforms and may have drifted; when refactoring a legacy codebase, building or grading the severity of a knowledge base, or scaffolding a new project; before trusting a value stated in more than one place; or when asked to find duplication, check consistency, or locate the source of truth. Never modifies anything."
---

Find every place a single truth lives, name its rightful home, and report the drift — without changing anything.

## Goal

Locate Single-Source-of-Truth (SSOT) violations: one fact duplicated, paraphrased, or contradicted across artifacts or platforms. A fact with N copies carries N-1 liabilities, because copies drift out of sync. The output is a map — where it lives, which copy should be canonical, and what to do with the rest — that `ssotize` or a human can act on. This is read-only.

Reach for this when establishing order across many artifacts, especially messy or legacy states; once a fact is cleanly SSOT'd, it needs upkeep, not another consolidation.

## Workflow

1. Name the truth in scope — the specific fact, value, spec, decision, status, or definition being tracked, not the whole document.
2. Enumerate every occurrence across the given artifacts and platforms.
3. Classify each occurrence: exact copy, paraphrase, partial, stale, or contradictory.
4. Pick the canonical home — the most authoritative and most-maintained location, closest to where the fact actually changes (the code/config for a value, the spec for a decision, the ticket for status); never arbitrarily.
5. Decide the action per non-canonical occurrence: **dedupe** (redundant copy), **reference** (docs should link to canonical, code should import/source/include it, config should use a shared read), or **reconcile** (it disagrees — needs a human call on which is right).
6. Report: a table of occurrences (location · kind · action), the proposed canonical home with a one-line justification, and a separate list of contradictions/drift that need a decision.

## Rules

- Read-only. Propose; do not edit, move, or delete.
- An empty findings list is a valid result — never invent drift to fill the report.
- Keep contradictions separate from plain duplicates; never silently decide which conflicting value is "true".
- Flag any detail that lives ONLY in a non-canonical copy — it must be folded into the canonical home before that copy can be cut.
- Respect boundaries: surface (don't ignore) when copies span trust/permission scopes — private vs public, internal vs customer-facing.
- Be platform-aware: some places can transclude, some only link, some need a quote plus a link.

## Verification

Before finishing:

1. Re-enumerate by a second method — a different search term, synonym, or tool — and confirm it surfaces no occurrence the report missed. Completeness is the core SSOT risk: a copy you never found is a copy that will drift.
2. The canonical home is justified, not assumed.
3. The report is actionable: a human or `ssotize` could execute it without re-discovering anything.
