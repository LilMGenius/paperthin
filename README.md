<div align="center">

# Paperthin: Low-level agentic design patterns

<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/banner.svg" alt="Paperthin — Trust the artifact, not the author." width="820">

**Turning old engineering wisdom into reflexes your agent reaches for on its own.**

On **any** agent | Claude Code, Codex, OpenCode, Antigravity, Copilot, Cursor, Grok-Build, Pi, Hermes, OpenClaw, etc.

[Quickstart](#quickstart-15-seconds) · [The Map](#the-map) · [The Index](#the-index) · [The Problem](#the-problem) · [The Fixes](#the-fixes) · [Credits](#credits)

<sub>Read in: English · [中文](./assets/i18n/README.zh-CN.md) · [हिन्दी](./assets/i18n/README.hi.md) · [Español](./assets/i18n/README.es.md) · [العربية](./assets/i18n/README.ar.md) · [Português](./assets/i18n/README.pt.md) · [Русский](./assets/i18n/README.ru.md) · [日本語](./assets/i18n/README.ja.md) · [Français](./assets/i18n/README.fr.md) · [Deutsch](./assets/i18n/README.de.md) · [한국어](./assets/i18n/README.ko.md)</sub>

</div>

---

## Quickstart (15 seconds)

Pick **one route per agent**; installing two loads every skill twice.

1. **Claude Code**:
   ```bash
   claude plugin marketplace add LilMGenius/paperthin && claude plugin install paperthin@paperthin
   ```
   Then, in Claude Code, run `/plugin`, open **Marketplaces**, select `paperthin` and choose **Enable auto-update**, once.
2. **Codex**: it updates itself at every session start.
   ```bash
   codex plugin marketplace add LilMGenius/paperthin && codex plugin add paperthin@paperthin
   ```
3. **Every other agent**: one line installs the skills and a daily update.
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*' && node "$HOME/.agents/skills/re0-upgrade/scripts/schedule/schedule.mjs" install
   ```
4. **Use them**: call any skill by name, like `/re0`. Many also start on their own when the work calls for them.

**Installed it before?** Run `/re0-upgrade` once in a fresh session.

**Not sure?** Tell your agent `install https://github.com/LilMGenius/paperthin` and it follows the [setup steps](./.agents/install-block.md#handed-only-this-repository) on its own.

**On ChatGPT or Claude on the web?** Give it `https://raw.githubusercontent.com/LilMGenius/paperthin/main/llms-full.txt`.

## The Map

**How many artifacts, and across how much time?**

<div align="center">
<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/map.svg" alt="The Paperthin map by LilMGenius/paperthin, a two-by-two matrix. Horizontal axis cardinality (one, then many); vertical axis time (now, then across iterations); four regions. Top-left, depth: one artifact, now; is this one thing clean and true? Top-right, breadth: many artifacts, now; is one truth consistent everywhere? Bottom-left, coil: one project, across iterations; did each pass teach the next? Bottom-right, mesh: many minds, across rounds; does the crowd converge on truth?" width="820">
</div>

## The Index

### `depth/`

| Skill | What it does | Scope | Invoker | Read-only |
|---|---|---|---|---|
| ♻️ **[re0](./skills/depth/re0/SKILL.md)** | Rewrites a messy, much-patched document or file as a clean first version instead of patching it again | one artifact | model | |
| 🧭 **[readback](./skills/depth/readback/SKILL.md)** | Checks it understood your request before working, and asks only when two readings really differ | one instruction | model | ✔ |
| 🏹 **[aim](./skills/depth/aim/SKILL.md)** | Reads the files or text you hand over and suggests what you likely want, so you only confirm | one data drop | model | ✔ |
| 📏 **[modelchk](./skills/depth/modelchk/SKILL.md)** | Picks the cheapest model tier and thinking effort that still do the job well | one task | model | ✔ |
| 🧹 **[elon](./skills/depth/elon/SKILL.md)** | Suggests dropping requirements kept only out of habit, with where each came from; never touches rules set from outside | a set of not-yet-built requirements with their sources | model | ✔ |
| 🧩 **[scopechk](./skills/depth/scopechk/SKILL.md)** | Checks, by the target's own written scope, whether a new piece belongs where you want to put it, and names a better home if not | one item and the target it would join | model | ✔ |
| 😈 **[hate](./skills/depth/hate/SKILL.md)** | Plays the hostile critic: the one objection that could sink your plan, and the cheapest test to settle it | one plan | user | |
| 🧠 **[macrothink](./skills/depth/macrothink/SKILL.md)** | Asks several fresh minds the question without your framing and shows first where they disagree | one direction | user | ✔ |
| 🔀 **[crossthink](./skills/depth/crossthink/SKILL.md)** | When every option looks alike, borrows working ideas from five or more unrelated fields and keeps only the new ones | one stuck problem | model | ✔ |
| ⚖️ **[re0-decide](./skills/depth/re0-decide/SKILL.md)** | Turns the material behind a decision into a checklist whose verdict comes from your own answers; it never picks for you | material submitted for a decision | user | ✔ |
| 🧐 **[whychk](./skills/depth/whychk/SKILL.md)** | Questions a decision you just made until you can explain it, or shows where the reasoning has a hole | one decision | user | ✔ |
| 🛣️ **[autobahn](./skills/depth/autobahn/SKILL.md)** | Sets the risky parts of a task aside first with safer alternatives, runs the rest at full speed, and logs what was left out | one task | model | |
| 🎨 **[re0-style](./skills/depth/re0-style/SKILL.md)** | Fixes code to match the project's own style, and asks where the project itself does it two ways | one change under review | model | |
| 🧰 **[detool](./skills/depth/detool/SKILL.md)** | Replaces brand and tool names in lasting docs with what they actually do, so the docs outlive the tools | one durable artifact | model | |
| 🗜️ **[debloat](./skills/depth/debloat/SKILL.md)** | Trims bloated writing or code down to what carries weight, without losing a rule or a behavior | one artifact, prose or code | model | |
| 🔃 **[re0-order](./skills/depth/re0-order/SKILL.md)** | Puts a jumbled list back in a sensible order under one stated rule; it moves items and rewords nothing | one listing | model | |
| ✂️ **[dedash](./skills/depth/dedash/SKILL.md)** | Removes the long dashes an agent sprinkles into sentences, and keeps hyphens, ranges and label dashes | your prose | user | |
| ⸱ **[dedot](./skills/depth/dedot/SKILL.md)** | In Korean text, suggests a comma or a linking word, with a reason, for each middle dot that joins a list | Korean prose or label rows the writer scopes | user | ✔ |
| 🚿 **[shower](./skills/depth/shower/SKILL.md)** | Hands your work to a fresh reader with no background and asks whether it makes sense on its own | one artifact | model | ✔ |
| 🔬 **[factchk](./skills/depth/factchk/SKILL.md)** | Checks claims against real sources both ways: the absurd may be true, and the obvious may be false | one claim | model | |
| 🧪 **[mandela](./skills/depth/mandela/SKILL.md)** | Checks whether a test or metric is grading itself, or whether real outside truth decides the result | one eval | model | ✔ |
| 🎭 **[demock](./skills/depth/demock/SKILL.md)** | Finds fakes and silent fallbacks in live code that make a success report false, and suggests the real fix | a named file set, directory or diff | model | |
| 🥸 **[deid](./skills/depth/deid/SKILL.md)** | Finds one person's or company's data in shared files, replaces it with the role it plays, and lists the old commits that still hold it | one named artifact and one owner | model | |
| 🥄 **[sip](./skills/depth/sip/SKILL.md)** | Right after any change, before you call it done, runs paperthin's own checks on your output | your output | model | |
| 🧾 **[re0-git](./skills/depth/re0-git/SKILL.md)** | Rewrites a finished commit's message with its dates and place kept, so the git history alone lets anyone take over | one commit | user | |
| 🧨 **[re0-squash](./skills/depth/re0-squash/SKILL.md)** | Republishes a GitHub repository as one signed commit with the same files, leaving no old commit reachable | one repository | user | |
| 🚀 **[re0-release](./skills/depth/re0-release/SKILL.md)** | Runs the release checklist, then tags and publishes once you confirm | one release | user | |
| 🤝 **[re0-merge](./skills/depth/re0-merge/SKILL.md)** | Reviews and lands someone else's contribution, keeps their credit, and explains any change made to it | one contribution | user | |

### `breadth/`

| Skill | What it does | Scope | Invoker | Read-only |
|---|---|---|---|---|
| 🧲 **[ssotize](./skills/breadth/ssotize/SKILL.md)** | Finds a fact copied in many places, gives it one home once you approve, and points the rest there | one fact, many places | model | |
| 🔗 **[ssotize-local](./skills/breadth/ssotize-local/SKILL.md)** | Merges duplicate files or folders into one real copy the others link to, with a tested way back | same bytes, many paths | model | |
| 📖 **[re0-readme](./skills/breadth/re0-readme/SKILL.md)** | Sorts a README and its AGENTS.md so each line sits in the file whose reader needs it | one repository README and AGENTS.md | model | |
| 📥 **[re0-import](./skills/breadth/re0-import/SKILL.md)** | Files handed-over material into the right page of an existing knowledge base, by that base's own rules, and reports what has no home | handed-over material and one knowledge base | user | |
| 🆙 **[re0-upgrade](./skills/breadth/re0-upgrade/SKILL.md)** | Brings your install up to the full current catalog in one confirmed step: retires renamed skills and adds new ones | your skill install | user | |

### `coil/`

| Skill | What it does | Scope | Invoker | Read-only |
|---|---|---|---|---|
| 🗂️ **[re0-plan](./skills/coil/re0-plan/SKILL.md)** | Before a new work cycle starts, opens its folder with the design, workflow and evidence files | one new cycle | user | |
| 🌀 **[re0-loop](./skills/coil/re0-loop/SKILL.md)** | Keeps a build, test, learn and restart cycle running, so lessons pile up instead of code | the whole loop | model | |
| 👁️ **[re0-watch](./skills/coil/re0-watch/SKILL.md)** | Watches a long agent job for stalls and alerts you; any fix is only a proposal you approve | one running job | user | |
| 📝 **[re0-memo](./skills/coil/re0-memo/SKILL.md)** | Pulls the lessons, and the mistakes to avoid, out of a finished or failed cycle | one finished cycle | model | |
| 🔁 **[backprop](./skills/coil/backprop/SKILL.md)** | Takes what a correction taught and fixes the docs and rules that caused it, then tidies them up | one lesson | model | |
| 🧱 **[re0-work](./skills/coil/re0-work/SKILL.md)** | Starts over from scratch, keeping only the lessons that proved worth reusing | one restart | model | |
| 🗺️ **[catchup](./skills/coil/catchup/SKILL.md)** | Catches you up after time away: what needs you, what changed, and what new terms mean | one re-entry | model | ✔ |
| 🎯 **[nba](./skills/coil/nba/SKILL.md)** | Reads where the work stands and names the one best next step, not a menu | the live cycle | model | ✔ |
| 🪜 **[re0-workflow](./skills/coil/re0-workflow/SKILL.md)** | For one goal, picks which skills to run in which order, shows you, then runs them and stops where you must act | one stated intent | model | |
| 🚪 **[paperthin](./skills/coil/paperthin/SKILL.md)** | The one command to remember: say what you want, and re0-workflow picks and runs the skills | one request | user | |
| 🎓 **[re0-tutorial](./skills/coil/re0-tutorial/SKILL.md)** | Teaches one skill in three graded levels, each passed on work you submit yourself | one skill | user | |

### `mesh/`

| Skill | What it does | Scope | Invoker | Read-only |
|---|---|---|---|---|
| 🕸️ **[multithink](./skills/mesh/multithink/SKILL.md)** | Weighs several independent opinions by the evidence they cite, never by how many agree | many reads of one artifact or question | user | ✔ |

*More on invocation: [.agents/invocation.md](./.agents/invocation.md)*

## The Problem

**Most agent skills are slop.**

Point an agent at a goal and it **adds**: more files, more options, more "helpful" boilerplate. Adding looks like progress, and nothing ever makes it go back and delete.

> [!WARNING]
> Repeat that across a project and you get the familiar AI-generated toolkit: near-duplicate skills, dead settings, a README that says the same thing three times. Plausible, busy, and quietly unmaintainable.

These skills bet the other way: **every one of them removes something**, and [the Index](#the-index) says what.

> [!TIP]
> The hard part isn't adding features; it's restraint. A pass that finds nothing to improve changes nothing. **That restraint is the product.**

## The Fixes

<!-- Fixes lead with re0, the founding thesis every other fix serves, then follow the lifecycle of a piece of work: understand the ask, challenge the approach, carve unsafe scope, clean the artifact, check truth, then keep the loop learning. Slot any new fix by where it acts in that arc. -->

**Each is a well-worn principle, made automatic.**

### #1 — Artifacts rot
Edit a doc one piece at a time across a session and it bloats: stale deltas, duplicated noise, changelog scars. Patching on top just preserves the rot.

**The fix → `re0`:** rewrite the artifact as a clean v0, as if it were the first version.

> *Prior art: the Boy Scout Rule: "leave it cleaner than you found it" (Robert C. Martin, [Clean Code](https://www.informit.com/articles/article.aspx?p=1235624&seqNum=6), 2008). `re0` goes further: rewrite, don't just tidy.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — we asked `re0` to refresh these docs once more, but they were already at v0.
- **Result** — it found nothing to improve and left every line of prose untouched.
- **So** — a tool that does nothing when nothing is wrong never bloats your repo.
</details>

### #2 — You can build the wrong request perfectly
A long or bundled instruction has enough surface area for a subtle misread: the agent starts work, stays coherent, and only later proves it optimized the wrong target.

**The fix → `readback`:** restate the instruction internally, cross-check it against available context, proceed silently when the read is resolved, and ask only when one real fork survives.

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — a project's opening stage grew from 13 steps to 143, but the pass bar written for the 13-step version still applied.
- **Result** — three difficulty tables were already raised to meet that old bar when `readback` caught that the opening stage was now the tutorial. Reverted before it shipped.
- **So** — the expensive misread is the instruction you read correctly, before its scope moved.
</details>

### #3 — Sizing the run becomes guesswork
Some work is run with too much horsepower because "stronger" feels safer; some is run too cheaply until the failure costs more than the saved tokens. The same guessing hits the reasoning-effort dial: max it on everything and burn tokens, or skim a task that needed real deliberation. All of it is guessing wearing operational clothing.

**The fix → `modelchk`:** from one risk read, recommend two coordinates: the cheapest sufficient capability tier (`fast`, `standard`, `frontier`) and the reasoning effort within it (`glance` to `exhaustive`), each on a neutral scale. It also names the task domain (`coding`, `agentic`, `reasoning`, `writing`, `knowledge`, `general`) the tier is measured in, since models of one price class differ by domain. It advises; it never routes, pins, or names a concrete model or level.

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — we sized four jobs against it: an over-powered review, cheap mechanical edits, a request naming one vendor's model, and a release step where being wrong was expensive.
- **Result** — it answered in neutral tiers (fast, standard, frontier) plus an effort dial, and refused to route the job or name a brand on either.
- **So** — the recommendation still holds after you change vendors.
</details>

### #4 — You can't kill your own plan
You built it, so you defend it. The questions that would break it are exactly the ones you won't ask.

**The fix → `hate`:** refuse to be nice to the plan and return the one load-bearing objection that could kill it and the cheapest experiment that would prove it matters. User-invoked: you point it at a plan deliberately.

> *Prior art: [egoless programming](https://en.wikipedia.org/wiki/Egoless_programming) (Weinberg, 1971; the same root `shower` cites), hostile review, and fail-fast.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — every research pass closed with an adversarial critic returning one root cause and the cheapest test that would settle it.
- **Result** — it killed a recombination engine with "one more box drawn, not a sharper tip", and a human-holdout protocol on the numbers alone: n≈24 where 36 was needed, a 34% family-wise error rate, a design citing a principle while implementing its opposite.
- **So** — the objection that mattered was always singular and cheap to test.
</details>

### #5 — One framing becomes the whole world
Examples, names, and first plausible answers can trap a session before the plan even looks risky. A single agent may keep improving the inherited frame instead of noticing a different read.

**The fix → `macrothink`:** user-invoke a read-only fan-out: strip the session's bait, ask 2 to 5 fresh reads for the underlying problem, and report divergence first. Same-model convergence is reassurance only, never proof.

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — an agent proposed deleting a 762-line file of old lessons, claiming the surviving docs already covered it.
- **Result** — fresh reads, given the question without that framing, asked how coverage was checked: by matching section titles, eight of thirty-nine. An audit found five lessons missing and ten half covered, and the file was restored.
- **So** — a second opinion is only worth having if it reaches the problem clean.
</details>

### #6 — Risk-adjacent work comes back hedged
Point an agent at a task that brushes guardrails (scraping, licensing, privacy, security) and you get the worst of both worlds: the risky sliver triggers refusals and retries, while the safe 90% comes back hedged, diluted, or quietly missing.

**The fix → `autobahn`:** carve guardrail-adjacent items out of scope before execution, each with a safe alternative and an archive entry; run the remaining scope at full strength in a fresh subagent that only ever sees the carved prompt, not the risky input; ship a descope ledger so every exclusion is a visible decision, not a silent gap. It removes the ask rather than slipping it past. The autobahn has no speed limit *because* entry discipline is strict.

> *Prior art, from this very summer: the US [suspended Fable 5 and Mythos 5](https://www.anthropic.com/news/fable-mythos-access) over one jailbroken safeguard (Anthropic, 2026), and OpenAI shipped [GPT-5.6](https://openai.com/index/previewing-gpt-5-6-sol/) safety-stack-first to trusted partners (OpenAI, 2026). At the frontier, the fast lane stays open only as far as entry discipline holds.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — the method came from a live rewrite of a confidential strategy doc, risk-adjacent on four axes at once: stealth tooling, trademarked names, privacy-adjacent profiling, scraping gray zones.
- **Result** — a main loop plus ten subagents ran end to end with zero flags, zero refusals, zero fallbacks, and every descoped item's safe alternative was the better product anyway.
- **So** — the main loop carved, clean subagents ran the safe scope, and the carve is why they could floor it.
</details>

### #7 — Portable docs smuggle their toolchain
A durable artifact says it should work across agents, hosts, and time, but its prose quietly depends on one vendor, model, CLI, path, quota, or UI. Portability dies by nouns.

**The fix → `detool`:** classify the text by role first, then replace incidental stack coupling in portable content with the mechanism it meant, while leaving provenance, runbooks, and tool-subject claims concrete.

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — we pointed it at four kinds of text: a durable guide, a record of what happened on one machine, a runbook, and a claim about one named tool.
- **Result** — only the durable guide lost its vendor nouns. The record kept its paths, the runbook its commands, the claim its tool.
- **So** — portability is knowing which sentences were about the tool.
</details>

### #8 — You go blind to your own work
After a long session you're the one person who *can't* read your own work straight: you know too much, so your brain quietly fills every gap and the holes turn invisible.

**The fix → `shower`:** hand a stranger who never saw your session only the artifact, and ask "does this actually make sense?"

> *Prior art: [egoless programming](https://en.wikipedia.org/wiki/Egoless_programming): you can't review your own work objectively; someone else must (Gerald Weinberg, 1971). Here, that someone is a context-free sub-session.*

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
A timeout value, a decision, a status, copied into a README, a doc, a ticket, and a Slack thread. The copies drift, and now no one knows which is true.

**The fix → `ssotize`:** find the scatter, name the canonical source, ask approval for the mutation plan, then consolidate and point the rest at it.

> *Prior art: [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself): one fact, one authoritative home (Hunt & Thomas, The Pragmatic Programmer, 1999).*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — five releases of one tool each carried the same four-bullet list of known fixes, copied forward every time.
- **Result** — before pointing them at one shared page, the pass found that page missing two of those fixes, and found the release checklist that had been ordering the copy every time.
- **So** — copies come back unless the destination is complete and the rule that spawned them is gone.
</details>

### #10 — A list's order stops meaning anything
Items get appended where they were typed, not where they belong. Kin drift apart, the sequence follows no axis a reader can feel, and an order that was information now says nothing.

**The fix → `re0-order`:** realign the listing under one nameable principle, moving items only, with nothing reworded, added, or removed.

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — this suite's own catalog listed skills in ship order, across the Index and its ten translations.
- **Result** — `re0-order` resequenced all eleven copies by the work each skill serves, moving entries only, and the drift-guards stayed green because not one name changed.
- **So** — a reader can name the ordering principle without being told it.
</details>

### #11 — Your gut isn't a source
"Plausible," "absurd," "novel": the least reliable line in any artifact. Human priors fail **both ways**: they exclude the real (desert frogs exist) and normalize the impossible (weightless crates).

**The fix → `factchk`:** verify any reality-grounded claim against external sources, in both directions, before it ships, and flag rather than guess when you can't reach one.

> *Prior art: [WEIRD bias](https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/abs/weirdest-people-in-the-world/BF84F7517D56AFF7B7EB58411A554C17) (Henrich, Heine & Norenzayan, 2010) and the [naive-physics / impetus error](https://www.science.org/doi/10.1126/science.210.4474.1139) (McCloskey, Caramazza & Green, 1980): intuition misjudges reality in both directions.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — we ran `factchk` on its own shipped citations, in both directions.
- **Result** — all held, and it still caught two attribution slips to fix: the famous "what's measured becomes the target" wording is Strathern (1997), not Goodhart; and "McCloskey 1980" is the co-authored *Science* paper, not the 1983 *Scientific American* piece.
- **So** — a fact-checker that audits its own footnotes will audit yours.
</details>

### #12 — The eval confirms itself
A model, a scorer, and a designer can all agree a result is real while no outside ground-truth ever entered the loop: a whole room confidently remembering something that never independently happened.

**The fix → `mandela`:** audit any eval, metric, or experiment against an 8-pattern leakage taxonomy. Does external ground-truth enter independently, or is the verifier the designer?

> *Prior art: [Goodhart's law](https://en.wikipedia.org/wiki/Goodhart%27s_law), [data leakage](https://dl.acm.org/doi/10.1145/2382577.2382579) (Kaufman et al., 2012), and [circular analysis](https://www.nature.com/articles/nn.2303), or "double dipping" (Kriegeskorte et al., 2009).*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — the audit came from one research design that kept dying to the same failure: a scorer, a model, and a designer agreeing on a result no outside truth produced.
- **Result** — leakage surfaced in eight distinct shapes in that one project: a scorer grading buckets it had drawn, two components verifying each other in a shared space, a private recipe making the verifier the designer. That catalog became the 8-pattern taxonomy.
- **So** — the checklist isn't theoretical: every pattern in it already drew blood once.
</details>

### #13 — "Remember to verify" never fires
A guideline buried in docs won't trigger in a brand-new session, exactly when author bias is highest.

**The fix → `sip`:** the moment you finish something, it runs the clean checks (`shower`, `ssotize`, `re0`) on your output, the true ones (`factchk`, `mandela`) when there's a claim or an eval, and `detool` when the output claims to be portable.

> *Prior art: [dogfooding](https://en.wikipedia.org/wiki/Eating_your_own_dog_food): eat your own dog food (Microsoft, 1988). Taste your own cooking before you serve it.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — right after a large refactor that made every skill self-contained, `sip` auto-fired on the result.
- **Result** — it caught two things the author could no longer see: a maintenance rule pointing at skill-to-skill links the same refactor had deleted, and a file-editing safety rule in two skills but missing from a third that also edits files.
- **So** — the check bites hardest on the drift a big change leaves behind.
</details>

### #14 — Your session doesn't travel; the git log does
Your session is stuck where it ran: this agent, this account, this machine. A teammate or another agent can't load the context your work happened in.

**The fix → `re0-git`:** clean a finished commit's message so `git log`, the one thing every environment shares, carries the handoff, and anyone picks up from the log alone.

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — `re0-git`'s very first target was its own release commit.
- **Result** — dogfooding it surfaced two faults, both fixed:
  - a message padded with trivia,
  - a spec that preached "no redundancy" while repeating itself.
- **So** — its first cleanup was after itself.
</details>

### #15 — Long cycles lose the build, and the builder
Long agentic cycles produce many working parts (panels, routes, tests, screenshots) that prove activity more than value, and the sunk cost tempts you to carry the architecture forward. The same cycles coin vocabulary, rename files, and make calls faster than the human owner can follow, so even a correct next action arrives unreadable: phrased in words invented while they were away.

**The fix → `re0-memo` + `re0-work` + `re0-loop` + `catchup` + `nba`:** extract the lesson, anti-pattern, and next gate; restart from a clean v0 when the foundation is wrong; run the build → QA → re0-memo → re0-work loop. When the owner's mental model has gone stale, `catchup` rebuilds it first from live state, not conversation memory: what needs them, what changed, what new words mean. Only then does `nba` read the live cycle and return the single next best action. Keep only what earned reuse.

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** — a demo reached the point where everything ran: pages, tests, screenshots, a path end to end. Separately, after hours of autonomous work, the owner came back to renamed files and invented vocabulary.
- **Result** — the demo was still the wrong product: what it generated was shallow, with no way to replay a session, and every pass ended in "what now?" against unmet gates. A bare next move would have failed the owner too, phrased in the words they had missed.
- **So** — running is not done. The cycle needs one skill to name the missing gate, one to rebuild the owner's map, and one to pick the move.
</details>

## Credits

- **Built on** [mattpocock/skills](https://github.com/mattpocock/skills) (MIT): its architecture and philosophy.
- **Not a fork** — these are [LilMGenius](https://github.com/LilMGenius)'s own, non-overlapping workflows.
- **Vendored verbatim** — a few shared building blocks, kept as-is with per-source attribution in [NOTICE](./NOTICE).
- **Authoring guide** — conventions and philosophy live in [AGENTS.md](./AGENTS.md).
