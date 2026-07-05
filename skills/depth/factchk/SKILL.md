---
name: factchk
description: "Verify reality-grounded claims against external sources in both directions before they ship — could the 'absurd' be real, could the 'obvious' be false or long-established? Use whenever an artifact, or the sentence you are about to write, asserts something as plausible, realistic, absurd, novel, or impossible from intuition rather than a checked source; before relying on a factual claim in prose, a design rationale, a research claim, or a plan. Fires on metacognitive doubt — when you can't actually know, verify instead of trusting the feeling. Scans read-only, then fixes the clear errors or flags the judgment calls; leaves deliberate fiction alone."
---

Check what's asserted as real against reality — in both directions — before it ships.

## Goal

The author's "plausible / absurd / novel" is the least reliable line in any artifact. Human priors fail **both ways** — they exclude the real (desert frogs exist) and normalize the impossible (weightless crates). `factchk` scans claims presented as reality-grounded, verifies each against external sources in both directions, and fixes or flags. Its scope is a claim about *the world* — whether what's asserted as real is real — not the soundness of a validation or the survival of a whole plan.

## Workflow

1. Scan for **reality-grounded assertions** — anything leaning on "this is plausible / realistic / absurd / novel / impossible because X," including the claim you are *about to write*, not only those already on the page.
2. Verify each against **external sources** (web search, open references) in **both directions**: could the "absurd" be real? could the "obvious" or "novel" be false or long-established? If you cannot reach a source, **flag — never assert from intuition**.
3. **Fix or flag:** a mechanically-clear error (a wrong date, a misattributed source, a falsified number) → correct it with a cited source; a judgment call (a contested or interpretive claim) → surface it, don't silently rewrite.
4. Report each claim, its verdict, the source, and — for a failed claim — which direction it failed.

## Rules

- Target claims asserted **as reality-grounded**, never deliberate fiction ("in our world, boxes float" is a declared choice). When it is unclear whether a claim is an in-world choice or a real-world assertion, **flag, don't fix** — the hardest call in the skill.
- Flagging only the unrealistic catches half the errors.
- The trigger is **metacognition, not knowledge**: you can't know every domain, so the moment you are about to assert a checkable fact from a feeling, verify it instead of trusting the feeling.
- A pass that finds nothing changes nothing.

## Verification

Before finishing: every verdict traces to a citable external source, not a reworded prior intuition — and the report reads as fixes-vs-flags, not restated intuitions.
