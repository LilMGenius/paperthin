---
name: redteam
disable-model-invocation: true
description: "Adversarially try to KILL a plan, design, or argument before you commit to it — return the single load-bearing flaw and the cheapest experiment that would falsify it (the 'first nail'), not a checklist. Run it yourself when you're about to spend real effort on something; user-invoked on purpose, never auto-fired, because a kill-it reflex always in the agent's reach would bias it toward demolition. Composes factchk and mandela for the fact and leakage axes; it owns the synthesis to one root."
---

Try to kill the artifact, not improve it — return the one root flaw and the cheapest shot that fells it.

## Goal

Where `shower` asks "can a stranger follow this?" (comprehension), `redteam` asks "does this survive someone trying to break it?" (validity). It is the **superset** reflex: where `factchk` checks one fact and `mandela` audits one validation, `redteam` attacks the *whole* plan and collapses it to a single root. The highest-value output is never a checklist — it's one root cause plus the cheaper experiment hiding inside the elaborate plan.

## Workflow

1. Pin the **load-bearing assumption(s)** — what must hold for the whole thing to stand.
2. Attack on whatever axes apply — the general ones first: **a load-bearing fact** that may be false (run `factchk`), **confabulation** (a post-hoc story treated as ground truth), **analogy-mistaken-for-isomorphism** (structure assumed to transfer across domains where it doesn't), **future-tense suture** (the argument leans on a result that doesn't exist yet), and the sharpest — **cites a principle but implements its opposite**; and for empirical / research plans, **leakage** (run `mandela`) and **statistical power / family-wise α** (a true hypothesis auto-failing from uncorrected tests; a near-zero-power condition that rubber-stamps regardless of truth).
3. Collapse the findings to the **single root** cause — the one whose failure makes the others moot.
4. Find the **first nail** — the cheapest falsification of the load-bearing assumption: the check (in time / cost / sample) that could kill it *before* the expensive program runs.
5. Return `{ root, first_nail }` — not a list.

## Rules

- **Kill, don't improve** — improving is a different reflex.
- Compose, don't duplicate — invoke `factchk` and `mandela` for their axes; you own the synthesis to one root.

## Verification

Before finishing:

1. The root is genuinely load-bearing — the plan falls without it.
2. The first nail is genuinely cheaper than the plan it would pre-empt.
