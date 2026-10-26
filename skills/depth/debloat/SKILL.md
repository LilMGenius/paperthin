---
name: debloat
description: "Cut an artifact that has accreted into bloat, prose or code, to its load-bearing density, meaning and behavior preserved. In prose: padding, over-qualification, fused sentences, walls of enumeration, adjacent restatement. In code, behind green tests: comments that restate the code, commented-out code, vague TODOs, dead code, debug leftovers, guards on guaranteed values, pass-through wrappers, single-use helpers, and nesting a guard clause flattens. Use when the user names an artifact, section, file list, or diff that is correct and current but verbose, patched-over, or slop-filled and wants it tight without a full rewrite; when they ask to clean up, deslop, or remove AI slop from code or recent changes; or when a pipeline the user invoked passes that scope on. Acts only inside that scope."
---

Cut a bloated artifact, prose or code, to its load-bearing minimum: same meaning, same behavior, less text.

## Goal

Correct, current work accumulates excess. Prose gathers qualifiers, repeated rules, and long enumerations until readers must study what they should skim. Code gathers comments that restate it, branches nothing reaches, guards against states that cannot occur, and layers that only forward a call. `debloat` cuts what carries no meaning or behavior and preserves everything load-bearing. It tightens otherwise sound work; rewriting belongs to `re0`, deduplication across artifacts to `ssotize`, and code conventions to `re0-style`. The excess it removes is one class of machine-writing tell.

## Workflow

1. Pin the artifact and read it end to end. Note in one line what each section must convey, or what each unit of code must do.
2. Lock behavior before cutting code. Find the existing tests that exercise the observable behavior in scope (exports, handlers, commands, anything called from elsewhere), add the narrowest test that pins what they leave uncovered (it stays with the change), and run them green. Without a green baseline, stop and report before cutting code; prose in the same scope can still be tightened. Prose has no behavior to lock, so skip this step for it and never pin its wording with a text test; a value a machine parses out of it is checked through its real validator.
3. Find the excess in prose: padding, dispensable qualifiers or parentheticals, sentences fused from three ideas, enumerations that a rule and short list could replace, nearby restatement, and decision history where the rule alone suffices.
4. Find the excess in code. First ask whether each unit should exist, in this order: delete it when nothing needs its behavior; reuse what the codebase already has when it reimplements that; call the platform, the standard library, or an installed dependency when one already does it; only then simplify it in place. What survives is checked for comments that restate the code, commented-out code, vague TODOs, dead code (unused imports and private functions, unreachable branches, debug leftovers), branches repeated within the scope, defensive checks on values the code already guarantees, pass-through wrappers and single-use helpers, and nested conditionals a guard clause flattens.
5. Compress in place. In prose, cut padding, split fused sentences or drop dead clauses, shorten enumerations, and keep repeated points once. In code, cut from safest to riskiest, one class at a time with the lock rerun after each: comments, dead code, defensive checks, repetition, nesting, then abstraction. Move nothing to another artifact.
6. Preserve every load-bearing rule, fact, constraint, example, and observable behavior. Keep any word or line whose removal would lose one, and skip any code cut whose equivalence is not obvious.
7. After cutting code, rerun the lock and the checks the repository runs on every change (its test, lint and type commands). Revert the class whose cut turned one red and keep that code.
8. If content is duplicated across artifacts or has gone stale, stop and name it. Hand duplication to `ssotize` and drift to `re0` as a named finding for those skills to act on; `debloat` only tightens. Report excess you notice outside the scope without touching it.
9. Re-read cold and cut again; the first pass always leaves some.

## Rules

- Cut words and code that carry nothing, never load-bearing claims or behavior. Every rule, fact, constraint, and observable behavior survives; only density changes.
- Preserve voice and structure. Compress within them without re-styling. In code, public signatures and type annotations stay, and no abstraction or dependency is added.
- In code, keep what is load-bearing even when it looks like excess:
  - a comment that explains why: a business rule, an edge case, a workaround, a ticket link, a regex or algorithm, a recorded shortcut and its ceiling; and test-structure markers such as given, when, then;
  - validation and error handling at a trust boundary (user input, external APIs, I/O, nullable stored fields), unless a hostile-input test proves a check inside the boundary already rejects that input; without that proof the guard stays;
  - code reached by reflection, dynamic dispatch, or string lookup, and a rollback path its owner keeps on purpose; ask when unsure;
  - an abstraction that is a real seam: testability, more than one implementer, or a boundary the framework requires;
  - lookalike code serving different intents that could diverge; leave it apart rather than forcing a shared helper.
- Compression removes excess-class machine-writing tells: padding, over-qualification, and adjacent restatement. Cite Wikipedia's published essay [Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) for any tell list consulted; never re-derive it. Hand drift to `re0`, duplication to `ssotize`, code conventions to `re0-style`, em-dashes to `dedash` (last, because rewriting regenerates dashes), and stack nouns to `detool`, which owns portability and is outside the tell-remover family.
- Report, never cut, what is not excess: a performance rewrite, which needs a benchmark and its own change; layering moves, exhaustive matching, and other language idioms, which belong to `re0-style` or the language's own tooling; module size limits and file splits, a restructure the human scopes separately; and test coverage beyond the lock.
- Respect intended richness: prose that teaches or orients, such as a quickstart or worked example, earns its length. Cut bloat while preserving accessibility.
- A pass that finds nothing genuinely bloated changes nothing.
- Compress only inside the scope a human named: the artifact, section, file list, or diff they pointed at, or the scope a pipeline they invoked passes on. Never widen it or choose a target yourself; how tight to cut is the human's call, and a compress reflex that picks its own target over-compresses.
- Edit safely: assert each target exists and report a MISS rather than a silent no-op; edit unicode-safe (`PYTHONUTF8=1`), replace per occurrence, and script large structural moves.

## Verification

Before finishing:

1. Every load-bearing claim and observable behavior survives; only excess was cut.
2. Every code cut happened behind a green lock, and the lock and the repository's checks are green after it.
3. A cold reader finds the result tighter and intentionally terse without missing content.
4. Duplication, drift, conventions, and finds outside the scope or the excess class were handed to their owners or reported, never force-compressed.

Report the scope, the lock (tests found, added, and the baseline), the cuts by class, each keep or skip with its reason, and every handoff.
