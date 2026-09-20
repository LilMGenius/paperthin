---
name: macrothink
disable-model-invocation: true
description: "User-invoked read-only pass for checking whether the current direction is tunnel-visioned: strip the session's bait, fan out 2 to 5 same-model fresh reads, and report divergence first without treating convergence as proof."
---

Step back from the session's chosen path and ask several fresh reads what the current direction might be missing.

## Goal

Check the live decision or direction when examples, wording, prior turns, or a first plausible answer may have shaped the session's framing. The direction itself is the subject, not the artifact describing it.

Return a spread of independent reads. Divergence is the signal; convergence offers reassurance but never proves correctness.

## Workflow

Only explicit user invocation authorizes the bounded fresh sub-sessions below. Their reads inform this pass and give them no authority to change the plan.

1. Name the current direction: the decision the session is about to keep building on.
2. Restate the underlying problem using its goal, constraints, and known facts. Remove the session's examples, suggested answer, preferred naming, and framing-specific wording.
3. Fan out independent fresh reads of that restatement: **2 to 5, default 3**. Same model is allowed because this pass does not claim cross-model verification.
4. Collect each read without correcting it toward the session's current direction.
5. Classify each read against the current direction:
   - `divergent-incompatible`: challenges a premise the direction depends on.
   - `divergent-compatible`: adds or reframes something useful without discarding the direction.
   - `convergent`: independently lands near the current direction.
6. Cluster reads that diverge in the same direction under their shared root. Report that root as the finding and the individual reads as evidence beneath it. Do not report one gap as five separate findings.
7. Report `divergent-incompatible` first, then `divergent-compatible`, then `convergent`. Label convergence as reassurance only.
8. Return control to the main session. This skill is read-only and advisory; it does not rewrite the plan or pick the final answer.

## Rules

- **Divergence first.** The strongest `divergent-incompatible` finding, if any, is the most important output.
- **Roots over instances.** Specific divergences sharing one underlying gap form one finding. Naming the root makes it actionable beyond the cases the reads happened to hit.
- **No majority vote or averaging.** Do not pick a winner by count, smooth away disagreement, or present agreement as consensus.
- **Same model is allowed.** The pass looks for session-framing blind spots, not model-independent truth.
- **User-invoked fan-out only.** Do not trigger this skill automatically. User invocation permits bounded read-only fresh sub-sessions to produce the required reads.
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
