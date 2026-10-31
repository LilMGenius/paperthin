---
name: whychk
description: "Right after you pick an option, have a fresh outsider find the sharpest gap in the choice, then explain that gap in your own words, one gap at a time."
disable-model-invocation: true
---

Make the person who chose explain why, one gap at a time, before the decision counts as earned.

## Goal

A decision made after options were laid out without arguments can feel settled while resting on assumptions nobody said aloud. This check surfaces them one by one and lets the user close each with their own reasoning. It runs only when the user reaches for it, because a reflex that challenges every decision would breed chronic self-doubt.

## Workflow

1. Run when the user invokes this skill right after a decision, typically one picked from options presented without arguments; it never starts on its own. Restate the decision neutrally in one or two sentences, with no reasoning attached, and do not let the user borrow reasoning that was never given.
2. Launch a fresh, context-free sub-session that never watched the decision being made. Give it only the restated decision, never the options discussion, your reasoning, or the session history. Never use the session that made the choice as the critic; if the host cannot start a separate session, say so and stop rather than critique the choice yourself.
3. Ask the critic what a skeptical outsider would question, what is assumed but unstated, and what must be true for the choice to hold. Its answers are candidate gaps; rank them by how much of the decision falls if each one is wrong.
4. Take the sharpest unresolved gap from its answer and put exactly that one gap to the user, asking them to explain it in their own words. Never hand over a checklist.
5. Judge the answer. The gap closes only when the explanation resolves the actual question. If it restates the question, deflects, or leans on authority ("the agent suggested it"), it stays open.
6. After a shallow answer, narrow to the exact part that stayed vague and ask about that. Never repeat the same question and never widen back to a generic "are you sure?".
7. Continue with the next sharpest gap. Stop when every gap is explained, or when narrowing on one gap yields nothing new and the user leaves it open. Both endings are valid.
8. For an unexplained gap, name its specific assumption and flag the decision for re-review, written where the decision is recorded (its plan, issue or commit message) so the flag outlives the conversation. The flag means the decision is not yet earned, not that it was wrong. Never force a resolution and never let the user paper over the gap.

## Rules

- The critic is always a separate, context-free sub-session that receives the decision alone.
- Exactly one gap per turn, the sharpest unresolved one.
- Every reason that closes a gap comes from the user. This skill supplies none, not even as a hint or a leading question.
- Reject answers that restate the question, deflect, or cite authority; say why in one line.
- An open gap carries forward as a flag and is never dropped or softened.
- Stay neutral about whether the decision is right; the check measures understanding, not outcome.

## Verification

Before finishing:

1. The signal is the change between the user's first answer and the answer after narrowing, not the absence of objections.
2. Every closed gap traces to an explanation from the user that resolved the actual question.
3. Every open gap is listed with its specific assumption and carries forward as a flag for re-review.
4. No reason that closed a gap came from this skill.
