---
name: re0-work
description: "Restart a project or artifact from v0 while preserving only proven lessons, contracts, gates, vocabulary, real-surface tests, and negative corpus. Use when the foundation is wrong, accumulated code is misleading progress, or a new pass should learn from the old one without inheriting its accidental architecture."
---

Restart from what the previous cycle proved.

## Goal

Keep proven contracts, schemas, vocabulary, real-surface tests, quality gates, and negative corpus. Leave behind accidental architecture, scaffold, explanatory UI, debug panels, shallow generated content, and code whose only value was learning what not to do.

## Workflow

1. Read the current plan, lessons or re0-memo notes, local domain notes, QA evidence, and the user complaint that triggered the restart, if any.
2. Judge the restart's scope from several independent reads of the old work, such as reviewers on different models or with different briefs, each reading it cold, and decide it per layer: a layer whose responsibilities sit in the wrong places restarts, while a layer that proved itself carries forward verbatim. Before reading an outcome of zero as a code fact, check whether any input reached the step; a step nothing reached says nothing about its code.
3. Identify what to preserve: contracts, schemas that survived QA, quality gates, vocabulary, reusable services, real-surface tests, and negative corpus.
4. Identify what to discard: explanatory UI, debug panels, scaffold, shallow generated content, accidental abstractions, and code whose only value was learning what not to do. A module the brief mandates is never discarded because nothing has run it yet; it carries forward with the phase that first exercises it. When the mechanism behind a mandated requirement is blocked, discard the mechanism and plan another; the requirement stays until its owner removes it.
5. When the system being restarted runs live (a service, a deployment, a scheduled job), build v0 beside it on its own orphan branch and worktree. The old line takes only the fixes the live service needs, each mirrored into the v0 plan. v0 takes over only after a rehearsal on a copy of the live data, a data migration the old code can still open, and a rollback drill that moves the main line back and forward again, all inside a window where the service can afford a missed run.
6. When the restart replaces a repository's main line, preserve the old `main` history on `archive/<YYYYMMDD-HHMMSS>`, named from that tip's own commit time, never the wall clock. Snapshot the gitignored rotating ledgers outside the checkout, including existing `.omo/evidence/*/ROUNDS.md`, `.omo/ulw-execute/ledger.jsonl`, and `.omo/ulw-loop/*/ledger.jsonl`. Where the repository keeps loop state out of every commit, or is public, the snapshot is the ledgers' address and the archive branch is the old tip with no commit of its own (`--snapshot-only`). Otherwise copy them back and force-add them only on the archive branch in its final ledger commit before pushing, giving the negative corpus and its ledger one address; reject a tracked ledger under `docs/` because it would make a gitignored working file tracked on the live branch.
7. Prepare the v0 line in the shape the repository's commit contract wants: a separate directory that becomes one root commit (`--prepared`), or an orphan branch with one commit per unit (`--prepared-branch`) where the contract commits per unit. Carry forward only the preserve set and ignore rules, without `.git` or the archive's ledger snapshot. Keep discarded tracked material on the archive branch and move any untracked negative corpus to an archive location before replacing the checkout; never delete it. Choose the snapshot directory, intended remote, and unused temporary orphan branch name, and resolve pending checkout changes, branch collisions, or a remote `main` that differs from the recorded old tip before preparing the handoff. Run `node skills/coil/re0-work/scripts/restart-handoff.mjs --repo <path> (--prepared <directory> | --prepared-branch <ref>) [--remote origin] [--ledger <glob-or-path>] [--snapshot-only] [--snapshot <directory>] [--restart-branch restart-v0] [--archive-message <message>] [--restart-message <message>]` to check preconditions, pass every commit message the handoff makes or hands over through the repository's commit-msg hook, snapshot the enumerated ledgers, and print one POSIX shell handoff block with resolved paths and refs; repeat `--ledger` for additional paths, with exit `0` for a printed block, `2` for failed preconditions, and `1` for usage errors.
8. Review the handoff before executing it: the archive is pushed first, then `main` moves to the v0 line (an orphan root commit renamed `main`, or a compare-and-swap onto the prepared branch) and is pushed with `--force-with-lease=refs/heads/main:<old-tip>`. Commit and push are deliberate human actions, with a STOP immediately before each commit and push command in the block; the skill and script prepare the handoff and execute none of those commands. After the human executes it, the included fresh-clone read-back must find the archive (holding every ledger, or at the old tip when the snapshot holds them) and `main` equal to the prepared line: exactly one commit from a directory, the branch tip from a prepared branch. The v0 root commit names `v0.1.0`, with no tag created. If the lease fails, stop and reconcile the changed remote tip before preparing a new handoff; never retry with an unconditional force-push.
9. Name the first quality gate before planning code, one the restart can clear on its own, such as a replay of the whole loop end to end. A gate that waits on an outside event (real demand, a login, a third party's review) becomes an acceptance criterion tracked beside the plan, never the gate the first loop must clear.
10. Write a v0 skeleton plan with one complete vertical loop.
11. Build only the first loop until it clears the gate.

## Rules

- Starting from scratch means no copy-forward unless the artifact earned it.
- One complete vertical loop beats many shallow surfaces.
- Preserve provenance in local docs, not in the shipped product.
- Do not rebuild around a vague lesson. Turn it into a gate or leave it out.
- Do not delete negative corpus; archive or reference it where the next cycle will see it.
- If a reusable module survives, name the contract that proved it survives.
- The skill prepares and prints the archive and restart commands; it never runs a commit or push.
- A STOP stands until the human waives it with an approval they state; an agent that then runs the commands records that approval beside them, and never waives a STOP on its own reading.

## Verification

Before finishing:

1. The preserve/discard split is explicit, rests on independent reads, and is decided per layer; no mandated module is discarded for being unexercised.
2. The new v0 plan has one complete vertical loop and a named first gate the restart can clear without an outside event.
3. No old architecture is copied forward merely because it exists.
4. A fresh builder can start without rereading the failed codebase.
5. For a live system, the rehearsal, the migration the old code can open, and the rollback drill are planned before the takeover.
6. For a repository restart, the repository's commit-msg hook, where it has one, accepted every message, and the handoff block names the timestamped archive branch, its ledger commit or the snapshot that holds the ledgers, every push, and the clone read-back that checks `main` equals the prepared line; execution results remain unverified until the human runs them.

