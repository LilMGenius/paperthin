---
name: sip
description: "After you create or change an artifact or skill, taste-test it with our own skills instead of trusting your in-session judgment — recursive self-improvement, made automatic. Use right after writing or editing anything, before calling it done, committing, or handing it off."
---

Taste your own cooking: the moment you finish making something, check it with the very skills this repo ships before you serve it.

## Goal

A reminder buried in docs ("remember to verify") won't reliably fire in a fresh session. `sip` makes the recursive self-improvement loop a triggered habit: right after any create or change, run our own skills on the result so quality doesn't ride on the author's biased in-session judgment.

## Workflow

1. Spot the trigger: you just created or changed an artifact or skill and are about to call it done, commit, or hand it off.
2. **Cold-read it** — run `shower` on the artifact (fresh-eyes comprehension / handoff check).
3. **Check consistency** — run `ssotchk` across the repo for anything the change duplicated or contradicted; `ssotize` if it found scatter.
4. **Tidy** — `re0` the changed docs so the result reads as a clean v0, not a patch over a draft.
5. Apply the findings here, then serve it.

## Rules

- Trigger on your OWN output, right after making it — that's when bias is highest and a check is cheapest.
- Use the skills; don't re-implement them (`shower` for clarity, `ssotchk`/`ssotize` for SSOT, `re0` for cleanup) — `sip` orchestrates and routes findings back to the author session to fix; the skills do the work.
- Skip what plainly doesn't apply (a one-line change may need only `ssotchk`), but say what you skipped and why.
- Stop at the artifact — `sip` never touches git or makes commits. Cleaning a commit's message is a separate, user-invoked step (`re0-git`), and `sip` must not chain to it.

## Verification

Before finishing:

1. The change was actually run through the relevant skills, not eyeballed.
2. Findings were applied (or consciously deferred with a stated reason).
3. The artifact actually changed as a result (a diff exists), or every skipped skill has a stated reason.
