---
name: re0-memo
description: "Turn a finished, failed, or disappointing work cycle into portable lessons, anti-patterns, quality gates, and next-cycle vocabulary. Use after a build, QA pass, demo, user complaint, or abandoned attempt when the useful output is what the next pass must learn rather than the code itself."
---

Turn a completed cycle into lessons the next cycle can use.

## Goal

`re0-memo` extracts durable lessons from a work cycle without defending its artifact. A cycle can run and pass tests yet produce the wrong thing. Record what worked, what misled the build, and what gate the next pass must clear, with local evidence. Do not write a changelog or therapy note.

Use `re0-memo` when the artifact is done, failed, disappointing, or ambiguous enough that the next agent needs the cycle's lessons more than its momentum.

## Workflow

1. Read the original objective, final artifact, QA evidence, user complaints, and any local planning notes.
2. Separate assets that earned reuse (contracts, schemas, tests, services, vocabulary, and examples) from UI, panels, scaffolds, or abstractions that only looked productive.
3. Generalize before recording: cluster specific complaints into their shared pattern before writing. Complaints across many items usually share one root gap. Record that root and its pattern family as the lesson, with the specifics beneath it as evidence rather than separate lessons.
4. Name each failure as an anti-pattern, not a mood.
5. Convert repeated or high-impact failures into quality gates for the next pass.
6. Convert vague user direction into architecture vocabulary a fresh agent can use.
7. Write or refresh local docs for the cycle: a re0-memo for lessons and a plan for next-cycle contracts, gates, and vocabulary.
8. Verify that a from-scratch agent could avoid the same failure from those docs alone.

## Rules

- Do not defend the artifact. If it missed the product, say what missed.
- Do not write a changelog. File lists and effort summaries are not lessons.
- Do not transcribe a specific complaint as a lesson. Fixing only the reported case leaves the same failure elsewhere for a human to find. Generalize each specific to a pattern that catches its whole class; the reporter's exact words are evidence, not the gate.
- Preserve negative corpus. Failed paths are training data.
- Prefer hard gates over advice.
- Cite evidence from the cycle: objective, file facts, QA output, screenshots, transcripts, diffs, or user feedback.
- If the next agent cannot act on it, it is not a lesson yet.
- Keep provenance local; shipped artifacts should not narrate their scars.

## Verification

Before finishing:

1. Every lesson traces to observed cycle evidence.
2. Every anti-pattern names a concrete failure mode and the gate that catches it.
3. Every lesson covers a class, with the reported specifics beneath it as evidence.
4. A fresh agent can tell what to preserve, what to discard, and what to test first without reading the whole old session.
