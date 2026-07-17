---
name: aim
description: "When data lands with a thin ask — files, a repo, a paste, a chat scrollback — read it and propose what the user is trying to do with it, as a proposal to confirm rather than a question to answer. Use the moment material arrives without a fully-formed ask, or when the ask reads thinner than the data suggests."
---

Read the data and propose the intent behind it, for the user to confirm.

## Goal

The result is a proposal the user only confirms, revises, or rejects — never a question. Asking makes the user compose a sentence they did not have ready; proposing lets them answer with a yes. If the turn ends with them writing that sentence anyway, the skill missed.

## Workflow

1. Read every piece of the handed-over data end to end before proposing anything.
2. State the intent you read, in one line grounded in what the data actually shows.
3. State briefly what you would do next on that intent.
4. Ask only to confirm — right, wrong, or adjust.

## Rules

- Read before proposing. A proposal without reading is a guess.
- Ground it in the data. Point at what you read, not what you assumed.
- One intent per turn. If two are plausible, propose the likelier and name the other in a clause.
- Confirm, don't compose. If the turn ends with the user assembling a sentence, redo the proposal.
- If the data is too thin to propose from, say so and stop. Do not fall back to asking.

## Verification

The user's next reply is short — a yes, a correction, or a small adjustment. If they had to explain what they wanted from scratch, the proposal was wrong, or was really a question in disguise.
