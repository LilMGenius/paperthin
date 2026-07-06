<div align="center">

# Paperthin: लो-लेवल एजेंटिक डिजाइन पैटर्न

<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/banner.svg" alt="Paperthin - लेखक पर नहीं, artifact पर भरोसा करें." width="820">

**पुरानी engineering wisdom को ऐसे reflexes में बदलना जिन्हें आपका agent अपने आप इस्तेमाल करे।**

**किसी भी** agent पर | Claude Code, Codex, OpenCode, Antigravity, Copilot, Cursor, Grok-Build, Pi, Hermes, OpenClaw आदि।

[Quickstart](#quickstart-15-seconds) · [Map](#the-map) · [Index](#the-index) · [Problem](#the-problem) · [Fixes](#the-fixes) · [Credits](#credits)

Languages: [English](./README.md) · हिन्दी

</div>

---

<a id="quickstart-15-seconds"></a>
## Quickstart (15 सेकंड)

1. जिन भी agents का आप उपयोग करते हैं, उनके लिए **install** करें:
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*'
   ```
2. इसे elevated permissions के साथ चलाएं, ताकि skills copy न होकर symlink हों और अपने आप update होते रहें।
3. **इन्हें इस्तेमाल करें**। ये model-invoked हैं, इसलिए आपका agent जरूरत पड़ने पर खुद इन्हें उठाएगा। चाहें तो `/re0` जैसे नाम से सीधे call करें।

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

| Skill | क्या करता है | Scope | Invoker |
|---|---|---|---|
| ♻️ **[re0](./skills/depth/re0/SKILL.md)** | drift हुए artifact को एक clean v0 में rewrite करता है, एक और patch नहीं लगाता | एक artifact | model |
| 🚿 **[shower](./skills/depth/shower/SKILL.md)** | fresh, zero-context eyes से cold-read करता है: क्या यह अपने दम पर समझ आता है? *(read-only)* | एक artifact | model |
| 🔬 **[factchk](./skills/depth/factchk/SKILL.md)** | sources के against claim को दोनों दिशाओं में verify करता है: क्या absurd सच हो सकता है, और obvious झूठ? *(read-only → fix)* | एक claim | model |
| 🧪 **[mandela](./skills/depth/mandela/SKILL.md)** | validation में leakage audit करता है: क्या बाहर की ground truth सच में अंदर आती है? *(read-only)* | एक eval | model |
| 🛣️ **[autobahn](./skills/depth/autobahn/SKILL.md)** | unsafe scope को upfront carve करता है, safe rest को full strength पर चलाता है, descope ledger ship करता है | एक task | model |
| 🥄 **[sip](./skills/depth/sip/SKILL.md)** | हर change के बाद repo के अपने clean-and-true checks से आपके output को taste करता है | आपका output | model |
| 😈 **[hate](./skills/depth/hate/SKILL.md)** | nice होने से इनकार करता है: plan को मार सकने वाली एक objection + सबसे सस्ता test | एक plan | user |
| ✂️ **[dedash](./skills/depth/dedash/SKILL.md)** | em dash और उसके look-alikes हटाता है, हर जगह सही punctuation चुनता है | आपकी prose | user |
| 🧾 **[re0-git](./skills/depth/re0-git/SKILL.md)** | finished commit message को clean v0 में rewrite करता है ताकि `git log` अकेले handoff दे सके | एक commit | user |

### `breadth/`

| Skill | क्या करता है | Scope | Invoker |
|---|---|---|---|
| 🔎 **[ssotchk](./skills/breadth/ssotchk/SKILL.md)** | देखता है कि एक fact कहाँ scattered या duplicated है; canonical source नामित करता है *(read-only)* | एक fact, कई जगह | model |
| 🧲 **[ssotize](./skills/breadth/ssotize/SKILL.md)** | उसे एक home में consolidate करता है और बाकी को उसी की तरफ point कराता है | एक fact, कई जगह | model |
| 🧰 **[ppt-upgrade](./skills/breadth/ppt-upgrade/SKILL.md)** | releases के बाद old installed Paperthin skill names reconcile करता है | installed skill names | user |

### `coil/`

| Skill | क्या करता है | Scope | Invoker |
|---|---|---|---|
| 🧭 **[retro](./skills/coil/retro/SKILL.md)** | finished या failed cycle से lessons और anti-patterns निकालता है | एक finished cycle | model |
| 🧱 **[re0-work](./skills/coil/re0-work/SKILL.md)** | सिर्फ reuse कमाने वाले lessons रखते हुए v0 से restart करता है | एक restart | model |
| 🌀 **[flywheel](./skills/coil/flywheel/SKILL.md)** | build → QA → retro → re0-work loop चलाता है ताकि learning compound करे, code नहीं | पूरा loop | model |
| 🎯 **[nba](./skills/coil/nba/SKILL.md)** | live cycle state पढ़कर menu नहीं, single next best action देता है *(read-only)* | live cycle | model |

### `mesh/`

*Development में - independent views को consensus में converge करना।*

*Invocation पर अधिक: [docs/invocation.md](./docs/invocation.md)।*

<a id="the-problem"></a>
## Problem

**ज्यादातर agent skills slop होते हैं।**

Agent को goal दें और वह **add** करता है: और files, और options, और "helpful" boilerplate। Add करना progress जैसा दिखता है, और कुछ भी उसे वापस जाकर delete करने को मजबूर नहीं करता।

> [!WARNING]
> यही pattern project में दोहराएं तो परिचित AI-generated toolkit बनता है: लगभग duplicate skills, dead settings, ऐसा README जो वही बात तीन बार कहता है। Plausible, busy, और चुपचाप unmaintainable।

ये skills उलटी दिशा में bet करते हैं। **इनमें से हर एक remove करता है:**

- `re0` draft को patch करने के बजाय clean v0 में rewrite करता है।
- `ssotchk` / `ssotize` files में फैले same fact को collapse करते हैं।
- `shower` वह काटता है जिसे कोई stranger follow नहीं कर सकता।
- `retro` / `re0-work` lesson बचाते हैं और गलत build को मरने देते हैं।
- `autobahn` unsafe scope upfront carve करता है, ताकि safe remainder पूरी speed से चले।
- `dedash` em-dash tell और उसके look-alikes तक हटाता है, एक-एक occurrence judge करके।
- `sip` यह सब अपने output पर automatically चलाता है।

> [!TIP]
> मुश्किल हिस्सा features add करना नहीं, restraint है। कोई pass अगर improve करने लायक कुछ नहीं पाता, तो कुछ नहीं बदलता। **वही restraint product है।**

<a id="the-fixes"></a>
## Fixes

<!-- Fixes follow the lifecycle of a piece of work, not the skill list: keep it clean (draft → read fresh → reconcile across files → automate → ship), keep it true (a single claim → a validation → the whole plan), then keep the loop learning and the run unblocked. Slot any new fix in by where it acts in that arc. -->

**हर एक एक well-worn principle है, जिसे automatic बनाया गया है।**

### #1 - Artifacts सड़ते हैं
Session में doc को टुकड़ा-टुकड़ा edit करें और वह फूल जाता है: stale deltas, duplicated noise, changelog scars। ऊपर patch लगाना बस rot को preserve करता है।

**Fix → `re0`:** artifact को clean v0 की तरह rewrite करना, जैसे यह पहली version हो।

> *Prior art: Boy Scout Rule - "leave it cleaner than you found it" (Robert C. Martin, [Clean Code](https://www.informit.com/articles/article.aspx?p=1235624&seqNum=6), 2008)। `re0` आगे जाता है: rewrite, सिर्फ tidy नहीं।*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - हमने `re0` से इन docs को एक बार और refresh करने को कहा, लेकिन वे पहले से v0 पर थे।
- **Result** - उसे improve करने लायक कुछ नहीं मिला और prose की कोई line नहीं बदली।
- **So** - जो tool गलत न होने पर कुछ नहीं करता, वह repo को कभी bloat नहीं करता: ये skills noise हटाते हैं, जोड़ते नहीं।
</details>

### #2 - आप अपने काम के प्रति blind हो जाते हैं
Long session के बाद आप वही एक व्यक्ति होते हैं जो अपना काम सीधे नहीं पढ़ सकता। आप बहुत कुछ जानते हैं, इसलिए आपका दिमाग हर gap चुपचाप भर देता है और holes invisible हो जाते हैं।

**Fix → `shower`:** ऐसे stranger को सिर्फ artifact दें जिसने आपकी session कभी न देखी हो, और पूछें: "क्या यह सच में sense बनाता है?"

> *Prior art: [egoless programming](https://en.wikipedia.org/wiki/Egoless_programming) - आप अपने काम को objectively review नहीं कर सकते; किसी और को करना होगा (Gerald Weinberg, 1971)। यहां वह कोई context-free sub-session है।*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - हमने `shower` की अपनी spec, zero-context sub-session को दी जिसके पास सिर्फ file थी।
- **Result** - minutes में उसने author से छूटे तीन bugs पकड़े:
  - एक step जो छुपाने वाली answer hint कर रहा था,
  - एक path जो spoiler files leak कर रहा था,
  - एक scope जो action के लिए बहुत vague था।
- **So** - जो skill अपने bugs पकड़ता है, वह आपके भी पकड़ सकता है।
</details>

### #3 - वही fact हर जगह पहुंच जाता है
Timeout value, decision, status: README, doc, ticket और Slack thread में copy। Copies drift करती हैं, और अब किसी को नहीं पता कौन सच है।

**Fix → `ssotchk` + `ssotize`:** scatter ढूंढना, canonical source नामित करना, फिर consolidate करके बाकी को उसकी तरफ point कराना।

> *Prior art: [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) - one fact, one authoritative home (Hunt & Thomas, The Pragmatic Programmer, 1999)।*

### #4 - "Verify याद रखना" कभी fire नहीं होता
Docs में दबी guideline brand-new session में trigger नहीं होगी, ठीक तब जब author bias सबसे ज्यादा होता है।

**Fix → `sip`:** जैसे ही आप कुछ finish करते हैं, यह clean checks (`shower`, `ssotchk`, `re0`) चलाता है और claim या eval होने पर true checks (`factchk`, `mandela`) भी आपके output पर automatically चलाता है।

> *Prior art: [dogfooding](https://en.wikipedia.org/wiki/Eating_your_own_dog_food) - eat your own dog food (Microsoft, 1988)। Serve करने से पहले अपनी cooking taste करें।*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - बड़े refactor के तुरंत बाद जिसने हर skill को self-contained बनाया, `sip` auto-fired हुआ।
- **Result** - उसके fresh-eyes pass ने दो चीजें पकड़ीं जो author अब नहीं देख सकता था: maintenance rule अभी भी उन skill-to-skill links की तरफ point कर रहा था जिन्हें उसी refactor ने delete किया था; और file-editing safety rule दो skills में था लेकिन तीसरे में missing था, जबकि वह भी files edit करता है।
- **So** - check वहीं काटता है जहां bias सबसे ज्यादा होता है: fresh artifact पर नहीं, बल्कि बड़े change के बाद बची drift पर, ठीक जहां author की आंखें फिसल जाती हैं।
</details>

### #5 - Session travel नहीं करती; git log करता है
आपकी session वहीं अटकी रहती है जहां वह चली: यह agent, यह account, यह machine। Teammate या दूसरा agent उस context को load नहीं कर सकता जिसमें काम हुआ।

**Fix → `re0-git`:** finished commit message साफ करना ताकि `git log`, जो हर environment share करता है, handoff carry करे और कोई भी सिर्फ log से pick up कर सके।

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - `re0-git` का पहला target उसका अपना release commit था।
- **Result** - dogfooding से दो faults निकले, दोनों fixed:
  - trivia से padded message,
  - ऐसी spec जो "no redundancy" preach करते हुए खुद repeat कर रही थी।
- **So** - उसका पहला cleanup खुद के बाद था।
</details>

> [!NOTE]
> ऊपर के पांच fixes artifact को **clean** रखते हैं। अगले तीन उसे **true** रखते हैं: author पर वही distrust, prose की जगह reasoning पर।

### #6 - Gut feeling source नहीं है
"Plausible", "absurd", "novel" किसी भी artifact की सबसे unreliable line है। Human priors **दोनों दिशाओं** में fail करते हैं: real को exclude करते हैं (desert frogs exist) और impossible को normalize करते हैं (weightless crates)।

**Fix → `factchk`:** Reality-grounded claim को ship से पहले external sources के खिलाफ दोनों दिशाओं में verify करना, और source न मिलने पर guess नहीं, flag करना।

> *Prior art: [WEIRD bias](https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/abs/weirdest-people-in-the-world/BF84F7517D56AFF7B7EB58411A554C17) (Henrich, Heine & Norenzayan, 2010) और [naive-physics / impetus error](https://www.science.org/doi/10.1126/science.210.4474.1139) (McCloskey, Caramazza & Green, 1980) - intuition reality को दोनों दिशाओं में गलत judge करती है।*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - हमने `factchk` को उसके अपने shipped citations पर दोनों दिशाओं में चलाया।
- **Result** - सब held, और फिर भी उसने दो attribution slips पकड़े: famous "what's measured becomes the target" wording Strathern (1997) है, Goodhart नहीं; और "McCloskey 1980" co-authored *Science* paper है, 1983 *Scientific American* piece नहीं।
- **So** - जो fact-checker अपनी footnotes audit करता है, वह आपकी भी audit करेगा।
</details>

### #7 - Eval खुद को confirm कर लेता है
Model, scorer और designer सभी agree कर सकते हैं कि result real है, जबकि कोई outside ground-truth loop में कभी आया ही नहीं। पूरा room confidently कुछ ऐसा याद कर रहा होता है जो independently हुआ ही नहीं।

**Fix → `mandela`:** किसी भी eval, metric या experiment को 8-pattern leakage taxonomy के खिलाफ audit करना: क्या external ground-truth independently enter करती है, या verifier ही designer है?

> *Prior art: [Goodhart's law](https://en.wikipedia.org/wiki/Goodhart%27s_law), [data leakage](https://dl.acm.org/doi/10.1145/2382577.2382579) (Kaufman et al., 2012), और [circular analysis](https://www.nature.com/articles/nn.2303) - "double dipping" (Kriegeskorte et al., 2009)।*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - Audit उस research design से distilled था जो एक ही failure mode से मरता रहा: scorer, model और designer result पर agree कर रहे थे, लेकिन कोई outside truth उसे produce नहीं कर रही थी।
- **Result** - उस एक project में leakage आठ shapes में surfaced हुई: scorer उन्हीं buckets को grade कर रहा था जिन्हें उसने draw किया, shared space में दो components एक-दूसरे को "verify" कर रहे थे, private recipe verifier को designer बना रही थी। वही catalog skill की 8-pattern taxonomy बना।
- **So** - checklist theoretical नहीं है: हर pattern एक बार खून निकाल चुका है।
</details>

### #8 - आप अपना plan नहीं मार सकते
आपने बनाया है, इसलिए आप defend करते हैं। जो questions इसे तोड़ सकते हैं, वे ही questions आप नहीं पूछेंगे।

**Fix → `hate`:** plan से nice होने से इनकार करना; एक load-bearing objection लौटाना जो उसे मार सकती है और सबसे सस्ता experiment जो prove करे कि वह matter करती है। User-invoked: आप जानबूझकर इसे plan पर point करते हैं।

> *Prior art: [egoless programming](https://en.wikipedia.org/wiki/Egoless_programming) (Weinberg, 1971 - वही root जिसे `shower` cite करता है), hostile review, और fail-fast।*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - हर research pass adversarial critic से close हुआ, और उसका verdict हमेशा एक root cause plus cheapest test था, checklist कभी नहीं।
- **Result** - उसने recombination engine को "one more box drawn, not a sharper tip" से मारा, और human-holdout protocol को सिर्फ numbers पर: n≈24 जहां 36 चाहिए था, family-wise error rate करीब 34%, और ऐसा design जो principle cite करके उसका opposite implement कर रहा था।
- **So** - जो objection matter करती थी वह हमेशा singular और cheap to test थी, ठीक वही `{root, first nail}` जिसे `hate` return करने के लिए locked है।
</details>

### #9 - Running build फिर भी गलत product हो सकता है
Long agentic cycles कई working parts बनाते हैं: panels, routes, tests, screenshots। ये value से ज्यादा activity prove करते हैं, और sunk cost architecture carry forward करने को ललचाता है। Passes के बीच next move एक दर्जन live threads में blur हो जाता है, और बहुत सारे options अपनी paralysis बन जाते हैं।

**Fix → `retro` + `re0-work` + `flywheel` + `nba`:** lesson, anti-pattern और next gate extract करना; foundation गलत हो तो clean v0 से restart करना; build → QA → retro → re0-work loop चलाना; और thread lost हो जाए तो state पढ़कर single next best action लौटाना। सिर्फ वही रखें जिसने reuse कमाया है।

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - game-engine demo full-stack, runnable state तक पहुंचा: API routes, canvas runtime, leaderboard, arcade pages, remix और telemetry panels, tests, screenshots।
- **Result** - फिर भी वह गलत product था: generated games mock, one-screen, durable replay layer के बिना थे; हर pass unmet gates और parked threads के pile के सामने "what now?" पर खत्म हुआ।
- **So** - running और shipping-shaped होना done नहीं है; cycle को missing gate नाम देने वाला skill और single next move लौटाने वाला skill चाहिए।
</details>

### #10 - Risk-adjacent काम hedged होकर लौटता है
Agent को scraping, licensing, privacy, security जैसे guardrails छूते task पर लगाएं और दोनों worlds का worst मिलता है: risky sliver refusals और retries trigger करता है, जबकि safe 90% hedged, diluted या चुपचाप missing लौटता है।

**Fix → `autobahn`:** guardrail-adjacent items को execution से पहले carve out करना, हर एक के साथ safe alternative और archive entry; remaining scope fresh subagent में full strength पर चलाना जो carved prompt ही देखे, risky input नहीं; descope ledger ship करना ताकि हर exclusion visible decision हो, silent gap नहीं। यह ask को slip कराने के बजाय remove करता है। Autobahn पर speed limit नहीं है **क्योंकि** entry discipline strict है।

> *इसी summer से prior art: US ने एक jailbroken safeguard पर [Fable 5 and Mythos 5 suspended](https://www.anthropic.com/news/fable-mythos-access) किए (Anthropic, 2026), और OpenAI ने trusted partners को safety-stack-first [GPT-5.6](https://openai.com/index/previewing-gpt-5-6-sol/) ship किया (OpenAI, 2026)। Frontier पर fast lane उतनी ही खुली रहती है जितनी entry discipline टिकती है।*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - Method एक live rewrite से निकला था: confidential strategy doc, जो चार axes पर risk-adjacent था: stealth tooling, trademarked names, privacy-adjacent profiling, scraping gray zones।
- **Result** - Main loop plus दस subagents ने frontier model end to end चलाया: zero flags, zero refusals, zero fallbacks। और हर descoped item's safe alternative वैसे भी better product निकला।
- **So** - main loop ने carve किया, clean subagents ने safe scope चलाया, और वही carve था जिसने उन्हें floor it करने दिया।
</details>

<a id="credits"></a>
## Credits

- **Built on** [mattpocock/skills](https://github.com/mattpocock/skills) (MIT) - इसकी architecture और philosophy।
- **Fork नहीं** - ये [LilMGenius](https://github.com/LilMGenius) के अपने, non-overlapping workflows हैं।
- **Vendored verbatim** - कुछ shared building blocks, per-source attribution के साथ [NOTICE](./NOTICE) में as-is रखे गए हैं।
- **Authoring guide** - conventions और philosophy [CLAUDE.md](./CLAUDE.md) में हैं।
