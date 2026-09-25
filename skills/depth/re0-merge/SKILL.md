---
name: re0-merge
disable-model-invocation: true
description: "Review and land an external contribution the way this suite does: gate it against the thesis, land it with the author's credit intact, complete a new skill rather than merging it raw, then approve, credit, and explain before closing. Use when reviewing a pull request, as any collaborator or maintainer, not only the author."
---

Land a contribution fairly: credit preserved, the maintainer's changes legible, accepted on the record.

## Goal

A review must respect the contribution and its permanent carrying cost. `re0-merge` guides any collaborator or maintainer, not just the author, through judging a pull request against the suite's thesis, preserving contributor authorship, keeping maintainer edits in separate commits, and closing with approval and credit.

## Workflow

1. **Gate before landing.** Decline additions by default: the addition must show the suite is worse without it. Judge each PR alone, never as a batch. A bug-fix removes a defect and is the easy yes; tooling earns a place only if it mechanizes a rule already enforced by hand; a new skill must close a real gap no existing skill covers. A well-reasoned decline is a completed outcome.
2. **Cold-read it first.** Before deciding, read the entire contribution as a stranger would, using `shower` when installed. A name or claim clear to its author may confuse another reader.
3. **Verify, do not re-fix.** Where the author already pushed a fix, prove it with a throwaway regression case rather than rewriting it; the credit for the fix is theirs.
4. **Approve as you accept, then land on a `land/pr-<n>` branch** (a range only for a genuine multi-PR batch). Submit approval when you decide to accept, before landing. This verdict on the contributor's code records a closed-not-merged PR as accepted without waiting for release or closure. Preserve each contributor commit's authorship, becoming its committer, and hand each message to the human to clean with `re0-git`. Make each maintainer change a separate commit to keep credit legible, then fast-forward into `main`.
5. **Complete a new skill before merging.** Give it a plain real word or tight compression as its name, never an opaque coinage; choose the right model- or user-invocation lane and home. Register it on every roster surface (`plugin.json`, the README Index in root and every localized copy, `re0-upgrade`'s Current catalog, `scripts/runtime/catalog.cjs`) so no drift-guard trips.
6. **Close with a comment after the release confirms.** Wait for the release containing the contribution to land, then close the PR together with a comment that credits and explains. Never close silently. Step 4's approval already records acceptance; this step closes and explains.
7. **Credit and explain warmly.** Credit the contribution in the release notes with its PR number and author handle. If anything was renamed or reframed, the closing comment thanks the author, explains what changed and why, links the release it shipped in, and credits them for the core idea.

## Rules

- Default-deny for surface, but decline well: a reason tied to the thesis, the branch kept, never a silent close (negatives-as-corpus).
- Preserve authorship. The contributor authors their commit; every maintainer edit is a separate commit under the maintainer's name.
- Approve on acceptance, before landing, separately from closing after release. Approval judges the contributor's code even if the release later fails. Any collaborator or maintainer with review access can do this.
- Explain every deviation to the author, in their favor. A rename or reframe they did not ask for gets its reason.
- Run `shower` when it is installed and perform its steps by hand when it is not. `re0-git` and `re0-release` are user-invoked, so this skill never runs them: it names the message to clean and the release to cut, and the human runs each one.

## Verification

Before finishing:

1. Every landed contribution kept its author's authorship, with maintainer edits as separate commits.
2. The PR was approved before it was closed, and closed with a credit comment.
3. A new skill is registered on every roster surface, checks green.
4. Every decline names a thesis-tied reason and keeps its branch.
5. Any rename or reframe was explained to the author.
