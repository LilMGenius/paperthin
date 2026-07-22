---
name: re0-release
description: "Walk a pending change through this repo's shipping and releasing checklist end to end, then tag and publish once confirmed. User-invoked: run it when you've decided to ship."
disable-model-invocation: true
---

Run this repo's shipping and releasing checklist on a pending change, then tag and publish once confirmed.

## Goal

Make "prepare and ship a release" a single deliberate command instead of re-deriving the shipping and releasing checklist by hand every time. It runs `sip` when installed, applies commit-economy directly, and never auto-fires another user-invoked skill. It treats "commit" and "tag + push" as two separately-staked moments: a commit stays local and reversible, tag + push is the one step that goes public.

## Workflow

1. Confirm shipping readiness against the pending diff — every applicable item from CLAUDE.md's Shipping checklist except the version bump and the `sip` run, which are steps 2 and 3 here:
   - any new or changed `SKILL.md` has the right shape (frontmatter `name`+`description`, `disable-model-invocation` only if user-invoked, body sections Goal/Workflow/Rules/Verification);
   - the README and every localized copy under `docs/readme/` list it accurately, with the right invocation column and in the roster's logical order — the same order held across `plugin.json`, `scripts/catalog.cjs`, and `re0-upgrade`'s catalog, kept in lockstep with `reorder`; the README's Problem removes-list and Fixes narrative include it only if it carries the thesis (most skills earn neither — both are curated);
   - `plugin.json` registers its path;
   - any rename appends an old -> new row to `re0-upgrade`'s deprecations checklist, in release order;
   - shared cross-skill rules (edit-safety, negatives-as-corpus, commit-economy) stay coherent across every copy that carries them.
   Report any gap and stop rather than guessing past it.
2. Classify the version bump: a new skill is minor; a fix or docs-only change is patch; a skill removed with no replacement path is major. For an enhancement to an existing skill — the boundary case — decide by **kind, not size**: relative to the skill's own prior spec, was the old behavior *wrong* (a fix → patch; new plumbing that only serves a fix stays patch) or *correct but narrower / missing a dimension* (a new capability a user newly reaches for → minor)? State that answer, not just the bump.
3. Run `sip` if it is installed, and apply its findings. If it is not installed, run its checks directly in order — cold-read (`shower`), truth checks only when there is a claim or an eval (`factchk`/`mandela`), consistency (`ssotize` audit first, consolidation only after approval), then tidy (`re0`) — and apply what they find.
4. Bump `package.json`'s version to the classification from step 2.
5. Draft the commit message to commit-economy — one bullet per real, durable change with supporting edits folded in, nothing the diff or version already proves, no co-author tags, matched to the local log's own shape — from the first draft, not appended to across edits. If a commit already exists and needs cleanup, ask the human to run `re0-git`; do not invoke it automatically.
6. Ask for explicit confirmation, then commit.
7. Write `.re0/release/RELEASE_NOTES.local.md` — a gitignored, never-shipped local scratch file that rides the signed tag as its message — to this house style: one `##` heading naming the release's durable idea, not the version; one short present-tense paragraph of what is true now; only the sections the release earns (`### New`, `### Also`, `### The catalog (N skills)` only when the roster needs re-mapping, `### Install` always last as an indented block); each externally-contributed change credited inline with its PR number and author handle (`(#123, @handle)`); skill names and paths in backticks; nothing the tag or version already proves.
8. Ask for a second, separate confirmation before tagging and pushing — this is the one step that goes public. Then: `git tag -s vX.Y.Z -F .re0/release/RELEASE_NOTES.local.md --cleanup=verbatim`, push `main`, push the tag.
9. Watch the triggered release workflow to completion; report success or the actual failure, never assume it landed.
10. Once success is confirmed, close out each external contribution the release landed: whoever reviewed it approves the PR before closing it — a contribution squashed or rebuilt into the release is closed, not merged, so the approval is what records it as accepted rather than rejected — and the closing comment carries the credit the release notes gave it. Any collaborator or maintainer with review access can do this; it is not tied to one reviewer.
11. Then retire the shipped cycle: move its `.re0/iteration/<version>-<workname>/` folder into `.re0/iteration/completed/<version>-<workname>/`, unrenamed. `.re0/` is gitignored and never tracked, so use a plain filesystem move (`mv`), never `git mv` — the latter fails outright on an untracked path. Skip this step only when the cycle was never planned with `re0-plan` and has no matching iteration folder.

## Rules

- Never invent or assume a CLI command or flag; verify it against official docs or a real run before writing it into a step you will execute.
- If the pending diff mixes unrelated concerns, say so and propose a split before drafting a message — don't let one commit's message do a diff's job.
- Never push before the local version match holds (`package.json` equals the tag about to be created); the CI check is a backstop, not the first line of defense.
- **negatives-as-corpus** — retirement moves the iteration folder, never deletes it. If the release fails or is rolled back, leave the folder live rather than retiring a cycle that didn't actually ship.

## Verification

Before finishing:

1. `package.json`'s version matches the tag.
2. The commit message reads as a clean handoff on its own, without the diff.
3. Release notes follow the house style and mention only what this release earns.
4. The pushed tag's triggered workflow run completed successfully — confirmed, not assumed.
5. Each external contribution the release landed had its PR approved before it was closed, with the credit comment attached.
6. The shipped cycle's iteration folder was retired into `.re0/iteration/completed/`, or correctly skipped because none existed.
7. Report any skipped step or unresolved gap.
