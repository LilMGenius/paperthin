---
name: sip
description: "After you create or change an artifact or skill, taste-test it with our own skills instead of trusting your in-session judgment — recursive self-improvement, made automatic. Use right after writing or editing anything, before calling it done, committing, or handing it off."
---

Taste your own cooking: the moment you finish making something, check it with the very skills this repo ships before you serve it.

## Goal

A reminder buried in docs ("remember to verify") won't reliably fire in a fresh session. `sip` makes the recursive self-improvement loop a triggered habit: right after any create or change, run our own skills on the result — the clean checks and the true ones — so quality doesn't ride on the author's biased in-session judgment.

## Workflow

1. Spot the trigger: you just created or changed an artifact or skill and are about to call it done, commit, or hand it off.
2. **Cold-read it** — run `shower` on the artifact (fresh-eyes comprehension / handoff check).
3. **Verify it's true** — if the artifact asserts a reality-grounded claim, run `factchk`; if it defines an eval, metric, or experiment, run `mandela`. Skip when it has neither.
4. **Check consistency** — run `ssotchk` across the repo for anything the change duplicated or contradicted; `ssotize` if it found scatter.
5. **Tidy** — `re0` the changed docs so the result reads as a clean v0, not a patch over a draft.
6. Apply the findings here, then serve it.

## Rules

- Trigger on your OWN output, right after making it — that's when bias is highest and a check is cheapest.
- Use the skills; don't re-implement them — `shower` for clarity, `factchk`/`mandela` for truth, `ssotchk`/`ssotize` for SSOT, `re0` for cleanup. `sip` orchestrates and routes findings back to the author session to fix; the skills do the work.
- Skip what plainly doesn't apply, or any check whose skill isn't installed — run only what's present. `factchk`/`mandela` fire only when there is a claim or an eval; a one-line prose tweak may need only a consistency check. Say what you skipped and why.
- Stop at the artifact — `sip` never touches git or makes commits.
- Chain only model-invoked skills; a user-invoked skill (marked `disable-model-invocation`) is a human's to fire deliberately, so `sip` must not call one.

## Verification

Before finishing:

1. The change was actually run through the relevant skills, not eyeballed.
2. Findings were applied (or consciously deferred with a stated reason).
3. The artifact actually changed as a result (a diff exists), or every skipped skill has a stated reason.
