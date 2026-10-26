# Grammars

How a decided placement becomes bytes, and how those bytes are undone.

## Grammar detection

Read the destination document before editing it and identify which of four shapes it uses. The edit obeys the shape found, not the shape the run would prefer.

- **Reverse-chronological dated log.** Entries carry a date and the newest sits at the top of its section.
- **Numbered section list.** Each numbered section states a claim and the condition under which that claim graduates.
- **Fixed-column table.** A header row fixes the column count and every row matches it.
- **Free prose.** Sections of running text with no per-entry structure.

A document that matches none of the four is reported as an unknown grammar and left untouched.

Shape is the document's structure. The template sits one level below it: the fields a single entry carries and the order they sit in. Read two neighbouring entries at the insertion point and match the template they share, including which field holds the run's own reading of the material. An entry that puts that reading in the body asserts it at the same confidence as the observation it was drawn from.

## Per-shape insertion

**Reverse-chronological dated log.** Position the entry by its own date inside the correct section: above every entry older than it, below every entry newer. It lands at the top only when its date is the newest one there. The date field takes the date the source itself carries, the earliest publication or execution date of the material. When that date cannot be established, say so in the entry instead of estimating it. A date describing when the material was received goes in a separate field and is never promoted into the primary slot.

**Numbered section list.** Append one new section at the end. Existing sections keep their numbers. The new section carries both its claim and the condition that would graduate it, because a claim with no graduation condition cannot later be ruled on.

**Fixed-column table.** Count the header columns first and match that count exactly. Material carrying more fields than the table has columns is not written; the extra fields are reported and the row is left unplaced. Widening a table to fit one row changes every other row's meaning.

**Free prose.** Insert inside the section the map document names as the owner of the subject. Appending at the end of a file is how a document loses its shape one paragraph at a time.

## Correction protocol

A correction edits the falsified span where it already sits. Appending is not a correction: a second entry contradicting the first leaves a reader to guess which one is current, and both remain greppable.

What changes is the assertion the closer read falsified. What stays is the evidence underneath it, which survived that read and is still the reason the line exists. Strikethrough, an edit marker, a parenthetical noting the change, or a date stamp beside the rewrite are residue and none of them is written. The corrected text reads as though it had always said this.

Reversibility comes from the recorded hash, not from leaving the old wording visible.

## Revert protocol

Hash every destination file with SHA-256 before its first byte is written (sha256sum, shasum -a 256, or Get-FileHash), and carry those hashes in the result. The result states the restore path in one line: compare the file against its recorded hash to prove which bytes were the pre-edit ones, then discard the change through the target's version control when the file is tracked, or restore from a copy taken at hash time when it is not.

This record stands in for the review a human would have done before the edit landed.

## Confidence floor

The score is computed over three observations, all products of the map read:

- **Candidate spread.** How many tiers survived the map read as plausible owners. One survivor scores high, several score low.
- **Rule provenance.** Whether the winning candidate was chosen by quoting a rule found in the map, or by inference across rules that do not name this case. A quoted rule scores high; an inference scores low.
- **Shape fit.** Whether the material's shape is one the destination's grammar accepts without reworking the material.

The floor is a rule rather than a number: write only when the winning candidate quotes a rule AND either no other candidate survived or every surviving rival is rejected by a rule that is also quotable. Anything short of that is under the floor. Below it, report the material as unplaced with at least two rejected candidates and the reason each one failed.

That formulation is a chosen default, not a measured constant. It sits where it does because the failure it guards against, a confident write into the wrong document, costs more to find than an unplaced item costs to route by hand.

## Result block

Four fields, all present on every run. A field with no rows is written empty, because a missing field and an empty field look identical to someone skimming.

- **Touched.** Each destination file with its pre-edit SHA-256.
- **Placed.** Each claim with its destination and the rule quoted to justify it.
- **Unplaced.** Each claim with the candidates rejected and the reason each was rejected.
- **Created.** Each new file with the reason no existing tier could hold the material.
