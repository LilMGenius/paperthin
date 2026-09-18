---
name: re0-tutorial
description: "Learn one skill of the suite through three graded levels whose completion rests on the learner's own submission, never on an invocation trace."
disable-model-invocation: true
---

Advance a human-chosen exercise through three levels, grade the learner's submitted work, and append a private attempt record.

## Goal

Teach one skill's best practice, reasoning about combinations, and application to a real problem, in that order. Completion means only that the submitted exercise meets its contract. Human completion and transfer remain unmeasured; neither a simulated learner nor an invocation trace measures learning.

## Workflow

1. Start only on human invocation. Agree on a target, level, and exercise identifier. Read the installed target skills and their contracts, including Verification. Choose skills for what they teach, without preferring an invocation lane. State the required submission and grading criteria before the learner begins.
2. Define the level using the table below. Explain the task and its trigger without performing the learner's steps, producing their submission, or supplying the L3 combination. Wait for the learner's work.
3. On resume, compare the recorded version and skill-set digest with the current installation before grading. Apply the resume rules below; do not silently substitute a renamed dependency.
4. Check that the submission is present and establish authorship, then grade against the level's criteria. Record the decisive evidence and reason. An invocation, actor label, or host trace supplies context only; it cannot establish learner performance or settle ambiguous authorship.
5. Write one new, immutable attempt record at `.re0/tutorial/<exercise>/<version>-<attempt>.local.md`, choosing an unused attempt identifier. Report the grade, any clarification needed, and the record path. Only a `completed` grade earns an exercise-completion badge.

| Level | Learner's task and required submission | Grading criterion |
|---|---|---|
| L1 | Pick a real artifact of their own, apply one skill, and submit the resulting artifact. | Name the trigger and cite the target skill's own Verification section; check the artifact against it, never against lesson text. |
| L2 | Work through a given combination of two or more skills; submit the resulting artifact and their own written account of order, omission, and authority. | Check why each step precedes the next, what was omitted and why, and who must run each step against the shipped contracts; also check the artifact. A reasoned "no skip needed" or "no user-only step here" passes where true. Missing reasoning or a fabricated skip or user-only step fails. |
| L3 | Solve an intentionally randomized problem drawn from real files in their current codebase, choose their own combination, and submit the produced artifact. | Judge whether the artifact stands on its own for the stated problem, never the process narrative. An agent-supplied combination fails. |

### Grading

Apply these decisions in order so each submission receives exactly one grade:

1. A required artifact or account is absent: `not-completed`, no badge.
2. The agent produced the required work: `not-completed`, no badge; never "completed with help".
3. The submission is present but inconclusive, or learner authorship is unknown or ambiguous: `not-completed` with a `pending-clarification` note naming the specific learner evidence that would settle it, no badge. Do not infer an answer from traces.
4. Learner authorship is established and all level criteria pass: `completed`; the badge means only this exercise was completed. A conclusive failure of any criterion is `not-completed`, with its reason and no badge.

### Local record and resume

Each record contains `exercise`, `version`, `attempt`, `learner-action`, `evidence`, and `result`; evidence is the learner's submitted artifact or account, preserved or durably referenced. Add `actor` and `host-trace`, explicitly labelled supporting context only, and a `skill-set digest` identifying installed skills and their content so changes to the exercise's dependencies can be distinguished from unrelated version changes. Include the level, dependency identities, grading citations, reasons, and any clarification or predecessor link needed to interpret the attempt.

The logbook is private to its owner, local to the machine, untracked under `.re0/` and `*.local*`, and never shipped. Keep failed and abandoned attempts with their reasons. Never edit, overwrite, or delete an existing record. A duplicate resume of a recorded attempt gets a fresh record linked to the previous one, never a revision. Only new learner evidence can change a previous `not-completed` judgment in a subsequent record.

- If version and digest match, continue the exercise at its saved point. Continuing an unrecorded attempt does not create a duplicate; once a record exists, further recording uses a new attempt identifier.
- If only the installed version differs and the exercise's own skills are unchanged, resume with the difference noted in the new linked record. The version difference alone neither passes nor fails the submission.
- On ordinary resume, if a dependency keeps its name but its installed content differs from the recorded skill-set digest, preserve the prior record and note the content difference in a new linked attempt record. If the exercise's quoted Verification passage remains verbatim in the current skill body, resume and grade against that passage. If the passage is absent, the required text is missing: classify the prior attempt as `stale` under the stale rule and open a new version-marked attempt without a badge.
- If a dependency was renamed, retired, or is missing, classify the prior attempt as `stale` in a new current-version attempt record referencing it. Leave the prior file intact, including its original version and result, and open the new exercise attempt without a badge. Do not remap the old exercise onto a renamed skill or grade it as though the dependency still existed.
- Interruption records `incomplete`, distinct from `failed`. Continue an interrupted exercise only if the version matches; otherwise open a new version-marked attempt. This interruption rule takes precedence over ordinary version-only resume.
- `incomplete`, `failed`, and `stale` describe attempt lifecycle states, not additional submission grades. None earns a badge.

## Rules

- Grade submissions and record attempts; never perform the exercise for the learner, write their artifact or account, or roleplay their actions as learning evidence. Leave user-only actions for the human to invoke.
- Keep L2 even when a pipeline exists: a frozen execution order does not demonstrate the learner's reasoning about order, omission, and authority.
- Advance the exercise; leave catalog orientation and routing elsewhere. No guide installation is required. Do not turn the lesson into an execution pipeline or a general workflow recommender.
- Claim no competence, certification, ranking, or measured learning effect. Human transfer requires a human applying the skill to a new task and remains unmeasured by this tutorial.

## Verification

Check these seven disjoint scenarios against the rules before finishing. Resume cases determine lifecycle handling before submission grading; they are not substitutes for a submission grade. Each row has one outcome and one record action.

| Scenario | Exactly one outcome | Exactly one record action |
|---|---|---|
| Present: all required work is conclusively learner-authored and passes the level criteria, with valid dependencies. | `completed`, exercise badge only. | Write one fresh attempt record with submission evidence, contract checks, and badge. |
| Absent: a required artifact or account is missing. | `not-completed`, no badge. | Write one fresh attempt record naming the missing submission. |
| Inconclusive: required work is present but inconclusive, or authorship is unknown or ambiguous, with no established agent authorship. | `not-completed` with a `pending-clarification` note, no badge. | Write one fresh attempt record naming exactly what learner evidence would settle it. |
| Agent-authored: required work is present and established as agent-produced. | `not-completed`, no badge. | Write one fresh attempt record identifying the agent-produced work as the failure reason. |
| Stale-dependency: on resume a required skill was renamed, retired, or is missing. | Prior attempt is `stale`; no new badge. | Write one new current-version attempt record marking its linked predecessor stale while preserving the predecessor file intact. |
| Version-only difference: ordinary resume, not an interrupted attempt, with exercise dependencies unchanged. | Resume permitted; existing grade unchanged and no new badge from the version check. | Write one new linked attempt record noting the version difference and unchanged dependency comparison. |
| Content-only dependency difference: ordinary resume, dependency name unchanged but installed content differs from the recorded skill-set digest, whether or not the version differs. | If the quoted Verification passage still appears verbatim in the current skill body, resume and grade against that passage; otherwise the prior attempt is `stale` under the existing stale rule because the required text is missing, and a new version-marked attempt opens without a badge. | Write one new linked attempt record noting the content difference and whether the quoted passage remains verbatim or is absent, marking the predecessor stale if absent while preserving its file intact. |

Confirm every record uses an unused path, includes the required fields, and leaves earlier records intact. Report the actual grading or resume result without claiming a human completed or transferred learning during validation.
