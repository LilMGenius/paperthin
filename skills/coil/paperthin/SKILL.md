---
name: paperthin
disable-model-invocation: true
description: "The one command to remember: type /paperthin, then your dream. It hands the request to re0-workflow, which runs the rest."
---

Hand the person's request to `re0-workflow`, unchanged, and add nothing of its own.

## Goal

Someone who has never read this suite's catalog types `/paperthin` with what they want, and that is enough. This skill is only a name for that door: every behavior (reading the intent, choosing and ordering the skills, showing the order, running it and stopping where a person must act) belongs to `re0-workflow`. It is user-invoked because it exists for a person to type; the model reaches `re0-workflow` directly, so a second model-facing entry with the same triggers would only split them.

## Workflow

1. Call the Skill tool with "re0-workflow", passing the person's request word for word as the stated intent, and pass along whatever they attached (files, pasted text) the way the host passes attachments to a skill. If they typed `/paperthin` with nothing after it, say so in the call ("no request given"); asking for the intent is the router's job.

## Rules

- Forward only: plan, select, order or run nothing here, and call no other skill. Everything after the hand-off is `re0-workflow`'s.
- Never shorten, rephrase, translate or complete the request; the router reads the person's own words.
- Whether `re0-workflow` is installed is read from the installed roster before the call, never tried as a second call; when it is missing, stop and say so, naming it as the skill to install. Never stand in for it with a plan of your own.
- When the forward call fails, report that failure as it came back and run nothing else.
- `re0-workflow` never routes back here, so the hand-off cannot loop.

## Verification

Before finishing:

1. Exactly one Skill tool call ran, to `re0-workflow`, carrying the request as typed; or, when `re0-workflow` was not installed, none ran and the person was told to install it.
2. Nothing else ran from this skill; the report the person sees is the router's.
