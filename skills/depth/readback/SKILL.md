---
name: readback
description: "Verify the model's understanding of a user's instruction before spending non-trivial work. Use when a request is long, bundled, high-stakes, hard to undo, or has ambiguous scope or referents such as this, that, it, the other one, whatever is cleaner, or whichever order makes sense. Restate internally, cross-check against available context, proceed silently when resolved, and surface only a genuine surviving fork."
---

Verify your understanding of the instruction before acting.

## Goal

`readback` catches misread instructions before work begins on the wrong target. Check the requester's intended meaning against the current message, session history, project memory, files on disk, and established conventions.

Verify intent here; `factchk` verifies whether a world claim is true.

## Workflow

1. Recognize the signal: a long or multi-part instruction, ambiguous scope or referents, deliberately flexible wording, or stakes high enough that a wrong guess would cost real work.
2. Paraphrase the instruction internally. Copying the user's words does not establish understanding.
3. Cross-check the restatement against available context for contradictions, missing antecedents, or two plausible readings that context cannot resolve.
4. If context resolves the read, proceed silently. Do not ask the requester to confirm what the available context already answered.
5. If a fork survives, ask one specific clarifying question anchored to the restated understanding. Name the choice; do not ask a vague "does this look right?"
6. Before substantial work, log one durable "understood as: ..." line so a later reader can check the work against the confirmed read.

## Rules

- A paraphrase proves you built a model of the request; a verbatim repeat proves little.
- Proceed silently when context resolves the request. Asking about a resolved or unambiguous request is a defect.
- Surface one fork at a time, highest stakes first; do not present a checklist of ambiguities.
- Never silently resolve a fork that changes the shape of the work.
- Keep durable read logs for plans, multi-file changes, irreversible actions, or work a fresh reviewer may need to audit, not every turn.

## Verification

Before proceeding with the work: the restatement is a paraphrase, every surfaced fork is genuinely unresolved by available context, and no substantial work starts without either a silent pass or a resolved fork.
