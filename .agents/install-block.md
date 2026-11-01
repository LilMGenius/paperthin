# The canonical install block

One install story, one wording. `README.md`, every translation under `assets/i18n/`, and the `### Install` section of every release note must say **this** and nothing else. Change it here first, then propagate.

## Managed installs first

Lead with installs that update themselves. Fall back to skills.sh only for agents that have no such install. Call a route managed only if it updates without the user running a command. Put any one-time opt-in beside its install command. Never promise "instant".

Claude Code and Codex install from this repo's own marketplace, `.claude-plugin/marketplace.json` and `plugin.json`. Those routes reinstall only when the `version` in `plugin.json` changes, so every release bumps it.

| Agent         | Route                  | Updates itself?                                 |
| ------------- | ---------------------- | ----------------------------------------------- |
| Claude Code   | `@paperthin` marketplace | Yes, after a one-time auto-update opt-in        |
| Codex         | `@paperthin` marketplace | Yes, at startup, by default                     |
| Everyone else | skills.sh              | Yes, through the daily job its block installs   |

Sources (2026-11-01): Claude Code [discover-plugins](https://code.claude.com/docs/en/discover-plugins#turn-auto-update-on-or-off-for-a-marketplace), which leaves auto-update off for every marketplace Anthropic does not ship.

## Claude Code

<canonical-block name="claude-code">

```bash
claude plugin marketplace add LilMGenius/paperthin && claude plugin install paperthin@paperthin
```

Then, once, in Claude Code, run `/plugin`, open **Marketplaces**, select `paperthin` and choose **Enable auto-update**.

</canonical-block>

## Codex

<canonical-block name="codex">

```bash
codex plugin marketplace add LilMGenius/paperthin && codex plugin add paperthin@paperthin
```

Updates itself at startup.

</canonical-block>

## Every other agent, or editable files (skills.sh)

`--agent '*'` installs for every agent the CLI supports; replace `'*'` with the agents you use (`opencode`, `cursor`, and others from its [supported agents](https://github.com/vercel-labs/skills/blob/main/docs/agents.md)) to leave out one that takes a plugin route. `npx skills@latest update` skips skills added upstream since `add`, so the daily job the block installs re-runs `add` too.

<canonical-block name="other-agents">

```bash
npx skills@latest add LilMGenius/paperthin --global --agent '*' && node "$HOME/.agents/skills/re0-upgrade/scripts/schedule/schedule.mjs" install
```

`schedule.mjs install` registers a per-user job, unelevated and windowless, that updates every skill at local 00:00 and picks up new ones. On Windows, run the line from an elevated shell if the CLI asks, so the skills are linked rather than copied; on macOS and Linux, run it without sudo.

</canonical-block>

`skills@latest` is the pinned spelling everywhere.

## The two routes are exclusive

The plugin is a managed, read-only bundle you subscribe to. skills.sh writes files you own and edit. Installing both leaves the user with every skill twice: always say "pick one".

Codex also reads `~/.agents/skills`, where every global skills.sh install lands. So when Codex is one of several agents and another of them has no plugin route, install all of them through skills.sh, Codex included, and skip the Codex plugin.

## Coming from an older install

An install from before the plugin routes, or one that wired a session-start notice, is moved by `/re0-upgrade`: it shows the plan first, moves a skills.sh install onto the Claude Code or Codex plugin without loading anything twice, removes the old notice wiring, installs the daily job where skills.sh stays, and brings that install to the full catalog. It is user-invoked, so the user types it in a fresh session ([invocation](./invocation.md)).

## Handed only this repository

An agent asked to "install https://github.com/LilMGenius/paperthin" or to "set this up" does this, in order:

1. Name the host it is running in: Claude Code, Codex, or another agent.
2. Check what is already installed. An older install wired a session-start notice: `~/.re0/` exists, or a `session-check.cjs` line sits in `~/.claude/settings.json`, `~/.codex/config.toml`, `~/.codex/hooks.json` or OpenCode's `opencode.json`. If one does, install nothing, tell the user to open a fresh session and run `/re0-upgrade`, which moves every agent onto its route and removes the wiring, and stop. Without that wiring, a paperthin skill under `~/.agents/skills` is a current skills.sh install: on skills.sh hosts and on Codex, which already reads that folder, leave it and stop; on Claude Code, ask the user whether to keep Claude Code on that install or run `/re0-upgrade` to move it, rather than adding a second copy.
3. Run that host's commands above in the user's shell. On skills.sh, `node "$HOME/.agents/skills/re0-upgrade/scripts/schedule/schedule.mjs" status` must then report the job registered.
4. Tell the user what is left for them: on Claude Code, turning on auto-update in `/plugin` as above, which only the user can do; on every host, starting a fresh session (or `/reload-plugins` in Claude Code), which is what loads the skills.
