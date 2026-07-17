<div align="center">

# Paperthin: Low-level agentic design patterns

<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/banner.svg" alt="Paperthin — Trust the artifact, not the author." width="820">

**Turning old engineering wisdom into reflexes your agent reaches for on its own.**

On **any** agent | Claude Code, Codex, OpenCode, Antigravity, Copilot, Cursor, Grok-Build, Pi, Hermes, OpenClaw, etc.

[Quickstart](#quickstart-15-seconds) · [The Map](#the-map) · [The Index](#the-index) · [The Problem](#the-problem) · [The Fixes](#the-fixes) · [Credits](#credits)

<sub>Read in: English · [中文](./docs/readme/README.zh-CN.md) · [हिन्दी](./docs/readme/README.hi.md) · [Español](./docs/readme/README.es.md) · [العربية](./docs/readme/README.ar.md) · [Português](./docs/readme/README.pt.md) · [Русский](./docs/readme/README.ru.md) · [日本語](./docs/readme/README.ja.md) · [Français](./docs/readme/README.fr.md) · [Deutsch](./docs/readme/README.de.md) · [한국어](./docs/readme/README.ko.md)</sub>

</div>

---

## Quickstart (15 seconds)

1. **Install** for every agent you use:
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*'
   ```
2. **Run it from an elevated/admin shell if your OS asks** so the skills are symlinked (they auto-update), not copied.
3. **Stay current** — run `/re0-upgrade` whenever you want to update; it also wires a quiet session-start notice for when new skills ship.
4. **Use them** — call any skill by name, like `/re0`; model-invoked ones also fire on their own.

**Not sure?** Paste that command into whatever agent you're using and just say `set this up for me`, it'll do the rest.

## The Map

**How many artifacts, and across how much time?**

<div align="center">
<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/map.svg" alt="The Paperthin map by LilMGenius/paperthin, a two-by-two matrix. Horizontal axis cardinality (one, then many); vertical axis time (now, then across iterations); four regions. Top-left, depth: one artifact, now; is this one thing clean and true? Top-right, breadth: many artifacts, now; is one truth consistent everywhere? Bottom-left, coil: one project, across iterations; did each pass teach the next? Bottom-right, mesh: many minds, across rounds; does the crowd converge on truth?" width="820">
</div>

## The Index

### `depth/`

| Skill | What it does | Scope | Invoker | Read-only |
|---|---|---|---|---|
| ♻️ **[re0](./skills/depth/re0/SKILL.md)** | Rewrite a drifted artifact into a clean v0, not another patch | one artifact | model | |
| 🧭 **[readchk](./skills/depth/readchk/SKILL.md)** | Check the model's read of the request; surface only a real surviving fork | one instruction | model | ✔ |
| 🏹 **[aim](./skills/depth/aim/SKILL.md)** | Read handed-over data and propose the intent to confirm, instead of asking for it | one data drop | model | ✔ |
| 📏 **[modelchk](./skills/depth/modelchk/SKILL.md)** | Size the cheapest sufficient tier: fast, standard, or frontier | one task | model | ✔ |
| 😈 **[hate](./skills/depth/hate/SKILL.md)** | Refuse to be nice: the one objection that could kill it, plus the cheapest test | one plan | user | |
| 🧠 **[macrothink](./skills/depth/macrothink/SKILL.md)** | Strip the bait, fan out fresh reads, report divergence first | one direction | user | ✔ |
| 🧐 **[feynman](./skills/depth/feynman/SKILL.md)** | Press a just-made decision until you can explain it, or the gap is flagged | one decision | user | ✔ |
| 🛣️ **[autobahn](./skills/depth/autobahn/SKILL.md)** | Carve unsafe scope out up front, run the safe rest at full strength, log the descope | one task | model | |
| 🧰 **[detool](./skills/depth/detool/SKILL.md)** | Replace incidental stack nouns with the mechanism they mean | one durable artifact | model | |
| ✂️ **[dedash](./skills/depth/dedash/SKILL.md)** | Remove em-dashes and look-alikes, picking the punctuation each spot needs | your prose | user | |
| 🔃 **[reorder](./skills/depth/reorder/SKILL.md)** | Realign a drifted listing into a logical order under one stated principle; move items only, reword nothing | one listing | user | |
| 🚿 **[shower](./skills/depth/shower/SKILL.md)** | Cold-read it with fresh, zero-context eyes: does it stand alone? | one artifact | model | ✔ |
| 🔬 **[factchk](./skills/depth/factchk/SKILL.md)** | Verify what's asserted against sources both ways: could the absurd be real, the obvious false? | one claim | model | |
| 🧪 **[mandela](./skills/depth/mandela/SKILL.md)** | Audit for leakage: does outside ground-truth actually enter? | one eval | model | ✔ |
| 🥄 **[sip](./skills/depth/sip/SKILL.md)** | After any change, taste it with the repo's own clean-and-true checks | your output | model | |
| 🧾 **[re0-git](./skills/depth/re0-git/SKILL.md)** | Rewrite a finished commit's message so `git log` alone hands off | one commit | user | |
| 🚀 **[re0-release](./skills/depth/re0-release/SKILL.md)** | Run the shipping and releasing checklist, then tag and publish once confirmed | one release | user | |
| 🤝 **[re0-merge](./skills/depth/re0-merge/SKILL.md)** | Review and land a contribution: gate it, keep the author's credit, approve before closing, explain any change | one contribution | user | |

### `breadth/`

| Skill | What it does | Scope | Invoker | Read-only |
|---|---|---|---|---|
| 🧲 **[ssotize](./skills/breadth/ssotize/SKILL.md)** | Audit scatter, then consolidate to one home and point the rest at it | one fact, many places | model | |
| 🧰 **[re0-upgrade](./skills/breadth/re0-upgrade/SKILL.md)** | Upgrade to the full current catalog in one command: retire renamed, add new, all confirmed first | your skill install | user | |

### `coil/`

| Skill | What it does | Scope | Invoker | Read-only |
|---|---|---|---|---|
| 🗂️ **[re0-plan](./skills/coil/re0-plan/SKILL.md)** | Open a new iteration folder with DESIGN/WORKFLOW/EVIDENCE before re0-loop's first turn | one new cycle | user | |
| 🌀 **[re0-loop](./skills/coil/re0-loop/SKILL.md)** | Run the build → QA → re0-memo → re0-work loop so learning compounds, not code | the whole loop | model | |
| 🧭 **[re0-memo](./skills/coil/re0-memo/SKILL.md)** | Pull the lessons and anti-patterns from a finished or failed cycle | one finished cycle | model | |
| 🧱 **[re0-work](./skills/coil/re0-work/SKILL.md)** | Start over from v0, keeping only the lessons that earned reuse | one restart | model | |
| 🗺️ **[catchup](./skills/coil/catchup/SKILL.md)** | Rebuild lost context from live state: what needs them, what changed, what new words mean | one re-entry | model | ✔ |
| 🎯 **[nba](./skills/coil/nba/SKILL.md)** | Read the live cycle state and return the single next best action, not a menu | the live cycle | model | ✔ |

### `mesh/`

| Skill | What it does | Scope | Invoker | Read-only |
|---|---|---|---|---|
| 🔺 **[prism](./skills/mesh/prism/SKILL.md)** | Split one artifact across independent lenses; return where they clash and the question that resolves it | one artifact | user | ✔ |

*More on invocation: [docs/invocation.md](./docs/invocation.md)*

## The Problem

**Most agent skills are slop.**

Point an agent at a goal and it **adds** — more files, more options, more "helpful" boilerplate. Adding looks like progress, and nothing ever makes it go back and delete.

> [!WARNING]
> Repeat that across a project and you get the familiar AI-generated toolkit: near-duplicate skills, dead settings, a README that says the same thing three times. Plausible, busy, and quietly unmaintainable.

These skills bet the other way — **every one of them removes:**

- `re0` rewrites a draft into a clean v0 instead of patching it,
- `readchk` restates the request and asks only when a real fork survives,
- `modelchk` sizes the cheapest sufficient capability tier before the work starts,
- `macrothink` fans out fresh reads and reports divergence before convergence reads as proof,
- `autobahn` carves unsafe scope out up front, so the safe remainder runs at full speed,
- `detool` strips incidental stack nouns from portable content, leaving the mechanism they meant,
- `dedash` removes even the em-dash tell and its look-alikes, one judged occurrence at a time,
- `shower` cuts whatever a stranger can't follow,
- `ssotize` audits scattered facts, asks approval, then folds them into one home,
- `re0-memo` / `re0-work` / `re0-loop` preserve the lesson, let the wrong build die, and keep the cycle running,
- `catchup` / `nba` reload the human's map from live state, then return the one next move,
- `sip` runs all of it on your own output, automatically.

> [!TIP]
> The hard part isn't adding features — it's restraint. A pass that finds nothing to improve changes nothing. **That restraint is the product.**

## The Fixes

<!-- Fixes lead with re0 — the founding thesis every other fix serves — then follow the lifecycle of a piece of work: understand the ask, challenge the approach, carve unsafe scope, clean the artifact, check truth, then keep the loop learning. Slot any new fix by where it acts in that arc. -->

**Each is a well-worn principle, made automatic.**

### #1 — Artifacts rot
Edit a doc one piece at a time across a session and it bloats: stale deltas, duplicated noise, changelog scars. Patching on top just preserves the rot.

**The fix → `re0`:** rewrite the artifact as a clean v0, as if it were the first version.

> *Prior art: the Boy Scout Rule — "leave it cleaner than you found it" (Robert C. Martin, [Clean Code](https://www.informit.com/articles/article.aspx?p=1235624&seqNum=6), 2008). `re0` goes further: rewrite, don't just tidy.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — we asked `re0` to refresh these docs once more, but they were already at v0.
- **Result** — it found nothing to improve and left every line of prose untouched.
- **So** — a tool that does nothing when nothing is wrong never bloats your repo: these skills remove noise, they never add it.
</details>

### #2 — You can build the wrong request perfectly
A long or bundled instruction has enough surface area for a subtle misread: the agent starts work, stays coherent, and only later proves it optimized the wrong target.

**The fix → `readchk`:** restate the instruction internally, cross-check it against available context, proceed silently when the read is resolved, and ask only when one real fork survives.

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — its first casebook mixed flexible ordering, a concrete file creation, a resolved "that", and a bundled ambiguous update.
- **Result** — it surfaced only the real forks and stayed silent on the concrete and context-resolved cases.
- **So** — the check catches expensive misreads without turning clear instructions into confirmation theater.
</details>

### #3 — Capability becomes guesswork
Some work is run with too much horsepower because "stronger" feels safer; some is run too cheaply until the failure costs more than the saved tokens. Both are guesses wearing operational clothing.

**The fix → `modelchk`:** classify the task by risk, ambiguity, reversibility, blast radius, and proof surface, then recommend the cheapest sufficient tier: `fast`, `standard`, or `frontier`. It advises; it never routes, pins, or names a concrete model.

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — its first task cards included overpowered review, cheap mechanical work, model-branded input, and release-risk work.
- **Result** — it kept only fast/standard/frontier tier language, named the proof surface separately, and rejected routing authority.
- **So** — capability sizing becomes a bounded recommendation instead of a vendor claim or a reflexive escalation.
</details>

### #4 — You can't kill your own plan
You built it, so you defend it. The questions that would break it are exactly the ones you won't ask.

**The fix → `hate`:** refuse to be nice to the plan — return the one load-bearing objection that could kill it and the cheapest experiment that would prove it matters. User-invoked: you point it at a plan deliberately.

> *Prior art: [egoless programming](https://en.wikipedia.org/wiki/Egoless_programming) (Weinberg, 1971 — the same root `shower` cites), hostile review, and fail-fast.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — every research pass closed with an adversarial critic, and its verdict was always one root cause plus the cheapest test that would settle it, never a checklist.
- **Result** — it killed a recombination engine with "one more box drawn, not a sharper tip", and a human-holdout protocol on the numbers alone: n≈24 where 36 was needed, a family-wise error rate near 34%, and a design that cited a principle while implementing its opposite.
- **So** — the objection that mattered was always singular and cheap to test — exactly the `{root, first nail}` that `hate` is locked to return.
</details>

### #5 — One framing becomes the whole world
Examples, names, and first plausible answers can trap a session before the plan even looks risky. A single agent may keep improving the inherited frame instead of noticing a different read.

**The fix → `macrothink`:** user-invoke a read-only fan-out: strip the session's bait, ask 2 to 5 fresh reads for the underlying problem, and report divergence first. Same-model convergence is reassurance only, never proof.

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — its founding cases tested bait stripping, convergence-as-reassurance, and constraint completeness.
- **Result** — it stayed user-invoked, read-only, capped at 2 to 5 reads, with divergence first and explicit bans on majority vote, averaging, and "verified" wording from same-model convergence.
- **So** — plurality is used to expose blind spots, not to manufacture consensus.
</details>

### #6 — Risk-adjacent work comes back hedged
Point an agent at a task that brushes guardrails — scraping, licensing, privacy, security — and you get the worst of both worlds: the risky sliver triggers refusals and retries, while the safe 90% comes back hedged, diluted, or quietly missing.

**The fix → `autobahn`:** carve guardrail-adjacent items out of scope before execution, each with a safe alternative and an archive entry; run the remaining scope at full strength in a fresh subagent that only ever sees the carved prompt, not the risky input; ship a descope ledger so every exclusion is a visible decision, not a silent gap. It removes the ask rather than slipping it past. The autobahn has no speed limit *because* entry discipline is strict.

> *Prior art, from this very summer: the US [suspended Fable 5 and Mythos 5](https://www.anthropic.com/news/fable-mythos-access) over one jailbroken safeguard (Anthropic, 2026), and OpenAI shipped [GPT-5.6](https://openai.com/index/previewing-gpt-5-6-sol/) safety-stack-first to trusted partners (OpenAI, 2026) — at the frontier, the fast lane stays open only as far as entry discipline holds.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — the method was lifted from a live rewrite of a confidential strategy doc that was risk-adjacent on four axes at once: stealth tooling, trademarked names, privacy-adjacent profiling, scraping gray zones.
- **Result** — a main loop plus ten subagents ran the frontier model end to end with zero flags, zero refusals, zero fallbacks — and every descoped item's safe alternative turned out to be the better product anyway.
- **So** — the main loop carved, clean subagents ran the safe scope, and the carve is why they could floor it.
</details>

### #7 — Portable docs smuggle their toolchain
A durable artifact says it should work across agents, hosts, and time, but its prose quietly depends on one vendor, model, CLI, path, quota, or UI. Portability dies by nouns.

**The fix → `detool`:** classify the text by role first, then replace incidental stack coupling in portable content with the mechanism it meant, while leaving provenance, runbooks, and tool-subject claims concrete.

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — its founding cases covered durable content, provenance, operational runbooks, and comparative claims about named tools.
- **Result** — portable content moved to mechanism language while concrete paths, commands, and named tool subjects stayed when they were evidence or instructions.
- **So** — tool nouns are removed only when they are accidental coupling, not when they are the artifact's subject or proof.
</details>

### #8 — You go blind to your own work
After a long session you're the one person who *can't* read your own work straight: you know too much, so your brain quietly fills every gap and the holes turn invisible.

**The fix → `shower`:** hand a stranger who never saw your session only the artifact, and ask "does this actually make sense?"

> *Prior art: [egoless programming](https://en.wikipedia.org/wiki/Egoless_programming) — you can't review your own work objectively; someone else must (Gerald Weinberg, 1971). Here, that someone is a context-free sub-session.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — we handed `shower` its own spec, to a sub-session with zero context, holding only the file.
- **Result** — in minutes it found three bugs the author had missed:
  - a step that hinted the answer it should hide,
  - a path that leaked spoiler files,
  - a scope too vague to act on.
- **So** — a skill that catches its own bugs can catch yours.
</details>

### #9 — The same fact ends up everywhere
A timeout value, a decision, a status — copied into a README, a doc, a ticket, and a Slack thread. The copies drift, and now no one knows which is true.

**The fix → `ssotize`:** find the scatter, name the canonical source, ask approval for the mutation plan, then consolidate and point the rest at it.

> *Prior art: [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) — one fact, one authoritative home (Hunt & Thomas, The Pragmatic Programmer, 1999).*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — a pilot milestone landed in a strategy repo, and its status lived in six files at once: the plan that gated on it, the re0-memo, an eval-corpus inventory, two frontier docs, and the build's own metadata.
- **Result** — one pass made the re0-memo's new cycle section the single home for what the milestone proved, rewrote the other five to point at it, and converted every plan line the milestone had answered from future-tense intent to present-tense fact.
- **So** — the copies never got the chance to drift: one home, five pointers, and the stale "next step" wording died the same day it became false.
</details>

### #10 — Your gut isn't a source
"Plausible," "absurd," "novel" — the least reliable line in any artifact. Human priors fail **both ways**: they exclude the real (desert frogs exist) and normalize the impossible (weightless crates).

**The fix → `factchk`:** verify any reality-grounded claim against external sources, in both directions, before it ships — and flag, don't guess, when you can't reach one.

> *Prior art: [WEIRD bias](https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/abs/weirdest-people-in-the-world/BF84F7517D56AFF7B7EB58411A554C17) (Henrich, Heine & Norenzayan, 2010) and the [naive-physics / impetus error](https://www.science.org/doi/10.1126/science.210.4474.1139) (McCloskey, Caramazza & Green, 1980) — intuition misjudges reality in both directions.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — we ran `factchk` on its own shipped citations, in both directions.
- **Result** — all held, and it still caught two attribution slips to fix: the famous "what's measured becomes the target" wording is Strathern (1997), not Goodhart; and "McCloskey 1980" is the co-authored *Science* paper, not the 1983 *Scientific American* piece.
- **So** — a fact-checker that audits its own footnotes will audit yours.
</details>

### #11 — The eval confirms itself
A model, a scorer, and a designer can all agree a result is real while no outside ground-truth ever entered the loop — a whole room confidently remembering something that never independently happened.

**The fix → `mandela`:** audit any eval, metric, or experiment against an 8-pattern leakage taxonomy — does external ground-truth enter independently, or is the verifier the designer?

> *Prior art: [Goodhart's law](https://en.wikipedia.org/wiki/Goodhart%27s_law), [data leakage](https://dl.acm.org/doi/10.1145/2382577.2382579) (Kaufman et al., 2012), and [circular analysis](https://www.nature.com/articles/nn.2303) — "double dipping" (Kriegeskorte et al., 2009).*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — the audit was distilled from one research design that kept dying to a single failure mode: a scorer, a model, and a designer agreeing on a result no outside truth ever produced.
- **Result** — leakage surfaced in eight distinct shapes in that one project — a scorer grading buckets it had drawn, two components "verifying" each other in a shared space, a private recipe that made the verifier the designer — and that catalog became the skill's 8-pattern taxonomy.
- **So** — the checklist isn't theoretical: every pattern in it already drew blood once.
</details>

### #12 — "Remember to verify" never fires
A guideline buried in docs won't trigger in a brand-new session — exactly when author bias is highest.

**The fix → `sip`:** the moment you finish something, it runs the clean checks (`shower`, `ssotize`, `re0`) and, when there's a claim or an eval, the true ones (`factchk`, `mandela`) on your output, automatically.

> *Prior art: [dogfooding](https://en.wikipedia.org/wiki/Eating_your_own_dog_food) — eat your own dog food (Microsoft, 1988). Taste your own cooking before you serve it.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — right after a large refactor that made every skill self-contained, `sip` auto-fired on the result.
- **Result** — its fresh-eyes pass caught two things the author could no longer see: a maintenance rule still pointing at skill-to-skill links that the same refactor had just deleted, and a file-editing safety rule present in two skills but missing from a third that also edits files.
- **So** — the check bites where bias is highest: not on a fresh artifact, but on the drift a big change leaves behind — exactly what the author's own eyes skate over.
</details>

### #13 — Your session doesn't travel; the git log does
Your session is stuck where it ran — this agent, this account, this machine. A teammate or another agent can't load the context your work happened in.

**The fix → `re0-git`:** clean a finished commit's message so `git log` — the one thing every environment shares — carries the handoff, and anyone picks up from the log alone.

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — `re0-git`'s very first target was its own release commit.
- **Result** — dogfooding it surfaced two faults, both fixed:
  - a message padded with trivia,
  - a spec that preached "no redundancy" while repeating itself.
- **So** — its first cleanup was after itself.
</details>

### #14 — Long cycles lose the build, and the builder
Long agentic cycles produce many working parts — panels, routes, tests, screenshots — that prove activity more than value, and the sunk cost tempts you to carry the architecture forward. The same cycles coin vocabulary, rename files, and make calls faster than the human owner can follow, so even a correct next action arrives unreadable: phrased in words invented while they were away.

**The fix → `re0-memo` + `re0-work` + `re0-loop` + `catchup` + `nba`:** extract the lesson, anti-pattern, and next gate; restart from a clean v0 when the foundation is wrong; run the build → QA → re0-memo → re0-work loop. When the owner's mental model has gone stale, `catchup` rebuilds it first from live state, not conversation memory: what needs them, what changed, what new words mean. Only then does `nba` read the live cycle and return the single next best action. Keep only what earned reuse.

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — a game-engine demo reached a full-stack, runnable state: API routes, a canvas runtime, a leaderboard, arcade pages, remix and telemetry panels, tests, screenshots. Separately, after a multi-hour autonomous realign plus a context compaction, the project's owner returned to coined terms, renamed docs, and a rebuilt pipeline, and asked what half the words even meant.
- **Result** — the demo was still the wrong product — the generated games were mock, one-screen, with no durable replay layer — while every pass ended in "what now?" against a pile of unmet gates; and an `nba`-style answer alone would have failed the owner, since the recommended action itself carried the unexplained coinage they'd have had to ask about.
- **So** — running and shipping-shaped is not done, and a correct next move is not a briefing: the cycle needs a skill to name the missing gate, one to reload the owner's map, and one to return the single next move — in that order.
</details>

## Credits

- **Built on** [mattpocock/skills](https://github.com/mattpocock/skills) (MIT) — its architecture and philosophy.
- **Not a fork** — these are [LilMGenius](https://github.com/LilMGenius)'s own, non-overlapping workflows.
- **Vendored verbatim** — a few shared building blocks, kept as-is with per-source attribution in [NOTICE](./NOTICE).
- **Authoring guide** — conventions and philosophy live in [CLAUDE.md](./CLAUDE.md).
