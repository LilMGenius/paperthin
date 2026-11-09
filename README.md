<div align="center">

# Paperthin: low-level agentic design patterns

<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/banner.svg" alt="Paperthin: low-level agentic design patterns" width="820">

The skillbook for recursive self-improvement (**RSI**).<br>**NVIDIA**'s latest proof, unpacked with timeless engineering.<br>Distilled from the **OpenAI** harness engineering hackathon winner's zero-touch method.

On **any** agent | Codex, Claude Code, OpenCode, Cursor, Grok Build, Grok Bot, Muse, Pi, etc.

*"Best part is no part."* Elon Musk[^musk]

**Built by [Bran Lee](https://github.com/LilMGenius)**<br>2026: **OpenAI** harness engineering hackathon (Ralphthon Seoul #2, held simultaneously in Seoul and SF), *1st place*, the only solo team against big-tech and top-university PhD teams<br>2026: **Claude Code** official meetup invited speaker, *twice*<br>2026: **Google DeepMind** AI hackathon invited *judge*<br>2014: Korea Olympiad in Informatics (KOI) national contest, *silver award*<br>2009~: coding since age *9*

[Quickstart](#quickstart-30-seconds) · [The Map](#the-map) · [The Index](#the-index) · [The Problem](#the-problem) · [The Proof](#the-proof) · [Credits](#credits)

<sub>Read in: English · [中文](./assets/i18n/README.zh-CN.md) · [हिन्दी](./assets/i18n/README.hi.md) · [Español](./assets/i18n/README.es.md) · [العربية](./assets/i18n/README.ar.md) · [Português](./assets/i18n/README.pt.md) · [Русский](./assets/i18n/README.ru.md) · [日本語](./assets/i18n/README.ja.md) · [Français](./assets/i18n/README.fr.md) · [Deutsch](./assets/i18n/README.de.md) · [한국어](./assets/i18n/README.ko.md)</sub>

</div>

---

## Quickstart (30 seconds)

Pick **one route per agent**; installing two loads every skill twice.

1. **Codex**: it updates itself at every session start.
   ```bash
   codex plugin marketplace add LilMGenius/paperthin && codex plugin add paperthin@paperthin
   ```
2. **Claude Code**:
   ```bash
   claude plugin marketplace add LilMGenius/paperthin && claude plugin install paperthin@paperthin
   ```
   Then, in Claude Code, run `/plugin`, open **Marketplaces**, select `paperthin` and choose **Enable auto-update**, once.
3. **Every other agent**: one line installs the skills and a daily update.
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*' && node "$HOME/.agents/skills/re0-upgrade/scripts/schedule/schedule.mjs" install
   ```
4. **Use it**: type `/paperthin`, then your dream. That's it. Want the mechanism? Relax, there's `/re0-tutorial`.
5. **Paid in stars**: if it helped, the fee is one [GitHub star](https://github.com/LilMGenius/paperthin). Cheap, I know.

**Installed it before?** Run `/re0-upgrade` once in a fresh session.

**Not sure?** Tell your agent [`install https://github.com/LilMGenius/paperthin`](./.agents/install-block.md#handed-only-this-repository). A web chat takes [llms-full.txt](https://raw.githubusercontent.com/LilMGenius/paperthin/main/llms-full.txt).

## The Map

**How many artifacts, and across how much time?**

<div align="center">
<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/map.svg" alt="The Paperthin map by LilMGenius/paperthin, a two-by-two matrix. Horizontal axis cardinality (one, then many); vertical axis time (now, then across iterations); four regions. Top-left, depth: one artifact, now; is this one thing clean and true? Top-right, breadth: many artifacts, now; is one truth consistent everywhere? Bottom-left, coil: one project, across iterations; did each pass teach the next? Bottom-right, mesh: many minds, across rounds; does the crowd converge on truth?" width="820">
</div>

## The Index

### `depth/`

| Skill | What it does | Invoker | Read-only |
|---|---|---|---|
| ♻️ **[re0](./skills/depth/re0/SKILL.md)** | Rewrites a messy, much-patched document or file as a clean first version instead of patching it again | model | |
| 🗜️ **[debloat](./skills/depth/debloat/SKILL.md)** | Trims bloated writing or code down to what carries weight, without losing a rule or a behavior | model | |
| 🔃 **[re0-order](./skills/depth/re0-order/SKILL.md)** | Puts a jumbled list back in a sensible order under one stated rule; it moves items and rewords nothing | model | |
| 🧰 **[detool](./skills/depth/detool/SKILL.md)** | Replaces brand and tool names in lasting docs with what they actually do, so the docs outlive the tools | model | |
| 🎨 **[re0-style](./skills/depth/re0-style/SKILL.md)** | Fixes code to match the project's own style, and asks where the project itself does it two ways | model | |
| ✂️ **[dedash](./skills/depth/dedash/SKILL.md)** | Removes the long dashes an agent sprinkles into sentences, and keeps hyphens, ranges and label dashes | user | |
| ⸱ **[dedot](./skills/depth/dedot/SKILL.md)** | In Korean text, suggests a comma or a linking word, with a reason, for each middle dot that joins a list | user | ✔ |
| 🧭 **[readback](./skills/depth/readback/SKILL.md)** | Checks it understood your request before working, and asks only when two readings really differ | model | ✔ |
| 🏹 **[aim](./skills/depth/aim/SKILL.md)** | Reads the files or text you hand over and suggests what you likely want, so you only confirm | model | ✔ |
| 📏 **[modelchk](./skills/depth/modelchk/SKILL.md)** | Picks the cheapest model tier and thinking effort that still do the job well | model | ✔ |
| 🧹 **[elon](./skills/depth/elon/SKILL.md)** | Suggests dropping or deferring requirements and commitments kept only out of habit, with where each came from; never touches rules set from outside | model | ✔ |
| 🧩 **[scopechk](./skills/depth/scopechk/SKILL.md)** | Checks, by the target's own written scope, whether a new piece belongs where you want to put it, and names a better home if not | model | ✔ |
| 😈 **[hate](./skills/depth/hate/SKILL.md)** | Plays the hostile critic: the one objection that could sink your plan, and the cheapest test to settle it | user | |
| 🧠 **[macrothink](./skills/depth/macrothink/SKILL.md)** | Asks several fresh minds the question without your framing and shows first where they disagree | user | ✔ |
| 🔀 **[crossthink](./skills/depth/crossthink/SKILL.md)** | When every option looks alike, borrows working ideas from five or more unrelated fields and keeps only the new ones | model | ✔ |
| ⚖️ **[re0-decide](./skills/depth/re0-decide/SKILL.md)** | Turns the material behind a decision into a checklist whose verdict comes from your own answers; it never picks for you | user | ✔ |
| 🧐 **[whychk](./skills/depth/whychk/SKILL.md)** | Questions a decision you just made until you can explain it, or shows where the reasoning has a hole | user | ✔ |
| 🛣️ **[autobahn](./skills/depth/autobahn/SKILL.md)** | Sets the risky parts of a task aside first with safer alternatives, runs the rest at full speed, and logs what was left out | model | |
| 🥄 **[sip](./skills/depth/sip/SKILL.md)** | Right after any change, before you call it done, runs paperthin's own checks on your output | model | |
| 🚿 **[shower](./skills/depth/shower/SKILL.md)** | Hands your work to a fresh reader with no background and asks whether it makes sense on its own | model | ✔ |
| 🔬 **[factchk](./skills/depth/factchk/SKILL.md)** | Checks claims against real sources both ways: the absurd may be true, and the obvious may be false | model | |
| 🧪 **[mandela](./skills/depth/mandela/SKILL.md)** | Checks whether a test or metric is grading itself, or whether real outside truth decides the result | model | ✔ |
| 🎭 **[demock](./skills/depth/demock/SKILL.md)** | Finds fakes and silent fallbacks in live code that make a success report false, and suggests the real fix | model | |
| 🥸 **[deid](./skills/depth/deid/SKILL.md)** | Finds one person's or company's data in shared files, replaces it with the role it plays, and lists the old commits that still hold it | model | |
| 🧾 **[re0-git](./skills/depth/re0-git/SKILL.md)** | Rewrites a finished commit's message with its dates and place kept, so the git history alone lets anyone take over | user | |
| 🚀 **[re0-release](./skills/depth/re0-release/SKILL.md)** | Runs the release checklist, then tags and publishes once you confirm | user | |
| 🤝 **[re0-merge](./skills/depth/re0-merge/SKILL.md)** | Reviews and lands someone else's contribution, keeps their credit, and explains any change made to it | user | |
| 🧨 **[re0-squash](./skills/depth/re0-squash/SKILL.md)** | Republishes a GitHub repository as one signed commit with the same files, leaving no old commit reachable | user | |

### `breadth/`

| Skill | What it does | Invoker | Read-only |
|---|---|---|---|
| 🧲 **[ssotize](./skills/breadth/ssotize/SKILL.md)** | Finds a fact copied in many places, gives it one home once you approve, and points the rest there | model | |
| 🔗 **[ssotize-local](./skills/breadth/ssotize-local/SKILL.md)** | Merges duplicate files or folders into one real copy the others link to, with a tested way back | model | |
| 📖 **[re0-readme](./skills/breadth/re0-readme/SKILL.md)** | Sorts a README and its AGENTS.md so each line sits in the file whose reader needs it | model | |
| 📥 **[re0-import](./skills/breadth/re0-import/SKILL.md)** | Files handed-over material into the right page of an existing knowledge base, by that base's own rules, and reports what has no home | user | |
| 🆙 **[re0-upgrade](./skills/breadth/re0-upgrade/SKILL.md)** | Brings your install up to the full current catalog in one confirmed step: retires renamed skills and adds new ones | user | |

### `coil/`

| Skill | What it does | Invoker | Read-only |
|---|---|---|---|
| 🚪 **[paperthin](./skills/coil/paperthin/SKILL.md)** | The one command to remember: type your dream after it | user | |
| 🪜 **[re0-workflow](./skills/coil/re0-workflow/SKILL.md)** | For one goal, picks which skills to run in which order, shows you, then runs them and stops where you must act | model | |
| 📝 **[re0-memo](./skills/coil/re0-memo/SKILL.md)** | Pulls the lessons, and the mistakes to avoid, out of a finished or failed cycle | model | |
| 🔁 **[backprop](./skills/coil/backprop/SKILL.md)** | Takes what a correction taught and fixes the docs and rules that caused it, then tidies them up | model | |
| 🧱 **[re0-work](./skills/coil/re0-work/SKILL.md)** | Starts over from scratch, keeping only the lessons that proved worth reusing | model | |
| 🗺️ **[catchup](./skills/coil/catchup/SKILL.md)** | Catches you up after time away: what needs you, what changed, and what new terms mean | model | ✔ |
| 🎯 **[nba](./skills/coil/nba/SKILL.md)** | Reads where the work stands and names the one best next step, not a menu | model | ✔ |
| 🗂️ **[re0-plan](./skills/coil/re0-plan/SKILL.md)** | Before a new work cycle starts, opens its folder with the design, workflow and evidence files | user | |
| 🌀 **[re0-loop](./skills/coil/re0-loop/SKILL.md)** | Keeps a build, test, learn and restart cycle running, so lessons pile up instead of code | model | |
| 👁️ **[re0-watch](./skills/coil/re0-watch/SKILL.md)** | Watches a long agent job for stalls and alerts you; any fix is only a proposal you approve | user | |
| 🎓 **[re0-tutorial](./skills/coil/re0-tutorial/SKILL.md)** | Teaches one skill in three graded levels, each passed on work you submit yourself | user | |

### `mesh/`

| Skill | What it does | Invoker | Read-only |
|---|---|---|---|
| 🕸️ **[multithink](./skills/mesh/multithink/SKILL.md)** | Weighs several independent opinions by the evidence they cite, never by how many agree | user | ✔ |

*More on invocation: [.agents/invocation.md](./.agents/invocation.md)*

## The Problem

**Most agent skills are slop.**

Point an agent at a goal and it **adds**: more files, more options, more "helpful" boilerplate. Adding looks like progress, and nothing ever makes it go back and delete.

> [!WARNING]
> Repeat that across a project and you get the familiar AI-generated toolkit: near-duplicate skills, dead settings, a markdown that says the same thing three times. Plausible, busy, and quietly unmaintainable.

These skills bet the other way: **every one of them removes something**, and [the Index](#the-index) says what.

> [!TIP]
> The hard part isn't adding features; it's restraint. A pass that finds nothing to improve changes nothing. **That restraint is the product.**

## The Proof

**NVIDIA measured it: an agent that drops its long history and works from a short note keeps its score.**

| What NVIDIA measured | Long context | Short note |
|---|---|---|
| SWE-bench Verified, Claude Opus 4.5 | 70.0 | 70.2 |
| Largest context the run needed | 200K tokens | 16K tokens |
| Open-weight serving throughput, H100 | 256K window | up to 7x higher at 16K |

<sub>Belcak et al. (NVIDIA), [You don't need long context](https://arxiv.org/abs/2611.05306), arXiv 2611.05306, 2026-11-03. Rows one and two are Table 2, Opus 4.5 acting one step at a time on a state note; row three is Figure 1 (GLM 5.2 3.6x, Kimi K2.6 5.6x, Qwen 3 Coder Next 7x).</sub>

**Where each finding lands in Paperthin:**

| The paper found | Skills that act on it |
|---|---|
| Long work needs no long context: when the conversation fills, write a note and go on in a fresh one | `re0-work` restarts from v0 with only proven lessons, `re0-git` leaves the handoff in the git log for the next session |
| A good note keeps the task close to its original words | `re0-loop` keeps every open request on the list when the session compacts or starts fresh |
| A good note keeps what is being done, why, and what comes next | `re0-memo` turns a finished cycle into the next one's gate, `nba` names the one next step |
| A good note keeps the plan, the done conditions and where things are | `re0-plan` opens the cycle with its design, workflow and evidence files, `re0-workflow` writes the skill order down |
| One action at a time on a state note keeps the full-history score | `shower` hands the note alone to a reader with no history and asks whether it stands on its own |
| A smaller window serves up to 7x faster | `elon` drops what is kept only by habit, `debloat` cuts to what carries weight, `re0` rewrites instead of piling on |

## Credits

- **Built on** [mattpocock/skills](https://github.com/mattpocock/skills) (MIT): its architecture and philosophy.
- **Not a fork** — these are [LilMGenius](https://github.com/LilMGenius)'s own, non-overlapping workflows.
- **Vendored verbatim** — a few shared building blocks, kept as-is with per-source attribution in [NOTICE](./NOTICE).
- **Authoring guide** — conventions and philosophy live in [AGENTS.md](./AGENTS.md).

[^musk]: Elon Musk, [reply on X](https://x.com/elonmusk/status/2103537444910248312), 2026-09-25, to @Erdayastronaut on SpaceX removing one grid fin from the V3 booster. He said it about engineering, not about Paperthin.

