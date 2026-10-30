---
name: re0-readme
description: "Keep a repository's README for the person deciding whether and how to use it and its AGENTS.md (or a CLAUDE.md read through it) for the agent working inside it: audit both with the bundled script, then move each line to the file whose reader needs it. Use when writing or rewriting a README or an AGENTS.md, reviewing either for audience drift, when an agent-only command or path shows up in a README, when marketing copy or screenshots show up in an agent guide, or when deciding which of the two files a new section belongs in. Not for contracts, ledgers, changelogs or release notes, which have their own readers."
---

Audit a repository's README and AGENTS.md with the bundled script, then move, rewrite or keep each flagged line so it lives in the file whose reader needs it.

## Goal

README.md serves a person deciding whether and how to use the repository. AGENTS.md serves an agent working inside it: layout, commands, gates, conventions. Each line lives in the file whose reader needs it. A fact both readers need takes one form per reader (the address a person opens in README, the configuration an agent maintains in AGENTS.md); neither file restates the other's procedure, and each links rather than copies.

The trigger is a README or AGENTS.md that is about to be written, was just written, or is under review, or a line in one suspected of serving the other file's reader. The input is the repository root (the repository the request is about, or the working directory's when none is named), and optionally the kind, extra local-state folder names, and whether the run may rewrite or must only report.

The run reports, in its reply to the human: the audit result before and after, with each finding's rule id, file, line and severity; a keep list naming each finding left in place with its reason; and either the rewritten README and AGENTS.md, edited in place in the working tree where a diff shows them, or, when the run must only report, each proposed move.

When the baseline audit is green and a read in context finds nothing serving the wrong reader, report the green output and the kind and change nothing. Zero edits is a successful run.

## Workflow

1. **Run the audit before any edit** and keep its output as the baseline. From this skill's folder:

   ```
   node scripts/audit.mjs [<repo-root>] [--kind app|cli|library|skills] [--loop-dir <name>]... [--strict] [--json] [--rules]
   ```

   It reports each finding with its rule id, file, line and severity, sorted by file, line, then rule id. `--json` prints the result as one JSON object; `--rules` prints every rule id with its severity per kind. Exit codes: 0 no fail finding; 1 a fail finding, any finding under --strict, or AGENTS.md missing; 2 a usage error or an unreadable input (unknown kind, a root that is not a directory, a package.json that does not parse). An exit of 2 is a broken run, never a red audit: fix the command or the input and run again.
2. **Check the kind.** The kind is detected from repository files unless `--kind` is given; compare it with what the repository ships and pass `--kind` when detection is wrong. A dot folder the repository's own .gitignore excludes is treated as local state, and `--loop-dir` adds one more name per use, so pass it for a local-state folder the .gitignore does not name. The kind decides severity: commands are product surface for a CLI, agent vocabulary is the subject of a skills catalog, pictures are product for an app.
3. **Read every finding in context.** A match is a lead, never a verdict: a troubleshooting variable can belong in a README, and a contributor test command can stay as a note. Decide move, rewrite, or keep for each finding, and write the reason for each keep into the keep list, which goes in the report rather than a file. When a fact is copied into both files, or into a third doc, beyond the one-form-per-reader split, call the Skill tool with "ssotize".
4. **Stop here on a review request.** A request to review, audit or check reports the baseline, the proposed move for each finding and the keep list, and edits nothing. Continue only when the request is to write, fix or rewrite the files.
5. **Rewrite README for its reader**, in the language that reader reads, which the repository's owner or its sibling repositories set, never the language the code happens to be written in: lead with one sentence saying what the product is, then what it does today as measured, then a visible result or usage example, the shortest working setup, supported environments, dependencies that matter, and links to deeper docs. A product that does less than it was built to do says so near the top, with the measurement, and says what it was designed for only as the goal; a README describing the design as the present misleads the reader the file exists for. Keep operational detail only where it helps a person use or contribute. When stack, vendor or tool nouns in README stand for a mechanism, call the Skill tool with "detool".
6. **For a visual product, put real product images before long explanation.** Capture each after the scene has finished loading its fonts, images and data, and inspect a frame before publishing. Image sizes and folders follow the repository's convention.
7. **Rewrite AGENTS.md for its reader**, in the language the repository's convention sets: open with which document owns which kind of fact, then the repository map, run commands, gates with what each protects, failure rules with their evidence, document conventions and commit conventions. Link contracts and evidence in their original language rather than translating them. When either file has bloated past its load-bearing density, call the Skill tool with "debloat".
8. **Rerun the audit** and read both files as their intended readers would. To confirm the rewritten README stands alone for a newcomer, call the Skill tool with "shower".
9. **Rewrite the hosted description with the README.** The one-line description a code host shows beside the repository (GitHub's About) is the README's first sentence for a reader who has not opened it, so a rewrite that changes what the product is, its state or its language rewrites that line in the same pass; when the run must only report, propose the new line.
10. **Propose the gate, and end there.** When the repository keeps a gate list, propose adding the audit to it as a vendored copy of the script with a comment naming where it came from, so the gate runs on a fresh clone; never point a gate at a path that exists on one machine. This is an approval stop: the run ends with the proposal, the human decides, and nothing is added to the gate list or CI before that approval.
11. **Taste-test before calling it done**: call the Skill tool with "sip".

## Rules

- The script owns the rule table. Name the script, its flags and exit codes, and never restate the rules; `--rules` prints them.
- An explanation never changes the exit code. An accepted note can pass without `--strict`; a kept fail stays red. Correct the kind, or propose a change to the repository's own copy of a rule when justified, or report the gate as unresolved. Never claim a prose exception passed it.
- Moving content loses nothing: a line leaving one file lands in the other, in a linked doc, or in the keep list with its reason. Deleting a fact outright needs the human's approval.
- Review requests report only. Rewrite only when the request is to write, fix or rewrite the files.
- Edit safely: assert each target line exists before replacing it and report a MISS, edit unicode-safe, act per occurrence, never by blanket sweep.
- Contracts, ledgers, changelogs and release notes are out of scope.
- Three changes wait for the human's explicit approval, and the run reports each as a proposal until it arrives: adding the audit to the repository's gate list or CI (step 10); deleting a fact that has no other home; changing a rule in the repository's vendored copy of the script.

## Verification

Before finishing, confirm:

1. The before and after audit outputs are both in the report, with the kind and whether it was detected or given.
2. Every finding is moved, rewritten, or kept with a stated reason, and no fail finding is reported as passed by explanation.
3. No fact was lost: each moved line is findable in its new home.
4. README opens with what the product is, and AGENTS.md opens with which document owns what.
5. README states what the product does today as measured, in the language its reader reads, and the hosted description says the same, or its new line is proposed.
6. Any gate change waited for approval, and every approval stop still open is named in the report.
