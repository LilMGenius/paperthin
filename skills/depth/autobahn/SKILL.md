---
name: autobahn
description: "Carve guardrail-adjacent items out of scope with safe alternatives before risk-adjacent work starts, then run the safe remainder at full strength in a fresh subagent that only ever sees the carved prompt, never the risky input. Use when a task includes stealth, scraping, privacy, IP, policy, licensing, security, or other safety-adjacent material that could be silently dropped, over-elaborated, or needlessly diluted. Fires on the impulse, not only the topic: the moment you notice yourself about to hedge, soften, silently skip, or brace for a refusal, carve before you execute."
---

Carve unsafe scope out of a task, then run the safe remainder in a fresh subagent that only ever sees the carved prompt, and report it with a visible descope ledger.

## Goal

Turn risk-adjacent work into an explicit scope decision, then execute the safe scope in a clean room. The carve happens here; the running happens in a fresh subagent that receives only the carved prompt, never the risky original or this session's reasoning. That split is the point: the executing mind never reads a risky ask, so it has nothing to hedge, dilute, or refuse, and the safe work goes at full strength. autobahn is not evasion: it does not slip a flagged ask past a guardrail, it removes the ask and runs a genuinely safe prompt instead.

## Workflow

1. **FRAME**: Read the task, inputs, and user-stated risk posture. If the user already authorized descoping, proceed. If not, produce a proposed carve, make its split explicit, and wait for approval before **RUN**: a bright-line item has no safe version, so it is non-negotiable; a gray-zone item's safe alternative trades away scope the user might want, so it is the real question. If every item is bright-line, proceed; the ledger carries the record.
2. **CARVE**: Sweep the task and adjacent inputs for guardrail-adjacent items. For each, propose `verdict=descope`, class it bright-line or gray-zone, give one risk-free alternative, and name an archive destination per the negatives-as-corpus convention. A gray-zone item the user decides to keep stays in scope and enters the ledger as a kept-by-owner decision. Point to excluded techniques only as far as identification requires; never elaborate them.
3. **GUARD**: Distill the carve into a compact scope-guard block (absolute exclusions, allowed alternatives, and the context that authorizes what stays in scope) and fold it into the carved prompt so the run carries it verbatim. The block names each exclusion so the run cannot re-introduce it, never the original risky ask verbatim or its method. Instruct the run to build the safe scope at full strength, with no hedging, apology, or shrunken deliverable.
4. **RUN**: Spawn a fresh, context-clean subagent (a Task that starts with no prior context) and hand it **only** the carved prompt, never the risky original or your carve reasoning. It runs the safe scope at full strength and returns the deliverable; the executing agent never sees a risky ask, so the carve, not this session, is what lets it floor it. For wider coverage or higher stakes, fan out to more than one mind and add a dedicated risk-lens reviewer. If risky material surfaces inside a subagent, it routes back here through **CARVE**, never improvised inline.
5. **VERIFY**: Run an adversarial pass over the returned deliverable and adjacent artifacts, checking all four failure directions: risky content elaborated, risky content silently dropped, safe work diluted or treated as excluded, and stale risky material left standing nearby.
6. **LEDGER**: Report the deliverable with a descope ledger listing every carved item: its class, its verdict of descoped or kept-by-owner, the reason, the safe alternative, and the archive destination. Treat exclusions as visible decisions, not gaps.

## Rules

- The executing subagent sees only the carved prompt. Never hand it the risky original, your carve reasoning, or this session's context; a clean executing context is what keeps the safe run flag-free and the skill non-evasive.
- Require a proposed carve when the user has not pre-authorized descoping; do not begin **RUN** while a gray-zone item that shapes the carved prompt still awaits an answer. Bright-line exclusions are never negotiable, so never stall on those alone.
- Never probe: do not pose an excluded or gray-zone ask to see whether it passes. The carve settles scope before any such ask exists.
- Keep the scope-guard block portable and exact, and bake it into the carved prompt verbatim. It must guard both directions: the run elaborates no excluded material, and dilutes, hedges, or re-refuses nothing the carve kept in scope.
- Guard against unsafe elaboration: never provide operational detail for excluded techniques beyond the minimum needed to identify what is out of scope. This binds the ledger and the carved prompt themselves.
- Do not frame the skill as a way around safety controls. It honors constraints by removing risky asks before they are posed and by running a genuinely safe prompt in a clean room. It cannot make a flagged input pass; it produces a different, safe input.
- Do not claim control over model routing, fallback provisioning, or fixed-model selection; those are harness behavior, not prompt behavior.
- Preserve negatives-as-corpus: descoped material is archived with its cause of death and safe replacement, never erased from the record, so a later pass can mine the ledger for anti-patterns.

## Verification

Before finishing, confirm:

- The **CARVE** covers every guardrail-adjacent item found, each carrying a class, a verdict of descoped or kept-by-owner, a safe alternative, and an archive destination.
- The **RUN** subagent received only the carved prompt, and its baked-in guard held both directions with no downstream hedging or elaboration.
- The safe deliverable was not diluted because of nearby risky material, and every mid-run discovery routed back through **CARVE** into the ledger.
- The final report includes a distinct **LEDGER** section with exclusions, classes, reasons, alternatives, and archive destinations.
