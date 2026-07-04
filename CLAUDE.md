# PaperThin

PaperThin is an agent-agnostic suite of plain-Markdown skills that keep an artifact **clean and true** — hygiene reflexes an agent reaches for on its own. This is the guide for authoring them — and itself a skill artifact, so `re0` it when it drifts. Every skill it names below — `re0`, `factchk`, `hate`, … — is defined in the shipped catalog, the [README](./README.md).

## Philosophy

- **Trust the artifact, not the author.** A skill exists to make work read true to someone who wasn't there — *clear* (does it read?) and *correct* (is what it claims real?). The maker's in-session mind is the worst judge of either — so a skill either re-derives the work from what's true now, or imports outside eyes to test it.
- **Single source of truth.** One fact lives in one place; everything else references it by name. Skills compose by naming each other in prose — never by copying content or reaching into another skill's files. Shared material lives in its owning skill; others point to it.
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
├── depth/     one artifact · now
│              refine or verify the thing in hand
│              re0 · re0-git · shower · sip · factchk · mandela · hate
│
├── breadth/   many artifacts · now
│              reconcile one truth across files and platforms
│              ssotchk · ssotize
│
├── coil/      one project · across iterations
│              carry learning between build cycles
│              retro · scratch · flywheel · nba
│
└── mesh/      many minds · across rounds
               converge independent views into consensus
               (reserved · v0.8)
```

**File by trigger-scope, not by what a skill invokes.** A skill lives where the work it *triggers or emits* ranges, even when it orchestrates skills from other folders — `sip` gates one finished deliverable, so it's `depth/`, though its check runs a cross-file `ssotchk`.

Reach for `breadth/` to *establish* order (legacy refactor, knowledge-base build, fresh scaffolding); once a fact is cleanly SSOT'd, *maintain* it with `re0` rather than re-consolidating. Keep drafts and retired skills out of the README and `plugin.json`.

**Name it for the reflex it fires** — a plain real word (`shower`, `sip`) or a tight compression of a real term (`re0`, `ssotchk`, `ssotize`); a stranger should half-guess what it does from the name alone, so no opaque coinage. A self-evident metaphor-noun is allowed only as a deliberate exception, when its own intuition carries it.

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

Default to model-invoked. Make a skill user-invoked only when the model should never reach it on its own — its trigger is a deliberate, human-decided action (commit, push, publish, deploy), or its mere presence in reach would bias the agent toward one. A user-invoked skill can't be composed, so it also stays out of `sip`. Two qualify today: `re0-git` (it cleans a commit's message — committing is human-decided) and `hate` (a hate-it reflex always in the agent's reach would bias it toward demolition).

## Conventions

Shared rules a skill references rather than restates:

- **edit-safety** (any mutating skill — `re0`, `ssotize`, `scratch`): a find-replace that could match nothing must **assert its target exists** (report a MISS, never silently no-op); byte-level tools corrupt multibyte text, so mutate with a **unicode-safe** pass (`PYTHONUTF8=1`, stdout reconfigured to UTF-8); never **blanket-replace a single target whose right replacement is positional** (the same token mapping to different replacements per location) — decide per occurrence, never a blind sweep; and make large *structural* moves with a script, not by retyping.
- **negatives-as-corpus**: "cut" means **move-to-archive, never delete** — pruned and failed branches are assets, not waste.

## Shipping

Before committing:

1. **SKILL.md** follows the anatomy above.
2. **README** lists it — grouped Model-/User-invoked, each linked to its `SKILL.md`.
3. **plugin.json** registers its path.
4. **package.json** bumps version (new skill = minor; fix/docs = patch); `keywords` stay grouped logically.
5. Run **`sip`** — `shower` the artifact, `ssotchk` the repo, `re0` the docs.

Commit messages: Conventional Commits, one bullet per real change — no padding, no mechanical trivia, no co-author tags. `re0-git` cleans a drifted message back to its essence, in the author's own style.

## Vendoring

Not a fork of [mattpocock/skills](https://github.com/mattpocock/skills) — we adopt its architecture and philosophy and ship our own non-overlapping workflows, vendoring only the small shared substrate. Reused material stays **verbatim** and is credited in [NOTICE](./NOTICE) per source (project · license · copyright), never paraphrased to drop credit.
