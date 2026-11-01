---
name: dedot
disable-model-invocation: true
description: "Review the middle dots (U+00B7) in a Korean passage, field, section, file or folder the writer names, and propose a per-dot replacement only where a dot strings together an open list, keeping every legitimate or protected dot and leaving the text unedited."
---

## Goal

Find every middle dot (U+00B7) in the text the writer named, give each one a single verdict, and propose a replacement only for dots that join an open list. The review never edits the writer's text.

## Workflow

### When this applies

Run the review only when the writer asks for a middle-dot or punctuation review of a named Korean passage, field, section, file, selection or folder, including a final pass over text after a rewrite. For any other request (a summary, a general copyedit or spelling pass, a check of other punctuation marks such as commas or quotation marks, a translation, a rewrite), do that task as asked, at the full reach it calls for, and leave this skill out of it: no review section, and no mention of this skill, its rules or the fact that it was not used. The restraint below (only the separators change, the comma comes first, one verdict per dot, nothing said about other marks) shapes middle-dot proposals and nothing else; it never narrows another task. Such a task covers everything it asks for (in a copyedit: spelling, spacing, wording, other punctuation, sentence flow), gives each problem the fix that reads most naturally rather than the smallest one, and offers alternatives wherever a careful editor would; in a copyedit, middle dots are ordinary editing like any other mark. If the writer asks for the dots to be fixed directly in the file, do the edit they asked for, applying the judgment below to each dot (legitimate and protected dots stay, each list keeps its relation), change nothing else, and say plainly which spans changed and which dots were left and why.

### Scope

The scope is exactly what the writer named. If a named file or path does not exist, say which path you looked for, mention a similarly named file nearby only as a question, and stop without reviewing anything. Create, rename or edit no file, not even a temporary extract. When the scope is part of a file (a field such as a store-listing description, the section under one heading), find its first and last line and pass them with `--lines`. Dots outside the scope are neither judged nor counted; one line saying that other parts also contain middle dots, with an offer to review them on request, is enough.

### Finding the dots

Run `node scripts/find.mjs <file-or-folder> [--lines A-B] [--json]`. It lists every U+00B7 in scope with its line, column, a kind and the line text, then the in-scope total, the dots outside `--lines`, and any look-alike characters (U+318D ㆍ, U+2027 ‧, U+30FB ・ and others), which are different characters: never counted, never changed, mentioned only as not in scope. The kinds `code`, `url`, `quote`, `digits`, `formula`, `catalan` and `bullet` are protected contexts it recognised mechanically, and they stay in the count. `review` is everything else: read each in its full sentence or row and judge it below, and still check it for a protected context the script cannot see, such as a proper name. The script is your instrument; the report talks about the writer's text, never about the script, its kinds or exit codes. If you read files any other way, read them as UTF-8 (set `PYTHONUTF8=1` for Python).

### Legitimate dots: keep

Two answers from the National Institute of Korean Language's online Q&A, 온라인가나다 324634 and 327303, keep the middle dot in three roles and call for a comma, or 및, when the dot only strings together a list that could go on.

1. A set closed under one criterion: the items are the whole set. The sentence may close it by stating the count (세 과목인 국어·영어·수학), or common knowledge closes it with no criterion stated (동·서·남·북, 12 months, the days of a week, the four seasons). Keep a commonly closed set without asking.
2. Paired phrases: two words read as one pair or opposite (남·녀, 노·사, 여·야, 수입·수출).
3. An element shared between words, written once: 출·퇴근 (출근, 퇴근), 국·공립, 장·단점, 3·4분기.

Closure is judged by meaning, never by how many dots there are: a two-item list can be open and a five-item list closed.

### Open lists: change

A list is open when its items are examples of a larger class. Markers usually say so (등, 같은, 처럼, 따위, 을 비롯한, 예를 들면), or the writer says the items are a selection. A dot between separately named things (brands, products, tools) is a list like any other; the name protection covers only a dot inside one name.

When the text cannot tell whether the items are the whole set and only the writer knows (values or members someone mentioned, a team's own list), ask instead of deciding. Quote the span, say what would decide it (whether these are all of them), and write no replacement in any form: not a conditional one (열린 나열이라면 ...로), not a version to use later. It counts as undecided. Do not ask about a set the sentence or common knowledge already closes.

### Protected: never proposed

Quoted text (inside quotation marks, even when it looks like a list), a proper name containing a dot (a company, product, work or event), chemical formulas and mathematics, dotted dates and digit groups (6·25, 4·19, a decimal written with a dot), Catalan l·l, markup syntax, code, and URLs. A name that is also a pair is kept either way.

### Proposing a replacement

In a review, one proposal per open list, covering all of its dots. Give the location (file and line), the original span copied exactly, character for character, including the marker (등, 같은) so the writer can find it, the proposed span, and a short reason saying why the items are an open list. Then re-read the proposal in its sentence for particles and spacing.

- In prose, the comma: A·B·C 등 becomes A, B, C 등. Only the separators change; every item, the marker and all other wording and punctuation stay.
- A connective is a second option only when it keeps the items' relation and reads naturally: 및 or 와/과 when the items go together (all of them apply), 이나 or 또는 when they are alternatives (one is chosen). When the items are alternatives, say in the reason that an and-word would change the meaning. 및 right before 등 often reads heavy; the comma alone is then the better offer.
- In a label row whose layout already separates the items (tags or chips the writer describes as separate, menu or nav items, one item per cell), drop the dots and leave plain spacing with no new mark. A closed or paired label row stays as it is.

### The report

Write to the writer in their language, about their text:

1. One opening line with the counts in dots: in-scope U+00B7 total, how many to change, kept, excluded as protected, and undecided, summing to the total. Digit and date dots are in the total; look-alikes and out-of-scope dots are not.
2. The proposals.
3. The questions, each with no replacement.
4. Kept dots with their role and excluded dots with their protected category, each with line and span.
5. The basis line from Evidence, and that the file was not changed.

Give each dot one verdict; an answer that offers both a change and a keep for one dot is weaker than either. When nothing needs to change, say so plainly and propose nothing. The review says nothing about anything except middle dots: no notes on spelling, spacing, grammar, dates, wording or other punctuation, not even as an out-of-scope aside. That silence belongs to the review alone; any other task covers everything it asks for.

## Rules

### Evidence

Name both rulings, 온라인가나다 324634 and 327303, as the basis for keeping the three roles and for the comma or 및 in prose. Where you use them, say that spacing in a label row is this skill's own rule, not one of the rulings, and that 와/과, 이나 and 또는 are chosen from the sentence's meaning and are not what the rulings test; 및 itself is in the rulings. Cite no statistics or detector studies, and claim no benefit beyond matching the rulings.

## Verification

Before finishing, confirm that the opening counts sum to the in-scope total, that every proposal carries its location, exact original span, proposed span and reason, that no question carries a replacement, and that the file is unchanged unless the writer asked for the dots to be fixed directly.
