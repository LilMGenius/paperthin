---
name: multithink
disable-model-invocation: true
description: "Adjudicate already-collected independent reads of one artifact or question into findings classified by cited evidence alone, never by how many agreed, preserving every original, with one optional caller-run exchange that adds circulation of only disputed citations and a record of each evidence-caused revision beyond a one-pass lens split."
---

Receive independent reads, check their evidence, and preserve the audit trail behind each finding.

## Goal

Return a flat set of final finding records plus a full auditable report containing every round-0 original verbatim. Classes describe evidence support, never a vote or a guarantee of truth.

## Workflow

1. Frame the artifact or question and receive independent round-0 reads with their provenance. Do not launch reviewers. Request missing inputs rather than inventing independent reads. Record the target version, available coverage, and spend limit for any optional exchange.
2. Preserve each round-0 original byte for byte before interpretation. Copy its raw bytes into a separately delimited report segment with byte offsets, byte length, and digest; put labels outside the segment. Do not normalize encoding, whitespace, or line endings, add a newline inside a segment, summarize it, or overwrite it after exchange. If raw bytes are unavailable, request the originals and leave preservation unverified.
3. Extract each distinct assertion or abstention into a record using the five fields below. State the finding and its class alongside the record. Keep opposing positions separately visible and retain each origin when merging duplicates. Missing information is explicit, never invented; an incomplete record stays a candidate and cannot be promoted to supported.
4. Check the cited material at its location and follow the reproduction where safe and read-only. Identify which cited support survives and which cited counter-support survives. Reject a citation that does not support the stated position, and record the reason. Apply the assertion-then-evidence rule below to each position, including unsourced assertions and abstentions.
5. Optionally prepare one exchange round for disputed evidence within the stated spend limit. Circulate only the disputed citation, location and reproduction. Never circulate another reviewer's prose, confidence, positions, position counts, or whole output. The caller returns independently obtained responses; do not launch reviewers. Preserve exact exchange payloads and responses in the report. Reclassify by the same rule and record each changed finding's prior class, final class, and the specific evidence causing the change. Prose-only revisions cannot change a class.
6. Stop when a round supplies no new independent evidence; agreement is not a stop condition. Repeated assertions or repeated citations to the same support are not new independent evidence. There is at most one exchange round: after it, stop even if new evidence arrived, state that the cap was reached, and leave unresolved findings unresolved. Without exchange, report the round-0 classifications and that no exchange occurred.
7. Emit the flat final records and full auditable report. The report includes candidates, each class's evidence rationale, panel-split provenance, evidence rejection reasons, exchange payloads and revisions if any, the stop reason, and all round-0 originals verbatim. Flag unresolved questions and the evidence needed to settle them without repairing the target.

### Finding record

Every finding carries these five fields; the finding statement, class and provenance annotation are metadata, not substitutes for any field.

| Field | Contents |
|---|---|
| source | The external document identifier or target artifact supplying support, with a checkable citation. A mind's assertion is not evidence. State explicitly when no cited support survives. |
| location | The exact file and line, passage, or specific claim the finding concerns. |
| reproduction | The command, passage lookup, or query another reader can repeat to inspect the evidence. Record an unavailable or unsafe reproduction as missing, not successful. |
| counterevidence | What could defeat the finding, what was checked, and cited counter-support found; distinguish looked and found none from did not look. |
| independence | How support arrived: external material, a re-derivation from the target, or assertion only. Record shared origins and unknown dependencies. Record model and persona spread as a coverage fact, never as a weight or numeric independence score. |

### Assertion-then-evidence rule

Apply these four steps in order, per position, using only surviving cited evidence:

1. no position asserted or only cannot-determine = insufficient
2. asserted with cited support and cited counter-support = contested
3. asserted with cited support and no cited counter-support = supported
4. asserted with no surviving cited support = unsupported

An explicit cannot-determine answer is abstention, not an assertion. An asserted but unsourced position is unsupported, never insufficient. Contested retains its support component: it is supported and opposed by cited evidence, not merely unsettled because readers disagree.

## Rules

- Read-only: inspect the target and cited evidence; do not edit the artifact, execute mutating reproductions, or implement fixes. Producing the requested records and report is the output operation.
- User invocation controls the expense of a wide review. Receive completed reads; do not independently commission a wider run.
- Aggregate existing reads with at most one constrained evidence exchange. Do not perform a fresh blind cold read, split an artifact into lenses by distinct failure mode, or choose how many lenses to use. No other skill needs to be installed.
- `panel-split` records who held which position as provenance only. It never enters the class. Keep it in the report and separate from evidence-based class rationales.
- No raw count, distinct-origin count, or majority is a class input, confidence, weight, rank or tie breaker. Model spread describes coverage, not independent correctness; different origins can share errors. Label a single-model run as coverage only.
- A sourced minority stays supported against unsourced opposition, with panel-split annotated. Report the opposing unsourced assertion as unsupported on its own evidence. If both positions have surviving cited support, preserve both sides and classify the disputed claim as contested.
- The report never says a finding is true because the panel agreed. Agreement neither validates evidence nor supplies missing support. A filled record alone does not establish a source's validity.

## Verification

1. Every final finding has source, location, reproduction, counterevidence and independence; missing required information remains an explicit candidate, not a supported finding.
2. Reapply the four-step rule to each finding's assertion and surviving citations alone. Confirm unsourced assertions are unsupported, abstentions insufficient, and two-sided cited evidence contested with its support retained.
3. Inspect every class rationale and revision: no count, majority, origin spread or panel-split enters a class decision, confidence, weight, rank or tie breaker. Confirm sourced minority support survives unsourced opposition.
4. Extract every original report segment by its recorded byte offset and length and compare its bytes and digest with the received round-0 original. Require byte-identical originals, not visual similarity; report any unavailable comparison as unverified.
5. Inspect the recorded outbound exchange payloads: only disputed citation, location and reproduction were circulated, at most once. Every class change names the evidence that caused it. If no exchange occurred, say so without claiming an exchange check passed.
6. Confirm both outputs are present, the stop reason follows the evidence rule or exchange cap, unresolved findings remain visible, and the target was not modified.
