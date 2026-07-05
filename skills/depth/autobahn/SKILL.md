---
name: autobahn
description: "Carve guardrail-adjacent items out of scope with safe alternatives before risk-adjacent work starts, carry the guard into every prompt, then execute the safe remainder at full strength. Use when a task includes stealth, scraping, privacy, IP, policy, licensing, security, or other safety-adjacent material that could be silently dropped, over-elaborated, or needlessly diluted. Fires on the impulse, not only the topic: the moment you notice yourself about to hedge, soften, silently skip, or brace for a refusal, carve before you execute."
---

Carve unsafe scope before execution, preserve the safe work's ambition, and make the descope ledger visible.

## Goal

Turn risk-adjacent work into an explicit, reviewable scope decision before execution begins: risky items are descoped with safe alternatives and archive destinations, while the remaining safe work runs without hedging, apology, or capability loss. The carve replaces the attempt-refuse-retry cycle: a well-carved task never poses the ask that would have been refused, and never waters down the asks that were always fine.

## Workflow

1. **FRAME**: Read the task, inputs, and user-stated risk posture. If the user already authorized descoping, proceed with the carve. If not, produce a proposed carve, make its split explicit, and wait for approval before **RUN**: a bright-line item has no safe version, so approval cannot change its verdict and it is marked non-negotiable; a gray-zone item's safe alternative trades away scope the user might want to keep, so it is the real question. If every item is bright-line, proceed without stalling; the ledger carries the record.
2. **CARVE**: Sweep the task and adjacent inputs for guardrail-adjacent items before executing. For each item, propose `verdict=descope`, class it bright-line or gray-zone, give one risk-free alternative, and name an archive destination per the negatives-as-corpus convention: the project's archive if it has one, otherwise a graveyard section or file beside the deliverable. A gray-zone item the user decides to keep stays in scope and enters the ledger as a kept-by-owner decision. Point to excluded techniques only as much as identification requires; do not elaborate them.
3. **GUARD**: Distill the carve into a compact scope-guard block: absolute exclusions, allowed alternatives, and the context that authorizes what stays in scope, with a pointer to the ledger for per-item detail. Keep it short enough to paste whole; a guard long enough to need summarizing will drift. Insert the block verbatim into the main plan and every subagent prompt. When work fans out, include one dedicated risk-lens subagent or review pass.
4. **RUN**: Execute only the carved safe scope at full strength. Build the best version of the allowed deliverable; do not shrink, soften, or omit safe work merely because risky neighbors were removed. When new guardrail-adjacent material surfaces mid-run, route it back through **CARVE**, never improvise a verdict inline: a bright-line find is descoped on the spot and appended to the ledger; a gray-zone find pauses the work it shapes until the owner answers, as in **FRAME**. Refresh the guard block in prompts not yet issued, and re-check work already in flight against the updated carve at **VERIFY**.
5. **VERIFY**: Run an adversarial pass over the output and adjacent artifacts, checking all four failure directions: risky content elaborated, risky content silently dropped, safe work diluted or treated as excluded downstream, and stale risky material left standing nearby.
6. **LEDGER**: Report the deliverable with a descope ledger listing every carved item: its class, its verdict of descoped or kept-by-owner, the reason, the safe alternative, and the archive destination. Treat exclusions as visible decisions, not gaps.

## Rules

- Require a proposed carve when the user has not pre-authorized descoping; do not begin **RUN** while a gray-zone item that shapes the deliverable still awaits an answer. Bright-line exclusions are never up for negotiation, so never stall on those alone.
- Never probe: do not pose an excluded or gray-zone ask to see whether it passes. The carve exists to end the attempt-refuse-retry churn by settling scope before any such ask is posed.
- Keep the scope-guard block portable and exact. Every fan-out prompt must carry it verbatim, not as a paraphrase or reminder, and it must guard both directions: no agent elaborates excluded material, and no agent treats work the carve explicitly kept in scope as if it were excluded.
- Guard against unsafe elaboration: never provide operational detail for excluded techniques beyond the minimum needed to identify what is out of scope. This binds the ledger and the guard block themselves, not only the deliverable.
- Guard against dilution of safe work with equal force: once the carve is accepted, execute the allowed work with normal rigor, completeness, and ambition. Dilution includes unprompted disclaimers, hedged phrasing, and quietly shrunken deliverables, not only outright omission.
- Do not frame the skill as a way around safety controls. The method honors constraints by removing risky asks before they are posed.
- Do not claim control over model routing, fallback provisioning, or fixed-model selection; those are harness behavior, not prompt behavior.
- Preserve negatives-as-corpus: descoped material is archived with its cause of death and safe replacement, never erased from the record, where a later `retro` can mine the ledger for anti-patterns.

## Verification

Before finishing, confirm:

- The **CARVE** covers every guardrail-adjacent item found, each carrying a class, a verdict of descoped or kept-by-owner, a safe alternative, and an archive destination.
- The **GUARD** block appears verbatim in every subagent prompt or fan-out work order, and no downstream agent had to improvise a safety posture in either direction.
- The **RUN** work stayed inside the accepted carve, posed no probing ask, and routed every mid-run discovery back through **CARVE** into the ledger.
- The safe deliverable was not diluted because of nearby risky material.
- The final report includes a distinct **LEDGER** section with exclusions, classes, reasons, alternatives, and archive destinations.
