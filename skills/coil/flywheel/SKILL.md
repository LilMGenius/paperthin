---
name: flywheel
description: "Run repeated build -> QA -> retro -> re0-work cycles while preserving learning and letting code die. Use for long agentic projects where progress must be measured by quality-cleared templates, reusable modules, and eliminated anti-patterns rather than hours spent or features accumulated."
---

Run the cycle so learning compounds and code accumulation does not masquerade as progress.

## Goal

`flywheel` keeps a project moving through repeated turns:

```text
FRAME -> BUILD -> DRIVE -> RETRO -> HATE -> RE0-WORK -> BUILD AGAIN
```

The unit of progress is not hours, files, panels, or features. It is the count of quality-cleared templates, reusable platform modules, and anti-patterns eliminated in later cycles.

## Workflow

1. Frame the thesis and quality gates.
2. Build one complete vertical slice.
3. Drive it through the real surface: browser for web apps, HTTP for API contracts, computer-use for desktop apps, and CLI only for data-shaped artifacts.
4. Run `retro` to extract lessons, anti-patterns, and next-cycle gates.
5. Decide whether the next pass iterates in place or uses `re0-work`; when that call or the next move is unclear, `nba` reads the cycle state and returns the single next action.
6. Kill the next plan before build: use the project's adversarial review skill or a human-invoked attack when that skill is user-only.
7. Version only templates or modules that clear their gates.

## Rules

- Tests are supporting evidence, not the gate; every turn needs a real-surface proof sized to the artifact.
- Do not widen before the core loop clears.
- Do not confuse generated variety with structural variety. If many outputs converge to the same shape, the cycle failed the variety gate.
- Preserve negative corpus so later cycles can prove the same anti-pattern is gone.
- Let code die. A restart that preserves the right lessons is progress.
- Stop a lap when no outside truth enters; add evidence before another internal pass.

## Verification

Before finishing a lap:

1. The real surface was driven and evidence was captured.
2. The retro names at least one lesson, anti-pattern, or gate that affects the next pass.
3. The keep/iterate/re0-work decision is explicit.
4. Any version label belongs only to a quality-cleared template or module.
