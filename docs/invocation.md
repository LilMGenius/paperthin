# Model-invoked vs user-invoked

Every `SKILL.md` in this repo is a skill. The one axis that splits them is **invocation** — who can reach it:

- **User-invoked** — reachable **only by the human typing its name**. Set `disable-model-invocation: true` in the frontmatter. The `description` is **human-facing**: a one-line summary read by a person browsing slash-commands. Strip trigger lists ("Use when the user says…").
- **Model-invoked** — reachable by **model or user**. The default: omit `disable-model-invocation`. The `description` is **model-facing** and keeps rich trigger phrasing ("Use when the user wants…, mentions…, asks for…") so auto-invocation fires. The test for whether a skill should stay model-invoked: _could the model usefully reach for this autonomously?_ (Reuse is the reason to extract a skill, not the test.)

Because a user-invoked skill has no model-facing trigger, nothing but the human can reach it — no other skill can fire it. So a user-invoked skill may invoke model-invoked skills, but it can never reach another user-invoked skill.

The localized READMEs and the top-level `README.md` mark invocation in the fourth catalog column.

## Dependencies between them

Dependencies are expressed as **`/skill`-style prose invocation** ("Run the `/re0` skill"), not deep `../other-skill/FILE.md` cross-references. Shared reference docs live inside the skill that owns them; other skills reach that material by invoking the skill, not by linking across folders.

## Passive vs active domain work

Merely reading a local context file for vocabulary is a one-line prose pointer, not a skill invocation. Only active cleanup or verification work should name the relevant skill, such as `/re0` for a drifting artifact or `/ssotize` for a scattered fact.
