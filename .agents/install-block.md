# The canonical install block

One install story. `README.md`, every translation under `assets/i18n/`, and the `### Install` section of every release note carry **these commands** and nothing that contradicts them. Change it here first, then propagate; [`npm run check`](../scripts/gates/check.cjs) fails a README that drops any command in a block below.

## One route per agent

Claude Code and Codex install paperthin as a plugin from this repository's marketplace (`.claude-plugin/marketplace.json` and `plugin.json`); every other agent installs it through [skills.sh](https://skills.sh/LilMGenius/paperthin). Each route keeps it current after setup, as the table says. Pick one route per agent: installing both leaves every skill loaded twice.

| Agent | Route | Updates itself? |
| --- | --- | --- |
| Claude Code | `paperthin@paperthin` plugin | Yes, after turning on auto-update once |
| Codex | `paperthin@paperthin` plugin | Yes, at session start, by default |
| Every other agent | skills.sh | Yes, through the daily job its block installs |

Codex also reads `~/.agents/skills`, where every global skills.sh install lands. So when Codex is one of several agents and another of them has no plugin route, install all of them through skills.sh, Codex included, and skip the Codex plugin.

## Claude Code

<canonical-block name="claude-code">

```bash
claude plugin marketplace add LilMGenius/paperthin && claude plugin install paperthin@paperthin
```

Then turn on auto-update once, since Claude Code leaves it off for every marketplace Anthropic does not ship ([docs](https://code.claude.com/docs/en/discover-plugins#turn-auto-update-on-or-off-for-a-marketplace)): run `/plugin` in a session, open **Marketplaces**, select `paperthin` and choose **Enable auto-update**.

</canonical-block>

## Codex

<canonical-block name="codex">

```bash
codex plugin marketplace add LilMGenius/paperthin && codex plugin add paperthin@paperthin
```

Codex refreshes the marketplace at every session start and updates the plugin itself.

</canonical-block>

## Every other agent (skills.sh)

<canonical-block name="other-agents">

```bash
npx skills@latest add LilMGenius/paperthin --global --agent '*' && node "$HOME/.agents/skills/re0-upgrade/scripts/schedule/schedule.mjs" install
```

`skills add` installs one canonical copy of each skill under `~/.agents/skills` and links every agent's skill folder to it. Replace `'*'` with the agents you use (`opencode`, `cursor`, and others from the CLI's [supported agents](https://github.com/vercel-labs/skills/blob/main/docs/agents.md)) to leave out an agent that takes a plugin route. `schedule.mjs install` then registers a per-user job, unelevated and windowless, that runs at local 00:00 (Task Scheduler, a launchd LaunchAgent, or a systemd user timer with cron as the fallback), updates every global skill and adds any skill a newer release ships. On Windows, run the line from an elevated shell if the CLI asks, so the skills are linked rather than copied; the task still registers at least privilege and runs as the user. On macOS and Linux, run it without sudo, since the job belongs to the user.

</canonical-block>

`skills@latest` is the one spelling used everywhere.

## Coming from an older install

An install from before the plugin routes, or one that wired a session-start notice, is moved by `/re0-upgrade`: it shows the plan first, moves a skills.sh install onto the Claude Code or Codex plugin without loading anything twice, removes the old notice wiring, installs the daily job where skills.sh stays, and brings that install to the full catalog. It is user-invoked, so the user types it in a fresh session ([invocation](./invocation.md)).

## Handed only this repository

An agent asked to "install https://github.com/LilMGenius/paperthin" or to "set this up" does this, in order:

1. Name the host it is running in: Claude Code, Codex, or another agent.
2. Check what is already installed. An older install wired a session-start notice: `~/.re0/` exists, or a `session-check.cjs` line sits in `~/.claude/settings.json`, `~/.codex/config.toml`, `~/.codex/hooks.json` or OpenCode's `opencode.json`. If one does, install nothing, tell the user to open a fresh session and run `/re0-upgrade`, which moves every agent onto its route and removes the wiring, and stop. Without that wiring, a paperthin skill under `~/.agents/skills` is a current skills.sh install: on skills.sh hosts and on Codex, which already reads that folder, leave it and stop; on Claude Code, ask the user whether to keep Claude Code on that install or run `/re0-upgrade` to move it, rather than adding a second copy.
3. Run that host's commands above in the user's shell. On skills.sh, `node "$HOME/.agents/skills/re0-upgrade/scripts/schedule/schedule.mjs" status` must then report the job registered.
4. Tell the user what is left for them: on Claude Code, turning on auto-update in `/plugin` as above, which only the user can do; on every host, starting a fresh session (or `/reload-plugins` in Claude Code), which is what loads the skills.
