---
name: macrothink
disable-model-invocation: true
description: "User-invoked read-only pass for checking whether the current direction is tunnel-visioned: strip the session's bait, fan out 2 to 5 same-model fresh reads, and report divergence first without treating convergence as proof."
---

Step back from the session's chosen path and ask several fresh reads what the current direction might be missing.

## Goal

`macrothink` checks the live decision or direction in hand, not the artifact that describes it. It is for moments when the session may have inherited a framing from examples, wording, prior turns, or a first plausible answer.

The product is a spread of independent reads. Divergence is the signal. Convergence is reassurance, never proof.

## Workflow

This skill is not model-invoked automatically. When a user explicitly invokes it, the invoked run may create the bounded fresh sub-sessions below; they are read-only inputs to this pass, not separate authority to change the plan.

1. Name the current direction: the decision the session is about to keep building on.
2. Strip the prompt to the underlying problem: goal, constraints, and known facts. Remove the session's own examples, suggested answer, preferred naming, and framing-specific wording.
3. Fan out independent fresh reads of that stripped restatement: **2 to 5, default 3**. Same model is allowed because this pass does not claim cross-model verification.
4. Collect each read without correcting it toward the session's current direction.
5. Classify each read against the current direction:
   - `divergent-incompatible`: challenges a premise the direction depends on.
   - `divergent-compatible`: adds or reframes something useful without discarding the direction.
   - `convergent`: independently lands near the current direction.
6. Cluster before reporting: when several reads diverge in the same direction, name the shared root they point at — the pattern behind the divergences is the finding, and the individual reads sit under it as evidence. Do not report five specifics that are one gap seen five times.
7. Report `divergent-incompatible` first, then `divergent-compatible`, then `convergent`. Label convergence as reassurance only.
8. Return control to the main session. This skill is read-only and advisory; it does not rewrite the plan or pick the final answer.

## Rules

- **Divergence first.** The most important output is the strongest `divergent-incompatible` finding, if any.
- **Roots over instances.** A spread of specific divergences that share one underlying gap is one finding, not many; naming the root is what makes the pass actionable beyond the cases the reads happened to hit.
- **No majority vote or averaging.** Do not pick a winner by count, smooth away disagreement, or present agreement as consensus.
- **Same model is allowed.** The pass looks for session-framing blind spots, not model-independent truth.
- **User-invoked fan-out only.** Do not trigger this skill automatically. If the user invokes it, bounded read-only fresh sub-sessions are allowed to produce the required reads.
- **Not consensus verification.** Do not say the direction is verified, proved, validated, or settled by same-model convergence.
- **Convergence is reassurance, not proof.** It means this pass did not surface a better angle; it does not certify correctness.
- **Read-only / advisory.** Surface candidates and risks; leave decisions and edits to the main workflow.

## Verification

Before finishing, confirm:

1. The restatement removed the session's bait while preserving real constraints.
2. Every read was classified as `divergent-incompatible`, `divergent-compatible`, or `convergent`.
3. Divergences sharing one root were reported as that root, with the individual reads as evidence under it.
4. The report put divergent-incompatible findings first.
5. Any convergence was described as reassurance, not proof.
6. The report did not use consensus, majority, averaging, verified, or proved wording.
