---
name: re0-plan
description: "Open a paperthin iteration's casebook before re0-loop's first turn, seeded with real content the moment the folder exists, never an empty directory. User-invoked, paperthin-only: assumes the full skill package installed. Run when opening a new build cycle in this repo."
disable-model-invocation: true
---

Open `.re0/iteration/<version>-<workname>/` and write into it in the same motion, before a single line of `re0-loop`'s cycle runs.

## Goal

A written thesis, gate list, and step plan keep a cycle from drifting toward its first framing. A seeded folder lets a resumed session recover that context. `re0-plan` writes real content at creation for either cycle weight. It assumes the full paperthin package installed and names sibling skills directly: `re0-release` retires the folder, and `re0-memo` extends its seed instead of starting fresh. This repository's casebook convention is not a portable planning method.

## Workflow

1. Classify the cycle's weight: a fix or hardening pass with no real design surface is **lightweight**; a cycle whose direction warrants debate is **full**.
2. Create `.re0/iteration/<version>-<workname>/` and write its first file in the same step, according to weight:
   - **lightweight** → `RETRO.local.md`: one paragraph naming the task and why it's lightweight. `re0-memo` extends this same file at the end; it never starts a fresh one. Stop here.
   - **full** → `DESIGN.local.md`: thesis, scope, and quality gates matching `re0-loop`'s FRAME turn, sufficient to resume after a session break. Changes to shippable surface always require an AGENTS.md/README reflection gate (see Rules). Confirm the read with `readchk` and size the tier with `modelchk`; use `macrothink` or another judgment skill only for a contestable direction.
3. (full only) Write `WORKFLOW.local.md`: numbered steps specific to this build, following `re0-loop`'s turn order without restating its generic stages.
4. (full only) Write `EVIDENCE.local.md`: gates from `DESIGN.local.md`, stating the proof still required, not results.
5. Keep reference material flat as `REF-<topic>.local.md`; promote to a `refs/` subfolder only once it multiplies past a couple of files.
6. Hand off to `re0-loop`. Do not invoke `re0-work` here: a from-scratch restart is `re0-loop`'s mid-cycle call, surfaced by `nba` when warranted, never a setup step.

## Rules

- **The folder is never empty at creation.** Both paths write real content as the folder is created, leaving resumable context at any session break.
- **Not portable, by design.** Unlike every other skill's self-contained default, this skill names paperthin siblings directly and assumes the full package installed. It exists only to pair with `re0-release` and `re0-memo`, not to travel alone.
- **No padding.** Lightweight gets no `DESIGN`/`WORKFLOW`/`EVIDENCE`. Its `RETRO.local.md` seed is a one-paragraph task note, never a disguised `WORKFLOW.local.md`. Never force in a judgment skill or `re0-work` as a precaution.
- **The folder's `<version>` is provisional.** Use `re0-release`'s discriminator, kind rather than size: against the artifact's own prior spec, a fix is patch; a new capability a user newly reaches for is minor. Keep the bump contingent on unresolved forks. Never commit to an unearned bump; a fork that could add a skill leaves it undecided until resolved.
- **Docs stay aligned, like `re0-release` at ship time.** Changes to shippable surface always require an **AGENTS.md/README reflection gate**. Follow AGENTS.md's register split: internal mechanism/rules/anatomy → **AGENTS.md** (agent + human, injected as instructions), user-facing catalog/experience → **README** (human-only, never injected). Never put agent-instruction mechanism in README or skip README for a user-facing change. This planning gate complements `re0-release`'s ship-time README step.
- **negatives-as-corpus**: never delete anything this skill or its cycle produces; `re0-release` retires a cycle that goes wrong rather than discarding it.
- Every `EVIDENCE.local.md` gate traces back to a line in `DESIGN.local.md`; don't invent proof surface `DESIGN` never asked for.

## Verification

Before finishing:

1. The folder has real content from creation on either path.
2. Full path: `DESIGN.local.md` states a thesis, scope, and gates; `WORKFLOW.local.md`'s steps are specific to this cycle; every `EVIDENCE.local.md` gate traces to `DESIGN.local.md`.
3. Lightweight path: `RETRO.local.md` is seeded with the task and reason, one paragraph.
4. Reference material stayed flat unless it earned a `refs/` subfolder.
5. Report which path was taken and why.
