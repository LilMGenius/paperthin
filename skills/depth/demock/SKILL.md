---
name: demock
description: "Find the mocks, stubs, fakes, hidden fallbacks and placeholder implementations standing on a real code path outside the tests, where nothing real runs and a success report is false, and propose the real dependency or an honest failure for each. Use when a change or a named file, directory or diff may ship a test double or a swallowed error into production, when a catch or except returns an empty list, None, a default or true, when a guard lets a request through because its key, config or input is missing, when a function raises NotImplementedError or returns a TODO value on a live path, when a feature reports success but nothing seems to happen, or before calling work done that touched error handling, integrations or service clients."
---

Find candidates for a test double, a swallowed failure or a placeholder on the real code path with the bundled script, read each one, and propose the real dependency or an honest failure before anything is fixed.

## Goal

A real code path runs what it claims to run: a success means the work happened, and a failure surfaces with its cause. The scope is what the human named: files, directories, a diff, or the change just made. The run never picks its own target.

The run reports each finding with its location, the evidence that it is reached from the real path, its class and its proposal; then, for each item the human approved, the test that failed first and the fix. A run whose scope holds no finding changes nothing and says so.

## Workflow

1. **Split real paths from test paths first.** Read the repository's test convention from its test directories, file naming rules and test configuration. A real path is code reached from an entry point (build output, an export, a handler, a CLI): trace it through imports and calls, including what dependency injection or a registry wires in. Code nothing reaches is dead, not a finding here; report it for a cleanup pass.
2. **List candidates.** From this skill's folder run `node scripts/scan.mjs <paths...> [--test-glob <glob>]... [--json]` over the scope, adding a `--test-glob` for each test path the repository's convention names beyond the defaults. It prints each candidate outside the test paths with its file, line, kind and evidence text; `--json` prints one JSON object. Exit codes: 0 no candidate, 3 candidates, 2 a usage error. An exit of 2 is a broken run: fix the command and run again. A name match is a lead, never a verdict.
3. **Add the repository's own linter rules.** When the repository already uses a linter carrying swallowed-failure rules (ruff BLE, S110 and S112, ESLint no-empty, Go errcheck), run those rules through the repository's own scripts or locally installed binaries at the version it declares, and add their hits to the candidates. Install no new tool.
4. **Read and classify each candidate.** Class (a) is a test double on the real path. Class (b) is a false success: a catch that turns a failure into a success, logged or not, a fallback whose caller cannot tell it from the real result, or a gate on access, spending, deletion or a counted signal that lets the request through when the secret, dependency or input it checks is missing. Class (c) is a placeholder: an unfinished implementation the real path reaches. Class (d) is intended: a seam where the real implementation is chosen at runtime, a degradation the caller can see (a typed empty result, a flag, a documented status) and is designed to handle, an offline mode documented and off by default on the real path, or code a production build excludes. Keep (d) with its evidence. When reaching the real path cannot be confirmed, give the candidate its class and proposal and mark it unverified.
5. **Propose a fix for each (a), (b) and (c)**: the real dependency that should run, or an honest failure that surfaces the cause; for a gate that lets requests through, the honest failure is a denial. Never propose swapping one fake for another.
6. **Stop and report.** Report the findings and their proposals, including any pattern the script missed, and end the run. The human approves by naming the items to fix; nothing else changes.
7. **Fix one approved item at a time.** First write a test that fails on the fake, proving the real path runs or the failure surfaces; then fix the item and rerun the repository's checks.

## Rules

- The scope is what the human named. Never widen it or choose a target on your own.
- The script owns the candidate patterns and the default test conventions; a pattern it missed is proposed as a script change with a test, under the same approval as a fix.
- Test doubles inside tests are left alone.
- A log followed by a rethrow at a boundary is an honest failure and stays.
- A fix replaces a fake with the real dependency or an honest failure, never with another fake.
- Nothing is fixed without the human's approval, and each fix has a test that failed first.
- A run with no finding changes nothing.
- Vocabulary for the doubles follows Gerard Meszaros's test double taxonomy (dummy, stub, spy, mock, fake) and Martin Fowler's "Mocks Aren't Stubs".

## Verification

Before finishing, confirm:

1. Every finding has its location, the evidence that it reaches the real path or its unverified mark, its class and its proposal.
2. No file was changed without the human's approval.
3. Every applied fix has a test that failed first.
4. When the script changed, its tests call the CLI through a junction or symlink to the skill folder and pass.
