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

**每个 agent 只选一种方式**；装两种会让每个 skill 加载两次。

1. **Claude Code**:
   ```bash
   claude plugin marketplace add LilMGenius/paperthin && claude plugin install paperthin@paperthin
   ```
   然后在 Claude Code 里运行 `/plugin`，打开 **Marketplaces**，选择 `paperthin` 并点一次 **Enable auto-update**。
2. **Codex**: 每次会话开始时自动更新。
   ```bash
   codex plugin marketplace add LilMGenius/paperthin && codex plugin add paperthin@paperthin
   ```
3. **其他所有 agent**：一行命令同时装好 skill 和每日自动更新。
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*' && node "$HOME/.agents/skills/re0-upgrade/scripts/schedule/schedule.mjs" install
   ```
4. **开始使用**。像 `/re0` 这样直接用名字调用任何 skill；很多 skill 在需要时也会自己启动。

**以前装过？** 在新会话里运行一次 `/re0-upgrade`。

**不确定？** 对你的 agent 说 `install https://github.com/LilMGenius/paperthin`，它会按[安装步骤](../../.agents/install-block.md#handed-only-this-repository)自己装好。

**在网页版 ChatGPT 或 Claude 里？** 把 `https://raw.githubusercontent.com/LilMGenius/paperthin/main/llms-full.txt` 交给它。

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
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | 把反复修补、越改越乱的文档或文件重写成干净的第一版，而不是再打一层补丁 | 一个 artifact | 模型 | |
| 🧭 **[readback](../../skills/depth/readback/SKILL.md)** | 动手前先确认自己理解了你的要求，只有两种理解确实不同时才发问 | 一个 instruction | 模型 | ✔ |
| 🏹 **[aim](../../skills/depth/aim/SKILL.md)** | 读完你交来的文件或文字，先提出你可能想做的事，你只需确认 | 一份数据交付 | 模型 | ✔ |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | 选出仍能把事做好的最便宜的模型档位和思考深度 | 一个任务 | 模型 | ✔ |
| 🧹 **[elon](../../skills/depth/elon/SKILL.md)** | 建议删掉或推迟只因习惯而保留的要求和在做的事，并注明每条的出处；外部定下的规则一概不动 | 一组需求或正在进行的事务及其来源 | 模型 | ✔ |
| 🧩 **[scopechk](../../skills/depth/scopechk/SKILL.md)** | 按目标自己写明的范围，检查新东西放在你想放的位置是否合适，不合适就指出更好的去处 | 一个条目及其将加入的目标 | 模型 | ✔ |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | 故意当个刻薄的批评者：找出可能击垮计划的那一条反对意见，和验证它的最省钱办法 | 一个计划 | 用户 | |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | 把去掉你预设的问题交给多个全新视角，先展示他们分歧在哪里 | 一个方向 | 用户 | ✔ |
| 🔀 **[crossthink](../../skills/depth/crossthink/SKILL.md)** | 当所有选项看起来都差不多时，从五个以上毫不相干的领域借来行之有效的办法，只留下新的那些 | 一个卡住的问题 | 模型 | ✔ |
| ⚖️ **[re0-decide](../../skills/depth/re0-decide/SKILL.md)** | 把决策所需的材料变成清单，结论由你自己的回答算出；它从不替你选择 | 提交待决的材料 | 用户 | ✔ |
| 🧐 **[whychk](../../skills/depth/whychk/SKILL.md)** | 追问你刚做的决定，直到你能讲清楚，否则指出推理中的漏洞 | 一个决定 | 用户 | ✔ |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | 先把任务中有风险的部分连同更安全的替代方案拿出来，其余部分全速推进，并记下被拿掉的内容 | 一个任务 | 模型 | |
| 🎨 **[re0-style](../../skills/depth/re0-style/SKILL.md)** | 把代码改成符合项目自己的风格；项目本身有两种写法的地方会先问你 | 一项待审查的变更 | 模型 | |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | 把长期文档里的品牌名和工具名换成它们实际做的事，让文档比工具活得更久 | 一个 durable artifact | 模型 | |
| 🗜️ **[debloat](../../skills/depth/debloat/SKILL.md)** | 把臃肿的文字或代码精简到真正有用的部分，不丢掉任何一条规则或一种行为 | 一件产物，文字或代码 | 模型 | |
| 🔃 **[re0-order](../../skills/depth/re0-order/SKILL.md)** | 按一条明确的原则把杂乱的列表重新排好；只移动条目，不改一个字 | 一个列表 | 模型 | |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | 删掉代理在句子里乱撒的长破折号，保留连字符、范围和标签分隔用的破折号 | 你的文字 | 用户 | |
| ⸱ **[dedot](../../skills/depth/dedot/SKILL.md)** | 在韩语文字里，为每个连接并列项的间隔号建议换成逗号或连接词，并说明理由 | 作者指定范围的韩语散文或标签行 | 用户 | ✔ |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | 把成果交给一位毫无背景的新读者，问它单独拿出来是否讲得通 | 一个 artifact | 模型 | ✔ |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | 拿真实来源双向核对说法：荒唐的可能是真的，显而易见的也可能是错的 | 一个 claim | 模型 | |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | 检查测试或指标是不是在给自己打分，还是真正由外部事实决定结果 | 一个 eval | 模型 | ✔ |
| 🎭 **[demock](../../skills/depth/demock/SKILL.md)** | 找出线上代码里让成功报告变成假话的假实现和静默兜底，并建议真正的修法 | 指定的文件、目录或 diff | 模型 | |
| 🥸 **[deid](../../skills/depth/deid/SKILL.md)** | 在共享文件里找出某个人或某家公司的数据，换成它所扮演的角色，并列出仍带着这些数据的旧提交 | 指定的一个产物和一位所有者 | 模型 | |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | 任何改动之后、宣布完成之前，用 paperthin 自己的检查跑一遍你的成果 | 你的 output | 模型 | |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | 保留日期和位置，重写已完成提交的说明，让任何人只看提交历史就能接手 | 一个 commit | 用户 | |
| 🧨 **[re0-squash](../../skills/depth/re0-squash/SKILL.md)** | 把 GitHub 仓库以文件不变的单个签名提交重新发布，旧提交再也无法访问 | 一个仓库 | 用户 | |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | 跑完发布清单，等你确认后打标签并发布 | 一次 release | 用户 | |
| 🤝 **[re0-merge](../../skills/depth/re0-merge/SKILL.md)** | 审阅并合入别人的贡献，保留作者的署名，并解释做过的任何修改 | 一份贡献 | 用户 | |

### `breadth/`

| skill | 作用 | scope | Invoker | 只读 |
|---|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | 找出被复制到多处的同一事实，经你批准后集中到一处，其余地方都指向那里 | 一个 fact，多个位置 | 模型 | |
| 🔗 **[ssotize-local](../../skills/breadth/ssotize-local/SKILL.md)** | 把重复的文件或文件夹合并成一份真实副本，其余用链接指向它，并验证好还原的办法 | 相同字节，多个路径 | 模型 | |
| 📖 **[re0-readme](../../skills/breadth/re0-readme/SKILL.md)** | 梳理 README 和 AGENTS.md，让每一行都待在需要它的读者所读的文件里 | 一个仓库的 README 和 AGENTS.md | 模型 | |
| 📥 **[re0-import](../../skills/breadth/re0-import/SKILL.md)** | 把交来的资料按现有知识库自己的规则放进合适的页面，并报告找不到位置的部分 | 交来的材料和一个知识库 | 用户 | |
| 🆙 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | 确认一次就把安装更新到当前完整目录：清理改了名的技能，加上新的 | 你的 skill 安装 | 用户 | |

### `coil/`

| skill | 作用 | scope | Invoker | 只读 |
|---|---|---|---|---|
| 🗂️ **[re0-plan](../../skills/coil/re0-plan/SKILL.md)** | 新一轮工作开始前，先建好它的文件夹，放进设计、流程和证据文件 | 一个新 cycle | 用户 | |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | 让构建、测试、总结、重来的循环一直转下去，积累下来的是经验而不是代码 | 整个 cycle | 模型 | |
| 👁️ **[re0-watch](../../skills/coil/re0-watch/SKILL.md)** | 盯住长时间运行的代理任务，一旦卡住就提醒你；任何修复都只是等你批准的提议 | 一个运行中的任务 | 用户 | |
| 📝 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | 从已完成或失败的一轮里提炼出经验和应当避免的错误 | 一个结束的 cycle | 模型 | |
| 🔁 **[backprop](../../skills/coil/backprop/SKILL.md)** | 把一次纠正得来的教训改回造成问题的文档和规则里，再把它们整理干净 | 一条教训 | 模型 | |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | 从零开始，只带上已经证明值得复用的经验 | 一次重启 | 模型 | |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | 帮你补上离开期间的进展：哪些事等着你、什么变了、新词是什么意思 | 一次回归 | 模型 | ✔ |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | 读出工作进展到哪一步，只给出最好的下一步，而不是一张菜单 | 当前 cycle | 模型 | ✔ |
| 🪜 **[re0-workflow](../../skills/coil/re0-workflow/SKILL.md)** | 针对一个目标，挑出该用哪些技能、按什么顺序，先给你看，再替你运行，到需要你出手的地方停下 | 一个明确意图 | 模型 | |
| 🚪 **[paperthin](../../skills/coil/paperthin/SKILL.md)** | 只需记住这一个命令：说出你想做的事，re0-workflow 就会挑选并运行合适的技能 | 一个请求 | 用户 | |
| 🎓 **[re0-tutorial](../../skills/coil/re0-tutorial/SKILL.md)** | 分三个等级教会你一个技能，每级都凭你自己提交的成果过关 | 一项技能 | 用户 | |

### `mesh/`

| skill | 作用 | scope | Invoker | 只读 |
|---|---|---|---|---|
| 🕸️ **[multithink](../../skills/mesh/multithink/SKILL.md)** | 按各自引用的证据来衡量几份独立意见，从不看有多少人赞同 | 对一个 artifact 或问题的多份解读 | 用户 | ✔ |

*更多调用方式见 [.agents/invocation.md](../../.agents/invocation.md)。*

<a id="the-problem"></a>
## 问题

**大多数 agent skill 都是 slop。**

把目标交给 agent，它会**添加**：更多文件、更多选项、更多“有帮助”的样板。添加看起来像进展，也没有东西会逼它回头删除。

> [!WARNING]
> 在项目里重复几次，就会得到熟悉的 AI 生成 toolkit：近似重复的 skill、废弃设置、把同一件事说三遍的 README。看起来合理、忙碌，却在悄悄变得不可维护。

这些 skill 押注相反方向：**每一个都在移除某样东西**，移除什么见[索引](#the-index)。

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
- **作者指南** - 约定和哲学见 [AGENTS.md](../../AGENTS.md)。
