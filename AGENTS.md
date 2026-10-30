# Paperthin

Paperthin is an agent-agnostic suite of plain-Markdown skills that keep an artifact **clean and true**: hygiene reflexes an agent reaches for on its own. This is the guide for authoring them, and itself a skill artifact, so `re0` it when it drifts. Every skill named below is defined in the shipped catalog, the [README](./README.md).

A rule marked *(checked)* is decided by [`npm run check`](./scripts/gates/check.cjs), whose every check `npm test` proves can fail; CI runs both. The rest is judgment.

## Philosophy

- **Trust the artifact, not the author.** A skill exists to make work read true to someone who wasn't there: *clear* (does it read?) and *correct* (is what it claims real?). The maker's in-session mind is the worst judge of either, so a skill either re-derives the work from what's true now or imports outside eyes to test it.
- **Generic examples, not instances.** In any durable doc (this guide, `.agents/`, a `SKILL.md`, a release note) an example stays generic (`(#123, @handle)`, `land/pr-<n>`); a real PR number, handle, SHA, or range ages into residue a later reader misreads for current fact. *(checked in tracked docs)*
- **One source of truth, and skills that complement one another.** One fact lives in one place, and everything else references it by name. A mechanism lives in one place too: a skill reuses what a sibling skill already does instead of rebuilding it, and rebuilds only when that mechanism does not fit its work. Skills overlap, meet at their edges and sometimes contain one another, and that stays; the aim is a solid suite in which each skill covers what the others leave. A skill still ships and runs installed alone (`npx skills@latest add` can pull one without its siblings or this guide), so it never points at AGENTS.md for a rule it needs while running, and [Conventions](#conventions) sets how it uses a sibling that may be missing. The one-home rule bends in exactly two places: a rule several skills need at runtime that no model-invoked sibling owns, which each of them carries inline and Conventions maps; and the skill roster, which has no build step to generate it and is hand-written onto surfaces that can't reference each other (the skill folders, [plugin.json](./.claude-plugin/plugin.json), [`scripts/runtime/catalog.cjs`](./scripts/runtime/catalog.cjs), [re0-upgrade](./skills/breadth/re0-upgrade/SKILL.md)'s catalog, every README Index); never dedupe them. *(checked: one set in one order)*
- **Restraint.** Change only what genuinely improves; a pass that finds nothing to improve changes nothing. The enemy is slop (noise, duplication, padding), not addition.
- **Edit as v0.** A change to a skill or doc rewrites the passage it touches as if it had always said so: a new idea takes its own step or sentence, and a neighboring sentence keeps its wording rather than carrying an appended clause. `re0` the edited passage before `sip`.
- **Recursive.** Every skill is general enough to use *while building the skills*, so we maintain the skills with the skills, and each pass is audited and refined by the tools it ships. Treat that loop as the point.

## Layout

```
skills/<perspective>/<name>/SKILL.md
```

Topic domains belong in separate plugins, so within a plugin the only durable cut is **perspective**. One skill = one directory with a `SKILL.md` and an `agents/openai.yaml`. *(checked)*

That cut is two orthogonal axes, **cardinality × time**:

```text
skills/
├── breadth/   reconcile one truth across files and platforms
├── coil/      carry learning between build cycles
├── depth/     refine or verify the thing in hand
└── mesh/      aggregate independent views by their evidence, never by count
```

The axes' quadrants and each skill's home are the README's facts, in its [map](./README.md#the-map) and [index](./README.md#the-index); this file defines only the cut. Within a perspective the listing runs in a logical order (a `depth/` skill's work-lifecycle, say). One deliberate pin: `re0` leads `depth/` as the founding skill that opened the suite, so `re0-order` keeps it first rather than sorting it into the cleanup group.

**File by trigger-scope, not by what a skill invokes.** A skill lives where the work it *triggers or emits* ranges, even when it orchestrates skills from other folders: `sip` gates one finished deliverable, so it's `depth/`, though its check may run cross-file `ssotize`.

Reach for `breadth/` to *establish* order (legacy refactor, knowledge-base build, fresh scaffolding); once a fact is cleanly SSOT'd, *maintain* it with `re0` rather than re-consolidating. Keep drafts and retired skills out of the README and `plugin.json`.

Around `skills/`, each top-level folder has one job: `.agents/` holds the contracts a contributor or an agent reads before touching the repo ([invocation](./.agents/invocation.md), [install block](./.agents/install-block.md)), `assets/` holds what the READMEs embed, with the translations under `assets/i18n/`, and `scripts/` splits into `gates/` (what must hold before a release) and `runtime/` (what installs onto a host).

**Name it for the reflex it fires**: a plain real word (`shower`, `sip`) or a tight compression of a real term (`re0`, `ssotize`); a stranger should half-guess what it does from the name alone, so no opaque coinage. A self-evident metaphor-noun is allowed only as a deliberate exception, when its own intuition carries it; `autobahn` is the standing example. The `re0-` prefix marks clean-version lifecycle commands, the operator moves that carry an artifact from one clean state to the next (upgrade, release, restart, loop, realign a listing); a bare `re` + verb coinage reads as one of them without being one, so such a name takes the prefix or a different word. Never model-brand a name; the mechanism must outlive any one model. A person's name is allowed only when the method it names is already known by that name (a Feynman technique, a Mandela effect, the five-step algorithm that begins by questioning the requirement), so the eponym is the reflex's real word rather than a brand. A `-local` suffix means the same reflex, but the result is an identity managed by this machine's filesystem rather than a reference carried in the text; portability is stated per mechanism in the body, because a hardlink carries nothing in a clone while a relative symlink travels where the layout is reproduced.

## SKILL.md format

```
---
name: <kebab-name>            # matches the directory and the invocation
description: "<trigger-rich one-liner>"
# disable-model-invocation: true   ← user-invoked skills only
---

<one line: what the skill does>

## Goal
## Workflow      (numbered steps)
## Rules         (constraints)
## Verification  (checks before finishing; report what changed)
```

*(checked: the frontmatter parses as YAML 1.1 and 1.2, so quote every description; `name` matches the directory; the four sections exist; and the frontmatter passes the rules of Codex's `quick_validate.py`)*

## Invocation

Every `SKILL.md` is either user-invoked (`disable-model-invocation: true` plus `policy.allow_implicit_invocation: false` in `agents/openai.yaml`, reachable only by the human) or model-invoked (model- or user-reachable). Default to model-invoked; make a skill user-invoked only when the model should never reach it on its own, because its trigger is a deliberate human action (commit, push, publish, deploy) or its mere presence in reach would bias the agent. Each user-invoked skill states its reason in its own body. *(checked: the two flags pair, a user-invoked description drops its "Use when" triggers, and no Skill tool call names a user-invoked skill)* The description conventions, the Codex pairing, and how one skill calls another live in [.agents/invocation.md](./.agents/invocation.md).

## Conventions

A skill names another in one of two ways, and only one of them is a dependency. A **call** is a step in the skill's own procedure that runs another skill or needs its result, written as a Skill tool call ([.agents/invocation.md](./.agents/invocation.md)). A **reference** names another skill for the reader (a router's candidate, a paired skill, the owner of a neighboring job) and depends on nothing. A skill calls a sibling where the sibling already does the work it needs ([Philosophy](#philosophy)), and a call that brings nothing the skill could not do as well alone is cut. Calls never form a cycle: if A's procedure calls B, or one of its steps needs B's result without a Skill tool call, no chain of such dependencies leads from B back to A, directly or through other skills, and a reference adds no link to that chain. *(checked: a Skill tool call that closes a cycle; a dependency written only in prose is checked by the reviewer)* The calls and references in force:

- **orchestrator**: `sip` runs the suite's clean-and-true checks; `re0-loop` and `nba` run and navigate the coil cycle; `re0-workflow` recommends an ordered graph of skills for a stated intent and never invokes them, and `nba` consults it as one candidate while still returning one action; `re0-release` runs the shipping and releasing checklist, runs `sip` when installed, and applies commit-economy directly. It never calls user-invoked `re0-git`; if an existing commit needs cleanup, it tells the human to run it. `re0-plan` opens the iteration folder `re0-release` later retires: the one pairing between two user-invoked skills, and the one skill that assumes the full package installed instead of degrading. `re0-merge` walks reviewing and landing a contribution, using `shower` when present and handing each message to the human for `re0-git`. `ssotize-local` runs `ssotize`'s audit and approval first and adds only the filesystem identity work; unlike the others it stops when that skill is missing, since a link made without the audit skips the gate that makes it safe. An orchestrator degrades gracefully: it uses the model-invoked skills present, skips the rest, and hands a user-invoked step to the human.
- **paired skills**: a few skills read as deliberate mirrors or complements, a catalog fact for the reader rather than a runtime dependency (neither names the other, and each ships alone): `aim`↔`nba` run the same shape from opposite ends (intent from a handover vs next action from live state); `macrothink`↔`multithink` are the fan-out and fan-in of a plural read (`macrothink` gathers fresh reads of one direction and reports divergence first; `multithink` classes reads it did not gather by cited evidence, never by count), so a human can hand `macrothink`'s verbatim reads to `multithink`, where an uncited read stays unsupported; `catchup`↔`nba` are the coil re-entry pair (orient vs act).

A rule several skills need at runtime, with no model-invoked skill that owns it to call, is carried inline in each; the copies are mapped here so they stay coherent when you touch one, and AGENTS.md is the contributor's map, not a runtime dependency:

- **edit-safety**: safe mutation (assert the target exists and report a MISS, edit unicode-safe, replace positional targets per occurrence not by blanket sweep, script large structural moves), in `re0`, `detool`, `debloat`, `re0-order`, `dedash`, `ssotize`.
- **negatives-as-corpus**: "cut" means move-to-archive, never delete; pruned and failed branches are assets, in `autobahn`, `re0-merge`, `re0-plan`, `re0-loop`, `re0-memo`, `re0-work`.
- **commit-economy**: the commit-message standard, stated in full by its home `re0-git` and carried inline in `re0-release`.
- **script and judgment split**: a step whose inputs decide its result becomes a script or check, a step that needs meaning stays in prose, the two meet in files the next run replays, and a proposed check comes with a violation it fails and a valid case it passes, in `elon` (the automate step) and `re0-flex` (moving repeated work out).
- **tell-family order**: the passes that remove machine-writing tells state their class and their order inline, and the punctuation pass runs last because a rewrite regenerates dashes: `re0` (shape class by rewriting; an unsourced claim is observed, never deleted or sourced), `debloat` (excess class, handing drift, duplication, dashes and stack nouns to their owners), `dedash` (punctuation, last), `dedot` (second punctuation pass, Korean middle dot; runs after any rewrite like `dedash`); `detool` states that it is outside the family and `modelchk` that routing is not its dial.

## Local provenance

`.re0/` holds this repo's own provenance, gitignored and never shipped: per-cycle iteration casebooks (`.re0/iteration/`) and the release rail (`.re0/release/`). History and scratch, not spec; nothing in it is canonical. `.re0/tutorial/` holds the tutorial's attempt records, one per attempt and never edited in place.

A casebook's folder says its state, so a person sees what is open without reading it: `.re0/iteration/planned/` holds a cycle whose build has not started, queued or held, `active/` one in progress, and `completed/` one whose work landed or whose verdict closed it, rejection included, unrenamed and never deleted. Every casebook in `planned/` or `active/` has an entry in the root `TODO.local.md` linking its current path. The session that starts a planned cycle's first turn moves it to `active/`; the session that records a verdict closing a cycle without a release (rejected, absorbed, superseded) moves it to `completed/` and removes its TODO entry; a release moves it as below. A move rewrites the TODO link and the relative links inside the casebook in the same step. The folder keeps its name across moves, its provisional version included. `re0-plan` opens each casebook as `active/<version>-<workname>/`, or `planned/` when the cycle waits for a later session, and seeds it the instant it's created: a cycle with real design surface gets `DESIGN.local.md`, then `WORKFLOW.local.md` + `EVIDENCE.local.md`; a lightweight fix gets a one-paragraph `RETRO.local.md` seed immediately, which `re0-memo` extends in place at the end rather than starting fresh. Reference material stays flat as `REF-<topic>.local.md` until it earns its own `refs/` subfolder. `re0-release` moves a cycle still in `active/` into `completed/` when its version ships.

## Shipping

Each canonical doc has one reader. **[README](./README.md)** serves the person deciding whether and how to use paperthin: what it is, the map, the catalog, install. **[AGENTS.md](./AGENTS.md)** serves the agent working inside this repository: mechanism, rules, anatomy and conventions, read by Claude Code through the `CLAUDE.md` symlink. A human contributor starts from [CONTRIBUTING.md](./CONTRIBUTING.md). `re0-readme` audits the split. A change lands in the doc whose reader needs it, often both; agent mechanism never goes in README, and a user-facing change never skips it. Install commands are copied verbatim from [.agents/install-block.md](./.agents/install-block.md), which names `re0-upgrade` as the one update path. *(checked in every README)*

No em-dashes in this repo's prose: `SKILL.md` files, `.agents/`, this guide, release notes and code comments. Where a sentence reaches for one, rewrite it with the comma, colon, period, parentheses, or conjunction it actually wants, never a blind character substitution. The READMEs, the brand one-liner and the banners keep an em dash only as a separator in a label slot (after a bold lead, after a heading's number, between a name and its tagline), never inside a sentence, by the slots `dedash` classifies. *(checked: any em-dash in skills, `.agents/`, this guide, `scripts/` and `.github/`; an in-sentence em or en dash in the READMEs, `assets/`, `package.json` and `.claude-plugin/`)*

Before committing, confirm:

1. **SKILL.md** follows the [anatomy](#skillmd-format).
2. The skill lands in place on every roster surface with `re0-order`, in its perspective's logical order ([Layout](#layout)): [plugin.json](./.claude-plugin/plugin.json), the runtime catalog, `re0-upgrade`'s catalog, and the Index of the [README](./README.md) (the English source) and each translation under [`assets/i18n/`](./assets/i18n/). *(checked: set, order, Invoker column, and each translation's `<sub>Read in:` switcher)* Every skill also takes one line in each README's Problem list, in the same order, saying what it removes *(checked)*; a Fixes entry is for the few that carry the thesis, since that section is curated, not exhaustive.
3. **[package.json](./package.json)** bumps by **kind, not size**: against the artifact's own prior spec, was the old behavior *wrong* (a fix → patch, even with much new plumbing) or *correct but narrower* (a new capability a user reaches for → minor)? A skill removed with no replacement is major. State that answer before naming the bump; keep `keywords` grouped.
4. A **rename** appends its old → new row to [`re0-upgrade`](./skills/breadth/re0-upgrade/SKILL.md)'s deprecations, in release order, and restarts the body with `re0-work`. A body drafted under one name keeps that name's framing through any text substitution, so a writer who never read the old body writes the new one from its behavior contract alone, `shower` cold-reads it, and the rename lands once every obligation in the contract survives.
5. Any inline rule-copy or orchestrator edge stays coherent with the [Conventions](#conventions) map: touch one copy, check the others. When a skill is added, renamed, removed, or changes invocation lane, re-read every skill and doc that names it and update each one. An orchestrator that still calls a skill gone user-invoked, or routes to one that no longer exists, is a map that lies; a Skill tool call is checked, prose routing is read.
6. Run **`sip`**.

Write commit messages to [Commit messages](#commit-messages) from the first draft, not only on cleanup.

## Commit messages

The log is the handoff between sessions, so every message takes the form this history already keeps. Read this section, `git log -20` and `git log -5 -- <changed-paths>` before drafting; older commits that break it (capitalized bullets with periods, a body folded into the subject, release and plan footers) are history, not precedent.

- **Form** *(checked by [`check-commit-messages.cjs`](./scripts/gates/check-commit-messages.cjs) on every pull request and push)*: `type(scope): description` with a type from `feat`, `fix`, `docs`, `refactor`, `chore`, `ci`, the scope the skill or area served, and a lowercase imperative description of what is true after the change, no final period, at most 72 characters; then a blank line and one single-line lowercase `- ` bullet per durable change, no final period. A change the subject fully states takes no body.
- **Leave out** what a later reader cannot use: release kinds, plan paths, co-author tags (except a closing `Co-authored-by` trailer that credits a human contributor on a squashed or carried contribution, *checked*), the list of surfaces a skill was registered on or translations synced, gitignored local paths, and how a pilot went. Keep a reason when the diff cannot show why.
- **Commit** one verified feature at a time, signed; `re0-git` rewrites a message without touching a commit's dates and places a late commit at its time. Whether a bullet is worth keeping stays a review call.

## Releasing

Signed tags and `re0-git`'d messages are the human's trust boundary; CI runs the mechanical distribution only once a tag is pushed, and it never signs or creates a commit or tag.

An external contribution lands through [`re0-merge`](./skills/depth/re0-merge/SKILL.md), which owns the procedure: approved when accepted, then merged as it is, merged after the maintainer's follow-up commits on its own branch, or carried into a maintainer PR that credits the author and closes the original as superseded, each squash-merged on GitHub so `main` stays linear and signed. [CONTRIBUTING.md](./CONTRIBUTING.md) tells the contributor their side of it.

1. `re0-git` the message; bump `package.json` if warranted ([Shipping](#shipping)).
2. Write `.re0/release/RELEASE_NOTES.local.md` as the tag message, house style:
   - one `##` heading naming the release's durable idea, not the version;
   - one short present-tense paragraph of what is true now, not a changelog;
   - only the sections it earns: `### New`, `### Also`, `### The catalog (N skills)` (only when the roster must be re-mapped), `### Install` (always last, indented not fenced, carrying the `install` command from [.agents/install-block.md](./.agents/install-block.md) verbatim);
   - credit each external change inline (`(#123, @handle)`); skill names in backticks;
   - nothing the tag or version already proves, and no narration of anything meant to stay silent.
3. Tag: `git tag -s vX.Y.Z -F .re0/release/RELEASE_NOTES.local.md --cleanup=verbatim`, then confirm `git tag -v vX.Y.Z` reports a good signature.
4. Push `main` and the tag, **the entire manual step**; it triggers [`release.yml`](./.github/workflows/release.yml): validate, verify `package.json` matches the tag, `npm publish --provenance`, title the GitHub Release from the tag. Never run one of those by hand, least of all to rescue a failed run: a hand-run step drops what the workflow adds beyond the artifact (the provenance attestation, the title convention) while still looking like a good release. If the run fails, fix the cause and re-run it. A tag the author cut wrong (its message, signature or target) is deleted and re-cut at the same version rather than rolled forward; the version moves on only when a published artifact is wrong.
5. On success, close each landed contribution with a credit comment pointing at the release; the acceptance approval already recorded it as accepted. Any maintainer with review access does this.
6. Move the shipped cycle's folder from `.re0/iteration/active/` into `.re0/iteration/completed/`. `re0-release` does this; do it by hand only when running the checklist manually.

No build step: the package ships the repo as-is via `.gitignore` from the clean CI checkout, which is why publishing is CI's alone (step 4). Never add an `.npmignore`; it would publish the `*.local` docs. *(checked)*

## Vendoring

Not a fork of [mattpocock/skills](https://github.com/mattpocock/skills): we adopt its architecture and philosophy and ship our own non-overlapping workflows, vendoring only the small shared substrate. Reused material keeps upstream's wording and is credited in [NOTICE](./NOTICE) per source (project · license · copyright), never paraphrased to drop credit. `.agents/invocation.md` and `.agents/install-block.md` are that substrate: they keep upstream's text and structure with this suite's names substituted, so a change to either starts from upstream's current file, not from ours.


