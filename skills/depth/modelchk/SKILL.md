---
name: modelchk
description: "Recommend the cheapest sufficient capability tier for a task: fast, standard, or frontier. Use when work seems overpowered, underpowered, costly, ambiguous, high-risk, or asks which model class is enough."
---

Recommend the capability tier a task needs before spending the run.

`modelchk` is read-only and advisory. It sizes the work; it does not choose, route, switch, pin, spawn, or require a concrete model.

## Goal

Classify the task into the cheapest sufficient tier:

- `fast` for local, mechanical, reversible work with cheap and complete verification.
- `standard` for ordinary repo-grounded reasoning, multi-step drafting, normal coding, and conventional documentation or skill work.
- `frontier` for architecture, high ambiguity, safety/security/privacy/data-loss risk, release-critical review, cross-domain scope, or work where one wrong assumption can waste a large run.

## Workflow

1. Frame the exact work unit being sized: task, artifact, review, rerun, or plan.
2. Score the risk and complexity:
   - file, module, or ownership boundary crossing;
   - reversibility and blast radius;
   - safety, security, privacy, publishing, or data-loss risk;
   - novelty, ambiguity, and long-context synthesis load;
   - need for external research, adversarial review, or careful release sequencing;
   - cost of a wrong answer.
3. Pick the cheapest sufficient tier:
   - choose `fast` when the task is bounded, mechanical, reversible, and easy to prove;
   - choose `standard` when normal reasoning and synthesis are needed but risk is ordinary;
   - choose `frontier` when risk, ambiguity, architecture, or expensive failure dominates.
4. Report:
   - recommended tier;
   - one-sentence rationale;
   - `move up if...` triggers;
   - `move down if...` triggers;
   - proof surface the work still needs.
5. Stop.

## Rules

- Use capability tier language only: `fast`, `standard`, or `frontier`.
- The default is the cheapest sufficient tier, not the strongest tier.
- No routing authority. This skill recommends a tier; the user, harness, or executor decides what actually runs.
- Do not name concrete model products, vendors, or versions in durable mechanism text.
- Risk beats size: a one-file high-risk change can require `frontier`, while a broad mechanical rename can stay `fast` if verification is complete.
- Verification is separate. A stronger tier never replaces tests, review, command output, manual QA, or other proof surface.
- Do not execute the task being sized, change configuration, call another model, or alter provider settings.
- Do not override an explicit user model or capability choice. Report the mismatch if one is visible.

## Output

```text
recommended_tier: fast|standard|frontier
rationale: <one sentence>
move_up_if: <signals that would justify a stronger tier>
move_down_if: <signals that would justify a cheaper tier>
proof_surface: <verification still required, independent of tier>
```

## Verification

Before finishing, confirm the report:

- names exactly one of `fast`, `standard`, or `frontier`;
- states the cheapest sufficient tier;
- includes both move-up and move-down triggers;
- names the proof surface;
- makes No routing, switching, provider, vendor, product, or version claim.
