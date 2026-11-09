# Paperthin

Paperthin is an agent-agnostic suite of plain-Markdown skills that keep an artifact **clean and true**. This file is the guide for the agent authoring them here, and is itself a skill artifact: `re0` it when it drifts.

| Fact | Owner |
| --- | --- |
| What paperthin is, the map, the catalog defining every skill named below, install | [README](./README.md), translated under [`assets/i18n/`](./assets/i18n/) |
| Rules, anatomy and conventions for an agent working in this repository | this file, read by Claude Code through the `CLAUDE.md` symlink |
| The contributor's side of issues and pull requests | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| The two invocation lanes and their flags, description style, how one skill calls another | [.agents/invocation.md](./.agents/invocation.md) |
| Install commands, one route per agent | [.agents/install-block.md](./.agents/install-block.md) |
| What one skill does and how | its `SKILL.md` |

A change lands in the doc whose reader needs it, often both: agent mechanism goes in this guide or `.agents/`, never README, and a change to what users see or do also updates README. `re0-readme` audits the split.

`npm run check` runs [check.cjs](./scripts/gates/check.cjs) over five gates: `skills`, `catalog`, `links`, `prose` and `llms`. `npm test` proves every check can fail, and CI runs both plus [check-commit-messages.cjs](./scripts/gates/check-commit-messages.cjs) over every pull request and push. A rule marked *(checked: <gate>)* is decided by that gate; the rest is judgment. When `llms` reports llms.txt or llms-full.txt stale (they carry README and every `SKILL.md`), regenerate them with `node scripts/gates/llms.cjs`.

Sections run from the principles, through the repository map and one skill's anatomy, to how skills relate and how a change ships.

## Philosophy

- **Trust the artifact, not the author.** A skill makes work read true to someone who wasn't there: *clear* (does it read?) and *correct* (is what it claims real?). The maker's in-session mind judges either worst, so a skill re-derives the work from what is true now or imports outside eyes.
- **Generic examples, not instances.** In a durable doc (this guide, `.agents/`, a `SKILL.md`, a release note) an example stays generic (`(#123, @handle)`, `land/pr-<n>`); a real PR number, handle, SHA or range ages into residue a later reader takes for current fact. *(checked: prose, in tracked docs)*
- **One source of truth, and skills that complement one another.** One fact, and one mechanism, lives in one place, and everything else references it: a skill reuses what a sibling already does and rebuilds it only when it does not fit the work. Overlap between skills stays; each covers what the others leave. A skill still ships and runs installed alone (`npx skills@latest add` can pull one without its siblings or this guide), so it never points at AGENTS.md for a rule it needs while running, and [Conventions](#conventions) sets how it uses a sibling that may be missing. The one-home rule bends in exactly two places: a rule several skills need at runtime that no model-invoked sibling owns, which each carries inline and Conventions maps; and the skill roster, hand-written with no build step onto surfaces that cannot reference each other (the skill folders, [plugin.json](./.claude-plugin/plugin.json), [re0-upgrade](./skills/breadth/re0-upgrade/SKILL.md)'s Current catalog, every README Index). Never dedupe them. *(checked: catalog, one set in one order against re0-upgrade's Current catalog)*
- **Restraint.** Change only what improves; a pass that finds nothing to improve changes nothing. The enemy is slop (noise, duplication, padding), not addition.
- **Edit as v0.** A change to a skill or doc rewrites the passage it touches as if it had always said so: a new idea takes its own step or sentence, and a neighboring sentence keeps its wording rather than carrying an appended clause. `re0` the edited passage before `sip`.
- **Recursive.** Every skill is general enough to use while building the skills, so the suite is maintained with its own skills and each pass is audited and refined by the tools it ships.

## Layout

```
skills/<perspective>/<name>/SKILL.md
```

One skill is one directory with a `SKILL.md` and an `agents/openai.yaml`. *(checked: skills)* Topic domains belong in separate plugins, so within one the only durable cut is **perspective**, on two axes, **cardinality × time** (one artifact or many files; the thing in hand or across build cycles):

```text
skills/
├── breadth/   reconcile one truth across files and platforms
├── coil/      carry learning between build cycles
├── depth/     refine or verify the thing in hand
└── mesh/      aggregate independent views by their evidence, never by count
```

The quadrants and each skill's home are the README's [map](./README.md#the-map) and [index](./README.md#the-index); this file defines only the cut. Within a perspective the listing runs in a logical order (a `depth/` skill's work lifecycle, say), with one pin: `re0` leads `depth/` as the founding skill, so `re0-order` keeps it first rather than sorting it into the cleanup group. Keep drafts and retired skills out of the README and `plugin.json`.

**File by trigger scope, not by what a skill invokes.** A skill lives where the work it triggers or emits ranges, even when it orchestrates skills from other folders: `sip` gates one finished deliverable, so it is `depth/`, though its check may run cross-file `ssotize`.

Around `skills/`, each top-level folder has one job: `.agents/` holds the contracts read before touching the repo (the owner table names them), `assets/` holds what the READMEs embed, with the translations under `assets/i18n/`, and `scripts/gates/` holds what must hold before a release. No paperthin install path writes a hook into a host; a script a skill runs on the user's machine ships in that skill's own `scripts/` folder.

**Name it for the reflex it fires**: a plain real word (`shower`, `sip`) or a tight compression of a real term (`re0`, `ssotize`), so a stranger half-guesses what it does; no opaque coinage. A self-evident metaphor-noun is allowed only as a deliberate exception its own intuition carries (`autobahn`). The `re0-` prefix marks clean-version lifecycle commands, the operator moves that carry an artifact from one clean state to the next (upgrade, release, restart, loop, realign a listing); a bare `re` + verb coinage reads as one of them without being one, so it takes the prefix or a different word. Never model-brand a name; the mechanism must outlive any one model. A person's name is allowed only when the method is already known by it (a Feynman technique, a Mandela effect, the five-step algorithm that begins by questioning the requirement). A `-local` suffix means the same reflex with the result held as an identity by this machine's filesystem instead of a reference in the text; the body states portability per mechanism (a hardlink carries nothing in a clone; a relative symlink travels where the layout is reproduced).

## Local provenance

`.re0/` is this repo's own provenance, gitignored, never shipped and never canonical: per-cycle iteration casebooks (`.re0/iteration/`), the release rail (`.re0/release/`), and the tutorial's attempt records (`.re0/tutorial/`, one per attempt, never edited in place).

Every casebook is kept, and its folder says its state: `.re0/iteration/planned/` holds a cycle whose build has not started, queued or held, `active/` one in progress, and `completed/` one whose work landed or whose verdict closed it, rejection included. Every casebook in `planned/` or `active/` has an entry in the root `TODO.local.md` linking its current path. The session that starts a planned cycle's first turn moves it to `active/`; the session that records a verdict closing a cycle without a release (rejected, absorbed, superseded) moves it to `completed/` and removes its TODO entry; a release moves it at [Releasing](#releasing) step 6. A move keeps the folder's name, its provisional version included, and rewrites the TODO link and the casebook's relative links in the same step. [`re0-plan`](./skills/coil/re0-plan/SKILL.md) opens each casebook as `active/<version>-<workname>/`, or `planned/` when the cycle waits for a later session, and owns the files it is seeded with.

## Vendoring

The suite adopts the architecture and philosophy of [mattpocock/skills](https://github.com/mattpocock/skills) and vendors only its small shared substrate (`.agents/invocation.md`, `.agents/install-block.md` and `CONTRIBUTING.md`), credited per source (project · license · copyright) in [NOTICE](./NOTICE) and never paraphrased to drop credit. Those files keep upstream's sections, sentences and word choices, and differ only where this suite must: its names and examples, its install routes and their one-line `&&` form, the daily update job, the move of an older install onto the current routes, the steps for an agent handed only this repository, and pull requests open to everyone. A change to any of them starts from upstream's current file, and a sentence reworded for style alone goes back to upstream's.

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

*(checked: skills; the frontmatter parses as YAML 1.1 and 1.2, so quote every description; `name` matches the directory; the four sections exist; and the frontmatter passes the rules of Codex's `quick_validate.py`)*

A bundled script under `scripts/` runs from wherever its skill is linked (an `.agents/skills` folder, a junction in a home directory), while Node loads a module from its real path, so an entry check compares `realpathSync(process.argv[1])` with the real path of `import.meta.url`; compared as typed, a call through the link exits 0 having done nothing. *(checked: skills)* Its tests call the CLI through a junction or symlink to the skill folder.

## Invocation

Every `SKILL.md` is user-invoked (reachable only by the human) or model-invoked (reachable by the model or the user); the flags each lane sets in `SKILL.md` and `agents/openai.yaml`, the description conventions, and how one skill calls another live in [.agents/invocation.md](./.agents/invocation.md). Default to model-invoked. Make a skill user-invoked only when the model should never reach it on its own, because its trigger is a deliberate human action (commit, push, publish, deploy) or its mere presence in reach would bias the agent. Each user-invoked skill states its reason in its own body. *(checked: skills; the two flags pair, a user-invoked description drops its "Use when" triggers, and no Skill tool call names a user-invoked skill)*

## Conventions

A skill names another in one of two ways, and only one of them is a dependency. A **call** is a step in the skill's own procedure that runs another skill or needs its result, written as a Skill tool call ([.agents/invocation.md](./.agents/invocation.md)). A **reference** names another skill for the reader (a router's candidate, a paired skill, the owner of a neighboring job) and depends on nothing. A skill calls a sibling where the sibling already does the work it needs ([Philosophy](#philosophy)), and a call that brings nothing the skill could not do as well alone is cut. Calls never form a cycle: if A's procedure calls B, or one of its steps needs B's result without a Skill tool call, no chain of such dependencies leads from B back to A, directly or through other skills; a reference adds no link to that chain. *(checked: skills; a Skill tool call however the sentence phrases it, a sibling named in backticks or quotes in a `## Workflow` step, or one named bare right after a call verb (run, call, invoke, hand to, pass to), that closes a cycle; so a boundary mention such as "do not call X here" belongs under `## Rules`)* The calls and references in force:

- **orchestrator**: `sip` runs the suite's clean-and-true checks. `backprop` carries a lesson back into its sources through `re0-memo`, `elon`, `ssotize`, `re0`, `debloat` and `re0-order`, in that order, and hands `dedash` and `dedot` to the human. `re0-loop` and `nba` run and navigate the coil cycle. `re0-workflow` picks, orders, shows and runs the skills for one stated intent, stopping at the first step a human must take; the user-invoked `paperthin` only forwards a request to it unchanged and stops when it is missing, and `re0-workflow` never routes back to it. *(checked: scripts/gates/alias.test.cjs)* `re0-release` runs the shipping and releasing checklist, runs `sip` when installed and applies commit-economy directly; it never calls user-invoked `re0-git`, and tells the human to run it when an existing commit needs cleanup. `re0-plan` opens the iteration folder `re0-release` later retires: the one pairing between two user-invoked skills, and the one skill that assumes the full package installed instead of degrading. `re0-merge` walks reviewing and landing a contribution, using `shower` when present and handing each message to the human for `re0-git`. `ssotize-local` runs `ssotize`'s audit and approval first and adds only the filesystem identity work; unlike the others it stops when that skill is missing, since a link made without the audit skips the gate that makes it safe. An orchestrator degrades gracefully: it uses the model-invoked skills present, skips the rest, and hands a user-invoked step to the human.
- **single calls**: `debloat` calls `shower` to cold-read a cut, and `re0-memo` calls `detool` to strip names from a lesson, `crossthink` when every drafted prescription takes one route, `elon` to question the prescriptions and `scopechk` to place each lesson, carrying inline the larger-scale re-read of user-invoked `macrothink` and the first nail of user-invoked `hate`; each checks by itself when the callee is missing. `re0-readme` calls `ssotize` for a fact copied past the one-form-per-reader split, `detool` for stack nouns in the README, `re0-order` and `debloat` on the agent guide, and `sip` before its approval stop, reporting any step it could not run. `re0-import` calls `scopechk` before placing a whole item, `ssotize` on a subject already scattered, `factchk` when the human wants a claim checked, and `re0` on an owner that drifted. `re0-plan` calls `readback` to confirm a full design read and hands an active cycle to `re0-loop`, and `re0-squash` calls `readback` on the repository and the accepted losses before its delete.
- **paired skills**: deliberate mirrors or complements, a catalog fact rather than a runtime dependency (neither names the other, and each ships alone): `aim`↔`nba` run the same shape from opposite ends (intent from a handover, next action from live state); `macrothink`↔`multithink` are the fan-out and fan-in of a plural read, so a human can hand `macrothink`'s verbatim reads to `multithink`; `catchup`↔`nba` are the coil re-entry pair (orient, then act).

A rule several skills need at runtime, with no model-invoked skill that owns it to call, is carried inline in each. They are mapped here so a contributor who touches one copy keeps the others coherent; no skill reads this map at runtime:

- **edit-safety**: safe mutation (assert the target exists and report a MISS, edit unicode-safe, replace positional targets per occurrence rather than by blanket sweep, script large structural moves), in `re0`, `detool`, `debloat`, `re0-order`, `dedash`, `ssotize`, `re0-readme`, `re0-import`, `re0-style`.
- **negatives-as-corpus**: "cut" means move-to-archive, never delete; pruned and failed branches are assets, in `autobahn`, `re0-merge`, `re0-plan`, `re0-loop`, `re0-memo`, `re0-work`, `re0-release`.
- **bump by kind**: a version moves by the kind of change (a fix is patch, a new capability is minor, a removal with no replacement is major), never by its size, stated in [Shipping](#shipping) item 3 and carried inline in `re0-release`'s bump step and `re0-plan`'s provisional version.
- **commit-economy**: the commit-message standard, stated in full by its home `re0-git` and carried inline in `re0-release`.
- **tell-family order**: the passes that remove machine-writing tells each state their class and this order inline, punctuation last because a rewrite regenerates dashes: `re0` (shape, by rewriting; an unsourced claim is observed, never deleted or sourced), `debloat` (excess, handing drift, duplication, dashes and stack nouns to their owners), `dedash` (punctuation, last), `dedot` (a second punctuation pass for the Korean middle dot, also after any rewrite); `detool` states that it is outside the family and `modelchk` that routing is not its dial.

## Shipping

Install commands are copied verbatim from [.agents/install-block.md](./.agents/install-block.md), one self-updating route per agent, and `re0-upgrade` moves an older install onto them. The plugin routes reinstall only when `version` in `plugin.json` changes, so every release bumps `package.json` and sets `plugin.json` to the same version. *(checked: prose, the commands in every README; catalog, the two versions)*

No em dashes in this repo's prose: `SKILL.md` files, `.agents/`, this guide, release notes and code comments. Where a sentence reaches for one, rewrite it with the comma, colon, period, parentheses or conjunction it wants, never a blind character substitution. The READMEs, the brand one-liner and the banners keep an em dash only as a separator in a label slot (after a bold lead, after a heading's number, between a name and its tagline), never inside a sentence, by the slots `dedash` classifies. *(checked: prose; any em dash in skills, `.agents/`, this guide, `scripts/` and `.github/`; an in-sentence em or en dash in the READMEs, `assets/`, `package.json` and `.claude-plugin/`)*

Before committing, confirm:

1. **SKILL.md** follows the [anatomy](#skillmd-format).
2. The skill lands in place on every roster surface with `re0-order`, in its perspective's logical order ([Layout](#layout)): [plugin.json](./.claude-plugin/plugin.json), `re0-upgrade`'s Current catalog, and the Index of the [README](./README.md) (the English source) and of each translation under [`assets/i18n/`](./assets/i18n/). *(checked: catalog and links; set, order, Invoker column, and each translation's `<sub>Read in:` switcher)* The skill's row in each README Index has a "What it does" cell that tells a reader who is not a developer what the skill does in one or two short lines, and each translation paraphrases it into natural prose of its own language rather than word for word. *(checked: prose; a translated cell never equals the English one, and in Korean, Japanese, Chinese, Russian, Arabic and Hindi it is mostly in that script; whether it reads naturally stays judgment)*
3. **[package.json](./package.json)** bumps by **kind, not size**: against the artifact's own prior spec, was the old behavior *wrong* (a fix, so patch, even with much new plumbing) or *correct but narrower* (a new capability a user reaches for, so minor)? A skill removed with no replacement is major. State that answer before naming the bump; keep `keywords` grouped.
4. A **rename** appends its old → new row to [`re0-upgrade`](./skills/breadth/re0-upgrade/SKILL.md)'s deprecations, in release order, and restarts the body with `re0-work`: a body drafted under one name keeps that name's framing through any substitution, so a writer who never read the old body writes the new one from its behavior contract alone, `shower` cold-reads it, and the rename lands once every obligation in the contract survives.
5. Every inline rule copy and orchestrator edge stays coherent with the [Conventions](#conventions) map: touch one copy, check the others. When a skill is added, renamed, removed, or changes invocation lane, re-read every skill and doc that names it and update each one; an orchestrator that still calls a skill gone user-invoked, or routes to one that no longer exists, is a map that lies. A Skill tool call is checked; prose routing is read.
6. Run **`sip`**.

Write commit messages to [Commit messages](#commit-messages) from the first draft, not only on cleanup.

## Commit messages

The log is the handoff between sessions, so every message takes the form this history already keeps. Before drafting, read this section, `git log -20` and `git log -5 -- <changed-paths>`; older commits that break it (capitalized bullets with periods, a body folded into the subject, release and plan footers) are history, not precedent.

- **Form** *(checked by [`check-commit-messages.cjs`](./scripts/gates/check-commit-messages.cjs) on every local commit through [`hooks/commit-msg`](./hooks/commit-msg), and on every pull request and push)*: `type(scope): description` with a type from `feat`, `fix`, `docs`, `refactor`, `chore`, `ci`, the scope the skill or area served, and a lowercase imperative description of what is true after the change, no final period, at most 72 characters; then a blank line and one single-line lowercase `- ` bullet per durable change, no final period. A change the subject fully states takes no body.
- **Leave out** what a later reader cannot use: release kinds, plan paths, co-author tags (except a closing `Co-authored-by` trailer that credits a human contributor on a squashed or carried contribution, *checked*), the list of surfaces a skill was registered on or translations synced, gitignored local paths, and how a pilot went. Keep a reason when the diff cannot show why.
- **Commit** one verified feature at a time, signed, by path (`git commit --only -- <paths>`) when other agents share the working tree, since they share its index and a bare commit takes whatever another staged. `re0-git` rewrites a message without touching a commit's dates and places a late commit at its time. Whether a bullet is worth keeping stays a review call.

## Releasing

Signed tags and `re0-git`'d messages are the human's trust boundary; CI runs the mechanical distribution only once a tag is pushed, and never signs or creates a commit or tag. `re0-release` walks these steps; follow them by hand only when running the checklist manually.

An external contribution lands through [`re0-merge`](./skills/depth/re0-merge/SKILL.md), which owns the procedure and squash-merges on GitHub so `main` stays linear and signed; [CONTRIBUTING.md](./CONTRIBUTING.md) tells the contributor their side of it.

1. `re0-git` the message; bump `package.json` if warranted ([Shipping](#shipping)).
2. Write `.re0/release/RELEASE_NOTES.local.md` as the tag message, in the house style of [`re0-release`](./skills/depth/re0-release/SKILL.md) step 7 (a heading naming the release's durable idea, what is true now rather than a changelog, only the sections it earns, `### Install` last with every route's commands verbatim), with no narration of anything meant to stay silent.
3. Tag: `git tag -s vX.Y.Z -F .re0/release/RELEASE_NOTES.local.md --cleanup=verbatim`, then confirm `git tag -v vX.Y.Z` reports a good signature.
4. Push `main` and the tag, **the entire manual step**. It triggers [`release.yml`](./.github/workflows/release.yml): validate, verify `package.json` matches the tag, `npm publish --provenance`, title the GitHub Release from the tag. Never run one of those by hand, even to rescue a failed run: a hand-run step drops the provenance attestation and the title convention while still looking like a good release. If the run fails, fix the cause and re-run it. A tag the author cut wrong (its message, signature or target) is deleted and re-cut at the same version; the version moves on only when a published artifact is wrong.
5. On success, any maintainer with review access closes each landed contribution with a credit comment pointing at the release; its acceptance approval is already recorded.
6. Move the shipped cycle's folder from `.re0/iteration/active/` into `.re0/iteration/completed/`.

No build step: the package ships the repo as-is via `.gitignore` from the clean CI checkout, which is why publishing is CI's alone (step 4). Never add an `.npmignore`; it would publish the `*.local` docs. *(checked: catalog)*


