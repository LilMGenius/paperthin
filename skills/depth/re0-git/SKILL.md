---
name: re0-git
disable-model-invocation: true
description: "Rewrite a finished commit's message into a clean, handoff-ready form in your own log style, so `git log` alone tells the story. User-invoked: run it after a commit."
---

`re0` for git: rewrite a finished commit message so the log hands off on its own — in the author's own voice, not an imposed one.

## Goal

Repeated amends and momentum commits leave a message bloated, stale, or padded with trivia. `re0-git` applies `re0` to the message: a clean version that lets a fresh session continue from `git log` alone, without reading the diff. It refines what the author already writes. Only the message moves — and timestamps, per the date rule below; the tree never changes.

It is **user-invoked** (see docs/invocation.md) — run it once you've decided to commit. A commit-cleanup tool in the agent's reach would bias it toward committing when it shouldn't.

## Workflow

1. Scope the target — usually `HEAD`, sometimes a short unpushed range.
2. Read the change (`git show --stat`, `git diff`) and any documented commit rules. Then sample nearby non-target messages: start with 10, stop earlier if the convention is obvious, or expand only until the convention is clear.
3. Resolve mixed logs in this order: documented project rules, nearby commits touching the same area, then same-author commits within that convention. Do not average incompatible styles or let one author's habits override the repo.
4. Rewrite the message to the **commit-economy** convention (CLAUDE.md): keep only durable handoff facts, fold supporting edits into the change they serve, and cut anything the diff or tag already proves. Give trivia no bullet of its own.
5. Re-commit signed, dates per the rule below. For the tip (`HEAD`): `git commit --amend -S`. For an older commit, keeping its dates: rebuild it — `GIT_AUTHOR_DATE`/`GIT_COMMITTER_DATE git commit-tree <tree> -p <parent> -S -m "<new message>"` — then replay every descendant onto the rebuilt commit (a non-tip rewrite is a rebase, not a ref move), or you orphan them.
6. Verify and report.

## Rules

- **Never create or suggest a commit** — re0-git only rewrites the message of a commit that already exists. Using it is never a reason to commit.
- **Message only** — the tree must stay byte-identical (`git diff <old> <new>` empty); never edit content in a re0-git pass.
- **Hold the finished message to the commit-economy convention** (CLAUDE.md) — the local log's shape, one bullet per real change, supporting edits folded in, and nothing the diff or version proves. The same bar governs the first draft; re0-git only enforces it on a message that already drifted past it.
- **Dates by position; always gpg-signed.** The commit you're finalizing — `HEAD` — takes both author and committer date = now, because re-cleaning the latest commit is itself continued work. Every older commit (`HEAD~1` and back) keeps its original author + committer dates; never restamp the past.
- **Never rewrite pushed or shared history** without explicit confirmation — it forces a force-push.

## Verification

1. `git diff <old-tip> <new-tip>` is empty — content unchanged.
2. Each rewritten commit is gpg-signed (`%G?` = `G`) with dates as intended.
3. Re-read `git log` alone, diff hidden — if any cut line turns out to be needed to follow the change, restore it.
