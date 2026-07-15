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
3. **استخدمها**. الـ agents التي تدعم model invocation تصل تلقائيا إلى skills من نوع model-invoked؛ يمكنك استدعاء أي skill بالاسم مثل `/re0`، أما user-invoked فلا تعمل إلا بهذه الطريقة.

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

| Skill | ماذا يفعل | scope | Invoker |
|---|---|---|---|
| 🧭 **[readchk](../../skills/depth/readchk/SKILL.md)** | يتحقق من قراءة الطلب قبل العمل غير البسيط، ولا يظهر إلا fork حقيقيا باقيا *(قراءة فقط)* | instruction واحد | model |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | يحدد أرخص tier كاف: fast أو standard أو frontier *(قراءة فقط)* | task واحد | model |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | يزيل bait الجلسة، يوزع قراءات جديدة، ويعرض divergence أولا *(قراءة فقط)* | direction واحد | user |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | يرفض المجاملة: الاعتراض الوحيد الذي قد يقتل الخطة + أرخص test | plan واحد | user |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | يقطع scope غير الآمن مسبقا، يشغل الباقي الآمن بكامل القوة، ويخرج descope ledger | task واحد | model |
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | يعيد كتابة artifact انحرف إلى v0 نظيفة، لا إلى رقعة أخرى | artifact واحد | model |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | يستبدل أسماء الأدوات العارضة في المحتوى portable بالآلية المقصودة | artifact durable واحد | model |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | يقرأه قراءة باردة بعين جديدة وبدون سياق: هل يقف وحده؟ *(قراءة فقط)* | artifact واحد | model |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | يتحقق من claim مقابل sources في الاتجاهين: هل يمكن أن يكون العبث صحيحا، والواضح خاطئا؟ *(قراءة فقط → إصلاح)* | claim واحد | model |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | يدقق validation بحثا عن leakage: هل تدخل ground truth خارجية فعلا؟ *(قراءة فقط)* | eval واحد | model |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | بعد أي تغيير، يتذوق output الخاص بك بفحوص clean-and-true الخاصة بالـ repo | output الخاص بك | model |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | يزيل em dashes وما يشبهها، ويختار علامة الترقيم التي يحتاجها كل موضع | نثرك | user |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | يعيد كتابة رسالة commit مكتمل إلى v0 نظيفة حتى يحمل `git log` وحده التسليم | commit واحد | user |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | يشغّل قائمة فحص shipping و releasing، ثم ينشئ tag وينشر بعد التأكيد | إصدار واحد | user |

### `breadth/`

| Skill | ماذا يفعل | scope | Invoker |
|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | يدقق في التشتت، يطلب الموافقة، ثم يوحد fact في بيت واحد ويجعل الباقي يشير إليه | fact واحدة، أماكن كثيرة | model |
| 🧰 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | يُحدّث skills المثبتة بأمان بأمر واحد، دون إبقاء أي اسم قديم أو إضافة أي شيء زائد | تثبيت skills الخاص بك | user |

### `coil/`

| Skill | ماذا يفعل | scope | Invoker |
|---|---|---|---|
| 🧭 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | يستخرج الدروس والـ anti-patterns من cycle انتهت أو فشلت | cycle مكتملة | model |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | يبدأ من v0 من جديد، محتفظا فقط بالدروس التي استحقت إعادة الاستخدام | restart واحد | model |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | يشغل حلقة build → QA → re0-memo → re0-work حتى يتراكم التعلم، لا الكود | الحلقة كلها | model |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | يعيد بناء context الإنسان المفقود من الحالة الحية: ما يحتاجه، وما تغيّر، وماذا تعني الكلمات الجديدة *(قراءة فقط)* | عودة واحدة | model |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | يقرأ حالة cycle الحية ويعيد next best action واحدا، لا قائمة *(قراءة فقط)* | cycle الحية | model |
| 🗂️ **[re0-plan](../../skills/coil/re0-plan/SKILL.md)** | يفتح مجلد iteration جديدا ويكتب DESIGN/WORKFLOW/EVIDENCE الخاصة به قبل أول turn في re0-loop | cycle جديدة واحدة | user |

### `mesh/`

*قيد التطوير - تقريب الرؤى المستقلة إلى consensus.*

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
- `modelchk` يحدد أرخص tier كاف قبل أن يبدأ العمل.
- `macrothink` ينشر قراءات جديدة ويبلغ عن الاختلاف قبل أن يصبح التقارب دليلا.
- `autobahn` يقطع scope غير الآمن مسبقا، حتى يعمل الباقي الآمن بأقصى سرعة.
- `detool` يستبدل أسماء الأدوات العرضية في المحتوى القابل للنقل بالآلية التي تعنيها.
- `dedash` يزيل حتى أثر em-dash وما يشبهه، occurrence واحدة في كل مرة.
- `shower` يقطع ما لا يستطيع غريب متابعته.
- `ssotize` يدقق في ground truth المتناثرة عبر الملفات، يطلب الموافقة، ثم يطويها في بيت واحد.
- `re0-memo` / `re0-work` / `re0-loop` يحفظون الدرس، يتركون البناء الخاطئ يموت، ويبقون الحلقة تدور.
- `catchup` / `nba` يعيدان بناء خريطة الإنسان من الحالة الحية، ثم يعيدان الخطوة التالية الواحدة.
- `sip` يشغل كل ذلك على output الخاص بك تلقائيا.

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
