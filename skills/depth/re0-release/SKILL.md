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

1. **Check the checklist.** Read the pending diff against every applicable item of the Shipping checklist in the repository root's `AGENTS.md` (its Shipping section) except the version bump and the `sip` run, which steps 2 and 3 own. That section is the authority. Report any gap to the human and stop rather than guessing past it.
2. **Classify the bump.** A new skill is minor; a fix or docs-only change is patch; a skill removed with no replacement path is major. Classify an existing skill's enhancement by kind, not size, against its own prior spec: wrong behavior is a fix (patch, including new plumbing that serves only the fix); correct but narrower, or missing a dimension, is a new capability a user newly reaches for (minor). State which case applies, not just the bump.
3. **Taste-test.** Call the Skill tool with "sip" and apply its findings. When `sip` is not installed, say so and skip this step.
4. **Bump** `package.json`'s version to step 2's classification.
5. **Draft the commit message** to commit-economy from the first draft: one bullet per real, durable change, supporting edits folded in; nothing the diff or version already proves; no co-author tag except a closing `Co-authored-by` trailer that credits a human contributor on a squashed or carried contribution. Match the local log's shape, or, absent one, a subject plus one `-` bullet per change on a single unwrapped line. Rewrite the message as edits develop instead of appending to it. If an existing commit needs cleanup, tell the human to run `/re0-git`; it is user-invoked, so never call it.
6. **First confirmation.** Show the human the bump with its case and the drafted message, and ask for explicit confirmation. Commit only after it; the commit stays local.
7. **Write the release notes** to `.re0/release/RELEASE_NOTES.local.md`, gitignored local scratch that becomes the signed tag's message and never ships as a file. House style:
   - one `##` heading naming the release's durable idea, with no version number (`X.Y.Z`) anywhere in it;
   - one short present-tense paragraph, on one line, of what is true now;
   - only the sections the release earns, in this order: one New section, whose heading may carry a label (`### New` or `### New: <label>`), then `### Also`, then `### The catalog (N skills)` only when the roster needs re-mapping, and `### Install` always;
   - every section but Install holds single-line `-` bullets and nothing else, no lead sentence;
   - each New bullet opens with a bold lead: the skill's name (`` **`name`** ``) or a short label (`**One command.**`);
   - each catalog bullet names a perspective and its skills, plain (`` - `depth/`: `re0`, `shower` ``) or with the perspective bold and described (`` - **`depth/`** (one artifact): `re0` ``), and together they list exactly the N skills the heading counts, each once;
   - `### Install` is the last section: the contents of the `release-notes` block's markdown fence in `.agents/install-block.md`, without the fence lines, or of its `release-notes-0.x` block for a 0.x tag;
   - each externally contributed change credited inline with its PR number and author handle, `(#123, @handle)`, a run of pull requests as `(#123-#125, @handle)`, and each co-author as one more `, @handle` before the closing parenthesis; no other `#` number appears outside code;
   - skill names and paths in backticks, and no em dash;
   - nothing the tag or version already proves.
8. **Check the notes.** From the repository root, run this skill's `scripts/notes.mjs` on them: `node <this skill's folder>/scripts/notes.mjs .re0/release/RELEASE_NOTES.local.md` (in this repository, `skills/depth/re0-release`). It picks the Install block by the version in `package.json`; for a tag cut at another version, such as a re-cut 0.x tag, pass `--version X.Y.Z`, or check the cut tag itself with `--tag vX.Y.Z`. It decides every bullet of step 7 except these, which stay judgment: whether the heading names the release's durable idea, whether the intro is short and present-tense, whether each bold lead is the skill's name or a short label, whether each section earns its place, whether skill names and paths carry backticks, whether every external change carries its credit, whether anything restates what the tag or version proves, and whether the catalog lists the real roster. Exit 0 means the deterministic part holds. Exit 1 names each failure by line: fix the notes, except an `install-block` failure (line 0), which is fixed in `.agents/install-block.md` because its `release-notes` block has drifted from the route blocks. Exit 2 means the check could not run (a usage error, an unreadable notes file, or a repository without `.agents/install-block.md` or the block for the note's era): report the message and that the notes are unchecked, and do not tag until the human decides.
9. **Second confirmation.** Ask the human again, separately, before tagging and pushing, because this step goes public. After it, sign the tag with `git tag -s vX.Y.Z -F .re0/release/RELEASE_NOTES.local.md --cleanup=verbatim`, confirm `git tag -v vX.Y.Z` reports a good signature, push `main`, then push the tag.
10. **Watch the workflow.** Follow the release workflow the tag triggered to completion and report success or the actual failure; never assume it landed. `gh run list --workflow release.yml --branch vX.Y.Z` finds the run, `gh run watch <run-id> --exit-status` follows it, `gh release view vX.Y.Z` shows whether the notes landed, and `gh release view vX.Y.Z --json isDraft --jq .isDraft` must read `false`, so a re-cut never leaves the Release hidden as a draft. If it fails, fix the cause and rerun the failed jobs (`gh run rerun <run-id> --failed`); a cause inside the tagged commit means the tag was cut at the wrong target. A tag the author cut wrong (message, signature or target) is deleted and re-cut at the same version, not rolled forward; the version moves on only when a published artifact is wrong. A pushed re-cut runs the workflow of the tag's own commit: the current one skips `npm publish` for a version already published and rewrites the Release body as a published Release; a tag older than the notes check runs a workflow without it, so step 8 is its only gate; one older than the publish skip fails at publish and leaves its Release body as it was; one older than the workflow itself runs nothing. Never finish the workflow's work by hand.
11. **Close out contributions.** After confirmed success, close each external contribution the release landed: whoever reviewed it approves the PR, then closes it with a comment carrying the release notes' credit. A contribution squashed or rebuilt into the release is closed, not merged, so the approval records acceptance rather than rejection. Any collaborator or maintainer with review access may do this.
12. **Retire the cycle**, only after the release workflow succeeded. Move `.re0/iteration/active/<version>-<workname>/` into `.re0/iteration/completed/<version>-<workname>/`, unrenamed. `.re0/` is gitignored and untracked, so use `mv` (filesystem move), never `git mv`, which fails on an untracked path. Skip this only when the cycle was never planned with `re0-plan` and has no matching iteration folder.

## Rules

- Never invent or assume a CLI command or flag; verify it against official docs or a real run before writing it into a step you will execute.
- The push is the whole manual step. Never perform by hand any step the release workflow owns, publishing or titling the release page included, even to rescue a failed run. Re-cutting the author's own defective tag (step 10) is the one exception, and it is pushed again so the workflow still does the rest. A manual run can look successful while omitting the workflow's signed provenance attestation, title convention, or distribution tag; only comparing with the previous release reveals the loss.
- If the pending diff mixes unrelated concerns, say so and propose a split before drafting a message; a commit message cannot separate the diff.
- Never push before the local version match holds: `package.json` equals the tag about to be created. The CI check is a backstop, not the first defense.
- Earlier tags are history, not precedent. A note follows step 7 and passes `notes.mjs` whatever the nearest tag did, and a convention read off an earlier note is checked against step 7 before it is applied.
- The signed tag's message is the note's source and the GitHub Release body is a copy the workflow writes from it. A note fixed after tagging is fixed by re-cutting the tag (step 10), since a Release body edited alone is overwritten by the next workflow run.
- The release workflow runs `notes.mjs` on the pushed tag's message before it publishes, as a backstop to step 8: a note that fails there stops the release, and the fix is a re-cut tag.
- **negatives-as-corpus**: retirement moves the iteration folder, never deletes it; if the release fails or is rolled back, the folder stays live.
- The human decides at every stop: a checklist gap stops the run (step 1), the commit waits for the first confirmation (step 6), tagging and pushing wait for the second, separate one (step 9), and `ssotize` consolidates only after approval (step 3).

## Verification

Before finishing, confirm and report:

1. `package.json`'s version matches the tag.
2. The commit message reads as a clean handoff without the diff.
3. `notes.mjs` exited 0 on the release notes, and they mention only what the release earns.
4. The workflow the pushed tag triggered completed successfully, confirmed.
5. No workflow-owned step ran by hand, including to rescue a failed run.
6. Each landed external contribution had its PR approved before closing, with the credit comment.
7. The shipped cycle's iteration folder was moved from `active/` into `.re0/iteration/completed/`, or correctly skipped because none existed.
8. Any skipped step or unresolved gap is reported.
