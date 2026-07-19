---
name: modelchk
description: "Size a task's run before spending it: the cheapest sufficient capability tier (fast, standard, frontier) and the reasoning effort within it, on a neutral scale that binds to whatever levels the model exposes. Use when work seems over- or under-powered, costly, ambiguous, or high-risk, or asks which model class and how much thinking is enough."
---

Size the run before you spend it: how strong a model, and how hard it should think.

`modelchk` is read-only and advisory. From one assessment it sizes the two dials that set a model's per-run cognitive spend — capability tier and reasoning effort. It does not choose, route, switch, pin, spawn, set, or require any concrete model or level.

## Goal

From a single risk-and-complexity read, recommend two coordinates.

**Capability tier** — the cheapest sufficient class of mind:

- `fast` for local, mechanical, reversible work with cheap, complete verification.
- `standard` for ordinary repo-grounded reasoning, multi-step drafting, normal coding, and conventional documentation or skill work.
- `frontier` for architecture, high ambiguity, safety/security/privacy/data-loss risk, release-critical review, cross-domain scope, or work where one wrong assumption wastes a large run.

**Reasoning effort** — how hard that mind should deliberate. `modelchk` recommends the effort *intent*; resolving it to the active model's actual level — like choosing the model itself — is the executor's step, not this skill's. From least to most deliberation:

- `glance` — minimal deliberation; take the direct path. (Resolves to the model's floor.)
- `measured` — ordinary, everyday deliberation. (The model's default, or the middle of its ladder when no default is named.)
- `thorough` — deliberate extra: work the alternatives and check the assumptions. (Above the everyday setting, short of the top.)
- `exhaustive` — maximal deliberation; exhaust the search and re-check the work. (The model's ceiling.)

The two axes are orthogonal — a bounded-but-fiddly task can be `fast` + `thorough`, a quick expert call `frontier` + `glance` — yet in most work they move together, parting only when a cheap task needs hard thinking or a strong model needs only a quick call. Effort buys deliberation, never capability, and more of it is not more correct.

## Workflow

1. Frame the exact work unit being sized: task, artifact, review, rerun, or plan.
2. Score risk and complexity once — this single read feeds both coordinates:
   - file, module, or ownership boundary crossing;
   - reversibility and blast radius;
   - safety, security, privacy, publishing, or data-loss risk;
   - novelty, ambiguity, and long-context synthesis load;
   - need for external research, adversarial review, or careful release sequencing;
   - cost of a wrong answer.
3. Read off the capability tier: the cheapest class whose ceiling covers the work's judgment and risk.
4. Read off the reasoning effort: default it to track the tier (`fast`→`glance`, `standard`→`measured`, `frontier`→`thorough`, reserving `exhaustive` for the hardest, highest-stakes work), then deviate where deliberation-hunger and capability-need part — raise it for ambiguity, long multi-step reasoning, or adversarial self-check on an otherwise cheap task; lower it for a bounded task under a strong model.
5. Report both coordinates, one shared rationale, `move up if...` and `move down if...` triggers for each dial, and the proof surface — the verification the work still needs regardless of tier or effort.
6. Stop.

## Rules

- Size the run's cognitive spend, nothing else. The two dials are *which mind* (capability tier) and *how hard it thinks* (reasoning effort). Orchestration dials — context budget, fan-out width, tool-permission scope — are a different reflex and stay out; sharing this one risk read does not pull them in.
- Neutral language only: tier is `fast`/`standard`/`frontier`; effort is `glance`/`measured`/`thorough`/`exhaustive`, each an intent defined by a position on the active model's ladder — floor, default, above-default, ceiling — never a named vendor level.
- When resolved, effort binds to positions, not levels: a model lacking an interior level collapses the rung to the nearest it offers, so the intent always maps to a real setting and never resolves out of range.
- The default is the cheapest sufficient tier and the effort that meets the work, not the strongest of either.
- Effort is deliberation budget, not capability and not answer length. Never raise it to buy capability — that is the tier's job.
- No routing authority. This skill recommends two coordinates; the user, harness, or executor decides what runs and sets the actual level.
- Do not name concrete model products, vendors, or versions in durable mechanism text.
- Risk beats size: a one-file high-risk change can want `frontier`; a broad mechanical rename can stay `fast` + `thorough` when verification is complete.
- Verification is separate. A stronger tier or a higher effort never replaces tests, review, command output, manual QA, or other proof surface.
- Do not execute the task being sized, change configuration, call another model, or alter provider settings.
- Do not override an explicit user tier or effort choice. Report the mismatch if one is visible.

## Output

```text
recommended_tier: fast|standard|frontier
recommended_effort: glance|measured|thorough|exhaustive
rationale: <one sentence, covering both dials>
move_up_if: <signals that would justify a stronger tier or higher effort>
move_down_if: <signals that would justify a cheaper tier or lower effort>
proof_surface: <verification still required, independent of tier and effort>
```

## Verification

Before finishing, confirm the report:

- names exactly one tier (`fast`/`standard`/`frontier`) and one effort (`glance`/`measured`/`thorough`/`exhaustive`);
- states the cheapest sufficient tier and the effort that meets the work, not the strongest of either;
- gives move-up and move-down triggers covering both dials;
- names the proof surface;
- makes no routing, switching, provider, vendor, product, version, or concrete-level claim, and names no orchestration dial beyond the two cognitive-spend ones.
