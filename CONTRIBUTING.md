# Contributing to paperthin

Thanks for helping. Paperthin is a small suite on purpose, so every addition has to show that the suite is worse without it.

## Proposing a change

Open an issue to discuss an idea, or a pull request when you have the change. A bug fix is the easiest yes. Tooling is welcome when it automates a rule the suite already applies by hand. A new skill has to close a real gap that no existing skill covers, and it has to follow the guide in [AGENTS.md](./AGENTS.md): its [layout](./AGENTS.md#layout) and name, the [SKILL.md format](./AGENTS.md#skillmd-format), its [invocation](./AGENTS.md#invocation) lane, and the [shipping checklist](./AGENTS.md#shipping). Keep one pull request to one idea.

## How your pull request lands

The maintainer reviews it and approves it when it is accepted. Then it lands in one of three ways:

- **As it is**, when it is ready.
- **With the maintainer's follow-up commits** pushed onto your branch, when it needs smaller changes such as an update from `main`, a fix, a test or a rename. Your commits stay yours and the maintainer's stay separate.
- **Carried into a new pull request** from a maintainer branch, when it needs a rewrite or targets the wrong branch. The new pull request keeps your commits or credits you as co-author, links yours, and your pull request is closed as superseded with a comment that explains what changed and why.

Every pull request is squash-merged, and the release notes credit you with your pull request number and handle. Please keep **Allow edits by maintainers** turned on, so the maintainer can push follow-ups to your branch instead of carrying it.

## Before you push

- Write each commit message in the form [AGENTS.md#commit-messages](./AGENTS.md#commit-messages) describes; CI checks it.
- Run `npm ci` once, then make sure `npm test` and `npm run check` both pass.
