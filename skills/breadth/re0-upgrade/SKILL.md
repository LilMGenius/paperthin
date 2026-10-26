---
name: re0-upgrade
description: "Bring your installed paperthin skills up to the full current catalog in one step: retire what's been renamed, add every skill you don't have yet, and refresh the rest, all shown and confirmed before anything changes."
disable-model-invocation: true
---

Upgrade one install scope to the full current paperthin catalog: retire renamed skills, add the ones you never installed, and refresh the rest, after you see and confirm the plan.

## Goal

Bring the chosen scope to the full current catalog, including skills the user never installed: retire every renamed skill, add every missing one, and refresh the rest. The plan names every skill new to the user before anything changes, so a user who prefers a narrower install can decline.

It is **user-invoked** on purpose: it makes consequential local changes, reinstalling skill entries and writing a session-start hook into each agent's config, so it runs only when the human asks.

## Deprecations

This section owns every rename, in release order; a future rename appends its row here. A rename chain resolves to its final current name. The `ssot-check` row is user-confirmed history from before v0.2.0 that git cannot verify after a force-push; never invent its date or tag.

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

## Current catalog

Install every skill listed here in the chosen scope, except any the user declines at confirmation. This roster is also how the list output and the installed directories tell current names from unknown ones.

`re0`, `readback`, `aim`, `modelchk`, `elon`, `scopechk`, `hate`, `macrothink`, `re0-decide`, `feynman`, `autobahn`, `re0-style`, `detool`, `debloat`, `re0-order`, `dedash`, `dedot`, `shower`, `factchk`, `mandela`, `sip`, `re0-git`, `re0-squash`, `re0-release`, `re0-merge`, `ssotize`, `ssotize-local`, `re0-readme`, `re0-import`, `re0-upgrade`, `re0-plan`, `re0-loop`, `re0-watch`, `re0-memo`, `re0-work`, `catchup`, `nba`, `re0-workflow`, `re0-tutorial`, `prism`, `multithink`

## Workflow

1. **Choose one scope.** Use one install scope for the whole run, and ask the user if they did not name one. The scope decides which install location you read and the flags every command carries, written `<scope-flags>` below:
   - Global: list with `npx skills@latest list --global`, inspect `~/.agents/skills/<skill>/SKILL.md`, and pass `--global` to every remove, add and update.
   - Project: list with `npx skills@latest list` from that project, inspect its installed skill directory if it has one, and omit `--global`.
   - Exact agent: pass explicit slugs such as `--agent claude-code`, never `--agent '*'`, removals included. Without agent scoping, use global or project scope.

   From here on, list with `npx skills@latest list <scope-flags>`.
2. **Rule out a shadow install.** Before classifying, if paperthin is loaded but the scope's list shows zero paperthin skills, do not conclude the catalog is missing. Look for any Current catalog directory in the scope's managed footprint (`~/.agents/skills/` globally, for example `~/.agents/skills/re0`).
   - Directory present: re-check the scope and retry the list. If it still contradicts the footprint, report the CLI failure and stop; a flaky read is not an empty install.
   - Directory absent while paperthin is loaded: report a shadow install, often a clone loaded as a Claude Code plugin (`/paperthin:<skill>`), which the CLI cannot see, update or remove. Offer two choices: a managed reinstall through `npx skills@latest add` in this scope (recommended, so future upgrades and discovery notices reach it), or keeping the clone untouched and invisible to the CLI, flagged again by every upgrade. The user chooses; wait for that choice. Never delete the clone or install a second copy unasked.
3. **Classify.** Once the install is managed, sort every installed name and directory slug against Deprecations and Current catalog:
   - stale: a deprecated name or slug.
   - missing: a current name that is not installed, after resolving rename chains. An installed replacement counts as present, so only its stale name is retired and the replacement is not added again.
   - present: current, installed and not deprecated.
   - unknown: in neither section; left untouched.
4. **Print the plan** before any change, in this order: the scope (global, project or exact agent); retire (the stale names); add (new to you) (every missing name in full, replacements for retired names included); refresh (the present names); untouched (the unknown names); wire discovery notice (the agents step 11 would wire, or none if declined); execution order: add, refresh, verify, retire, where retirement may land in a later session.
5. **Confirm.** Get explicit confirmation before any removal, install, update or hook wiring. Recommend the full catalog and the discovery wiring. The user decides: approve, decline the whole run, decline individual catalog skills (which then stay out of the add group), or decline only the wiring. Nothing mutates before approval.
6. **Run only the commands the plan named**, with step 1's scope flags:
   1. Add the add group: `npx skills@latest add LilMGenius/paperthin <scope-flags> -s <missing...> --yes`, each catalog name with its own `-s`.
   2. Refresh the refresh group after the integrity gate (step 7): `npx skills@latest update <scope-flags> <present...> --yes`.
   3. Verify "new works" for each replacement, newly added or already present, in the same scope. It is listed; its own directory holds `SKILL.md` with the right frontmatter name and Goal, Workflow, Rules and Verification sections; no add or update failure remains for it. Apply the host reload instructions in step 10, observe the host resolve the new name, then invoke the replacement explicitly on one input its Workflow handles and confirm it runs to its own Verification. Availability plus that run close "new works". Files on disk alone do not, and the check proves neither spontaneous triggering nor effectiveness. If a reload or fresh session is unavailable, report the migration pending and keep the stale name. Before the session ends, record in the handoff the scope, the stale and replacement pair, and the resume step: reload as in step 10, verify availability and the explicit run, then retire.
   4. Retire only stale names whose replacement closed "new works", after checking the stale file's integrity (step 7): `npx skills@latest remove <scope-flags> <stale...> --yes`.
7. **Pass the integrity gate** before any remove, update or reinstall. Compare the installed file with the published revisions of the independently pinned upstream LilMGenius/paperthin.
   - `.skill-lock.json` gives lookup hints, never authority, and no release version. Validate its source and source URL against that upstream, and its skill path as `skills/<perspective>/<slug>/SKILL.md` with the checked slug, a catalog perspective (breadth, depth, coil, mesh), and no traversal or absolute component.
   - Enumerate the published release tags that contain that path, from its introduction through its retirement, or the latest published release if the skill is still current, and fetch each from `https://raw.githubusercontent.com/LilMGenius/paperthin/<tag>/<validated-path>` until one matches. The walk is complete only when every tag in that range was fetched and compared. Timestamps may order the candidates, never exclude them.
   - A match is clean. A full walk with no match is divergent-or-unknown. A missing entry, unexpected source, invalid path, failed fetch or incomplete walk is cannot-compare, never clean. Never infer integrity from the lock's folder hash.
   - For either non-clean result, report that name stopped and preserve it. Offer a scoped merge of the local difference onto the released content, show the result before writing it, and write only with the user's explicit authorization for that skill.
8. **Handle failures.** If add or update reports a failed skill, retry that skill alone with the same scope flags; any mutation of an installed file still passes the integrity gate. If it fails again, get the user's confirmation by skill name, then remove and reinstall that same name with the same `remove` and `add -s` forms, behind the integrity gate; divergent-or-unknown or cannot-compare content needs the user's explicit authorization for that skill. If the reinstall fails, report the skill absent. A replacement that fails to reach "new works" cancels its paired retirement: report the migration stopped with the cancellation reason, keep the stale name, and never retry the failure as a retirement. An outstanding host reload is pending, not a failed replacement.
9. **Verify** with the scoped list and the installed directory slugs:
   - every executed retirement closed "new works" first, in the same scope;
   - every pending migration lists its retained stale name, its reason and its reload or resume step;
   - every stopped migration lists its retained name and reason, cancelled retirements included;
   - a retained stale name passes only when it is reported pending or stopped;
   - every Current catalog skill the user did not decline is installed, unknown names are untouched, and any skill that took the retry or fallback path is actually present.

   Report any failure as incomplete, never as a successful upgrade.
10. **Explain pickup.** Claude Code applies changed `SKILL.md` content automatically in this session; run `/reload-skills` in any other running Claude Code session that shares the install. Codex has no in-session reload: restart it, or `codex resume`. For other agents, restart if the new behavior does not appear.
11. **Wire the discovery notice** after successful verification, for the agents present, unless the user declined it. Back up each config before editing it.
    - Fetch `catalog.cjs` and `session-check.cjs`, plus `opencode-discovery.js` only for OpenCode, into `~/.re0/` from `https://raw.githubusercontent.com/LilMGenius/paperthin/v<installed-version>/scripts/runtime/<file>`, using the installed release tag, never main.
    - Claude Code (`~/.claude/settings.json`) and Codex (`~/.codex/config.toml`): add a SessionStart command for `~/.re0/session-check.cjs` only if none already runs `session-check.cjs` by any path. Pre-rename wiring keeps its own runtime, and a duplicate would fire twice.
    - OpenCode (`opencode.json`/`opencode.jsonc`): add `~/.re0/opencode-discovery.js` to `plugin` only if no `opencode-discovery.js` entry exists by any path.
    - Skip Copilot CLI (it ignores session-start hook output), Antigravity CLI (it has no session-start event) and Grok Build (its hook format is unverified); wire only the three supported agents.
    - Never delete or overwrite another tool's hook; report conflicts and leave them. Report what was wired, which files changed, and how to unwire.
12. **Offer the star**, after successful verification and after reporting the upgrade and discovery outcomes. Ask once through the host's structured user-question tool: "Star LilMGenius/paperthin on GitHub using your authenticated gh account?" with the options "Star repository" then "Skip", and explain that starring is optional and skipping leaves the upgrade unchanged.
    - Wait until a choice is submitted, yielding to the host's input flow and resuming on its answer. Only a submitted "Star repository" authorizes the star; preselection, silence, upgrade approval and the install's `--yes` never do.
    - Skip if the tool is unavailable, the run is unattended, or the outcome is anything else (skip, cancel, session closed, timeout, free text). Never repeat the question, substitute a chat message, parse assent, or use another input method.
    - After approval, run `gh auth status --hostname github.com`. If gh is missing or auth fails, skip, and offer `gh auth login --hostname github.com` and the star command for the user to run. Never log in, read tokens or switch API clients. On decline, offer neither command nor a login nudge.
    - With approval and working auth, run `gh api --hostname github.com -X PUT user/starred/LilMGenius/paperthin --silent` once; `--silent` hides only the response body. On success report "star is set", never "newly added"; report failures separately. Report the star outcome on its own, after the upgrade report and apart from upgrade success. Star outcomes never block or undo the upgrade or the notice wiring.

## Rules

- User-invoked on purpose: it reinstalls skill entries and writes a session-start hook into each agent's config, so only the human runs it.
- The flat `npx skills@latest add` path installs this command as `/re0-upgrade`; never describe a paperthin ppt namespace as part of the primary install path.
- Act only on names in Deprecations and Current catalog. Unknown installed names stay untouched; converge to the paperthin catalog only.
- A deprecated directory slug is stale even if its `SKILL.md` frontmatter name already says the replacement; remove it by the deprecated slug with `skills remove`.
- If the installed list cannot be parsed confidently, stop and report the ambiguity.
- Use no raw filesystem deletion command as a workflow command; retire named stale skills with `skills remove` after confirmation.
- Never remove a stale name whose replacement has not closed "new works" in the same scope.
- Never remove, update or reinstall a skill whose content diverges from its release or cannot be compared without the user's explicit authorization for that skill.
- Never run `skills add --all` or a bare `skills add LilMGenius/paperthin`. Give each name its own `-s`, so the Current catalog defines the install rather than the broader meaning of `--all`.
- Never run a bare `skills update`; pass only the present paperthin names from the plan.
- `gh repo star` is not a real gh subcommand; star only through the consent-gated REST command in step 12.
- Call no other skill through the Skill tool. Invoking a replacement explicitly in step 6 is a check, not a delegation.
- The user decides at five stops: the shadow-install choice (step 2), the plan before any mutation (step 5), per-skill authorization for a non-clean integrity result or a merge (steps 7 and 8), per-name confirmation before a remove-and-reinstall fallback (step 8), and the star through the structured tool (step 12).

## Verification

With nothing stale, missing or failed, the plan shows only the refresh and untouched groups and the run still verifies. A declined run changes nothing. Before reporting, confirm:

1. The executed plan is reprinted: retired, added (new to you), refreshed, untouched.
2. The final list and slugs carry no stale name except those reported pending or stopped, each with its reason and, for pending, its resume step. Every Current catalog skill the user did not decline is installed, and any skill that took the retry or fallback path is present and current.
3. The confirmation gate held: nothing was removed, added or updated before the plan, with the add (new to you) group visible, was shown and approved.
4. Discovery wiring, if accepted, is present once per configured agent, backed up, version-pinned, and touched no foreign hook; or it was correctly skipped, because the user declined or the agent is absent.
5. The star ran only on a submitted positive choice from the structured tool, or was skipped, and its outcome is reported apart from upgrade success.
6. Any skipped step, failed command or unresolved ambiguity is reported.
