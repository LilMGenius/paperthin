---
name: ssotize-local
description: "Consolidate duplicate files or directories into one canonical home after approval, held as an identity by this machine's filesystem: hardlink, symlink, junction, or bind mount, with bytes, ACLs, owner and mode, named streams, xattrs and kept timestamps preserved. Use when consumers need the same bytes at several paths and textual references cannot serve them, when asked to hardlink, symlink, junction or bind-mount duplicate copies, or to dedupe identical files or trees on disk without breaking their readers."
---

Give duplicated files or trees one canonical home and make every other path a filesystem identity of it, after an audit and an approval.

## Goal

Duplicated files or trees get one canonical home, and every other path its consumers read becomes an identity of it held by this machine's filesystem: a hardlink, symlink, junction or bind mount. Nothing is lost on the way: neither the bytes nor the preservation contract, which covers ACLs, owner and mode, named streams, xattrs and the timestamps that must be kept. Use it when consumers need the same bytes at several paths and textual references cannot serve them.

The `-local` suffix means portability depends on the mechanism; what survives a clone, a copy or another host is stated per mechanism under Rules. A run that finds no scatter changes nothing, and a stop at any gate is a valid outcome.

## Workflow

Every deterministic step runs `node scripts/identity.mjs` from this skill's folder, with the subcommands `probe`, `digest`, `compare`, `link`, `verify` and `unlink`; every subcommand accepts `--json`.

1. **Audit.** Call the Skill tool with "ssotize" on the duplicated files or trees for its read-only audit and plan, with linking proposed for each copy whose consumers need the same bytes. Its result is this run's **inventory**: the occurrence table, the canonical home and its reason, the contradictions, the unique details, and the **approval** gate the plan must pass. Where it stops, this run stops. When ssotize is not installed, say so and stop, because a link made without its audit and approval skips the gates that make it safe.
2. **Extend the inventory for links.** Add what a link needs: every consumer, alias, trust boundary, hidden and empty entry and nested link, with each link target resolved explicitly. A shared directory includes every member its consumers need.
3. **Probe, never assume.** Run `node scripts/identity.mjs probe <path>...` on every candidate and every destination parent, and record the command, exit code, output and time. It reports the path, link state and target, identity and link count, size, mtime, mount root where derivable, and the link capabilities it tested in a temporary directory, which is the only write an audit makes. Probe destination permission, locality, filesystem and mount privilege separately, and resolve every ancestor link and mount. A label proves nothing, and what is unknown stays unproven.
4. **Ask about writers.** The human decides, with this exact question: "Can every concurrent writer be excluded for the whole mutation and verification interval by a maintenance window or a lock every writer honors?" Only an explicit yes counts, and it is recorded. A handle listing is a snapshot, not a lock. On no, or no answer, report "Exclusive access unproven for <path>; no mutation" and stop. Never kill unrelated processes.
5. **Digest and compare, read-only.** `node scripts/identity.mjs digest <path>...` prints path, mtime, size, sha256 and identity through every name, with the sorted relative members and a manifest hash. `node scripts/identity.mjs compare <a> <b>` classifies bytes and identity, and exits 0 for equality or identity, 3 for divergence or unique members, and 1 for errors. Inspect ACLs, owner and mode, named streams, xattrs and timestamps separately, and report any delta that the reads or an identity change caused. The script proves main bytes and members only; a missing tool, a denied read or an unsupported field leaves the contract unproven.
6. **Classify** each candidate against the canonical home, one row per case:

   | Case | Class | Action |
   | --- | --- | --- |
   | Identical bytes and contract | eligible | approved linking, no backup |
   | Identical bytes, contract differing or unreadable | unproven | name the deltas, then stop or resolve preservation explicitly; a backup proves no equality |
   | Divergent bytes | a contradiction the inventory already reports | stop for a human choice or a requested merge; never newest or largest wins |
   | Present in one place only | fold | call the Skill tool with "ssotize" again for it, under its own approval from the human, then re-audit before linking |
   | Already linked to the intended canonical | identity-proven no-op | report and re-verify; never relink |

7. **Report** per path, beside the inventory's occurrence table: the rung chosen, the displaced names, the preservation locations, the proof and the reverse actions. When a fold ran under its own approval, rerun steps 1 to 6 on the result and report from that new inventory; the fold's approval never stands in for step 8.
8. **Approve.** Put the plan to the human at the inventory's approval gate in the exact wording "link if still identical at the mutation step"; only that wording covers the link step. Without it, stop after the read-only report. It covers neither an unresolved conflict nor a later change, and a fold, a merge or a copy each needs its own consent. With the approval the human decides which timestamps must be kept: propose each one from what reads it (a sync or build keyed on mtime, a backup, a ledger), and keep every timestamp until they decide. Every name of a link shows the canonical's timestamps, so a duplicate's timestamp that must be kept goes into the preservation that step 9 verifies.
9. **Re-check before every write.** Immediately before any target write, backup and reconciliation included, re-enumerate the candidates and re-read path, mtime, size and sha256, the contract, the identity and the exclusion evidence against the approved audit, per item. An added, missing, unreadable, replaced or changed candidate stops the write, naming the file and its delta, and the run returns to step 1 for a new audit and to step 8 for a new approval from the human before any write. The script snapshots staging and displacement, never the approval or writer exclusion, and hashing narrows a race without removing it. Proven equality of bytes and contract skips the backup; an unproven candidate first needs verified independent preservation, contract included, and where that is impossible, stop.
10. **Link, one rung per case.** `node scripts/identity.mjs link <canonical> <alias> --mechanism hardlink|symlink|junction [--staged <absent-sibling>]` installs a proven link and keeps any displaced entry intact. Never overwrite an uninspected path or recursively delete a tree; on failure, preserve the originals and the stages. Choose the rung from this ladder:

    | Rung | When | How |
    | --- | --- | --- |
    | File hardlink | a regular file on the same supported local volume, with parent permission | probe, then `link --mechanism hardlink` |
    | Directory hardlink | unsupported on every mainstream system | never attempt |
    | Symlink | first choice for a directory, fallback for a file, where creation and parent permission were probed | `link --mechanism symlink` |
    | Junction | Windows directory fallback: writable parent, absolute local target, no network target; no same-volume rule | `link --mechanism junction` |
    | Bind mount | Linux only, by explicit human choice, with probed privilege, an approved empty mount point and its own persistence plan | outside the script; never a silent fallback |
    | Copy | only by explicit human consent | reported as "no longer SSOT", never as a link |

    These documents state what each mechanism supports; they were not measured on this machine, so a rung still needs its step 3 probe: https://learn.microsoft.com/en-us/windows/win32/fileio/hard-links-and-junctions , https://man7.org/linux/man-pages/man2/link.2.html , https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/link.2.html
11. **Verify, read-only, after every mutation.** Run `node scripts/identity.mjs verify <canonical> <alias>...` against the approved manifest and contract. A hardlink needs equal dev:ino (or volume and file ID) and a link count covering the set; a symlink or junction must resolve to the canonical; every member hashes equal through every name. Equal bytes alone never prove identity. A bind mount needs its own mount, source and identity proof. Unknown stops. Never write a sentinel to a live target; a write test belongs to an authorized disposable fixture.
12. **Reverse by mechanism**, after the human approves the reversal. Repeat the probe, and probe the removal on disposable data. `node scripts/identity.mjs unlink <alias> --stage <dir>`, with `<dir>` an existing folder on the alias's volume outside the linked tree, replaces the link with a proven independent copy under the alias name; it removes only the entry, never the target tree, and a junction is removed nonrecursively (https://learn.microsoft.com/en-us/dotnet/api/system.io.directory.delete ). Verify the staged contract first, since copied bytes do not certify ACLs, streams or xattrs. Never delete through a link. Prove the canonical's members, hashes and contracts and every unselected link intact; a link count fits the intended aliases, which is not always one. A bind mount needs an explicit unmount (busy stops; never force or lazy), the exact mount's absence, an unchanged source and a distinct revealed identity at the mount point; never stage into or remove a mount point, and an unmount creates no copy. On partial failure, preserve the receipts and originals; what cannot be verified stays unfinished.

## Rules

- Never write to a target before the step 1 audit and approval; the probe's temporary directory is not a target. Report what stayed read-only and what needs a human decision; an empty finding is valid.
- Confirm with the human any boundary a link would cross, private to public or internal to customer-facing, because a link exposes shared changes and permissions to every consumer.
- Never follow a link to delete its target, never recursively delete at an alias, and preserve the originals on partial failure.
- Portability is per mechanism. A hardlink carries no identity in a Git clone. A relative symlink travels where the layout is reproduced, and `core.symlinks=false` writes its target text as a file, so inspect the setting (https://git-scm.com/docs/git-config#Documentation/git-config.txt-coresymlinks) and verify on the destination. An absolute symlink needs the same target path. A junction is Windows-only, local and absolute. A bind mount needs host administration and approved persistence. A copy is no longer SSOT.
- Prefer a directory link when consumers must see additions, deletions and replacements; re-verify a file hardlink after any replacement; never promise permanent linkage.
- An already-linked set is a reported no-op that is re-verified, never relinked.
- The failure register below names what breaks a link after it is made. None of its rows substitutes for the current run's proof.

| # | Failure | Evidence | Re-verify |
| --- | --- | --- | --- |
| 1 | A replacing save severs a hardlink, while an in-place save keeps it | sourced, unmeasured | verify the whole set after saving |
| 2 | A checkout or stash may write a replacement file | sourced | verify after any rewrite, external aliases included |
| 3 | A restore without link preservation expands the set | sourced | verify after the round trip; never infer it from options |
| 4 | A cloud-sync service may reject links or materialize copies | sourced | probe it and verify on each host; unknown stops |
| 5 | An edit after the audit invalidates equality | historical | the pre-write re-check names the delta and stops |
| 6 | Equal bytes can hide different ACLs, streams or xattrs | proposed | repeat the contract proof; unproven stays stopped |
| 7 | A writer can act after the final hash | proposed | stop without the exclusion answer; never claim the race removed |

## Verification

Before finishing, confirm:

1. The step 1 audit ran first and its approval preceded every write; a run with no scatter made no change, and a stop is reported as a valid outcome.
2. The probed rungs, the exclusion answer and the approval are recorded.
3. Every pre-write delta is reported, and every required preservation is verified.
4. Identity, hashes and contract are proven through every name.
5. Each of the seven failure classes is re-verified where it applies.
6. A staged reversal, when one ran, is proven; anything unknown stays unfinished.
7. Every receipt carries the command, exit code, time, identity before and after, preservation location and unresolved fields.
8. The final report states what was linked, what stayed read-only, and what still needs a human decision.
