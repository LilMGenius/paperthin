---
name: re0-merge
disable-model-invocation: true
description: "Review and land an external contribution the way this suite does: gate it against the thesis, land it with the author's credit intact, complete a new skill rather than merging it raw, then approve, credit, and explain before closing. Use when reviewing a pull request, as any collaborator or maintainer, not only the author."
---

Land a contribution fairly: credit preserved, the maintainer's changes legible, accepted on the record.

## Goal

A contribution is a gift with a permanent carrying cost, and a review either honors both or fails one. `re0-merge` walks whoever reviews — any collaborator or maintainer, not just the author — through accepting a pull request the way this suite does: judged against the thesis, landed with the author's authorship intact, the maintainer's own edits kept as separate commits, and closed with an approval and a credit rather than a silent rejection.

## Workflow

1. **Gate before landing.** An additive contribution is declined by default; the burden is on the addition to show the suite is worse without it, not on you to justify a no. Judge each PR alone, never as a batch: a bug-fix subtracts a defect and is the easy yes; new tooling earns a place only if it mechanizes a rule already enforced by hand; a new skill lands only if it closes a real gap no existing one covers. A well-reasoned decline is a shipped outcome, not a failure.
2. **Cold-read it first.** Read the contribution end to end with fresh eyes (a `shower` pass when installed) before deciding; a name or claim that reads clean to its author may not to a stranger.
3. **Verify, do not re-fix.** Where the author already pushed a fix, prove it with a throwaway regression case rather than rewriting it; the credit for the fix is theirs.
4. **Approve as you accept, then land on a `land/pr-<n>` branch** (a range only for a genuine multi-PR batch). Submit the approving review the moment you decide to accept, before the land — it is a verdict on the contributor's code, not a receipt for a release, and giving it now (not bundled with the later close) is what keeps a closed-not-merged PR reading as accepted. Then accept each contributor commit with its authorship preserved (you become the committer; clean the message with `re0-git`), add every maintainer change as its own separate commit so the credit split stays legible, and fast-forward into `main`.
5. **Complete a new skill, don't merge it raw.** Get the name right (a plain real word or tight compression, no opaque coinage), the invocation right (model- vs user-invoked), and the home right; then register it on every roster surface (`plugin.json`, the README Index in root and every localized copy, `re0-upgrade`'s Current catalog, `scripts/catalog.cjs`) so no drift-guard trips.
6. **After the release the contribution shipped in confirms, close the PR with the comment.** Close it in the same motion as a comment that credits and explains — never a silent close, and never before the release lands. The approval from step 4 already records it as accepted; this step only closes and explains.
7. **The comment credits and explains, warmly.** Shout the contribution out in the release notes with its PR number and author handle; and if you renamed or reframed anything, the closing comment thanks the author, says what changed and why, points at the release it shipped in, and hands the credit for the core idea back to them.

## Rules

- Default-deny for surface, but decline well: a reason tied to the thesis, the branch kept, never a silent close (negatives-as-corpus).
- Preserve authorship. The contributor authors their commit; every maintainer edit is a separate commit under the maintainer's name.
- Approve as you accept, before the land — not bundled with the close after the release. The approval is a verdict on the contributor's code, not a receipt for a release that could fail. Any collaborator or maintainer with review access does this, not one fixed reviewer.
- Explain every deviation to the author, in their favor. A rename or reframe they did not ask for gets its reason.
- Reviewer-agnostic and self-degrading: run whatever pipeline skills are installed (`shower`, `re0-git`, `re0-release`), and do their step by hand when they are not.

## Verification

Before finishing:

1. Every landed contribution kept its author's authorship, with maintainer edits as separate commits.
2. The PR was approved before it was closed, and closed with a credit comment.
3. A new skill is registered on every roster surface, checks green.
4. Every decline names a thesis-tied reason and keeps its branch.
5. Any rename or reframe was explained to the author.
