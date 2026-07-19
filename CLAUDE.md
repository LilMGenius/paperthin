# Paperthin

Paperthin is an agent-agnostic suite of plain-Markdown skills that keep an artifact **clean and true** — hygiene reflexes an agent reaches for on its own. This is the guide for authoring them — and itself a skill artifact, so `re0` it when it drifts. Every skill named below is defined in the shipped catalog, the [README](./README.md).

## Philosophy

- **Trust the artifact, not the author.** A skill exists to make work read true to someone who wasn't there — *clear* (does it read?) and *correct* (is what it claims real?). The maker's in-session mind is the worst judge of either — so a skill either re-derives the work from what's true now, or imports outside eyes to test it. For the same reader, an example in any durable doc (this guide, a `SKILL.md`, a release note) stays generic, like `(#123, @handle)` or `land/pr-<n>`; a real PR number, handle, SHA, or range from the work at hand ages into residue a later reader misreads for current fact.
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

The axes' quadrants and each skill's home are the README's facts — its [map](./README.md#the-map) and [index](./README.md#the-index); this file defines only the cut. Within a perspective the listing runs in a logical order (a `depth/` skill's work-lifecycle, say), with one deliberate pin: `re0` leads `depth/` as the founding skill of v0.1.0 that opened the suite, so `reorder` holds it first rather than sorting it into the cleanup group its function belongs to.

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

Every `SKILL.md` is either user-invoked (`disable-model-invocation: true`, reachable only by the human) or model-invoked (model- or user-reachable). For the full definitions, description conventions, and why a user-invoked skill can invoke model-invoked skills but never another user-invoked one, see [docs/invocation.md](./docs/invocation.md).

Default to model-invoked. Make a skill user-invoked only when the model should never reach it on its own — its trigger is a deliberate, human-decided action (commit, push, publish, deploy), or its mere presence in reach would bias the agent toward one. Eleven qualify today: `re0-git`, because it cleans a commit's message and committing is human-decided; `hate`, because a hate-it reflex always in the agent's reach would bias it toward demolition; `dedash`, because the user owns the exact prose scope; `macrothink`, because plural fresh reads are an opt-in perspective spend and convergence must not masquerade as automatic proof; `re0-upgrade`, because it makes consequential local changes — reinstalling skill entries and writing a session-start hook into each agent's config; `re0-release`, because publishing a release is a deliberate, human-decided action; `re0-plan`, because it assumes the full paperthin package installed and pairs deliberately with `re0-release` rather than being a general-purpose reflex any project would reach for; `feynman`, because a challenge-every-decision reflex always in reach would bias the user toward chronic self-doubt; `prism`, because plural lenses are an opt-in spend whose convergence must not pass as automatic proof; `reorder`, because reordering churns a listing and its logical order is an opinionated, deliberate call; and `re0-merge`, because reviewing and landing a contribution is a deliberate maintainer act that a review reflex in reach would bias toward merging. `autobahn` remains model-invoked because the model should autonomously carve risk-adjacent scope before execution; `modelchk` remains model-invoked because advisory capability sizing should be available before the model spends a run.

## Conventions

Every skill must work installed on its own, so it names no other skill and states the rules it needs inline. Orchestrator couplings are allowed, because there the relationship *is* the skill:

- **orchestrator** — `sip` runs the suite's clean-and-true checks; `re0-loop` and `nba` run and navigate the coil cycle; `re0-release` runs the shipping and releasing checklist, runs `sip` when installed, and applies commit-economy directly. It does not auto-fire user-invoked `re0-git`; if an existing commit needs cleanup, it asks the human to run `re0-git`. `re0-plan` opens the iteration folder `re0-release` later retires — the one pairing between two user-invoked skills, and the one skill exempted from self-containment because it assumes the full package installed. `re0-merge` walks reviewing and landing a contribution, calling `shower`, `re0-git`, and `re0-release` when present. An orchestrator degrades gracefully: it uses the model-invoked skills present and skips the rest.
- **paired skills** — a few skills read as deliberate mirrors or complements, a catalog fact for the reader rather than a runtime dependency (neither names the other, and each ships alone): `aim`↔`nba` run the same shape from opposite ends (intent from a handover vs next action from live state); `macrothink`↔`prism` both draw on many viewpoints but oppositely (`macrothink` repeats one read for robustness, `prism` splits into distinct lenses for coverage); `catchup`↔`nba` are the coil re-entry pair (orient vs act).

Because independence means the same rule recurs inline across skills, this section maps those copies so they stay coherent when you touch one. CLAUDE.md ships with the repo, not the plugin, so it is the contributor's map, never a runtime dependency:

- **edit-safety** — safe mutation (assert the target exists and report a MISS, edit unicode-safe, replace positional targets per occurrence not by blanket sweep, script large structural moves): in `re0`, `dedash`, `ssotize`, `detool`, `reorder`.
- **negatives-as-corpus** — "cut" means move-to-archive, never delete; pruned and failed branches are assets: in `re0-memo`, `re0-work`, `re0-loop`, `autobahn`, `re0-plan`, `re0-merge`.
- **commit-economy** — the commit-message standard, stated in full by its home `re0-git` and carried inline in `re0-release`.

## Local provenance

`.re0/` holds this repo's own provenance, gitignored and never shipped: per-release iteration casebooks (`.re0/iteration/`) and the release rail (`.re0/release/`). History and scratch, not spec; nothing in it is canonical.

`re0-plan` opens each casebook as `.re0/iteration/<version>-<workname>/` and seeds it the instant it's created: a cycle with real design surface gets `DESIGN.local.md`, then `WORKFLOW.local.md` + `EVIDENCE.local.md`; a lightweight fix gets a one-paragraph `RETRO.local.md` seed immediately, which `re0-memo` extends in place at the end rather than starting fresh. Reference material stays flat as `REF-<topic>.local.md` until it earns its own `refs/` subfolder. `re0-release` retires a shipped cycle's folder into `.re0/iteration/completed/`, unrenamed and never deleted.

## Shipping

Before committing:

1. **SKILL.md** follows the [anatomy above](#skillmd-format).
2. **[README](./README.md)** lists it — grouped by perspective, invocation marked in the fourth catalog column, each linked to its `SKILL.md`.
3. **Localized READMEs** keep root `README.md` as the English source; translations live under [`docs/readme/`](./docs/readme/), never the repo root. Every README keeps the same `<sub>Read in: ...</sub>` switcher after its section nav, with the current language as plain text, and every copied repo link rebased and verified from that file's directory.
4. **[plugin.json](./.claude-plugin/plugin.json)** registers its path.
5. **[package.json](./package.json)** bumps version (a new skill or a new capability on an existing one = minor; fix/docs = patch; a skill removed with no replacement path = major); `keywords` stay grouped logically. Decide the minor/patch boundary by **kind, not size** — the case that recurs is an enhancement to an existing skill, which can be either. Ask: relative to the artifact's own prior spec, was the old behavior *wrong* (a fix → patch; new plumbing that only serves a fix stays patch, however much code it adds) or *correct but narrower / missing a dimension* (a new capability a user newly reaches for → minor)? State that answer before naming the bump; never classify by whether the diff merely adds code.
6. **Rename maintenance:** every future skill rename appends its old → new entry to `re0-upgrade`'s deprecations checklist in release order.
7. **Keep the convention-copies coherent, and wire any orchestrator.** Skills are independent and name no other skill, so there is barely a cross-skill graph to maintain. What recurs is inline: a skill that mutates, cuts, or writes a commit carries `edit-safety` / `negatives-as-corpus` / `commit-economy` inline, so every copy of a rule must stay coherent with the others the [Conventions](#conventions) map lists. The only couplings are the orchestrators (`sip`, `re0-loop`, `nba`, `re0-release`, `re0-plan`); when a new skill joins one, wire that edge, and only that.
8. Run **`sip`** — it tastes the change with the repo's own clean-and-true checks before you ship.

Write commit messages to `re0-git`'s **commit-economy** from the first draft, not only on its cleanup pass.

## Releasing

Signed tags and `re0-git`'d messages are the human's trust boundary; CI only runs the mechanical, repeatable distribution once a tag is pushed — it never signs a commit or a tag, and never creates one.

An external contribution lands on a `land/pr-<n>` branch (a range only for a genuine multi-PR batch), not a merge straight from its fork: approve the PR as you accept it (a verdict on the contributor's code, given before the land, never after), accept each contributor commit there with its authorship preserved (you become the committer; `re0-git` cleans the message), add any maintainer enhancement as its own separate commit so the credit split stays legible, then fast-forward that branch into `main`. Step 5 later closes that PR with a credit comment; the approval already recorded it as accepted.

1. `re0-git` the commit message; bump `package.json` if the change warrants it (see [Shipping](#shipping)).
2. Write the release notes as `.re0/release/RELEASE_NOTES.local.md` (see [Local provenance](#local-provenance)) in this house style:
   - One `##` heading naming the release's durable idea, not the version.
   - One short paragraph of what is true now, not a changelog of what changed.
   - Only the sections a release earns — never force every release into the same shape: `### New` (a shipped capability, one line or short paragraph each), `### Also` (secondary changes), `### The catalog (N skills)` (only when a reader must re-map the roster: a new perspective lands, or a skill is renamed or removed), `### Install` (always, last, as an indented block, never a fenced one).
   - Credit each externally-contributed change inline with its PR number and author handle (`(#123, @handle)`); contributions get named, not silently absorbed.
   - Skill names and paths in backticks. No tagline, validation receipts, file lists, tag names, facts the tag or version already proves, or narration of anything meant to be silent — a note that something "runs silently" breaks the silence, so it stays in the code alone.
3. Tag with those notes as the message: `git tag -s vX.Y.Z -F .re0/release/RELEASE_NOTES.local.md --cleanup=verbatim`.
4. Push `main` and the tag — the only manual remote step, and what triggers `.github/workflows/release.yml`: validate the catalog, verify `package.json` matches the tag, `npm publish --provenance`, and create the GitHub Release from the signed tag's own message.
5. Once that workflow confirms success, close out each external contribution the release landed with a credit comment. It was already approved at acceptance (a squash-or-rebuild landing closes the PR rather than merging it, so that earlier approval is what keeps a closed PR reading as accepted); the closing comment carries the credit the release notes gave it and points at the release. Any collaborator or maintainer with review access does this, not one fixed reviewer.
6. Then retire the shipped cycle's iteration folder into `.re0/iteration/completed/` (see [Local provenance](#local-provenance)) — `re0-release` does this automatically; do it by hand only if running the checklist manually.

No build step: the package ships the repo as-is via `.gitignore` from the clean CI checkout. Never run local `npm publish` from a dirty worktree, and never add an `.npmignore` — it disables the gitignore fallback and would publish the `*.local` docs.

## Vendoring

Not a fork of [mattpocock/skills](https://github.com/mattpocock/skills) — we adopt its architecture and philosophy and ship our own non-overlapping workflows, vendoring only the small shared substrate. Reused material stays **verbatim** and is credited in [NOTICE](./NOTICE) per source (project · license · copyright), never paraphrased to drop credit.
