<div align="center">

# Paperthin: 低レベルの agent 設計パターン

<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/banner.svg" alt="Paperthin - 作者ではなく artifact を信じる。" width="820">

**昔からあるエンジニアリングの知恵を、agent が自分で取りに行く反射動作に変える。**

**どの**agent でも | Claude Code、Codex、OpenCode、Antigravity、Copilot、Cursor、Grok-Build、Pi、Hermes、OpenClaw など。

[クイックスタート](#quickstart-15-seconds) · [マップ](#the-map) · [インデックス](#the-index) · [問題](#the-problem) · [修正](#the-fixes) · [クレジット](#credits)

<sub>Read in: [English](../../README.md) · [中文](./README.zh-CN.md) · [हिन्दी](./README.hi.md) · [Español](./README.es.md) · [العربية](./README.ar.md) · [Português](./README.pt.md) · [Русский](./README.ru.md) · 日本語 · [Français](./README.fr.md) · [Deutsch](./README.de.md) · [한국어](./README.ko.md)</sub>

</div>

---

<a id="quickstart-15-seconds"></a>
## クイックスタート（15秒）

1. 使っているすべての agent に**インストール**します。
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*'
   ```
2. OS が求める場合は昇格/admin シェルで実行し、skills がコピーではなく symlink されるようにします。そうすると自動更新されます。
3. **使います**。model invocation をサポートする agent は model-invoked skills に自動で到達します。どの skill も `/re0` のように名前で呼べますが、user-invoked skills はその方法でだけ実行されます。

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
| 🧭 **[readchk](../../skills/depth/readchk/SKILL.md)** | 非自明な作業の前に依頼の読みを確認し、残った本物の分岐だけを出す *(読み取り専用)* | instruction 一つ | モデル |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | 十分な最安 tier を選ぶ: fast、standard、frontier *(読み取り専用)* | タスク一つ | モデル |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | session の bait を外し、新しい読みを fan out して、divergence を最初に報告する *(読み取り専用)* | direction 一つ | ユーザー |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | 優しくしない。計画を殺せる一つの反論と、最も安いテストを返す | 計画一つ | ユーザー |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | 危険な scope を先に切り出し、安全な残りを全力で走らせ、descope ledger を出す | タスク一つ | モデル |
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | drift した artifact を、さらにパッチするのではなく、きれいな v0 として書き直す | artifact 一つ | モデル |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | portable な内容に紛れた incidental な stack 名を、意図した mechanism に置き換える | durable artifact 一つ | モデル |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | 新鮮でゼロコンテキストの目で冷たく読む。これ単体で成立するか？ *(読み取り専用)* | artifact 一つ | モデル |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | claim を source に対して両方向に validation する。ばかげたことが本当で、当然に見えることが偽かもしれないか？ *(読み取り専用 → 修正)* | claim 一つ | モデル |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | validation の leakage を監査する。外部 ground truth は実際に入っているか？ *(読み取り専用)* | eval 一つ | モデル |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | 変更後、自分の output を repo 自身の clean-and-true checks で味見する | 自分の output | モデル |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | em dash とその類似物を取り除き、各場所に必要な句読点を選ぶ | 自分の文章 | ユーザー |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | 完了した commit message をきれいな v0 に書き直し、`git log` だけで引き継げるようにする | commit 一つ | ユーザー |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | shipping と releasing のチェックリストを実行し、確認後に tag して publish する | release 一つ | ユーザー |

### `breadth/`

| Skill | 何をするか | scope | 呼び出し元 |
|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | 散らばりを監査し、承認を求めてから fact を一つの家に consolidate する | fact 一つ、多数の場所 | モデル |
| 🧰 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | インストール済みの skill を一つのコマンドで安全に最新化する。古いものは残らず、余計なものも増えない | 自分の skill インストール | ユーザー |

### `coil/`

| Skill | 何をするか | scope | 呼び出し元 |
|---|---|---|---|
| 🧭 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | 完了または失敗した cycle から教訓と anti-pattern を抽出する | 完了した cycle 一つ | モデル |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | 再利用に値した教訓だけを残して v0 からやり直す | やり直し一つ | モデル |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | build → QA → re0-memo → re0-work ループを回し、コードではなく学習を複利化する | ループ全体 | モデル |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | ライブ state から人間が失った context を再構築する。何が必要か、何が変わったか、新しい言葉が何を意味するか *(読み取り専用)* | re-entry 一つ | モデル |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | live cycle state を読み、メニューではなく一つの next best action を返す *(読み取り専用)* | 現在の cycle | モデル |

### `mesh/`

*開発中 - 独立した視点を合意へ収束させる。*

*呼び出しについて詳しくは [docs/invocation.md](../invocation.md) を参照。*

<a id="the-problem"></a>
## 問題

**ほとんどの agent skill は slop です。**

agent に目標を渡すと、agent は**足します**。ファイルを増やし、選択肢を増やし、「役に立つ」ボイラープレートを増やします。足すことは進捗に見え、何も戻って削除させません。

> [!WARNING]
> それをプロジェクト中で繰り返すと、見慣れた AI 生成ツールキットになります。ほぼ重複した skill、死んだ設定、同じことを三回言う README。もっともらしく、忙しそうで、静かに保守不能です。

これらの skill は逆に賭けます。**すべてが何かを取り除きます。**

- `re0` は draft を patch せず、きれいな v0 に書き直します。
- `ssotize` はファイル間に散らばった fact を監査し、承認を求めてから一つの家に畳みます。
- `shower` は見知らぬ人が追えない部分を切ります。
- `re0-memo` / `re0-work` は教訓を保存し、間違った build を死なせます。
- `autobahn` は危険な scope を先に切り、安全な残りが全速力で走れるようにします。
- `dedash` は em dash の癖とその類似物さえ、一つずつ判断して取り除きます。
- `sip` はそのすべてを自分の output に自動で実行します。

> [!TIP]
> 難しいのは機能追加ではなく、抑制です。改善点を見つけない pass は何も変えません。**その抑制こそが製品です。**

<a id="the-fixes"></a>
## Fixes

Fixes の完全な narrative は [English README](../../README.md#the-fixes) を唯一の canonical source とします。proof examples が翻訳間で drift しないようにするためです。このファイルは index と local orientation のために残します。

<a id="credits"></a>
## クレジット

- **Built on** [mattpocock/skills](https://github.com/mattpocock/skills) (MIT) の architecture と philosophy。
- **fork ではありません** - これは [LilMGenius](https://github.com/LilMGenius) 独自の、重ならない workflows です。
- **Vendored verbatim** - いくつかの shared building blocks はそのまま保持し、 source ごとの attribution は [NOTICE](../../NOTICE) にあります。
- **Authoring guide** - conventions と philosophy は [CLAUDE.md](../../CLAUDE.md) にあります。
