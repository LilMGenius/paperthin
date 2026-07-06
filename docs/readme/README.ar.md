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
2. **شغّله بصلاحيات مرتفعة** حتى تُربط الـ skills كـ symlinks وتتحدث تلقائيا، بدل أن تُنسخ.
3. **استخدمها**. يستدعيها model، لذلك يصل إليها الـ agent من تلقاء نفسه عند الحاجة؛ ويمكنك أيضا استدعاء واحدة بالاسم، مثل `/re0`.

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
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | يعيد كتابة artifact انحرف إلى v0 نظيفة، لا إلى رقعة أخرى | artifact واحد | model |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | يقرأه قراءة باردة بعين جديدة وبدون سياق: هل يقف وحده؟ *(قراءة فقط)* | artifact واحد | model |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | يتحقق من claim مقابل sources في الاتجاهين: هل يمكن أن يكون العبث صحيحا، والواضح خاطئا؟ *(قراءة فقط → إصلاح)* | claim واحد | model |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | يدقق validation بحثا عن leakage: هل تدخل ground truth خارجية فعلا؟ *(قراءة فقط)* | eval واحد | model |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | يقطع scope غير الآمن مسبقا، يشغل الباقي الآمن بكامل القوة، ويخرج descope ledger | task واحد | model |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | بعد أي تغيير، يتذوق output الخاص بك بفحوص clean-and-true الخاصة بالـ repo | output الخاص بك | model |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | يرفض المجاملة: الاعتراض الوحيد الذي قد يقتل الخطة + أرخص test | plan واحد | user |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | يزيل em dashes وما يشبهها، ويختار علامة الترقيم التي يحتاجها كل موضع | نثرك | user |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | يعيد كتابة رسالة commit مكتمل إلى v0 نظيفة حتى يحمل `git log` وحده التسليم | commit واحد | user |

### `breadth/`

| Skill | ماذا يفعل | scope | Invoker |
|---|---|---|---|
| 🔎 **[ssotchk](../../skills/breadth/ssotchk/SKILL.md)** | يجد أين تشتتت fact واحدة أو تكررت؛ ويسمي canonical source *(قراءة فقط)* | fact واحدة، أماكن كثيرة | model |
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | يوحدها في بيت واحد ويجعل الباقي يشير إليه | fact واحدة، أماكن كثيرة | model |
| 🧰 **[ppt-upgrade](../../skills/breadth/ppt-upgrade/SKILL.md)** | يوفق أسماء Paperthin skill القديمة المثبتة بعد الإصدارات | أسماء skills مثبتة | user |

### `coil/`

| Skill | ماذا يفعل | scope | Invoker |
|---|---|---|---|
| 🧭 **[retro](../../skills/coil/retro/SKILL.md)** | يستخرج الدروس والـ anti-patterns من cycle انتهت أو فشلت | cycle مكتملة | model |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | يبدأ من v0 من جديد، محتفظا فقط بالدروس التي استحقت إعادة الاستخدام | restart واحد | model |
| 🌀 **[flywheel](../../skills/coil/flywheel/SKILL.md)** | يشغل حلقة build → QA → retro → re0-work حتى يتراكم التعلم، لا الكود | الحلقة كلها | model |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | يقرأ حالة cycle الحية ويعيد next best action واحدا، لا قائمة *(قراءة فقط)* | cycle الحية | model |

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
- `ssotchk` / `ssotize` يطويان ground truth نفسها المتناثرة عبر الملفات.
- `shower` يقطع ما لا يستطيع غريب متابعته.
- `retro` / `re0-work` يحفظان الدرس ويتركان البناء الخاطئ يموت.
- `autobahn` يقطع scope غير الآمن مسبقا، حتى يعمل الباقي الآمن بأقصى سرعة.
- `dedash` يزيل حتى أثر em-dash وما يشبهه، occurrence واحدة في كل مرة.
- `sip` يشغل كل ذلك على output الخاص بك تلقائيا.

> [!TIP]
> الجزء الصعب ليس إضافة الميزات، بل ضبط النفس. المرور الذي لا يجد شيئا لتحسينه لا يغير شيئا. **ذلك الضبط هو المنتج.**

<a id="the-fixes"></a>
## fixes

<!-- Fixes follow the lifecycle of a piece of work, not the skill list: keep it clean (draft → read fresh → reconcile across files → automate → ship), keep it true (a single claim → a validation → the whole plan), then keep the loop learning and the run unblocked. Slot any new fix in by where it acts in that arc. -->

**كل واحد مبدأ مجرب، جُعل تلقائيا.**

### #1 - الـ artifacts تتعفن
حرر doc قطعة قطعة عبر session وسينتفخ: stale deltas، ضجيج مكرر، وندوب changelog. الترقيع فوق ذلك يحفظ العفن فقط.

**fix → `re0`:** إعادة كتابة الـ artifact كـ v0 نظيفة، كما لو كانت النسخة الأولى.

> *أصل سابق: Boy Scout Rule - "leave it cleaner than you found it" (Robert C. Martin, [Clean Code](https://www.informit.com/articles/article.aspx?p=1235624&seqNum=6), 2008). `re0` يذهب أبعد: أعد الكتابة، لا تكتف بالترتيب.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - طلبنا من `re0` أن ينعش هذه docs مرة أخرى، لكنها كانت بالفعل عند v0.
- **Result** - لم يجد ما يحسنه وترك كل سطر prose كما هو.
- **So** - أداة لا تفعل شيئا عندما لا يوجد خطأ لا تنفخ repo أبدا: هذه skills تزيل الضجيج ولا تضيفه.
</details>

### #2 - تعمى عن عملك
بعد session طويلة تكون أنت الشخص الوحيد الذي لا يستطيع قراءة عمله باستقامة. تعرف أكثر من اللازم، فيملأ عقلك كل فجوة بصمت، وتختفي الثقوب.

**fix → `shower`:** أعط artifact فقط لغريب لم ير session الخاصة بك، واسأل: "هل هذا منطقي فعلا؟"

> *أصل سابق: [egoless programming](https://en.wikipedia.org/wiki/Egoless_programming) - لا يمكنك مراجعة عملك بموضوعية؛ يجب أن يفعل ذلك شخص آخر (Gerald Weinberg, 1971). هنا، ذلك الشخص sub-session بلا سياق.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - سلمنا spec الخاصة بـ `shower` نفسها إلى sub-session بلا سياق، معها الملف فقط.
- **Result** - خلال دقائق وجدت ثلاثة bugs فاتت المؤلف:
  - خطوة كانت تلمح إلى الجواب الذي يجب أن تخفيه،
  - path كان يسرب spoiler files،
  - scope غامض أكثر من اللازم للعمل.
- **So** - skill يمسك bugs الخاصة به يمكنه أن يمسك bugs الخاصة بك.
</details>

### #3 - ground truth نفسها تنتهي في كل مكان
قيمة timeout، قرار، status: تنسخ إلى README وdoc وticket وSlack thread. النسخ تنحرف، ولا يعود أحد يعرف أيها صحيح.

**fix → `ssotchk` + `ssotize`:** إيجاد التشتت، تسمية canonical source، ثم التوحيد وجعل الباقي يشير إليها.

> *أصل سابق: [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) - fact واحدة، بيت موثوق واحد (Hunt & Thomas, The Pragmatic Programmer, 1999).*

### #4 - "تذكر أن تتحقق" لا يعمل أبدا
قاعدة مدفونة في docs لن تنطلق في session جديدة، بالضبط حين يكون المؤلف bias في أعلى مستوياته.

**fix → `sip`:** لحظة تنهي شيئا، يشغل clean checks (`shower`, `ssotchk`, `re0`) وعلى وجود claim أو eval يشغل true checks (`factchk`, `mandela`) على output الخاص بك تلقائيا.

> *أصل سابق: [dogfooding](https://en.wikipedia.org/wiki/Eating_your_own_dog_food) - eat your own dog food (Microsoft, 1988). تذوق طبخك قبل أن تقدمه.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - بعد refactor كبير جعل كل skill self-contained، انطلق `sip` تلقائيا.
- **Result** - التمرير بعين جديدة أمسك شيئين لم يعد المؤلف يراهما: قاعدة صيانة ما زالت تشير إلى skill-to-skill links كان refactor نفسه قد حذفها، وقاعدة أمان file-editing موجودة في skillين لكنها غائبة عن ثالث يحرر files أيضا.
- **So** - الفحص يعض حيث يكون الانحياز أعلى: ليس على artifact جديد، بل على drift الذي تتركه تغييرات كبيرة، بالضبط حيث تزلق عينا المؤلف.
</details>

### #5 - الـ session لا تسافر؛ git log يسافر
تظل session محبوسة حيث عملت: هذا agent، هذا account، هذه machine. لا يستطيع teammate أو agent آخر تحميل السياق الذي حدث فيه عملك.

**fix → `re0-git`:** تنظيف رسالة commit مكتمل حتى يحمل `git log`، الشيء المشترك بين كل البيئات، handoff، ويستطيع أي شخص المتابعة من log وحده.

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - أول هدف لـ `re0-git` كان release commit الخاص به.
- **Result** - كشف dogfooding خطأين وتم إصلاحهما:
  - message محشوة بتفاصيل غير لازمة،
  - spec تعظ بعدم التكرار بينما تكرر نفسها.
- **So** - أول cleanup له كان وراء نفسه.
</details>

> [!NOTE]
> fixes الخمسة أعلاه تبقي artifact **نظيفا**. الثلاثة التالية تبقيه **صحيحا**: نفس عدم الثقة بالمؤلف، موجهة إلى reasoning بدلا من prose.

### #6 - حدسك ليس مصدرا
"Plausible"، "absurd"، "novel" هي أقل سطر موثوق في أي artifact. priors البشرية تفشل **في الاتجاهين**: تستبعد الحقيقي (ضفادع الصحراء موجودة) وتطبع المستحيل (صناديق عديمة الوزن).

**fix → `factchk`:** تحقق من أي claim مرتبط بالواقع مقابل sources خارجية، في الاتجاهين، قبل ship، وعلّم ما لا يمكن الوصول إلى مصدر له بدلا من التخمين.

> *أصول سابقة: [WEIRD bias](https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/abs/weirdest-people-in-the-world/BF84F7517D56AFF7B7EB58411A554C17) (Henrich, Heine & Norenzayan, 2010) و[naive-physics / impetus error](https://www.science.org/doi/10.1126/science.210.4474.1139) (McCloskey, Caramazza & Green, 1980) - intuition يسيء حكم الواقع في الاتجاهين.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - شغلنا `factchk` على citations الخاصة به المنشورة، في الاتجاهين.
- **Result** - كلها صمدت، ومع ذلك أمسك خطأي attribution: صياغة "what's measured becomes the target" الشهيرة تعود إلى Strathern (1997)، لا Goodhart؛ و"McCloskey 1980" هي ورقة *Science* المشتركة، لا مقالة *Scientific American* لعام 1983.
- **So** - fact-checker يدقق حواشيه سيدقق حواشيك.
</details>

### #7 - الـ eval يؤكد نفسه
يمكن أن يتفق model وscorer وdesigner جميعا على أن النتيجة حقيقية بينما لم تدخل أي ground truth خارجية الحلقة. غرفة كاملة تتذكر بثقة شيئا لم يحدث مستقلا.

**fix → `mandela`:** تدقيق أي eval أو metric أو experiment مقابل taxonomy من 8 أنماط leakage: هل تدخل ground truth خارجية باستقلال، أم أن verifier هو designer؟

> *أصول سابقة: [Goodhart's law](https://en.wikipedia.org/wiki/Goodhart%27s_law)، و[data leakage](https://dl.acm.org/doi/10.1145/2382577.2382579) (Kaufman et al., 2012)، و[circular analysis](https://www.nature.com/articles/nn.2303) - "double dipping" (Kriegeskorte et al., 2009).*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - جاء audit من research design كان يموت من failure mode واحد: scorer وmodel وdesigner يتفقون على نتيجة لم تنتجها أي truth خارجية.
- **Result** - ظهرت leakage في ثمانية أشكال داخل ذلك المشروع: scorer يقيّم buckets رسمها بنفسه، مكونان "يتحققان" من بعضهما في shared space، recipe خاصة تجعل verifier هو designer. صار ذلك catalog هو taxonomy ذات 8 أنماط للـ skill.
- **So** - checklist ليست نظرية: كل pattern فيها أسال دما مرة.
</details>

### #8 - لا يمكنك قتل خطتك
أنت بنيتها، لذلك تدافع عنها. الأسئلة التي قد تكسرها هي بالضبط ما لن تسأله.

**fix → `hate`:** رفض اللطف مع الخطة؛ يعيد الاعتراض الحامل الوحيد الذي قد يقتلها وأرخص experiment يثبت أنه مهم. يستدعيه user: توجهه إلى plan عمدا.

> *أصول سابقة: [egoless programming](https://en.wikipedia.org/wiki/Egoless_programming) (Weinberg, 1971، نفس الجذر الذي يستشهد به `shower`)، hostile review، وfail-fast.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - كل research pass أغلق بـ adversarial critic، وكان حكمه دائما root cause واحدا مع أرخص test يحسمه، لا checklist.
- **Result** - قتل recombination engine بعبارة "one more box drawn, not a sharper tip"، وقتل human-holdout protocol بالأرقام وحدها: n≈24 حيث كان المطلوب 36، family-wise error rate قريب من 34%، وتصميم يستشهد بمبدأ بينما ينفذ عكسه.
- **So** - الاعتراض المهم كان دائما مفردا ورخيص الاختبار، بالضبط `{root, first nail}` الذي يقفل `hate` على إرجاعه.
</details>

### #9 - build يعمل قد يكون المنتج الخاطئ
الدورات agentic الطويلة تنتج أجزاء كثيرة تعمل: panels، routes، tests، screenshots. تثبت النشاط أكثر مما تثبت القيمة، وsunk cost يغريك بحمل architecture إلى الأمام. وبين passes تضيع الحركة التالية في عشرات threads الحية، وكثرة الخيارات تصبح شللا.

**fix → `retro` + `re0-work` + `flywheel` + `nba`:** استخراج lesson وanti-pattern وnext gate؛ البدء من v0 نظيفة عندما يكون الأساس خاطئا؛ تشغيل حلقة build → QA → retro → re0-work؛ وعندما يضيع الخيط، قراءة state وإرجاع single next best action. احتفظ فقط بما استحق reuse.

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - وصل demo لمحرك ألعاب إلى حالة full-stack runnable: API routes، canvas runtime، leaderboard، arcade pages، remix وtelemetry panels، tests، screenshots.
- **Result** - ومع ذلك كان المنتج الخطأ: الألعاب المولدة كانت mock، شاشة واحدة، بلا durable replay layer، وكل pass انتهى بسؤال "what now?" أمام كومة unmet gates وparked threads.
- **So** - كونه يعمل ويشبه ما يمكن شحنه لا يعني done؛ تحتاج cycle إلى skill يسمي gate المفقود وآخر يعيد الحركة التالية الوحيدة.
</details>

### #10 - العمل القريب من المخاطر يعود مخففا
وجّه agent إلى task يلمس guardrails مثل scraping أو licensing أو privacy أو security، وستحصل على أسوأ العالمين: الشريحة الخطرة تثير refusals وretries، بينما الـ 90% الآمنة تعود hedged أو diluted أو ناقصة بصمت.

**fix → `autobahn`:** قطع items القريبة من guardrails خارج scope قبل التنفيذ، مع safe alternative وarchive entry لكل منها؛ تشغيل scope المتبقي بكامل القوة في subagent جديد لا يرى إلا carved prompt، لا input الخطر؛ وشحن descope ledger حتى يكون كل exclusion قرارا مرئيا لا فجوة صامتة. إنه يزيل الطلب بدلا من تمريره. لا حد سرعة على autobahn **لأن** انضباط الدخول صارم.

> *أصل من هذا الصيف نفسه: علقت الولايات المتحدة [Fable 5 and Mythos 5](https://www.anthropic.com/news/fable-mythos-access) بسبب safeguard واحد jailbroken (Anthropic, 2026)، وشحنت OpenAI [GPT-5.6](https://openai.com/index/previewing-gpt-5-6-sol/) بأسلوب safety-stack-first إلى trusted partners (OpenAI, 2026). عند frontier، يبقى fast lane مفتوحا بقدر ما يصمد entry discipline.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - الطريقة مأخوذة من rewrite حي لوثيقة استراتيجية سرية كانت risk-adjacent على أربعة محاور: stealth tooling، trademarked names، privacy-adjacent profiling، scraping gray zones.
- **Result** - main loop ومعها عشرة subagents شغّلوا frontier model من البداية للنهاية: zero flags، zero refusals، zero fallbacks. وكل safe alternative لعنصر descoped اتضح أنه المنتج الأفضل على أي حال.
- **So** - main loop قطعت، subagents النظيفة شغلت safe scope، وهذا القطع هو ما سمح لها بالانطلاق بكامل القوة.
</details>

<a id="credits"></a>
## الشكر

- **مبني على** [mattpocock/skills](https://github.com/mattpocock/skills) (MIT) - معماره وفلسفته.
- **ليس fork** - هذه workflows خاصة بـ [LilMGenius](https://github.com/LilMGenius)، وغير متداخلة.
- **Vendored verbatim** - بعض building blocks المشتركة، محفوظة كما هي مع attribution لكل مصدر في [NOTICE](../../NOTICE).
- **دليل التأليف** - conventions والفلسفة في [CLAUDE.md](../../CLAUDE.md).
