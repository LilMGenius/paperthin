# Paperthin

Paperthin is an agent-agnostic suite of plain-Markdown skills that keep an artifact **clean and true** — hygiene reflexes an agent reaches for on its own. This is the guide for authoring them — and itself a skill artifact, so `re0` it when it drifts. Every skill named below is defined in the shipped catalog, the [README](./README.md).

## Philosophy

- **Trust the artifact, not the author.** A skill exists to make work read true to someone who wasn't there — *clear* (does it read?) and *correct* (is what it claims real?). The maker's in-session mind is the worst judge of either, so a skill either re-derives the work from what's true now or imports outside eyes to test it.
- **Generic examples, not instances.** In any durable doc — this guide, a `SKILL.md`, a release note — an example stays generic (`(#123, @handle)`, `land/pr-<n>`); a real PR number, handle, SHA, or range ages into residue a later reader misreads for current fact.
- **Single source of truth, and self-contained skills.** One fact lives in one place; everything else references it by name. But a skill ships and runs installed alone (`npx skills add` can pull one without its siblings or this guide), so it states the runtime rules it needs inline rather than pointing at CLAUDE.md or another skill. The two live at different layers: SSOT keeps a *fact* from drifting; self-containment lets a *skill* travel. The one-home rule bends in exactly two places: cross-skill naming, for declared pairs and orchestrators (see [Conventions](#conventions)); and the skill roster, which — with no build step to generate it — is hand-written onto several surfaces that can't reference each other ([re0-upgrade](./skills/breadth/re0-upgrade/SKILL.md)'s catalog, [`scripts/catalog.cjs`](./scripts/catalog.cjs), [plugin.json](./.claude-plugin/plugin.json), the READMEs). CI guards those copies in sync — `validate-skills.sh` and [`check-catalog-sync.cjs`](./scripts/check-catalog-sync.cjs) — rather than one home feeding them; never dedupe them.
- **Restraint.** Change only what genuinely improves — a pass that finds nothing to improve changes nothing. The enemy is slop (noise, duplication, padding), not addition.
- **Recursive.** Every skill is general enough to use *while building the skills*, so we maintain the skills with the skills, and each pass is audited and refined by the tools it ships. Treat that loop as the point.

## Layout

```
skills/<perspective>/<name>/SKILL.md
```

Topic domains belong in separate plugins, so within a plugin the only durable cut is **perspective**. One skill = one directory with a `SKILL.md`.

That cut is two orthogonal axes, **cardinality × time**:

```text
skills/
├── breadth/   reconcile one truth across files and platforms
├── coil/      carry learning between build cycles
├── depth/     refine or verify the thing in hand
└── mesh/      converge independent views into consensus
```

The axes' quadrants and each skill's home are the README's facts — its [map](./README.md#the-map) and [index](./README.md#the-index); this file defines only the cut. Within a perspective the listing runs in a logical order (a `depth/` skill's work-lifecycle, say). One deliberate pin: `re0` leads `depth/` as the founding skill that opened the suite, so `reorder` keeps it first rather than sorting it into the cleanup group.

**File by trigger-scope, not by what a skill invokes.** A skill lives where the work it *triggers or emits* ranges, even when it orchestrates skills from other folders — `sip` gates one finished deliverable, so it's `depth/`, though its check may run cross-file `ssotize`.

Reach for `breadth/` to *establish* order (legacy refactor, knowledge-base build, fresh scaffolding); once a fact is cleanly SSOT'd, *maintain* it with `re0` rather than re-consolidating. Keep drafts and retired skills out of the README and `plugin.json`.

**Name it for the reflex it fires** — a plain real word (`shower`, `sip`) or a tight compression of a real term (`re0`, `ssotize`); a stranger should half-guess what it does from the name alone, so no opaque coinage. A self-evident metaphor-noun is allowed only as a deliberate exception, when its own intuition carries it — `autobahn` is the standing example. The `re0-` prefix is for clean-version lifecycle commands: upgrade an install, release a package, memorize a cycle, restart a build, run the loop, or clean a commit message. Never model-brand a name; the mechanism must outlive any one model.

## SKILL.md format

```
---
name: <kebab-name>            # matches the directory and the invocation
description: "<trigger-rich one-liner>"
# disable-model-invocation: true   ← user-invoked skills only
---

<one line: what the skill does>

## Goal
## Workflow      — numbered steps
## Rules         — constraints
## Verification  — checks before finishing; report what changed
```

## Invocation

Every `SKILL.md` is either user-invoked (`disable-model-invocation: true`, reachable only by the human) or model-invoked (model- or user-reachable). Default to model-invoked; make a skill user-invoked only when the model should never reach it on its own — its trigger is a deliberate human action (commit, push, publish, deploy), or its mere presence in reach would bias the agent. Which skills are user-invoked today and why, the description conventions, and why a user-invoked skill can invoke model-invoked skills but never another user-invoked one, live in [docs/invocation.md](./docs/invocation.md).

## Conventions

Skills are self-contained ([Philosophy](#philosophy)); the couplings below are the deliberate exceptions, where a cross-skill relationship *is* the skill:

- **orchestrator** — `sip` runs the suite's clean-and-true checks; `re0-loop` and `nba` run and navigate the coil cycle; `re0-release` runs the shipping and releasing checklist, runs `sip` when installed, and applies commit-economy directly. It does not auto-fire user-invoked `re0-git`; if an existing commit needs cleanup, it asks the human to run `re0-git`. `re0-plan` opens the iteration folder `re0-release` later retires — the one pairing between two user-invoked skills, and the one skill exempted from self-containment because it assumes the full package installed. `re0-merge` walks reviewing and landing a contribution, calling `shower`, `re0-git`, and `re0-release` when present. An orchestrator degrades gracefully: it uses the model-invoked skills present and skips the rest.
- **paired skills** — a few skills read as deliberate mirrors or complements, a catalog fact for the reader rather than a runtime dependency (neither names the other, and each ships alone): `aim`↔`nba` run the same shape from opposite ends (intent from a handover vs next action from live state); `macrothink`↔`prism` both draw on many viewpoints but oppositely (`macrothink` repeats one read for robustness, `prism` splits into distinct lenses for coverage); `catchup`↔`nba` are the coil re-entry pair (orient vs act).

Those inline rule-copies are mapped here so they stay coherent when you touch one — CLAUDE.md is the contributor's map, not a runtime dependency:

- **edit-safety** — safe mutation (assert the target exists and report a MISS, edit unicode-safe, replace positional targets per occurrence not by blanket sweep, script large structural moves): in `re0`, `dedash`, `ssotize`, `detool`, `reorder`, `debloat`.
- **negatives-as-corpus** — "cut" means move-to-archive, never delete; pruned and failed branches are assets: in `re0-memo`, `re0-work`, `re0-loop`, `autobahn`, `re0-plan`, `re0-merge`.
- **commit-economy** — the commit-message standard, stated in full by its home `re0-git` and carried inline in `re0-release`.

## Local provenance

`.re0/` holds this repo's own provenance, gitignored and never shipped: per-release iteration casebooks (`.re0/iteration/`) and the release rail (`.re0/release/`). History and scratch, not spec; nothing in it is canonical.

`re0-plan` opens each casebook as `.re0/iteration/<version>-<workname>/` and seeds it the instant it's created: a cycle with real design surface gets `DESIGN.local.md`, then `WORKFLOW.local.md` + `EVIDENCE.local.md`; a lightweight fix gets a one-paragraph `RETRO.local.md` seed immediately, which `re0-memo` extends in place at the end rather than starting fresh. Reference material stays flat as `REF-<topic>.local.md` until it earns its own `refs/` subfolder. `re0-release` retires a shipped cycle's folder into `.re0/iteration/completed/`, unrenamed and never deleted.

## Shipping

Two canonical docs, two registers: **[CLAUDE.md](./CLAUDE.md) is LLM + human dual** (injected as the agent's standing instructions and read as the contributor's guide — mechanism, rules, anatomy, conventions); **[README](./README.md) is human-only** (the front door a person reads to understand and use the suite — what it is, the map, the catalog, install). Reflect a change in the doc whose register it touches — mechanism here, user-facing in README, often both — and never put agent-mechanism in README or skip README for a user-facing change.

Before committing, confirm:

1. **SKILL.md** follows the [anatomy](#skillmd-format).
2. **[README](./README.md)** and its localized copies under [`docs/readme/`](./docs/readme/) list it — perspective group, invocation column, linked, in the perspective's logical order ([Layout](#layout)); the root README is the English source, and every translation keeps the `<sub>Read in: …</sub>` switcher with links rebased from its own directory. That order holds identically across `plugin.json`, [`scripts/catalog.cjs`](./scripts/catalog.cjs), and `re0-upgrade`'s catalog — a new skill or rename lands in place across all four surfaces with `reorder` (`check-catalog-sync` guards the set, not the order). Localized READMEs are downstream mirrors of the English source, and [`check-readme-sync`](./scripts/check-readme-sync.cjs) warns in CI when a translation's bold-link roster drifts from English on set or order — warn-only by default so a translation lag never blocks a merge; pass `--strict` to promote it to a failure.
3. **[plugin.json](./.claude-plugin/plugin.json)** registers its path.
4. **[package.json](./package.json)** bumps by **kind, not size**: against the artifact's own prior spec, was the old behavior *wrong* (a fix → patch, even with much new plumbing) or *correct but narrower* (a new capability a user reaches for → minor)? A skill removed with no replacement is major. State that answer before naming the bump; keep `keywords` grouped.
5. A **rename** appends its old → new row to [`re0-upgrade`](./skills/breadth/re0-upgrade/SKILL.md)'s deprecations, in release order.
6. Any inline rule-copy or orchestrator edge stays coherent with the [Conventions](#conventions) map — touch one copy, check the others.
7. Run **`sip`**.

Write commit messages to `re0-git`'s **commit-economy** from the first draft, not only on cleanup.

## Releasing

Signed tags and `re0-git`'d messages are the human's trust boundary; CI runs the mechanical distribution only once a tag is pushed — it never signs or creates a commit or tag.

An external contribution lands on a `land/pr-<n>` branch (a range only for a real multi-PR batch), never a merge from the fork: approve the PR when you accept it (a verdict on the code, before the land), cherry-pick each contributor commit with its authorship kept (you become the committer; `re0-git` cleans the message), add any maintainer change as a separate commit so the credit split stays legible, then fast-forward into `main`.

1. `re0-git` the message; bump `package.json` if warranted ([Shipping](#shipping)).
2. Write `.re0/release/RELEASE_NOTES.local.md` as the tag message, house style:
   - one `##` heading naming the release's durable idea, not the version;
   - one short present-tense paragraph of what is true now, not a changelog;
   - only the sections it earns — `### New`, `### Also`, `### The catalog (N skills)` (only when the roster must be re-mapped), `### Install` (always last, indented not fenced);
   - credit each external change inline (`(#123, @handle)`); skill names in backticks;
   - nothing the tag or version already proves, and no narration of anything meant to stay silent.
3. Tag: `git tag -s vX.Y.Z -F .re0/release/RELEASE_NOTES.local.md --cleanup=verbatim`.
4. Push `main` and the tag — the only manual remote step; it triggers [`release.yml`](./.github/workflows/release.yml): validate, verify `package.json` matches the tag, `npm publish --provenance`, create the GitHub Release from the tag message.
5. On success, close each landed contribution with a credit comment pointing at the release — the acceptance approval already recorded it as accepted. Any maintainer with review access does this.
6. Retire the shipped cycle's folder into `.re0/iteration/completed/` — `re0-release` does this; by hand only if running the checklist manually.

No build step: the package ships the repo as-is via `.gitignore` from the clean CI checkout. Never `npm publish` from a dirty worktree, and never add an `.npmignore` — it would publish the `*.local` docs.

## Vendoring

Not a fork of [mattpocock/skills](https://github.com/mattpocock/skills) — we adopt its architecture and philosophy and ship our own non-overlapping workflows, vendoring only the small shared substrate. Reused material stays **verbatim** and is credited in [NOTICE](./NOTICE) per source (project · license · copyright), never paraphrased to drop credit.
