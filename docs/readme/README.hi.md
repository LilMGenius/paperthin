<div align="center">

# Paperthin: लो-लेवल agentिक डिजाइन पैटर्न

<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/banner.svg" alt="Paperthin - लेखक पर नहीं, artifact पर भरोसा करें." width="820">

**पुरानी engineering wisdom को ऐसे reflexes में बदलना जिन्हें आपका agent अपने आप इस्तेमाल करे।**

**किसी भी** agent पर | Claude Code, Codex, OpenCode, Antigravity, Copilot, Cursor, Grok-Build, Pi, Hermes, OpenClaw आदि।

[Quickstart](#quickstart-15-seconds) · [Map](#the-map) · [Index](#the-index) · [Problem](#the-problem) · [Fixes](#the-fixes) · [Credits](#credits)

<sub>Read in: [English](../../README.md) · [中文](./README.zh-CN.md) · हिन्दी · [Español](./README.es.md) · [العربية](./README.ar.md) · [Português](./README.pt.md) · [Русский](./README.ru.md) · [日本語](./README.ja.md) · [Français](./README.fr.md) · [Deutsch](./README.de.md) · [한국어](./README.ko.md)</sub>

</div>

---

<a id="quickstart-15-seconds"></a>
## Quickstart (15 सेकंड)

1. जिन भी agents का आप उपयोग करते हैं, उनके लिए **install** करें:
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*'
   ```
2. अगर OS कहे तो इसे elevated/admin shell से चलाएं, ताकि skills copy न होकर symlink हों और अपने आप update होते रहें।
3. **अपडेट रहें**। जब अपडेट करना हो तब `/re0-upgrade` चलाएं; यह नई skills के लिए एक हल्की session-start सूचना भी चालू करता है।
4. **इन्हें इस्तेमाल करें**। किसी भी skill को `/re0` जैसे नाम से call करें; model-invoked खुद भी चल जाती हैं।

**पक्का नहीं?** यह command अपने agent में paste करें और बस कहें `set this up for me`। बाकी वह कर देगा।

<a id="the-map"></a>
## Map

**कितने artifacts, और कितने समय में फैले हुए?**

<div align="center">
<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/map.svg" alt="LilMGenius/paperthin का Paperthin map, दो-by-दो matrix. Horizontal axis cardinality (एक, फिर कई); vertical axis time (अभी, फिर iterations के पार); चार regions. Top-left, depth: एक artifact, अभी; क्या यह एक चीज clean और true है? Top-right, breadth: कई artifacts, अभी; क्या एक truth हर जगह consistent है? Bottom-left, coil: एक project, iterations के पार; क्या हर pass ने अगले को सिखाया? Bottom-right, mesh: कई minds, कई rounds के पार; क्या crowd truth पर converge करता है?" width="820">
</div>

<a id="the-index"></a>
## Index

### `depth/`

| Skill | क्या करता है | Scope | Invoker | read-only |
|---|---|---|---|---|
| 🧭 **[readchk](../../skills/depth/readchk/SKILL.md)** | request की read check करता है; सिर्फ बचा हुआ real fork दिखाता है | एक instruction | model | ✔ |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | सबसे सस्ता sufficient tier चुनता है: fast, standard, या frontier | एक task | model | ✔ |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | bait हटाता है, fresh reads fan out करता है, और divergence पहले report करता है | एक direction | user | ✔ |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | nice होने से इनकार करता है: plan को मार सकने वाली एक objection, और सबसे सस्ता test | एक plan | user | |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | unsafe scope को upfront carve करता है, safe rest को full strength पर चलाता है, descope record करता है | एक task | model | |
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | drift हुए artifact को एक clean v0 में rewrite करता है, एक और patch नहीं लगाता | एक artifact | model | |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | incidental stack nouns को उनके mechanism से बदलता है | एक durable artifact | model | |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | fresh, zero-context eyes से cold-read करता है: क्या यह अपने दम पर समझ आता है? | एक artifact | model | ✔ |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | sources के against जो दावा किया गया उसे दोनों दिशाओं में verify करता है: क्या absurd सच हो सकता है, और obvious झूठ? | एक claim | model | |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | leakage audit करता है: क्या बाहर की ground truth सच में अंदर आती है? | एक eval | model | ✔ |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | हर change के बाद repo के अपने clean-and-true checks से आपके output को taste करता है | आपका output | model | |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | em dash और उसके look-alikes हटाता है, हर जगह सही punctuation चुनता है | आपकी prose | user | |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | finished commit message को rewrite करता है ताकि `git log` अकेले handoff दे सके | एक commit | user | |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | shipping aur releasing checklist चलाता है, फिर confirm होने पर tag करके publish करता है | एक release | user | |

### `breadth/`

| Skill | क्या करता है | Scope | Invoker | read-only |
|---|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | scatter audit करता है, फिर fact को एक home में consolidate करके बाकी को उसकी ओर इंगित करता है | एक fact, कई जगह | model | |
| 🧰 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | एक कमांड में पूरे मौजूदा catalog तक ले आता है: नाम बदले हटाता है, नए जोड़ता है, सब पहले पुष्टि | आपकी skill install | user | |

### `coil/`

| Skill | क्या करता है | Scope | Invoker | read-only |
|---|---|---|---|---|
| 🧭 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | finished या failed cycle से lessons और anti-patterns निकालता है | एक finished cycle | model | |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | सिर्फ reuse कमाने वाले lessons रखते हुए v0 से restart करता है | एक restart | model | |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | build → QA → re0-memo → re0-work loop चलाता है ताकि learning compound करे, code नहीं | पूरा loop | model | |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | live state से खोया हुआ context फिर से बनाता है: उसे क्या चाहिए, क्या बदला, नए शब्दों का मतलब क्या है | एक re-entry | model | ✔ |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | live cycle state पढ़कर menu नहीं, single next best action देता है | live cycle | model | ✔ |
| 🗂️ **[re0-plan](../../skills/coil/re0-plan/SKILL.md)** | re0-loop की पहली turn से पहले नया iteration folder DESIGN/WORKFLOW/EVIDENCE के साथ खोलता है | एक नया cycle | user | |

### `mesh/`

*Development में - independent views को consensus में converge करना।*

*Invocation पर अधिक: [docs/invocation.md](../invocation.md)।*

<a id="the-problem"></a>
## Problem

**ज्यादातर agent skills slop होते हैं।**

Agent को goal दें और वह **add** करता है: और files, और options, और "helpful" boilerplate। Add करना progress जैसा दिखता है, और कुछ भी उसे वापस जाकर delete करने को मजबूर नहीं करता।

> [!WARNING]
> यही pattern project में दोहराएं तो परिचित AI-generated toolkit बनता है: लगभग duplicate skills, dead settings, ऐसा README जो वही बात तीन बार कहता है। Plausible, busy, और चुपचाप unmaintainable।

ये skills उलटी दिशा में bet करते हैं। **इनमें से हर एक remove करता है:**

- `re0` draft को patch करने के बजाय clean v0 में rewrite करता है।
- `readchk` request को दोबारा restate करता है और तभी पूछता है जब असली fork बचता है।
- `modelchk` काम शुरू होने से पहले सबसे सस्ता पर्याप्त tier तय करता है।
- `macrothink` fresh reads फैलाता है और convergence को proof मानने से पहले divergence report करता है।
- `autobahn` unsafe scope upfront carve करता है, ताकि safe remainder पूरी speed से चले।
- `detool` portable content के incidental tool नामों को उनके असल mechanism से बदलता है।
- `dedash` em-dash tell और उसके look-alikes तक हटाता है, एक-एक occurrence judge करके।
- `shower` वह काटता है जिसे कोई stranger follow नहीं कर सकता।
- `ssotize` files में फैले facts को audit करता है, approval मांगता है, फिर उन्हें एक home में collapse करता है।
- `re0-memo` / `re0-work` / `re0-loop` lesson बचाते हैं, गलत build को मरने देते हैं, और loop चलाए रखते हैं।
- `catchup` / `nba` live state से इंसान का map फिर बनाते हैं, फिर एक ही अगला move लौटाते हैं।
- `sip` यह सब अपने output पर automatically चलाता है।

> [!TIP]
> मुश्किल हिस्सा features add करना नहीं, restraint है। कोई pass अगर improve करने लायक कुछ नहीं पाता, तो कुछ नहीं बदलता। **वही restraint product है।**

<a id="the-fixes"></a>
## Fixes

पूरी Fixes narrative [English README](../../README.md#the-fixes) में एक canonical source के रूप में रहती है, ताकि proof examples translations में drift न करें। यह file index और local orientation के लिए रहती है।

<a id="credits"></a>
## Credits

- **Built on** [mattpocock/skills](https://github.com/mattpocock/skills) (MIT) - इसकी architecture और philosophy।
- **Fork नहीं** - ये [LilMGenius](https://github.com/LilMGenius) के अपने, non-overlapping workflows हैं।
- **Vendored verbatim** - कुछ shared building blocks, per-source attribution के साथ [NOTICE](../../NOTICE) में as-is रखे गए हैं।
- **Authoring guide** - conventions और philosophy [CLAUDE.md](../../CLAUDE.md) में हैं।
