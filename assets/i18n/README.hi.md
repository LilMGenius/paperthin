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

**हर agent के लिए एक ही रास्ता** चुनें; दो लगाने से हर skill दो बार लोड होती है।

1. **Claude Code**:
   ```bash
   claude plugin marketplace add LilMGenius/paperthin && claude plugin install paperthin@paperthin
   ```
   फिर Claude Code में `/plugin` चलाएं, **Marketplaces** खोलें, `paperthin` चुनें और एक बार **Enable auto-update** चालू करें।
2. **Codex**: हर session शुरू होने पर खुद अपडेट होता है।
   ```bash
   codex plugin marketplace add LilMGenius/paperthin && codex plugin add paperthin@paperthin
   ```
3. **बाकी हर agent**: एक ही line skills और रोज़ का अपडेट, दोनों लगा देती है।
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*' && node "$HOME/.agents/skills/re0-upgrade/scripts/schedule/schedule.mjs" install
   ```
4. **इस्तेमाल करें**। किसी भी skill को `/re0` की तरह नाम से बुलाएं; कई skills काम की ज़रूरत होने पर खुद भी चल पड़ती हैं।

**पहले install किया था?** नए session में एक बार `/re0-upgrade` चलाएं।

**पक्का नहीं?** अपने agent से कहें `install https://github.com/LilMGenius/paperthin`; वह [setup के steps](../../.agents/install-block.md#handed-only-this-repository) खुद पूरे करेगा।

**वेब पर ChatGPT या Claude?** उसे `https://raw.githubusercontent.com/LilMGenius/paperthin/main/llms-full.txt` दें।

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
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | बार-बार पैच होकर उलझे दस्तावेज़ या फ़ाइल को फिर से पैच करने के बजाय साफ़ पहले संस्करण की तरह दोबारा लिखता है | एक artifact | model | |
| 🧭 **[readback](../../skills/depth/readback/SKILL.md)** | काम शुरू करने से पहले जांचता है कि उसने आपका अनुरोध सही समझा, और तभी पूछता है जब दो मतलब सच में अलग हों | एक instruction | model | ✔ |
| 🏹 **[aim](../../skills/depth/aim/SKILL.md)** | आपकी दी हुई फ़ाइलें या लिखा हुआ पढ़कर बताता है कि आप शायद क्या चाहते हैं, ताकि आपको बस हां कहना हो | एक data drop | model | ✔ |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | काम अच्छे से पूरा करने लायक सबसे सस्ता मॉडल स्तर और सोचने की गहराई चुनता है | एक task | model | ✔ |
| 🧹 **[elon](../../skills/depth/elon/SKILL.md)** | सिर्फ़ आदत से चली आ रही ज़रूरतें हटाने का सुझाव देता है, हर एक का स्रोत बताकर; बाहर से तय नियमों को कभी नहीं छूता | अभी लागू न की गई आवश्यकताओं का समूह और उनके स्रोत | model | ✔ |
| 🧩 **[scopechk](../../skills/depth/scopechk/SKILL.md)** | लक्ष्य के अपने लिखे दायरे से जांचता है कि नया हिस्सा उस जगह का है या नहीं जहां आप उसे रखना चाहते हैं, और न हो तो बेहतर जगह बताता है | एक आइटम और वह लक्ष्य जिसमें वह जुड़ेगा | model | ✔ |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | कड़ा आलोचक बनकर वह एक आपत्ति देता है जो आपकी योजना डुबो सकती है, और उसे परखने का सबसे सस्ता तरीका भी | एक plan | user | |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | आपकी बनाई भूमिका हटाकर सवाल कई नए दिमागों से पूछता है, और पहले दिखाता है कि वे कहां असहमत हैं | एक direction | user | ✔ |
| 🔀 **[crossthink](../../skills/depth/crossthink/SKILL.md)** | जब सारे विकल्प एक जैसे लगें, तो पांच या ज़्यादा दूर के क्षेत्रों से काम करने वाले उपाय उधार लेता है और सिर्फ़ नए रखता है | एक अटकी समस्या | model | ✔ |
| ⚖️ **[re0-decide](../../skills/depth/re0-decide/SKILL.md)** | किसी फ़ैसले की सामग्री को ऐसी जांच-सूची में बदलता है जिसका नतीजा आपके अपने जवाबों से निकले; आपकी जगह कभी नहीं चुनता | निर्णय के लिए सौंपी गई सामग्री | user | ✔ |
| 🧐 **[whychk](../../skills/depth/whychk/SKILL.md)** | अभी लिए फ़ैसले पर तब तक सवाल करता है जब तक आप उसे समझा न सकें, या तर्क की कमी दिखा देता है | एक decision | user | ✔ |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | काम के जोखिम वाले हिस्से पहले सुरक्षित विकल्पों के साथ अलग रखता है, बाकी पूरी रफ़्तार से करता है, और जो छोड़ा उसे दर्ज करता है | एक task | model | |
| 🎨 **[re0-style](../../skills/depth/re0-style/SKILL.md)** | कोड को प्रोजेक्ट की अपनी शैली के मुताबिक़ ठीक करता है, और जहाँ प्रोजेक्ट ख़ुद दो तरीक़े अपनाता है वहाँ पूछता है | review में एक बदलाव | model | |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | टिकाऊ दस्तावेज़ों में ब्रांड और टूल के नामों की जगह लिखता है कि वे असल में क्या करते हैं, ताकि दस्तावेज़ टूल से ज़्यादा चलें | एक durable artifact | model | |
| 🗜️ **[debloat](../../skills/depth/debloat/SKILL.md)** | फूले हुए लेखन या कोड को उतना छोटा करता है जितना सच में ज़रूरी है, बिना कोई नियम या व्यवहार खोए | एक artifact, prose या code | model | |
| 🔃 **[re0-order](../../skills/depth/re0-order/SKILL.md)** | बिखरी सूची को एक बताए गए नियम से फिर सही क्रम में लगाता है; चीज़ें सिर्फ़ खिसकाता है, एक शब्द नहीं बदलता | एक listing | model | |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | एजेंट के वाक्यों में बिखेरे लंबे डैश हटाता है, और हाइफ़न, दायरे और लेबल वाले डैश रहने देता है | आपकी prose | user | |
| ⸱ **[dedot](../../skills/depth/dedot/SKILL.md)** | कोरियाई लेखन में सूची जोड़ने वाले हर बीच के बिंदु की जगह कारण के साथ अल्पविराम या जोड़ने वाला शब्द सुझाता है | लेखक द्वारा सीमित कोरियाई गद्य या लेबल पंक्तियाँ | user | ✔ |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | आपका काम ऐसे नए पाठक को देता है जिसे कोई पृष्ठभूमि नहीं पता, और पूछता है कि क्या वह अपने आप समझ आता है | एक artifact | model | ✔ |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | दावों को असली स्रोतों से दोनों तरफ़ से मिलाता है: बेतुका सच हो सकता है, और ज़ाहिर बात गलत | एक claim | model | |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | जांचता है कि कोई टेस्ट या पैमाना खुद को ही नंबर तो नहीं दे रहा, या बाहर का असली सच नतीजा तय करता है | एक eval | model | ✔ |
| 🎭 **[demock](../../skills/depth/demock/SKILL.md)** | चलते कोड में वे नकली हिस्से और चुपचाप काम करने वाले विकल्प ढूंढता है जो सफलता की रिपोर्ट को झूठा बनाते हैं, और असली सुधार सुझाता है | नामित फ़ाइलें, निर्देशिका या diff | model | |
| 🥸 **[deid](../../skills/depth/deid/SKILL.md)** | साझा फ़ाइलों में किसी एक व्यक्ति या कंपनी का डेटा ढूंढकर उसकी जगह उसकी भूमिका लिखता है, और वे पुराने कमिट बताता है जिनमें वह अब भी है | एक नामित आर्टिफ़ैक्ट और एक स्वामी | model | |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | किसी भी बदलाव के ठीक बाद, काम पूरा कहने से पहले, आपके नतीजे पर paperthin की अपनी जांचें चलाता है | आपका output | model | |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | पूरे हो चुके कमिट का संदेश तारीख़ और जगह वही रखकर दोबारा लिखता है, ताकि सिर्फ़ इतिहास देखकर कोई भी काम संभाल सके | एक commit | user | |
| 🧨 **[re0-squash](../../skills/depth/re0-squash/SKILL.md)** | GitHub रिपॉज़िटरी को उन्हीं फ़ाइलों के साथ एक हस्ताक्षरित कमिट के रूप में फिर से प्रकाशित करता है, ताकि कोई पुराना कमिट पहुंच में न रहे | एक repository | user | |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | रिलीज़ की जांच-सूची चलाता है, फिर आपकी पुष्टि पर टैग लगाकर प्रकाशित करता है | एक release | user | |
| 🤝 **[re0-merge](../../skills/depth/re0-merge/SKILL.md)** | किसी और के योगदान की समीक्षा करके उसे जोड़ता है, उनका श्रेय बनाए रखता है, और हर बदलाव की वजह बताता है | एक contribution | user | |

### `breadth/`

| Skill | क्या करता है | Scope | Invoker | read-only |
|---|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | कई जगह कॉपी हुई किसी बात को ढूंढकर, आपकी मंज़ूरी के बाद उसे एक घर देता है और बाकी जगहों से वहीं इशारा करवाता है | एक fact, कई जगह | model | |
| 🔗 **[ssotize-local](../../skills/breadth/ssotize-local/SKILL.md)** | डुप्लिकेट फ़ाइलों या फ़ोल्डरों को एक असली प्रति में मिलाता है जिससे बाकी जुड़ी रहें, और वापस लौटने का परखा हुआ रास्ता रखता है | वही बाइट्स, कई पथ | model | |
| 📖 **[re0-readme](../../skills/breadth/re0-readme/SKILL.md)** | README और AGENTS.md की हर पंक्ति को उस फ़ाइल में रखता है जिसके पाठक को उसकी ज़रूरत है | एक repository की README और AGENTS.md | model | |
| 📥 **[re0-import](../../skills/breadth/re0-import/SKILL.md)** | दी गई सामग्री को मौजूदा ज्ञान-भंडार के सही पन्ने में उसी के नियमों से रखता है, और बताता है किसके लिए जगह नहीं मिली | सौंपी गई सामग्री और एक knowledge base | user | |
| 🆙 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | एक पुष्टि वाले कदम में आपका इंस्टॉल पूरे मौजूदा कैटलॉग तक लाता है: बदले नाम वाली स्किल हटाता है और नई जोड़ता है | आपकी skill install | user | |

### `coil/`

| Skill | क्या करता है | Scope | Invoker | read-only |
|---|---|---|---|---|
| 🗂️ **[re0-plan](../../skills/coil/re0-plan/SKILL.md)** | नया काम का दौर शुरू होने से पहले उसका फ़ोल्डर डिज़ाइन, कार्य-क्रम और सबूत की फ़ाइलों के साथ खोलता है | एक नया cycle | user | |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | बनाने, परखने, सीखने और फिर शुरू करने का चक्र चलाता रहता है, ताकि कोड नहीं, सबक जमा हों | पूरा loop | model | |
| 👁️ **[re0-watch](../../skills/coil/re0-watch/SKILL.md)** | एजेंट के लंबे काम पर नज़र रखता है कि वह अटका तो नहीं, और आपको बताता है; कोई भी सुधार बस एक सुझाव है जिसे आप मंज़ूर करें | एक चालू कार्य | user | |
| 📝 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | पूरे हुए या नाकाम दौर से सबक और बचने लायक गलतियां निकालता है | एक finished cycle | model | |
| 🔁 **[backprop](../../skills/coil/backprop/SKILL.md)** | किसी सुधार से मिला सबक उन दस्तावेज़ों और नियमों में वापस डालता है जिनसे गलती हुई, फिर उन्हें साफ़ करता है | एक सबक | model | |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | शुरू से फिर शुरू करता है, और सिर्फ़ वे सबक साथ ले जाता है जो दोबारा काम आने लायक साबित हुए | एक restart | model | |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | कुछ समय दूर रहने के बाद आपको अपडेट करता है: आपका क्या इंतज़ार है, क्या बदला, और नए शब्दों का मतलब क्या है | एक re-entry | model | ✔ |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | पढ़ता है कि काम कहां तक पहुंचा, और विकल्पों की सूची के बजाय सबसे अच्छा अगला एक कदम बताता है | live cycle | model | ✔ |
| 🪜 **[re0-workflow](../../skills/coil/re0-workflow/SKILL.md)** | एक लक्ष्य के लिए चुनता है कि कौन-सी स्किल किस क्रम में चलें, आपको दिखाता है, फिर उन्हें चलाता है और जहाँ आपकी ज़रूरत हो वहीं रुकता है | एक बताया गया इरादा | model | |
| 🚪 **[paperthin](../../skills/coil/paperthin/SKILL.md)** | याद रखने लायक एक ही कमांड: बताइए आप क्या चाहते हैं, और re0-workflow सही स्किल चुनकर चला देता है | एक अनुरोध | user | |
| 🎓 **[re0-tutorial](../../skills/coil/re0-tutorial/SKILL.md)** | एक स्किल को तीन स्तरों में सिखाता है, हर स्तर आपके खुद जमा किए काम से पास होता है | एक कौशल | user | |

### `mesh/`

| Skill | क्या करता है | Scope | Invoker | read-only |
|---|---|---|---|---|
| 🕸️ **[multithink](../../skills/mesh/multithink/SKILL.md)** | कई स्वतंत्र रायों को गिनती से नहीं, उनके दिए सबूतों से तौलता है | एक artifact या प्रश्न की कई पढ़तें | user | ✔ |

*Invocation पर अधिक: [.agents/invocation.md](../../.agents/invocation.md)।*

<a id="the-problem"></a>
## Problem

**ज्यादातर agent skills slop होते हैं।**

Agent को goal दें और वह **add** करता है: और files, और options, और "helpful" boilerplate। Add करना progress जैसा दिखता है, और कुछ भी उसे वापस जाकर delete करने को मजबूर नहीं करता।

> [!WARNING]
> यही pattern project में दोहराएं तो परिचित AI-generated toolkit बनता है: लगभग duplicate skills, dead settings, ऐसा README जो वही बात तीन बार कहता है। Plausible, busy, और चुपचाप unmaintainable।

ये skills उलटी दिशा में दांव लगाते हैं: **हर एक कुछ न कुछ हटाता है**, और क्या हटाता है, यह [Index](#the-index) में है।

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
- **Authoring guide** - conventions और philosophy [AGENTS.md](../../AGENTS.md) में हैं।
