---
name: dedash
disable-model-invocation: true
description: "Remove the em and en dashes an agent drops into running prose where a comma, colon, parentheses or a sentence break belongs, from a user-owned scope, keeping hyphens, ranges and dashes that separate a label from its text."
---

Remove the em and en dashes standing in for other punctuation inside running prose, one occurrence at a time, and leave every hyphen, range and label separator alone.

## Goal

An agent overuses the em dash inside ordinary sentences, where a writer would have reached for a comma, a colon, parentheses or a full stop. Removing those is this skill's whole job. Three characters are easy to confuse and do different work: the hyphen (U+002D) joins compounds and is never a candidate; the en dash (U+2013) marks ranges such as 1990 to 2000 and is a candidate only when it stands in for an em dash; the em dash (U+2014, with the look-alikes U+2015, U+2E3A and U+2E3B) is the usual offender. A dash in a fixed label slot, such as after a bold term opening a list item, after a heading's number or between a name and its tagline, is a typographic separator and stays. The user owns the scope: a passage, field, file, selection or tree. Ask before widening it.

## Workflow

1. **FIND**: Take the exact scope from the user. From this skill's folder run `node scripts/find.mjs <paths...> [--json]` over it. Input: files or directories. Output: every em and en dash with its file, line, column, code point, slot and line text, then a count per slot that sums to the total; `--json` prints one object with `counts` and `dashes`. Exit codes: 0 no in-sentence dash, 3 one or more, 2 a usage error, which is a broken run: fix the command and run again. A hyphen never appears in the list.
2. **READ each slot**: The script labels a dash by where it sits; the label is a lead, and the sentence decides.
   - *sentence*: a dash inside running prose. Replace it (step 3) unless the context proves it a label the script could not see, which you report.
   - *label*: a separator after a bold lead in a list item or table cell, after the first segment of a heading, or between a short name and its tagline in alt, title or aria-label text. Keep it. When a label line has a further dash inside its sentence, that later dash is labeled *sentence* on its own.
   - *range*: an en dash between two numbers, or unspaced between two words such as a London to Paris route. Keep it.
   - *protected*: code fences, inline code, URLs, other attribute values, and quoted words in a prose file. Keep it; a quotation keeps the dash its source wrote.
3. **REPLACE per role**: For each in-sentence dash, choose by grammatical role:
   - *Parenthetical aside*: commas or parentheses when the dashed material can be lifted out of the sentence.
   - *Appositive*: a colon or comma when the dashed material renames, defines or expands the noun before it.
   - *Abrupt turn*: a full stop, semicolon or comma when the dash marks a pivot, interruption or restart.
   - *False-conjunction break*: rewrite the sentence when the dash stands in for a missing "and", "but", "because", "so" or another real connective.
4. **RE-READ**: Read every changed sentence in place. Fix awkward rhythm, dangling punctuation, doubled spaces and lost connectors introduced by the replacement. If punctuation alone cannot solve it, rewrite the smallest clause that can. Run step 1 again: the in-sentence count is zero or each remaining one is a reported judgment call.
5. **REPORT**: State the scope checked, the per-slot counts before and after, replacements by role, and anything left as a judgment call.

## Rules

- This is a punctuation pass on the author's own choice of marks. Run last in any sequence of rewriting passes because a rewrite regenerates dashes; remove no other tell.
- Replace only in-sentence dashes. A label, range or protected dash is kept, and changing one to a colon or a hyphen is a defect, not a cleanup.
- Never do blanket replacement. The same glyph can require different punctuation in different clauses.
- Never replace an em dash with a hyphen as the cleanup.
- Read and write files as UTF-8 (`PYTHONUTF8=1` for Python) and replace each dash per occurrence, never by blanket sweep. If the scope contains no such dash, report a MISS rather than changing nearby punctuation.
- Preserve the user's voice. Remove the requested marks without flattening style outside the user-owned scope.

## Verification

Before finishing, confirm:

1. The scope stayed exactly user-owned.
2. Every replacement was an in-sentence dash, chosen per occurrence by grammatical role.
3. Label, range and protected dashes are unchanged, and the slot counts after the pass show it.
4. The report includes the counts and any judgment calls.
