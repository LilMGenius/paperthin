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

1. **ثبّت** لكل agent تستخدمه:
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*'
   ```
2. **شغّله من shell بصلاحيات مرتفعة/admin إذا طلب نظام التشغيل ذلك** حتى تُربط الـ skills كـ symlinks وتتحدث تلقائيا، بدل أن تُنسخ.
3. **ابقَ محدثا**. شغّل `/re0-upgrade` متى أردت التحديث؛ يفعّل أيضا إشعار بدء-جلسة هادئا عند وصول skills جديدة.
4. **استخدمها**. نادِ أي skill بالاسم مثل `/re0`؛ وتنطلق model-invoked وحدها أيضا.

**لست متأكدا؟** الصق ذلك الأمر في أي agent تستخدمه وقل فقط `set this up for me`. سيتولى الباقي.

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
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | يعيد كتابة artifact انحرف إلى v0 نظيفة، لا إلى رقعة أخرى | artifact واحد | model | |
| 🧭 **[readchk](../../skills/depth/readchk/SKILL.md)** | يتحقق من قراءة الطلب، ولا يظهر إلا fork حقيقيا باقيا | instruction واحد | model | ✔ |
| 🏹 **[aim](../../skills/depth/aim/SKILL.md)** | يقرأ البيانات المُسلَّمة ويقترح القصد للتأكيد، بدل أن يسأل عنه | دفعة بيانات واحدة | model | ✔ |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | يحدد أرخص tier و reasoning effort كافيين | task واحد | model | ✔ |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | يرفض المجاملة: الاعتراض الوحيد الذي قد يقتل الخطة، وأرخص test | plan واحد | user | |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | يزيل bait، يوزع قراءات جديدة، ويعرض divergence أولا | direction واحد | user | ✔ |
| 🧐 **[feynman](../../skills/depth/feynman/SKILL.md)** | يضغط على قرار اتُّخذ للتو حتى تستطيع شرحه، أو تُعلَّم الفجوة | قرار واحد | user | ✔ |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | يقطع scope غير الآمن مسبقا، يشغل الباقي الآمن بكامل القوة، ويسجل descope | task واحد | model | |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | يستبدل أسماء الأدوات العارضة بالآلية المقصودة | artifact durable واحد | model | |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | يزيل em dashes وما يشبهها، ويختار علامة الترقيم التي يحتاجها كل موضع | نثرك | user | |
| 🔃 **[reorder](../../skills/depth/reorder/SKILL.md)** | يعيد ترتيب قائمة انحرفت إلى نظام منطقي وفق مبدأ واحد معلن؛ ينقل العناصر فقط، دون إعادة صياغة أي شيء | قائمة واحدة | user | |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | يقرأه قراءة باردة بعين جديدة وبدون سياق: هل يقف وحده؟ | artifact واحد | model | ✔ |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | يتحقق مما يُدّعى مقابل sources في الاتجاهين: هل يمكن أن يكون العبث صحيحا، والواضح خاطئا؟ | claim واحد | model | |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | يدقق بحثا عن leakage: هل تدخل ground truth خارجية فعلا؟ | eval واحد | model | ✔ |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | بعد أي تغيير، يتذوق output الخاص بك بفحوص clean-and-true الخاصة بالـ repo | output الخاص بك | model | |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | يعيد كتابة رسالة commit مكتمل حتى يحمل `git log` وحده التسليم | commit واحد | user | |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | يشغّل قائمة فحص shipping و releasing، ثم ينشئ tag وينشر بعد التأكيد | إصدار واحد | user | |
| 🤝 **[re0-merge](../../skills/depth/re0-merge/SKILL.md)** | يراجع مساهمة ويدمجها: يفحصها، يحفظ نسبة الفضل لصاحبها، يوافق قبل الإغلاق، ويشرح أي تغيير | مساهمة واحدة | user | |

### `breadth/`

| Skill | ماذا يفعل | scope | Invoker | قراءة فقط |
|---|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | يدقق في التشتت، ثم يوحد fact في بيت واحد ويجعل الباقي يشير إليه | fact واحدة، أماكن كثيرة | model | |
| 🧰 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | يرفع skills المثبتة إلى الكتالوج الحالي الكامل بأمر واحد: يتقاعد المُعاد تسميته، يضيف الجديد، كله بعد التأكيد أولا | تثبيت skills الخاص بك | user | |

### `coil/`

| Skill | ماذا يفعل | scope | Invoker | قراءة فقط |
|---|---|---|---|---|
| 🗂️ **[re0-plan](../../skills/coil/re0-plan/SKILL.md)** | يفتح مجلد iteration جديدا مع DESIGN/WORKFLOW/EVIDENCE قبل أول turn في re0-loop | cycle جديدة واحدة | user | |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | يشغل حلقة build → QA → re0-memo → re0-work حتى يتراكم التعلم، لا الكود | الحلقة كلها | model | |
| 🧭 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | يستخرج الدروس والـ anti-patterns من cycle انتهت أو فشلت | cycle مكتملة | model | |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | يبدأ من v0 من جديد، محتفظا فقط بالدروس التي استحقت إعادة الاستخدام | restart واحد | model | |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | يعيد بناء context المفقود من الحالة الحية: ما يحتاجه، وما تغيّر، وماذا تعني الكلمات الجديدة | عودة واحدة | model | ✔ |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | يقرأ حالة cycle الحية ويعيد next best action واحدا، لا قائمة | cycle الحية | model | ✔ |

### `mesh/`

| Skill | ماذا يفعل | scope | Invoker | قراءة فقط |
|---|---|---|---|---|
| 🔺 **[prism](../../skills/mesh/prism/SKILL.md)** | يقسّم artifact واحدا عبر عدسات مستقلة؛ يعيد حيث تتصادم والسؤال الذي يحسمها | artifact واحد | user | ✔ |

*المزيد عن الاستدعاء: [docs/invocation.md](../invocation.md).*

<a id="the-problem"></a>
## المشكلة

**معظم agent skills هي slop.**

وجّه agent إلى هدف فيبدأ في **الإضافة**: ملفات أكثر، خيارات أكثر، boilerplate "مفيد" أكثر. الإضافة تبدو كأنها تقدم، ولا شيء يجعله يعود ويحذف.

> [!WARNING]
> كرر ذلك عبر مشروع وستحصل على toolkit مألوف مولد بالذكاء الاصطناعي: skills شبه مكررة، إعدادات ميتة، وREADME يقول الشيء نفسه ثلاث مرات. مقنع، مشغول، وغير قابل للصيانة بهدوء.

هذه الـ skills تراهن في الاتجاه الآخر. **كل واحدة منها تزيل:**

- `re0` يعيد كتابة draft إلى v0 نظيفة بدلا من ترقيعه.
- `readchk` يعيد صياغة الطلب داخليا ولا يسأل إلا حين ينجو مسار حقيقي.
- `aim` يقرأ data drop مُسلَّمة ويقترح النية لتأكيدها بدلا من أن يطلبها.
- `modelchk` يحدد أرخص tier و reasoning effort كافيين قبل أن يبدأ العمل.
- `macrothink` ينشر قراءات جديدة ويبلغ عن الاختلاف قبل أن يصبح التقارب دليلا.
- `feynman` يضغط على قرار اتُّخذ للتو حتى تستطيع شرحه لمتشكك، أو يسمي الفجوة التي لا تستطيع.
- `prism` يقسم artifact واحدا عبر عدسات مستقلة ويعيد حيث تتصادم، لا متوسطها.
- `autobahn` يقطع scope غير الآمن مسبقا، حتى يعمل الباقي الآمن بأقصى سرعة.
- `detool` يستبدل أسماء الأدوات العرضية في المحتوى القابل للنقل بالآلية التي تعنيها.
- `dedash` يزيل حتى أثر em-dash وما يشبهه، occurrence واحدة في كل مرة.
- `shower` يقطع ما لا يستطيع غريب متابعته.
- `ssotize` يدقق في ground truth المتناثرة عبر الملفات، يطلب الموافقة، ثم يطويها في بيت واحد.
- `reorder` يعيد محاذاة قائمة منحرفة تحت مبدأ واحد، يحرك العناصر ولا يعيد صياغة شيء.
- `sip` يشغل كل ذلك على output الخاص بك تلقائيا.
- `re0-memo` / `re0-work` / `re0-loop` يحفظون الدرس، يتركون البناء الخاطئ يموت، ويبقون الحلقة تدور.
- `catchup` / `nba` يعيدان بناء خريطة الإنسان من الحالة الحية، ثم يعيدان الخطوة التالية الواحدة.

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
- **دليل التأليف** - conventions والفلسفة في [CLAUDE.md](../../CLAUDE.md).
