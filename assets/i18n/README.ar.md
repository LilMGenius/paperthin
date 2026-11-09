<div align="center" dir="rtl">

# Paperthin: أنماط تصميم Agentic منخفضة المستوى

<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/banner.svg" alt="Paperthin: أنماط تصميم وكيلية منخفضة المستوى" width="820">

كتاب المهارات للتحسين الذاتي التكراري (**RSI**).<br>أحدث برهان من **NVIDIA**، مفكّكًا بهندسة لا تبلى.<br>مستخلص من طريقة الفائز بهاكاثون **OpenAI** لهندسة الـ harness، الذي عمل دون أن يلمس لوحة المفاتيح.

على **أي** agent | Codex, Claude Code, OpenCode, Cursor, Grok Build, Grok Bot, Muse, Pi, etc.

*"Best part is no part."* Elon Musk[^musk]

**يبنيه [Bran Lee](https://github.com/LilMGenius)**<br>2026: هاكاثون **OpenAI** لهندسة الـ harness (Ralphthon Seoul #2، أُقيم في سيول وسان فرانسيسكو في وقت واحد)، *المركز الأول*، الفريق الوحيد المكوّن من شخص واحد أمام فرق من كبرى شركات التقنية وحملة الدكتوراه من أبرز الجامعات<br>2026: متحدث مدعو في لقاء **Claude Code** الرسمي، *مرتين*<br>2026: *محكّم* مدعو في هاكاثون الذكاء الاصطناعي من **Google DeepMind**<br>2014: المسابقة الوطنية لأولمبياد كوريا للمعلوماتية (KOI)، *الجائزة الفضية*<br>2009~: يبرمج منذ سن *9*

[البدء السريع](#quickstart-30-seconds) · [الخريطة](#the-map) · [الفهرس](#the-index) · [المشكلة](#the-problem) · [البرهان](#the-proof) · [الشكر](#credits)

<sub>Read in: [English](../../README.md) · [中文](./README.zh-CN.md) · [हिन्दी](./README.hi.md) · [Español](./README.es.md) · العربية · [Português](./README.pt.md) · [Русский](./README.ru.md) · [日本語](./README.ja.md) · [Français](./README.fr.md) · [Deutsch](./README.de.md) · [한국어](./README.ko.md)</sub>

</div>

---

<a id="quickstart-30-seconds"></a>
## البدء السريع (30 ثانية)

اختر **طريقا واحدا لكل agent**؛ تثبيت طريقين يحمّل كل skill مرتين.

1. **Codex**: يحدّث نفسه عند بدء كل جلسة.
   ```bash
   codex plugin marketplace add LilMGenius/paperthin && codex plugin add paperthin@paperthin
   ```
2. **Claude Code**:
   ```bash
   claude plugin marketplace add LilMGenius/paperthin && claude plugin install paperthin@paperthin
   ```
   ثم شغّل `/plugin` داخل Claude Code وافتح **Marketplaces** واختر `paperthin` وفعّل **Enable auto-update** مرة واحدة.
3. **أي agent آخر**: سطر واحد يثبّت الـ skills ومعها تحديثا يوميا.
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*' && node "$HOME/.agents/skills/re0-upgrade/scripts/schedule/schedule.mjs" install
   ```
4. **استخدمه**: اكتب `/paperthin` ثم حلمك. هذا كل شيء. تريد أن تفهم الآلية؟ لا تقلق، هناك `/re0-tutorial`.
5. **الدفع بالنجوم**: إن نفعك، فالأجر [نجمة واحدة على GitHub](https://github.com/LilMGenius/paperthin). رخيص، أعرف.

**ثبّتّه من قبل؟** شغّل `/re0-upgrade` مرة واحدة في جلسة جديدة.

**لست متأكدا؟** قل لـ agent الخاص بك [`install https://github.com/LilMGenius/paperthin`](../../.agents/install-block.md#handed-only-this-repository). أما محادثة الويب فأعطها [llms-full.txt](https://raw.githubusercontent.com/LilMGenius/paperthin/main/llms-full.txt).

<a id="the-map"></a>
## الخريطة

**كم عدد الـ artifacts، وعلى امتداد أي زمن؟**

<div align="center">
<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/map.svg" alt="خريطة Paperthin من LilMGenius/paperthin، matrix اثنان في اثنان. المحور الأفقي هو العددية: واحد ثم كثير؛ والمحور العمودي هو الزمن: الآن ثم عبر التكرارات؛ أربع مناطق. أعلى اليسار، depth: artifact واحد، الآن؛ هل هذا الشيء الواحد نظيف وصحيح؟ أعلى اليمين، breadth: artifacts كثيرة، الآن؛ هل fact واحدة متسقة في كل مكان؟ أسفل اليسار، coil: مشروع واحد عبر التكرارات؛ هل علّم كل مرور المرور التالي؟ أسفل اليمين، mesh: عقول كثيرة عبر جولات؛ هل يتقارب الحشد نحو ground truth؟" width="820">
</div>

<a id="the-index"></a>
## الفهرس

### `depth/`

| Skill | ماذا يفعل | Invoker | قراءة فقط |
|---|---|---|---|
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | يعيد كتابة مستند أو ملف تراكمت عليه الترقيعات حتى فسد، في نسخة أولى نظيفة بدل ترقيعه من جديد | model | |
| 🗜️ **[debloat](../../skills/depth/debloat/SKILL.md)** | يقلّص النص أو الكود المتضخم إلى ما يحمل الوزن فعلا، دون أن يفقد قاعدة أو سلوكا | model | |
| 🔃 **[re0-order](../../skills/depth/re0-order/SKILL.md)** | يعيد قائمة مبعثرة إلى ترتيب منطقي وفق قاعدة واحدة معلنة؛ ينقل البنود ولا يغيّر كلمة | model | |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | يستبدل أسماء العلامات التجارية والأدوات في المستندات الدائمة بما تفعله فعلا، لتعيش المستندات أطول من الأدوات | model | |
| 🎨 **[re0-style](../../skills/depth/re0-style/SKILL.md)** | يصلح الكود ليطابق أسلوب المشروع نفسه، ويسأل حيث يكتب المشروع الشيء نفسه بطريقتين | model | |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | يزيل الشرطات الطويلة التي ينثرها الوكيل في الجمل، ويُبقي الواصلات والنطاقات وشرطات العناوين | user | |
| ⸱ **[dedot](../../skills/depth/dedot/SKILL.md)** | في النصوص الكورية، يقترح فاصلة أو أداة ربط، مع السبب، لكل نقطة وسطى تربط عناصر قائمة | user | ✔ |
| 🧭 **[readback](../../skills/depth/readback/SKILL.md)** | يتأكد قبل العمل من أنه فهم طلبك، ولا يسأل إلا حين تختلف القراءتان فعلا | model | ✔ |
| 🏹 **[aim](../../skills/depth/aim/SKILL.md)** | يقرأ الملفات أو النص الذي تسلّمه له ويقترح ما تريده على الأرجح، فلا يبقى عليك إلا التأكيد | model | ✔ |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | يختار أرخص فئة نماذج وأقل جهد تفكير يكفيان لإنجاز العمل جيدا | model | ✔ |
| 🧹 **[elon](../../skills/depth/elon/SKILL.md)** | يقترح حذف المتطلبات والالتزامات الباقية بحكم العادة وحدها أو تأجيلها، مع مصدر كل منها؛ ولا يمس أبدا قواعد فرضتها جهة خارجية | model | ✔ |
| 🧩 **[scopechk](../../skills/depth/scopechk/SKILL.md)** | يتحقق، وفق النطاق الذي كتبه الهدف لنفسه، من أن القطعة الجديدة تنتمي إلى المكان الذي تريد وضعها فيه، ويقترح مكانا أنسب إن لم تكن | model | ✔ |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | يلعب دور الناقد القاسي: الاعتراض الوحيد الذي قد يُغرق خطتك، وأرخص اختبار يحسمه | user | |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | يطرح السؤال مجردا من صياغتك على عدة عقول جديدة، ويبدأ بعرض مواضع اختلافها | user | ✔ |
| 🔀 **[crossthink](../../skills/depth/crossthink/SKILL.md)** | حين تبدو الخيارات كلها متشابهة، يستعير أفكارا ناجحة من خمسة مجالات بعيدة أو أكثر ولا يُبقي إلا الجديد منها | model | ✔ |
| ⚖️ **[re0-decide](../../skills/depth/re0-decide/SKILL.md)** | يحوّل مواد القرار إلى قائمة تحقق يخرج حكمها من إجاباتك أنت؛ ولا يختار عنك أبدا | user | ✔ |
| 🧐 **[whychk](../../skills/depth/whychk/SKILL.md)** | يسائل قرارا اتخذته للتو حتى تستطيع شرحه، أو يكشف الثغرة في المنطق | user | ✔ |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | يعزل أولا الأجزاء الخطرة من المهمة مع بدائل أكثر أمانا، ثم ينجز الباقي بأقصى سرعة ويسجّل ما استُبعد | model | |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | بعد أي تغيير مباشرة، وقبل أن تعدّه منتهيا، يشغّل فحوص paperthin نفسها على ما أنتجته | model | |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | يسلّم عملك إلى قارئ جديد لا يعرف شيئا عن خلفيته ويسأله هل يُفهم وحده | model | ✔ |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | يطابق الادعاءات مع مصادر حقيقية في الاتجاهين: فالغريب قد يكون صحيحا، والبديهي قد يكون خاطئا | model | |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | يتحقق هل يمنح الاختبار أو المقياس نفسه الدرجة، أم أن حقيقة خارجية فعلية هي التي تحسم النتيجة | model | ✔ |
| 🎭 **[demock](../../skills/depth/demock/SKILL.md)** | يعثر في الكود الفعلي على البدائل الزائفة والمسارات الاحتياطية الصامتة التي تجعل تقرير النجاح كاذبا، ويقترح الإصلاح الحقيقي | model | |
| 🥸 **[deid](../../skills/depth/deid/SKILL.md)** | يجد بيانات شخص أو شركة في ملفات مشتركة، ويستبدلها باسم الدور الذي تؤديه، ويسرد الإيداعات القديمة التي ما زالت تحملها | model | |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | يعيد كتابة رسالة إيداع منتهٍ مع الإبقاء على تواريخه وموضعه، ليتمكن أي شخص من المتابعة من السجل وحده | user | |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | يمرّ على قائمة الإصدار، ثم يضع الوسم وينشر بعد تأكيدك | user | |
| 🤝 **[re0-merge](../../skills/depth/re0-merge/SKILL.md)** | يراجع مساهمة شخص آخر ويدمجها، ويحفظ له الفضل، ويشرح أي تعديل أُدخل عليها | user | |
| 🧨 **[re0-squash](../../skills/depth/re0-squash/SKILL.md)** | يعيد نشر مستودع GitHub في إيداع واحد موقّع بالملفات نفسها، فلا يبقى أي إيداع قديم في المتناول | user | |

### `breadth/`

| Skill | ماذا يفعل | Invoker | قراءة فقط |
|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | يجد معلومة منسوخة في أماكن كثيرة، ويمنحها بيتا واحدا بعد موافقتك، ويجعل البقية تشير إليه | model | |
| 🔗 **[ssotize-local](../../skills/breadth/ssotize-local/SKILL.md)** | يدمج الملفات أو المجلدات المكررة في نسخة حقيقية واحدة ترتبط بها البقية، مع طريق عودة مُختبَر | model | |
| 📖 **[re0-readme](../../skills/breadth/re0-readme/SKILL.md)** | يفرز سطور README وAGENTS.md بحيث يستقر كل سطر في ملف القارئ الذي يحتاجه | model | |
| 📥 **[re0-import](../../skills/breadth/re0-import/SKILL.md)** | يضع المواد المسلّمة في الصفحة المناسبة من قاعدة معرفة قائمة وفق قواعدها هي، ويخبرك بما لم يجد له مكانا | user | |
| 🆙 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | يرفع تثبيتك إلى الكتالوج الحالي الكامل بخطوة واحدة تؤكدها: يحذف المهارات التي تغيّر اسمها ويضيف الجديدة | user | |

### `coil/`

| Skill | ماذا يفعل | Invoker | قراءة فقط |
|---|---|---|---|
| 🚪 **[paperthin](../../skills/coil/paperthin/SKILL.md)** | الأمر الوحيد الذي تحتاج إلى تذكّره: اكتب حلمك بعده | user | |
| 🪜 **[re0-workflow](../../skills/coil/re0-workflow/SKILL.md)** | لهدف واحد، يختار أي المهارات تُشغَّل وبأي ترتيب، ويعرض ذلك عليك، ثم يشغّلها ويتوقف حيث يلزم تدخّلك | model | |
| 📝 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | يستخلص الدروس، والأخطاء الواجب تجنبها، من دورة انتهت أو فشلت | model | |
| 🔁 **[backprop](../../skills/coil/backprop/SKILL.md)** | يعيد درس التصحيح إلى المستندات والقواعد التي سببت الخطأ، ثم يرتبها | model | |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | يبدأ من الصفر، ولا يحمل معه إلا الدروس التي أثبتت أنها تستحق إعادة الاستخدام | model | |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | يطلعك على ما فاتك أثناء غيابك: ما ينتظرك، وما تغيّر، وما تعنيه المصطلحات الجديدة | model | ✔ |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | يقرأ أين وصل العمل ويسمي خطوة تالية واحدة هي الأفضل، لا قائمة خيارات | model | ✔ |
| 🗂️ **[re0-plan](../../skills/coil/re0-plan/SKILL.md)** | قبل بدء دورة عمل جديدة، يفتح مجلدها بملفات التصميم وسير العمل والأدلة | user | |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | يُبقي دورة البناء والاختبار والتعلم والبدء من جديد دائرة، فتتراكم الدروس لا الكود | model | |
| 👁️ **[re0-watch](../../skills/coil/re0-watch/SKILL.md)** | يراقب مهمة طويلة لوكيل بحثا عن التوقف وينبهك؛ وأي إصلاح ليس إلا اقتراحا توافق عليه | user | |
| 🎓 **[re0-tutorial](../../skills/coil/re0-tutorial/SKILL.md)** | يعلّم مهارة واحدة على ثلاثة مستويات متدرجة، يُجتاز كل منها بعمل تسلّمه بنفسك | user | |

### `mesh/`

| Skill | ماذا يفعل | Invoker | قراءة فقط |
|---|---|---|---|
| 🕸️ **[multithink](../../skills/mesh/multithink/SKILL.md)** | يزن عدة آراء مستقلة بالأدلة التي تستشهد بها، لا بعدد من يتفقون | user | ✔ |

*المزيد عن الاستدعاء: [.agents/invocation.md](../../.agents/invocation.md).*

<a id="the-problem"></a>
## المشكلة

**معظم agent skills هي slop.**

وجّه agent إلى هدف فيبدأ في **الإضافة**: ملفات أكثر، خيارات أكثر، boilerplate "مفيد" أكثر. الإضافة تبدو كأنها تقدم، ولا شيء يجعله يعود ويحذف.

> [!WARNING]
> كرر ذلك عبر مشروع وستحصل على toolkit مألوف مولد بالذكاء الاصطناعي: skills شبه مكررة، إعدادات ميتة، وملف markdown يقول الشيء نفسه ثلاث مرات. مقنع، مشغول، وغير قابل للصيانة بهدوء.

هذه الـ skills تراهن في الاتجاه الآخر: **كل واحدة منها تزيل شيئا**، و[الفهرس](#the-index) يقول ماذا.

> [!TIP]
> الجزء الصعب ليس إضافة الميزات، بل ضبط النفس. المرور الذي لا يجد شيئا لتحسينه لا يغير شيئا. **ذلك الضبط هو المنتج.**

<a id="the-proof"></a>
## البرهان

**قاستها NVIDIA: الوكيل الذي يترك تاريخه الطويل ويعمل من ملاحظة قصيرة يحافظ على نتيجته.**

| ما قاسته NVIDIA | سياق طويل | ملاحظة قصيرة |
|---|---|---|
| SWE-bench Verified، Claude Opus 4.5 | 70.0 | 70.2 |
| أكبر سياق احتاجه التشغيل | 200K رمز | 16K رمز |
| إنتاجية خدمة النماذج مفتوحة الأوزان، H100 | نافذة 256K | حتى 7 أضعاف عند 16K |

<sub>Belcak وآخرون (NVIDIA)، [You don't need long context](https://arxiv.org/abs/2611.05306), arXiv 2611.05306, 2026-11-03. الصفان الأول والثاني من الجدول 2، حيث يعمل Opus 4.5 خطوة بخطوة على ملاحظة حالة. الصف الثالث من الشكل 1 (GLM 5.2 3.6 أضعاف، Kimi K2.6 5.6 أضعاف، Qwen 3 Coder Next 7 أضعاف).</sub>

**أي مهارة في Paperthin تتولى كل نتيجة:**

| ما وجدته الورقة | المهارات التي تعمل بها |
|---|---|
| العمل الطويل لا يحتاج سياقًا طويلًا: حين تمتلئ المحادثة تُكتب ملاحظة ويُستأنف العمل في محادثة جديدة | `re0-work` يبدأ من v0 من جديد بالدروس المثبتة وحدها، و`re0-git` يترك التسليم في سجل git للجلسة التالية |
| الملاحظة الجيدة تُبقي المهمة قريبة من كلماتها الأصلية | `re0-loop` يُبقي كل طلب مفتوح في القائمة حين تُضغط الجلسة أو تبدأ من جديد |
| الملاحظة الجيدة تحفظ ما يجري، ولماذا، وما التالي | `re0-memo` يجعل الدورة المنتهية بوابة الدورة التالية، و`nba` يسمّي الخطوة التالية |
| الملاحظة الجيدة تحفظ الخطة وشروط الإنجاز ومواضع الأشياء | `re0-plan` يفتح الدورة بملفات التصميم وسير العمل والأدلة، و`re0-workflow` يدوّن ترتيب المهارات |
| فعل واحد في كل مرة على ملاحظة حالة يحفظ النتيجة كاملة | `shower` يسلّم الملاحظة وحدها لقارئ بلا تاريخ ويسأل هل تقف بنفسها |
| النافذة الأصغر تُخدَم أسرع حتى 7 أضعاف | `elon` يحذف ما بقي بحكم العادة فقط، و`debloat` يُبقي ما يحمل الوزن، و`re0` يعيد الكتابة بدل تكديس الرقع |

<a id="credits"></a>
## الشكر

- **مبني على** [mattpocock/skills](https://github.com/mattpocock/skills) (MIT) - معماره وفلسفته.
- **ليس fork** - هذه workflows خاصة بـ [LilMGenius](https://github.com/LilMGenius)، وغير متداخلة.
- **Vendored verbatim** - بعض building blocks المشتركة، محفوظة كما هي مع attribution لكل مصدر في [NOTICE](../../NOTICE).
- **دليل التأليف** - conventions والفلسفة في [AGENTS.md](../../AGENTS.md).

[^musk]: Elon Musk، [رد على X](https://x.com/elonmusk/status/2103537444910248312)، 2026-09-25، على @Erdayastronaut بشأن إزالة SpaceX زعنفة شبكية واحدة من معزز V3؛ معناه "أفضل قطعة هي القطعة غير الموجودة". قالها عن الهندسة، لا عن Paperthin.
