---
name: deid
description: "Find one person's or one organization's data leaked into a shared repository, folder or artifact, using needles built from that owner's own records (names in every script, handles, emails, phone numbers, addresses, account and client ids), replace each hit with a role or placeholder that keeps the artifact working, and scan git history read-only for the commits that still carry them. Use when a public or shared repository, a template, a fixture set, docs or a deliverable may hold an operator's, a client's or a teammate's personal or business data, when someone asks to de-identify, anonymize, scrub or depersonalize an artifact, before publishing or open-sourcing a repository, or when a person's data must leave a codebase every operator runs."
---

Find one owner's data in a shared artifact with needles built from that owner's records, replace each hit with the role it plays, and report which commits still carry it.

## Goal

A shared artifact (a public repository, a template, a fixture set, a deliverable) holds nothing that belongs to one person or one organization, and still works: each leaked value is replaced by the role it plays or a placeholder that exercises the same code, or kept with a stated reason when it is already public. The working tree is changed only through a recorded decision file, so a rerun replays the same decisions. History is never rewritten here: the run lists the commits whose contents or messages carry a needle and names the decision the owner has to make about them.

The scope is what the human named: one artifact and one owner. The run never picks its own target or widens either.

## Workflow

1. **Pin the artifact and the owner.** Name the folder or repository and the one person or organization whose data must leave it. If the human named neither, ask; if several owners are involved, run once per owner.
2. **Build the needles from the owner's own records.** Read the records the human points to (identity and login files, profiles, business and payout settings, client lists, ledgers, message exports) read-only, and ask for them when none were named, and write a needle file: a JSON array of `{ "label": "...", "value": "...", "ci": true, "regex": true }` rows, `ci` and `regex` optional, every label unique and naming the kind of value (`client-phone`, `owner-name-ko`), never the value itself, since labels are printed. Spell each value every way it is written (a name in each script and order, a phone with and without separators and with the country code, an email in any case, an id with and without its prefix); a short or common word becomes a regex with word boundaries, since the script refuses a plain needle under three characters. Keep the file outside the artifact or under a gitignored local name, and never print a value: every later step names a needle by its label.
3. **List the hits.** From this skill's folder run `node scripts/deid.mjs scan <root> --needles <file> [--decisions <file>] [--no-git] [--json]`. Inside a git work tree it reads every file git does not ignore; `--no-git` reads every file under the root. It prints each hit as file, line, column and label, never the value; exit 0 means no hit, 3 hits, 2 a usage error or a broken needle file. A file that is not UTF-8 text is reported without a line and is never rewritten.
4. **Judge each hit and record the decision.** Read the hit in context without echoing the surrounding line, which carries the value and decide one of three things. A value already public by the owner's choice (the repository's own address, a published author credit, a public profile the artifact cites) is kept with its reason. A value in prose becomes the role it plays (the operator, the client, the company). A value in code, a test or a fixture becomes a placeholder of the same shape that still exercises the same branch: a reserved example domain for an email, an obviously synthetic number of the same length, a made-up name; check every assertion that reads it. Write a decision file, a JSON array of `{ "needle": "<label>", "replace": "..." }` or `{ "needle": "<label>", "keep": "<reason>" }` rows with optional `"paths": [globs]` matched against the repository-relative path; the first row whose needle and paths fit a hit decides it, so put scoped rows before general ones. The script refuses a replacement that itself carries a needle. Keep this file beside the needle file.
5. **State how serious the findings are, then apply.** Before any change, tell the human what kind of data was found (identity, contact, credentials, client records, business figures, platform ids) and how much, with labels and counts only, since the remedy they pick depends on it. Then run `node scripts/deid.mjs apply <root> --needles <file> --decisions <file> [--json]`. It rewrites only files whose text changes, resolves overlapping needles to the longest, and leaves a hit no decision fits in place; exit 3 means hits are still open. Repeat steps 4 and 5 until `scan` with `--decisions` exits 0, then run the artifact's own tests and checks; a failure goes back into the decision file as a better placeholder, never into a hand edit.
6. **Scan history read-only.** In a git repository run `node scripts/deid.mjs history <root> --needles <file> [--decisions <file>] [--rev <rev>]... [--json]`; it reads every ref unless `--rev` names some. It lists, per needle label, each commit whose patch adds the needle to a file and each commit whose message carries it, by commit id only, and changes nothing. The commit that adds a needle is where it entered; every descendant carries it until a later commit removes it, which is why a content rewrite starts at that commit. Exit 0 means history is clean, 3 that it is not.
7. **Report and hand history to its owners.** Report the working tree result (files rewritten, values kept and why, hits left open) and the history result. For commit messages that carry a needle, tell the human to run `/re0-git` on the listed commits. For past file contents, name the decision only the owner can make and run none of it: rewrite every listed commit and its descendants with a content-rewriting tool, force push each ref, and accept that clones, forks and the host may keep serving the old commits until purged; recreating the repository is the alternative.

## Rules

- One artifact and one owner per run, both named by the human; the run never widens either.
- A needle's value never reaches the output, a report, a commit or the artifact, and neither does a label, a keep reason or a path that spells it. The needle and decision files stay outside the artifact or under a gitignored local name, and the scripts never read them as part of the tree.
- The owner's records are read, never written.
- The working tree changes only through `apply` and a decision file; a hand edit goes back into the decision file so the next run replays it.
- A replacement never borrows another real person's or company's data; it is a role noun or a value that is synthetic on its face.
- A keep carries its reason. Already public means public by the owner's choice, never merely findable.
- History is only read. Rewriting past contents, force pushing and asking a host to purge are the owner's decisions, named in the report and never run; a commit message goes to the human through `/re0-git`, which rewrites messages and leaves contents as they are.
- A file that is not UTF-8 text is reported for a person to handle and never rewritten.
- A pass that finds no needle changes nothing and says so.

## Verification

Before finishing, confirm:

1. `scan` with the decision file exits 0 on the working tree, and the artifact's own tests and checks pass after `apply`.
2. No needle value appears in anything the run printed, wrote into the artifact or reported.
3. Every keep in the decision file states its reason.
4. The history result is reported with its two hand-offs: `/re0-git` for messages, and the owner's content-rewrite decision with nothing run.
5. When the script changed, its tests call the CLI through a junction or symlink to the skill folder and pass.
