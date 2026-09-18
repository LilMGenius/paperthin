---
name: modelchk
description: "Size a task's run before spending it: the cheapest sufficient capability tier (fast, standard, frontier) and the reasoning effort within it, on a neutral scale that binds to whatever levels the model exposes. Use when work seems over- or under-powered, costly, ambiguous, or high-risk, or asks which model class and how much thinking is enough."
---

Size the run before spending it: how strong a model, and how hard it should think.

## Goal

`modelchk` is read-only and advisory. One assessment of risk and complexity sizes two dials: capability tier and reasoning effort. It does not choose, route, switch, pin, spawn, set, or require any concrete model or level.

**Capability tier** is the cheapest sufficient class:

- `fast` for local, mechanical, reversible work with cheap, complete verification.
- `standard` for ordinary repo-grounded reasoning, multi-step drafting, normal coding, and conventional documentation or skill work.
- `frontier` for architecture, high ambiguity, safety/security/privacy/data-loss risk, release-critical review, cross-domain scope, or work where one wrong assumption wastes a large run.

**Reasoning effort** is how hard the model should deliberate. The skill recommends an intent; the executor chooses the model and resolves that intent to its actual level. From least to most deliberation:

- `glance`: minimal deliberation; take the direct path. Resolves to the model's floor.
- `measured`: ordinary deliberation. Resolves to the model's default, or the middle of its ladder if no default is named.
- `thorough`: work the alternatives and check assumptions. Resolves above the everyday setting, short of the top.
- `exhaustive`: maximal deliberation; exhaust the search and re-check the work. Resolves to the model's ceiling.

The axes are independent. A bounded but fiddly task can be `fast` + `thorough`; a quick expert call can be `frontier` + `glance`. In most work they move together, parting when a cheap task needs hard thinking or a strong model needs only a quick call. Effort buys deliberation, never capability, and more effort is not more correct.

## Workflow

1. Frame the exact work unit: task, artifact, review, rerun, or plan.
2. Assess risk and complexity once for both coordinates:
   - file, module, or ownership boundary crossing;
   - reversibility and blast radius;
   - safety, security, privacy, publishing, or data-loss risk;
   - novelty, ambiguity, and long-context synthesis load;
   - need for external research, adversarial review, or careful release sequencing;
   - cost of a wrong answer.
3. Choose the cheapest capability tier whose ceiling covers the work's judgment and risk.
4. Default effort to track tier (`fast`→`glance`, `standard`→`measured`, `frontier`→`thorough`), reserving `exhaustive` for the hardest, highest-stakes work. Raise effort when an otherwise cheap task needs ambiguity resolved, long multi-step reasoning, or adversarial self-check; lower it for bounded work under a strong model.
5. Report both coordinates, one shared rationale, `move up if...` and `move down if...` triggers for each dial, and the proof surface: verification still needed regardless of tier or effort.
6. Stop.

## Rules

- Size two dials only: capability tier and reasoning effort. Call count and skill order belong to routing, owned by the workflow recommendation.
- Size cognitive spend only: which capability tier and how much reasoning effort. Context budget, fan-out width, and tool-permission scope are orchestration dials and stay outside this skill, even when they share the risk assessment.
- Use neutral language: `fast`/`standard`/`frontier` for tier and `glance`/`measured`/`thorough`/`exhaustive` for effort. Effort names positions on the active model's ladder (floor, default, above-default, ceiling), never vendor levels.
- Bind effort to positions, not level names. If a model lacks an interior level, collapse that rung to the nearest available setting; never resolve outside its range.
- Default to the cheapest sufficient tier and the effort the work needs, not the strongest of either.
- Effort budgets deliberation, not capability or answer length. Never raise effort to buy capability; raise the tier.
- This skill has no routing authority. The user, harness, or executor decides what runs and sets the actual level.
- Do not name concrete model products, vendors, or versions in durable mechanism text.
- Risk beats size: a one-file high-risk change can need `frontier`; a broad mechanical rename can stay `fast` + `thorough` with complete verification.
- Verification is separate. Neither dial replaces tests, review, command output, manual QA, or other proof.
- Do not execute the task being sized, change configuration, call another model, or alter provider settings.
- Do not override an explicit user tier or effort choice. Report a visible mismatch.

## Verification

```text
recommended_tier: fast|standard|frontier
recommended_effort: glance|measured|thorough|exhaustive
rationale: <one sentence, covering both dials>
move_up_if: <signals that would justify a stronger tier or higher effort>
move_down_if: <signals that would justify a cheaper tier or lower effort>
proof_surface: <verification still required, independent of tier and effort>
```

Before finishing, confirm the report:

- names exactly one tier (`fast`/`standard`/`frontier`) and one effort (`glance`/`measured`/`thorough`/`exhaustive`);
- states the cheapest sufficient tier and the effort the work needs, not the strongest of either;
- gives move-up and move-down triggers covering both dials;
- names the proof surface;
- makes no routing, switching, provider, vendor, product, version, or concrete-level claim, and names no orchestration dial beyond the two cognitive-spend ones.
