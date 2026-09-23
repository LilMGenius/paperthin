---
name: dedot
disable-model-invocation: true
description: "Propose per-occurrence replacements for middle dots joining open enumerations in Korean prose or in visual label rows when the writer requests a punctuation review of a chosen scope."
---

Review word-joining middle dots in Korean prose or visual label rows and propose justified replacements without changing the writer's text.

## Goal

Distinguish open enumerations from sanctioned uses of the middle dot (U+00B7). The writer owns the scope: a passage, field, file, selection, or tree. Do not widen it without asking.

## Workflow

1. **SCOPE**: Run only on the writer's explicit invocation. Confirm the named target exists; if it does not, report a MISS and stop. Read only the chosen scope.
2. **FIND**: Locate U+00B7 joining words in Korean prose or in a visual label row, reading each occurrence in its full sentence or row. Exclude protected contexts before judging an enumeration; if no eligible occurrence exists, report a MISS without proposing nearby edits.
3. **KEEP**: Preserve all three sanctioned uses: an enumeration closed under one criterion, paired phrases, and a shared-component compression. Judge whether the items form a closed set under one criterion, never how many dots occur.
4. **JUDGE**: For a possible open enumeration, identify the grouping criterion and whether the items exhaust it. An unstated criterion does not prove openness. If the writer may regard the set as closed, ask for that interpretation; leave it unresolved with no replacement proposal.
5. **PROPOSE**: For each confirmed open enumeration, give its location, exact original span, proposed span, and a reason explaining why it is open rather than a sanctioned use. Choose the form by what the line is. In a prose sentence, propose a comma or a connective that keeps the items' relation (및 or 와/과 for items that go together, 이나 or 또는 for alternatives), and offer both only when both keep the meaning. In a visual label row or word cluster whose layout already separates the items, propose spacing with no separator. Leave the choice to the writer.
6. **RE-READ**: Read each proposed sentence in place to check meaning, particles, rhythm, and spacing. Report the scope, occurrence counts, proposals, sanctioned uses retained, protected contexts excluded, and unresolved judgments. Apply nothing.

## Rules

- 국립국어원 온라인가나다 answers 324634 and 327303 supply the rule: retain the three sanctioned middle-dot uses; use a comma for an open enumeration in prose, with 및 also recognized as a connective alternative. Choose other connectives by the sentence's meaning. Spacing in a label row is this skill's rule, not one of those rulings: a row whose layout already separates its labels needs no separator.
- The writer's connective option is untested; it is not a demonstrated improvement over the comma. Do not present earlier pilot results as evidence for the current scope.
- KatFishNet reported comma-containing sentences at 26.31% for human writing versus 61.03% for generated writing. This motivates caution about mechanical comma substitution; it does not establish middle dots as a diagnostic or prove that connectives improve detection outcomes.
- Never touch quoted text, proper names, chemical formulas, Catalan l·l, mathematics, dotted dates such as 3·1, the legal U+318D character, markdown markers, code and fenced blocks, or URLs. Similar-looking characters do not expand the target beyond U+00B7.
- Proposal only, per occurrence, with a reason each. Never sweep, automatically replace, edit the source, or shorten the enumeration. Leave unrelated wording and punctuation alone.
- Like the family's other punctuation pass, run after any rewrite and remove only the mark this pass owns. Every removal remains a proposal for the writer.
- Read Unicode safely, setting PYTHONUTF8=1 when using Python. Preserve the exact original span in each proposal so the writer can locate it without a blanket search-and-replace.

## Verification

Before finishing, confirm:

1. The review stayed within the writer's explicit scope and the source remains unchanged.
2. Every proposal targets U+00B7 in a confirmed open enumeration and records its location, original, replacement, and criterion-based reason.
3. All three sanctioned uses and every protected context received zero replacement proposals; ambiguous closure remains unresolved.
4. Each proposal's form fits its line (a comma or connective in prose, spacing in a layout-separated label row) and preserves meaning; both linguistic sources are identified, and the connective branch is not claimed as tested.
5. The report includes counts, retained cases, exclusions, and unresolved judgments; a review finding nothing to propose says so.
