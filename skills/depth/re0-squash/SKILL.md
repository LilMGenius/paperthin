---
name: re0-squash
description: "Republish a GitHub repository as one signed commit: squash its whole history into one commit with the same tree, then delete the remote and recreate it under the same name and settings, because a force push leaves the old commits reachable by hash, in forks and in pull requests. User-invoked, and the deletion cannot be undone."
disable-model-invocation: true
---

Squash one repository's history into one signed commit with the same tree, then delete its GitHub remote, recreate it with the settings the script records (step 4) and push that one commit.

## Goal

A force push does not clean a GitHub history. GitHub's guide on removing sensitive data says rewritten commits can stay reachable in clones and forks, by hash in cached views, and through pull requests that reference them. Deleting the repository is what drops those objects from it, so this skill squashes every commit into one, deletes the remote, recreates it with the settings it can restore, and pushes the one commit. The tree stays byte-identical; only the record changes.

This is not a restart: nothing is rebuilt and no archive branch keeps the old line on the remote. A restart from v0 is `re0-work`.

It is **user-invoked**: it deletes a remote repository, which cannot be undone, and its trigger is a deliberate human act; a model with it in reach could reach for a delete on its own. Run it when the human names this skill, or asks to squash a repository's history and recreate its remote.

## Workflow

Prerequisites: git with commit signing configured, and gh authenticated with the delete_repo scope. --repo overrides the owner/name read from origin.

The inputs are a clean checkout on the default branch, the commit message the human approves, and the human's acceptance of each loss the audit lists. One bundled script does the work in three subcommands, run from the repository root (the root of the repository being republished; `scripts/squash.mjs` is the script in this skill's folder):

    node scripts/squash.mjs audit [--repo <owner/name>]
    node scripts/squash.mjs squash --message-file <file> [--bundle <path>]
    node scripts/squash.mjs republish --confirm <owner/name> [--accept-loss] [--repo <owner/name>]

Each prints one JSON object. Exit codes: 0 done (audit: no blockers; republish: pushed head matches and no setting drifted); 1 refused or failed (dirty tree, detached HEAD, wrong --confirm, unaccepted blockers, more than one commit, a git or gh call that failed, a pushed head that differs, or a restored setting that drifted); 2 usage; 3 audit found blockers.

1. **Audit.** Run `node scripts/squash.mjs audit [--repo <owner/name>]`. Input: the checkout and its GitHub remote. Output: the audit JSON, with the local state (`local`), every remote item the delete takes (`remote`), the settings to restore (`settings`), `blockers` and `notes`. Exit 0 means no blockers, 3 means blockers, 1 means a git or gh call failed. Read every blocker it prints: issues, pull requests, releases, branches other than the default, tags, webhooks, secrets, variables, rulesets, deploy keys, Pages, collaborators other than the owner, forks, stars, uncommitted changes, and a checked-out branch other than the default. A remote list gh cannot read is a blocker too, since its loss cannot be ruled out. A public fork keeps the old commits after the delete and is out of this skill's reach. **Stop: the human decides.** Brief the human on each blocker, and they accept or decline each loss; one declined loss ends the run here, with nothing squashed. A request to squash is not acceptance of a loss nobody has seen.
2. **Write the message.** When the human wants the squash message to follow the repository's commit standard from an existing message, tell the human to run `/re0-git` before this step; it is user-invoked, so this skill never calls it. Read the repository's documented commit convention and its log first. Write one subject naming what the repository is, a blank line, then one `-` bullet per durable capability on a single unwrapped line saying what it does now. Leave out process history, reverts and renames, which the squash is meant to drop, and any co-author trailer. **Stop: the human decides.** Show the human the message before squashing, and squash only once they approve it; then save the approved message to a file.
3. **Squash.** Run `node scripts/squash.mjs squash --message-file <file> [--bundle <path>]`. Input: the approved message file on a clean checkout. Output: the squash JSON, with the old tip (`old`), the new commit (`new`), the commit count (`commits`), the signature status (`signature`) and the bundle path (`bundle`). Exit 0 means squashed, 1 means refused or failed, 2 means a usage error such as a missing message file. The script refuses a dirty tree or a detached HEAD; writes the old history to a bundle (in the home folder by default, or at --bundle) and verifies it, since once the remote is gone that bundle is the only copy you hold; commits the tree with `git commit-tree -S`, author and committer date now; moves the branch to it; and checks the tree is byte-identical to the old tip. Stop unless `commits` is 1 and `signature` is `G`: the script does not check the signature, and an unsigned or multi-commit result must not be republished.
4. **Republish. This step deletes the GitHub repository, and the deletion cannot be undone.** Every remote item the audit listed goes with it, and from here the bundle from step 3 is the only copy of the old history you hold; forks and other clones still carry it, outside this skill's reach. **Stop: the human decides.** Delete only on an explicit request from the human naming this repository's owner/name in this conversation. To confirm the human's reading of which repository and which losses before the delete, call the Skill tool with "readback" on the owner/name and the list of accepted losses, and delete only once the human confirms that restatement. Then run `node scripts/squash.mjs republish --confirm <owner/name> [--accept-loss] [--repo <owner/name>]`, with --confirm repeating owner/name exactly, adding --accept-loss only when the human accepted every blocker. Input: the squashed branch and the confirmation. Output: the republish JSON, with the pushed head (`pushed`), whether it matches local (`matchesLocal`), the settings that drifted (`settingsDrift`), what was not restored (`notRestored`) and `ok`. Exit 0 means the pushed head matches and no setting drifted; 1 means refused or failed. The script audits again and refuses if a blocker appeared since without --accept-loss, and refuses unless the branch holds exactly one commit. It records visibility, description, homepage, topics, the feature and merge settings, deletes the repository, recreates it, restores those settings, pushes the branch, makes it the default, and exits 1 if the pushed head differs or a setting drifted.
5. **Close.** Watch the first CI run; if it fails or never starts, report that with its log and treat the republish as incomplete. Tell the human where the bundle is, that it is the only copy of the old history they hold and that it stays until they delete it; that secrets, variables, webhooks, rulesets, deploy keys and collaborators were not restored and must be recreated by hand if kept; and that every other clone must `git fetch` and `git reset --hard origin/<branch>` before it can push again.

When the audit shows blockers the human does not accept, or the human declines at any stop, nothing is squashed or deleted: report the audit and stop. That is a successful run.

## Rules

- Never delete the remote without an explicit request naming this repository in this conversation. --confirm must repeat owner/name exactly.
- Accept no loss on the human's behalf. --accept-loss is passed only after the human accepted every listed blocker in this conversation.
- One branch is republished. Other local branches and tags keep the old commits and are not pushed.
- The squash commit is dated now and signed; it records when the republish happened. Content never changes: `git diff` between the old tip and the new commit is empty.
- A step that fails stops the run. A pushed head that differs or a drifted setting is reported as a failure, never as done.

## Verification

1. The audit ran, and every blocker was briefed to the human and accepted before republish.
2. `git diff <old> <new>` between the old tip and the new commit is empty, the branch holds one commit, and the signature status is `G`.
3. The bundle exists and verifies (`git bundle verify <bundle>`).
4. The republish output shows `matchesLocal` true, `settingsDrift` empty, `ok` true, and the first CI run passed.
5. The human was told the bundle path, what was not restored, and how other clones recover.
