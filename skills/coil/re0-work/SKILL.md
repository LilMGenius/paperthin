---
name: re0-work
description: "Restart a project or artifact from v0 while preserving only proven lessons, contracts, gates, vocabulary, real-surface tests, and negative corpus. Use when the foundation is wrong, accumulated code is misleading progress, or a new pass should learn from the old one without inheriting its accidental architecture."
---

Restart from what the previous cycle proved.

## Goal

Keep proven contracts, schemas, vocabulary, real-surface tests, quality gates, and negative corpus. Leave behind accidental architecture, scaffold, explanatory UI, debug panels, shallow generated content, and code whose only value was learning what not to do.

## Workflow

1. Read the current plan, lessons or re0-memo notes, local domain notes, QA evidence, and the user complaint that triggered the restart, if any.
2. Identify what to preserve: contracts, schemas that survived QA, quality gates, vocabulary, reusable services, real-surface tests, and negative corpus.
3. Identify what to discard: explanatory UI, debug panels, scaffold, shallow generated content, accidental abstractions, and code whose only value was learning what not to do.
4. When the restart replaces a repository's main line, preserve the old `main` history on `archive/<YYYYMMDD-HHMMSS>`, named from that tip's own commit time, never the wall clock. Snapshot the gitignored rotating ledgers outside the checkout, including existing `.omo/evidence/*/ROUNDS.md`, `.omo/ulw-execute/ledger.jsonl`, and `.omo/ulw-loop/*/ledger.jsonl`. Copy them back to their original paths and force-add them only on the archive branch in its final ledger commit before pushing, giving the negative corpus and its ledger one address; reject a tracked ledger under `docs/` because it would make a gitignored working file tracked on the live branch.
5. Prepare the new v0 tree in a separate directory, carrying forward only the preserve set and ignore rules, without `.git` or the archive's ledger snapshot. Keep discarded tracked material on the archive branch and move any untracked negative corpus to an archive location before replacing the checkout; never delete it. Choose the snapshot directory, intended remote, and unused temporary orphan branch name, and resolve pending checkout changes, branch collisions, or a remote `main` that differs from the recorded old tip before preparing the handoff. Run `node skills/coil/re0-work/scripts/restart-handoff.mjs --repo <path> --prepared <directory> [--remote origin] [--ledger <glob-or-path>] [--restart-branch restart-v0] [--snapshot <directory>]` to check preconditions, snapshot the enumerated ledgers, and print one POSIX shell handoff block with resolved paths and refs; repeat `--ledger` for additional paths, with exit `0` for a printed block, `2` for failed preconditions, and `1` for usage errors.
6. Review the handoff before executing it: archive the ledger and push the archive first, then create the prepared v0 tree as an orphan root, rename it `main`, and push with `--force-with-lease=refs/heads/main:<old-tip>`. Commit and push are deliberate human actions, with a STOP immediately before each of the four commit/push commands; the skill and script prepare the handoff and execute none of those commands. After the human executes it, the included fresh-clone read-back must retrieve every ledger from the archive tip and `git rev-list --count main` must report `1`; the new commit's subject names `v0.1.0`, with no tag created. If the lease fails, stop and reconcile the changed remote tip before preparing a new handoff; never retry with an unconditional force-push.
7. Name the first quality gate before planning code.
8. Write a v0 skeleton plan with one complete vertical loop.
9. Build only the first loop until it clears the gate.

## Rules

- Starting from scratch means no copy-forward unless the artifact earned it.
- One complete vertical loop beats many shallow surfaces.
- Preserve provenance in local docs, not in the shipped product.
- Do not rebuild around a vague lesson. Turn it into a gate or leave it out.
- Do not delete negative corpus; archive or reference it where the next cycle will see it.
- If a reusable module survives, name the contract that proved it survives.
- The skill prepares and prints the archive and restart commands; it never runs a commit or push.

## Verification

Before finishing:

1. The preserve/discard split is explicit and evidence-backed.
2. The new v0 plan has one complete vertical loop and a named first gate.
3. No old architecture is copied forward merely because it exists.
4. A fresh builder can start without rereading the failed codebase.
5. For a repository restart, the handoff block names the timestamped archive branch, its final ledger commit and both pushes, and includes the clone read-back and the check that main's new history is exactly one commit; execution results remain unverified until the human runs them.
