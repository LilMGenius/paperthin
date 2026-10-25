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
4. When the restart replaces a repository's main line, preserve the old `main` history on `archive/<YYYYMMDD-HHMMSS>`, named from that tip's own commit time, never the wall clock. Snapshot the gitignored rotating ledgers outside the checkout, including existing `.omo/evidence/*/ROUNDS.md`, `.omo/ulw-execute/ledger.jsonl`, and `.omo/ulw-loop/*/ledger.jsonl`. Where the repository keeps loop state out of every commit, or is public, the snapshot is the ledgers' address and the archive branch is the old tip with no commit of its own. Otherwise copy them back and force-add them only on the archive branch in its final ledger commit before pushing, giving the negative corpus and its ledger one address; reject a tracked ledger under `docs/` because it would make a gitignored working file tracked on the live branch.
5. Prepare the v0 line in the shape the repository's commit contract wants: a separate directory that becomes one root commit, or an orphan branch with one commit per unit where the contract commits per unit. Carry forward only the preserve set and ignore rules, without `.git` or the archive's ledger snapshot. Keep discarded tracked material on the archive branch and move any untracked negative corpus to an archive location before replacing the checkout; never delete it. Choose the snapshot directory, intended remote, and unused temporary orphan branch name, and resolve pending checkout changes, branch collisions, or a remote `main` that differs from the recorded old tip before preparing the handoff. Run `node skills/coil/re0-work/scripts/restart-handoff.mjs --repo <path> (--prepared <directory> | --prepared-branch <ref>) [--remote origin] [--ledger <glob-or-path>] [--snapshot-only] [--snapshot <directory>] [--restart-branch restart-v0] [--archive-message <message>] [--restart-message <message>]` to check preconditions, pass every commit message the handoff makes or hands over through the repository's commit-msg hook, snapshot the enumerated ledgers, and print one POSIX shell handoff block with resolved paths and refs; repeat `--ledger` for additional paths, with exit `0` for a printed block, `2` for failed preconditions, and `1` for usage errors.
6. Review the handoff before executing it: the archive is pushed first, then `main` moves to the v0 line (an orphan root commit renamed `main`, or a compare-and-swap onto the prepared branch) and is pushed with `--force-with-lease=refs/heads/main:<old-tip>`. Commit and push are deliberate human actions, with a STOP immediately before each commit and push command in the block; the skill and script prepare the handoff and execute none of those commands. After the human executes it, the included fresh-clone read-back must find the archive (holding every ledger, or at the old tip when the snapshot holds them) and `main` equal to the prepared line: exactly one commit from a directory, the branch tip from a prepared branch. The v0 root commit names `v0.1.0`, with no tag created. If the lease fails, stop and reconcile the changed remote tip before preparing a new handoff; never retry with an unconditional force-push.
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
5. For a repository restart, the repository's commit-msg hook, where it has one, accepted every message, and the handoff block names the timestamped archive branch, its ledger commit or the snapshot that holds the ledgers, every push, and the clone read-back that checks `main` equals the prepared line; execution results remain unverified until the human runs them.
