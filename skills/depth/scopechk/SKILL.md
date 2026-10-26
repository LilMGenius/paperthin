---
name: scopechk
description: "Check whether an item falls inside a target's existing scope, as the target's own written sources define it; it never sets or narrows the scope of a piece of work. Use before a skill, script, module, rule, feature, doc section, or file is added to, moved into, promoted into, merged into, or upstreamed to a suite, repository, plugin, package, or document, and when someone asks whether X is in scope for Y, whether X belongs in Y, or which of several homes should own X."
---

Check whether an item falls inside a target's existing scope before it lands there.

## Goal

An item tends to land in whichever home is open, and once there it reads as part of that home's contract. `scopechk` returns a placement verdict for one item against each candidate target, read from what the target already says about itself: its written sources, or what its current members share where those are silent. It checks an item against a scope that exists and never sets or narrows the scope of a piece of work. It proposes; a human decides and moves.

## Workflow

1. **Pin.** Name the item, each candidate target, and the action asked (add, move, promote, merge, upstream). Separate any pointer the item carries (a link, a one-line reference) from the thing it points at; each gets its own verdict. If the item or a target cannot be read, report a MISS for it and stop there.
2. **Read the scope.** From the target's own sources (README, AGENTS.md, CONTRIBUTING, its layout cut, naming rules, install surface, stated audience), record each criterion with its file and section. Where the sources are silent, infer the criterion from what the current members share, label it `inferred`, and name those members. A criterion only the target's owner could settle becomes an owner question.
3. **Compare the nearest member.** Pick the existing member that serves the same kind of user or does the same kind of work, and say why it is nearest. Compare the item with it on each criterion. If no member is comparable, say so; that absence is itself evidence against the fit.
4. **List what the target takes on.** Write an inventory, not a score: new dependencies, the item reaching everyone who installs or clones the target, each public promise it would have to keep (a stable install, a release cadence, a public surface), and the upkeep it adds.
5. **Check reachability.** List everything the item points at (repositories, paths, services, accounts, tools) and confirm the target's users can reach each one, by opening it as they would or reading its visibility. Anything they cannot reach, such as a private repository in a public target or a path on one machine, is a failure. Anything you cannot check is marked `unverified` and named.
6. **Give the verdict,** one per item, pointer, and target:
   - `in scope`: every criterion holds and reachability passes;
   - `in scope after change`: name the exact change you propose (a line to cut, a path to replace, a dependency to drop) and the criterion it satisfies;
   - `split`: name each part and its home;
   - `out of scope`: name the home that fits and run steps 2 to 5 on it;
   - `pending owner`: an open owner question decides the verdict; state the question and the verdict each answer would give.
7. **Stop.** End with `Approval stop`: the proposed placement of each part, any owner questions, and a statement that nothing was moved, copied, renamed, registered, or deleted. The human who asked decides whether and where it lands.

## Rules

- Criteria come only from the target's sources or, labeled `inferred`, from its current members. Taste, the author's wishes, popularity, stars, and effort saved are never criteria.
- `out of scope` is a successful result. State it plainly and name a home that fits.
- A reachability failure or an open owner question rules out `in scope`; inference never answers an owner question.
- Propose only. Never edit, move, copy, rename, register, or delete the item or the target during the run.

## Verification

1. Every criterion cites its location in the target or carries the `inferred` label with its source members.
2. The nearest member is named with the reason it is nearest, or its absence is stated.
3. Every pointer was checked for reachability or marked `unverified`, and no failure sits under `in scope`.
4. Every verdict other than `in scope` names its change, its homes, or its owner question.
5. The run ends at the approval stop with nothing moved.
