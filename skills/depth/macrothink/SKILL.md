---
name: macrothink
disable-model-invocation: true
description: "User-invoked read-only pass for checking whether the current direction is tunnel-visioned: strip the session's bait, fan out 2 to 5 same-model fresh reads, and report divergence first without treating convergence as proof; or, when asked, re-read one decision at a larger scale and return linked expansions, a no-change, an abstain or a handoff."
---

Step back from the session's chosen path and ask several fresh reads what the current direction might be missing.

## Goal

Check the live decision or direction when examples, wording, prior turns, or a first plausible answer may have shaped the session's framing. The direction itself is the subject, not the artifact describing it.

Return a spread of independent reads. Divergence is the signal; convergence offers reassurance but never proves correctness.

The pass has two paths. The direction audit is the default. The macro path runs only when the user asks to re-read one decision at a larger scale (its boundary, purpose, stakeholders or horizon), and it performs no fan-out.

## Workflow

Only explicit user invocation authorizes the bounded fresh sub-sessions below. Their reads inform this pass and give them no authority to change the plan.

1. Name the current direction: the decision the session is about to keep building on.
2. Restate the underlying problem using its goal, constraints, and known facts. Remove the session's examples, suggested answer, preferred naming, and framing-specific wording.
3. Fan out independent fresh reads of that restatement: **2 to 5, default 3**. Same model is allowed because this pass does not claim cross-model verification.
4. Collect each read verbatim, without correcting it toward the session's current direction.
5. Classify each read against the current direction:
   - `divergent-incompatible`: challenges a premise the direction depends on.
   - `divergent-compatible`: adds or reframes something useful without discarding the direction.
   - `convergent`: independently lands near the current direction.
6. Cluster reads that diverge in the same direction under their shared root. Report that root as the finding and the individual reads, kept verbatim, as evidence beneath it. Do not report one gap as five separate findings.
7. Report `divergent-incompatible` first, then `divergent-compatible`, then `convergent`. Label convergence as reassurance only.
8. Return control to the main session. This skill is read-only and advisory; it does not rewrite the plan or pick the final answer.

### Macro path

1. Take three inputs: the decision, stated as the option about to be committed to; the goal it serves, in the session's own words, unimproved; and the constraints treated as fixed, each tagged `external` (imposed outside the session), `session-chosen` or `unverified` (asserted with no recorded origin).
2. Route, in this order:
   - **Hand off** without doing the work when the ask is horizontal (another domain's mechanism), generative (more options or a selection among them), or about an artifact rather than a decision. Name the boundary and say the request belongs to a different reflex.
   - **No-change** when the session's framing already covers all seven items in step 3: say so and name each item with the line of the framing that covers it. A covered decision is a no-change even though nothing higher changes the choice.
   - **Abstain** in one line only when the decision has no macro surface: no larger boundary, purpose, stakeholder or horizon bears on it.
   - **Fire** otherwise, when moving the boundary would change which options exist.
3. When firing, examine seven items: the current problem boundary and what it leaves outside; the higher purpose the goal serves; stakeholders and what each is rewarded for; the time horizon and what the decision commits later work to; which constraints are fixed and which are session assumptions carried as constraints; options that appear or disappear once the boundary moves; and one next observation, the cheapest thing to look at that would confirm or break the expansion.
4. State every expansion as `the decision assumes X; at this scale X does not hold, which changes Y`. Drop one that cannot state its link.
5. Return control without choosing or adopting an option. Never claim to have found every unknown; the next observation is what the session can go and get.

## Rules

- **Divergence first.** The strongest `divergent-incompatible` finding, if any, is the most important output.
- **Roots over instances.** Specific divergences sharing one underlying gap form one finding. Naming the root makes it actionable beyond the cases the reads happened to hit.
- **No majority vote or averaging.** Do not pick a winner by count, smooth away disagreement, or present agreement as consensus.
- **Same model is allowed.** The pass looks for session-framing blind spots, not model-independent truth.
- **User-invoked fan-out only.** Do not trigger this skill automatically. User invocation permits bounded read-only fresh sub-sessions to produce the required reads.
- **Not consensus verification.** Do not say the direction is verified, proved, validated, or settled by same-model convergence.
- **Convergence is reassurance, not proof.** It means this pass did not surface a better angle; it does not certify correctness.
- **Read-only / advisory.** Surface candidates and risks; leave decisions and edits to the main workflow.
- **Default path unchanged.** An invocation that does not ask for the larger-scale read runs the direction audit.

## Verification

Before finishing, confirm:

1. The restatement removed the session's bait while preserving real constraints.
2. Every read was classified as `divergent-incompatible`, `divergent-compatible`, or `convergent`.
3. Divergences sharing one root were reported as that root, with the individual reads as evidence under it.
4. The report put divergent-incompatible findings first.
5. Any convergence was described as reassurance, not proof.
6. The report did not use consensus, majority, averaging, verified, or proved wording.
7. On the macro path: the route followed the order in step 2, every expansion carries its causal link, a no-change names the covered items, and no option was adopted.
