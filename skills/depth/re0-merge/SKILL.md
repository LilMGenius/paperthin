---
name: re0-merge
disable-model-invocation: true
description: "Review and land an external contribution the way this suite does: gate it against the thesis, land it with the author's credit intact, complete a new skill rather than merging it raw, then approve, credit, and explain before closing."
---

Land a contribution fairly: credit preserved, the maintainer's changes legible, accepted on the record.

## Goal

A review must respect the contribution and its permanent carrying cost. `re0-merge` guides any collaborator or maintainer, not just the author, through judging a pull request against the suite's thesis, landing it by the smallest of three outcomes it needs (as it is, with follow-up commits on its own branch, or carried into a new PR), preserving contributor authorship, keeping maintainer edits in separate commits, and closing with approval and credit.

## Workflow

1. **Gate before landing.** Decline additions by default: the addition must show the suite is worse without it. Judge each PR alone, never as a batch. A bug-fix removes a defect and is the easy yes; tooling earns a place only if it mechanizes a rule already enforced by hand; a new skill must close a real gap no existing skill covers. A well-reasoned decline is a completed outcome.
2. **Cold-read it first.** Before deciding, read the entire contribution as a stranger would, calling the Skill tool with "shower" when it is installed. A name or claim clear to its author may confuse another reader.
3. **Verify, do not re-fix.** Where the author already pushed a fix, prove it with a throwaway regression case rather than rewriting it; the credit for the fix is theirs.
4. **Approve as you accept.** Submit approval when you decide to accept, before landing. This verdict on the contributor's code records the PR as accepted even when it later closes as superseded rather than merged.
5. **Land by the smallest outcome the PR needs:**
   - **As it is.** It is ready, so merge it.
   - **Follow-up commits.** It needs changes the maintainer can make (an update from the base branch, a fix, a test, a rename). Push them onto the contributor's branch as separate maintainer commits, then merge the PR. This needs "allow edits by maintainers" on the PR; when it is off, ask the contributor to turn it on. Prefer this to closing: the PR, its review and its author stay where they started.
   - **Carry.** It needs a rewrite, targets the wrong base branch, or its branch cannot take the maintainer's push. Open a new PR from a maintainer branch (`carry/pr-<n>`) that cherry-picks the contributor's commits with their authorship kept (you become the committer) or, where their code is rewritten, credits them with a `Co-authored-by` trailer. Its body links the original (`Carries #123 by @handle`) and says what differs and why; each maintainer change is a separate commit. Once the carry merges, close the original as superseded with a comment that thanks the author, links the carry, and explains the difference.
6. **Merge on the host by squash**, which keeps the history linear and signed: a host-side rebase merge re-creates every commit without its signature, while a squash commit is signed by the host and authored by the PR's author. An as-is or follow-up PR therefore lands under the contributor's name, and a carry under the maintainer's with the contributor in its `Co-authored-by` trailer. Write the squash subject and body to the repository's commit form at merge time; the PR's commit list keeps the contributor's and the maintainer's commits apart. When a branch commit's message needs cleaning before the merge, tell the user to run `/re0-git` on it.
7. **Complete a new skill before merging.** Give it a plain real word or tight compression as its name, never an opaque coinage; choose the right model- or user-invocation lane and home. Register it on every roster surface (`plugin.json`, the README Index in root and every localized copy, `re0-upgrade`'s Current catalog, `scripts/runtime/catalog.cjs`) so no drift-guard trips.
8. **Comment after the release confirms.** Wait for the release containing the contribution to land, then comment on each landed PR, a superseded original included, with a credit that links the release. Never close silently. Step 4's approval already records acceptance; this step credits and explains.
9. **Credit and explain warmly.** Credit the contribution in the release notes with its original PR number and author handle. If anything was renamed or reframed, the comment thanks the author, explains what changed and why, links the release it shipped in, and credits them for the core idea.

## Rules

- User-invoked on purpose: reviewing and landing a contribution is a deliberate maintainer act, and a review reflex in reach would bias the agent toward merging.
- Default-deny for surface, but decline well: a reason tied to the thesis, the branch kept, never a silent close (negatives-as-corpus).
- Preserve authorship. The contributor authors their commits and the squash commit of their own PR; every maintainer edit is a separate commit under the maintainer's name; a carry keeps the contributor's commits or names them in `Co-authored-by`.
- Land the smallest outcome that fits: as it is before follow-up commits, follow-up commits before a carry. A carry closes its original only as superseded, with a credit comment.
- Approve on acceptance, before landing, separately from the merge and the release comment. Approval judges the contributor's code even if the release later fails. Any collaborator or maintainer with review access can do this.
- Explain every deviation to the author, in their favor. A rename, reframe or carry they did not ask for gets its reason.
- Call the Skill tool with "shower" when it is installed and perform its steps by hand when it is not. `re0-git` and `re0-release` are user-invoked, so this skill never calls them: it tells the user to run `/re0-git` on the message to clean and `/re0-release` for the release to cut.

## Verification

Before finishing:

1. The PR was approved before it merged or was superseded.
2. It landed by the smallest outcome that fits, and the PR record says which and why.
3. Every landed contribution kept its author's credit (the squash commit's author for an as-is or follow-up PR, the kept commits or a `Co-authored-by` trailer for a carry), with maintainer edits as separate commits.
4. The history stayed linear and signed, with a squash message in the repository's commit form.
5. A carried original is closed as superseded with a comment linking the carry, and every landed PR has a credit comment linking the release.
6. A new skill is registered on every roster surface, checks green.
7. Every decline names a thesis-tied reason and keeps its branch.
8. Any rename, reframe or carry was explained to the author.
