---
name: re0-workflow
description: "Read one stated intent, pick and order the installed skills that serve it, show that order, then run the steps the session may run and stop where a person must act. Use when someone states a goal but does not know which skills serve it or in what order, asks which skills to use, or wants a job that needs several skills run end to end. Typing /paperthin lands here."
---

Turn one stated intent into an ordered skill graph, show it, and run the steps the session may run.

## Goal

Someone who does not know this suite's catalog should be able to say what they want and see it done. Select and order the installed skills that serve the human's stated intent, show the order before anything runs, run each step the session holds authority for, and stop at the first step that needs the human, with a report of what ran.

## Workflow

1. Read the human's stated intent and the installed roster from the host catalog or skill directories. If given only live state without a stated intent, ask for the intent rather than infer it. Read each candidate's contract and invocation lane: `disable-model-invocation: true` means user-only; otherwise it is model-invoked.
2. Select only skills whose triggers and outputs serve the intent. A frozen pipeline (a skill whose own contract runs a fixed sequence of other skills) that already serves the intent is one node, never expanded; read its members only to type it, so the node counts as writing when any member writes and is a `user-handoff` when any member is user-only. If none fits, show zero steps and say so; if one suffices, use exactly one node and say ordering is trivial. A skill the intent or a selected contract calls for that the roster lacks is a missing optional skill: it stays as a `skip` step. Do not pad the graph, require an orientation skill, invent a pipeline skill, or substitute another skill for a missing one.
3. Order the selected steps by their contracts' prerequisites: a step depends on another when its firing precondition needs that step's output. Detect cycles before showing the graph; if one exists, the whole result is a `reject` naming the cycle, such as `skill-a -> skill-b -> skill-a`, with no steps and no partial order. Give the graph one observable stop condition, the state that means the intent was served; zero steps or a `reject` ends at its own report.
4. Give every step an identifier, a target (the skill that acts, or the question when the step is a human decision no skill makes), predecessor identifiers, exactly one type, firing precondition, expected output limited to the target's own contract, skippable condition, and cost owner. Assign its type by the first row below that applies, so a missing user-only skill is a `skip`. Where a contract does not say whether its skill writes, count it as writing; where its lane cannot be read, count it as user-only. A step whose type depends on a predecessor's output is shown as conditional with the types it can take, and typed once that output exists.

   | Type | Meaning and precondition | Cost owner |
   | --- | --- | --- |
   | `skip` | The step does not run, and the graph goes on without it: condition not applicable, skill not installed, or no authority that anyone present could grant. A step that depends on it is skipped too, with the same reason. | None. |
   | `user-handoff` | The human acts: the target is user-only, the step is destructive or irreversible, a human decision is needed, or the work needs authority the human holds and the session does not. | The human's time, at their discretion. |
   | `invoke-model-skill` | The router runs it: none of the rows above applies, so the target is installed and model-invoked, the session already holds authority for the work, and the step is neither destructive nor irreversible. | This run's budget. |
   | `reject` | Not a step: the whole result when the request cannot be served as a graph, naming the cycle when cyclic. | None. |

5. For each `user-handoff`, say what the human does and what result to bring back: for a skill, the exact invocation they type, in the host's syntax with the installed name (a destructive step whose skill is model-invoked is still typed by the human); for a decision, the question and the answers that change the next step. If the host's invocation syntax is unknown, ask instead of inventing it.
6. Before any step runs, show the whole typed graph in order, every field of every step, why each sits where it does, and the stop condition; ask here for any host invocation syntax step 5 could not find. If the human asked only for the order, stop here. If any `invoke-model-skill` step anywhere in the graph, before or after a handoff, writes a file, record or artifact, ask once, now, for approval of the shown plan. That approval accepts the plan and every write it shows, across a resume, until the plan changes; it grants no authority a step lacked, so it never turns a `user-handoff` into a run step. If no step to run writes, run right after showing the plan. If the human edits the plan, order it again, check for cycles again, and show it again before running.
7. Run in order. For each `invoke-model-skill` step, call the Skill tool with that step's target, once for that step, passing the intent and its predecessors' outputs. Before starting the next step, check its expected output: the file or record exists, or the skill's own report states the result. If a step fails, stop there; if its output breaks a later step's precondition, stop there or mark that later step `skip` with the reason. Never retry by swapping in another skill.
8. Stop at the first `user-handoff`. The stop report is the state a resume reads: the graph as shown, whether approval was given, every step run with its result, the handoff and what to bring back, and the steps still waiting. When the human returns with that result in the same conversation, a new invocation reads that report and checks the result against the handoff step's expected output: a match becomes that step's output and the run goes on from the next step under the same approval, while a changed or failed result re-plans from that step and shows the new graph before running. If the report is out of reach, start again from step 1.
9. End with the graph as shown, each step's outcome (ran with its result, skipped with its reason, handed off, or waiting behind a stop), and whether the stop condition was reached or the run stopped early at a named step (a handoff or a failure). When a skipped or missing step's output is one the stop condition needs, say the run ended with the stop condition unmet.

## Rules

- Never select `re0-workflow` itself or its alias `paperthin` as a step; the alias only forwards here, so either would loop.
- The router writes nothing of its own; every write comes from a run step's own skill under that skill's contract.
- Destructive or irreversible means deleting, force-pushing, publishing, tagging, sending a message to someone, or spending money. Such a step is a `user-handoff` even when its skill is model-invoked.
- Never run a user-only skill, and never drop an installed one to make the order runnable; it stays in the graph as a `user-handoff`. A step the router cannot run is a `user-handoff` or a `skip`, never a silent recommendation, and a skip never counts as success.
- `nba` picks one next action from live state and runs nothing; this skill orders and runs a graph for one stated intent.
- `sip` owns a fixed conditional graph for newly changed output; select it as one node when it serves the intent, never reproduce its members.

## Verification

Before running the first step, and again before the final report:

1. Every selected target's trigger, output, installation, invocation lane and authority were read from its own contract.
2. Every step carries all its fields and exactly one type; the graph has one observable stop condition, and a cycle was rejected with the whole cycle named.
3. Every installed user-only, destructive or decision step is a `user-handoff` with the exact invocation or the question, and what to bring back, never `invoke-model-skill`.
4. The graph was shown before anything ran, and approval was asked once when a step to run writes.
5. Each run step's expected output was checked before the next step started, and the run stopped at the first `user-handoff`.
6. The report gives each step's outcome and whether the stop condition was reached or at which step the run stopped early.
