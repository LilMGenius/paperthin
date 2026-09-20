---
name: re0-git
disable-model-invocation: true
description: "Rewrite a finished commit's message into a clean, handoff-ready form in your own log style, so `git log` alone tells the story. User-invoked: run it after a commit."
---

Rewrite a finished commit message so the log supports handoff in the author's voice.

## Goal

Repeated amends and momentum commits leave messages bloated, stale, or padded with trivia. `re0-git` refines the author's message so a fresh session can continue from `git log` alone, without the diff. Only the message and timestamps change, with timestamps governed by the date rule below. The tree never changes.

It is **user-invoked**: run it once you've decided to commit. Giving an agent autonomous access to commit cleanup would bias it toward committing when it shouldn't.

## Workflow

1. Scope the target: usually `HEAD`, sometimes a short unpushed range.
2. Read the change (`git show --stat`, `git diff`) and any documented commit rules. Then sample nearby non-target messages: start with 10, stop earlier if the convention is obvious, or expand only until the convention is clear.
3. Resolve mixed logs in this order: documented project rules, nearby commits touching the same area, then same-author commits within that convention. Do not average incompatible styles or let one author's habits override the repo.
4. Rewrite to the **commit-economy** below: keep durable handoff facts, fold supporting edits into the change they serve, and cut what the diff or tag already proves. Give trivia no bullet of its own.
5. Re-commit signed, following the date rule below. For the tip (`HEAD`): `git commit --amend -S --date=now`. The `--date=now` moves the author date to now; a bare `--amend` resets only the committer date. For an older commit, preserve its dates when rebuilding it: `GIT_AUTHOR_DATE`/`GIT_COMMITTER_DATE git commit-tree <tree> -p <parent> -S -m "<new message>"`. Then replay every descendant onto the rebuilt commit. A non-tip rewrite is a rebase; moving only the ref orphans the descendants.
6. Verify and report.

## Rules

- **Never create or suggest a commit.** `re0-git` rewrites only an existing commit's message. Using it is never a reason to commit.
- **Message only:** keep the tree byte-identical (`git diff <old> <new>` empty). Never edit content in a `re0-git` pass.
- **commit-economy:** use one bullet per real, durable change, folding in supporting edits. Omit what the diff or version already proves and all co-author tags. Match the local log's sampled shape. If none is settled, use a subject line, a blank line, then one `-` bullet per change on a single unwrapped line, never prose paragraphs. A required checklist step, such as registering a new skill or syncing translations after a source edit, proves the process ran. Fold it into the bullet it serves as a trailing clause, or omit it if that bullet already implies it. Give it a separate bullet only when *how* it was done is itself non-obvious. This standard also governs first drafts; `re0-git` enforces it on existing messages that have drifted.
- **Dates by position; always gpg-signed.** Set both author and committer dates to now for `HEAD`, because cleaning the latest commit continues that work. Keep both original dates for every older commit (`HEAD~1` and back); never restamp the past.
- **Never rewrite pushed or shared history** without explicit confirmation; it forces a force-push.

## Verification

1. `git diff <old-tip> <new-tip>` is empty; content is unchanged.
2. Each rewritten commit is gpg-signed (`%G?` = `G`) with dates as intended.
3. Re-read `git log` with the diff hidden. Restore any cut line needed to follow the change.
