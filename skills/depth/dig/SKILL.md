---
name: dig
disable-model-invocation: true
description: "Press a decision you just made until you can defend it to a skeptic — or surface that you can't."
---

Dig into a decision you just made, with no rationale handed to you, until a skeptical third party's objections either fall or stand.

## Goal

The moment after a choice is the moment understanding is cheapest to fake. The person who picked an option can restate it fluently without having actually earned the reasons behind it — and by the time that gap matters, the decision is load-bearing elsewhere. `dig` closes that gap immediately: no one supplies the rationale for you, a context-free critic presses for what's actually undefended, and a shallow answer gets a sharper follow-up instead of a pass. The output is either a decision that now holds under real pressure, or an honest flag that it doesn't yet.

## Workflow

1. **Trigger**: fire this right after a decision is made — typically just after an AI laid out options without arguing for any of them and the user picked one.
2. **Restate, don't justify**: state the decision and the choice in neutral terms. Do not supply the reasoning behind it, and do not let the user borrow reasoning that was never actually given.
3. **Isolate the critic**: hand the decision (not your own reasoning) to a fresh, context-free sub-session. Have it press for gaps — what a skeptical outsider would ask, what's assumed but unstated, what would need to be true for this to hold — the same isolation `shower` uses, aimed at a choice instead of a document.
4. **Return one gap at a time**: give the user the sharpest unresolved gap and ask them to defend it in their own words. Do not batch every gap into a checklist.
5. **Judge the defense**: if the answer actually resolves the gap, mark it closed and move to the next one. If it restates the question, deflects, or leans on authority ("the AI suggested it") instead of reasoning, do not accept it.
6. **Escalate Socratically**: on a shallow answer, do not repeat the same question — narrow it to the exact part that stayed vague, and ask again. Keep narrowing each round; never widen back out to a generic "are you sure?"
7. **Stop condition**: after repeated rounds, either every gap is genuinely defended, or one isn't. Both are valid endings.
8. **On an undefended gap**: do not force a resolution or let the user paper over it. Surface it as a named, unresolved point and flag the decision itself for re-review — not a verdict that the decision was wrong, only that it wasn't yet earned.

## Rules

- Never supply the rationale before the user attempts one. Handing over reasoning first is exactly the frame-injection failure this skill exists to avoid.
- The critical pass must come from an isolated sub-session, never self-assessed in this session — the user's own mind can't un-know the decision it just made, any more than an author can un-know their own draft.
- Escalate, don't repeat. A second identical question just teaches the user to restate louder; a narrower one tests whether they actually closed the gap.
- Never force a resolution. An honestly unresolved gap is a usable result — a signal that the decision needs another look — not a failure of the skill.
- User-invoked on purpose: a challenge-every-decision reflex always in the agent's reach would bias the user toward chronic self-doubt. This fires only when the user deliberately reaches for it.

## Verification

Before finishing:

1. Compare the user's first answer to a gap against their answer after escalation — the round-over-round change in what they can actually explain is the real signal, not merely "no more objections came up."
2. Every closed gap traces to an answer that resolved the actual question, not one that restated it.
3. Any gap still open at the end is named specifically — which assumption, not a vague "user struggled" — and carried forward as a flag on the decision, never silently dropped.
4. The rationale was never supplied by this skill; every piece of reasoning that closed a gap came from the user.
