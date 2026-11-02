---
name: re0-style
description: "Fix code in a named change or file list so it matches the conventions its own repository already keeps: run the project's configured formatter and linter in fix mode through the project's own toolchain, then fix by hand what no tool decides (naming, import order, file layout, error style) toward the dominant pattern in neighbouring files, behavior preserved, and ask with counts where the repository keeps two competing conventions. Use for 'make this match the codebase', formatter or linter setup, naming consistency, or a style pass on a change under review. Acts only inside the change or files the user names."
---

Fix a named change or set of files to match the conventions its repository already keeps, changing style and nothing else.

## Goal

Code written in one session drifts from the code around it: another quote style, another naming case, imports in another order, errors raised the way the last project raised them. A reader then has to work out whether each difference means something. `re0-style` makes the code in scope read like its neighbours. It takes every convention from the repository itself, first from the formatter and linter the project configures and then from the pattern neighbouring files follow for what no tool decides, and applies the fixes in place with behavior unchanged. Where the repository itself is split between two conventions, it asks rather than picks. The result is a style-only diff and a report of each change by file and rule.

## Workflow

1. **Pin the scope.** Name the change (the working diff, or the diff against the base the user names) or the file list the user gave. For a change, the unit is the changed lines: a file the change does not touch is out of scope, and so are the untouched lines of a file it does. Run the project's tests once now, by the command its manifest, task runner or CI workflow names, and record the result, so a failure that was already there is not blamed on the pass.
2. **Drop what is not the repository's own.** From this skill's folder, run `node scripts/scope.mjs <files...> [--json]` on the files in scope. It lists, per file, `linguist-generated` and `linguist-vendored` attributes, a generated-file header in the first lines, formatter and linter off markers with their line numbers, and the style config files that apply from the file's folder up to the repository root; exit 0 means no file is flagged, 3 that one or more are, 2 a usage error or an unreadable input. A hit is a lead to read, not a verdict: drop a file that is truly generated or vendored, and leave every region under an off marker as it is.
3. **Read what the tools decide.** From the configs step 2 listed and the project's manifests, scripts, lockfile, CI workflows and pre-commit config, name the formatter and linter the repository runs and the options it sets. Resolve each through the project's own resolution (`npm exec`, `bun run`, `./node_modules/.bin/`, `uv run`, `poetry run`, the pinned toolchain), print the version about to run (the tool's `--version` through that same resolution), and compare it with the one the lockfile or manifest declares. A mismatch, or a tool reachable only as a global binary or a scratch install, stops tool fixes for that tool and goes in the report.
4. **Read what no tool decides.** For each question the scope raises that no configured tool settles (identifier case by kind, import grouping and order, file and folder layout, export style, how errors are raised and worded), sample the neighbouring files, nearest first: the same folder, then files of the same kind elsewhere in the repository. Count each pattern. A pattern is the convention when nearly every sampled instance follows it and the exceptions look like drift: scattered single files, often recent. When the other pattern owns a whole folder or module, or recurs across files you cannot call drift, the repository keeps two conventions there; record both counts and where each lives. When you cannot tell, treat it as two conventions and ask. A folder's own consistent convention beats the one the rest of the repository keeps.
5. **Apply the tool fixes.** Run the formatter, then the linter's fix mode, on the files in scope only, and only the fixes the tool marks safe. For a change, first run the formatter's check on the base version of each file (read it with `git show <base>:<path>` into a scratch copy): if the base was already clean, formatting the whole file touches only the change; if it was not, keep only the edits inside the changed lines (the tool's range option, or the hunks that overlap them) and report the earlier drift as left. When the user asked to set up a formatter or linter that the repository lacks, configure the one its ecosystem and manifests already point to, set each option to what step 4 found the code doing, and run it on the scope alone; whatever it would still change outside the scope is reported, never applied.
6. **Apply the hand fixes.** Fix the remaining lint findings and each deviation from a step 4 convention inside the scope, preserving behavior. Rename a local or private identifier together with every reference to it. A rename that crosses a public API (an export another module or package imports, a CLI flag, a config key, a route, a serialized field) is proposed in the report with every caller it would touch and applied only when the user confirms it. A lint finding that only a logic change can satisfy is left and reported.
7. **Surface the splits.** For each place where step 4 found two conventions, leave the code as it is and write a question into the report: the two patterns, the count of each, where each lives, and the lines in scope that wait on the answer. The run does not stop for it; a later pass applies the answer.
8. **Verify and report** as below.

## Rules

- Every convention comes from the repository: a config it keeps (including a published style guide that config explicitly extends) or a pattern its own files follow consistently. Never an outside style guide, a language's popular default, or taste the repository does not already follow.
- Stay inside the scope the user named or that a pipeline they invoked passes on. Never restyle an untouched file or untouched lines, and never widen the scope; drift found outside it is reported, not fixed.
- Run every tool through the project's own resolution with its version printed and compared; a global binary or a scratch install is a different toolchain and its verdict is not the project's.
- Style only. No change to a value, condition, call, control flow or public name. Leave the order of imports that run code when loaded (polyfills, registrations, stylesheets) as found, since moving them changes behavior.
- Never pick between two competing conventions silently; the split goes to the user as a question with counts.
- Respect what the repository protects: generated and vendored files and every region under a formatter or linter off marker stay untouched.
- Hand off what other passes own: punctuation in prose and comments (em and en dashes to `dedash`, Korean middle dots to `dedot`), and prose bloat or code that carries nothing (dead code, comments that restate the code) to `debloat`. Name each handoff in the report rather than doing it.
- A pass that finds nothing off-convention changes nothing.
- Edit safely: assert each target exists before changing it and report a MISS rather than a silent no-op; read and write files as UTF-8 without changing their line endings; replace per occurrence rather than by blanket sweep; script a large mechanical change.

## Verification

Before finishing, confirm:

1. The formatter and linter, run through the project's own resolution, report the touched files clean, or every finding they still report is listed as left with its reason.
2. The project's tests give the same result as the run in step 1.
3. Every file in the diff is in scope, and every hunk maps to a reported change: read the diff hunk by hunk against the style-only rule.
4. Every split carries the count of each pattern, and every public rename was proposed rather than applied unless the user confirmed it.

Report each change by file and rule (the tool's rule id, or the convention with the counts that made it one), then what was left: the splits as questions with counts, findings only a logic change could satisfy, proposed public renames, drift outside the scope, tool version mismatches, and each handoff.
