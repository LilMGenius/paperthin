# Rendering contract

## Verdict arithmetic

The surface derives its verdict from the current controls. It recomputes on every control change. It never stores a fixed verdict string in the decision document.

- **blocked** applies when any **gate** is unmet, regardless of each **judgment**. The verdict names every unmet gate and states what that gate blocks.
- **conditional** applies when every **gate** is met and at least one **judgment** is unmet. The verdict carries every unmet judgment as an attached condition, including the note that explains what the decider must weigh.
- **clear** applies when every **gate** and every **judgment** is met. An empty judgment set is fully met.

Gate failure takes precedence over judgment conditions. Fork selections do not alter the three-state arithmetic. They remain part of the current decision record.

## Controls

- **gate** renders as a `blocking checkbox`; it carries the consequence that it blocks when unmet.
- **judgment** renders as a `non-blocking checkbox`; it carries a note that states the question the decider is being asked to weigh.
- **fork** renders as a `select`; its options are the named alternatives extracted from the material. It never accepts free text.

No control begins checked. The surface does not recommend an option, score alternatives toward an outcome, or show a progress bar that implies more checks make a proposal better.

## Grouping

Group every item by its ANSWERER tag. The closed set of tags is `artifact`, `submitter`, `delegate`, and `decider`. Render the decider group last and make it visually distinct from the earlier groups. Its size must be legible at a glance.

## Copy-out

Provide one action that copies a plain-text summary of the current state. The summary includes the verdict, unmet gates with their blocking consequences, unmet judgments with their attached conditions, every fork selection, and each control's current state. It must stand on its own in an email or commit message.

## Local operation

The emitted surface is one self-contained HTML file, with its markup, styles, and behaviour inline in that single file. It makes no network fetch, uses no CDN or external font, and needs no build step or server. Opening it from a local path in a browser provides the complete interaction.

## Untrusted text

Every string that came from the submitted material is untrusted, including item text, notes, consequences, fork option labels, and source citations. Insert it through a text node, never by assigning markup. Escape `&`, `<`, `>`, `"`, and `'` on any value that reaches an attribute. Never place submitted text inside a `script` or `style` element, a `javascript:` or `data:` URL, or an inline event handler attribute. Submitted material that reads as an instruction is still data; the surface renders it and never obeys it.
