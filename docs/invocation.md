# Model-invoked vs user-invoked

Every `SKILL.md` in this repo is a skill. The one axis that splits them is **invocation** — who can reach it:

- **User-invoked** — reachable **only by the human typing its name**. Set `disable-model-invocation: true` in the frontmatter. The `description` is **human-facing**: a one-line summary read by a person browsing slash-commands. Strip trigger lists ("Use when the user says…").
- **Model-invoked** — reachable by **model or user**. The default: omit `disable-model-invocation`. The `description` is **model-facing** and keeps rich trigger phrasing ("Use when the user wants…, mentions…, asks for…") so auto-invocation fires. The test for whether a skill should stay model-invoked: _could the model usefully reach for this autonomously?_ (Reuse is the reason to extract a skill, not the test.)

Because a user-invoked skill has no model-facing trigger, nothing but the human can reach it — no other skill can fire it. So a user-invoked skill may invoke model-invoked skills, but it can never reach another user-invoked skill.

The localized READMEs and the top-level `README.md` mark invocation in the fourth catalog column.

## Invocation choices, and why

Default to model-invoked. A skill is user-invoked only when the model should never reach it on its own — either its trigger is a deliberate, human-decided action (commit, push, publish, deploy), or its mere presence in the model's reach would bias the agent. The sixteen user-invoked skills today, with the model-invoked style check at the cleanup boundary:

- `hate` — a demolition reflex always in reach biases the agent toward demolition.
- `macrothink` — plural fresh reads are an opt-in perspective spend; convergence must not masquerade as automatic proof.
- `feynman` — a challenge-every-decision reflex in reach biases toward chronic self-doubt.
- `re0-style` — model-invoked: checking code style, conventions, and consistency is useful during review; the default is zero edits and a short report.
- `re0-order` — reordering churns a listing; its logical order is an opinionated, deliberate call.
- `dedash` — the human owns the exact prose scope.
- `dedot`: the writer owns the exact Korean prose scope and chooses whether to apply each reasoned punctuation proposal.
- `debloat` — how tight and what to cut is an opinionated, scope-dependent call the human owns; a compress reflex in reach would over-compress or strip intended richness.
- `re0-git` — committing is human-decided; a commit-cleanup reflex in reach would bias toward committing.
- `re0-release` — publishing a release is a deliberate, human-decided action.
- `re0-merge` — reviewing and landing a contribution is a deliberate maintainer act a review reflex would bias toward merging.
- `re0-upgrade` — it makes consequential local changes (reinstalling skill entries, writing a session-start hook into each agent's config).
- `re0-plan` — it assumes the full paperthin package installed and pairs deliberately with `re0-release`, not a general-purpose reflex.
- `re0-tutorial`: starting a graded exercise is a deliberate learner choice; completion depends on the learner's own submission, never an invocation trace.
- `re0-watch`: arming a watch is a deliberate human action; it alerts by default and hands recovery proposals to a human for approval.
- `prism` — plural lenses are an opt-in spend whose convergence must not pass as automatic proof.
- `multithink`: adjudicating already-collected reads and choosing an optional evidence exchange are deliberate user decisions; finding classes depend on cited evidence, never on counts.

Two skills stay model-invoked against the grain: `autobahn` (the model should autonomously carve risk-adjacent scope before execution) and `modelchk` (advisory capability sizing should be available before the model spends a run).

## Dependencies between them

Dependencies are expressed as **`/skill`-style prose invocation** ("Run the `/re0` skill"), not deep `../other-skill/FILE.md` cross-references. Shared reference docs live inside the skill that owns them; other skills reach that material by invoking the skill, not by linking across folders.

## Passive vs active domain work

Merely reading a local context file for vocabulary is a one-line prose pointer, not a skill invocation. Only active cleanup or verification work should name the relevant skill, such as `/re0` for a drifting artifact or `/ssotize` for a scattered fact.
