---
name: hate
disable-model-invocation: true
description: "Attack a plan, design, or argument like you want it to fail before you commit real effort — return the single load-bearing objection and the cheapest experiment that would prove it matters, not a checklist. User-invoked on purpose: a hate-it reflex always in the agent's reach would bias it toward demolition. Weighs many failure axes but owns the synthesis to one root."
---

Refuse to be nice to the plan — return the one objection that could kill it and the cheapest shot that proves it matters.

## Goal

`hate` asks "what would someone who wants this to fail attack first?" (validity). It attacks the *whole* plan — not one fact or one line, but the load-bearing structure — and collapses the attack to a single root. The highest-value output is never a checklist — it's one objection plus the cheaper experiment hiding inside the elaborate plan.

## Workflow

1. Pin the **load-bearing assumption(s)** — what must hold for the whole thing to stand.
2. Attack on whatever axes apply — the general ones first: **a load-bearing fact** that may be false, **confabulation** (a post-hoc story treated as ground truth), **analogy-mistaken-for-isomorphism** (structure assumed to transfer across domains where it doesn't), **future-tense suture** (the argument leans on a result that doesn't exist yet), and the sharpest — **cites a principle but implements its opposite**; and for empirical / research plans, **leakage** (no external ground-truth enters the validation independently) and **statistical power / family-wise α** (a true hypothesis auto-failing from uncorrected tests; a near-zero-power condition that rubber-stamps regardless of truth).
3. Collapse the findings to the **single root** objection — the one whose failure makes the others moot.
4. Find the **first nail** — the cheapest falsification of the load-bearing assumption: the check (in time / cost / sample) that could kill it *before* the expensive program runs.
5. Return `{ root, first_nail }` — not a list.

## Rules

- **Attack, don't improve** — improving is a different reflex.
- **Own the synthesis** — many axes may fire, but collapse them to the single load-bearing root; return that, never a list.

## Verification

Before finishing:

1. The root is genuinely load-bearing — the plan falls without it.
2. The first nail is genuinely cheaper than the plan it would pre-empt.
