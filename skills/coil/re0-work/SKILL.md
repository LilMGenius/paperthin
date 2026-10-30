---
name: re0-work
description: "Restart a project or artifact from v0 while preserving only proven lessons, contracts, gates, vocabulary, real-surface tests, and negative corpus. Use when the foundation is wrong, accumulated code is misleading progress, or a new pass should learn from the old one without inheriting its accidental architecture."
---

Restart a project or artifact at v0, carrying forward only what the previous cycle proved.

## Goal

Restart from what the previous cycle proved. Keep the proven contracts, schemas, vocabulary, real-surface tests, quality gates and negative corpus. Leave behind accidental architecture, scaffold, explanatory UI, debug panels, shallow generated content, and code whose only value was learning what not to do. Reach for it when the foundation is wrong, accumulated code is misleading progress, or a new pass should learn from the old one without inheriting its accidental architecture.

## Workflow

1. Read the re0-memo of the cycle being replaced, then the current plan, local domain notes, QA evidence, and the user complaint that triggered the restart, if any. A restart with no memo measuring where the old cycle stands stops here and asks for one, since a restart aimed without that measurement repeats the old plan's picture of itself.
2. Judge restart scope from several independent cold reads of the old work (for example reviewers on different models or with different briefs), and decide it per layer: a layer whose responsibilities sit in the wrong places restarts; a layer that proved itself carries forward verbatim. Before reading an outcome of zero as a fact about the code, check whether any input reached that step; a step nothing reached says nothing about its code. Scope is cut in time as well: when a span of work ran without the harness, hook or gate it depends on, every commit from the one where that gap began is rebuilt and the work before it is kept, however finished the later commits look, and the restart names that commit with the evidence of the gap.
3. Name what to preserve: contracts, schemas that survived QA, quality gates, vocabulary, reusable services, real-surface tests, negative corpus.
4. Name what to discard: explanatory UI, debug panels, scaffold, shallow generated content, accidental abstractions, code whose only value was learning what not to do. A module the brief mandates is never discarded for being unexercised; it carries forward with the phase that first exercises it. When the mechanism behind a mandated requirement is blocked, discard the mechanism and plan another; the requirement stays until its owner removes it.
5. For a live system (a service, deployment or scheduled job), build v0 beside it on its own orphan branch and worktree. The old line takes only the fixes the live service needs, each mirrored into the v0 plan. v0 takes over only after a rehearsal on a copy of live data, a data migration the old code can still open, and a rollback drill that moves the main line back and forward again, all inside a window where the service can afford a missed run.
6. To replace a repository's main line, preserve the old main history on the archive branch `archive/<YYYYMMDD-HHMMSS>`, named from the old tip's own commit time, never the wall clock. Snapshot the gitignored rotating ledgers outside the checkout: the script's defaults are the paths one loop harness writes (`.omo/evidence/*/ROUNDS.md`, `.omo/ulw-execute/ledger.jsonl` and `.omo/ulw-loop/*/ledger.jsonl`), and `--ledger` adds the ones this repository keeps. Where the repository keeps loop state out of every commit, or is public, the snapshot is the ledgers' address and the archive branch is the old tip with no commit of its own (`--snapshot-only`). Otherwise copy the snapshot back into the checkout while the archive branch is checked out and force-add it there, in that branch's final ledger commit before pushing, so negative corpus and ledger share one address. Reject a tracked ledger under `docs/`, since it would make a gitignored working file tracked on the live branch.
7. Prepare the v0 line in the shape the repository's commit contract wants: a separate directory that becomes one root commit (`--prepared`), or, where the contract commits per unit, an orphan branch with one commit per unit (`--prepared-branch`). Carry forward only the preserve set and the ignore rules, without `.git` or the archive's ledger snapshot. Keep discarded tracked material on the archive branch; move any untracked negative corpus to an archive location before replacing the checkout, and never delete it. Choose the snapshot directory, the intended remote and an unused temporary orphan branch name, and resolve pending checkout changes, branch collisions, or a remote main that differs from the recorded old tip before preparing the handoff. Then run, from this skill's folder:

   `node scripts/restart-handoff.mjs --repo <path> (--prepared <directory> | --prepared-branch <ref>) [--remote origin] [--ledger <glob-or-path>] [--snapshot-only] [--snapshot <directory>] [--restart-branch restart-v0] [--archive-message <message>] [--restart-message <message>]`

   It checks preconditions, passes every commit message the handoff makes or hands over through the repository's commit-msg hook, snapshots the enumerated ledgers, and prints one POSIX shell handoff block with resolved paths and refs. Repeat `--ledger` for extra paths. Script exit codes: 0 printed block, 2 failed preconditions, 1 usage errors; a run that exits 2 stops on its failed preconditions.
8. Review the handoff block before anyone executes it. The archive is pushed first; then main moves to the v0 line (an orphan root commit renamed main, or a compare-and-swap onto the prepared branch) and is pushed with `--force-with-lease=refs/heads/main:<old-tip>`. Commit and push are deliberate human actions: the block carries a STOP immediately before each commit and push command, and neither the skill nor the script executes any of them. After the human runs it, the included fresh-clone read-back must find the archive (holding every ledger, or at the old tip when the snapshot holds them) and main equal to the prepared line: exactly one commit from a directory, the branch tip from a prepared branch. The v0 root commit's message names `v0.1.0`; no tag is created. If the lease fails, stop and reconcile the changed remote tip before preparing a new handoff; never retry with an unconditional force-push.
9. Name the first quality gate before planning code: one the restart can clear on its own, such as a replay of the whole loop end to end. A gate waiting on an outside event (real demand, a login, a third party's review) becomes an acceptance criterion tracked beside the plan, never the gate the first loop must clear.
10. Write a v0 skeleton plan with one complete vertical loop.
11. Build only that first loop until it clears the gate.

## Rules

- Starting over means no copy-forward unless the artifact earned it.
- One complete vertical loop beats many shallow surfaces.
- Provenance lives in local docs, not in the shipped product.
- Do not rebuild around a vague lesson; turn it into a gate or leave it out.
- Never delete negative corpus; archive or reference it where the next cycle will see it.
- A surviving reusable module names the contract that proved it survives.
- The skill prepares and prints the archive and restart commands; it never runs a commit or push. Both belong to the human.
- A STOP stands until the human waives it with an approval they state; an agent that then runs the commands records that approval beside them, and never waives a STOP on its own reading.
- This skill invokes no other skill; re0-memo notes are input it reads.

## Verification

Before finishing:

1. The preserve/discard split is explicit, rests on independent reads and is decided per layer; no mandated module was discarded for being unexercised.
2. The v0 plan has one complete vertical loop and a named first gate the restart can clear without an outside event.
3. No old architecture was copied forward merely because it exists.
4. A fresh builder can start without rereading the failed codebase.
5. Live system: the rehearsal, a migration the old code can open, and the rollback drill are planned before takeover.
6. Repository restart: the commit-msg hook, where one exists, accepted every message; the handoff block names the timestamped archive branch, its ledger commit or the snapshot holding the ledgers, every push, and the clone read-back checking main equals the prepared line. Report execution results as unverified until the human runs them.
