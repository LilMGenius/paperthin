---
name: re0-plan
description: "Open a paperthin iteration's casebook before re0-loop's first turn — seeded with real content the moment the folder exists, never an empty directory. User-invoked, paperthin-only: assumes the full skill package installed. Run when opening a new build cycle in this repo."
disable-model-invocation: true
---

Open `.re0/iteration/<version>-<workname>/` and write into it in the same motion, before a single line of `re0-loop`'s cycle runs.

## Goal

A cycle without a written thesis, gate list, and step plan drifts to whatever framing comes first — and a folder opened with nothing in it tells a resumed session nothing at all. `re0-plan` closes both gaps at once: the folder is never empty from the moment it's created, regardless of which weight the cycle turns out to be. It assumes the full paperthin package installed and names its sibling skills directly. It pairs with `re0-release`, which retires the folder, and `re0-memo`, which extends whatever this skill seeded instead of restarting fresh. It is not a portable planning method — the shape it writes is this repo's own convention.

## Workflow

1. Classify the cycle's weight: a fix or hardening pass with no real design surface is **lightweight**; a cycle with a direction genuinely worth arguing through is **full**.
2. Create `.re0/iteration/<version>-<workname>/` and, in the same step, write its first file — the weight decides which:
   - **lightweight** → `RETRO.local.md`: one paragraph naming the task and why it's lightweight. `re0-memo` extends this same file at the end; it never starts a fresh one. Stop here.
   - **full** → `DESIGN.local.md`: thesis, scope, and quality gates — the same content `re0-loop`'s FRAME turn expects, and enough on its own to survive a session break. Confirm the read with `readchk`, size the tier with `modelchk`; reach for `macrothink` or another judgment skill only when the direction is genuinely contestable.
3. (full only) Write `WORKFLOW.local.md`: the numbered steps this specific cycle runs through `re0-loop`'s turn order — specific to this build, not a restatement of `re0-loop`'s generic stages.
4. (full only) Write `EVIDENCE.local.md`: the gates from `DESIGN.local.md`, listed as proof surface still to fill — the bar, not results.
5. Keep reference material flat as `REF-<topic>.local.md`; promote to a `refs/` subfolder only once it multiplies past a couple of files.
6. Hand off to `re0-loop`. Do not invoke `re0-work` here — a from-scratch restart is `re0-loop`'s own mid-cycle call, surfaced by `nba` when warranted, never a setup step.

## Rules

- **The folder is never empty at creation.** Every path, lightweight or full, writes real content in the same motion the folder is made, so a session break at any point still leaves something to resume from.
- **Not portable, by design.** Names other paperthin skills directly and assumes the full package installed — the opposite of the self-contained default every other skill here follows. It exists only to pair with `re0-release` and `re0-memo`, not to travel alone.
- **No padding.** Lightweight gets no `DESIGN`/`WORKFLOW`/`EVIDENCE`, and its `RETRO.local.md` seed stays one paragraph — a task note, not a `WORKFLOW.local.md` in disguise. A judgment skill or `re0-work` never gets forced in "just in case."
- **negatives-as-corpus** — nothing this skill or the cycle it opens produces gets deleted; a cycle that goes wrong is retired by `re0-release`, not discarded.
- Every `EVIDENCE.local.md` gate traces back to a line in `DESIGN.local.md`; don't invent proof surface `DESIGN` never asked for.

## Verification

Before finishing:

1. The folder has real content from the moment it exists — no empty directory, on either path.
2. Full path: `DESIGN.local.md` states a thesis, scope, and gates; `WORKFLOW.local.md`'s steps are specific to this cycle; every `EVIDENCE.local.md` gate traces to `DESIGN.local.md`.
3. Lightweight path: `RETRO.local.md` is seeded with the task and reason, one paragraph.
4. Reference material stayed flat unless it earned a `refs/` subfolder.
5. Report which path was taken and why.
