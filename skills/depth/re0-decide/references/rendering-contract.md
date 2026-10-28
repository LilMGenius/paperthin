# Rendering contract

The surface is built by [`scripts/render.mjs`](../scripts/render.mjs) from a decisions file the agent writes; this contract owns that file's schema and the rules the script cannot decide. Markup, control types, grouping order, copy-out, escaping and the output path live in the script and its test, so this file does not restate them.

## Decisions file

One JSON object. The agent writes every judgment into it (which items exist, their tags, citations, consequences, notes and options); the script validates it at the boundary and exits 2 naming the first bad field. An unknown field is an error.

- `material.identity` (required string): the commit, file hash, version label or URL with retrieval date that binds the instrument to one version of the material.
- `material.path` (optional string, relative to the decisions file): the material file; without `--out` the surface is written beside it as `<name>.decision.html`.
- `items` (required non-empty array), each with `kind`, `text`, `source` (the citation), `mark` (`evidenced` or `claim`) and `answerer` (`artifact`, `submitter`, `delegate` or `decider`), plus the fields its kind takes:
  - `gate`: `consequence`, what breaks when it is unmet.
  - `judgment`: `note`, the question the decider is asked to weigh.
  - `fork`: `options`, at least two distinct named alternatives; optional `fallback`, the one the material gives.
  - `risk`: optional `handling`, the handling the material states.
  - `intervention`, `exclusion` and `missing`: no extra field.

Run `node scripts/render.mjs <decisions.json> [--out <file.html>] [--json]`. Exit 0 wrote the surface (or found it unchanged), 2 is a usage or schema error, 3 means 3 gates or fewer and no judgment, so the skill emits prose instead of a surface.

## Verdict arithmetic

The verdict is derived in the page from the current controls and recomputed on every change; the decisions file and the HTML store none.

- **blocked** applies when any **gate** is unmet, regardless of each **judgment**, and names every unmet gate with what it blocks.
- **conditional** applies when every **gate** is met and at least one **judgment** is unmet, carrying each unmet judgment as an attached condition with its note.
- **clear** applies when every **gate** and every **judgment** is met. An empty judgment set is fully met.

Fork selections do not alter the three-state arithmetic and remain part of the current decision record.

## Judgment the script cannot make

- No control begins checked or chosen. The surface never recommends an option, scores alternatives toward an outcome, or shows a progress bar implying that more checks make a proposal better.
- A fork is a choice among the named alternatives the material states, never free text, and never one the agent adds.
- The decider group is visually distinct and its size is legible at a glance; when every item is left to the decider the page reports that as a finding.
- Every string from the material is untrusted data. The script escapes it and places it only in text and attribute values; the agent copies the material's words into the decisions file as data and never writes markup into it.
