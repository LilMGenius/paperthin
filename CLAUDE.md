# LilMGenius Skills

LilMGenius's composable, agent-invokable workflow skills; the live catalog is in [README](./README.md). This file is the **authoring guide** — the philosophy and conventions for adding or changing a skill — and is itself a skill artifact, so when it drifts, `re0` it.

## Philosophy

**Composable, single-responsibility skills that sharpen the work — including this repo itself.** Every skill here is general enough to use *while building the skills*: `re0` refreshes a skill or doc into a clean v0; `ssotchk`/`ssotize` keep one fact in one place; `shower` spins up a fresh zero-context sub-session to cold-read for clarity; `tasting` runs these checks on our own output automatically. Authoring is therefore **recursive and self-improving** — we maintain the skills with the skills, so each pass can be audited and refined by the same tools it ships. Treat that loop as the point, not a side effect.

**Single Source of Truth.** One fact lives in exactly one place; everything else references it. Skills invoke each other in prose (see [docs/invocation.md](./docs/invocation.md)), never by copying each other's content or reaching into another skill's files. When two skills would share material, it lives in its owning skill and the other points to it by name.

**Two vectors, composed.** `re0` works *depth-first* — one artifact into a clean v0. `ssotchk`/`ssotize` work *breadth-first* — one truth unified across many artifacts and platforms. Use SSOT to establish order (legacy refactor, knowledge-base build, new scaffolding); once a fact is cleanly SSOT'd, maintain it with `re0` rather than re-running consolidation.

## Repository layout

```
skills/<perspective>/<name>/SKILL.md
```

- Organize by **artifact perspective**, not topic. The test: does the skill work on the **one artifact in hand** — `single/` (refine or verify it: `re0`, `shower`, `tasting`) — or **reconcile one truth across many** — `cross/` (`ssotchk`, `ssotize`)? `tasting` is `single/`: it verifies the thing you just made. Topic domains (research, coding, …) go in *separate plugins*, so within one plugin the only durable cut is artifact perspective. Add a new bucket **only when the reason is clear and durable** — over-splitting is slop.
- One skill = one directory with a `SKILL.md`; any supporting files live beside it.
- Keep drafts and retired skills out of the README and `plugin.json` indexes, so those list only what actively ships.

## SKILL.md format

```
---
name: <kebab-name>            # matches the directory and the invocation
description: "<trigger-rich one-liner — see docs/invocation.md>"
---

<one line: what the skill does>

## Goal
## Workflow      — numbered steps
## Rules         — constraints / what not to do
## Verification  — checks before finishing; report what changed
```

## Invocation

A skill is **model-invoked** (default) or **user-invoked**, and its `description` is the trigger surface. [docs/invocation.md](./docs/invocation.md) is the source of truth for the taxonomy, description style, the autonomy test, and composition rules — don't restate those here.

Today every skill is **model-invoked**, and that's deliberate, not drift: each passes the autonomy test, and `tasting` orchestrates the others — a user-invoked skill has no description so no skill can reach it, so anything `tasting` composes must stay model-invoked. Make a skill user-invoked only if the model should *never* auto-reach it and nothing else invokes it.

## Shipping a change

Before committing:

1. **SKILL.md** — new/changed skill follows the format above.
2. **README.md** — list active skills under their perspective bucket.
3. **.claude-plugin/plugin.json** — register each active skill's path.
4. **package.json** — bump version (new skill = minor; fix/docs/refactor = patch); keep `keywords` grouped logically (identity → agents → capabilities), never appended at random.
5. **tasting** — run the `tasting` skill (it `shower`s the artifact, `ssotchk`s the repo, `re0`s the docs) before finalizing.

Commit messages: Conventional Commits (`feat:`/`fix:`/`docs:`), one bullet per change, no co-author tags.

## Vendoring & lineage

This repo is **not a fork or re-implementation** of [mattpocock/skills](https://github.com/mattpocock/skills). We adopt its **architecture and philosophy** (skill layout, the invocation model, authoring conventions) and ship our own **additional, non-overlapping workflows** — LilMGenius's working know-how (`re0`, `shower`, `tasting`, …). A fork would drag in skills we don't ship, couple us to an upstream lifecycle, and blur whose work is whose; vendoring only the small shared substrate keeps this repo exactly *our skills plus clearly-credited shared building blocks*.

So when reusing third-party material, keep it **verbatim** and attribute it in [NOTICE](./NOTICE) **per source** (project + license + copyright), not per file — never paraphrase to drop credit. Add a source block to NOTICE the first time you vendor from a source; later files from it need no new entry.
