# Paperthin

Paperthin is an agent-agnostic suite of plain-Markdown skills that keep an artifact **clean and true** — hygiene reflexes an agent reaches for on its own. This is the guide for authoring them — and itself a skill artifact, so `re0` it when it drifts. Every skill named below is defined in the shipped catalog, the [README](./README.md).

## Philosophy

- **Trust the artifact, not the author.** A skill exists to make work read true to someone who wasn't there — *clear* (does it read?) and *correct* (is what it claims real?). The maker's in-session mind is the worst judge of either — so a skill either re-derives the work from what's true now, or imports outside eyes to test it.
- **Single source of truth, and self-contained skills.** One fact lives in one place; everything else references it by name. But a skill ships and runs installed alone (`npx skills add` can pull one without its siblings or this guide), so it states the runtime rules it needs inline rather than pointing at CLAUDE.md or another skill. The two live at different layers: SSOT keeps a *fact* from drifting; self-containment lets a *skill* travel. Cross-skill naming is the exception, for declared pairs and orchestrators (see [Conventions](#conventions)).
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
└── mesh/      converge independent views into consensus (reserved)
```

The axes' quadrants and each skill's home are the README's facts — its [map](./README.md#the-map) and [index](./README.md#the-index); this file defines only the cut.

**File by trigger-scope, not by what a skill invokes.** A skill lives where the work it *triggers or emits* ranges, even when it orchestrates skills from other folders — `sip` gates one finished deliverable, so it's `depth/`, though its check runs a cross-file `ssotchk`.

Reach for `breadth/` to *establish* order (legacy refactor, knowledge-base build, fresh scaffolding); once a fact is cleanly SSOT'd, *maintain* it with `re0` rather than re-consolidating. Keep drafts and retired skills out of the README and `plugin.json`.

**Name it for the reflex it fires** — a plain real word (`shower`, `sip`) or a tight compression of a real term (`re0`, `ssotchk`, `ssotize`); a stranger should half-guess what it does from the name alone, so no opaque coinage. A self-evident metaphor-noun is allowed only as a deliberate exception, when its own intuition carries it — `autobahn` is the standing example. The `ppt` prefix is reserved as Paperthin's own short name, as in `ppt-upgrade`. Never model-brand a name; the mechanism must outlive any one model.

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

Every `SKILL.md` is either user-invoked (`disable-model-invocation: true`, reachable only by the human) or model-invoked (model- or user-reachable). For the full definitions, description conventions, and why a user-invoked skill can invoke model-invoked skills but never another user-invoked one, see [docs/invocation.md](./docs/invocation.md).

Default to model-invoked. Make a skill user-invoked only when the model should never reach it on its own — its trigger is a deliberate, human-decided action (commit, push, publish, deploy), or its mere presence in reach would bias the agent toward one. Four qualify today: `re0-git`, because it cleans a commit's message and committing is human-decided; `hate`, because a hate-it reflex always in the agent's reach would bias it toward demolition; `dedash`, because the user owns the exact prose scope; and `ppt-upgrade`, because install reconciliation can remove and reinstall local skill entries. `autobahn` remains model-invoked because the model should autonomously carve risk-adjacent scope before execution.

## Conventions

Every skill must work installed on its own, so it names no other skill and states the rules it needs inline. Two couplings are allowed, because there the relationship *is* the skill:

- **pair** — `ssotchk` → `ssotize`: the second acts on the first's output (audit, then consolidate).
- **orchestrator** — `sip` runs the suite's clean-and-true checks; `flywheel` and `nba` run and navigate the coil cycle. An orchestrator degrades gracefully: it uses the skills present and skips the rest.

Because independence means the same rule recurs inline across skills, this section maps those copies so they stay coherent when you touch one. CLAUDE.md ships with the repo, not the plugin, so it is the contributor's map, never a runtime dependency:

- **edit-safety** — safe mutation (assert the target exists and report a MISS, edit unicode-safe, replace positional targets per occurrence not by blanket sweep, script large structural moves): in `re0`, `dedash`, `ssotize`.
- **negatives-as-corpus** — "cut" means move-to-archive, never delete; pruned and failed branches are assets: in `retro`, `re0-work`, `flywheel`, `autobahn`.
- **commit-economy** — the commit-message standard, stated in full by its home `re0-git`.

## Local provenance

`.ppt/` holds this repo's own provenance, gitignored and never shipped: per-release iteration casebooks (`.ppt/iteration/`) and the release rail (`.ppt/release/`). History and scratch, not spec; nothing in it is canonical.

## Shipping

Before committing:

1. **SKILL.md** follows the [anatomy above](#skillmd-format).
2. **[README](./README.md)** lists it — grouped by perspective, invocation marked in the `Invoker` column, each linked to its `SKILL.md`.
3. **Localized READMEs** keep root `README.md` as the English source; translations live under [`docs/readme/`](./docs/readme/), never the repo root. Every README keeps the same `<sub>Read in: ...</sub>` switcher after its section nav, with the current language as plain text, and every copied repo link rebased and verified from that file's directory.
4. **[plugin.json](./.claude-plugin/plugin.json)** registers its path.
5. **[package.json](./package.json)** bumps version (new skill = minor; fix/docs = patch); `keywords` stay grouped logically.
6. **Rename maintenance:** every future skill rename appends its old → new entry to `ppt-upgrade`'s deprecations checklist in release order.
7. **Keep the convention-copies coherent, and wire any pair or orchestrator.** Skills are independent and name no other skill, so there is barely a cross-skill graph to maintain. What recurs is inline: a skill that mutates, cuts, or writes a commit carries `edit-safety` / `negatives-as-corpus` / `commit-economy` inline, so every copy of a rule must stay coherent with the others the [Conventions](#conventions) map lists. The only couplings are the pair (`ssotchk` → `ssotize`) and the orchestrators (`sip`, `flywheel`, `nba`); when a new skill joins one — an orchestrator should now run it, or it forms a new pair — wire that edge, and only that.
8. Run **`sip`** — it tastes the change with the repo's own clean-and-true checks before you ship.

Write commit messages to `re0-git`'s **commit-economy** from the first draft, not only on its cleanup pass.

## Releasing

Signed tags and `re0-git`'d messages are the human's trust boundary; CI only runs the mechanical, repeatable distribution once a tag is pushed — it never signs a commit or a tag, and never creates one.

1. `re0-git` the commit message; bump `package.json` if the change warrants it (see [Shipping](#shipping)).
2. Write the release notes as `.ppt/release/RELEASE_NOTES.local.md` (see [Local provenance](#local-provenance)) in this house style:
   - One `##` heading naming the release's durable idea, not the version.
   - One short paragraph of what is true now, not a changelog of what changed.
   - Only the sections a release earns — never force every release into the same shape: `### New` (a shipped capability, one line or short paragraph each), `### Also` (secondary changes), `### The catalog (N skills)` (only when a reader must re-map the roster: a new perspective lands, or a skill is renamed or removed), `### Install` (always, last, as an indented block, never a fenced one).
   - Skill names and paths in backticks. No tagline, validation receipts, file lists, tag names, or facts the tag/version already proves.
3. Tag with those notes as the message: `git tag -s vX.Y.Z -F .ppt/release/RELEASE_NOTES.local.md --cleanup=verbatim`.
4. Push `main` and the tag — the only manual remote step, and what triggers `.github/workflows/release.yml`: validate the catalog, verify `package.json` matches the tag, `npm publish --provenance`, and create the GitHub Release from the signed tag's own message.

No build step: the package ships the repo as-is via `.gitignore`. Never add an `.npmignore` — it disables the gitignore fallback and would publish the `*.local` docs.

## Vendoring

Not a fork of [mattpocock/skills](https://github.com/mattpocock/skills) — we adopt its architecture and philosophy and ship our own non-overlapping workflows, vendoring only the small shared substrate. Reused material stays **verbatim** and is credited in [NOTICE](./NOTICE) per source (project · license · copyright), never paraphrased to drop credit.
