---
name: re0-memo
description: "Turn a finished, failed, or disappointing work cycle into portable lessons, anti-patterns, quality gates, and next-cycle vocabulary. Use after a build, QA pass, demo, user complaint or correction, a request the user had to repeat, a user asking why something was not done, or an abandoned attempt when the useful output is what the next pass must learn rather than the code itself."
---

Pull a work cycle's durable lessons into the docs the next pass starts from.

## Goal

`re0-memo` pulls durable lessons out of a work cycle without defending what the cycle built. A cycle can run and pass its tests while still building the wrong thing, so the tests are not the verdict. Record three things, each with local evidence: what worked, what misled the build, and which gate the next pass must clear. The output is neither a changelog nor a therapy note.

Use it when an artifact is done, failed, disappointing, or ambiguous enough that the next agent needs the cycle's lessons more than its momentum: after a build, a QA pass, a demo, a user complaint or correction, a request the user had to repeat, a user asking why something was not done, a choice the user had to make that a written default should have made, or an abandoned attempt. Each of these means the user supplied what the work should have supplied itself, so run it in the turn the sign arrives, before the interrupted task resumes and buries it.

It calls no other skill. Its output feeds the next cycle, read by a fresh agent who never saw this one.

## Workflow

Run the steps in order.

1. Read the original objective, the final artifact, QA evidence, user complaints, and any local planning notes.
2. Sort what earned reuse (contracts, schemas, tests, services, vocabulary, examples) apart from what only looked productive (UI, panels, scaffolds, abstractions).
3. Generalize before writing anything. Cluster the specific complaints into the pattern they share; many complaints across many items usually trace to one root gap. The lesson is that root plus its pattern family, and the specifics sit under it as evidence, never as separate lessons.
4. Name every failure as an anti-pattern, a concrete failure mode, never as a mood.
5. For each class, find the rule or gate that already owns it. If one exists, it failed to fire, so the lesson is the missing trigger, check, or step, never a second rule that would drift from the first.
6. Turn repeated or high-impact failures into quality gates for the next pass.
7. Turn vague user direction into architecture vocabulary a fresh agent can work with.
8. Write or refresh the cycle's local docs, kept beside the work the cycle produced: a `re0-memo` holding the lessons with their evidence, and a `plan` holding the next cycle's contracts, gates, and vocabulary.
9. Pick the owner of each lesson by who must read it to avoid the failure, then check the pick against that owner's own written scope: its stated purpose, its readers and its boundaries. A rule every project of one author needs lives in that author's shared guide, a fact a teammate or another machine needs lives in the repository they clone, and a procedure lives in the skill or tool that carries it out. When that scope excludes the lesson, pick another place the same reader opens whose scope includes it; a rule placed where its reader never looks has not landed.
10. Land each lesson's rule in that owner, and leave the `re0-memo` entry as the evidence pointing to it, so the rule lives in one place. Rewrite that passage as though the lesson had always been there: a new idea gets its own step or sentence, and the neighboring sentence keeps its wording instead of gaining an appended clause.
11. Check that an agent starting from scratch could avoid the same failure using those docs alone.

## Rules

- Never defend the artifact. If it missed the product, say what missed.
- No changelog: file lists and effort summaries are not lessons.
- Never transcribe one specific complaint as a lesson. Fixing only the reported case leaves the same failure elsewhere for a human to find, so generalize each to a pattern that catches its whole class; the reporter's exact words are evidence, never the gate.
- Preserve the negative corpus. Failed paths are training data, so cut means archive, never delete.
- Prefer hard gates to advice.
- Cite evidence from the cycle: the objective, file facts, QA output, screenshots, transcripts, diffs, or user feedback.
- Something the next agent cannot act on is not a lesson yet.
- Provenance stays local. The `re0-memo` and `plan` docs hold it; shipped artifacts do not narrate their scars.

## Verification

Before finishing, confirm:

1. Every lesson traces to evidence observed in the cycle.
2. Every anti-pattern names a concrete failure mode and the gate that catches it.
3. Every lesson covers a class, with the reported specifics beneath it as evidence.
4. Every owner was picked by the reader who needs the lesson and fits its own written scope, and reads as its clean current version, with no lesson bolted onto a neighboring sentence.
5. A fresh agent can tell what to preserve, what to discard, and what to test first without reading the whole old session.

Report the lessons written, the gates added, and each owner a lesson landed in.
