---
name: catchup
description: "Rebuild the human's lost context on a project from live state, in plain language: what needs them, what changed, what new words mean. Use when the human returns after a gap, says they can't follow the project anymore, asks what happened or what a term means, or before deciding what to do next when their mental model is stale. Read-only; it briefs, it does not act."
---

Brief the human in plain language from live project state.

## Goal

`catchup` restores the owner's understanding before the next move is decided. Long agent cycles coin words, rename files, run experiments, and make decisions faster than the owner can follow. Read live project state and return a briefing someone with no retained context can act on, so the next decision rests on current facts.

## Workflow

1. Read live state only: recent file modification times, version-control history and diffs, plan and state docs, re0-memo notes, and task boards. Never brief from conversation memory alone; memory is what drifted.
2. Anchor on the human's last message, judgment, or commit. Cover changes after that point; assume earlier material is known and leave it out.
3. Compose in decision order, not chronological order:
   - **Needs you**: decisions, judgments, or inputs only the human can give, each actionable without opening another file.
   - **Changed while you were away**: outcomes, not process. "The plan's scoring rule was replaced" beats "I ran three analysis passes."
   - **New words**: every term coined or repurposed since their last touch, one line each, with where it lives. Skip terms they already used themselves.
4. Explain each project-specific term in plain language inline on first use, even if a glossary follows.
5. Keep the default to a screen or less. End with offers to expand each section rather than expanding everything.

## Rules

- Every claim traces to a file, commit, or artifact the human can open. No "as we discussed."
- Read-only on the project. `catchup` briefs; it does not fix, rename, or decide.
- The ask comes first. A briefing that buries the one question needing the human is a log.
- Outcome voice, not journey voice. Narrating the agent's process is self-report, not briefing.
- Silence the settled: closed decisions and healthy metrics get one line or none.
- Honest completeness: "done" means verified done; "moved" is not "reconciled"; say which.
- Do not re-explain terms the human demonstrably knows (they used them first).

## Verification

Before finishing:

1. Cold-read the briefing: no sentence requires pre-gap memory or an unglossed coined term to parse.
2. The "needs you" items are each actionable without opening another file.
3. Every claim has a checkable source (file, commit, artifact path).
4. It fits on a screen, with expansion offered rather than delivered.
