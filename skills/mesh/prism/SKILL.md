---
name: prism
disable-model-invocation: true
description: "Split one artifact (a claim, plan, or file) across 2 to 5 independent lenses, one per genuinely distinct failure mode (correctness, security, readability, cost, adversarial-user), and return their convergence: where they agree, where they disagree, and the single next question that resolves the disagreement. Use when one reviewer isn't enough because the failure modes are heterogeneous, or a claim looks strong to its author and needs cross-lens pressure before it ships."
---

Split one artifact across independent lenses and return where they converge and where they don't.

## Goal

Show where the lenses agree, where they disagree, and the smallest question that would resolve the disagreement. Do not return a checklist or average the lenses.

## Workflow

1. Read the artifact end to end before choosing the lenses.
2. Choose one lens per genuinely distinct failure mode: correctness, security, readability, cost, adversarial-user, and the like. Count candidates that share a failure mode as one lens. In practice this gives **2 and 5** as the bounds: below 2 there is nothing to converge, and past 5 lenses almost always overlap. The artifact's distinct failure modes determine the count; there is no default.
3. Through each lens, produce a one-line verdict (pass, fail, or unclear) with its single most load-bearing reason. Drop reasons that are not load-bearing; do not return a hedging list.
4. Compare the verdicts and group them: full agreement, agreement for different reasons, disagreement.
5. For disagreement, return the single next question whose answer would produce agreement or a clean split with owners. That question is the output, not the individual verdicts.
6. Where every lens agrees, return the shared verdict with the reasons that were load-bearing for at least two lenses.

## Rules

- Independent lenses, not roles. A "security reviewer" and a "senior security reviewer" are one lens, not two.
- One reason per lens: the load-bearing one. A lens that returns a list is hedging.
- Disagreement is the product. A prism that agrees on everything did not need to be run.
- Never average. If two lenses split, the answer is the question that resolves the split, not the midpoint of their verdicts.
- Draw the lenses fresh for the artifact in hand. A lens useful for a spec may be useless for a migration; don't carry lenses across artifacts.
- Don't manufacture disagreement. A run that finds none returns the shared verdict and stops.
- User-invoked on purpose: plural lenses are an opt-in spend, and their convergence must never masquerade as automatic proof, so this fires only when deliberately reached for.

## Verification

A reader sees which lenses agreed, which disagreed, and the one question that matters, without working through a checklist. They can act without re-running the prism; if they need another run to know what to do next, step 5 was skipped.
