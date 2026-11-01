<div align="center" dir="rtl">

# Paperthin: أنماط تصميم Agentic منخفضة المستوى

<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/banner.svg" alt="Paperthin - ثق بالأثر، لا بالمؤلف." width="820">

**تحويل حكمة هندسية قديمة إلى ردود فعل يصل إليها الـ agent من تلقاء نفسه.**

على **أي** agent | Claude Code، Codex، OpenCode، Antigravity، Copilot، Cursor، Grok-Build، Pi، Hermes، OpenClaw، وغيرها.

[البدء السريع](#quickstart-15-seconds) · [الخريطة](#the-map) · [الفهرس](#the-index) · [المشكلة](#the-problem) · [fixes](#the-fixes) · [الشكر](#credits)

<sub>Read in: [English](../../README.md) · [中文](./README.zh-CN.md) · [हिन्दी](./README.hi.md) · [Español](./README.es.md) · العربية · [Português](./README.pt.md) · [Русский](./README.ru.md) · [日本語](./README.ja.md) · [Français](./README.fr.md) · [Deutsch](./README.de.md) · [한국어](./README.ko.md)</sub>

</div>

---

<a id="quickstart-15-seconds"></a>
## البدء السريع (15 ثانية)

اختر **طريقا واحدا لكل agent**؛ تثبيت طريقين يحمّل كل skill مرتين.

1. **Claude Code**:
   ```bash
   claude plugin marketplace add LilMGenius/paperthin && claude plugin install paperthin@paperthin
   ```
   ثم شغّل `/plugin` وافتح **Marketplaces** واختر `paperthin` وفعّل **Enable auto-update** مرة واحدة.
2. **Codex**: يحدّث نفسه عند بدء كل جلسة.
   ```bash
   codex plugin marketplace add LilMGenius/paperthin && codex plugin add paperthin@paperthin
   ```
3. **أي agent آخر**: سطر واحد يثبّت الـ skills ومعها تحديثا يوميا.
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*' && node "$HOME/.agents/skills/re0-upgrade/scripts/schedule/schedule.mjs" install
   ```
4. **استخدمها**. نادِ أي skill باسمه مثل `/re0`، وكثير منها يبدأ وحده حين يحتاجه العمل.

**ثبّتّه من قبل؟** شغّل `/re0-upgrade` مرة واحدة في جلسة جديدة.

**لست متأكدا؟** قل لـ agent الخاص بك `install https://github.com/LilMGenius/paperthin` وسيتبع [خطوات الإعداد](../../.agents/install-block.md#handed-only-this-repository) بنفسه.

**تستخدم ChatGPT أو Claude على الويب؟** أعطه `https://raw.githubusercontent.com/LilMGenius/paperthin/main/llms-full.txt`.

<a id="the-map"></a>
## الخريطة

**كم عدد الـ artifacts، وعلى امتداد أي زمن؟**

<div align="center">
<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/map.svg" alt="خريطة Paperthin من LilMGenius/paperthin، matrix اثنان في اثنان. المحور الأفقي هو العددية: واحد ثم كثير؛ والمحور العمودي هو الزمن: الآن ثم عبر التكرارات؛ أربع مناطق. أعلى اليسار، depth: artifact واحد، الآن؛ هل هذا الشيء الواحد نظيف وصحيح؟ أعلى اليمين، breadth: artifacts كثيرة، الآن؛ هل fact واحدة متسقة في كل مكان؟ أسفل اليسار، coil: مشروع واحد عبر التكرارات؛ هل علّم كل مرور المرور التالي؟ أسفل اليمين، mesh: عقول كثيرة عبر جولات؛ هل يتقارب الحشد نحو ground truth؟" width="820">
</div>

<a id="the-index"></a>
## الفهرس

### `depth/`

| Skill | ماذا يفعل | scope | Invoker | قراءة فقط |
|---|---|---|---|---|
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | يعيد كتابة مستند أو ملف تراكمت عليه الترقيعات حتى فسد، في نسخة أولى نظيفة بدل ترقيعه من جديد | artifact واحد | model | |
| 🧭 **[readback](../../skills/depth/readback/SKILL.md)** | يتأكد قبل العمل من أنه فهم طلبك، ولا يسأل إلا حين تختلف القراءتان فعلا | instruction واحد | model | ✔ |
| 🏹 **[aim](../../skills/depth/aim/SKILL.md)** | يقرأ الملفات أو النص الذي تسلّمه له ويقترح ما تريده على الأرجح، فلا يبقى عليك إلا التأكيد | دفعة بيانات واحدة | model | ✔ |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | يختار أرخص فئة نماذج وأقل جهد تفكير يكفيان لإنجاز العمل جيدا | task واحد | model | ✔ |
| 🧹 **[elon](../../skills/depth/elon/SKILL.md)** | يقترح حذف المتطلبات الباقية بحكم العادة وحدها، مع مصدر كل منها؛ ولا يمس أبدا قواعد فرضتها جهة خارجية | مجموعة متطلبات لم تنفذ بعد مع مصادرها | model | ✔ |
| 🧩 **[scopechk](../../skills/depth/scopechk/SKILL.md)** | يتحقق، وفق النطاق الذي كتبه الهدف لنفسه، من أن القطعة الجديدة تنتمي إلى المكان الذي تريد وضعها فيه، ويقترح مكانا أنسب إن لم تكن | عنصر واحد والهدف الذي سينضم إليه | model | ✔ |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | يلعب دور الناقد القاسي: الاعتراض الوحيد الذي قد يُغرق خطتك، وأرخص اختبار يحسمه | plan واحد | user | |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | يطرح السؤال مجردا من صياغتك على عدة عقول جديدة، ويبدأ بعرض مواضع اختلافها | direction واحد | user | ✔ |
| 🔀 **[crossthink](../../skills/depth/crossthink/SKILL.md)** | حين تبدو الخيارات كلها متشابهة، يستعير أفكارا ناجحة من خمسة مجالات بعيدة أو أكثر ولا يُبقي إلا الجديد منها | مشكلة عالقة واحدة | model | ✔ |
| ⚖️ **[re0-decide](../../skills/depth/re0-decide/SKILL.md)** | يحوّل مواد القرار إلى قائمة تحقق يخرج حكمها من إجاباتك أنت؛ ولا يختار عنك أبدا | مادة مقدمة لاتخاذ قرار | user | ✔ |
| 🧐 **[whychk](../../skills/depth/whychk/SKILL.md)** | يسائل قرارا اتخذته للتو حتى تستطيع شرحه، أو يكشف الثغرة في المنطق | قرار واحد | user | ✔ |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | يعزل أولا الأجزاء الخطرة من المهمة مع بدائل أكثر أمانا، ثم ينجز الباقي بأقصى سرعة ويسجّل ما استُبعد | task واحد | model | |
| 🎨 **[re0-style](../../skills/depth/re0-style/SKILL.md)** | يفحص الكود مقابل أسلوب المشروع نفسه؛ وفي الأصل لا يغيّر شيئا ويكتب تقريرا قصيرا | تغيير واحد قيد المراجعة | model | |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | يستبدل أسماء العلامات التجارية والأدوات في المستندات الدائمة بما تفعله فعلا، لتعيش المستندات أطول من الأدوات | artifact durable واحد | model | |
| 🗜️ **[debloat](../../skills/depth/debloat/SKILL.md)** | يقلّص النص أو الكود المتضخم إلى ما يحمل الوزن فعلا، دون أن يفقد قاعدة أو سلوكا | artifact واحد، نثر أو كود | model | |
| 🔃 **[re0-order](../../skills/depth/re0-order/SKILL.md)** | يعيد قائمة مبعثرة إلى ترتيب منطقي وفق قاعدة واحدة معلنة؛ ينقل البنود ولا يغيّر كلمة | قائمة واحدة | model | |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | يزيل الشرطات الطويلة التي ينثرها الوكيل في الجمل، ويُبقي الواصلات والنطاقات وشرطات العناوين | نثرك | user | |
| ⸱ **[dedot](../../skills/depth/dedot/SKILL.md)** | في النصوص الكورية، يقترح فاصلة أو أداة ربط، مع السبب، لكل نقطة وسطى تربط عناصر قائمة | نثر كوري أو صف تسميات يحدد الكاتب نطاقه | user | ✔ |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | يسلّم عملك إلى قارئ جديد لا يعرف شيئا عن خلفيته ويسأله هل يُفهم وحده | artifact واحد | model | ✔ |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | يطابق الادعاءات مع مصادر حقيقية في الاتجاهين: فالغريب قد يكون صحيحا، والبديهي قد يكون خاطئا | claim واحد | model | |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | يتحقق هل يمنح الاختبار أو المقياس نفسه الدرجة، أم أن حقيقة خارجية فعلية هي التي تحسم النتيجة | eval واحد | model | ✔ |
| 🎭 **[demock](../../skills/depth/demock/SKILL.md)** | يعثر في الكود الفعلي على البدائل الزائفة والمسارات الاحتياطية الصامتة التي تجعل تقرير النجاح كاذبا، ويقترح الإصلاح الحقيقي | مجموعة ملفات أو مجلد أو diff محدد | model | |
| 🥸 **[deid](../../skills/depth/deid/SKILL.md)** | يجد بيانات شخص أو شركة في ملفات مشتركة، ويستبدلها باسم الدور الذي تؤديه، ويسرد الإيداعات القديمة التي ما زالت تحملها | أثر واحد مسمى ومالك واحد | model | |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | بعد أي تغيير مباشرة، وقبل أن تعدّه منتهيا، يشغّل فحوص المجموعة نفسها على ما أنتجته | output الخاص بك | model | |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | يعيد كتابة رسالة إيداع منتهٍ مع الإبقاء على تواريخه وموضعه، ليتمكن أي شخص من المتابعة من السجل وحده | commit واحد | user | |
| 🧨 **[re0-squash](../../skills/depth/re0-squash/SKILL.md)** | يعيد نشر مستودع GitHub في إيداع واحد موقّع بالملفات نفسها، فلا يبقى أي إيداع قديم في المتناول | مستودع واحد | user | |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | يمرّ على قائمة الإصدار، ثم يضع الوسم وينشر بعد تأكيدك | إصدار واحد | user | |
| 🤝 **[re0-merge](../../skills/depth/re0-merge/SKILL.md)** | يراجع مساهمة شخص آخر ويدمجها، ويحفظ له الفضل، ويشرح أي تعديل أُدخل عليها | مساهمة واحدة | user | |

### `breadth/`

| Skill | ماذا يفعل | scope | Invoker | قراءة فقط |
|---|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | يجد معلومة منسوخة في أماكن كثيرة، ويمنحها بيتا واحدا بعد موافقتك، ويجعل البقية تشير إليه | fact واحدة، أماكن كثيرة | model | |
| 🔗 **[ssotize-local](../../skills/breadth/ssotize-local/SKILL.md)** | يدمج الملفات أو المجلدات المكررة في نسخة حقيقية واحدة ترتبط بها البقية، مع طريق عودة مُختبَر | البايتات نفسها، مسارات كثيرة | model | |
| 📖 **[re0-readme](../../skills/breadth/re0-readme/SKILL.md)** | يفرز سطور README وAGENTS.md بحيث يستقر كل سطر في ملف القارئ الذي يحتاجه | README و AGENTS.md لمستودع واحد | model | |
| 📥 **[re0-import](../../skills/breadth/re0-import/SKILL.md)** | يضع المواد المسلّمة في الصفحة المناسبة من قاعدة معرفة قائمة وفق قواعدها هي، ويخبرك بما لم يجد له مكانا | مواد مسلّمة وقاعدة معرفة واحدة | user | |
| 🆙 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | يرفع تثبيتك إلى الكتالوج الحالي الكامل بخطوة واحدة تؤكدها: يحذف المهارات التي تغيّر اسمها ويضيف الجديدة | تثبيت skills الخاص بك | user | |

### `coil/`

| Skill | ماذا يفعل | scope | Invoker | قراءة فقط |
|---|---|---|---|---|
| 🗂️ **[re0-plan](../../skills/coil/re0-plan/SKILL.md)** | قبل بدء دورة عمل جديدة، يفتح مجلدها بملفات التصميم وسير العمل والأدلة | cycle جديدة واحدة | user | |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | يُبقي دورة البناء والاختبار والتعلم والبدء من جديد دائرة، فتتراكم الدروس لا الكود | الحلقة كلها | model | |
| 👁️ **[re0-watch](../../skills/coil/re0-watch/SKILL.md)** | يراقب مهمة طويلة لوكيل بحثا عن التوقف وينبهك؛ وأي إصلاح ليس إلا اقتراحا توافق عليه | مهمة قيد التشغيل | user | |
| 📝 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | يستخلص الدروس، والأخطاء الواجب تجنبها، من دورة انتهت أو فشلت | cycle مكتملة | model | |
| 🔁 **[backprop](../../skills/coil/backprop/SKILL.md)** | يعيد درس التصحيح إلى المستندات والقواعد التي سببت الخطأ، ثم يرتبها | درس واحد | model | |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | يبدأ من الصفر، ولا يحمل معه إلا الدروس التي أثبتت أنها تستحق إعادة الاستخدام | restart واحد | model | |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | يطلعك على ما فاتك أثناء غيابك: ما ينتظرك، وما تغيّر، وما تعنيه المصطلحات الجديدة | عودة واحدة | model | ✔ |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | يقرأ أين وصل العمل ويسمي خطوة تالية واحدة هي الأفضل، لا قائمة خيارات | cycle الحية | model | ✔ |
| 🪜 **[re0-workflow](../../skills/coil/re0-workflow/SKILL.md)** | لهدف واحد، يوصي بأي المهارات تُشغَّل وبأي ترتيب، دون أن يشغّلها | مقصد واحد مصرح به | model | ✔ |
| 🎓 **[re0-tutorial](../../skills/coil/re0-tutorial/SKILL.md)** | يعلّم مهارة واحدة على ثلاثة مستويات متدرجة، يُجتاز كل منها بعمل تسلّمه بنفسك | مهارة واحدة | user | |

### `mesh/`

| Skill | ماذا يفعل | scope | Invoker | قراءة فقط |
|---|---|---|---|---|
| 🕸️ **[multithink](../../skills/mesh/multithink/SKILL.md)** | يزن عدة آراء مستقلة بالأدلة التي تستشهد بها، لا بعدد من يتفقون | قراءات متعددة لـ artifact واحد أو سؤال واحد | user | ✔ |

*المزيد عن الاستدعاء: [.agents/invocation.md](../../.agents/invocation.md).*

<a id="the-problem"></a>
## المشكلة

**معظم agent skills هي slop.**

وجّه agent إلى هدف فيبدأ في **الإضافة**: ملفات أكثر، خيارات أكثر، boilerplate "مفيد" أكثر. الإضافة تبدو كأنها تقدم، ولا شيء يجعله يعود ويحذف.

> [!WARNING]
> كرر ذلك عبر مشروع وستحصل على toolkit مألوف مولد بالذكاء الاصطناعي: skills شبه مكررة، إعدادات ميتة، وREADME يقول الشيء نفسه ثلاث مرات. مقنع، مشغول، وغير قابل للصيانة بهدوء.

هذه الـ skills تراهن في الاتجاه الآخر: **كل واحدة منها تزيل شيئا**، و[الفهرس](#the-index) يقول ماذا.

> [!TIP]
> الجزء الصعب ليس إضافة الميزات، بل ضبط النفس. المرور الذي لا يجد شيئا لتحسينه لا يغير شيئا. **ذلك الضبط هو المنتج.**

<a id="the-fixes"></a>
## الإصلاحات

القصة الكاملة للإصلاحات محفوظة في [README الإنجليزي](../../README.md#the-fixes) كمصدر canonical واحد، حتى لا تنحرف أمثلة الإثبات بين الترجمات. يبقى هذا الملف للفهرس والتوجيه المحليين.

<a id="credits"></a>
## الشكر

- **مبني على** [mattpocock/skills](https://github.com/mattpocock/skills) (MIT) - معماره وفلسفته.
- **ليس fork** - هذه workflows خاصة بـ [LilMGenius](https://github.com/LilMGenius)، وغير متداخلة.
- **Vendored verbatim** - بعض building blocks المشتركة، محفوظة كما هي مع attribution لكل مصدر في [NOTICE](../../NOTICE).
- **دليل التأليف** - conventions والفلسفة في [AGENTS.md](../../AGENTS.md).
