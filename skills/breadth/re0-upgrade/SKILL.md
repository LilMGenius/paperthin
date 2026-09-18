---
name: re0-upgrade
description: "Bring your installed paperthin skills up to the full current catalog in one step: retire what's been renamed, add every skill you don't have yet, and refresh the rest, all shown and confirmed before anything changes."
disable-model-invocation: true
---

Upgrade an install to the full current paperthin catalog: retire renamed skills, add missing skills, and refresh the rest after confirmation.

## Goal

Upgrade the chosen scope to the **full current catalog**, including skills outside the original install. Show the reconciliation plan and name every new-to-user skill before confirmation; users who prefer a narrower install can decline.

## Deprecations

This table owns renames in release order. Append future renames here and resolve chains to their final current names. The `ssot-check` row is user-confirmed pre-v0.2.0 history, unverifiable in git after a force-push; do not invent its date or tag.

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
| `readchk` | `readback` | <version being tagged> |
| `reorder` | `re0-order` | <version being tagged> |

## Current catalog

Install every skill below in the chosen scope, except those declined at confirmation. Use this roster to distinguish current from unknown names in `npx skills list` and installed directories.

`re0`, `readback`, `aim`, `modelchk`, `hate`, `macrothink`, `feynman`, `autobahn`, `re0-style`, `re0-order`, `detool`, `dedash`, `debloat`, `shower`, `factchk`, `mandela`, `sip`, `re0-git`, `re0-release`, `re0-merge`, `ssotize`, `ssotize-local`, `re0-upgrade`, `re0-plan`, `re0-tutorial`, `re0-loop`, `re0-watch`, `re0-memo`, `re0-work`, `catchup`, `nba`, `re0-workflow`, `prism`

## Workflow

1. Choose one install scope for the whole run; ask if unspecified. Scope determines which install location is read.
   - **Global**: `npx skills list --global`, inspect `~/.agents/skills/<skill>/SKILL.md`, and pass `--global` to every `remove`, `add`, and `update`.
   - **Project**: `npx skills list` from that project, inspect its installed skill directory if present, and omit `--global`.
   - **Exact agent**: use explicit slugs such as `--agent claude-code`, never `--agent '*'`, including removals. Without agent scoping, use global or project scope.
2. **Check for a shadow install before classifying.** If paperthin is loaded but the chosen scope's list reports zero paperthin skills, do not conclude the whole catalog is missing. Check for any Current-catalog directory in that scope's managed footprint (`~/.agents/skills/` globally, e.g. `~/.agents/skills/re0`).
   - **Directory present**: re-check scope and retry the list (`npx skills list --global` globally). If it still contradicts the footprint, report the CLI failure and stop; a flaky read is not an empty install.
   - **Directory absent, paperthin loaded**: report a **shadow install**, commonly a clone loaded as a Claude Code plugin (`/paperthin:<skill>`). The CLI cannot see, update, or remove it. Offer a managed reinstall via `npx skills add` in the chosen scope (recommended for future upgrades and discovery notices), or keep the clone untouched and CLI-invisible, with each upgrade re-flagging it. Await the user's choice; never delete the clone or install a second copy on your own.

   Once managed, classify both installed names and directory slugs against Deprecations and Current catalog:
   - **stale**: a deprecated name or slug;
   - **missing**: a current name not installed after resolving rename chains; an installed replacement counts as present, so retire only the stale name without adding the replacement again;
   - **present**: current, installed, non-deprecated names;
   - **unknown**: neither current nor deprecated; leave untouched.
3. Print the reconciliation plan before changes: scope first (global / project / exact agent), then:
   - **retire**: stale names;
   - **add (new to you)**: missing catalog names in full, including replacements for retired names;
   - **refresh**: present names;
   - **untouched**: unknown names;
   - **wire discovery notice**: present agents to wire in step 9, or `none` if declined.
   - **execution order**: add, refresh, verify, retire; retirement may land in a later session.
4. Get explicit confirmation before removal, installation, update, or hook wiring. Recommend the full catalog and discovery wiring; the user may approve the plan, decline the whole run, or decline only wiring. Nothing mutates before approval.
5. After confirmation, run only the commands the plan named, with the scope flags chosen in step 1:
   - `npx skills add LilMGenius/paperthin <scope-flags> -s <missing...> --yes` for the add group, enumerating each catalog name with its own `-s`;
   - `npx skills update <scope-flags> <present...> --yes` for the refresh group, after the integrity check below;
   - **verify "new works"** for each replacement, newly added or already present, in the same scope. Confirm it is listed, its own directory contains `SKILL.md` with the correct frontmatter name and Goal, Workflow, Rules, and Verification sections, and no add/update failure remains. Apply step 8's host reload instructions, observe that the host resolves the new name, then invoke it explicitly on two fixtures: an instruction whose referent the available context resolves must pass silently; one carrying a genuine fork must surface exactly one question. Availability and both fixture results close "new works". Files on disk alone do not, and the check does not establish spontaneous triggering or effectiveness. If a reload or fresh session is unavailable, report **pending** and retain the stale name. Before ending the session, record the scope, stale/replacement pair, and resume step in the handoff: reload as in step 8, verify availability and both fixtures, then retire;
   - `npx skills remove <scope-flags> <stale...> --yes` only for stale names whose replacement has closed "new works", after checking the stale file's integrity.

   Before any remove, update, or reinstall, compare the installed file with published revisions of the independently pinned upstream `LilMGenius/paperthin`. Treat `.skill-lock.json` as lookup hints, not authority: it supplies no release version. Validate its source and source URL against that upstream and its skill path as `skills/<perspective>/<slug>/SKILL.md`, with the checked slug, a catalog perspective (breadth, depth, coil, or mesh), and no traversal or absolute component. Enumerate published release tags containing that path from introduction through retirement, or the latest published release if still current, and compare the file fetched from `https://raw.githubusercontent.com/LilMGenius/paperthin/<tag>/<validated-path>` until a match; timestamps may order candidates, never exclude them. A match is clean; a complete walk with no match is divergent-or-unknown; a missing entry, unexpected source, invalid path, failed fetch, or incomplete walk is cannot-compare, never clean. For either non-clean result, report **stopped** for that name, preserve it, and offer a scoped merge of the local difference onto released content, showing the result before writing and requiring explicit per-skill authorization. Do not infer integrity from the lock's folder hash.
6. If `npx skills add` or `npx skills update` reports a failed skill, retry that skill alone with the same scope flags; any mutation of an installed file still requires the integrity gate. If it fails again, obtain confirmation by skill name, then remove and reinstall that same name using the same `skills remove`/`skills add -s` forms, behind step 5's integrity check; divergent-or-unknown or cannot-compare content needs explicit per-skill authorization. If reinstall fails, report the skill absent. A replacement that fails to reach "new works" cancels its paired retirement: report the migration as **stopped** with the cancellation reason, keep the stale name, and never retry the failure as a retirement. An outstanding host reload is **pending**, not a failed replacement.
7. Verify with `npx skills list <scope-flags>` and inspect the installed directory slugs: every executed retirement closed "new works" first in the same scope, every **pending** migration lists its retained stale name, reason, and reload/resume step, and every **stopped** migration lists its retained name and reason, including cancelled retirements. A retained stale name passes this check only when reported as pending or stopped. Check that every Current catalog skill is installed, unknown names were left untouched, and any skill that took the retry/fallback path is actually present; report failures as incomplete, never as a successful upgrade.
8. Explain how to pick up the update: Claude Code applies changed `SKILL.md` content automatically in this session; run `/reload-skills` in any other running Claude Code session sharing the install. Codex has no in-session reload: restart it (or `codex resume`). For other agents, restart if the new behavior does not appear.
9. After successful upgrade verification, wire the session-start discovery notice for present agents unless declined. Back up each config before editing.
   - Fetch `catalog.cjs` and `session-check.cjs`, plus `opencode-discovery.js` only for OpenCode, into `~/.re0/` from `https://raw.githubusercontent.com/LilMGenius/paperthin/v<installed-version>/scripts/runtime/<file>`. Use the **pinned installed release tag**, never `main`.
   - **Claude Code** (`~/.claude/settings.json`) and **Codex** (`~/.codex/config.toml`): add a `SessionStart` command for `~/.re0/session-check.cjs` only if none already runs `session-check.cjs` by **any** path. Keep pre-rename wiring on its own runtime; a duplicate would double-fire.
   - **OpenCode** (`opencode.json`/`opencode.jsonc`): add `~/.re0/opencode-discovery.js` to `plugin` only if no `opencode-discovery.js` entry exists by **any** path.
   - Skip Copilot CLI (ignores session-start hook output), Antigravity CLI (no session-start event), and Grok Build (unverified hook format). Wire only the three supported agents.
   - Never delete or overwrite another tool's hook. Report conflicts and leave them untouched. Report what was wired, which files changed, and how to unwire.
10. **Optional GitHub star.** After successful upgrade verification and reporting upgrade/discovery outcomes, use the host's structured user-question tool once: "Star LilMGenius/paperthin on GitHub using your authenticated gh account?" Offer "Star repository", then "Skip"; explain that starring is optional and skipping leaves the upgrade unchanged.
   - Suspend until a choice is submitted. While the question is pending, yield to the host's input flow and resume on its answer. Only a submitted "Star repository" authorizes the action, never preselection, silence, upgrade approval, or install `--yes`.
   - Skip if the tool is unavailable, the run is unattended, or the outcome is anything other than that choice (including skip, cancellation, session closure, timeout, or free text). No repeated question, chat substitute, assent parsing, or alternate input method.
   - After approval, check `gh auth status --hostname github.com`. If `gh` is missing or auth fails, skip and offer `gh auth login --hostname github.com` and the star command for the user to run. Never log in, read tokens, or switch API clients. On decline, offer neither command nor login nudge.
   - With approval and working auth, run `gh api --hostname github.com -X PUT user/starred/LilMGenius/paperthin --silent` once. `--silent` hides only the response body. On command success, report "star is set", not "newly added"; report failures separately. Star outcomes never block or undo the upgrade or gate notice wiring.

## Rules

- The flat `npx skills add` path installs this command as `/re0-upgrade`; never describe a paperthin `ppt` namespace as part of the primary install path.
- Only act on names from the Deprecations checklist and the Current catalog; unknown installed names stay untouched. Convergence is to the paperthin catalog only.
- Treat a deprecated directory slug as stale even when its `SKILL.md` frontmatter `name` already says the replacement name; remove it by the deprecated slug with `skills remove`.
- If the installed-skill list cannot be parsed confidently, stop and report the ambiguity instead of guessing.
- Do not use raw filesystem deletion commands as workflow commands. Use `skills remove` for named stale skills after confirmation.
- Never remove a stale name whose replacement has not closed "new works" in the same scope.
- Never remove, update, or reinstall a skill whose content diverges from its released version or cannot be compared without explicit per-skill authorization.
- Never use `skills add --all` or a bare `skills add LilMGenius/paperthin`; enumerate each catalog name with its own `-s <name>`, so the install is defined by this skill's Current catalog rather than by `--all`'s broader semantics.
- Do not run a bare `skills update`; pass only the present paperthin skill names from the reported plan.
- `gh repo star` is not a real `gh` subcommand; use the consent-gated REST command in Workflow step 10.

## Verification

Before finishing:

1. Reprint the executed plan: retired names, added (new-to-you) names, refreshed names, and untouched names.
2. The final installed list and directory slugs carry no stale name except those reported as pending or stopped, each with its reason and, for pending, its resume step. Every Current catalog skill is installed, and any skill that took step 6's retry/fallback path is present and current.
3. The confirmation gate held: nothing was removed, added, or updated before the plan was shown and approved, with the `add (new to you)` group visible in it.
4. Discovery-notice wiring, if the user accepted it, is present once per configured agent, backed up, version-pinned, and touched no foreign hook, or was correctly skipped because it was declined or the agent was absent.
5. The optional star ran only on a submitted positive choice from the structured question tool, or was skipped; report its outcome separately from upgrade success.
6. Report any skipped step, failed command, or unresolved ambiguity.
