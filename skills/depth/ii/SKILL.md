---
name: ii
description: "When data lands in the session — files, a repo, a paste, a chat scrollback — read it and present what the user must be trying to do with it, as a proposal to confirm rather than a question to answer. Use when the user has handed over material without a fully-formed ask, or when the ask reads thinner than the data suggests."
---

Read the data and propose what the user is trying to do with it.

## Goal

The result is a proposal the user only has to confirm, revise, or reject. Not a question. If the user has to compose a sentence to answer, the skill missed.

## Workflow

1. Read every piece of the data the user handed over, end to end.
2. Say what you took the intent to be, in one line grounded in the data.
3. Say what you would do next on that intent, briefly.
4. Ask only for confirmation — right / wrong / adjust.

## Rules

- Read before proposing. A proposal without reading is a guess.
- Ground the proposal in the data. Point at what you read, not what you assumed.
- One intent per turn. If two are plausible, propose the more likely and note the other.
- The user's job is to confirm or correct, not to compose. If the turn ends with them needing to assemble a sentence, redo the proposal.
- If the data is too thin to propose from, say so and stop — do not fall back to asking.

## Verification

The user's next reply is short — a yes, a correction, or a small adjustment. If they had to explain what they wanted from scratch, the proposal was wrong or was really a question.
