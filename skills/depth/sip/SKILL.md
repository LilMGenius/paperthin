---
name: sip
description: "After you create or change an artifact or skill, taste-test it with our own skills instead of trusting your in-session judgment. Use right after writing or editing anything, before calling it done, committing, or handing it off."
---

Check each finished artifact with this suite's skills before handing it over.

## Goal

A reminder in documentation will not reliably trigger verification in a fresh session. `sip` triggers the suite's clarity and truth checks after each creation or change, so verification does not depend on the author's biased in-session judgment.

## Workflow

1. Spot the trigger: you just created or changed an artifact or skill and are about to call it done, commit, or hand it off.
2. **Cold-read it:** run `shower` for a fresh reader's comprehension and handoff check.
3. **Verify truth:** run `factchk` for reality-grounded claims and `mandela` for an eval, metric, or experiment. Skip when the artifact has neither.
4. **Check consistency:** run `ssotize` in audit mode across the repository for anything the change duplicated or contradicted. Execute its consolidation plan only after approval.
5. **Check portability claims:** run `detool` only when the artifact claims portability, tool-neutrality, stack-agnostic durability, or cross-agent reuse. Skip provenance, operational notes, tool-targeted runbooks, and artifacts that do not claim portability.
6. **Tidy:** run `re0` on changed docs so they read as a clean v0, without traces of patching.
7. Apply the findings in the author session, then hand over the artifact.

## Rules

- Trigger on your **own output**, right after making it, when bias is highest and a check is cheapest.
- Use the skills; do not reimplement them: `shower` for clarity, `factchk`/`mandela` for truth, `ssotize` for SSOT, `detool` for portability claims, and `re0` for cleanup. `sip` orchestrates them and returns findings to the author session for fixes.
- Skip checks that plainly do not apply or whose skills are not installed. `factchk`/`mandela` require a claim or an eval; `detool` requires a claim of portability, tool-neutrality, stack-agnostic durability, or cross-agent reuse. A one-line prose tweak may need only a consistency check. State each skip and its reason.
- Stop at the artifact. `sip` never touches git or makes commits.
- Chain only model-invoked skills. Only a human may fire a user-invoked skill marked `disable-model-invocation`; `sip` must not call one.

## Verification

Before finishing:

1. The relevant skills ran on the change; an informal inspection does not count.
2. Findings were applied or deliberately deferred with a stated reason.
3. The artifact changed as a result (a diff exists), or every skipped skill has a stated reason.
