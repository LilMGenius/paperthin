---
name: debloat
description: "Compress an artifact that has accreted into bloat: padding, over-qualification, fused sentences, walls of enumeration, adjacent restatement. Bring it down to its load-bearing density, meaning preserved. Use when the user names an artifact, section, or diff whose prose is correct and current but has grown verbose or patched-over and wants it tight without a full rewrite, or when a pipeline the user invoked passes that scope on. Acts only inside that scope."
---

Cut a bloated artifact to its load-bearing minimum: same meaning, fewer words.

## Goal

Correct, current prose can accumulate qualifiers, repeated rules, and long enumerations until readers must study what they should skim. `debloat` cuts words that carry no meaning and preserves every load-bearing claim. It tightens otherwise sound prose; rewriting belongs to `re0` and deduplication to `ssotize`. The excess it removes is one class of machine-writing tell.

## Workflow

1. Pin the artifact and read it end to end. Note in one line what each section must convey and preserve.
2. Find padding, dispensable qualifiers or parentheticals, sentences fused from three ideas, enumerations that a rule and short list could replace, nearby restatement, and decision history where the rule alone suffices.
3. Compress in place: cut padding, split fused sentences or drop dead clauses, shorten enumerations, and keep repeated points once. Move nothing to another artifact and re-derive nothing.
4. Preserve every load-bearing rule, fact, constraint, and example. Keep any word whose removal would lose one.
5. If content is duplicated across artifacts or has gone stale, stop and name it. Hand duplication to `ssotize` and drift to `re0`; `debloat` only tightens.
6. Re-read cold and cut again; the first pass always leaves some.

## Rules

- Cut words, never load-bearing claims. Every rule, fact, and constraint survives; only density changes.
- Preserve voice and structure. Compress within them without re-styling.
- Compression removes excess-class machine-writing tells: padding, over-qualification, and adjacent restatement. Cite Wikipedia's published essay [Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) for any tell list consulted; never re-derive it. Hand drift to `re0`, duplication to `ssotize`, em-dashes to `dedash` (last, because rewriting regenerates dashes), and stack nouns to `detool`, which owns portability and is outside the tell-remover family.
- Respect intended richness: prose that teaches or orients, such as a quickstart or worked example, earns its length. Cut bloat while preserving accessibility.
- A pass that finds nothing genuinely bloated changes nothing.
- Compress only inside the scope a human named: the artifact, section, or diff they pointed at, or the scope a pipeline they invoked passes on. Never widen it or choose a target yourself; how tight to cut is the human's call, and a compress reflex that picks its own target over-compresses.
- Edit safely: assert each target exists and report a MISS rather than a silent no-op; edit unicode-safe (`PYTHONUTF8=1`), replace per occurrence, and script large structural moves.

## Verification

Before finishing:

1. Every load-bearing claim survives; only words were cut.
2. A cold reader finds the result tighter and intentionally terse without missing content.
3. Duplication and drift were handed to `ssotize`/`re0`, never force-compressed.
