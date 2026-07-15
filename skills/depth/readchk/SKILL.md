---
name: readchk
description: "Verify the model's understanding of a user's instruction before spending non-trivial work. Use when a request is long, bundled, high-stakes, hard to undo, or has ambiguous scope or referents such as this, that, it, the other one, whatever is cleaner, or whichever order makes sense. Restate internally, cross-check against available context, proceed silently when resolved, and surface only a genuine surviving fork."
---

Check the read before acting: did you understand the instruction correctly enough to spend the work?

## Goal

`readchk` catches misread instructions before they become coherent work against the wrong target. It verifies a claim about the requester's intent against available context: the current message, session history, project memory, files on disk, and established conventions.

This is not `factchk`: the question is what was meant, not whether a world claim is true.

## Workflow

1. Recognize the signal: a long or multi-part instruction, ambiguous scope or referents, deliberately flexible wording, or stakes high enough that a wrong guess would cost real work.
2. Restate the instruction internally in different words. Do not copy the user's wording back to yourself and treat that as understanding.
3. Cross-check the restatement against available context. Look for contradictions, missing antecedents, or two plausible readings that context cannot choose between.
4. If context resolves the read, proceed silently. Do not ask the requester to confirm what the available context already answered.
5. If a real fork survives, surface one specific clarifying question anchored to the restated understanding. Name the choice; do not ask a vague "does this look right?"
6. For substantial work, log one durable "understood as: ..." line before beginning so a later reader can audit whether the work matched the confirmed read.

## Rules

- **Restate, don't echo.** A paraphrase proves you built a model of the request; a verbatim repeat proves little.
- **Silent when context resolves it.** The default good outcome is invisible. Surfacing a question for a resolved or unambiguous request is a defect.
- **One fork at a time.** If several ambiguities exist, surface the highest-stakes one first instead of dumping a checklist.
- Never silently resolve a fork that changes the shape of the work.
- **Log large commitments, not every turn.** Durable read logs are for plans, multi-file changes, irreversible actions, or work a fresh reviewer may need to audit.

## Verification

Before proceeding with the work: the restatement is a paraphrase, every surfaced fork is genuinely unresolved by available context, and no substantial work starts without either a silent pass or a resolved fork.
