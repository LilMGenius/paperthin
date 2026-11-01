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

**agent ごとに経路を一つ**だけ選んでください。二つ入れるとすべての skill が二重に読み込まれます。

1. **Claude Code**:
   ```bash
   claude plugin marketplace add LilMGenius/paperthin && claude plugin install paperthin@paperthin
   ```
   その後 Claude Code で `/plugin` を実行して **Marketplaces** を開き、`paperthin` を選んで **Enable auto-update** を一度だけ有効にします。
2. **Codex**: セッション開始のたびに自動で更新されます。
   ```bash
   codex plugin marketplace add LilMGenius/paperthin && codex plugin add paperthin@paperthin
   ```
3. **その他すべての agent**: 一行で skill と毎日の自動更新をまとめて入れます。
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*' && node "$HOME/.agents/skills/re0-upgrade/scripts/schedule/schedule.mjs" install
   ```
4. **使ってみましょう**。`/re0` のように名前で呼ぶだけです。作業に必要なときは自分から動き出す skill も多くあります。

**以前に入れていたら？** 新しいセッションで `/re0-upgrade` を一度実行してください。

**迷ったら？** agent に `install https://github.com/LilMGenius/paperthin` と伝えれば、[セットアップ手順](../../.agents/install-block.md#handed-only-this-repository)に沿って自分で入れてくれます。

**Web 版の ChatGPT や Claude なら？** `https://raw.githubusercontent.com/LilMGenius/paperthin/main/llms-full.txt` を渡してください。

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
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | 継ぎはぎを重ねて散らかった文書やファイルを、さらに直すのではなく、きれいな最初の版として書き直します | artifact 一つ | モデル | |
| 🧭 **[readback](../../skills/depth/readback/SKILL.md)** | 作業の前に依頼を正しく理解できたか確かめ、解釈が本当に分かれるときだけ質問します | instruction 一つ | モデル | ✔ |
| 🏹 **[aim](../../skills/depth/aim/SKILL.md)** | 渡されたファイルや文章を読んで、望んでいそうなことを先に提案します。あなたは確認するだけです | データ受け渡し一つ | モデル | ✔ |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | 仕事をきちんとこなせる範囲で、いちばん安いモデルの等級と考える深さを選びます | タスク一つ | モデル | ✔ |
| 🧹 **[elon](../../skills/depth/elon/SKILL.md)** | 習慣で残っているだけの要件を、それぞれの出どころを添えて外すよう提案します。外部で決められた規則には触れません | 未実装の要件群と各要件の出所 | モデル | ✔ |
| 🧩 **[scopechk](../../skills/depth/scopechk/SKILL.md)** | 新しく加えたいものがその場所にふさわしいか、相手が自ら書いた範囲に照らして確かめ、合わなければよりよい置き場所を示します | 一つの項目と、それが加わる対象 | モデル | ✔ |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | あえて辛口の批評家になり、計画を沈めかねない反論を一つと、それを最も安く確かめる方法を返します | 計画一つ | ユーザー | |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | あなたの前提を外した問いをいくつもの新しい視点に投げ、意見が割れたところから先に見せます | direction 一つ | ユーザー | ✔ |
| 🔀 **[crossthink](../../skills/depth/crossthink/SKILL.md)** | どの選択肢も似たり寄ったりに見えるとき、無関係な分野五つ以上から実際に効く仕組みを借り、新しいものだけを残します | 行き詰まった問題一つ | モデル | ✔ |
| ⚖️ **[re0-decide](../../skills/depth/re0-decide/SKILL.md)** | 決定のための資料をチェックリストに変え、結論はあなた自身の答えから出します。代わりに選ぶことはしません | 決定のために提出された資料 | ユーザー | ✔ |
| 🧐 **[whychk](../../skills/depth/whychk/SKILL.md)** | 下したばかりの決定を、あなたが説明できるまで問い詰め、できなければ論理の穴を指し示します | 決定一つ | ユーザー | ✔ |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | 作業の危ない部分を安全な代わりの案と一緒に先に切り分け、残りを全力で進め、外したものを記録します | タスク一つ | モデル | |
| 🎨 **[re0-style](../../skills/depth/re0-style/SKILL.md)** | コードがプロジェクト独自の書き方に沿っているか確かめます。既定では何も変えず、短い報告だけを書きます | レビュー中の変更一つ | モデル | |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | 長く残る文書にある製品名や道具の名前を、それが実際にしていることに置き換え、道具が変わっても文書が古びないようにします | durable artifact 一つ | モデル | |
| 🗜️ **[debloat](../../skills/depth/debloat/SKILL.md)** | 膨らんだ文章やコードを、必要な分だけに削ります。規則や動きは一つも失いません | artifact 一つ、文章かコード | モデル | |
| 🔃 **[re0-order](../../skills/depth/re0-order/SKILL.md)** | ばらばらになった一覧を、一つの決めごとに沿って並べ直します。項目を動かすだけで、言葉は変えません | listing 一つ | モデル | |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | エージェントが文中にばらまく長いダッシュを取り除き、ハイフンや範囲、見出しの区切りは残します | 自分の文章 | ユーザー | |
| ⸱ **[dedot](../../skills/depth/dedot/SKILL.md)** | 韓国語の文章で列挙をつなぐ中黒ごとに、読点やつなぎの言葉を理由とともに提案します | 書き手が範囲を指定した韓国語の文章やラベル行 | ユーザー | ✔ |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | 経緯を何も知らない新しい読み手に成果物を渡し、それだけで意味が通じるか尋ねます | artifact 一つ | モデル | ✔ |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | 主張を実際の出典と両方向から照らし合わせます。ばかげた話が本当で、当たり前の話が誤りのこともあるからです | claim 一つ | モデル | |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | テストや指標が自分で自分を採点していないか、外にある本当の事実が結果を決めているかを確かめます | eval 一つ | モデル | ✔ |
| 🎭 **[demock](../../skills/depth/demock/SKILL.md)** | 動いているコードの中で、成功の報告を偽りにする偽物の実装や黙った代替経路を見つけ、本物の直し方を提案します | 指定したファイル、ディレクトリ、diff | モデル | |
| 🥸 **[deid](../../skills/depth/deid/SKILL.md)** | 共有ファイルに紛れ込んだ一人の人や一社の情報を見つけて役割の名前に置き換え、まだそれを含む古いコミットを挙げます | 指定した成果物ひとつと持ち主ひとり | モデル | |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | 何かを変えた直後、終わったと言う前に、paperthin 自身のチェックを成果物にかけます | 自分の output | モデル | |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | 済んだコミットのメッセージを日付と位置はそのままに書き直し、履歴だけで誰でも引き継げるようにします | commit 一つ | ユーザー | |
| 🧨 **[re0-squash](../../skills/depth/re0-squash/SKILL.md)** | GitHub のリポジトリを、ファイルはそのままに署名付きのコミット一つとして公開し直し、古いコミットには二度と届かないようにします | リポジトリ一つ | ユーザー | |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | リリースのチェックリストを回し、あなたが確認したらタグを付けて公開します | release 一つ | ユーザー | |
| 🤝 **[re0-merge](../../skills/depth/re0-merge/SKILL.md)** | 他の人の貢献をレビューして取り込み、その人の功績を残し、手を入れた箇所はわけを説明します | 貢献 一つ | ユーザー | |

### `breadth/`

| Skill | 何をするか | scope | 呼び出し元 | 読み取り専用 |
|---|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | あちこちに写された事実を見つけ、承認を得てから一か所にまとめ、残りはそこを指すようにします | fact 一つ、多数の場所 | モデル | |
| 🔗 **[ssotize-local](../../skills/breadth/ssotize-local/SKILL.md)** | 重複したファイルやフォルダを実体一つにまとめ、残りはそこへのリンクにします。元に戻す手順も確かめておきます | 同じバイト列、多数のパス | モデル | |
| 📖 **[re0-readme](../../skills/breadth/re0-readme/SKILL.md)** | README と AGENTS.md を見て、一行ごとに、それを必要とする読み手のファイルへ移します | 一つのリポジトリの README と AGENTS.md | モデル | |
| 📥 **[re0-import](../../skills/breadth/re0-import/SKILL.md)** | 渡された資料を、既存のナレッジベースのふさわしい文書へその規則どおりに収め、置き場のないものは知らせます | 受け取った素材と一つの知識ベース | ユーザー | |
| 🆙 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | 確認一度で、インストールを最新の全カタログに揃えます。名前の変わったスキルは片づけ、新しいものは加えます | 自分の skill インストール | ユーザー | |

### `coil/`

| Skill | 何をするか | scope | 呼び出し元 | 読み取り専用 |
|---|---|---|---|---|
| 🗂️ **[re0-plan](../../skills/coil/re0-plan/SKILL.md)** | 新しい作業サイクルを始める前に、設計、作業の流れ、証拠のファイルを入れたフォルダを用意します | 新しい cycle 一つ | ユーザー | |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | 作る、試す、学ぶ、やり直すのサイクルを回し続け、コードではなく教訓が積み上がるようにします | ループ全体 | モデル | |
| 👁️ **[re0-watch](../../skills/coil/re0-watch/SKILL.md)** | 長いエージェント作業が止まっていないか見張って知らせます。立て直しはあなたが承認する提案にとどめます | 実行中のジョブ一つ | ユーザー | |
| 📝 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | 終わった、あるいは失敗したサイクルから、教訓と避けるべき失敗を引き出します | 完了した cycle 一つ | モデル | |
| 🔁 **[backprop](../../skills/coil/backprop/SKILL.md)** | 指摘から得た教訓を、その原因になった文書やルールに戻して直し、すっきり整えます | 教訓一つ | モデル | |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | 最初からやり直し、再利用する価値が確かめられた教訓だけを持ち越します | やり直し一つ | モデル | |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | 離れていた間のことに追いつかせます。あなたの出番、変わったこと、新しい言葉の意味を伝えます | re-entry 一つ | モデル | ✔ |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | 作業の現状を読み、選択肢の一覧ではなく、いちばんよい次の一手を一つだけ示します | 現在の cycle | モデル | ✔ |
| 🪜 **[re0-workflow](../../skills/coil/re0-workflow/SKILL.md)** | 一つの目標に向けて、どのスキルをどの順で使うかを勧めます。実行はしません | 明示された意図一つ | モデル | ✔ |
| 🎓 **[re0-tutorial](../../skills/coil/re0-tutorial/SKILL.md)** | スキル一つを三段階で教え、各段階はあなた自身が出した成果物で合格になります | スキル一つ | ユーザー | |

### `mesh/`

| Skill | 何をするか | scope | 呼び出し元 | 読み取り専用 |
|---|---|---|---|---|
| 🕸️ **[multithink](../../skills/mesh/multithink/SKILL.md)** | いくつもの独立した意見を、賛成の数ではなく、挙げられた根拠で比べます | 一つの artifact または問いに対する複数の読み | ユーザー | ✔ |

*呼び出しについて詳しくは [.agents/invocation.md](../../.agents/invocation.md) を参照。*

<a id="the-problem"></a>
## 問題

**ほとんどの agent skill は slop です。**

agent に目標を渡すと、agent は**足します**。ファイルを増やし、選択肢を増やし、「役に立つ」ボイラープレートを増やします。足すことは進捗に見え、何も戻って削除させません。

> [!WARNING]
> それをプロジェクト中で繰り返すと、見慣れた AI 生成ツールキットになります。ほぼ重複した skill、死んだ設定、同じことを三回言う README。もっともらしく、忙しそうで、静かに保守不能です。

これらの skill は逆に賭けます。**どれもが何かを取り除き**、何を取り除くかは[インデックス](#the-index)にあります。

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
- **Authoring guide** - conventions と philosophy は [AGENTS.md](../../AGENTS.md) にあります。
