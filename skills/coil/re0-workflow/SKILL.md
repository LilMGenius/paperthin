---
name: re0-workflow
description: "Read one stated intent and recommend an ordered graph of the suite's skills with the authority of each step typed, never invoking them."
---

Turn one stated intent into an ordered recommendation with explicit authority at every step.

## Goal

Return the smallest ordered graph that serves the stated intent using the installed skill roster. Show what each step would produce, who could act, and when to stop; perform none of the steps.

## Workflow

1. Read the user's stated intent and the installed roster from the host's catalog or available skill directories. Read candidate skills' contracts and invocation lanes; `disable-model-invocation: true` means user-only, otherwise the default is model-invoked. If given only live state, request a stated intent rather than inventing one.
2. Select only skills whose triggers and outputs serve that intent. If an installed frozen pipeline already serves the same intent, recommend it as one node and never expand its members. If no suite skill fits, return zero steps and say so. If one skill suffices, return exactly one node and say ordering is trivial.
3. Establish dependencies from the selected contracts and order prerequisites before their consumers. Keep relevant optional steps visible when their preconditions fail. Detect cycles before presenting an order; return `reject` with the complete named cycle, such as `skill-a -> skill-b -> skill-a`, instead of a partial linearization.
4. Give every step an identifier, target skill, predecessor identifiers, exactly one type below, firing precondition, expected output, skippable condition, and cost owner. For a user-only target represented by `recommend` or `user-handoff`, include the exact invocation string the human types, using the host's supported invocation syntax and installed target name. Every handoff also states what to bring back. If that syntax is unavailable, request it rather than fabricate a command.
5. Return the ordered graph, explicit skips with their failed preconditions, and one observable stop condition for the whole order. Briefly explain each target's position. Present the steps as proposals, never execution results, and stop.

| Type | Meaning and precondition | Cost owner |
|---|---|---|
| `recommend` | Nobody acts in this pass; name this skill at this position for this reason. Naming it needs no execution authority. | This advisory pass. |
| `invoke-model-skill` | Proposed later agent invocation only when the target is model-invoked, installed, and the session already holds authority for the work; expected output is limited to the target's own contract. The router never performs it. | The later invoking session's run budget. |
| `user-handoff` | The target is user-only, or a human decision or act is needed; state that it waits on the human, the exact invocation, and what to bring back. | The human's time, at their discretion. |
| `skip` | Terminal: name the failed precondition as condition not applicable, skill not installed, or no authority. | None. |
| `reject` | Terminal: the request cannot be served as a graph; state why and name the cycle when cyclic. | None. |

## Rules

- Read-only and advisory: never invoke a target, execute the graph, modify the intended artifact, or write a record. A `recommend` never upgrades itself into execution; promotion requires a separate human act.
- User-only targets remain eligible for coverage as `recommend` or `user-handoff`, never `invoke-model-skill`. Do not drop them to make an order automatically runnable. For missing authority, explicitly skip or hand off for the required human act.
- Missing optional skills appear as `skip` with `skill not installed`; unmet conditions and absent authority also remain explicit. Never silently substitute another skill as equivalent, and never count a skip as success.
- `nba` picks one action from live state; `re0-workflow` orders skills for one intent. When `nba` consults this router, it remains one candidate among others. `nba` still returns exactly one action with a done-when condition, never the router's graph. Its other candidates and consultations remain unrestricted.
- `sip` owns a fixed conditional graph triggered by newly created or changed output. This router recommends an order for a stated intent. Recommend an existing matching pipeline as one node instead of reproducing its graph.
- Do not pad a single-skill intent, infer an intent from cycle state, require an orientation skill, or invent new pipeline skills. Call count and fan-out belong to the workflow; capability and effort advice do not confer execution authority.

## Verification

Before returning the recommendation:

1. Every step has exactly one typed edge or terminal, a named cost owner, target, dependencies, firing precondition, expected output, and skippable condition; the whole graph has one observable stop condition.
2. Every user-only target carries `recommend` or `user-handoff` with the exact human invocation, never `invoke-model-skill`; every handoff says what to bring back.
3. A missing optional skill appears as `skip` naming `skill not installed`; other skips name their failed precondition and make no success claim.
4. A cycle is rejected with `reject` and the cycle named, never returned as an executable order.
5. A single-skill intent has one node and explicitly trivial ordering; no matching skill produces zero steps. A matching frozen pipeline remains one unexpanded node.
6. When consulted by `nba`, its answer remains exactly one action. No target was invoked, no artifact modified, and no record written by this router.
