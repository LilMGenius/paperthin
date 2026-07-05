---
name: dedash
disable-model-invocation: true
description: "Remove em-dashes and the dashes standing in for them from a user-owned scope, reading each occurrence in context and choosing the punctuation or wording that fits."
---

Remove em-dashes and the dashes standing in for them from the scope the user names, one occurrence at a time, while leaving hyphens, ranges, and deliberate marks alone.

## Goal

Replace each em-dash that should not remain with the mark or wording its clause actually needs. Target any dash doing an em-dash's job, whatever its exact character: U+2014 and its longer or repurposed look-alikes all read the same on the page. The user owns the scope: a passage, field, file, selection, or tree. Do not widen it without asking.

## Workflow

1. **FIND**: Take the exact scope from the user and locate every dash doing an em-dash's job in it, judged by the role it plays in the sentence, not its codepoint: any mark that sets off an aside, an appositive, an abrupt turn, or a missing conjunction. The em-dash (U+2014) is the common one; the horizontal bar (U+2015) and the two- and three-em dashes (U+2E3A, U+2E3B) read the same and count. The en-dash (U+2013) is the boundary case: it counts when it joins clauses where an em-dash would fit, but stays when it spans a range's endpoints, numeric or not (`1990–2020`, the `London–Paris` route). A dash doing a non-em job (a hyphen, a minus, a range) stays. Surface anything genuinely ambiguous as a judgment call rather than changing it blindly.
2. **REPLACE per role**: Choose per occurrence by grammatical role:
   - *Parenthetical aside*: commas or parentheses when the dashed material can be lifted out of the sentence.
   - *Appositive*: a colon or comma when the dashed material renames, defines, or expands the noun before it.
   - *Abrupt turn*: a full stop, semicolon, or comma when the dash marks a pivot, interruption, or restart.
   - *False-conjunction break*: rewrite the sentence when the dash stands in for a missing "and", "but", "because", "so", or another real connective.
3. **LEAVE-ALONE**: Unless the user explicitly includes them and the context proves them wrong, leave untouched:
   - hyphenated compounds, minus signs, and negative numbers
   - ranges such as `1-10`, `1–10`, or `London–Paris`; a range dash is not an em-dash
   - code, diffs, command output, identifiers, serialized data, URLs, paths, anchors, and query strings
   - quoted or clearly deliberate em-dashes in stylized prose; these surface as judgment calls, never as blind mutations
4. **RE-READ**: Read every changed sentence in place. Fix awkward rhythm, dangling punctuation, doubled spaces, and connector loss introduced by the replacement. If the sentence now needs wording instead of punctuation, rewrite the smallest clause that solves it.
5. **REPORT**: State the scope checked, how many dashes were found and changed, which replacements were used by role, and anything left alone or surfaced as a judgment call.

## Rules

- Never do blanket replacement. The same glyph can require different punctuation in different clauses.
- Never replace an em-dash with a hyphen as the cleanup.
- Mutate with edit-safety: edit unicode-safe (`PYTHONUTF8=1`) and replace each dash per occurrence, never a blanket sweep; if the scope contains no such dash, report a MISS rather than changing nearby punctuation.
- Preserve the user's voice. This skill removes a mark where requested; it does not flatten style outside the user-owned scope.

## Verification

Before finishing, confirm:

1. The scope stayed exactly user-owned.
2. Every replacement was selected per occurrence by grammatical role.
3. Leave-alone cases stayed untouched or were reported as judgment calls.
4. The report includes counts and any judgment calls.
