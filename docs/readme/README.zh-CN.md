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
2. 如果 OS 要求，请在提升权限/admin shell 中运行，让这些 skill 以符号链接方式安装并自动更新，而不是被复制。
3. **保持最新**。想更新时运行 `/re0-upgrade`；它还会开启一个安静的会话启动提醒，有新 skill 时通知你。
4. **直接使用**。任何 skill 都能像 `/re0` 一样点名调用；model-invoked 也会自动触发。

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

| skill | 作用 | scope | Invoker | 只读 |
|---|---|---|---|---|
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | 把漂移的 artifact 重写成干净的 v0，而不是再打一层 patch | 一个 artifact | 模型 | |
| 🧭 **[readchk](../../skills/depth/readchk/SKILL.md)** | 检查对请求的理解；只暴露真正仍然存在的分叉 | 一个 instruction | 模型 | ✔ |
| 🏹 **[aim](../../skills/depth/aim/SKILL.md)** | 读取交接来的数据，主动提出待确认的意图，而不是反过来询问 | 一份数据交付 | 模型 | ✔ |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | 选择足够且最便宜的 tier 与推理强度 | 一个任务 | 模型 | ✔ |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | 拒绝客气，给出一个足以杀死计划的反对意见和最便宜的测试 | 一个计划 | 用户 | |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | 去掉 bait，展开新鲜读法，并优先报告 divergence | 一个方向 | 用户 | ✔ |
| 🧐 **[feynman](../../skills/depth/feynman/SKILL.md)** | 追问一个刚做出的决定，直到你能把它解释清楚，否则标记出缺口 | 一个决定 | 用户 | ✔ |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | 先切掉不安全 scope，让安全部分全速运行，并记录 descope | 一个任务 | 模型 | |
| 🔃 **[reorder](../../skills/depth/reorder/SKILL.md)** | 在一条明确的原则下，把漂移的列表重新排成合理顺序；只移动条目，不改动文字 | 一个列表 | 用户 | |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | 把偶然绑定的工具名替换成它真正表达的机制 | 一个 durable artifact | 模型 | |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | 移除 em dash 及其相似痕迹，并为每处选择真正需要的标点 | 你的文字 | 用户 | |
| 🗜️ **[debloat](../../skills/depth/debloat/SKILL.md)** | 把臃肿的产物压缩到承重的密度；只删文字，绝不删规则 | 一件产物 | 用户 | |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | 用全新、零上下文的眼睛冷读它，判断它能不能独自站住 | 一个 artifact | 模型 | ✔ |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | 双向对照 source 核验所主张的：荒谬的可能真实吗，显然的可能是假的吗？ | 一个 claim | 模型 | |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | 审计是否 leakage：外部 ground truth 真的进入了吗？ | 一个 eval | 模型 | ✔ |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | 每次变更后，用 repo 自己的 clean-and-true 检查品尝你的 output | 你的 output | 模型 | |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | 把已完成 commit 的信息重写，让 `git log` 本身就能完成交接 | 一个 commit | 用户 | |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | 跑一遍 shipping 和 releasing 检查清单，确认后打 tag 并发布 | 一次 release | 用户 | |
| 🤝 **[re0-merge](../../skills/depth/re0-merge/SKILL.md)** | 审查并合入一份贡献：先把关，保留作者署名，关闭前先批准，并说明任何改动 | 一份贡献 | 用户 | |

### `breadth/`

| skill | 作用 | scope | Invoker | 只读 |
|---|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | 审计散落位置，把 fact 合并到一个归宿并让其他位置指向它 | 一个 fact，多个位置 | 模型 | |
| 🧰 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | 用一条命令把已安装的 skill 升级到完整的当前目录：淘汰改名的，补齐新增的，全部先确认 | 你的 skill 安装 | 用户 | |

### `coil/`

| skill | 作用 | scope | Invoker | 只读 |
|---|---|---|---|---|
| 🗂️ **[re0-plan](../../skills/coil/re0-plan/SKILL.md)** | 在 re0-loop 第一轮之前打开新的 iteration 文件夹并写入它的 DESIGN/WORKFLOW/EVIDENCE | 一个新 cycle | 用户 | |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | 跑 build → QA → re0-memo → re0-work cycle，让学习复利，而不是代码膨胀 | 整个 cycle | 模型 | |
| 🧭 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | 从一次完成或失败的 cycle 中抽取教训和反模式 | 一个结束的 cycle | 模型 | |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | 只保留赢得复用资格的教训，从 v0 重新开始 | 一次重启 | 模型 | |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | 从实时 state 重建丢失的 context：谁需要它、发生了什么变化、新词是什么意思 | 一次回归 | 模型 | ✔ |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | 读取实时 cycle state，返回一个下一步最佳行动，而不是菜单 | 当前 cycle | 模型 | ✔ |

### `mesh/`

| skill | 作用 | scope | Invoker | 只读 |
|---|---|---|---|---|
| 🔺 **[prism](../../skills/mesh/prism/SKILL.md)** | 把一个 artifact 拆到多个独立视角下审视；返回它们冲突之处，以及能化解冲突的那个问题 | 一个 artifact | 用户 | ✔ |

*更多调用方式见 [docs/invocation.md](../invocation.md)。*

<a id="the-problem"></a>
## 问题

**大多数 agent skill 都是 slop。**

把目标交给 agent，它会**添加**：更多文件、更多选项、更多“有帮助”的样板。添加看起来像进展，也没有东西会逼它回头删除。

> [!WARNING]
> 在项目里重复几次，就会得到熟悉的 AI 生成 toolkit：近似重复的 skill、废弃设置、把同一件事说三遍的 README。看起来合理、忙碌，却在悄悄变得不可维护。

这些 skill 押注相反方向。**每一个都在移除：**

- `re0` 把草稿重写成干净的 v0，而不是继续打 patch。
- `readchk` 在内部复述请求，只有真正存活的分歧才会提问。
- `aim` 读一份交接过来的 data drop，直接提出待确认的意图，而不是反过来问你。
- `modelchk` 在工作开始前选出足够用的最便宜 tier 与推理强度。
- `macrothink` 展开新的解读，先报告分歧，再让收敛看起来像证据。
- `feynman` 逼问一个刚做出的决定，直到你能把它讲给怀疑者听，或者点出你讲不清的那处缺口。
- `prism` 把一个 artifact 拆到多个独立视角下，返回它们冲突之处，而不是取它们的平均。
- `autobahn` 先切掉不安全 scope，让安全剩余部分全速运行。
- `detool` 把可移植内容里偶然带上的工具名换成它们真正指代的机制。
- `dedash` 连 em dash 痕迹和相似符号也逐处判断并移除。
- `debloat` 把臃肿的产物压缩到承重的密度，只删文字，绝不删规则。
- `shower` 删掉陌生人看不懂的部分。
- `ssotize` 审计散落在文件里的 facts，取得批准，然后把它们折叠到一个归宿。
- `reorder` 按单一原则重新对齐一份已经漂移的列表，只挪动条目，不改动任何措辞。
- `sip` 自动把这一切跑在你自己的 output 上。
- `re0-memo` / `re0-work` / `re0-loop` 保留教训，让错误的 build 死掉，并让 loop 持续运转。
- `catchup` / `nba` 从实时 state 重建人类的地图，然后只返回下一步该做什么。

> [!TIP]
> 难的不是加功能，而是克制。一次检查如果找不到可改进之处，就什么也不改。**这种克制就是产品。**

<a id="the-fixes"></a>
## 修复

完整的 Fixes narrative 以 [English README](../../README.md#the-fixes) 作为唯一 canonical source，避免 proof examples 在翻译之间 drift。本文件保留索引和本地导览。

<a id="credits"></a>
## 致谢

- **build 于** [mattpocock/skills](https://github.com/mattpocock/skills)（MIT）的架构和哲学之上。
- **不是 fork** - 这些是 [LilMGenius](https://github.com/LilMGenius) 自己的、互不重叠的 workflow。
- **按原样 vendored** - 少数共享 building blocks 保持原样，并在 [NOTICE](../../NOTICE) 中按 source 归属。
- **作者指南** - 约定和哲学见 [CLAUDE.md](../../CLAUDE.md)。
