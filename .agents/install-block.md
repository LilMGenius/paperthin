# The canonical install block

One install story, one wording. `README.md`, every translation under `assets/i18n/`, and the `### Install` section of every release note must say **this** and nothing else. Change it here first, then propagate.

paperthin installs through [skills.sh](https://skills.sh/LilMGenius/paperthin). The `skills` CLI keeps one canonical copy of each skill under `~/.agents/skills` and symlinks every agent's skill directory to it ([installation methods](https://github.com/vercel-labs/skills#installation-methods)), so every agent reads one copy and one update reaches all of them. Nothing updates on its own: `/re0-upgrade` is the update.

## First install: skills.sh

<canonical-block name="install">

```bash
npx skills@latest add LilMGenius/paperthin --global --agent '*'
```

Run it from an elevated/admin shell if your OS asks, so the skills are symlinked, not copied, and every agent reads one copy.

</canonical-block>

## Every install after that: re0-upgrade

<canonical-block name="stay-current">

```
/re0-upgrade
```

Run it whenever you want to update. In one confirmed step it installs the full current catalog: it retires renamed skills, adds the ones you don't have, refreshes the rest, and wires a quiet session-start notice for when new skills ship.

</canonical-block>

`re0-upgrade` owns every command after the first install, and its Current catalog is the roster. It ships and runs installed alone, so its add, update and remove forms are written inline in its own `SKILL.md` rather than here. `skills@latest` is the pinned spelling in both places, and [`check-install-block.cjs`](../scripts/gates/check-install-block.cjs) fails CI when a consumer drops the `install` block's command or spells the CLI any other way.

## Handed only this repository

An agent given this repository's URL and asked to set paperthin up runs the `install` block in the user's shell, then tells the user to open a fresh session and run `/re0-upgrade`. A fresh session is what loads the new skills, and `re0-upgrade` is user-invoked, so no agent can run it for them ([invocation](./invocation.md)).

## Not the install story

`.claude-plugin/plugin.json` lets Claude Code load a clone of this repository as a plugin (`/paperthin:<skill>`). The `skills` CLI cannot see, update, or remove that copy, and installing both leaves every skill twice, so `re0-upgrade` reports it as a shadow install and offers a managed reinstall. It is kept for loading an unreleased commit or a fork, and is **not** documented to users.
