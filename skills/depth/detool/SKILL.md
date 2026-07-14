---
name: detool
description: "Make durable artifacts portable by replacing incidental stack, vendor, model, CLI, path, quota, or harness nouns with the mechanism they mean, while keeping provenance, runbooks, and tool-subject claims concrete."
---

Remove incidental tool coupling from artifacts that claim to outlive the stack that wrote them.

## Goal

A durable artifact should stay true and actionable when the agent, harness, operating system, vendor, model, or toolchain changes. `detool` finds stack-specific nouns in portable content and rewrites them to the underlying mechanism without deleting the action they enabled.

The point is portability, not vagueness. A reader should still know what to inspect, run, measure, compare, or verify after the rewrite.

## Workflow

1. Read the target artifact end to end.
2. **Role before edit**: classify the whole artifact, or each section if mixed, as durable/portable content, provenance/operational record, or a claim about a named tool.
3. Sweep durable content for incidental coupling: harness paths, vendor CLIs and flags, model or product brands used as mechanisms, tool-specific environment variables, quotas, UI steps, cache homes, session files, and version-pinned behavior stated as timeless truth.
4. **Mechanism not euphemism**: replace each durable-content hit with the neutral mechanism that preserves the action. If neutral wording would lose the action, keep the concrete detail as an example of the mechanism instead of pretending it generalizes.
5. Keep provenance and operational content concrete. Build records, capsules, benchmark logs, install guides, runbooks, tool-targeted how-tos, command transcripts, and exact reproduction steps are supposed to name the stack that produced them.
6. Keep comparative and tool-subject claims concrete. If the sentence is about a named tool, vendor, model, bug, prior-art source, or measured limit, the name is the subject, not incidental coupling.
7. Re-read as a reader on a different stack: the artifact should still be true, portable, and executable where it promised action.
8. Report what was neutralized, what was deliberately kept, and the role judgment behind each keep.

## Rules

- **Role before edit.** Never scrub before deciding whether the text is portable content, provenance, operational instruction, or a tool-subject claim.
- **Mechanism, not euphemism.** "Use the session execution log and sum usage records" is a mechanism; "check the logs" is a euphemism that loses the work.
- Preserve actionable detail. Abstract only the coupling, not the procedure, evidence, comparison, or constraint.
- Keep provenance and operational records exact. Concrete paths, commands, flags, versions, products, and UI steps stay when they record what happened or explain how to drive a specific tool.
- Keep comparative/tool-subject names. A bug report about a CLI, a benchmark against a model, a prior-art citation, or a vendor-specific limit keeps the named subject.
- A pass that finds no incidental coupling changes nothing.
- Mutate with edit-safety: assert each target exists and report a MISS instead of silently no-oping; edit unicode-safe; replace per occurrence, never by blanket sweep; script large structural moves.

## Verification

Before finishing, confirm:

1. Every changed hit was in durable or portable content.
2. Every rewrite preserved the actionable mechanism.
3. Every kept tool noun is provenance, operational instruction, or the subject of its claim.
4. The report names neutralized couplings, deliberate keeps, and any judgment calls.
