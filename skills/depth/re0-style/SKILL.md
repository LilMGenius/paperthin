---
name: re0-style
description: "Check style, conventions, and consistency in code. Use for 'make this match the codebase', formatter and linter setup, naming consistency, or a style pass on a change under review. Default output is zero edits and a short report."
---

Keep code consistent where meaning permits and evidence supports it.

## Goal

Existing tools own representation, syntax, declared constraints, and pattern policies. Use judgment for domain names, error and result shapes, sibling API symmetry, placement, useful comments, duplicate helper intent, layering, and dependency direction, only where intent, meaning, usefulness, or a choice between valid alternatives requires reading. Default to zero edits and a short report. A run ends in one of five formal results: no-op, excluded, abstain, retain-and-report, or proposal. None is a failure.

## Workflow

1. Fix the target file list to the change under review; stop if scope cannot be established. Run across a whole repository only when a human names it and requests that scope. Keep later steps inside it.
2. Read formatter and linter config, `.editorconfig`, ignore files, off/on regions, generated headers, `.gitattributes`, and `.git-blame-ignore-revs`. Existing config is the repository's answer and closes convention extraction; exclude protected files and regions from both edits and the counting sample before counting.
3. Run the repository's existing formatter, linter, or LSP in check mode for machine-owned axes. Record clean axes and close them; do not hand-edit their bytes or build a missing checker.
4. Read domain meaning on the remaining axes. Move names and shapes that encode contracts into separate compatibility changes. Distinguish taste from correctness, security, and compatibility; retain those protective checks regardless of frequency, report violations, and treat ambiguous rules as protective.
5. Rank config proposals only for taste axes whose evidence meets the floor and whose candidates mean the same thing; attach counts, scope, and counter-examples. Otherwise abstain, declare no rule, and end with zero config changes, zero diff, and an observation report. Report a roughly 55/45 split as disagreement. For consistent taste deviations, propose changing config instead of code.
6. Apply only proposals a human has selected, using existing tools for enforcement. Keep one convention per commit and formatting in separate commits recorded with reasons in `.git-blame-ignore-revs`; cross-boundary renames remain proposals for separate changes using language-aware tools or scripted AST/parser edits, never scripted text rewrites. Stop when the site count reaches dozens and require a migration owner.
7. Verify consumers of changed names and shapes through builds, tests, public export lists, serialization round trips, and searches for identifiers in string literals. If any consumer cannot be checked, undo that item's own edits and retain it as a proposal; never report an unchecked consumer as verified.
8. Check that a well-kept repository ends with zero edits and a short report; unexpected edits are a failure of this pass. A run on Markdown alone does not establish usefulness on code: leave that claim unverified until a code-repository pilot provides evidence.

## Rules

- Enforce machine-owned axes only through the repository's existing formatter, linter, or LSP: indentation, line endings, whitespace, quotes, semicolons, import order, unused symbols, forbidden APIs, complexity thresholds, and everything else those tools already own. Never edit these by hand or reimplement enforcement when the repository lacks a checker.
- Report one of five formal results. **no-op**: existing config answered, the tool check passed, and nothing remains to propose; name the config file. **excluded**: do-not-touch markers or generated/vendored attributes removed the sample before counting, leaving evidence below the floor; name the exclusions and residual count. **abstain**: the evidence floor is unmet, candidates differ in meaning, or a roughly 55/45 split shows disagreement; name the distribution. These three end with zero config changes, zero diff, and an observation report. **retain-and-report**: a correctness, security, or compatibility check stays on; inventory violations. **proposal**: all three conditions below hold and a ranked config proposal gives its count, scope, and counter-examples for human selection; keep zero config changes and zero diff until a human selects. Touching a file gives no authority to normalize it.
- Propose config only when all three hold: the axis is taste, the evidence floor is met, and candidates are semantically identical. This permits a proposal for human selection, never an automatic change. A machine-owned axis is still taste when choosing the rule: with no config and a consistent house style, rank quotes, line width, import order, or casing in the proposal. After human selection, the tool enforces the rule.
- A consistent deviation from the mainstream tool on a taste axis changes the rule in config, never the code. Never propose disabling correctness, security, or compatibility checks, whatever the violation count; report the debt and leave any exception to the check's owner.
- Names can be contracts: public exports, serialized keys, DB columns, reflection lookups, identifiers inside string literals, and names encoding behavior such as returning null leave this pass as separate compatibility changes with owner and consumer checks. Cross-boundary renames are proposals; use language-aware tools or scripted AST/parser edits, never scripted text rewrites, keep one convention per commit, and treat a site count in the dozens as a migration requiring an owner.
- Read do-not-touch markers before any edit: formatter off/on regions, ignore files, `.gitattributes` entries for `linguist-generated` and `linguist-vendored`, generation directives, and generated headers. Exclude the marked content from the counting sample too; treat conventional generated headers as strong warnings, not proof of universal machine semantics.
- Default to the change under review. Run across a whole repository only when a human names it and requests that scope; never perform unrelated mass reformatting.
- Use about 8 independent occurrences at 90%+ within one coherent scope as an uncalibrated ranking heuristic. Exclude generated, vendored, migration, and fixture files before counting, weight recency, and require spread across directories and authors. Use the smallest coherent file, directory, or package scope, preserving locally consistent files. This floor ranks proposals; it never authorizes an automatic change. Unverifiable author spread, as in a single-author or agent-written history, lowers the rank and must be stated in the proposal. It never by itself forces abstention.
- Make no claim that mass reformatting improves defect rates or review time.
- Keep formatting-only commits separate and record them in `.git-blame-ignore-revs` with a reason. State that blame attribution through ignored revisions is inference, not history preservation.
- Mutate with edit-safety: assert each target exists (report a MISS, never a silent no-op), edit unicode-safe, replace positional targets per occurrence rather than by blanket sweep, and script large structural moves.

## Verification

Before finishing:

1. Confirm that a well-kept repository ends with zero edits and a short report; distinguish evidence from a code pilot from a Markdown-only run.
2. Confirm that every proposed rule ships with its count, scope, and counter-examples, and satisfies taste, evidence, and semantic-identity conditions.
3. Confirm that exclusions preceded counting and editing, existing tools alone enforced machine-owned axes, and protective checks remain enabled.
4. Confirm that the report names which of the five results (no-op, excluded, abstain, retain-and-report, or proposal) the run ended in and why.
5. Confirm consumer checks for every applied change, separate compatibility proposals and formatting commits as required, and report changes, observations, and anything unverified.
