---
name: backprop
description: "Feed what a finished cycle taught back through the sources that produced it: measure the lesson, question the requirements it touches, land it in one owner, refresh that owner to a clean v0, cut its padding and realign its listings, each pass only when it applies. Use after a correction, a request the user had to repeat, a failed or disappointing cycle, or a cleanup pass over a repository's docs, rules or skills, when the lesson has to change the sources rather than sit in a memo."
---

Carry a lesson from the output back into the sources that produced it, then leave those sources clean.

## Goal

A correction says the output was wrong; the fix belongs in what produced it. Backpropagation in a network measures the error at the output and sends it back through every layer that contributed, each adjusting by its share. `backprop` does the same for a body of work: `re0-memo` measures the error and names its class, `elon` questions the requirements that let it through, `ssotize` puts the lesson in the one source that owns it, and `re0`, `debloat` and `re0-order` leave that source reading as its clean current version. The scope you name bounds every pass, each pass runs only when its condition holds, and the order stays fixed.

## Workflow

1. **Pin the scope.** Name the output the lesson came from (the correction, the failed cycle, the review finding) and the sources it implicates: the docs, rules, skills or code that produced it. If neither is named, propose the user's last correction and the files it concerns, and wait for a yes before editing; with no correction to propose, ask for the output and stop. Every later step stays inside this scope.
2. **Measure.** Call the Skill tool with "re0-memo" on the output. Its lessons, each a class with its evidence and the owner it names, are what the remaining steps carry back. When it finds no lesson, report that and stop.
3. **Question.** Call the Skill tool with "elon" on the requirements and rules in scope that the lessons touch. Skip it when the scope holds no requirement or rule. Stop at its approval gate; what the user approves is carried out, and what is declined stays as it was.
4. **Consolidate.** Call the Skill tool with "ssotize" so each lesson lives in the owner `re0-memo` named and every other copy in scope becomes a reference. Skip it when nothing in scope duplicates or contradicts a lesson. Stop at its approval gate; what the user approves is carried out, and what is declined stays as it was.
5. **Refresh.** Call the Skill tool with "re0" on each owner the steps above changed, so it reads as though the lesson had always been there. Skip it when no owner changed.
6. **Tighten.** Call the Skill tool with "debloat" on prose or code in scope that is correct and current but padded, AI slop included. Skip it when nothing is bloated.
7. **Realign.** Call the Skill tool with "re0-order" on each listing in scope whose order no longer follows one principle. Skip it when no listing drifted.
8. **Hand off punctuation.** If the changed text has em-dashes or look-alikes, ask the user to run `dedash` on it; if it has Korean prose or label rows joined by middle dots, `dedot`. Name the files to pass.
9. **Report** each step as ran, skipped with its reason, or handed off, and name each lesson with the owner it landed in.

## Rules

- Keep the order. The lesson comes first because every later pass carries it; requirements are questioned before anything is consolidated, so nothing is moved that should have been deleted; `ssotize` precedes `re0` because `re0` repairs from the canonical source; `re0` precedes `debloat` because `debloat` tightens prose that is already current; `re0-order` follows both because they may cut or merge the items it moves; punctuation comes last because every rewrite regenerates dashes.
- Run a pass only when its condition holds and state every skip. Running every member by default is a misuse.
- Run each pass once. When a later pass finds duplication or drift it does not handle, report it with its location instead of looping back.
- Use the members; never reimplement their procedures. Skip a member that is not installed and say so; without `re0-memo` there is no lesson to carry, so stop and say so.
- `dedash` and `dedot` are user-invoked, so this skill names them as handoffs and never runs them.
- Stop at the artifact. Never stage, commit or push.

## Verification

1. Every step reports ran, skipped with a reason, or handed off; none is silent.
2. Every lesson `re0-memo` produced either landed in its owner or is reported with why it did not.
3. Every edit lies inside the pinned scope, and the passes ran in the stated order.
4. Each changed owner reads as its clean current version, with no lesson appended to a neighboring sentence.
