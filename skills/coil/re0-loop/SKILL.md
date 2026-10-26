---
name: re0-loop
description: "Run repeated cycles of build, QA, re0-memo and re0-work while preserving learning and letting code die. Use for long agentic projects where progress must be measured by quality-cleared templates, reusable modules, and eliminated anti-patterns rather than hours spent or features accumulated."
---

Run a long project through repeated laps of the coil cycle so learning compounds and code is free to die.

## Goal

Keep a long project moving through repeated turns so learning compounds and piling up code never passes for progress. Use it on long agentic projects where progress must be measured by quality-cleared output rather than time or feature count. Progress counts only as quality-cleared templates, reusable platform modules, and anti-patterns eliminated in later cycles; never hours, files, panels, or features.

Each lap runs this cycle:

```text
FRAME -> BUILD -> DRIVE -> RE0-MEMO -> HATE -> RE0-WORK -> BUILD AGAIN
```

## Workflow

Run the steps in this order.

1. **Frame.** Write the thesis and the quality gates the lap will be judged against.
2. **Build.** Build one complete vertical slice.
3. **Drive.** Drive the slice through its real surface, picked by artifact: a browser for web apps, HTTP for API contracts, computer-use for desktop apps, and the CLI only for data-shaped artifacts. Capture what the drive shows as the lap's evidence.
4. **Memo.** Call the Skill tool with "re0-memo" to extract lessons, anti-patterns, and next-cycle gates from the lap. The memo lands where that skill's own contract puts it.
5. **Decide.** You decide whether the next pass iterates in place or restarts, and you state the choice as keep, iterate, or re0-work. For a restart, call the Skill tool with "re0-work". When that call, or the next move, is unclear, call the Skill tool with "nba", which reads cycle state and returns the single next action.
6. **Kill the plan.** Attack the next plan before building it. Use the project's adversarial review skill. When that skill is user-invoked only, as `hate` is, the attack is the human's to fire: tell the human to run it, and never call it yourself.
7. **Version.** Put a version label only on the templates or modules that cleared their gates. The next lap builds again from what survived.

## Rules

- Tests support; they are not the gate. Every lap needs a real-surface proof sized to the artifact.
- Do not widen scope before the core loop clears.
- Generated variety is not structural variety: if many outputs converge on one shape, the cycle failed the variety gate.
- Preserve negative corpus so later cycles can prove an anti-pattern is gone.
- Let code die: a restart that keeps the right lessons counts as progress.
- Outside truth is evidence the lap did not produce about itself: a real-surface drive, a user's reaction, data from outside the build. A lap with none stops; add such evidence before running another pass rather than looping on itself.
- Through the Skill tool, call only the model-invoked "re0-memo", "re0-work", and "nba". Route the plan attack to the project's adversarial skill, or to the human when that skill is user-invoked; never call a user-invoked skill.

## Verification

Before closing each lap:

1. The real surface was driven and evidence captured.
2. The re0-memo names at least one lesson, anti-pattern, or gate that affects the next pass.
3. The keep / iterate / re0-work decision is explicit.
4. Any version label sits only on a quality-cleared template or module.
