<div align="center">

# Paperthin：低层级的 agent 设计模式

<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/banner.svg" alt="Paperthin - 相信 artifact，而不是作者。" width="820">

**把老派工程智慧变成 agent 会主动调用的本能反应。**

适用于**任何**agent | Claude Code、Codex、OpenCode、Antigravity、Copilot、Cursor、Grok-Build、Pi、Hermes、OpenClaw 等。

[快速开始](#quickstart-15-seconds) · [地图](#the-map) · [索引](#the-index) · [问题](#the-problem) · [修复](#the-fixes) · [致谢](#credits)

<sub>Read in: [English](../../README.md) · 中文 · [हिन्दी](./README.hi.md) · [Español](./README.es.md) · [العربية](./README.ar.md) · [Português](./README.pt.md) · [Русский](./README.ru.md) · [日本語](./README.ja.md) · [Français](./README.fr.md) · [Deutsch](./README.de.md) · [한국어](./README.ko.md)</sub>

</div>

---

<a id="quickstart-15-seconds"></a>
## 快速开始（15 秒）

1. 为你使用的每个 agent **安装**：
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*'
   ```
2. 用提升后的权限运行，让这些 skill 以符号链接方式安装并自动更新，而不是被复制。
3. **直接使用**。它们由 model 触发，所以 agent 会在需要时自己伸手去拿；你也可以像 `/re0` 一样点名调用。

**不确定怎么做？** 把上面的命令粘到你正在使用的 agent 里，然后说 `set this up for me`。它会处理剩下的事。

<a id="the-map"></a>
## 地图

**有多少 artifact，跨越多长时间？**

<div align="center">
<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/map.svg" alt="LilMGenius/paperthin 的 Paperthin 地图，一个 2x2 矩阵。横轴是数量（一个，然后多个）；纵轴是时间（现在，然后跨 iteration）；四个区域：左上 depth：一个 artifact，现在；这个东西干净且真实吗？右上 breadth：多个 artifact，现在；一个 ground truth 是否处处一致？左下 coil：一个项目，跨 iteration；每一轮是否教会了下一轮？右下 mesh：多个心智，跨多轮；群体是否收敛到 ground truth？" width="820">
</div>

<a id="the-index"></a>
## 索引

### `depth/`

| skill | 作用 | scope | Invoker |
|---|---|---|---|
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | 把漂移的 artifact 重写成干净的 v0，而不是再打一层 patch | 一个 artifact | model |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | 用全新、零上下文的眼睛冷读它，判断它能不能独自站住 *(只读)* | 一个 artifact | model |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | 双向对照 source 核验一个 claim：荒谬的可能真实吗，显然的可能是假的吗？ *(只读 → 修复)* | 一个 claim | model |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | 审计 validation 是否 leakage：外部 ground truth 真的进入了吗？ *(只读)* | 一个 eval | model |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | 先切掉不安全 scope，让安全部分全速运行，并交付 descope ledger | 一个任务 | model |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | 每次变更后，用 repo 自己的 clean-and-true 检查品尝你的 output | 你的 output | model |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | 拒绝客气，给出一个足以杀死计划的反对意见和最便宜的测试 | 一个计划 | 用户 |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | 移除 em dash 及其相似痕迹，并为每处选择真正需要的标点 | 你的文字 | 用户 |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | 把已完成 commit 的信息重写成干净的 v0，让 `git log` 本身就能完成交接 | 一个 commit | 用户 |

### `breadth/`

| skill | 作用 | scope | Invoker |
|---|---|---|---|
| 🔎 **[ssotchk](../../skills/breadth/ssotchk/SKILL.md)** | 找出一个 fact 散落或重复的位置，并指出 canonical source *(只读)* | 一个 fact，多个位置 | model |
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | 把 fact 合并到一个归宿，并让其他位置指向它 | 一个 fact，多个位置 | model |
| 🧰 **[ppt-upgrade](../../skills/breadth/ppt-upgrade/SKILL.md)** | 发布后协调已安装的旧 Paperthin skill 名称 | 已安装 skill 名称 | 用户 |

### `coil/`

| skill | 作用 | scope | Invoker |
|---|---|---|---|
| 🧭 **[retro](../../skills/coil/retro/SKILL.md)** | 从一次完成或失败的 cycle 中抽取教训和反模式 | 一个结束的 cycle | model |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | 只保留赢得复用资格的教训，从 v0 重新开始 | 一次重启 | model |
| 🌀 **[flywheel](../../skills/coil/flywheel/SKILL.md)** | 跑 build → QA → retro → re0-work cycle，让学习复利，而不是代码膨胀 | 整个 cycle | model |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | 读取实时 cycle state，返回一个下一步最佳行动，而不是菜单 *(只读)* | 当前 cycle | model |

### `mesh/`

*开发中 - 将独立视角收敛为共识。*

*更多调用方式见 [docs/invocation.md](../invocation.md)。*

<a id="the-problem"></a>
## 问题

**大多数 agent skill 都是 slop。**

把目标交给 agent，它会**添加**：更多文件、更多选项、更多“有帮助”的样板。添加看起来像进展，也没有东西会逼它回头删除。

> [!WARNING]
> 在项目里重复几次，就会得到熟悉的 AI 生成 toolkit：近似重复的 skill、废弃设置、把同一件事说三遍的 README。看起来合理、忙碌，却在悄悄变得不可维护。

这些 skill 押注相反方向。**每一个都在移除：**

- `re0` 把草稿重写成干净的 v0，而不是继续打 patch。
- `ssotchk` / `ssotize` 把散落在文件里的同一个 fact 折叠起来。
- `shower` 删掉陌生人看不懂的部分。
- `retro` / `re0-work` 保留教训，让错误的 build 死掉。
- `autobahn` 先切掉不安全 scope，让安全剩余部分全速运行。
- `dedash` 连 em dash 痕迹和相似符号也逐处判断并移除。
- `sip` 自动把这一切跑在你自己的 output 上。

> [!TIP]
> 难的不是加功能，而是克制。一次检查如果找不到可改进之处，就什么也不改。**这种克制就是产品。**

<a id="the-fixes"></a>
## 修复

<!-- Fixes follow the lifecycle of a piece of work, not the skill list: keep it clean (draft → read fresh → reconcile across files → automate → ship), keep it true (a single claim → a validation → the whole plan), then keep the loop learning and the run unblocked. Slot any new fix in by where it acts in that arc. -->

**每一个都是久经使用的原则，被做成自动动作。**

### #1 - artifact 会腐烂
一场 session 里一点点改文档，文档就会膨胀：过期的增量、重复的噪声、changelog 伤疤。继续叠 patch 只是在保存腐烂。

**修复 → `re0`：** 像写第一个版本一样，把 artifact 重写成干净的 v0。

> *先例：童子军规则 - “leave it cleaner than you found it”（Robert C. Martin, [Clean Code](https://www.informit.com/articles/article.aspx?p=1235624&seqNum=6), 2008）。`re0` 更进一步：重写，不只是整理。*

<details>
<summary><b>[PROOF]</b></summary>

- **设置** - 我们让 `re0` 再刷新这些文档一次，但它们已经处在 v0。
- **结果** - 它没有找到可改进之处，散文一行也没动。
- **所以** - 没有问题时什么也不做的工具不会让 repo 膨胀。这些 skill 移除噪声，从不添加噪声。
</details>

### #2 - 你会对自己的工作失明
长 session 之后，最不能直读自己工作的人就是你。你知道得太多，大脑会悄悄补齐每个缺口，于是漏洞变得不可见。

**修复 → `shower`：** 把 artifact 交给一个从未见过你 session 的陌生人，只问一句：“这真的说得通吗？”

> *先例：[egoless programming](https://en.wikipedia.org/wiki/Egoless_programming) - 你无法客观审查自己的工作，必须由别人来做（Gerald Weinberg, 1971）。在这里，那个别人是零上下文的子 session。*

<details>
<summary><b>[PROOF]</b></summary>

- **设置** - 我们把 `shower` 自己的规范交给一个零上下文、只拿着该文件的子 session。
- **结果** - 几分钟内，它找到了作者漏掉的三个 bug：
  - 一个暗示了本应隐藏答案的步骤，
  - 一个 leakage spoiler 文件的路径，
  - 一个过于模糊、无法执行的 scope。
- **所以** - 能抓住自身 bug 的 skill，也能抓住你的 bug。
</details>

### #3 - 同一个 fact 会到处出现
一个超时值、一个决定、一个状态，被复制到 README、文档、工单和 Slack 线程。副本漂移后，没人知道哪个是真的。

**修复 → `ssotchk` + `ssotize`：** 找出散落位置，命名 canonical source，然后合并并让其他地方指向它。

> *先例：[DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) - 一个 fact，一个权威归宿（Hunt & Thomas, The Pragmatic Programmer, 1999）。*

### #4 - “记得 validation”永远不会触发
埋在文档里的指导不会在全新 session 中触发，而那正是作者偏见最高的时候。

**修复 → `sip`：** 你刚完成某件事，它就会对 output 运行 clean 检查（`shower`、`ssotchk`、`re0`）；如果有 claim 或 eval，还会自动运行 true 检查（`factchk`、`mandela`）。

> *先例：[dogfooding](https://en.wikipedia.org/wiki/Eating_your_own_dog_food) - eat your own dog food（Microsoft, 1988）。端出去之前，先尝自己的菜。*

<details>
<summary><b>[PROOF]</b></summary>

- **设置** - 一次把所有 skill 改成 self-contained 的大型重构刚结束，`sip` 就自动触发。
- **结果** - 它的新眼睛检查抓到了作者已经看不见的两件事：一个维护规则仍指向同次重构刚删除的 skill-to-skill 链接；另一个文件编辑安全规则在两个 skill 里存在，却在同样会编辑文件的第三个 skill 中缺失。
- **所以** - 检查会咬在偏见最高的地方：不是新 artifact，而是大改留下的漂移，正是作者自己的眼睛会滑过去的地方。
</details>

### #5 - session 不会旅行，git log 会
你的 session 被困在它运行的地方：这个 agent、这个账号、这台机器。队友或另一个 agent 无法加载工作发生时的上下文。

**修复 → `re0-git`：** 清理完成后的 commit 信息，让每个环境都共享的 `git log` 承载交接。任何人都能只凭日志接上。

<details>
<summary><b>[PROOF]</b></summary>

- **设置** - `re0-git` 的第一个目标就是它自己的发布 commit。
- **结果** - dogfooding 暴露出两个问题，并且都已修复：
  - 被琐事填胖的 commit 信息，
  - 一边宣讲“不冗余”一边重复自己的规范。
- **所以** - 它的第一次清理，是清理自己。
</details>

> [!NOTE]
> 上面五个修复让 artifact 保持**干净**。接下来的三个让 artifact 保持**真实**：同样不信任作者，只是把对象从文字转向推理。

### #6 - 直觉不是 source
“合理”“荒谬”“新颖”是任何 artifact 里最不可靠的一行。人的先验会**双向**失败：排除真实的东西（沙漠青蛙存在），又把不可能的东西正常化（失重箱子）。

**修复 → `factchk`：** 对任何接触现实的 claim，在发布前双向对照外部 source。到不了 source 时，标记它，而不是猜。

> *先例：[WEIRD bias](https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/abs/weirdest-people-in-the-world/BF84F7517D56AFF7B7EB58411A554C17)（Henrich, Heine & Norenzayan, 2010）和 [naive-physics / impetus error](https://www.science.org/doi/10.1126/science.210.4474.1139)（McCloskey, Caramazza & Green, 1980）- 直觉会双向误判现实。*

<details>
<summary><b>[PROOF]</b></summary>

- **设置** - 我们双向运行 `factchk`，审查它自己已经发布的引用。
- **结果** - 全部站得住，同时它仍抓到了两个归因错误：著名的“what's measured becomes the target”claim 来自 Strathern（1997），不是 Goodhart；“McCloskey 1980”是合著的 *Science* 论文，而不是 1983 年的 *Scientific American* 文章。
- **所以** - 会审计自己脚注的 fact-checker，也会审计你的脚注。
</details>

### #7 - eval 会确认自己
model、 scorer 和 designer 可能一致认为结果是真的，而外部 ground truth 从未独立进入 cycle。整个房间都在自信地记住一件并未独立发生过的事。

**修复 → `mandela`：** 按 8 种 leakage 模式审计任何 eval、 metric 或 experiment：外部 ground truth 是否独立进入，还是 validation 者本身就是 designer？

> *先例：[Goodhart's law](https://en.wikipedia.org/wiki/Goodhart%27s_law)、[data leakage](https://dl.acm.org/doi/10.1145/2382577.2382579)（Kaufman et al., 2012），以及 [circular analysis](https://www.nature.com/articles/nn.2303) 中的 “double dipping”（Kriegeskorte et al., 2009）。*

<details>
<summary><b>[PROOF]</b></summary>

- **设置** - 这个审计来自一个不断死于同一失败模式的研究设计：scorer、 model 和 designer 认同一个结果，但没有外部 ground truth 产生它。
- **结果** - 那一个项目里出现了八种 leakage 形态：scorer 给自己画出的桶打分、两个组件在共享空间里互相“validation”、一个私有配方让 validation 者变成 designer。这个目录成了该 skill 的 8-pattern taxonomy。
- **所以** - 清单不是理论：里面每一种模式都曾经见血。
</details>

### #8 - 你杀不掉自己的计划
计划是你建的，所以你会护着它。那些能击碎它的问题，正是你不会问的问题。

**修复 → `hate`：** 拒绝对计划客气，返回一个足以杀死它的承重反对意见，以及证明它是否重要的最便宜 experiment。用户调用：你有意把它指向某个计划。

> *先例：[egoless programming](https://en.wikipedia.org/wiki/Egoless_programming)（Weinberg, 1971，与 `shower` 同源）、hostile review 和 fail-fast。*

<details>
<summary><b>[PROOF]</b></summary>

- **设置** - 每次研究 pass 都以 adversarial critic 收尾，而它的结论永远是一个 root cause 加上能解决问题的最便宜测试，从不是清单。
- **结果** - 它用“只是又画了一个盒子，而不是更锋利的尖端”杀掉了一个 recombination engine；又只凭数字杀掉了 human-holdout protocol：需要约 36 人却只有约 24 人，family-wise error rate 接近 34%，设计还一边引用原则一边实现反面。
- **所以** - 真正重要的反对意见总是单一且便宜可测，这正是 `hate` 被锁定返回的 `{root, first nail}`。
</details>

### #9 - 正在运行的 build 仍可能是错误产品
长 agentcycle 会产出许多能跑的部件：面板、路由、测试、截图。它们更能证明活动，而不是价值，沉没成本又诱使你继续扛着这套架构。下一轮之间，下一步会模糊成十几个活线程，而选择太多本身就是瘫痪。

**修复 → `retro` + `re0-work` + `flywheel` + `nba`：** 抽取教训、反模式和下一个 gate；当基础错了，就从干净的 v0 重启；运行 build → QA → retro → re0-work cycle；当线程丢失时，读取状态并返回唯一的下一步最佳行动。只保留赢得复用资格的东西。

<details>
<summary><b>[PROOF]</b></summary>

- **设置** - 一个游戏引擎 demo 达到了 full-stack、可运行状态：API routes、canvas runtime、leaderboard、arcade pages、remix 和 telemetry panels、tests、screenshots。
- **结果** - 它仍然是错误产品。生成出的游戏是 mock、单屏、没有 durable replay layer，而每一轮都以一堆 unmet gates 和 parked threads 面前的“what now?”结束。
- **所以** - 能跑、像要发布，并不等于完成。 cycle 需要一个 skill 命名缺失 gate，另一个 skill 返回唯一下一步。
</details>

### #10 - 靠近风险的工作会被稀释后返回
让 agent 处理擦到 guardrails 的任务：scraping、licensing、privacy、security，就会得到最糟的组合。危险的一小片触发拒绝和重试，安全的 90% 却变得犹豫、稀释，或悄悄缺失。

**修复 → `autobahn`：** 执行前把 guardrail-adjacent 项切出 scope，每项都有安全替代和 archive entry；剩下 scope 交给只看 carved prompt、从未见过风险输入的新子 agent 全速执行；交付 descope ledger，让每个排除都是可见决策，而不是沉默缺口。它移除请求，而不是绕过请求。autobahn 没有速度限制，正是因为入口纪律严格。

> *今年夏天的先例：美国因一个 jailbroken safeguard [暂停了 Fable 5 和 Mythos 5](https://www.anthropic.com/news/fable-mythos-access)（Anthropic, 2026），OpenAI 则以 safety-stack-first 方式向可信伙伴发布 [GPT-5.6](https://openai.com/index/previewing-gpt-5-6-sol/)（OpenAI, 2026）。在前沿，快车道能开放到哪里，取决于入口纪律能守到哪里。*

<details>
<summary><b>[PROOF]</b></summary>

- **设置** - 这种方法来自一次真实的机密策略文档重写。它同时在四条轴上接近风险：stealth tooling、trademarked names、privacy-adjacent profiling、scraping gray zones。
- **结果** - 一个主 cycle 加十个子 agent 把 frontier model 端到端跑完，flag 0、refusal 0、fallback 0。每个 descoped item 的安全替代最后还都成了更好的产品。
- **所以** - 主 cycle 负责切，干净的子 agent 跑安全 scope，而正是这次切割让它们可以踩到底。
</details>

<a id="credits"></a>
## 致谢

- **build 于** [mattpocock/skills](https://github.com/mattpocock/skills)（MIT）的架构和哲学之上。
- **不是 fork** - 这些是 [LilMGenius](https://github.com/LilMGenius) 自己的、互不重叠的 workflow。
- **按原样 vendored** - 少数共享 building blocks 保持原样，并在 [NOTICE](../../NOTICE) 中按 source 归属。
- **作者指南** - 约定和哲学见 [CLAUDE.md](../../CLAUDE.md)。
