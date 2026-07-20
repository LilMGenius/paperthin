---
name: debloat
disable-model-invocation: true
description: "Compress an artifact that has accreted into bloat — padding, over-qualification, fused sentences, walls of enumeration, adjacent restatement — down to its load-bearing density, meaning preserved. Use when prose is correct and current but has grown verbose or patched-over and you want it tight without a full rewrite."
---

Cut a bloated artifact to its load-bearing minimum: same meaning, fewer words.

## Goal

An artifact that is correct and current can still rot a second way: it accretes. Each edit bolts a qualifier onto the nearest sentence, a rule gets restated wherever it might apply, an enumeration grows into a wall — until a reader must study what they should skim. `debloat` compresses that bloat to its load-bearing density: every claim that carries weight survives, every word that does not is cut. It is not a rewrite (`re0`), a dedup (`ssotize`), or a tell-remover (`dedash`, `detool`) — it is a density pass on prose that is otherwise fine.

## Workflow

1. Pin the artifact and read it end to end; note in one line what each section must convey — the load-bearing content that has to survive.
2. Find the bloat, not the content: padding that adds length but not meaning; a qualifier or parenthetical the sentence holds without; a fused sentence carrying three ideas; a wall of enumeration where a rule plus a short list would do; a point restated within reach of itself; litigation-history (why-we-decided-it) where the rule alone suffices.
3. Compress in place: cut the padding, split the fused sentence or drop its dead clause, collapse the wall, keep a repeated point once. Move nothing to another artifact and re-derive nothing.
4. Preserve every load-bearing claim — a rule, fact, constraint, or example that carries weight. If cutting a word would lose one, keep the word.
5. When the bloat is really duplication across artifacts, or the content has drifted stale, stop and name it: hand duplication to `ssotize` and drift to `re0`. `debloat` only tightens.
6. Re-read cold and cut again — the first pass always leaves some.

## Rules

- Cut words, never load-bearing claims. Every rule, fact, and constraint that was there is still there; only the density changed.
- Preserve the artifact's voice and structure; compress within it, do not re-style it.
- Not a rewrite, a dedup, or a tell-remover: re-derive nothing (`re0`), move nothing to another home (`ssotize`), and leave em-dashes and stack nouns to `dedash`/`detool`.
- Respect intended richness: human-facing prose meant to teach or orient (a quickstart, a worked example) earns its length — compress the bloat, not the accessibility.
- A pass that finds nothing genuinely bloated changes nothing.
- Mutate with edit-safety: assert each target exists (report a MISS, never a silent no-op), edit unicode-safe (`PYTHONUTF8=1`), replace per occurrence, and script a large structural move.

## Verification

Before finishing:

1. Every load-bearing claim present before is present after — only words were cut.
2. The result reads tighter to a cold reader, and reads as intended-terse, not amputated.
3. Anything that was duplication or drift, not bloat, was handed to `ssotize`/`re0`, not force-compressed.
