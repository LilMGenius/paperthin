---
name: detool
description: "Make durable artifacts portable by replacing incidental stack, vendor, model, CLI, path, quota, or harness nouns with the mechanism they mean, while keeping provenance, runbooks, and tool-subject claims concrete."
---

Remove incidental tool coupling from artifacts meant to outlive the stack that wrote them.

## Goal

Keep durable artifacts true and actionable across changes of agent, harness, operating system, vendor, model, or toolchain. `detool` replaces incidental stack nouns in portable content with the underlying mechanism, preserving the action they enabled.

The reader must still know what to inspect, run, measure, compare, or verify.

## Workflow

1. Read the target artifact end to end.
2. **Role before edit**: classify the artifact, or each section if mixed, as durable/portable content, provenance/operational record, or a claim about a named tool.
3. Sweep durable content for incidental coupling: harness paths, vendor CLIs and flags, model or product brands used as mechanisms, tool-specific environment variables, quotas, UI steps, cache homes, session files, and version-pinned behavior presented as timeless.
4. **Mechanism not euphemism**: replace each hit with a neutral mechanism that preserves the action. If neutral wording would lose the action, keep the concrete detail as an example rather than claim it generalizes.
5. Keep provenance and operations concrete: build records, capsules, benchmark logs, install guides, runbooks, tool-targeted how-tos, command transcripts, and exact reproduction steps must name their stack.
6. Keep comparative and tool-subject claims concrete. A named tool, vendor, model, bug, prior-art source, or measured limit stays when it is the sentence's subject.
7. Re-read from a different stack: the artifact must remain true, portable, and executable wherever it promises action.
8. Report neutralized couplings, deliberate keeps, and the role judgment behind each keep.

## Rules

- This skill is outside the family that removes machine-writing tells. It keeps durable text portable by replacing incidental stack nouns with their mechanisms; other tells are outside its scope.
- **Role before edit.** Classify text as portable content, provenance, operational instruction, or a tool-subject claim before scrubbing it.
- **Mechanism, not euphemism.** "Use the session execution log and sum usage records" preserves the work; "check the logs" loses it.
- Preserve actionable detail. Abstract only the coupling, never the procedure, evidence, comparison, or constraint.
- Keep provenance and operational records exact. Paths, commands, flags, versions, products, and UI steps stay when they record events or explain how to drive a specific tool.
- Keep comparative/tool-subject names. A CLI bug report, model benchmark, prior-art citation, or vendor-specific limit keeps its named subject.
- A pass that finds no incidental coupling changes nothing.
- Edit safely: assert each target exists and report a MISS rather than a silent no-op; edit unicode-safe; replace per occurrence, never by blanket sweep; script large structural moves.

## Verification

Before finishing, confirm:

1. Every changed hit was in durable or portable content.
2. Every rewrite preserved the actionable mechanism.
3. Every kept tool noun is provenance, operational instruction, or the subject of its claim.
4. The report names neutralized couplings, deliberate keeps, and any judgment calls.
