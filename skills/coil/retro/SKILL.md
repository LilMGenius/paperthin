---
name: retro
description: "Turn a finished, failed, or disappointing work cycle into portable lessons, anti-patterns, quality gates, and next-cycle vocabulary. Use after a build, QA pass, demo, user complaint, or abandoned attempt when the useful output is what the next pass must learn rather than the code itself."
---

Turn a completed cycle into lessons the next cycle can actually use.

## Goal

`retro` extracts durable learning from a work cycle without defending the artifact
that produced it. A cycle can run, pass tests, and still be the wrong thing. The
output is not a changelog or therapy note: it is a local, evidence-backed record
of what worked, what misled the build, and what gate the next pass must clear.

Use `retro` when the artifact is done, failed, disappointing, or ambiguous enough
that the next agent needs the cycle's lessons more than its momentum.

## Workflow

1. Read the original objective, final artifact, QA evidence, user complaints, and
   any local planning notes.
2. Separate working assets from misleading progress: contracts, schemas, tests,
   services, vocabulary, and examples that earned reuse vs. UI, panels, scaffolds,
   or abstractions that only looked productive.
3. Name each failure as an anti-pattern, not a mood.
4. Convert repeated or high-impact failures into quality gates for the next pass.
5. Convert vague user direction into architecture vocabulary a fresh agent can
   use.
6. Write or refresh local docs for the cycle: a retro for lessons and a plan for
   next-cycle contracts, gates, and vocabulary.
7. Verify that a from-scratch agent could avoid the same failure from those docs
   alone.

## Rules

- Do not defend the artifact. If it missed the product, say what missed.
- Do not write a changelog. File lists and effort summaries are not lessons.
- Preserve negative corpus. Failed paths are training data.
- Prefer hard gates over advice.
- Cite evidence from the cycle: objective, file facts, QA output, screenshots,
  transcripts, diffs, or user feedback.
- If the next agent cannot act on it, it is not a lesson yet.
- Keep provenance local; shipped artifacts should not narrate their scars.

## Verification

Before finishing:

1. Every lesson traces to observed cycle evidence.
2. Every anti-pattern names a concrete failure mode and the gate that catches it.
3. A fresh agent can tell what to preserve, what to discard, and what to test
   first without reading the whole old session.
