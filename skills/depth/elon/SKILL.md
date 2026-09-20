---
name: elon
description: "Question a requirement set before anything is built: in the fixed order question, remove, simplify, speed the cycle, automate, propose removals for inertial requirements whose source is verified and whose benefit is gone, and never touch an externally mandated constraint. Use when a plan, spec, backlog, or process list is about to be built as written."
---

Question what must be built before spending effort on how to build it.

## Goal

Turn a set of not-yet-built requirements, components, or processes, each with the source that imposed it, into a removal proposal table. The five steps run in a fixed order because deletion comes before optimization: a requirement that should not exist is never worth speeding up or automating. Externally mandated constraints are preserved, the input stays unchanged, and every run ends at an approval stop. This is not an attack on a whole plan and not a compression of written prose; it acts on requirements, before the build.

## Workflow

1. Inventory every requirement with a stable identifier, its imposing source and owner, and what it bought: the purpose, benefit, or protection it was meant to provide. Confirm the source from supplied or accessible evidence; never invent provenance or benefits.
2. Question each requirement. Record whether it is externally mandated by contract, law, safety, or compatibility, citing the constraint. Keep source verification separate from mandate status: a source never checked is `unverified`, never dispensable by default; a completed search that found no imposing source is a confirmed absence, which counts as verified provenance. An unverified requirement becomes a question to its owner (or a request to name the owner) and its removal decision stays blocked.
3. Check for conflicts. If a simplification request conflicts with an externally mandated constraint, report the request, the constraint, and the conflict, preserve the requirement, mark unprocessed rows as stopped, and end at the approval stop holding earlier proposals unexecuted.
4. Walk each verified requirement through question, remove, simplify, speed the cycle, automate, in that order. Propose removal only for an inertial requirement whose provenance is verified and whose benefit is gone, stating what would be lost and why that loss is acceptable; exclude every mandated item; when purpose or mandate status is uncertain, ask the owner instead.
5. For a requirement retained after remove, consider simplify, then speed the cycle, then automate, recording each consideration in order with its reason or an explicit no change. These are advisory dispositions, never implementation. Lower steps are deferred pending approval for a proposed removal and blocked pending the owner's answer for an unverified source.
6. Return one table with a row per input requirement in the columns below, then any unresolved owner questions. If nothing warrants removal, report `no removal candidates` and `requirement list unchanged`; an already-minimal or entirely mandated list is a successful unchanged result.
7. End with `Approval stop` followed by exactly the identifiers and text of the proposed removals, or `Proposed removals: none`, and state that the input remains unchanged and that deletion requires the user's separate, explicit approval of those items. Neither invocation nor a general request to simplify grants deletion authority.

| Requirement | Imposing source and verification | Externally mandated: yes/no/unverified, basis | What it bought | Question and answer or owner question | Removal proposed: yes/no/blocked, why | Simplify | Speed the cycle | Automate | If retained: lower step and reason, or unchanged/blocked/stopped |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## Rules

- Propose only. Never delete requirements, edit the input, build components, change processes, or execute the lower steps during the run.
- Externally mandated constraints never become removal candidates, including at the approval stop; user approval does not override this.
- An unverified source yields an owner question, never a removal candidate. A source file recording that the imposing source was sought and none exists confirms absence and is verified provenance; a source never checked stays unverified.
- Removal is considered before optimization; no step may be skipped to reach automation early. Blocked and stopped decisions stay visibly incomplete.
- Zero proposals is a formal success. Set no quota or target ratio, rank nothing by deletion volume, and never report a deletion count as an achievement.
- Claimed gains in speed, cost, or quality stay unverified until measured separately; the table proves none of them.

## Verification

1. Every input requirement has a row, and every completed row records the fixed sequence or the explicit reason later steps are deferred, blocked, or stopped.
2. Zero externally mandated items are proposed for removal; any conflict is reported and stops the run.
3. Every removal proposal carries verified provenance (a confirmed imposing source, or a documented search that found none), what the requirement bought, and why removal is justified; every unverified source carries an owner question instead.
4. The output ends at the approval stop listing exactly the proposed removals, before any deletion, with the input unchanged.
5. An unchanged list is reported as such, with `no removal candidates` when appropriate, and no deletion achievement is claimed.

