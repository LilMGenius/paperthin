---
name: dedash
disable-model-invocation: true
description: "Remove em-dashes and the dashes standing in for them from a user-owned scope, reading each occurrence in context and choosing the punctuation or wording that fits."
---

Remove em-dashes and their substitutes from the user's scope, one occurrence at a time, leaving hyphens, ranges, and deliberate marks alone.

## Goal

Replace each unwanted em-dash with the punctuation or wording its clause needs. Target any dash doing that job: U+2014 and its longer or repurposed look-alikes read the same on the page. The user owns the scope: a passage, field, file, selection, or tree. Ask before widening it.

## Workflow

1. **FIND**: Take the exact scope from the user. From this skill's folder run `node scripts/find.mjs <paths...> [--json]` over it. It prints each candidate dash with its file, line, column, code point and line text; `--json` prints one JSON object. Exit codes: 0 no dash, 3 dashes found, 2 a usage error, which is a broken run: fix the command and run again. The script lists the em-dash, horizontal bar, two- and three-em dashes, and every en-dash between two words, and skips fenced and inline code, URLs and numeric ranges. Judge each hit's role in the sentence, not its codepoint: an en-dash that joins clauses where an em-dash would fit is a dash to replace, while a range endpoint pair such as the `London–Paris` route is kept. Keep hyphens, minus signs, and ranges doing their own jobs. Surface ambiguity as a judgment call.
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
4. **RE-READ**: Read every changed sentence in place. Fix awkward rhythm, dangling punctuation, doubled spaces, and lost connectors introduced by the replacement. If punctuation alone cannot solve it, rewrite the smallest clause that can.
5. **REPORT**: State the scope checked, dashes found and changed, replacements by role, and anything left alone or surfaced as a judgment call.

## Rules

- This is a punctuation pass on the author's own choice of marks. Run last in any sequence of rewriting passes because a rewrite regenerates dashes; remove no other tell.
- Never do blanket replacement. The same glyph can require different punctuation in different clauses.
- Never replace an em-dash with a hyphen as the cleanup.
- Edit unicode-safe (`PYTHONUTF8=1`) and replace each dash per occurrence, never by blanket sweep. If the scope contains no such dash, report a MISS rather than changing nearby punctuation.
- Preserve the user's voice. Remove the requested marks without flattening style outside the user-owned scope.

## Verification

Before finishing, confirm:

1. The scope stayed exactly user-owned.
2. Every replacement was selected per occurrence by grammatical role.
3. Leave-alone cases stayed untouched or were reported as judgment calls.
4. The report includes counts and any judgment calls.
