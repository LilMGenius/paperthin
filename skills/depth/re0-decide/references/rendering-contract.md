# Rendering contract

The surface is built by [`scripts/render.mjs`](../scripts/render.mjs) from a decisions file the agent writes; this contract owns that file's schema and the rules the script cannot decide. Markup, control types, step order, keys, saved answers, copy-out, the page's wording, escaping and the output path live in the script and its test, so this file does not restate them.

## Decisions file

One JSON object. The agent writes every judgment into it (which items exist, their tags, citations, consequences, notes and options); the script validates it at the boundary and exits 2 naming the first bad field. An unknown field is an error.

- `material.identity` (required string): the commit, file hash, version label or URL with retrieval date that binds the instrument to one version of the material.
- `material.path` (optional string, relative to the decisions file): the material file; without `--out` the surface is written beside it as `<name>.decision.html`.
- `material.handoff` (optional string): the reader the decision record goes to once the decider answers, when the material names one.
- `material.lang` (optional, `en` or `ko`, default `en`): the material's language, which the page's own wording follows.
- `items` (required non-empty array), each with `kind`, `text`, `source` (the citation), `mark` (`evidenced` or `claim`) and `answerer` (`artifact`, `submitter`, `delegate` or `decider`), optional `title` (a short name for the step list and the record) and optional `quote` (a string or list of strings, each the cited source text word for word), plus the fields its kind takes:
  - `gate`: `consequence`, what breaks when it is unmet.
  - `judgment`: `note`, the question the decider is asked to weigh.
  - `fork`: `options`, at least two alternatives with distinct labels, each a label string or an object with `label` and optional `detail` (what the option is), `consequence` (what choosing it changes), `image` (a png, jpg, webp or gif path relative to the decisions file, 1 MB or less, embedded in the page) and `defer: true` (choosing it postpones the decision); optional `fallback`, the one the material gives.
  - `risk`: optional `handling`, the handling the material states.
  - `intervention`, `exclusion` and `missing`: no extra field.

Run `node scripts/render.mjs <decisions.json> [--out <file.html>] [--json]`. Exit 0 wrote the surface (or found it unchanged), 2 is a usage, schema or image error, 3 means no option image, five decider answers or fewer and no hand-off reader, so the skill replies with a numbered list instead of a surface.

## Verdict arithmetic

The verdict is derived in the page from the current controls and recomputed on every change; the decisions file and the HTML store none.

- **blocked** applies when any **gate** is unmet, regardless of each **judgment**, and names every unmet gate with what it blocks.
- **conditional** applies when every **gate** is met and at least one **judgment** is unmet or one **fork** is not chosen or chosen at an option that defers, carrying each as an attached condition.
- **clear** applies when every **gate** and every **judgment** is met and every **fork** has a choice that does not defer. An empty judgment or fork set is fully met. An unanswered gate or judgment counts as unmet.

Which option a fork takes never changes the state, except that a deferring option leaves it open; the choices stay part of the current decision record.

## Judgment the script cannot make

- No control begins checked or chosen, and answers restored after a reload are only the decider's own for the same decisions file. The surface never recommends an option, scores alternatives toward an outcome, nudges with defaults, streaks or rewards, or shows progress implying that more approvals make a proposal better: progress counts answers, and "not met" counts as fully as "met".
- A quote copies the material's words and cites them; it never carries the material's own recommendation, since the page would then recommend for it. A consequence states only what the material says a choice changes.
- A fork is a choice among the named alternatives the material states, never free text, and never one the agent adds.
- The decider group is visually distinct and its size is legible at a glance; when every item is left to the decider the page reports that as a finding.
- Every string from the material is untrusted data. The script escapes it and places it only in text and attribute values; the agent copies the material's words into the decisions file as data and never writes markup into it.
