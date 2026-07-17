---
name: feynman
disable-model-invocation: true
description: "Press a decision you just made until you can explain it to a skeptic in your own words, or surface the gap where you can't. The Feynman test aimed at a choice: understanding is cheapest to fake the moment after you decide, so a fresh critic presses for what you can't actually explain. Use right after picking an option, especially one an agent laid out without arguing for."
---

Press a decision you just made until you can explain it, or the gap where you can't is named.

## Goal

The moment after a choice is when understanding is cheapest to fake: you can restate an option fluently without having earned the reasons behind it, and by the time that gap matters the decision is load-bearing elsewhere. The Feynman test catches it — if you can't explain a thing plainly, you don't yet understand it. So no one hands you the rationale; a fresh critic that never made the decision presses for what you can't actually explain, and a shallow answer draws a narrower question instead of a pass. The result is a decision you can now explain under real pressure, or an honest flag that you can't yet.

## Workflow

1. **Trigger**: fire right after a decision is made — typically just after options were laid out with no argument for any, and one was picked.
2. **Restate, don't justify**: state the decision neutrally. Do not supply the reasoning behind it, and do not let the user borrow reasoning that was never actually given.
3. **Isolate the critic**: hand the decision — not any reasoning — to a fresh, context-free sub-session that never watched the decision get made. Have it press for gaps: what a skeptical outsider would ask, what is assumed but unstated, what would have to be true for the choice to hold.
4. **Return one gap at a time**: give the user the sharpest unresolved gap and ask them to explain it in their own words. Never batch gaps into a checklist.
5. **Judge the explanation**: if the answer actually resolves the gap, close it and move on. If it restates the question, deflects, or leans on authority ("the agent suggested it") instead of reasoning, do not accept it.
6. **Narrow, don't repeat**: on a shallow answer, don't ask the same question again — narrow to the exact part that stayed vague and ask that. Keep narrowing each round; never widen back to a generic "are you sure?"
7. **Stop condition**: after repeated rounds, either every gap is genuinely explained, or one isn't. Both are valid endings.
8. **On an unexplained gap**: don't force a resolution or let the user paper over it. Name the unresolved point specifically and flag the decision for re-review — not a verdict that it was wrong, only that it isn't yet earned.

## Rules

- Never supply the rationale before the user attempts one. Handing reasoning over first is the frame-injection failure this skill exists to avoid.
- The pressing comes from an isolated sub-session, never self-assessed in the session that made the choice — a mind can't un-know the decision it just made, any more than an author can un-know their own draft.
- Narrow, don't repeat. A second identical question teaches the user to restate louder; a narrower one tests whether the gap actually closed.
- Never force a resolution. An honestly unexplained gap is a usable result — a signal the decision needs another look — not a failure of the skill.
- User-invoked on purpose: a challenge-every-decision reflex always in reach would bias the user toward chronic self-doubt. It fires only when deliberately reached for.

## Verification

1. Compare the user's first answer to a gap against their answer after narrowing — the round-over-round change in what they can actually explain is the real signal, not merely that no more objections came up.
2. Every closed gap traces to an explanation that resolved the actual question, not one that restated it.
3. Any gap still open is named specifically — which assumption, not a vague "the user struggled" — and carried forward as a flag on the decision, never silently dropped.
4. The rationale was never supplied by this skill; every reason that closed a gap came from the user.
