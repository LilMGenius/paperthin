---
name: re0-git
disable-model-invocation: true
description: "Rewrite a finished commit's message into a clean, handoff-ready form in your own log style, and place a late commit in time order on a linear history, so `git log` alone tells the story. User-invoked: run it once you've decided to commit."
---

Rewrite a finished commit message so the log supports handoff in the author's voice and reads in the order the work happened.

## Goal

Repeated amends and momentum commits leave messages bloated, stale, or padded with trivia, and a change committed late lands out of time order. `re0-git` refines the author's message so a fresh session can continue from `git log` alone, without the diff. It changes only messages and where a late commit sits; content and every date already written stay put.

It is **user-invoked**: run it once you've decided to commit. Giving an agent autonomous access to commit cleanup would bias it toward committing when it shouldn't.

## Workflow

1. Scope the target: usually `HEAD`, sometimes a short unpushed range, or a late change the human decided to commit.
2. Read the change (`git show --stat`, `git diff`), then the commit convention the repository documents (`AGENTS.md`, `CONTRIBUTING.md`, or its equivalent) and the log it describes: `git log -20` and `git log -5 -- <changed-paths>`, bodies as well as subjects. Read them on every run, before drafting; a convention remembered from another repository or an earlier session is not a reading.
3. Resolve mixed logs in this order: documented project rules, nearby commits touching the same area, then same-author commits within that convention. Do not average incompatible styles or let one author's habits override the repo. If no convention is documented, report the one the sample shows (subject form, scope, language, body shape) and propose it for the contributor guide as a separate change the human commits.
4. Rewrite to the **commit-economy** below: keep durable handoff facts, fold supporting edits into the change they serve, and cut what the diff or tag already proves. Give trivia no bullet of its own. Then set the draft beside the nearest non-target commits of the same type, fix every difference in form, and run the repository's message checker if it has one.
5. Re-commit following the date rule below. For your own tip (`HEAD`): `GIT_COMMITTER_DATE="$(git log -1 --format=%cd --date=raw)" git commit --amend -S -F <message-file>`; `--amend` keeps the author, and the variable keeps the committer date from moving to now. Any other rewrite rebuilds the target and then each descendant, oldest first, on its own tree with `git commit-tree <tree> -p <new-parent> -F <message-file>`, the new message for the target and its own for each descendant, run under that commit's own `GIT_AUTHOR_NAME`, `GIT_AUTHOR_EMAIL`, `GIT_AUTHOR_DATE`, `GIT_COMMITTER_NAME`, `GIT_COMMITTER_EMAIL` and `GIT_COMMITTER_DATE` (`git log -1 --date=raw --format=%an%n%ae%n%ad%n%cn%n%ce%n%cd <commit>` prints them) and with `-S` only where you are the committer, then moves the branch to the last one. `git rebase` cannot replay them: it makes you the committer of every commit and restamps each committer date to now, and `--committer-date-is-author-date` erases the gap between the two dates instead. Moving only the ref orphans the descendants.
6. Place a late commit by time. Date it at the newest modification time among the files it changes, read before a stash, checkout, or rebase rewrites them; if those times were already reset, ask the human for the time. Build it on the last commit dated at or before that time and rebuild the later commits as in step 5, each on the tree its own diff makes over its new parent (`git merge-tree --write-tree --merge-base=<old-parent> <new-parent> <commit>` prints it).
7. Verify and report.

## Rules

- **Never create or suggest a commit.** `re0-git` works only on commits the human already decided: rewriting a message or placing a late commit. Using it is never a reason to commit.
- **Content stays put:** a message rewrite keeps the tree byte-identical (`git diff <old> <new>` empty); a placed late commit carries exactly its own diff, and every later commit keeps its own. Never edit content in a `re0-git` pass.
- **commit-economy:** use one bullet per real, durable change, folding in supporting edits. Omit what the diff or version already proves and all co-author tags. Match the local log's sampled shape. If none is settled, use a subject line, a blank line, then one `-` bullet per change on a single unwrapped line, never prose paragraphs. A required checklist step, such as registering a new skill or syncing translations after a source edit, proves the process ran. Fold it into the bullet it serves as a trailing clause, or omit it if that bullet already implies it. Give it a separate bullet only when *how* it was done is itself non-obvious. This standard also governs first drafts; `re0-git` enforces it on existing messages that have drifted.
- **Original dates and people; signed.** A rewritten commit keeps its author, its committer and both of their dates, `HEAD` included: a message edit changes neither when the work was done nor when it landed, so never restamp the past. A gap between the two dates records a rebase, a cherry-pick or a later push and is not a defect; no check reads it, and no commit is rewritten or moved to close one. A late commit takes the time its work was done as both dates. Sign every commit you are the committer of; one someone else committed stays theirs and unsigned, since your signature would claim it.
- **Linear.** Never create a merge commit. A late commit goes where its time falls, and every other commit keeps its place.
- **Never rewrite pushed or shared history** without explicit confirmation; it forces a force-push. Placing a late commit behind a pushed commit is such a rewrite.

## Verification

1. `git diff <old-tip> <new-tip>` is empty after a message rewrite or a moved commit, and exactly the late change after placing an uncommitted one.
2. `git log --reverse --date=raw --format='%an %ae %ad %cn %ce %cd'` prints the old range's lines unchanged and in order over the new range, with one more line for each placed commit carrying the time its work was done as both dates, and each commit you are the committer of is signed (`%G?` = `G`).
3. Over the rewritten range, `git log --merges` is empty, and a placed commit is dated no earlier than its parent's committer date.
4. The documented convention and the sampled log were read on this run, each message matches the nearest same-type commits in form, and any repository message checker passes.
5. Re-read `git log` with the diff hidden. Restore any cut line needed to follow the change.
