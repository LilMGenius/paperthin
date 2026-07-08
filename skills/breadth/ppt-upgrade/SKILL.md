---
name: ppt-upgrade
description: "Safely upgrade your installed paperthin skills to the latest release in one step, including anything that's been renamed, without installing anything you didn't already have."
disable-model-invocation: true
---

Bring an installed paperthin skill set current in one step: retire what's been renamed, add only its replacement, refresh the rest, and leave anything else alone.

## Goal

Keep a returning user's installed paperthin skills current after release renames. The upgrade retires stale local names, adds only the matching replacement for each stale name the user already had, and refreshes the installed current skills.

## Deprecations

This ordered checklist is the rename SSOT. Append future renames here in release order.

The `ssot-check` row is user-confirmed from pre-v0.2.0 history that current git history cannot verify after a force-push; do not invent a date or tag for it.

| Deprecated | Renamed to | Since |
| --- | --- | --- |
| `ssot-check` | `ssotchk` | pre-v0.2.0 history (force-pushed; user-confirmed) |
| `tasting` | `sip` | 0.6.0 |
| `redteam` | `hate` | 0.7.0 |
| `scratch` | `re0-work` | 0.8.2 |

## Current catalog

Use this list to separate current paperthin skills from unknown installed names when parsing `npx skills list` and installed skill directories.

`autobahn`, `dedash`, `factchk`, `flywheel`, `hate`, `mandela`, `nba`, `ppt-upgrade`, `re0`, `re0-git`, `re0-work`, `retro`, `shower`, `sip`, `ssotchk`, `ssotize`

## Workflow

1. Pick one install scope and keep it for the whole run:
   - global install: read with `npx skills list --global`, inspect `~/.agents/skills/<skill>/SKILL.md`, and use `--global` on every `remove`, `add`, and `update` command;
   - project install: read with `npx skills list` from that project, inspect that project's installed skill directory if present, and omit `--global`;
   - exact-agent install: use only explicit agent slugs such as `--agent claude-code`, never `--agent '*'`.
2. Cross-reference both installed names and installed directory slugs against the deprecations checklist:
   - stale names are installed entries or installed directory slugs in the `Deprecated` column;
   - replacement names are their `Renamed to` values;
   - current names are installed entries in the current catalog that are not deprecated;
   - unknown installed names stay untouched.
3. Report the full install reconciliation plan before changing anything:
   - retire: `<stale names>`;
   - add replacements: `<renamed-to names>` only when their stale source was installed and the replacement is not already installed;
   - update: `<current installed paperthin names>`;
   - untouched: unknown names and paperthin skills the user never installed.
4. Ask for explicit confirmation before any removal or install reconciliation command.
5. After confirmation, run only the selective commands needed for the reported plan, with the same scope flags chosen in step 1:
   - `npx skills remove <scope-flags> <stale...> --yes` for deprecated names the user confirmed retiring;
   - `npx skills add LilMGenius/paperthin <scope-flags> -s <renamed-to...> --yes` for replacement names derived from installed deprecated names;
   - `npx skills update <scope-flags> <current-installed-paperthin...> <renamed-to...> --yes` to refresh only already-installed current skills and replacements in the reported plan.
6. If `npx skills update` reports that a specific skill failed, retry that skill alone with the same scope flags; if it still fails, confirm with the user by name, then remove and reinstall it using the same `skills remove`/`skills add -s` forms as step 5, rather than leaving it stale.
7. Verify with `npx skills list`: no deprecated name remains, each expected replacement is present, current installed skills remain present, and no untouched skill was added.
8. Tell the user how their current session picks up the change: Claude Code applies updated `SKILL.md` content in the current session automatically, no restart needed, unless a different already-running Claude Code session shares the same install, in which case run `/reload-skills` in that other session. Codex has no in-session reload; restart Codex (or `codex resume`) to pick up the change. For any other agent, restart its session if the new behavior doesn't show up.
9. Optional post-upgrade GitHub star: after successful verification, ask the default-yes consent prompt `Star this repo now? [Y/n]`. If the user answers `Y`, `y`, or presses Enter, run `gh api -X PUT user/starred/LilMGenius/paperthin --silent`; if the user answers `n` or `N`, skip the star step and report that it was skipped. If `gh` is missing or unauthenticated, print the command and the `gh auth login` hint instead of using any token or API fallback.

## Rules

- The flat `npx skills add` path installs this command as `/ppt-upgrade`; never describe a paperthin `ppt` namespace as part of the primary install path.
- Never use `skills add --all`.
- Never run a bare `skills add LilMGenius/paperthin`; always include `-s <skill>` for replacement installs.
- Do not use raw filesystem deletion commands as workflow commands. Use `skills remove` for named stale skills after confirmation.
- Do not install the full catalog to "make sure" the user is current. Respect their previous subset.
- Do not run a bare `skills update`; pass only the paperthin skill names from the reported plan.
- Do not use wildcard agent scope for removal. If agent scoping is needed, pass explicit agent slugs; otherwise use `--global` or project scope.
- Only act on names from the deprecations checklist and paperthin catalog entries. Leave unknown installed names untouched.
- Treat a deprecated directory slug as stale even when its `SKILL.md` frontmatter `name` already says the replacement name; remove it by the deprecated slug with `skills remove`.
- If a replacement is already installed, do not add it again; retire the stale name and include the replacement in verification.
- `gh repo star` is not a real `gh` subcommand; the star step must use the REST endpoint directly: `gh api -X PUT user/starred/<owner>/<repo> --silent`.
- If the installed-skill list cannot be parsed confidently, stop and report the ambiguity instead of guessing.

## Verification

Before finishing:

1. Reprint the executed plan with stale names, replacements, updated current names, and untouched names.
2. Confirm the final installed list and installed directory slugs have no name from the `Deprecated` column.
3. Confirm every replacement for an installed stale name is present.
4. Confirm no paperthin skill outside the user's previous installed subset plus required replacements was added.
5. Confirm any skill that took the retry/fallback path in step 6 is actually present and current, not silently missing.
6. Report any skipped step, failed command, or unresolved ambiguity.
