---
name: sip
description: "After you create or change an artifact or skill, taste-test it with our own skills instead of trusting your in-session judgment. Use right after writing or editing anything, before calling it done, committing, or handing it off."
---

Taste-test what you just made with this suite's own clarity and truth checks before you call it done.

## Goal

Your judgment of a thing is most biased right after you make it. `sip` runs this suite's own clarity and truth checks on an artifact or skill you just created or changed, so its verification does not rest on that judgment. It fires on your own output, immediately after you produce it, when you are about to call it done, commit it, or hand it off. It exists because a written reminder to verify does not reliably fire in a fresh session; the skill is the trigger.

## Workflow

Run the steps in this order.

1. **Cold read.** Call the Skill tool with "shower" for a fresh reader's comprehension and handoff check.
2. **Truth.** Call the Skill tool with "factchk" for claims grounded in reality, and call it separately with "mandela" for an eval, metric, or experiment. Skip this step when the artifact has neither kind of content.
3. **Consistency.** Call the Skill tool with "ssotize" to audit the repository for anything the change duplicated or contradicted. Execute its consolidation plan only after approval.
4. **Portability.** Call the Skill tool with "detool" only when the artifact claims portability, tool-neutrality, stack-agnostic durability, or cross-agent reuse. Skip it for provenance, operational notes, runbooks aimed at a specific tool, and anything making no such claim.
5. **Tidy.** Call the Skill tool with "re0" on the changed docs so they read as a clean v0 with no traces of patching.
6. **Apply and hand over.** You return the findings to the author session, which applies each one or defers it with a reason, then hands the artifact over.

## Rules

- Use the named skills; never reimplement their checks inline. `shower` covers clarity, `factchk` and `mandela` truth, `ssotize` single source of truth, `detool` portability claims, and `re0` cleanup.
- `sip` orchestrates only: findings go back to the author session, which makes the fixes.
- Skip any check that plainly does not apply, and any whose skill is not installed. `factchk` and `mandela` need a claim or an eval; `detool` needs one of the four portability claims in step 4. A one-line prose tweak may need only the consistency check.
- State every skip with its reason.
- Stop at the artifact: never touch version control and never commit.
- Call only model-invoked skills. A user-invoked skill is one its host keeps out of the model's reach (a `disable-model-invocation` frontmatter flag, for one); only a human can fire it, so `sip` never calls one.
- The only approval gate is `ssotize`'s consolidation plan in step 3.

## Verification

Before handing over, confirm:

1. The relevant skills actually ran on the change; an informal look does not count.
2. The author session applied each finding, or deferred it on purpose with a stated reason.
3. Either the artifact changed as a result (a diff exists), or every check that ran found nothing and every skipped skill has a stated reason; in that case the artifact is handed over unchanged with that list.
