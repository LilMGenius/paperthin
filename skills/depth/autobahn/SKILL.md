---
name: autobahn
description: "Carve guardrail-adjacent items out of scope with safe alternatives before risk-adjacent work starts, then run the safe remainder at full strength in a fresh subagent that only ever sees the carved prompt, never the risky input. Use when a task includes stealth, scraping, privacy, IP, policy, licensing, security, or other safety-adjacent material that could be silently dropped, over-elaborated, or needlessly diluted. Fires on the impulse, not only the topic: the moment you notice yourself about to hedge, soften, silently skip, or brace for a refusal, carve before you execute."
---

Carve unsafe scope out of a task, execute the safe remainder in a fresh subagent that sees only the carved prompt, and report a visible descope ledger.

## Goal

Make scope decisions explicit before executing risk-adjacent work. Carve in this session; execute in a fresh subagent that receives only the carved prompt, never the risky original or this session's reasoning. Because the executing agent never reads the risky ask, it has nothing to hedge, dilute, or refuse and can build the safe scope at full strength. Remove the unsafe ask and run a genuinely safe prompt; never slip a flagged ask past a guardrail.

## Workflow

1. **FRAME**: Read the task, inputs, and user-stated risk posture. Proceed if the user already authorized descoping. Otherwise, propose a carve with an explicit split and wait for approval before **RUN**. A bright-line item has no safe version and is non-negotiable; a gray-zone alternative trades away scope the user may want and needs their decision. If every item is bright-line, proceed and record it in the ledger. If the user disputes a bright-line call, send only the item's abstract description to a fresh context for re-evaluation, stripped of negotiation and persuasion. Do not re-litigate it in the pressured session. Record the appeal and outcome in the ledger either way.
2. **CARVE**: Sweep the task and adjacent inputs for guardrail-adjacent items. For each, propose `verdict=descope`, classify it as bright-line or gray-zone, give one risk-free alternative, and name an archive destination under the negatives-as-corpus convention. A gray-zone item the user keeps stays in scope and enters the ledger as kept-by-owner. Identify excluded techniques only as far as needed; never elaborate them.
3. **GUARD**: Build a compact scope-guard block with absolute exclusions, allowed alternatives, and the context authorizing what stays in scope. Include it verbatim in the carved prompt. Name each exclusion to prevent its reintroduction, but never include the original risky ask verbatim or its method. If the run shares filesystem or memory access with this session, forbid consulting decision logs, notes, or transcript search over that state so it cannot recover the risky ask. Instruct the run to build the safe scope at full strength, without hedging, apology, or a shrunken deliverable.
4. **RUN**: Spawn a fresh subagent with no prior context and give it **only** the carved prompt. Never supply the risky original or your carve reasoning. It executes the safe scope at full strength and returns the deliverable; the carved prompt enables that work without exposing it to the risky ask. Route any risky material discovered during the run back here through **CARVE**, never improvising inline.
5. **VERIFY**: Adversarially check the deliverable and adjacent artifacts for five failures: risky content elaborated; risky content silently dropped; safe work diluted or treated as excluded; stale risky material left nearby; and a carve that missed or over-excluded something. Before reporting, re-sweep the original task from an independent context and diff the result against the ledger. Cap this independent re-sweep at one pass (`N=1`), never open-ended fan-out.
6. **LEDGER**: After the run finishes and the subagent's window closes, report the deliverable with a descope ledger. For every carved item, list its class, verdict of descoped or kept-by-owner, reason, safe alternative, and archive destination. Write archive entries only now: a risky record on disk during the run defeats its isolation. Report exclusions as visible decisions, not gaps.

## Rules

- Give the executing subagent only the carved prompt, never the risky original, carve reasoning, or this session's context. A clean executing context keeps the safe run flag-free and the skill non-evasive. When filesystem or memory access is shared, also forbid consulting decision logs, notes, or transcript search so the run cannot reconstruct the risky ask from adjacent state.
- A same-session appeal is not a re-review. Route pushback on a bright-line call to a fresh context with only the item's abstract description, never the negotiation. Surface repeated appeals on the same item as a signal rather than merely resolving them.
- Propose a carve unless the user pre-authorized descoping. Do not begin **RUN** while a gray-zone item shaping its prompt awaits an answer. Bright-line exclusions are non-negotiable; never stall on those alone.
- Never probe an excluded or gray-zone ask to see whether it passes. Settle scope before any such ask exists.
- Keep the scope-guard block portable and exact; include it verbatim in the carved prompt. Guard both directions: elaborate no excluded material, and dilute, hedge, or re-refuse nothing kept in scope.
- Provide no operational detail for excluded techniques beyond the minimum needed to identify what is out of scope. This also binds the ledger and carved prompt.
- Never frame the skill as a way around safety controls. Honor constraints by removing risky asks before they are posed and executing a genuinely safe prompt in a clean room. The skill produces a different, safe input; it cannot make a flagged input pass.
- Do not claim control over model routing, fallback provisioning, or fixed-model selection. Those belong to the execution runtime, not the prompt.
- Preserve negatives-as-corpus: archive descoped material with its cause of death and safe replacement; never erase it from the record. Later passes can mine the ledger for anti-patterns. Write archive entries only after the run finishes so risky material never sits where it could read it.

## Verification

Before finishing, confirm:

- **CARVE** covers every guardrail-adjacent item found, each with a class, verdict of descoped or kept-by-owner, safe alternative, and archive destination.
- The **RUN** subagent received only the carved prompt. Its embedded guard prevented both downstream hedging and elaboration. Where filesystem or memory access was shared, the prompt also barred decision logs, notes, or transcript search over that state.
- Nearby risky material did not dilute the safe deliverable, and every mid-run discovery returned through **CARVE** into the ledger.
- A fresh context independently re-swept the original task and diffed it against the ledger before reporting. Any missed risk or over-broad exclusion it found was folded back in.
- Archive entries for descoped material were written after the run closed, never before.
- The final report includes a distinct **LEDGER** section with exclusions, classes, reasons, alternatives, and archive destinations.
