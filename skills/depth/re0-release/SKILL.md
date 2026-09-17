---
name: re0-release
description: "Walk a pending change through this repo's shipping and releasing checklist end to end, then tag and publish once confirmed. User-invoked: run it when you've decided to ship."
disable-model-invocation: true
---

Run this repo's shipping and releasing checklist on a pending change, then tag and publish once confirmed.

## Goal

Prepare and ship a release through one deliberate command. Run `sip` when installed, apply commit-economy directly, and never auto-fire another user-invoked skill. Confirm committing and tagging + pushing separately: the commit stays local and reversible; tagging + pushing goes public.

## Workflow

1. Check the pending diff against every applicable item in AGENTS.md's Shipping checklist, except the version bump and `sip` run covered in steps 2 and 3:
   - any new or changed `SKILL.md` has the right shape (frontmatter `name`+`description`, `disable-model-invocation` only if user-invoked, body sections Goal/Workflow/Rules/Verification);
   - the README and every localized copy under `docs/readme/` list it accurately, with the right invocation column and roster order; keep that order aligned across `plugin.json`, `scripts/runtime/catalog.cjs`, and `re0-upgrade`'s catalog with `re0-order`; include it in the README's curated Problem removes-list and Fixes narrative only if it carries the thesis, which most skills do not;
   - `plugin.json` registers its path;
   - any rename appends an old -> new row to `re0-upgrade`'s deprecations checklist, in release order;
   - shared cross-skill rules (edit-safety, negatives-as-corpus, commit-economy) stay coherent across every copy that carries them.
   Report any gap and stop rather than guessing past it.
2. Classify the version bump: a new skill is minor; a fix or docs-only change is patch; a skill removed with no replacement path is major. Classify an existing skill's enhancement by **kind, not size** against its own prior spec: *wrong* behavior means a fix (patch, including new plumbing that only serves the fix); *correct but narrower / missing a dimension* means a new capability a user newly reaches for (minor). State which applies, not just the bump.
3. Run `sip` if installed and apply its findings. Otherwise, run its checks directly in order and apply their findings: cold-read (`shower`), truth checks only for a claim or eval (`factchk`/`mandela`), consistency (`ssotize` audit first, consolidation only after approval), then tidy (`re0`).
4. Bump `package.json`'s version to the classification from step 2.
5. Apply commit-economy from the first draft: one bullet per real, durable change with supporting edits folded in; nothing the diff or version already proves; no co-author tags. Match the local log's shape or, absent one, use a subject and one `-` bullet per change on a single unwrapped line. Rewrite the message as edits develop rather than appending to it. If an existing commit needs cleanup, ask the human to run `re0-git`; do not invoke it automatically.
6. Ask for explicit confirmation, then commit.
7. Write `.re0/release/RELEASE_NOTES.local.md`, a gitignored local scratch file never shipped as a file, as the signed tag's message. Follow the house style: one `##` heading naming the release's durable idea, not the version; one short present-tense paragraph of what is true now; only the sections the release earns (`### New`, `### Also`, `### The catalog (N skills)` only when the roster needs re-mapping, `### Install` always last as an indented block); each externally-contributed change credited inline with its PR number and author handle (`(#123, @handle)`); skill names and paths in backticks; nothing the tag or version already proves.
8. Ask for a second, separate confirmation before tagging and pushing, the step that goes public. Then: `git tag -s vX.Y.Z -F .re0/release/RELEASE_NOTES.local.md --cleanup=verbatim`, push `main`, push the tag.
9. Watch the triggered release workflow to completion; report success or the actual failure, never assume it landed. If it fails, fix the cause and re-run it or roll the version forward. Never finish its work by hand.
10. After confirmed success, close out each external contribution the release landed. Whoever reviewed it approves the PR before closing it: a contribution squashed or rebuilt into the release is closed, not merged, so approval records acceptance rather than rejection. Attach a closing comment carrying the release notes' credit. Any collaborator or maintainer with review access can do this.
11. Retire the shipped cycle: move `.re0/iteration/<version>-<workname>/` into `.re0/iteration/completed/<version>-<workname>/`, unrenamed. `.re0/` is gitignored and never tracked, so use a filesystem move (`mv`), never `git mv`, which fails on an untracked path. Skip only when the cycle was never planned with `re0-plan` and has no matching iteration folder.

## Rules

- Never invent or assume a CLI command or flag; verify it against official docs or a real run before writing it into a step you will execute.
- **The push is the whole manual step.** Never perform any step the release workflow owns by hand, including publishing, titling the release page, or moving a tag, even to rescue a failed run. Manual execution can look successful while omitting the workflow's signed provenance attestation, title convention, or distribution tag; only comparison with the previous release reveals the loss.
- If the pending diff mixes unrelated concerns, say so and propose a split before drafting a message; a commit message cannot separate the diff.
- Never push before the local version match holds (`package.json` equals the tag about to be created); the CI check is a backstop, not the first line of defense.
- **negatives-as-corpus**: retirement moves the iteration folder, never deletes it. If the release fails or is rolled back, leave the folder live.

## Verification

Before finishing:

1. `package.json`'s version matches the tag.
2. The commit message reads as a clean handoff on its own, without the diff.
3. Release notes follow the house style and mention only what this release earns.
4. The workflow triggered by the pushed tag completed successfully, with confirmation.
5. No step the workflow owns was run by hand, including to rescue a failed run.
6. Each external contribution the release landed had its PR approved before it was closed, with the credit comment attached.
7. The shipped cycle's iteration folder was retired into `.re0/iteration/completed/`, or correctly skipped because none existed.
8. Report any skipped step or unresolved gap.
