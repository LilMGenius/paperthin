---
name: readback
description: "Verify the model's understanding of a user's instruction before spending non-trivial work. Use when a request is long, bundled, high-stakes, hard to undo, or has ambiguous scope or referents such as this, that, it, the other one, whatever is cleaner, or whichever order makes sense. Restate internally, cross-check against available context, proceed silently when resolved, and surface only a genuine surviving fork."
---

Restate an instruction in your own words and check it against context before work starts on it.

## Goal

Catch a misread instruction before work starts on the wrong target. The requester's intended meaning is checked against the current message, the session history, project memory, files on disk, and established conventions. When that context settles the read, the work proceeds with no question; when two readings survive, the requester gets one specific question about the choice.

## Workflow

1. Recognize the signal: a long or multi-part instruction, ambiguous scope or referents, deliberately flexible wording, or stakes high enough that a wrong guess costs real work, including work that is hard to undo.
2. Restate the instruction to yourself in your own words. Copying the user's words does not count as understanding.
3. Check that restatement against the available context (the message, session history, project memory, files on disk, and conventions the Goal names) for contradictions, missing antecedents, or two plausible readings the context cannot settle.
4. If the context settles it, proceed without saying anything. Do not ask the requester to confirm what the context already answered.
5. If a fork survives, ask one specific clarifying question that is tied to your restated understanding and names the choice, never a vague "does this look right?". The requester decides: wait for the answer before the shape-changing work proceeds.
6. Before substantial work, record one durable line beginning `understood as: ` with the confirmed read, so a later reader can check the work against it. Keep it in the plan or task file the work already has; with none, put it in the commit message or pull request body that delivers the work.

## Rules

- A paraphrase shows a model of the request was built; a verbatim repeat shows little.
- Asking about a request that context resolves, or that is unambiguous, is a defect; proceed silently.
- Surface one fork at a time, highest stakes first, never a checklist of ambiguities.
- Never silently resolve a fork that changes the shape of the work.
- Keep the durable read log for plans, multi-file changes, irreversible actions, or work a fresh reviewer may need to audit, not for every turn. A silent pass still writes the line when one of these cases holds.
- Boundary with a sibling: readback verifies intent; `factchk` verifies whether a claim about the world is true. That sibling is named as a boundary, not called. This skill calls no skill.

## Verification

Before proceeding, confirm:

- The restatement is a paraphrase.
- Every surfaced fork is truly unresolved by the available context.
- No substantial work starts without either a silent pass or a resolved fork.
