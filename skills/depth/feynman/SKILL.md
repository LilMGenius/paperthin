---
name: feynman
disable-model-invocation: true
description: "Press a decision you just made until you can explain it to a skeptic in your own words, or surface the gap where you can't. The Feynman test aimed at a choice: understanding is cheapest to fake the moment after you decide, so a fresh critic presses for what you can't actually explain. Use right after picking an option, especially one an agent laid out without arguing for."
---

Press a decision you just made until you can explain it, or name the gap where you can't.

## Goal

After a choice, you can fluently restate an option without understanding its reasons. By the time that gap matters, other work may depend on the decision. Apply the Feynman test: if you can't explain a thing plainly, you don't yet understand it. An isolated critic that never made the decision presses for what you can't explain without handing you a rationale. A shallow answer draws a narrower question. Finish with a decision you can explain under pressure or an honest flag that you can't yet.

## Workflow

1. **Trigger**: fire right after a decision is made, typically after options were laid out without arguments and one was picked.
2. **Restate, don't justify**: state the decision neutrally. Do not supply its reasoning or let the user borrow reasoning that was never given.
3. **Isolate the critic**: give only the decision to a fresh, context-free sub-session that never watched it being made. Supply no reasoning. Have it ask what a skeptical outsider would question, what is assumed but unstated, and what must be true for the choice to hold.
4. **Return one gap at a time**: give the user the sharpest unresolved gap and ask them to explain it in their own words. Never batch gaps into a checklist.
5. **Judge the explanation**: close the gap and move on only if the answer resolves it. Reject an answer that restates the question, deflects, or leans on authority ("the agent suggested it") instead of reasoning.
6. **Narrow, don't repeat**: after a shallow answer, ask about the exact part that stayed vague instead of repeating the question. Keep narrowing each round; never widen back to a generic "are you sure?"
7. **Stop condition**: after repeated rounds, either every gap is explained or one remains unresolved. Both are valid endings.
8. **On an unexplained gap**: name the unresolved point and flag the decision for re-review. Do not force a resolution or let the user paper over it. The flag means the decision isn't yet earned, not that it was wrong.

## Rules

- Never supply the rationale before the user attempts one. Giving reasoning first injects the framing this skill exists to avoid.
- The critic must be an isolated sub-session, never the session that made the choice. That session cannot un-know its decision, just as an author cannot un-know their draft.
- Narrow, don't repeat. An identical second question teaches the user to restate louder; a narrower one tests whether the gap closed.
- Never force a resolution. An honestly unexplained gap is a usable signal to revisit the decision, not a failure of the skill.
- User-invoked on purpose: a challenge-every-decision reflex always in reach would bias the user toward chronic self-doubt. It fires only when deliberately reached for.

## Verification

1. Compare the user's first answer to a gap with their answer after narrowing. The change in what they can explain is the signal; the absence of further objections is not enough.
2. Every closed gap traces to an explanation that resolved the actual question rather than restating it.
3. Name each open gap by its specific assumption, not a vague "the user struggled." Carry it forward as a flag on the decision; never silently drop it.
4. The skill supplied no rationale; every reason that closed a gap came from the user.
