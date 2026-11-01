---
name: re0-upgrade
description: "Keep one paperthin install current and loaded once: move an old skills.sh install onto the Claude Code or Codex plugin, clear the session-start notice older releases wired, set up the daily update job where skills.sh stays, and bring that install to the full current catalog, all shown and confirmed first."
disable-model-invocation: true
---

Keep one paperthin install per agent, current and loaded once, after you see and confirm the plan.

## Goal

Each agent runs paperthin from one route that stays current without the user remembering. Claude Code and Codex take the plugin route, which each host's own marketplace update keeps current; OpenCode and every other agent take the skills.sh route, which a daily per-user job keeps current. This skill does the part neither updater does: it moves an old skills.sh install onto the plugin route without leaving every skill loaded twice, removes the session-start notice older releases wired into agent configs, installs or checks the daily job where skills.sh stays, and brings a skills.sh install to the full current catalog, retiring renamed skills and adding the ones the user never installed. An integrity gate protects any locally edited copy before anything replaces or removes it.

It is **user-invoked** on purpose: it removes skill installs, edits agent configs and registers a scheduled job, so it runs only when the human asks.

## Deprecations

This section owns every rename and retirement, in release order; a future one appends its row here. A rename chain resolves to its final current name. A skill removed with no replacement carries `retired` (no backticks around the word in the table) in the Renamed-to column. The `ssot-check` row is user-confirmed history from before v0.2.0 that git cannot verify after a force-push; never invent its date or tag.

| Deprecated | Renamed to | Since |
| --- | --- | --- |
| `ssot-check` | `ssotchk` | pre-v0.2.0 history (force-pushed; user-confirmed) |
| `tasting` | `sip` | 0.6.0 |
| `redteam` | `hate` | 0.7.0 |
| `scratch` | `re0-work` | 0.8.2 |
| `retro` | `re0-memo` | 0.11.0 |
| `flywheel` | `re0-loop` | 0.11.0 |
| `ssotchk` | `ssotize` | 0.11.0 |
| `ppt-upgrade` | `re0-upgrade` | 0.11.0 |
| `ppt-release` | `re0-release` | 0.11.0 |
| `readchk` | `readback` | 1.0.0 |
| `reorder` | `re0-order` | 1.0.0 |
| `prism` | retired | 1.0.0 |
| `feynman` | `whychk` | 1.0.0 |

## Current catalog

Install every skill listed here in the chosen scope, except any the user declines at confirmation. This roster is also how the list output and the installed directories tell current names from unknown ones.

`re0`, `readback`, `aim`, `modelchk`, `elon`, `scopechk`, `hate`, `macrothink`, `crossthink`, `re0-decide`, `whychk`, `autobahn`, `re0-style`, `detool`, `debloat`, `re0-order`, `dedash`, `dedot`, `shower`, `factchk`, `mandela`, `demock`, `deid`, `sip`, `re0-git`, `re0-squash`, `re0-release`, `re0-merge`, `ssotize`, `ssotize-local`, `re0-readme`, `re0-import`, `re0-upgrade`, `re0-plan`, `re0-loop`, `re0-watch`, `re0-memo`, `backprop`, `re0-work`, `catchup`, `nba`, `re0-workflow`, `re0-tutorial`, `multithink`

## Workflow

Run every script from this skill's folder. Each one reads and reports, or makes only the one change its verb names; none decides anything a person must.

1. **Find each agent's route.** Ask which agents the user runs if it is not clear, then name the route each one loads paperthin from:
   - Plugin: the host lists paperthin as an installed plugin (Claude Code `/plugin`, Codex `/plugins`), or its plugin cache holds it (`~/.claude/plugins/cache/<marketplace>/paperthin/`, `~/.codex/plugins/cache/<marketplace>/paperthin/`).
   - skills.sh: `npx skills@latest list --global` lists paperthin names, or `npx skills@latest list` does from a project; the canonical copies sit in `~/.agents/skills/` (global) or the project's `.agents/skills/`.
   - Both: the agent loads every skill twice. Codex reads `~/.agents/skills` itself beside its plugins, so a Codex plugin install plus any global skills.sh copy is both, whichever agent the skills.sh copy was added for.
   - Neither, while paperthin is loaded: a clone loaded as a plugin for development, which no updater sees. Report it and leave it untouched.
2. **Find the old notice wiring.** Run `node scripts/upgrade.mjs wiring` (`--home <dir>` reads another home). It reads Claude Code's `settings.json`, Codex's `config.toml` and `hooks.json`, OpenCode's `opencode.json` and `opencode.jsonc` (under `XDG_CONFIG_HOME` when set), and `~/.re0/`, and prints JSON naming each file and line that runs `session-check.cjs` or loads `opencode-discovery.js`, plus the `~/.re0/` runtime copy. Exit 0 means none, 1 means some was found, 2 a usage error. Nothing else in those files is reported or touched.
3. **Classify a skills.sh install that stays.** Pick its scope, global or one project, and carry that scope's flags, written `<scope-flags>` below (`--global` or nothing; for one agent, explicit slugs such as `--agent claude-code`, never `--agent '*'`, from the CLI's [supported agents table](https://github.com/vercel-labs/skills/blob/main/docs/agents.md)). Run `node scripts/upgrade.mjs classify --skill-md SKILL.md --installed <dir-or-file>`, with `--installed` the scope's skills directory (its folder slugs are read, whatever their frontmatter names) or a text file holding one name per line from the scoped list. Input: this file's Deprecations table and Current catalog, the one source of both. Output: JSON with four groups. `stale` lists each deprecated name or slug with the final current name its rename chain resolves to (null for a retired name) and whether that replacement is installed; `missing` lists current names not installed; `present` lists current names installed; `unknown` lists names in neither section, left untouched. An installed replacement is present, so only its stale name is retired and the replacement is not added again. Exit 0 means nothing is stale or missing, 1 means something is, 2 means a usage error or a table it cannot read confidently (a malformed row, a rename loop, a chain ending outside the catalog, a line holding more than one name); on 2, stop and report the ambiguity. If the scope's list shows no paperthin skill while a catalog folder sits in its directory, retry once, then report the CLI failure and stop; a flaky read is not an empty install.
4. **Check the daily job** where a global skills.sh install stays: `node scripts/schedule/schedule.mjs status`. It prints JSON with whether the OS scheduler holds the job, its next run, the log path and the last run's start, end and exit code, and exits 0 when the job is registered, 1 when it is not. The job covers the global scope only; a project-scope install is kept current by running this skill.
5. **Print the plan** before any change, per agent and in this order: its route now and after; move to plugin (the skills.sh names to remove, and whether the whole install goes or only some agents' links); remove old wiring (each file and line from step 2, and `~/.re0/`); refresh the skills.sh install that stays (retire the stale names; add (new to you), every missing name in full, replacements for retired names included; refresh the present names; untouched, the unknown names); daily job (install, keep, or uninstall when no skills.sh install stays); execution order as the steps below run it.
6. **Confirm.** Get explicit confirmation before any removal, install, update, config edit or job change. Recommend one route per agent, the full catalog and the daily job. The user decides: approve, decline the whole run, decline individual catalog skills (which then stay out of the add group), or decline any one change. Nothing mutates before approval.
7. **Move onto the plugin route**, where approved:
   1. Verify the plugin serves the skills before removing anything: in a fresh or reloaded session (step 14), the host lists paperthin enabled and resolves a skill by its plugin name (Claude Code `/paperthin:<skill>`); invoke one skill explicitly on an input its Workflow handles and confirm it runs to its own Verification. Until that holds, keep the skills.sh copies and report the move pending, with the resume step: reload, verify, remove.
   2. Pass the integrity gate (step 11) for every skills.sh copy to be removed.
   3. If no remaining agent needs the skills.sh install, uninstall the daily job first (`node scripts/schedule/schedule.mjs uninstall`, which removes the job and nothing else), then remove every installed catalog and stale name: `npx skills@latest remove --global <names...> --yes`. If another agent still loads paperthin through skills.sh, remove only the moved agents' links (`npx skills@latest remove --global --agent <slug...> <names...> --yes`) and keep the job; Codex reads the canonical directory itself, so a Codex moved while another agent keeps the global skills.sh install still loads twice. Say so and let the user choose which agent gives way.
8. **Remove the old wiring**, where approved. Back up each config beside itself (`<file>.pre-re0-unwire.bak`) before editing it, then remove the entry holding each hit and nothing beside it: in Claude Code's `settings.json` the hook object whose command runs `session-check.cjs`, and its `SessionStart` group if that leaves it empty; in Codex's `config.toml` the `[[hooks.SessionStart]]` table and its `[[hooks.SessionStart.hooks]]` lines whose command runs `session-check.cjs` (in `hooks.json`, the same object as Claude Code's); in OpenCode's config the `plugin` array element naming `opencode-discovery.js`. Remove `~/.re0/` only when it holds nothing but what older releases wrote there (`catalog.cjs`, `session-check.cjs`, `opencode-discovery.js`, `last-notice.json`); otherwise report what else it holds and leave it. Never edit another tool's hook. Rerun step 2; it must exit 0.
9. **Refresh the skills.sh install that stays**, with step 3's scope flags and only the commands the plan named:
   1. Add the add group: `npx skills@latest add LilMGenius/paperthin <scope-flags> -s <missing...> --yes`, each catalog name with its own `-s`.
   2. Refresh the refresh group after the integrity gate (step 11): `npx skills@latest update <scope-flags> <present...> --yes`.
   3. Verify "new works" for each replacement, newly added or already present, in the same scope. It is listed; its own directory holds `SKILL.md` with the right frontmatter name and Goal, Workflow, Rules and Verification sections; no add or update failure remains for it. Reload as in step 14, observe the host resolve the new name, then invoke the replacement explicitly on one input its Workflow handles and confirm it runs to its own Verification. Availability plus that run close "new works"; files on disk alone do not. If a reload or fresh session is unavailable, report the migration pending and keep the stale name, recording in the handoff the scope, the stale and replacement pair, and the resume step. A retired name has no replacement, so it has no such step.
   4. Retire only stale names whose replacement closed "new works", and retired names, after the integrity gate (step 11): `npx skills@latest remove <scope-flags> <stale...> --yes`.
10. **Install the daily job** where a global skills.sh install stays and step 4 found none: `node scripts/schedule/schedule.mjs install`, then `status` again, which must show the job registered with its next run at the coming local 00:00. The job runs as the user, unelevated and without a window: Task Scheduler on Windows, a launchd LaunchAgent on macOS, a systemd user timer on Linux, or a crontab line where systemd is absent. Each run updates every global skill (`npx -y skills@latest update -g -y`), then adds each skill in the latest release's Current catalog that is not installed, since `update` never adds a skill shipped after the install, and adds nothing where no paperthin skill is installed. It writes one log of its last ten runs and exits non-zero on a failure, so `status` and the scheduler both show it. A missed midnight runs at the next login or wake; a Linux user timer runs only while the user's session is up, unless lingering is on.
11. **Pass the integrity gate** before any remove, update or reinstall of a skills.sh copy. Compare the installed file with the published revisions of the independently pinned upstream LilMGenius/paperthin by running `node scripts/upgrade.mjs integrity --installed-file <installed SKILL.md> --skill <slug> --lock <.skill-lock.json> --fetch` once per name.
    - Input: the installed file's bytes, its slug and the scope's `.skill-lock.json`, which gives lookup hints, never authority, and no release version. The script accepts the lock entry only when its source and source URL name that upstream and its skill path is `skills/<perspective>/<slug>/SKILL.md` with the checked slug, a catalog perspective (breadth, depth, coil, mesh), and no traversal or absolute component.
    - It reads every page of `https://api.github.com/repos/LilMGenius/paperthin/releases`, skips drafts, and fetches the validated path from `https://raw.githubusercontent.com/LilMGenius/paperthin/<tag>/<path>` at each published tag, newest first, until the bytes match; a 404 means that tag does not hold the path. Timestamps order the candidates and never exclude one, so the walk is complete only when every tag answered.
    - Output: JSON with `result`, its `reason`, the validated `path` and each tag `walked` with its status. A match is `clean`, exit 0. A full walk with no match is `divergent-or-unknown`, exit 1. A missing entry, unexpected source, invalid path, unreadable lock or release list, failed fetch or incomplete walk is `cannot-compare`, exit 1, never clean. Exit 2 is a usage error. The lock's folder hash is never read, and integrity is never inferred from it.
    - For either non-clean result, report that name stopped and preserve it. Offer a scoped merge of the local difference onto the released content, show the result before writing it, and write only with the user's explicit authorization for that skill.
12. **Handle failures.** If add or update reports a failed skill, retry that skill alone with the same scope flags; any mutation of an installed file still passes the integrity gate. If it fails again, get the user's confirmation by skill name, then remove and reinstall that same name with the same `remove` and `add -s` forms, behind the integrity gate. If the reinstall fails, report the skill absent. A replacement or plugin route that fails to reach "new works" cancels the removal paired with it: keep the old copy and report the move stopped with the reason, never retried as a removal. An outstanding host reload is pending, not a failure. A job `install` or `status` that exits 1 is reported with its message; never report the job as running without a `status` that shows it registered.
13. **Verify**:
    - every agent loads paperthin from one route, or the report names the agent still loading twice and why;
    - step 2 exits 0, or each hit left in place is reported with its reason;
    - every executed removal closed "new works" first, every pending move or migration lists its retained name and resume step, and every stopped one lists its retained name and reason;
    - every Current catalog skill the user did not decline is installed on the skills.sh route that stays, unknown names are untouched, and any skill that took the retry or fallback path is present;
    - the daily job's `status` shows it registered where a global skills.sh install stays, and not registered where none stays.

    Report any failure as incomplete, never as a successful upgrade.
14. **Explain pickup.** Claude Code applies changed `SKILL.md` content automatically in this session; run `/reload-skills` in any other running Claude Code session that shares the install, and `/reload-plugins` after a plugin change. Codex has no in-session reload: restart it, or `codex resume`. For other agents, restart if the new behavior does not appear.
15. **Offer the star**, after successful verification and after reporting the upgrade outcome. Ask once through the host's structured user-question tool: "Star LilMGenius/paperthin on GitHub using your authenticated gh account?" with the options "Star repository" then "Skip", and explain that starring is optional and skipping leaves the upgrade unchanged.
    - Wait until a choice is submitted, yielding to the host's input flow and resuming on its answer. Only a submitted "Star repository" authorizes the star; preselection, silence, upgrade approval and the install's `--yes` never do.
    - Skip if the tool is unavailable, the run is unattended, or the outcome is anything else (skip, cancel, session closed, timeout, free text). Never repeat the question, substitute a chat message, parse assent, or use another input method.
    - After approval, run `gh auth status --hostname github.com`. If gh is missing or auth fails, skip, and offer `gh auth login --hostname github.com` and the star command for the user to run. Never log in, read tokens or switch API clients. On decline, offer neither command nor a login nudge.
    - With approval and working auth, run `gh api --hostname github.com -X PUT user/starred/LilMGenius/paperthin --silent` once; `--silent` hides only the response body. On success report "star is set", never "newly added"; report failures separately. Report the star outcome on its own, after the upgrade report and apart from upgrade success. Star outcomes never block or undo the upgrade.

## Rules

- User-invoked on purpose: it removes skill installs, edits agent configs and registers a scheduled job, so only the human runs it.
- One route per agent. Never leave an agent loading paperthin from both the plugin and skills.sh without saying so in the report.
- Never remove a skills.sh copy before the plugin that replaces it has closed "new works" in that agent, and never remove a stale name before its replacement has.
- Act only on names in Deprecations and Current catalog. Unknown installed names stay untouched; converge to the paperthin catalog only.
- A deprecated directory slug is stale even if its `SKILL.md` frontmatter name already says the replacement; remove it by the deprecated slug with `skills remove`.
- If the installed list cannot be parsed confidently, stop and report the ambiguity.
- Remove skills only through `skills remove` after confirmation. The one raw deletion is `~/.re0/`, and only when it holds nothing but the files older releases wrote there.
- Never remove, update or reinstall a skill whose content diverges from its release or cannot be compared without the user's explicit authorization for that skill.
- Never run `skills add --all` or a bare `skills add LilMGenius/paperthin`. Give each name its own `-s`, so the Current catalog defines the install rather than the broader meaning of `--all`.
- Never run a bare `skills update` from this skill; pass only the present paperthin names from the plan. The daily job's global update is the job's own, set at install.
- Write no hook into any agent's config. The daily job is the only thing this skill registers, and `schedule.mjs uninstall` removes it and nothing else.
- `gh repo star` is not a real gh subcommand; star only through the consent-gated REST command in step 15.
- Call no other skill through the Skill tool. Invoking a replacement explicitly in steps 7 and 9 is a check, not a delegation.
- The user decides at five stops: the plan before any mutation (step 6), which agent gives way when Codex would still load twice (step 7), per-skill authorization for a non-clean integrity result or a merge (step 11), per-name confirmation before a remove-and-reinstall fallback (step 12), and the star through the structured tool (step 15).

## Verification

With nothing to move, remove, add or install, the plan shows only the refresh and untouched groups and the run still verifies. A declined run changes nothing. Before reporting, confirm:

1. The executed plan is reprinted per agent: route before and after, wiring removed, retired, added (new to you), refreshed, untouched, and the daily job's state.
2. No agent loads paperthin twice, or the report names each one that still does and why.
3. `node scripts/upgrade.mjs wiring` exits 0, or each remaining hit is reported with its reason, and every edited config has its `.pre-re0-unwire.bak` beside it.
4. The final list and slugs carry no stale name except those reported pending or stopped, each with its reason and, for pending, its resume step; every Current catalog skill the user did not decline is installed on the skills.sh route that stays.
5. `node scripts/schedule/schedule.mjs status` shows the job registered with its next run at local 00:00 where a global skills.sh install stays, and exits 1 where none stays.
6. The confirmation gate held: nothing was removed, added, updated, edited or registered before the plan was shown and approved.
7. The star ran only on a submitted positive choice from the structured tool, or was skipped, and its outcome is reported apart from upgrade success.
8. Any skipped step, failed command or unresolved ambiguity is reported.
