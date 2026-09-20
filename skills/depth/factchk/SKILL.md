---
name: factchk
description: "Verify reality-grounded claims against external sources in both directions before they ship: could the 'absurd' be real, could the 'obvious' be false or long-established? Use whenever an artifact, or the sentence you are about to write, asserts something as plausible, realistic, absurd, novel, or impossible from intuition rather than a checked source; before relying on a factual claim in prose, a design rationale, a research claim, or a plan. Fires on metacognitive doubt: when you can't actually know, verify instead of trusting the feeling. Scans read-only, then fixes the clear errors or flags the judgment calls; leaves deliberate fiction alone."
---

Check claims against reality in both directions before they ship.

## Goal

The author's judgment of what is plausible, absurd, or novel is the least reliable line in an artifact. Human priors fail **both ways**: they exclude the real (desert frogs exist) and normalize the impossible (weightless crates). `factchk` checks reality-grounded claims against external sources, then fixes errors or flags judgment calls. It checks claims about *the world*, not the soundness of a validation or the survival of a whole plan.

## Workflow

1. Scan for **reality-grounded assertions** that call something plausible, realistic, absurd, novel, or impossible because of a factual premise. Include claims you are *about to write*.
2. Verify each against **external sources** (web search, open references) in **both directions**: could the "absurd" be real? Could the "obvious" or "novel" be false or long-established? If you cannot reach a source, **flag it; never assert from intuition**.
3. **Fix or flag:** correct mechanically clear errors, such as wrong dates, misattributed sources, or falsified numbers, with a cited source. Surface contested or interpretive claims as judgment calls; do not silently rewrite them.
4. Report each claim, its verdict, the source, and which direction a failed claim failed.

## Rules

- Target claims asserted **as reality-grounded**, never deliberate fiction ("in our world, boxes float" is a declared choice). If it is unclear whether a claim is an in-world choice or a real-world assertion, **flag, don't fix**.
- Flagging only the unrealistic catches half the errors.
- **Metacognitive doubt** triggers the check. You cannot know every domain; when you are about to assert a checkable fact from a feeling, verify it.
- A pass that finds nothing changes nothing.

## Verification

Before finishing, confirm that every verdict traces to a citable external source. The report distinguishes fixes from flags; it does not restate prior intuitions.
