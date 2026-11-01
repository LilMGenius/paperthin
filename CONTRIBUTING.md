# Contributing

Every issue and pull request is judged against one bar: paperthin is a small suite on purpose, so every addition has to show that the suite is worse without it. Read [AGENTS.md](./AGENTS.md) first.

## Where each request goes

| You have | Go to |
| --- | --- |
| A bug in a skill | [Issue](https://github.com/LilMGenius/paperthin/issues/new), or a pull request with the fix |
| A change to an existing skill | [Issue](https://github.com/LilMGenius/paperthin/issues/new), or a pull request with the change |
| A question, or "how do I...?" | [Issue](https://github.com/LilMGenius/paperthin/issues/new) |
| An idea for a new skill, or a skill to donate | [Issue](https://github.com/LilMGenius/paperthin/issues/new) |

Pull requests are open to everyone. Keep one pull request to one idea, and follow the guide in [AGENTS.md](./AGENTS.md): its [layout](./AGENTS.md#layout) and name, the [SKILL.md format](./AGENTS.md#skillmd-format), its [invocation](./AGENTS.md#invocation) lane, and the [shipping checklist](./AGENTS.md#shipping). Tooling is welcome when it automates a rule the suite already applies by hand.

## Issues written with AI

Agents are welcome to help, but you post the issue, so you own it:

- **One problem per issue.** Several findings from one session are several issues, or none.
- **Short.** If it does not fit on one screen, cut it.
- **Repro first.** The steps that show the problem come before any analysis.
- **No pasted specs.** No full proposals, plans, or rewritten `SKILL.md` files. Describe the problem; the fix is ours to design.
- **Not your project's issues.** If your agent files the specs or tickets for your own project here, it has the wrong repo.

## How your pull request lands

The maintainer reviews it and approves it when it is accepted. Then it lands in one of three ways:

- **As it is**, when it is ready.
- **With the maintainer's follow-up commits** pushed onto your branch, when it needs smaller changes such as an update from `main`, a fix, a test or a rename. Your commits stay yours and the maintainer's stay separate.
- **Carried into a new pull request** from a maintainer branch, when it needs a rewrite or targets the wrong branch. The new pull request keeps your commits or credits you as co-author, links yours, and your pull request is closed as superseded with a comment that explains what changed and why.

Every pull request is squash-merged, and the release notes credit you with your pull request number and handle. Please keep **Allow edits by maintainers** turned on, so the maintainer can push follow-ups to your branch instead of carrying it.

## Before you push

- Write each commit message in the form [AGENTS.md#commit-messages](./AGENTS.md#commit-messages) describes; CI checks it.
- Run `npm ci` once, then make sure `npm test` and `npm run check` both pass.
