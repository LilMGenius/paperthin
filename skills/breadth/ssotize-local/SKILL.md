---
name: ssotize-local
description: "Consolidate duplicate files or directories into one truth after approval, with the result an identity managed by this machine's filesystem: hardlink, symlink, junction, or bind mount. Use when consumers need the same bytes at several paths and textual references cannot serve them; audit first, probe capabilities, then link only while the approved equality still holds."
---

Make filesystem names share one truth with approval, identity proof and verified reversal.

## Goal

Establish or repair one canonical home for duplicated files or trees without losing bytes or their preservation contract. The -local suffix means identity managed by this machine's filesystem; portability depends on the mechanism. No sibling skill is needed. No scatter means no change, and a stop is a valid outcome.

## Workflow

1. **Scope.** Name the canonical and its reason, the candidates, consumers, aliases and trust boundaries. Inventory hidden, empty and unique entries and nested links, cross-checked by a second listing, resolving link targets explicitly; a shared directory must include every member its consumers need.
2. **Probe, never assume.** Run the script beside this file, `node scripts/identity.mjs probe <path>...`, on candidates and destination parents, recording command, exit, output and time. It reports path, link state and target, identity and link count, size, mtime, mount root where derivable, and link capabilities probed in a temp directory, the only write an audit makes. Probe destination permission, locality, filesystem and mount privilege separately and resolve ancestor links and mounts; a label proves nothing and unknown stays unproven.

Ask the human: "Can every concurrent writer be excluded for the whole mutation and verification interval by a maintenance window or a lock every writer honors?" Only an explicit yes establishes exclusive access; record it, since a handle listing is a snapshot, not a lock. On no, or no answer, report "Exclusive access unproven for <path>; no mutation" and stop; never kill unrelated processes.

3. **Audit read-only.** `digest <path>...` gives path, mtime, size, sha256 and identity through every name, sorted relative members and a manifest hash; `compare <a> <b>` classifies bytes and identity; every subcommand accepts `--json`. Inspect ACLs, owner and mode, named streams, xattrs and timestamps separately, marking which timestamps must be retained and reporting deltas from reads or identity changes. A missing tool, denied read or unsupported field leaves the contract unproven; the script proves main bytes and members only.

| Classification | Required decision |
|---|---|
| Identical bytes and contract | Approved linking eligible; no backup. |
| Identical bytes, differing or unreadable contract | Unproven: name the deltas and stop, or resolve preservation explicitly; a backup proves no equality. |
| Divergent bytes | Report the diff and stop for a human choice or requested merge; never newest or largest wins. |
| Present in one place | Fold the unique detail into the canonical under its own approval, then re-audit. |
| Already linked to the intended canonical | Identity-proven no-op: report and re-verify, never relink. |

Report per path the canonical, rung, displaced names, preservation locations, proof and reverse actions, contradictions and unique details; re-audit an approved fold. Compare exits 0 for equality or identity, 3 for divergence or unique members, 1 for errors.

4. **Approval stop.** Ask explicit approval of the plan, worded **"link if still identical at the mutation step"**; without it, stop after the read-only report. This approves neither an unresolved conflict nor a later change.
5. **Re-check before the first write.** Immediately before any target write, backup and reconciliation included, re-enumerate the candidates and re-read **path, mtime, size, and sha256**, contract, identity and exclusion evidence against the approved audit, per item; any added, missing, unreadable, replaced or changed candidate stops the write, naming the file and delta, and the audit and approval are renewed. The script snapshots staging and displacement, never approval or writer exclusion; hashing narrows a race without eliminating it. Proven byte-and-contract equality skips backup; an unproven candidate needs verified independent preservation, contract included, first, and inability to preserve stops.
6. **Execute the ladder.** After the gates, `link <canonical> <alias> --mechanism hardlink|symlink|junction [--staged <absent-sibling>]` stages and proves a sibling link, re-checks the snapshots, moves an identical existing entry aside intact, then installs. Never overwrite an uninspected path or recursively delete a tree; preserve originals and stages on failure.

| Rung | Preconditions and action |
|---|---|
| File hardlink | Regular file on the same supported local volume with parent permission; probe, then `link --mechanism hardlink`. |
| Directory hardlink | Unsupported on every mainstream system; never attempt. |
| Symlink | First choice for a directory, fallback for a file, where link creation and parent permission were probed; `link --mechanism symlink`. |
| Junction | Windows directory fallback: writable parent, absolute local target, no network target, no same-volume rule; `link --mechanism junction`. |
| Bind mount | Linux, explicit human choice, probed privilege, approved empty mount point, its own persistence plan; outside the script and never a silent fallback. |
| Copy | Only by explicit consent; reported as "no longer SSOT", never as a link. |

Sources, not local measurements: [hard links and junctions](https://learn.microsoft.com/en-us/windows/win32/fileio/hard-links-and-junctions), [Linux link(2)](https://man7.org/linux/man-pages/man2/link.2.html), [macOS link(2)](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/link.2.html). Documentation never closes a probe.

7. **Re-verify read-only.** After every mutation run `verify <canonical> <alias>...` against the approved manifest and contract: a hardlink needs equal dev:ino (or volume and file ID) and an nlink covering the set, a symlink or junction must resolve to the canonical, and every member hashes equal through every name; equal bytes alone never prove identity, a bind mount needs its own mount, source and identity proof, and unknown stops. Never write a sentinel to a live target; a write test belongs to an authorized disposable fixture.
8. **Keep the failure register.** Seven classes, each with its evidence class and its re-verify action, and none a substitute for the current run: a replacing save severs a hardlink while an in-place save preserves it (sourced, unmeasured; `verify` the whole set after saving); a checkout or stash may write a replacement file (sourced; `verify` after any rewrite, external aliases included); a restore without link preservation expands the set (sourced; `verify` after the round-trip, never inferred from options); a cloud-sync service may reject links or materialize copies (sourced; probe it and `verify` on each host, unknown stops); an edit after the audit invalidates equality (historical; step 5 names the delta and stops); equal bytes can hide different ACLs, streams or xattrs (proposed; repeat the contract proof, unproven stays stopped); a writer can act after the final hash (proposed; stop without the exclusion answer, never claim the race eliminated).
9. **Reverse by mechanism.** With approval, step 2 repeated and the removal probed on disposable data, `unlink <alias> --stage <dir>` stages and hashes an independent copy on the alias volume, proves its independence, removes only the entry (unlink for a hardlink or symlink, [nonrecursive removal](https://learn.microsoft.com/en-us/dotnet/api/system.io.directory.delete) for a junction) and restores the copy under the alias name, proven. Verify the staged contract first (copied bytes do not certify ACLs, streams or xattrs), never delete through a link, and prove the canonical members, hashes, contracts and unselected links intact; a link count fits the intended aliases, not always one. A bind mount needs an explicit unmount (busy stops; never force or lazy), exact-mount absence, an unchanged source and a distinct revealed mount-point identity; never stage into or remove a mount point, and an unmount creates no copy. Preserve receipts and originals on partial failure; unverifiable stays unfinished.

## Rules

- Audit read-only, preserve unique details, resolve contradictions and obtain approval; report what stayed read-only and what needs a human decision. An empty finding is valid.
- Confirm any private or public and internal or customer-facing boundary: a link exposes shared changes and permissions to every consumer.
- Edit-safety: assert each target exists and report a MISS, edit unicode-safe, act per occurrence rather than by blanket sweep, and script structural moves.
- Never follow a link to delete its target or recursively delete at an alias; preserve originals on partial failure.
- Portability is per mechanism: a hardlink carries no identity in a Git clone; a relative symlink travels where the layout is reproduced, and core.symlinks=false writes its target text as a file, so inspect the [repository setting](https://git-scm.com/docs/git-config#Documentation/git-config.txt-coresymlinks) and `verify` on the destination; an absolute symlink needs the same target path; a junction is Windows-only, local and absolute; a bind mount needs host administration and approved persistence; a copy is no longer SSOT.
- Prefer a directory link when consumers must see additions, deletions and replacements; re-verify a file hardlink after replacement. Never promise permanent linkage.

## Verification

Confirm the probed rungs, the exclusion answer and approval, the pre-write deltas, preservation, identity, hash and contract proof through every name, the seven failure classes and the staged reversal; unknown stays unfinished. A receipt carries command, exit, time, before and after identity, preservation location and unresolved fields. Every gate and null outcome works without sibling skills.
