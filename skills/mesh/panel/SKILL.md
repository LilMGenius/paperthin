---
name: panel
description: "Convene a small panel of independent perspectives on one claim, plan, or artifact, and return their convergence — where they agree, where they disagree, and the single next question that would resolve the disagreement. Use when a single reviewer is not enough because the failure modes are heterogeneous (e.g. correctness, security, and readability all pull in different directions), or when a claim looks strong to its author and needs cross-lens pressure before it ships."
---

Convene independent perspectives on the same artifact and return their convergence.

## Goal

The result must be a picture of where the panel agrees, where it disagrees, and the smallest question that would resolve the disagreement. It should not be a checklist or an average — averaging perspectives is the failure mode this skill exists to prevent.

## Workflow

1. Read the artifact end to end before drawing the panel.
2. Pick two to four perspectives whose failure modes are distinct — e.g. correctness, security, readability, cost, adversarial user. Adding a fifth that overlaps an existing one dilutes; adding one that overlaps nothing does not add signal.
3. For each perspective, produce a one-line verdict — pass, fail, or unclear — with the single most load-bearing reason. No hedging list; if the reason is not load-bearing, drop it.
4. Compare the verdicts. Group them into three regions — full agreement, agreement with different reasons, disagreement.
5. If any region is disagreement, identify the single next question whose answer would move the disagreement into agreement or into a clean split with owners. That question is the panel's output, not the individual verdicts.
6. If every region is agreement, return the shared verdict with the union of reasons — restrained to the reasons that were load-bearing for at least two perspectives.

## Rules

- Independent perspectives, not roles. A "security reviewer" and a "senior security reviewer" are one perspective, not two.
- One reason per perspective. The load-bearing one. A perspective that returns a list is a perspective that is hedging.
- Disagreement is the product. The panel exists to surface disagreement between perspectives; a panel that agrees on everything did not need to be convened.
- Do not average. If two perspectives split, the answer is the question that would resolve the split, not the midpoint of their verdicts.
- Do not carry perspectives across artifacts. Every panel is drawn for the artifact in hand; a perspective useful for a spec may not be useful for a migration.
- A pass that finds no disagreement returns the shared verdict and stops — it does not manufacture disagreement to justify itself.

## Verification

The result reads as a picture, not a checklist — a reader sees which perspectives agreed, which disagreed, and the one question that matters, and can act on it without re-running the panel. If the reader would need to re-run the panel to know what to do next, the panel did not converge; the workflow's step 5 was skipped.
