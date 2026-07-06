<div align="center">

# Paperthin: 低レベルの agent 設計パターン

<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/banner.svg" alt="Paperthin - 作者ではなく artifact を信じる。" width="820">

**昔からあるエンジニアリングの知恵を、agent が自分で取りに行く反射動作に変える。**

**どの**agent でも | Claude Code、Codex、OpenCode、Antigravity、Copilot、Cursor、Grok-Build、Pi、Hermes、OpenClaw など。

[クイックスタート](#quickstart-15-seconds) · [マップ](#the-map) · [インデックス](#the-index) · [問題](#the-problem) · [修正](#the-fixes) · [クレジット](#credits)

言語: [English](./README.md) · 日本語

</div>

---

<a id="quickstart-15-seconds"></a>
## クイックスタート（15秒）

1. 使っているすべての agent に**インストール**します。
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*'
   ```
2. skills がコピーではなく symlink されるように、昇格権限で実行します。そうすると自動更新されます。
3. **使います**。model が呼び出すので、必要なときに agent が自分で取りに行きます。`/re0` のように名前で直接呼んでもかまいません。

**迷ったら？** 使っている agent に上のコマンドを貼り付けて、`set this up for me` と言ってください。残りはやってくれます。

<a id="the-map"></a>
## マップ

**artifact はいくつあり、どれだけの時間にまたがるのか？**

<div align="center">
<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/map.svg" alt="LilMGenius/paperthin の Paperthin マップ。2x2 のmatrix。横軸は個数（一つ、その後に多数）、縦軸は時間（今、その後に iteration をまたぐ）。四つの領域。左上の depth: 一つの artifact、今。これはきれいで真か？右上の breadth: 多数の artifact、今。一つの真実がどこでも一貫しているか？左下の coil: 一つのプロジェクト、 iteration をまたぐ。各パスは次を教えたか？右下の mesh: 多数の思考、複数ラウンド。群れは真実へ収束するか？" width="820">
</div>

<a id="the-index"></a>
## インデックス

### `depth/`

| Skill | 何をするか | scope | 呼び出し元 |
|---|---|---|---|
| ♻️ **[re0](./skills/depth/re0/SKILL.md)** | drift した artifact を、さらにパッチするのではなく、きれいな v0 として書き直す | artifact 一つ | model |
| 🚿 **[shower](./skills/depth/shower/SKILL.md)** | 新鮮でゼロコンテキストの目で冷たく読む。これ単体で成立するか？ *(読み取り専用)* | artifact 一つ | model |
| 🔬 **[factchk](./skills/depth/factchk/SKILL.md)** | claim を source に対して両方向に validation する。ばかげたことが本当で、当然に見えることが偽かもしれないか？ *(読み取り専用 → 修正)* | claim 一つ | model |
| 🧪 **[mandela](./skills/depth/mandela/SKILL.md)** | validation の leakage を監査する。外部 ground truth は実際に入っているか？ *(読み取り専用)* | eval 一つ | model |
| 🛣️ **[autobahn](./skills/depth/autobahn/SKILL.md)** | 危険な scope を先に切り出し、安全な残りを全力で走らせ、descope ledger を出す | タスク一つ | model |
| 🥄 **[sip](./skills/depth/sip/SKILL.md)** | 変更後、自分の output を repo 自身の clean-and-true checks で味見する | 自分の output | model |
| 😈 **[hate](./skills/depth/hate/SKILL.md)** | 優しくしない。計画を殺せる一つの反論と、最も安いテストを返す | 計画一つ | ユーザー |
| ✂️ **[dedash](./skills/depth/dedash/SKILL.md)** | em dash とその類似物を取り除き、各場所に必要な句読点を選ぶ | 自分の文章 | ユーザー |
| 🧾 **[re0-git](./skills/depth/re0-git/SKILL.md)** | 完了した commit message をきれいな v0 に書き直し、`git log` だけで引き継げるようにする | commit 一つ | ユーザー |

### `breadth/`

| Skill | 何をするか | scope | 呼び出し元 |
|---|---|---|---|
| 🔎 **[ssotchk](./skills/breadth/ssotchk/SKILL.md)** | 一つの fact が散らばったり重複したりしている場所を見つけ、canonical source を名指しする *(読み取り専用)* | fact 一つ、多数の場所 | model |
| 🧲 **[ssotize](./skills/breadth/ssotize/SKILL.md)** | それを一つの家にconsolidate し、残りをそこへ向ける | fact 一つ、多数の場所 | model |
| 🧰 **[ppt-upgrade](./skills/breadth/ppt-upgrade/SKILL.md)** | リリース後、インストール済みの古い Paperthin skill 名を整合させる | インストール済み skill 名 | ユーザー |

### `coil/`

| Skill | 何をするか | scope | 呼び出し元 |
|---|---|---|---|
| 🧭 **[retro](./skills/coil/retro/SKILL.md)** | 完了または失敗した cycle から教訓と anti-pattern を抽出する | 完了した cycle 一つ | model |
| 🧱 **[re0-work](./skills/coil/re0-work/SKILL.md)** | 再利用に値した教訓だけを残して v0 からやり直す | やり直し一つ | model |
| 🌀 **[flywheel](./skills/coil/flywheel/SKILL.md)** | build → QA → retro → re0-work ループを回し、コードではなく学習を複利化する | ループ全体 | model |
| 🎯 **[nba](./skills/coil/nba/SKILL.md)** | live cycle state を読み、メニューではなく一つの next best action を返す *(読み取り専用)* | 現在の cycle | model |

### `mesh/`

*開発中 - 独立した視点を合意へ収束させる。*

*呼び出しについて詳しくは [docs/invocation.md](./docs/invocation.md) を参照。*

<a id="the-problem"></a>
## 問題

**ほとんどの agent skill は slop です。**

agent に目標を渡すと、agent は**足します**。ファイルを増やし、選択肢を増やし、「役に立つ」ボイラープレートを増やします。足すことは進捗に見え、何も戻って削除させません。

> [!WARNING]
> それをプロジェクト中で繰り返すと、見慣れた AI 生成ツールキットになります。ほぼ重複した skill、死んだ設定、同じことを三回言う README。もっともらしく、忙しそうで、静かに保守不能です。

これらの skill は逆に賭けます。**すべてが何かを取り除きます。**

- `re0` は draft を patch せず、きれいな v0 に書き直します。
- `ssotchk` / `ssotize` はファイル間に散らばった同じ fact を畳みます。
- `shower` は見知らぬ人が追えない部分を切ります。
- `retro` / `re0-work` は教訓を保存し、間違った build を死なせます。
- `autobahn` は危険な scope を先に切り、安全な残りが全速力で走れるようにします。
- `dedash` は em dash の癖とその類似物さえ、一つずつ判断して取り除きます。
- `sip` はそのすべてを自分の output に自動で実行します。

> [!TIP]
> 難しいのは機能追加ではなく、抑制です。改善点を見つけない pass は何も変えません。**その抑制こそが製品です。**

<a id="the-fixes"></a>
## 修正

<!-- Fixes follow the lifecycle of a piece of work, not the skill list: keep it clean (draft → read fresh → reconcile across files → automate → ship), keep it true (a single claim → a validation → the whole plan), then keep the loop learning and the run unblocked. Slot any new fix in by where it acts in that arc. -->

**それぞれは使い古された原則を自動化したものです。**

### #1 - artifact は腐る
セッション中に文書を少しずつ編集すると、膨らみます。古い delta、重複したノイズ、changelog の傷跡。上に patch を重ねても腐敗を保存するだけです。

**修正 → `re0`:** artifact を最初の版のように、きれいな v0 として書き直します。

> *先行例: Boy Scout Rule - "leave it cleaner than you found it" (Robert C. Martin, [Clean Code](https://www.informit.com/articles/article.aspx?p=1235624&seqNum=6), 2008)。`re0` はさらに進みます。整えるだけでなく、書き直します。*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - `re0` にこの docs をもう一度 refresh するよう頼みましたが、すでに v0 でした。
- **Result** - 改善点を見つけず、文章の一行も触りませんでした。
- **So** - 何も悪くないときに何もしない道具は repo を膨らませません。この skills はノイズを取り除き、追加しません。
</details>

### #2 - 自分の仕事には目が曇る
長いセッションの後、自分の仕事をまっすぐ読めない唯一の人は自分です。知りすぎているので、脳が隙間を静かに埋め、穴が見えなくなります。

**修正 → `shower`:** あなたのセッションを見たことのない見知らぬ人に artifact だけを渡し、「これは本当に意味が通るか？」と聞きます。

> *先行例: [egoless programming](https://en.wikipedia.org/wiki/Egoless_programming) - 自分の仕事を客観的に review することはできない。誰か別の人が必要です (Gerald Weinberg, 1971)。ここでは、その誰かは context-free な sub-session です。*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - `shower` 自身の spec を、ファイルだけを持つゼロコンテキストの sub-session に渡しました。
- **Result** - 数分で、作者が見落とした三つの bug を見つけました。
  - 隠すべき答えをほのめかす step。
  - spoiler files を漏らす path。
  - 行動するには曖昧すぎる scope 。
- **So** - 自分の bug を捕まえる skill は、あなたの bug も捕まえられます。
</details>

### #3 - 同じ fact はどこにでも増える
timeout 値、決定、status。README、doc、ticket、Slack thread にコピーされます。コピーは drift し、どれが本当か誰にもわからなくなります。

**修正 → `ssotchk` + `ssotize`:** 散らばりを見つけ、canonical source を名付け、consolidate して残りをそこへ向けます。

> *先行例: [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) - 一つの fact 、一つの authoritative home (Hunt & Thomas, The Pragmatic Programmer, 1999)。*

### #4 - 「 validation を忘れるな」は発火しない
docs に埋めた guideline は、真新しい session では発火しません。まさに author bias が最も高い瞬間です。

**修正 → `sip`:** 何かを終えた瞬間、clean checks (`shower`, `ssotchk`, `re0`) を走らせ、 claim や eval があれば true checks (`factchk`, `mandela`) も自動で output に走らせます。

> *先行例: [dogfooding](https://en.wikipedia.org/wiki/Eating_your_own_dog_food) - eat your own dog food (Microsoft, 1988)。出す前に自分の料理を味見します。*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - すべての skill を self-contained にした大きな refactor の直後、`sip` が自動で発火しました。
- **Result** - fresh-eyes pass は、作者にはもう見えない二つを捕まえました。同じ refactor が削除した skill-to-skill links をまだ指す maintenance rule と、二つの skill にはある file-editing safety rule が、同じく files を編集する三つ目の skill にはない問題です。
- **So** - check は bias が最も高いところを噛みます。新しい artifact ではなく、大きな変更が残す drift、まさに作者の目が滑る場所です。
</details>

### #5 - session は移動しないが、git log は移動する
session は実行された場所に閉じ込められます。この agent 、この account、この machine。チームメイトや別の agent は、作業が起きた context を読み込めません。

**修正 → `re0-git`:** 完了した commit message をきれいにして、すべての環境が共有する `git log` に handoff を持たせます。誰でも log だけで引き継げます。

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - `re0-git` の最初の対象は、自分自身の release commit でした。
- **Result** - dogfooding で二つの fault が出て、どちらもfixされました。
  - trivia で膨らんだ message。
  - "no redundancy" を説きながら自分で繰り返す spec。
- **So** - 最初の cleanup は自分自身の後始末でした。
</details>

> [!NOTE]
> 上の五つの fixes は artifact を**きれい**に保ちます。次の三つは artifact を**真**に保ちます。同じく作者を信じない態度を、prose ではなく reasoning に向けます。

### #6 - 勘は source ではない
"Plausible"、"absurd"、"novel" はどんな artifact でも最も信頼できない行です。人間の priors は**両方向**に失敗します。実在するものを排除し（砂漠のカエルは存在します）、不可能なものを普通にしてしまいます（無重力の木箱）。

**修正 → `factchk`:** 現実に根ざした claim は、ship 前に外部 source と両方向で validation します。 source に届かないときは推測せず、flag します。

> *先行例: [WEIRD bias](https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/abs/weirdest-people-in-the-world/BF84F7517D56AFF7B7EB58411A554C17) (Henrich, Heine & Norenzayan, 2010) と [naive-physics / impetus error](https://www.science.org/doi/10.1126/science.210.4474.1139) (McCloskey, Caramazza & Green, 1980)。直感は現実を両方向に誤判定します。*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - `factchk` を自身の公開済み citations に両方向で走らせました。
- **Result** - すべて成立し、それでも二つの attribution slip を見つけました。有名な "what's measured becomes the target" の文言は Goodhart ではなく Strathern (1997) であり、"McCloskey 1980" は 1983 年の *Scientific American* 記事ではなく、共著の *Science* 論文です。
- **So** - 自分の footnotes を audit する fact-checker は、あなたの footnotes も audit します。
</details>

### #7 - eval は自分自身を確認する
model 、 scorer 、 designer が全員、結果は本物だと同意できます。しかし外部 ground truth はループに一度も入っていないかもしれません。部屋全体が、独立して起きていないことを自信を持って覚えているstateです。

**修正 → `mandela`:** eval、 metric 、 experiment を 8-pattern leakage taxonomy で audit します。外部 ground truth は独立に入っているか、それとも verifier が designer なのか？

> *先行例: [Goodhart's law](https://en.wikipedia.org/wiki/Goodhart%27s_law)、[data leakage](https://dl.acm.org/doi/10.1145/2382577.2382579) (Kaufman et al., 2012)、そして [circular analysis](https://www.nature.com/articles/nn.2303) の "double dipping" (Kriegeskorte et al., 2009)。*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - この audit は、一つの failure mode に何度も倒れた research design から抽出されました。 scorer 、 model 、 designer が結果に合意するが、外部 truth は何も生んでいない、というものです。
- **Result** - その一つの project で leakage は八つの形で現れました。自分が描いた bucket を scorer が採点する、二つの component が shared space で互いを「 validation 」する、private recipe が verifier を designer にする。これが skill の 8-pattern taxonomy になりました。
- **So** - checklist は理論ではありません。中のすべての pattern は一度血を流しています。
</details>

### #8 - 自分の計画は殺せない
自分で作ったので守ってしまいます。計画を壊す質問こそ、あなたが聞かない質問です。

**修正 → `hate`:** 計画に優しくしない。計画を殺せる load-bearing objection 一つと、それが重要かを証明する最も安い experiment を返します。ユーザーが呼び出します。意図して計画に向けるものです。

> *先行例: [egoless programming](https://en.wikipedia.org/wiki/Egoless_programming) (Weinberg, 1971。`shower` が引用する同じ根)、hostile review、fail-fast。*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - すべての research pass は adversarial critic で閉じられ、その verdict は常に root cause と、それを決着させる最も安い test でした。checklist ではありません。
- **Result** - "one more box drawn, not a sharper tip" で recombination engine を殺し、数字だけで human-holdout protocol も殺しました。36 が必要なところ n≈24、family-wise error rate は約 34%、原則を引用しながら反対を実装した design です。
- **So** - 重要な objection は常に単数で、安く test できました。まさに `hate` が返すよう固定された `{root, first nail}` です。
</details>

### #9 - 動いている build でも間違った product かもしれない
長い agentic cycle は、panels、routes、tests、screenshots など多くの動く部品を作ります。それらは価値より活動を証明し、sunk cost は architecture を持ち越させます。pass の間では次の一手が十数個の生きた thread にぼやけ、選択肢が多すぎること自体が麻痺になります。

**修正 → `retro` + `re0-work` + `flywheel` + `nba`:** lesson、anti-pattern、next gate を抽出します。基礎が間違っていればきれいな v0 からやり直します。 build → QA → retro → re0-work ループを回します。thread を失ったら state を読み、唯一の next best action を返します。再利用に値したものだけを残します。

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - ある game-engine demo は full-stack で runnable なstateに到達しました。API routes、canvas runtime、leaderboard、arcade pages、remix と telemetry panels、tests、screenshots。
- **Result** - それでも間違った product でした。生成された games は mock で、一画面で、durable replay layer がありませんでした。各 pass は unmet gates と parked threads の山の前で "what now?" に終わりました。
- **So** - 動き、ship できそうに見えることは done ではありません。 cycle には欠けた gate を名付ける skill と、一つの next move を返す skill が必要です。
</details>

### #10 - リスク近くの仕事は薄められて返ってくる
scraping、licensing、privacy、security など guardrails に触れる仕事を agent に向けると、最悪の両取りになります。危険な小片は refusals と retries を起こし、安全な 90% は hedged され、薄まり、または静かに欠けて返ってきます。

**修正 → `autobahn`:** 実行前に guardrail-adjacent な items を scope から切り出し、それぞれに safe alternative と archive entry を付けます。残りの scope は、危険な input を見ず carved prompt だけを見る fresh subagent が全力で走ります。descope ledger を出して、すべての除外を silent gap ではなく visible decision にします。すり抜けるのではなく、ask を取り除きます。autobahn に速度制限がないのは、入口規律が厳しい**から**です。

> *この夏そのものからの先行例: 米国は jailbroken safeguard 一つで [Fable 5 and Mythos 5 を suspended](https://www.anthropic.com/news/fable-mythos-access) し (Anthropic, 2026)、OpenAI は trusted partners に safety-stack-first で [GPT-5.6](https://openai.com/index/previewing-gpt-5-6-sol/) を出しました (OpenAI, 2026)。frontier では、fast lane は entry discipline が保つところまでしか開きません。*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - この方法は、confidential strategy doc の実際の rewrite から出ました。stealth tooling、trademarked names、privacy-adjacent profiling、scraping gray zones の四軸で同時に risk-adjacent でした。
- **Result** - main loop と十個の subagents が frontier model を end to end で走らせ、flags 0、refusals 0、fallbacks 0 でした。そしてすべての descoped item の safe alternative は、むしろより良い product になりました。
- **So** - main loop が carve し、clean subagents が safe scope を走り、その carve こそが全開で走れる理由でした。
</details>

<a id="credits"></a>
## クレジット

- **Built on** [mattpocock/skills](https://github.com/mattpocock/skills) (MIT) の architecture と philosophy。
- **fork ではありません** - これは [LilMGenius](https://github.com/LilMGenius) 独自の、重ならない workflows です。
- **Vendored verbatim** - いくつかの shared building blocks はそのまま保持し、 source ごとの attribution は [NOTICE](./NOTICE) にあります。
- **Authoring guide** - conventions と philosophy は [CLAUDE.md](./CLAUDE.md) にあります。
