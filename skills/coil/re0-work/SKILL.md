---
name: re0-work
description: "Restart a project or artifact from v0 while preserving only proven lessons, contracts, gates, vocabulary, real-surface tests, and negative corpus. Use when the foundation is wrong, accumulated code is misleading progress, or a new pass should learn from the old one without inheriting its accidental architecture."
---

Start over from what the previous cycle proved, not from what it happened to build.

## Goal

`re0-work` is a controlled restart. It keeps earned knowledge and refuses to copy forward accidental architecture. Starting from scratch is not amnesia: contracts, schemas, vocabulary, real-surface tests, quality gates, and negative corpus survive when they earned it. Scaffold, explanatory UI, debug panels, shallow generated content, and code whose only value was learning what not to do do not.

## Workflow

1. Read the current plan, any lessons or retro notes, local domain notes, QA evidence, and any user complaint that triggered the restart.
2. Identify what to preserve: contracts, schemas that survived QA, quality gates, vocabulary, reusable services, real-surface tests, and negative corpus.
3. Identify what to discard: explanatory UI, debug panels, scaffold, shallow generated content, accidental abstractions, and code whose only value was learning what not to do.
4. Name the first quality gate before planning code.
5. Write a v0 skeleton plan with one complete vertical loop.
6. Build only the first loop until it clears the gate.

## Rules

- Starting from scratch means no copy-forward unless the artifact earned it.
- One complete vertical loop beats many shallow surfaces.
- Preserve provenance in local docs, not in the shipped product.
- Do not rebuild around a vague lesson. Turn it into a gate or leave it out.
- Do not delete negative corpus; archive or reference it where the next cycle will see it.
- If a reusable module survives, name the contract that proved it survives.

## Verification

Before finishing:

1. The preserve/discard split is explicit and evidence-backed.
2. The new v0 plan has one complete vertical loop and a named first gate.
3. No old architecture is copied forward merely because it exists.
4. A fresh builder can start without rereading the failed codebase.
