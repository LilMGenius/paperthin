---
name: re0-release
description: "Walk a pending change through this repo's shipping and releasing checklist end to end, then tag and publish once confirmed. User-invoked: run it when you've decided to ship."
disable-model-invocation: true
---

Ship a release of this repo in one deliberate command: check a pending change against the shipping and releasing checklist, commit it, then tag and publish once confirmed.

## Goal

A release lands complete and trustworthy: every checklist item met, the version bumped by the kind of change, a commit message that hands off without the diff, release notes in house style carried as the signed tag's message, and a published artifact the release workflow produced on its own. `re0-release` walks a pending change down that path. It calls `sip` when installed, applies commit-economy directly, and never calls another user-invoked skill. Committing and publishing are confirmed separately: the commit stays local and reversible, while tagging and pushing go public.

It is **user-invoked**: shipping is a deliberate human action, so only the human runs it, once they have decided to ship.

## Workflow

1. **Check the checklist.** Read the pending diff against every applicable item of the Shipping checklist in the repository root's `AGENTS.md` (its Shipping section) except the version bump and the `sip` run, which steps 2 and 3 own. That section is the authority; in this suite's own repository its items are:
   - any new or changed `SKILL.md` has the right shape: frontmatter `name` and `description`, `disable-model-invocation` only if the skill is user-invoked, and body sections Goal, Workflow, Rules, Verification; its `agents/openai.yaml` carries `policy.allow_implicit_invocation: false` exactly when the skill is user-invoked;
   - the README and every localized copy under `assets/i18n/` list it accurately, with the right invocation column and roster order; that order stays aligned across `plugin.json`, `scripts/runtime/catalog.cjs` and `re0-upgrade`'s catalog, set with `re0-order`; it enters the README's curated Problem removes-list and Fixes narrative only if it carries the thesis, which most skills do not;
   - `plugin.json` registers its path;
   - a rename appends its old → new row to `re0-upgrade`'s deprecations, in release order;
   - the shared cross-skill rules (edit-safety, negatives-as-corpus, commit-economy) stay coherent across every copy.

   Report any gap to the human and stop rather than guessing past it.
2. **Classify the bump.** A new skill is minor; a fix or docs-only change is patch; a skill removed with no replacement path is major. Classify an existing skill's enhancement by kind, not size, against its own prior spec: wrong behavior is a fix (patch, including new plumbing that serves only the fix); correct but narrower, or missing a dimension, is a new capability a user newly reaches for (minor). State which case applies, not just the bump.
3. **Taste-test.** Call the Skill tool with "sip" if it is installed and apply its findings. Otherwise run its checks yourself, one Skill tool call each, in this order, applying each one's findings: "shower" to cold-read; "factchk" for a claim or "mandela" for an eval, only when the change carries one; "ssotize" for consistency, auditing first and consolidating only after the human approves; then "re0" to tidy.
4. **Bump** `package.json`'s version to step 2's classification.
5. **Draft the commit message** to commit-economy from the first draft: one bullet per real, durable change, supporting edits folded in; nothing the diff or version already proves; no co-author tags. Match the local log's shape, or, absent one, a subject plus one `-` bullet per change on a single unwrapped line. Rewrite the message as edits develop instead of appending to it. If an existing commit needs cleanup, tell the human to run `/re0-git`; it is user-invoked, so never call it.
6. **First confirmation.** Show the human the bump with its case and the drafted message, and ask for explicit confirmation. Commit only after it; the commit stays local.
7. **Write the release notes** to `.re0/release/RELEASE_NOTES.local.md`, gitignored local scratch that becomes the signed tag's message and never ships as a file. House style:
   - one `##` heading naming the release's durable idea, not the version;
   - one short present-tense paragraph of what is true now;
   - only the sections the release earns: `### New`, `### Also`, `### The catalog (N skills)` only when the roster needs re-mapping, and `### Install` always last, as an indented block carrying the install command from `.agents/install-block.md` verbatim;
   - each externally contributed change credited inline with its PR number and author handle, `(#123, @handle)`;
   - skill names and paths in backticks;
   - nothing the tag or version already proves.
8. **Second confirmation.** Ask the human again, separately, before tagging and pushing, because this step goes public. After it, sign the tag with `git tag -s vX.Y.Z -F .re0/release/RELEASE_NOTES.local.md --cleanup=verbatim`, confirm `git tag -v vX.Y.Z` reports a good signature, push `main`, then push the tag.
9. **Watch the workflow.** Follow the release workflow the tag triggered to completion and report success or the actual failure; never assume it landed. `gh run list --workflow release.yml --branch vX.Y.Z` finds the run, `gh run watch <run-id> --exit-status` follows it, and `gh release view vX.Y.Z` shows whether the notes landed. If it fails, fix the cause and rerun the failed jobs (`gh run rerun <run-id> --failed`); a cause inside the tagged commit means the tag was cut at the wrong target. A tag the author cut wrong (message, signature or target) is deleted and re-cut at the same version, not rolled forward; the version moves on only when a published artifact is wrong. Never finish the workflow's work by hand.
10. **Close out contributions.** After confirmed success, close each external contribution the release landed: whoever reviewed it approves the PR, then closes it with a comment carrying the release notes' credit. A contribution squashed or rebuilt into the release is closed, not merged, so the approval records acceptance rather than rejection. Any collaborator or maintainer with review access may do this.
11. **Retire the cycle**, only after the release workflow succeeded. Move `.re0/iteration/<version>-<workname>/` into `.re0/iteration/completed/<version>-<workname>/`, unrenamed. `.re0/` is gitignored and untracked, so use `mv` (filesystem move), never `git mv`, which fails on an untracked path. Skip this only when the cycle was never planned with `re0-plan` and has no matching iteration folder.

## Rules

- Never invent or assume a CLI command or flag; verify it against official docs or a real run before writing it into a step you will execute.
- The push is the whole manual step. Never perform by hand any step the release workflow owns, publishing or titling the release page included, even to rescue a failed run. Re-cutting the author's own defective tag (step 9) is the one exception, and it is pushed again so the workflow still does the rest. A manual run can look successful while omitting the workflow's signed provenance attestation, title convention, or distribution tag; only comparing with the previous release reveals the loss.
- If the pending diff mixes unrelated concerns, say so and propose a split before drafting a message; a commit message cannot separate the diff.
- Never push before the local version match holds: `package.json` equals the tag about to be created. The CI check is a backstop, not the first defense.
- **negatives-as-corpus**: retirement moves the iteration folder, never deletes it; if the release fails or is rolled back, the folder stays live.
- The human decides at every stop: a checklist gap stops the run (step 1), the commit waits for the first confirmation (step 6), tagging and pushing wait for the second, separate one (step 8), and `ssotize` consolidates only after approval (step 3).

## Verification

Before finishing, confirm and report:

1. `package.json`'s version matches the tag.
2. The commit message reads as a clean handoff without the diff.
3. The release notes follow house style and mention only what the release earns.
4. The workflow the pushed tag triggered completed successfully, confirmed.
5. No workflow-owned step ran by hand, including to rescue a failed run.
6. Each landed external contribution had its PR approved before closing, with the credit comment.
7. The shipped cycle's iteration folder was retired into `.re0/iteration/completed/`, or correctly skipped because none existed.
8. Any skipped step or unresolved gap is reported.
