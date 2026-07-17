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
3. **最新に保つ**。更新したいときに `/re0-upgrade` を実行します。新しい skill が出たら知らせる控えめな session-start 通知も有効になります。
4. **使います**。どの skill も `/re0` のように名前で呼べます。model-invoked は自動でも動きます。

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

| Skill | 何をするか | scope | 呼び出し元 | 読み取り専用 |
|---|---|---|---|---|
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | drift した artifact を、さらにパッチするのではなく、きれいな v0 として書き直す | artifact 一つ | モデル | |
| 🧭 **[readchk](../../skills/depth/readchk/SKILL.md)** | 依頼の読みを確認し、残った本物の分岐だけを出す | instruction 一つ | モデル | ✔ |
| 🏹 **[aim](../../skills/depth/aim/SKILL.md)** | 引き継がれたデータを読み、尋ねる代わりに、確認すべき意図を提案する | データ受け渡し一つ | モデル | ✔ |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | 十分な最安 tier を選ぶ: fast、standard、frontier | タスク一つ | モデル | ✔ |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | 優しくしない。計画を殺せる一つの反論と、最も安いテストを返す | 計画一つ | ユーザー | |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | bait を外し、新しい読みを fan out して、divergence を最初に報告する | direction 一つ | ユーザー | ✔ |
| 🧐 **[feynman](../../skills/depth/feynman/SKILL.md)** | 下したばかりの決定を、説明できるまで問い詰め、できなければ隙間を指摘する | 決定一つ | ユーザー | ✔ |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | 危険な scope を先に切り出し、安全な残りを全力で走らせ、descope を記録する | タスク一つ | モデル | |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | 紛れた incidental な stack 名を、意図した mechanism に置き換える | durable artifact 一つ | モデル | |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | em dash とその類似物を取り除き、各場所に必要な句読点を選ぶ | 自分の文章 | ユーザー | |
| 🔃 **[reorder](../../skills/depth/reorder/SKILL.md)** | 一つの原則のもとで、drift した listing を論理的な順序に整え直す。項目を動かすだけで、文言は変えない | listing 一つ | ユーザー | |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | 新鮮でゼロコンテキストの目で冷たく読む。これ単体で成立するか？ | artifact 一つ | モデル | ✔ |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | 主張されたことを source に両方向で照合する。ばかげたことが本当で、当然に見えることが偽かもしれないか？ | claim 一つ | モデル | |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | leakage を監査する。外部 ground truth は実際に入っているか？ | eval 一つ | モデル | ✔ |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | 変更後、自分の output を repo 自身の clean-and-true checks で味見する | 自分の output | モデル | |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | 完了した commit message を書き直し、`git log` だけで引き継げるようにする | commit 一つ | ユーザー | |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | shipping と releasing のチェックリストを実行し、確認後に tag して publish する | release 一つ | ユーザー | |

### `breadth/`

| Skill | 何をするか | scope | 呼び出し元 | 読み取り専用 |
|---|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | 散らばりを監査し、fact を一つの家に consolidate して残りをそこへ向ける | fact 一つ、多数の場所 | モデル | |
| 🧰 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | 一つのコマンドで現在のフルカタログに引き上げる: 改名は整理、新規は追加、すべて事前に確認 | 自分の skill インストール | ユーザー | |

### `coil/`

| Skill | 何をするか | scope | 呼び出し元 | 読み取り専用 |
|---|---|---|---|---|
| 🗂️ **[re0-plan](../../skills/coil/re0-plan/SKILL.md)** | re0-loop の最初の turn の前に新しい iteration フォルダを開き、DESIGN/WORKFLOW/EVIDENCE を書き込む | 新しい cycle 一つ | ユーザー | |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | build → QA → re0-memo → re0-work ループを回し、コードではなく学習を複利化する | ループ全体 | モデル | |
| 🧭 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | 完了または失敗した cycle から教訓と anti-pattern を抽出する | 完了した cycle 一つ | モデル | |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | 再利用に値した教訓だけを残して v0 からやり直す | やり直し一つ | モデル | |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | ライブ state から失った context を再構築する: 何が必要か、何が変わったか、新しい言葉が何を意味するか | re-entry 一つ | モデル | ✔ |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | live cycle state を読み、メニューではなく一つの next best action を返す | 現在の cycle | モデル | ✔ |

### `mesh/`

| Skill | 何をするか | scope | 呼び出し元 | 読み取り専用 |
|---|---|---|---|---|
| 🔺 **[prism](../../skills/mesh/prism/SKILL.md)** | 一つの artifact を独立した複数のレンズに分ける。ぶつかる箇所と、それを解く問いを返す | artifact 一つ | ユーザー | ✔ |

*呼び出しについて詳しくは [docs/invocation.md](../invocation.md) を参照。*

<a id="the-problem"></a>
## 問題

**ほとんどの agent skill は slop です。**

agent に目標を渡すと、agent は**足します**。ファイルを増やし、選択肢を増やし、「役に立つ」ボイラープレートを増やします。足すことは進捗に見え、何も戻って削除させません。

> [!WARNING]
> それをプロジェクト中で繰り返すと、見慣れた AI 生成ツールキットになります。ほぼ重複した skill、死んだ設定、同じことを三回言う README。もっともらしく、忙しそうで、静かに保守不能です。

これらの skill は逆に賭けます。**すべてが何かを取り除きます。**

- `re0` は draft を patch せず、きれいな v0 に書き直します。
- `readchk` はリクエストを内部で言い直し、本当に分かれ道が残るときだけ尋ねます。
- `modelchk` は作業が始まる前に十分な最安の tier を決めます。
- `macrothink` は新しい読みを展開し、収束が証拠に見える前に divergence を報告します。
- `autobahn` は危険な scope を先に切り、安全な残りが全速力で走れるようにします。
- `detool` は portable なコンテンツにある偶発的なツール名を、意味する mechanism に置き換えます。
- `dedash` は em dash の癖とその類似物さえ、一つずつ判断して取り除きます。
- `shower` は見知らぬ人が追えない部分を切ります。
- `ssotize` はファイル間に散らばった fact を監査し、承認を求めてから一つの家に畳みます。
- `re0-memo` / `re0-work` / `re0-loop` は教訓を保存し、間違った build を死なせ、loop を回し続けます。
- `catchup` / `nba` はライブ state から人間の地図を再構築し、次の一手だけを返します。
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
