<div align="center">

# Paperthin: लो-लेवल agentिक डिजाइन पैटर्न

<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/banner.svg" alt="Paperthin: लो-लेवल एजेंटिक डिज़ाइन पैटर्न" width="820">

रिकर्सिव आत्म-सुधार (**RSI**) के लिए स्किलबुक।<br>**NVIDIA** का ताज़ा प्रमाण, सदाबहार इंजीनियरिंग से खोलकर समझाया गया।<br>**OpenAI** हार्नेस इंजीनियरिंग हैकाथॉन विजेता के उस तरीके से निचोड़ा गया, जिसमें कीबोर्ड छुआ ही नहीं गया।

**किसी भी** agent पर | Codex, Claude Code, OpenCode, Cursor, Grok Build, Grok Bot, Muse, Pi, etc.

*"Best part is no part."* Elon Musk[^musk]

**[Bran Lee](https://github.com/LilMGenius) द्वारा बनाया गया**<br>2026: **OpenAI** हार्नेस इंजीनियरिंग हैकाथॉन (Ralphthon Seoul #2, सियोल और सैन फ़्रांसिस्को में एक साथ), *पहला स्थान*, बड़ी टेक कंपनियों और शीर्ष विश्वविद्यालयों के PhD वाली टीमों के बीच अकेली एक-व्यक्ति टीम<br>2026: **Claude Code** आधिकारिक मीटअप के आमंत्रित वक्ता, *दो बार*<br>2026: **Google DeepMind** AI हैकाथॉन के आमंत्रित *निर्णायक*<br>2014: कोरिया इन्फ़ॉर्मेटिक्स ओलंपियाड (KOI) राष्ट्रीय प्रतियोगिता, *रजत पुरस्कार*<br>2009~: *9* साल की उम्र से कोडिंग

[Quickstart](#quickstart-30-seconds) · [Map](#the-map) · [Index](#the-index) · [Problem](#the-problem) · [प्रमाण](#the-proof) · [Credits](#credits)

<sub>Read in: [English](../../README.md) · [中文](./README.zh-CN.md) · हिन्दी · [Español](./README.es.md) · [العربية](./README.ar.md) · [Português](./README.pt.md) · [Русский](./README.ru.md) · [日本語](./README.ja.md) · [Français](./README.fr.md) · [Deutsch](./README.de.md) · [한국어](./README.ko.md)</sub>

</div>

---

<a id="quickstart-30-seconds"></a>
## Quickstart (30 सेकंड)

**हर agent के लिए एक ही रास्ता** चुनें; दो लगाने से हर skill दो बार लोड होती है।

1. **Codex**: हर session शुरू होने पर खुद अपडेट होता है।
   ```bash
   codex plugin marketplace add LilMGenius/paperthin && codex plugin add paperthin@paperthin
   ```
2. **Claude Code**:
   ```bash
   claude plugin marketplace add LilMGenius/paperthin && claude plugin install paperthin@paperthin
   ```
   फिर Claude Code में `/plugin` चलाएं, **Marketplaces** खोलें, `paperthin` चुनें और एक बार **Enable auto-update** चालू करें।
3. **बाकी हर agent**: एक ही line skills और रोज़ का अपडेट, दोनों लगा देती है।
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*' && node "$HOME/.agents/skills/re0-upgrade/scripts/schedule/schedule.mjs" install
   ```
4. **इस्तेमाल करें**: `/paperthin` लिखें, फिर अपना सपना। बस इतना ही। तरीका समझना है? फ़िक्र न करें, `/re0-tutorial` है।
5. **फ़ीस सितारों में**: काम आया हो तो बस एक [GitHub star](https://github.com/LilMGenius/paperthin) दे दें। सस्ता है, पता है।

**पहले install किया था?** नए session में एक बार `/re0-upgrade` चलाएं।

**पक्का नहीं?** अपने agent से कहें [`install https://github.com/LilMGenius/paperthin`](../../.agents/install-block.md#handed-only-this-repository)। वेब chat को [llms.txt](https://raw.githubusercontent.com/LilMGenius/paperthin/main/llms.txt) दें।

<a id="the-map"></a>
## Map

**कितने artifacts, और कितने समय में फैले हुए?**

<div align="center">
<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/map.svg" alt="LilMGenius/paperthin का Paperthin map, दो-by-दो matrix. Horizontal axis cardinality (एक, फिर कई); vertical axis time (अभी, फिर iterations के पार); चार regions. Top-left, depth: एक artifact, अभी; क्या यह एक चीज clean और true है? Top-right, breadth: कई artifacts, अभी; क्या एक truth हर जगह consistent है? Bottom-left, coil: एक project, iterations के पार; क्या हर pass ने अगले को सिखाया? Bottom-right, mesh: कई minds, कई rounds के पार; क्या crowd truth पर converge करता है?" width="820">
</div>

<a id="the-index"></a>
## Index

### `depth/`

| Skill | क्या करता है | Invoker | read-only |
|---|---|---|---|
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | बार-बार पैच होकर उलझे दस्तावेज़ या फ़ाइल को फिर से पैच करने के बजाय साफ़ पहले संस्करण की तरह दोबारा लिखता है | model | |
| 🗜️ **[debloat](../../skills/depth/debloat/SKILL.md)** | फूले हुए लेखन या कोड को उतना छोटा करता है जितना सच में ज़रूरी है, बिना कोई नियम या व्यवहार खोए | model | |
| 🔃 **[re0-order](../../skills/depth/re0-order/SKILL.md)** | बिखरी सूची को एक बताए गए नियम से फिर सही क्रम में लगाता है; चीज़ें सिर्फ़ खिसकाता है, एक शब्द नहीं बदलता | model | |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | टिकाऊ दस्तावेज़ों में ब्रांड और टूल के नामों की जगह लिखता है कि वे असल में क्या करते हैं, ताकि दस्तावेज़ टूल से ज़्यादा चलें | model | |
| 🎨 **[re0-style](../../skills/depth/re0-style/SKILL.md)** | कोड को प्रोजेक्ट की अपनी शैली के मुताबिक़ ठीक करता है, और जहाँ प्रोजेक्ट ख़ुद दो तरीक़े अपनाता है वहाँ पूछता है | model | |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | एजेंट के वाक्यों में बिखेरे लंबे डैश हटाता है, और हाइफ़न, दायरे और लेबल वाले डैश रहने देता है | user | |
| ⸱ **[dedot](../../skills/depth/dedot/SKILL.md)** | कोरियाई लेखन में सूची जोड़ने वाले हर बीच के बिंदु की जगह कारण के साथ अल्पविराम या जोड़ने वाला शब्द सुझाता है | user | ✔ |
| 🧭 **[readback](../../skills/depth/readback/SKILL.md)** | काम शुरू करने से पहले जांचता है कि उसने आपका अनुरोध सही समझा, और तभी पूछता है जब दो मतलब सच में अलग हों | model | ✔ |
| 🏹 **[aim](../../skills/depth/aim/SKILL.md)** | आपकी दी हुई फ़ाइलें या लिखा हुआ पढ़कर बताता है कि आप शायद क्या चाहते हैं, ताकि आपको बस हां कहना हो | model | ✔ |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | काम अच्छे से पूरा करने लायक सबसे सस्ता मॉडल स्तर और सोचने की गहराई चुनता है | model | ✔ |
| 🧹 **[elon](../../skills/depth/elon/SKILL.md)** | सिर्फ़ आदत से चली आ रही ज़रूरतें और चल रहे काम हटाने या टालने का सुझाव देता है, हर एक का स्रोत बताकर; बाहर से तय नियमों को कभी नहीं छूता | model | ✔ |
| 🧩 **[scopechk](../../skills/depth/scopechk/SKILL.md)** | लक्ष्य के अपने लिखे दायरे से जांचता है कि नया हिस्सा उस जगह का है या नहीं जहां आप उसे रखना चाहते हैं, और न हो तो बेहतर जगह बताता है | model | ✔ |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | कड़ा आलोचक बनकर वह एक आपत्ति देता है जो आपकी योजना डुबो सकती है, और उसे परखने का सबसे सस्ता तरीका भी | user | |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | आपकी बनाई भूमिका हटाकर सवाल कई नए दिमागों से पूछता है, और पहले दिखाता है कि वे कहां असहमत हैं | user | ✔ |
| 🔀 **[crossthink](../../skills/depth/crossthink/SKILL.md)** | जब सारे विकल्प एक जैसे लगें, तो पांच या ज़्यादा दूर के क्षेत्रों से काम करने वाले उपाय उधार लेता है और सिर्फ़ नए रखता है | model | ✔ |
| ⚖️ **[re0-decide](../../skills/depth/re0-decide/SKILL.md)** | किसी फ़ैसले की सामग्री को ऐसी जांच-सूची में बदलता है जिसका नतीजा आपके अपने जवाबों से निकले; आपकी जगह कभी नहीं चुनता | user | ✔ |
| 🧐 **[whychk](../../skills/depth/whychk/SKILL.md)** | अभी लिए फ़ैसले पर तब तक सवाल करता है जब तक आप उसे समझा न सकें, या तर्क की कमी दिखा देता है | user | ✔ |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | काम के जोखिम वाले हिस्से पहले सुरक्षित विकल्पों के साथ अलग रखता है, बाकी पूरी रफ़्तार से करता है, और जो छोड़ा उसे दर्ज करता है | model | |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | किसी भी बदलाव के ठीक बाद, काम पूरा कहने से पहले, आपके नतीजे पर paperthin की अपनी जांचें चलाता है | model | |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | आपका काम ऐसे नए पाठक को देता है जिसे कोई पृष्ठभूमि नहीं पता, और पूछता है कि क्या वह अपने आप समझ आता है | model | ✔ |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | दावों को असली स्रोतों से दोनों तरफ़ से मिलाता है: बेतुका सच हो सकता है, और ज़ाहिर बात गलत | model | |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | जांचता है कि कोई टेस्ट या पैमाना खुद को ही नंबर तो नहीं दे रहा, या बाहर का असली सच नतीजा तय करता है | model | ✔ |
| 🎭 **[demock](../../skills/depth/demock/SKILL.md)** | चलते कोड में वे नकली हिस्से और चुपचाप काम करने वाले विकल्प ढूंढता है जो सफलता की रिपोर्ट को झूठा बनाते हैं, और असली सुधार सुझाता है | model | |
| 🥸 **[deid](../../skills/depth/deid/SKILL.md)** | साझा फ़ाइलों में किसी एक व्यक्ति या कंपनी का डेटा ढूंढकर उसकी जगह उसकी भूमिका लिखता है, और वे पुराने कमिट बताता है जिनमें वह अब भी है | model | |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | पूरे हो चुके कमिट का संदेश तारीख़ और जगह वही रखकर दोबारा लिखता है, ताकि सिर्फ़ इतिहास देखकर कोई भी काम संभाल सके | user | |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | रिलीज़ की जांच-सूची चलाता है, फिर आपकी पुष्टि पर टैग लगाकर प्रकाशित करता है | user | |
| 🤝 **[re0-merge](../../skills/depth/re0-merge/SKILL.md)** | किसी और के योगदान की समीक्षा करके उसे जोड़ता है, उनका श्रेय बनाए रखता है, और हर बदलाव की वजह बताता है | user | |
| 🧨 **[re0-squash](../../skills/depth/re0-squash/SKILL.md)** | GitHub रिपॉज़िटरी को उन्हीं फ़ाइलों के साथ एक हस्ताक्षरित कमिट के रूप में फिर से प्रकाशित करता है, ताकि कोई पुराना कमिट पहुंच में न रहे | user | |

### `breadth/`

| Skill | क्या करता है | Invoker | read-only |
|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | कई जगह कॉपी हुई किसी बात को ढूंढकर, आपकी मंज़ूरी के बाद उसे एक घर देता है और बाकी जगहों से वहीं इशारा करवाता है | model | |
| 🔗 **[ssotize-local](../../skills/breadth/ssotize-local/SKILL.md)** | डुप्लिकेट फ़ाइलों या फ़ोल्डरों को एक असली प्रति में मिलाता है जिससे बाकी जुड़ी रहें, और वापस लौटने का परखा हुआ रास्ता रखता है | model | |
| 📖 **[re0-readme](../../skills/breadth/re0-readme/SKILL.md)** | README और AGENTS.md की हर पंक्ति को उस फ़ाइल में रखता है जिसके पाठक को उसकी ज़रूरत है | model | |
| 📥 **[re0-import](../../skills/breadth/re0-import/SKILL.md)** | दी गई सामग्री को मौजूदा ज्ञान-भंडार के सही पन्ने में उसी के नियमों से रखता है, और बताता है किसके लिए जगह नहीं मिली | user | |
| 🆙 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | एक पुष्टि वाले कदम में आपका इंस्टॉल पूरे मौजूदा कैटलॉग तक लाता है: बदले नाम वाली स्किल हटाता है और नई जोड़ता है | user | |

### `coil/`

| Skill | क्या करता है | Invoker | read-only |
|---|---|---|---|
| 🚪 **[paperthin](../../skills/coil/paperthin/SKILL.md)** | याद रखने लायक एक ही कमांड: इसके बाद अपना सपना लिखें | user | |
| 🪜 **[re0-workflow](../../skills/coil/re0-workflow/SKILL.md)** | एक लक्ष्य के लिए चुनता है कि कौन-सी स्किल किस क्रम में चलें, आपको दिखाता है, फिर उन्हें चलाता है और जहाँ आपकी ज़रूरत हो वहीं रुकता है | model | |
| 📝 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | पूरे हुए या नाकाम दौर से सबक और बचने लायक गलतियां निकालता है | model | |
| 🔁 **[backprop](../../skills/coil/backprop/SKILL.md)** | किसी सुधार से मिला सबक उन दस्तावेज़ों और नियमों में वापस डालता है जिनसे गलती हुई, फिर उन्हें साफ़ करता है | model | |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | शुरू से फिर शुरू करता है, और सिर्फ़ वे सबक साथ ले जाता है जो दोबारा काम आने लायक साबित हुए | model | |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | कुछ समय दूर रहने के बाद आपको अपडेट करता है: आपका क्या इंतज़ार है, क्या बदला, और नए शब्दों का मतलब क्या है | model | ✔ |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | पढ़ता है कि काम कहां तक पहुंचा, और विकल्पों की सूची के बजाय सबसे अच्छा अगला एक कदम बताता है | model | ✔ |
| 🗂️ **[re0-plan](../../skills/coil/re0-plan/SKILL.md)** | नया काम का दौर शुरू होने से पहले उसका फ़ोल्डर डिज़ाइन, कार्य-क्रम और सबूत की फ़ाइलों के साथ खोलता है | user | |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | बनाने, परखने, सीखने और फिर शुरू करने का चक्र चलाता रहता है, ताकि कोड नहीं, सबक जमा हों | model | |
| 👁️ **[re0-watch](../../skills/coil/re0-watch/SKILL.md)** | एजेंट के लंबे काम पर नज़र रखता है कि वह अटका तो नहीं, और आपको बताता है; कोई भी सुधार बस एक सुझाव है जिसे आप मंज़ूर करें | user | |
| 🎓 **[re0-tutorial](../../skills/coil/re0-tutorial/SKILL.md)** | एक स्किल को तीन स्तरों में सिखाता है, हर स्तर आपके खुद जमा किए काम से पास होता है | user | |

### `mesh/`

| Skill | क्या करता है | Invoker | read-only |
|---|---|---|---|
| 🕸️ **[multithink](../../skills/mesh/multithink/SKILL.md)** | कई स्वतंत्र रायों को गिनती से नहीं, उनके दिए सबूतों से तौलता है | user | ✔ |

*Invocation पर अधिक: [.agents/invocation.md](../../.agents/invocation.md)।*

<a id="the-problem"></a>
## Problem

**ज्यादातर agent skills slop होते हैं।**

Agent को goal दें और वह **add** करता है: और files, और options, और "helpful" boilerplate। Add करना progress जैसा दिखता है, और कुछ भी उसे वापस जाकर delete करने को मजबूर नहीं करता।

> [!WARNING]
> यही pattern project में दोहराएं तो परिचित AI-generated toolkit बनता है: लगभग duplicate skills, dead settings, ऐसी markdown फ़ाइल जो वही बात तीन बार कहती है। Plausible, busy, और चुपचाप unmaintainable।

ये skills उलटी दिशा में दांव लगाते हैं: **हर एक कुछ न कुछ हटाता है**, और क्या हटाता है, यह [Index](#the-index) में है।

> [!TIP]
> मुश्किल हिस्सा features add करना नहीं, restraint है। कोई pass अगर improve करने लायक कुछ नहीं पाता, तो कुछ नहीं बदलता। **वही restraint product है।**

<a id="the-proof"></a>
## प्रमाण

**NVIDIA ने मापा: जो एजेंट लंबा इतिहास छोड़कर एक छोटे नोट से काम करता है, उसका स्कोर बना रहता है।**

| NVIDIA ने क्या मापा | लंबा कॉन्टेक्स्ट | छोटा नोट |
|---|---|---|
| SWE-bench Verified, Claude Opus 4.5 | 70.0 | 70.2 |
| रन को चाहिए सबसे बड़ा कॉन्टेक्स्ट | 200K टोकन | 16K टोकन |
| ओपन-वेट सर्विंग थ्रूपुट, H100 | 256K विंडो | 16K पर 7 गुना तक ज़्यादा |

<sub>Belcak और अन्य (NVIDIA), [You don't need long context](https://arxiv.org/abs/2611.05306), arXiv 2611.05306, 2026-11-03। पहली और दूसरी पंक्ति तालिका 2 से हैं, जहाँ Opus 4.5 एक स्टेट नोट पर एक बार में एक कदम उठाता है। तीसरी पंक्ति चित्र 1 से है (GLM 5.2 3.6 गुना, Kimi K2.6 5.6 गुना, Qwen 3 Coder Next 7 गुना)।</sub>

**हर खोज को Paperthin में कौन-सी स्किल संभालती है:**

| पेपर ने क्या पाया | जो स्किल इस पर काम करती हैं |
|---|---|
| लंबे काम को लंबे कॉन्टेक्स्ट की ज़रूरत नहीं: बातचीत भर जाए तो नोट लिखें और नई बातचीत में आगे बढ़ें | `re0-work` सिर्फ़ साबित हुए सबक लेकर v0 से फिर शुरू करता है, `re0-git` अगले सेशन के लिए हैंडऑफ़ git इतिहास में छोड़ता है |
| अच्छा नोट काम को उसके मूल शब्दों के करीब रखता है | `re0-loop` सेशन के छोटा होने या नए सिरे से शुरू होने पर भी हर खुला अनुरोध सूची में रखता है |
| अच्छा नोट बताता है कि क्या चल रहा है, क्यों, और आगे क्या है | `re0-memo` पूरे हुए चक्र को अगले चक्र का द्वार बनाता है, `nba` अगला कदम बताता है |
| अच्छा नोट योजना, पूरा होने की शर्तें और चीज़ें कहाँ हैं, यह रखता है | `re0-plan` डिज़ाइन, वर्कफ़्लो और सबूत की फ़ाइलों से चक्र खोलता है, `re0-workflow` स्किल का क्रम लिख देता है |
| स्टेट नोट पर एक बार में एक काम करने से पूरा स्कोर बना रहता है | `shower` सिर्फ़ नोट को बिना इतिहास वाले पाठक को देता है और पूछता है कि क्या वह अपने आप समझ आता है |
| छोटी विंडो 7 गुना तक तेज़ सर्व होती है | `elon` सिर्फ़ आदत से बची चीज़ें हटाता है, `debloat` वही रखता है जो भार उठाता है, `re0` पैबंद लगाने की जगह दोबारा लिखता है |

<a id="credits"></a>
## Credits

- **Built on** [mattpocock/skills](https://github.com/mattpocock/skills) (MIT) - इसकी architecture और philosophy।
- **Fork नहीं** - ये [LilMGenius](https://github.com/LilMGenius) के अपने, non-overlapping workflows हैं।
- **Vendored verbatim** - कुछ shared building blocks, per-source attribution के साथ [NOTICE](../../NOTICE) में as-is रखे गए हैं।
- **Authoring guide** - conventions और philosophy [AGENTS.md](../../AGENTS.md) में हैं।

[^musk]: Elon Musk, [X पर जवाब](https://x.com/elonmusk/status/2103537444910248312), 2026-09-25, @Erdayastronaut को, SpaceX के V3 बूस्टर से एक ग्रिड फ़िन हटाने पर; मतलब है "सबसे अच्छा पुर्ज़ा वह है जो है ही नहीं"। यह बात उन्होंने इंजीनियरिंग के बारे में कही थी, Paperthin के बारे में नहीं।
