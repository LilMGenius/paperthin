---
name: ppt-upgrade
description: "Upgrade a paperthin install after renames by retiring deprecated skills, adding their replacements selectively, and refreshing already-installed skills."
disable-model-invocation: true
---

Reconcile an installed paperthin skill set with the current catalog without adding skills the user never chose.

## Goal

Keep a returning user's installed paperthin skills current after release renames. The upgrade retires stale local names, adds only the matching replacement for each stale name the user already had, and refreshes the installed current skills.

The flat `npx skills add` path installs this command as `/ppt-upgrade`; do not describe a paperthin `ppt` namespace as part of the primary install path.

## Deprecations

This ordered checklist is the rename SSOT. Append future renames here in release order.

The `ssot-check` row is user-confirmed from pre-v0.2.0 history that current git history cannot verify after a force-push; do not invent a date or tag for it.

| Deprecated | Renamed to | Since |
| --- | --- | --- |
| `ssot-check` | `ssotchk` | pre-v0.2.0 history (force-pushed; user-confirmed) |
| `tasting` | `sip` | 0.6.0 |
| `redteam` | `hate` | 0.7.0 |
| `scratch` | `re0-work` | 0.8.2 |

## Workflow

1. Read the installed skill names for the user-selected scope with `npx skills list`.
2. Cross-reference the installed names against the deprecations checklist:
   - stale names are installed entries in the `Deprecated` column;
   - replacement names are their `Renamed to` values;
   - current names are installed paperthin skills that are not deprecated;
   - unknown installed names stay untouched.
3. Report the full install reconciliation plan before changing anything:
   - retire: `<stale names>`;
   - add replacements: `<renamed-to names>` only when their stale source was installed and the replacement is not already installed;
   - update: `<current installed paperthin names>`;
   - untouched: unknown names and paperthin skills the user never installed.
4. Ask for explicit confirmation before any removal or install reconciliation command.
5. After confirmation, run only the selective commands needed for the reported plan:
   - `npx skills remove <stale...>` for deprecated names the user confirmed retiring;
   - `npx skills add LilMGenius/paperthin -s <renamed-to...>` for replacement names derived from installed deprecated names;
   - `npx skills update <current-installed-paperthin...> <renamed-to...>` to refresh only already-installed current skills and replacements in the reported plan.
6. Verify with `npx skills list`: no deprecated name remains, each expected replacement is present, current installed skills remain present, and no untouched skill was added.
7. Optional post-upgrade GitHub star: after successful verification, ask the default-yes consent prompt `Star this repo now? [Y/n]`. If the user answers `Y`, `y`, or presses Enter, run `gh repo star LilMGenius/paperthin`; if the user answers `n` or `N`, skip the star step and report that it was skipped. If `gh` is missing or unauthenticated, print the command and the `gh auth login` hint instead of using any token or API fallback.

## Rules

- Never use `skills add --all`.
- Never use a bare add LilMGenius/paperthin command; always include `-s <skill>` for replacement installs.
- Never run a bare `skills add LilMGenius/paperthin` as part of this workflow.
- Do not use raw filesystem deletion commands as workflow commands. Use `skills remove` for named stale skills after confirmation.
- Do not install the full catalog to "make sure" the user is current. Respect their previous subset.
- Do not run a bare `skills update`; pass only the paperthin skill names from the reported plan.
- Only act on names from the deprecations checklist and paperthin catalog entries. Leave unknown installed names untouched.
- If a replacement is already installed, do not add it again; retire the stale name and include the replacement in verification.
- If the installed-skill list cannot be parsed confidently, stop and report the ambiguity instead of guessing.

## Verification

Before finishing:

1. Reprint the executed plan with stale names, replacements, updated current names, and untouched names.
2. Confirm the final installed list has no name from the `Deprecated` column.
3. Confirm every replacement for an installed stale name is present.
4. Confirm no paperthin skill outside the user's previous installed subset plus required replacements was added.
5. Report any skipped step, failed command, or unresolved ambiguity.
