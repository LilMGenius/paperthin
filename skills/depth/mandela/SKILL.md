---
name: mandela
description: "Audit any eval, metric, experiment, or benchmark for leakage — does external ground-truth enter independently, or are the model, scorer, and designer just confirming a result no outside truth ever produced? Use before trusting any 'how we'll know it worked' — an A/B, a holdout, a score, a validation — and whenever a result feels too clean or self-confirming. Walks an 8-pattern leakage taxonomy and returns only the patterns that fire, each with an independence fix. Read-only."
---

Audit a validation for leakage: does outside ground-truth actually enter, or is everyone confirming a result no one independently produced?

## Goal

The name is the **Mandela Effect** — a whole population *confidently remembers* something that never independently happened; a leaky validation is the same shape. Walk the 8 patterns below. `mandela` checks one thing: whether a *validation* is independent, or whether the designer, model, and scorer are only confirming each other.

## Workflow

1. Identify the validation (eval / metric / experiment / holdout / "how we'll know"). Name its **components** — what plays model, scorer, designer, dataset.
2. Ask the **core question**: does external ground-truth enter *independently*?
3. Test the validation against all **8 patterns** below (some apply only to certain components — a human subject, a scorer); report only the ones that fire, each by name.
4. Give the independent-ground-truth fix for each hit.

## The 8 leakage patterns

1. **Recall, not reason** — a memorized answer recited instead of one actually derived; the system already knows the result it is supposedly computing.
2. **Wrong null hypothesis** — an ablation that removes a surface label but not the underlying signal the system actually exploits, so the "control" still leaks.
3. **Shared hallucination** — two components verifying each other; circularity reported as a number.
4. **Tautology** — a scorer grading buckets it drew itself.
5. **Verifier = designer** — a private, unreproducible recipe in a holdout's clothes.
6. **Shared-pool bias** — train and holdout drawn from one labeler pool, so one bias enters both sides.
7. **Frame injection** — a question that hands the subject the hypothesis.
8. **Demand characteristics** — measured subjects who know they're being measured.

## Rules

- Subtlety that bites twice: you can blind the **output value** and still leak the **collection recipe**.
- Read-only — name the leak and the independence fix; don't rewrite the experiment.

## Verification

Turn mandela on this audit:

1. Run patterns #3–#5 on yourself: are you a scorer grading buckets you drew (Tautology, #4)? is the verifier the designer (#5)? is your verdict a shared hallucination with the design's own claims (#3)?
2. Could a reader who didn't run the audit reach your verdict from the cited evidence alone — independent ground-truth?
3. The report names the root, not a laundry list.
