---
name: hate
disable-model-invocation: true
description: "Attack a plan, design, or argument like you want it to fail before you commit real effort; return the single load-bearing objection and the cheapest experiment that would prove it matters, not a checklist. User-invoked on purpose: a hate-it reflex always in the agent's reach would bias it toward demolition. Weighs many failure axes but owns the synthesis to one root."
---

Attack the plan and return the one objection that could kill it, with the cheapest experiment that proves it matters.

## Goal

Test the validity of the whole plan by asking what someone who wants it to fail would attack first. Examine its load-bearing structure, beyond any one fact or line, and collapse the attack to a single root. Return one objection plus the cheaper experiment hidden in the elaborate plan, never a checklist.

## Workflow

1. Pin the **load-bearing assumptions**: what must hold for the whole thing to stand.
2. Attack on the applicable axes, starting with the general ones: **a load-bearing fact** that may be false; **confabulation**, a post-hoc story treated as ground truth; **analogy-mistaken-for-isomorphism**, assuming structure transfers across domains where it doesn't; **future-tense suture**, relying on a result that doesn't exist yet; and the sharpest, **cites a principle but implements its opposite**. For empirical or research plans, also check **leakage**, where no external ground truth enters validation independently, and **statistical power / family-wise α**, where uncorrected tests auto-fail a true hypothesis or a near-zero-power condition rubber-stamps regardless of truth.
3. Collapse the findings to the **single root** objection whose failure makes the others moot.
4. Find the **first nail**: the cheapest falsification of the load-bearing assumption by time, cost, or sample. It must be able to kill the plan before the expensive program runs.
5. Return `{ root, first_nail }`, never a list.

## Rules

- **Attack, don't improve.** Improving is a different reflex.
- **Own the synthesis.** Many axes may fire; collapse them to the single load-bearing root and return it, never a list.

## Verification

Before finishing:

1. The root is load-bearing: the plan falls without it.
2. The first nail is cheaper than the plan it would pre-empt.
