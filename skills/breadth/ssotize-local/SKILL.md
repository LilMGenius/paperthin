---
name: ssotize-local
description: "Consolidate duplicate files or directories into one truth after approval, with the result an identity managed by this machine's filesystem: hardlink, symlink, junction, or bind mount. Use when consumers need the same bytes at several paths and textual references cannot serve them; it runs ssotize's audit and approval first, then probes capabilities and links only while the approved equality still holds."
---

Give duplicated files or trees one canonical home that this machine's filesystem holds as an identity, after audit and approval.

## Goal

Establish or repair one canonical home for duplicated files or trees without losing bytes or their preservation contract: ACLs, owner and mode, named streams, xattrs, and the timestamps that must be kept. The `-local` suffix means the result is an identity managed by this machine's filesystem, so portability depends on the mechanism. Use it when consumers need the same bytes at several paths and textual references cannot serve them.

It is an orchestrator. `ssotize` owns the shared procedure: naming the truth, finding every copy by two methods, classifying copies and contradictions, choosing the canonical home, folding unique details and the approval of the plan. This skill runs it first and adds only what a filesystem identity needs: capability probes, writer exclusion, the preservation contract, the link ladder, identity proof, the failure register and reversal. When `ssotize` is not installed, say so and stop, since a link made without its audit and approval skips the gates that make it safe. The deterministic steps run the script bundled beside this file, `node scripts/identity.mjs probe <path>...` and the subcommands below, and every subcommand accepts `--json`. No scatter means no change, and a stop is a valid outcome.

## Workflow

1. **Audit with ssotize.** Call the Skill tool with "ssotize" on the duplicated files or trees, for its read-only audit and plan, with linking as the proposed action for each copy whose consumers need the same bytes. Its occurrence table, canonical home and reason, contradictions and unique details are this run's inventory, and where it stops, this run stops. Then add what a link needs: the consumers, the aliases, the trust boundaries, hidden and empty entries and nested links, each link target resolved explicitly. A shared directory must include every member its consumers need.
2. **Probe, never assume.** Run `node scripts/identity.mjs probe <path>...` on the candidates and the destination parents, and record command, exit, output and time. Probe reports path, link state and target, identity and link count, size, mtime, mount root where derivable, and the link capabilities it tests in a temporary directory, the only write an audit makes. Probe destination permission, locality, filesystem and mount privilege separately, and resolve ancestor links and mounts. A label proves nothing; unknown stays unproven.
3. **Exclusive access (the human decides).** Ask: "Can every concurrent writer be excluded for the whole mutation and verification interval by a maintenance window or a lock every writer honors?" Only an explicit yes establishes exclusive access, and the answer is recorded; a handle listing is a snapshot, not a lock. On no, or no answer, report "Exclusive access unproven for <path>; no mutation" and stop. Never kill unrelated processes.
4. **Read-only audit.** `digest <path>...` gives path, mtime, size, sha256 and identity through every name, with sorted relative members and a manifest hash. `compare <a> <b>` classifies bytes and identity and exits 0 for equality or identity, 3 for divergence or unique members, 1 for errors. Inspect ACLs, owner and mode, named streams, xattrs and timestamps separately, and report deltas caused by reads or identity changes. Which timestamps must be kept is the user's call, made with the approval: propose each from what reads it, such as a sync or build keyed on mtime, a backup or a ledger, and keep every timestamp until they decide. Every name of a link shows the canonical's timestamps, so a duplicate's timestamp that must be kept goes into the preservation step 8 verifies. A missing tool, denied read or unsupported field leaves the contract unproven; the script proves main bytes and members only.
5. **Classify** each case into one decision:

   | Case | Decision |
   | --- | --- |
   | identical bytes and contract | eligible for approved linking; no backup |
   | identical bytes, differing or unreadable contract | unproven; name the deltas and stop, or resolve preservation explicitly; a backup proves no equality |
   | divergent bytes | a contradiction `ssotize` reports; stop for a human choice or a requested merge; never newest or largest wins |
   | present in one place only | call the Skill tool with "ssotize" again for the fold, under its own approval from the human; re-audit before linking |
   | already linked to the intended canonical | identity-proven no-op; report and re-verify, never relink |

6. **Report** to the human, beside `ssotize`'s occurrence table, per path: the rung (the linking mechanism chosen from step 9's ladder), displaced names, preservation locations, proof and reverse actions. Re-audit after an approved fold.
7. **Plan approval (the human decides).** Put the plan to the human as `ssotize`'s approval, in the wording **"link if still identical at the mutation step"**; only that wording covers the link step. Without it, stop after the read-only report. This approval covers neither an unresolved conflict nor a later change, and a fold, a merge or a copy each needs its own consent.
8. **Re-check before the first write.** Immediately before any target write, backup and reconciliation included, re-enumerate the candidates and re-read **path, mtime, size, and sha256**, the contract, identity and exclusion evidence against the approved audit, per item. Any added, missing, unreadable, replaced or changed candidate stops the write, naming the file and the delta, and audit and approval are renewed. The script snapshots staging and displacement, never approval or writer exclusion, and hashing narrows a race without removing it. Proven byte-and-contract equality skips backup; an unproven candidate first needs verified independent preservation, contract included, and if that is impossible the run stops.
9. **Execute the ladder.** After the gates, `link <canonical> <alias> --mechanism hardlink|symlink|junction [--staged <absent-sibling>]` installs a proven link and keeps any entry it displaces intact. Never overwrite an uninspected path or recursively delete a tree; on failure preserve originals and stages. Pick one rung per case:

   | Rung | When | How |
   | --- | --- | --- |
   | file hardlink | regular file on the same supported local volume, with parent permission | probe, then `link --mechanism hardlink` |
   | directory hardlink | unsupported on every mainstream system | never attempt |
   | symlink | first choice for a directory, fallback for a file, where link creation and parent permission were probed | `link --mechanism symlink` |
   | junction | Windows directory fallback: writable parent, absolute local target, no network target, no same-volume rule | `link --mechanism junction` |
   | bind mount | Linux only, by explicit human choice, with probed privilege, an approved empty mount point and its own persistence plan | outside the script; never a silent fallback |
   | copy | only by explicit consent from the human | reported as "no longer SSOT", never as a link |

   The rungs rest on [hard links and junctions](https://learn.microsoft.com/en-us/windows/win32/fileio/hard-links-and-junctions), [Linux link(2)](https://man7.org/linux/man-pages/man2/link.2.html) and [macOS link(2)](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/link.2.html), cited as sources, not local measurements; documentation never closes a probe.
10. **Re-verify** read-only after every mutation with `verify <canonical> <alias>...` against the approved manifest and contract. A hardlink needs equal dev:ino (or volume and file ID) and an nlink covering the set; a symlink or junction must resolve to the canonical; every member hashes equal through every name. Equal bytes alone never prove identity. A bind mount needs its own mount, source and identity proof. Unknown stops. Never write a sentinel to a live target; a write test belongs to an authorized disposable fixture.
11. **Check the failure register.** Each class names its evidence and its re-verify action, and none substitutes for the current run:

    | # | Failure | Evidence | Re-verify |
    | --- | --- | --- | --- |
    | 1 | a replacing save severs a hardlink while an in-place save keeps it | sourced, unmeasured | verify the whole set after saving |
    | 2 | a checkout or stash may write a replacement file | sourced | verify after any rewrite, external aliases included |
    | 3 | a restore without link preservation expands the set | sourced | verify after the round trip, never inferred from options |
    | 4 | a cloud-sync service may reject links or materialize copies | sourced | probe it and verify on each host; unknown stops |
    | 5 | an edit after the audit invalidates equality | historical | step 8 names the delta and stops |
    | 6 | equal bytes can hide different ACLs, streams or xattrs | proposed | repeat the contract proof; unproven stays stopped |
    | 7 | a writer can act after the final hash | proposed | stop without the exclusion answer; never claim the race removed |

12. **Reverse by mechanism, after the human approves it.** Repeat step 2 and probe the removal on disposable data. `unlink <alias> --stage <dir>`, with `<dir>` an existing folder on the alias's volume outside the linked tree, replaces the link with a proven independent copy under the alias name, removing only the entry and never the target tree ([nonrecursive removal](https://learn.microsoft.com/en-us/dotnet/api/system.io.directory.delete) for a junction). Verify the staged contract first, since copied bytes do not certify ACLs, streams or xattrs. Never delete through a link. Prove the canonical's members, hashes and contracts and every unselected link intact; a link count fits the intended aliases, not always one. A bind mount needs an explicit unmount (busy stops; never force or lazy), exact-mount absence, an unchanged source and a distinct revealed mount-point identity; never stage into or remove a mount point, and an unmount creates no copy. On partial failure preserve receipts and originals; what cannot be verified stays unfinished.

## Rules

- Never write to a target before `ssotize`'s audit and approval (the probe's temporary directory is not a target); report what stayed read-only and what needs a human decision. An empty finding is valid.
- Confirm with the human any private/public or internal/customer-facing boundary a link would cross: a link exposes shared changes and permissions to every consumer.
- Never follow a link to delete its target, and never recursively delete at an alias; preserve originals on partial failure.
- State portability per mechanism. A hardlink carries no identity in a Git clone. A relative symlink travels where the layout is reproduced, and `core.symlinks=false` writes its target text as a file, so inspect the [repository setting](https://git-scm.com/docs/git-config#Documentation/git-config.txt-coresymlinks) and verify on the destination. An absolute symlink needs the same target path. A junction is Windows-only, local and absolute. A bind mount needs host administration and approved persistence. A copy is no longer SSOT.
- Prefer a directory link when consumers must see additions, deletions and replacements; re-verify a file hardlink after replacement. Never promise permanent linkage.
- An already-linked set is a reported no-op that is re-verified, never relinked.

## Verification

Before finishing:

1. Confirm the probed rungs, the exclusion answer and the approval, the pre-write deltas, preservation, identity, hash and contract proof through every name, the seven failure classes, and the staged reversal. Unknown stays unfinished.
2. Confirm every receipt carries command, exit, time, before and after identity, preservation location and unresolved fields.
3. Confirm `ssotize` ran first and its approval preceded every write, no scatter made no change, and a stop is reported as a valid outcome.
