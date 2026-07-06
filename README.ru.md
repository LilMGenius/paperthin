<div align="center">

# Paperthin: низкоуровневые agentic design patterns

<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/banner.svg" alt="Paperthin - доверяйте артефакту, а не автору." width="820">

**Превращает старую инженерную мудрость в рефлексы, к которым агент обращается сам.**

Для **любого** агента | Claude Code, Codex, OpenCode, Antigravity, Copilot, Cursor, Grok-Build, Pi, Hermes, OpenClaw и т. д.

[Быстрый старт](#quickstart-15-seconds) · [Карта](#the-map) · [Индекс](#the-index) · [Проблема](#the-problem) · [Фиксы](#the-fixes) · [Credits](#credits)

Языки: [English](./README.md) · Русский

</div>

---

<a id="quickstart-15-seconds"></a>
## Быстрый старт (15 секунд)

1. **Установите** для каждого агента, которым пользуетесь:
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*'
   ```
2. **Запустите с повышенными правами**, чтобы skills были установлены как symlinks и автоматически обновлялись, а не копировались.
3. **Используйте их**. Они model-invoked, поэтому агент сам дотянется до них, когда нужно; или вызовите один по имени, например `/re0`.

**Не уверены?** Вставьте эту команду в того агента, которым пользуетесь, и скажите `set this up for me`. Остальное он сделает сам.

<a id="the-map"></a>
## Карта

**Сколько артефактов, и на каком промежутке времени?**

<div align="center">
<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/map.svg" alt="Карта Paperthin от LilMGenius/paperthin, матрица два на два. Горизонтальная ось - cardinality: один, затем много; вертикальная ось - time: сейчас, затем через iterations; четыре области. Вверху слева, depth: один артефакт, сейчас; чистая и правдивая ли эта одна вещь? Вверху справа, breadth: много артефактов, сейчас; единая truth консистентна везде? Внизу слева, coil: один проект через iterations; научил ли каждый pass следующий? Внизу справа, mesh: много умов через несколько rounds; сходится ли crowd к truth?" width="820">
</div>

<a id="the-index"></a>
## Индекс

### `depth/`

| Skill | Что делает | Scope | Invoker |
|---|---|---|---|
| ♻️ **[re0](./skills/depth/re0/SKILL.md)** | Переписывает поплывший артефакт в чистую v0, а не накладывает еще один patch | один артефакт | model |
| 🚿 **[shower](./skills/depth/shower/SKILL.md)** | Cold-read свежими глазами без контекста: держится ли артефакт сам по себе? *(read-only)* | один артефакт | model |
| 🔬 **[factchk](./skills/depth/factchk/SKILL.md)** | Проверяет claim по sources в обе стороны: может ли абсурд быть реальным, а очевидное ложным? *(read-only → fix)* | один claim | model |
| 🧪 **[mandela](./skills/depth/mandela/SKILL.md)** | Аудитит validation на leakage: действительно ли внутрь входит внешняя ground truth? *(read-only)* | один eval | model |
| 🛣️ **[autobahn](./skills/depth/autobahn/SKILL.md)** | Заранее вырезает unsafe scope, запускает безопасный остаток на полной мощности и отдает descope ledger | одна task | model |
| 🥄 **[sip](./skills/depth/sip/SKILL.md)** | После любого изменения пробует output через собственные clean-and-true checks репозитория | ваш output | model |
| 😈 **[hate](./skills/depth/hate/SKILL.md)** | Отказывается быть добрым: одно objection, которое может убить plan, плюс самый дешевый test | один plan | user |
| ✂️ **[dedash](./skills/depth/dedash/SKILL.md)** | Убирает em dashes и их look-alikes, выбирая пунктуацию, которая реально нужна в каждом месте | ваша prose | user |
| 🧾 **[re0-git](./skills/depth/re0-git/SKILL.md)** | Переписывает message готового commit в чистую v0, чтобы один `git log` нес handoff | один commit | user |

### `breadth/`

| Skill | Что делает | Scope | Invoker |
|---|---|---|---|
| 🔎 **[ssotchk](./skills/breadth/ssotchk/SKILL.md)** | Находит, где один fact разбросан или продублирован; называет canonical source *(read-only)* | один fact, много мест | model |
| 🧲 **[ssotize](./skills/breadth/ssotize/SKILL.md)** | Consolidate этот fact в одном доме и направляет остальные места туда | один fact, много мест | model |
| 🧰 **[ppt-upgrade](./skills/breadth/ppt-upgrade/SKILL.md)** | Согласует старые установленные имена Paperthin skills после релизов | установленные skill names | user |

### `coil/`

| Skill | Что делает | Scope | Invoker |
|---|---|---|---|
| 🧭 **[retro](./skills/coil/retro/SKILL.md)** | Извлекает lessons и anti-patterns из завершенного или проваленного cycle | один завершенный cycle | model |
| 🧱 **[re0-work](./skills/coil/re0-work/SKILL.md)** | Начинает заново с v0, оставляя только lessons, заслужившие reuse | один restart | model |
| 🌀 **[flywheel](./skills/coil/flywheel/SKILL.md)** | Запускает loop build → QA → retro → re0-work, чтобы накапливалось learning, а не code | весь loop | model |
| 🎯 **[nba](./skills/coil/nba/SKILL.md)** | Читает live cycle state и возвращает один next best action, а не меню *(read-only)* | текущий cycle | model |

### `mesh/`

*В разработке - сводить независимые взгляды к consensus.*

*Подробнее о вызове: [docs/invocation.md](./docs/invocation.md).*

<a id="the-problem"></a>
## Проблема

**Большинство агентских skills - это slop.**

Дайте агенту цель, и он начнет **добавлять**: больше файлов, больше опций, больше "полезного" boilerplate. Добавление выглядит как прогресс, и ничто не заставляет его вернуться и удалить лишнее.

> [!WARNING]
> Повторите это в проекте несколько раз, и получите знакомый AI-generated toolkit: почти дублирующиеся skills, мертвые настройки, README, который трижды говорит одно и то же. Правдоподобно, занято, и тихо непригодно к поддержке.

Эти skills ставят на обратное. **Каждый из них что-то убирает:**

- `re0` переписывает draft в чистую v0 вместо того, чтобы patchить его дальше.
- `ssotchk` / `ssotize` сворачивают один и тот же fact, разбросанный по файлам.
- `shower` вырезает то, за чем незнакомый читатель не сможет проследить.
- `retro` / `re0-work` сохраняют lesson и дают неправильному build умереть.
- `autobahn` заранее вырезает unsafe scope, чтобы безопасный остаток шел на полной скорости.
- `dedash` убирает даже em-dash tell и его look-alikes, оценивая каждое вхождение отдельно.
- `sip` автоматически запускает все это на вашем own output.

> [!TIP]
> Трудная часть - не добавлять features, а удерживаться. Pass, который не нашел, что улучшить, ничего не меняет. **Это restraint и есть продукт.**

<a id="the-fixes"></a>
## Фиксы

<!-- Fixes follow the lifecycle of a piece of work, not the skill list: keep it clean (draft → read fresh → reconcile across files → automate → ship), keep it true (a single claim → a validation → the whole plan), then keep the loop learning and the run unblocked. Slot any new fix in by where it acts in that arc. -->

**Каждый из них - проверенный принцип, доведенный до автоматизма.**

### #1 - Артефакты гниют
Если редактировать doc кусок за куском в течение session, он раздувается: stale deltas, duplicated noise, changelog scars. Новый patch сверху только консервирует rot.

**Фикс → `re0`:** переписать артефакт как чистую v0, будто это первая версия.

> *Prior art: Boy Scout Rule - "leave it cleaner than you found it" (Robert C. Martin, [Clean Code](https://www.informit.com/articles/article.aspx?p=1235624&seqNum=6), 2008). `re0` идет дальше: rewrite, not just tidy.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - мы попросили `re0` еще раз обновить эти docs, но они уже были на v0.
- **Result** - он не нашел, что улучшить, и не тронул ни одной строки prose.
- **So** - tool, который ничего не делает, когда ничего не сломано, никогда не раздувает repo: эти skills убирают noise, а не добавляют его.
</details>

### #2 - Вы слепнете к собственной работе
После длинной session вы - единственный человек, который уже не может читать свою работу прямо: вы знаете слишком много, мозг тихо заполняет каждый gap, и holes становятся невидимыми.

**Фикс → `shower`:** дать артефакт незнакомцу, который не видел вашу session, и спросить: "это вообще имеет смысл?"

> *Prior art: [egoless programming](https://en.wikipedia.org/wiki/Egoless_programming) - нельзя объективно ревьюить собственную работу; это должен сделать кто-то другой (Gerald Weinberg, 1971). Здесь этот кто-то - context-free sub-session.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - мы передали собственную spec `shower` в sub-session с нулевым контекстом, где был только файл.
- **Result** - за минуты он нашел три bug, которые автор пропустил:
  - step, который подсказывал ответ, хотя должен был его скрывать;
  - path, который leaked spoiler files;
  - scope, слишком vague, чтобы по нему действовать.
- **So** - skill, который ловит собственные bugs, может поймать и ваши.
</details>

### #3 - Один и тот же fact оказывается везде
Timeout value, decision, status - скопированы в README, doc, ticket и Slack thread. Копии driftят, и уже никто не знает, какая версия true.

**Фикс → `ssotchk` + `ssotize`:** найти scatter, назвать canonical source, затем consolidate и направить остальное туда.

> *Prior art: [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) - one fact, one authoritative home (Hunt & Thomas, The Pragmatic Programmer, 1999).*

### #4 - "Не забудь проверить" никогда не срабатывает
Guideline, спрятанный в docs, не сработает в brand-new session - ровно тогда, когда author bias максимален.

**Фикс → `sip`:** как только вы что-то завершаете, он запускает clean checks (`shower`, `ssotchk`, `re0`), а если есть claim или eval, еще и true checks (`factchk`, `mandela`) на вашем output.

> *Prior art: [dogfooding](https://en.wikipedia.org/wiki/Eating_your_own_dog_food) - eat your own dog food (Microsoft, 1988). Taste your own cooking before you serve it.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - сразу после большого refactor, который сделал каждый skill self-contained, `sip` сработал автоматически.
- **Result** - fresh-eyes pass поймал две вещи, которые автор уже не видел: maintenance rule все еще указывал на skill-to-skill links, удаленные этим же refactor, а file-editing safety rule был в двух skills, но отсутствовал в третьем, который тоже редактирует files.
- **So** - check кусает там, где bias выше всего: не на свежем артефакте, а на drift после большого change, именно там, где глаза автора скользят мимо.
</details>

### #5 - Session не путешествует; git log путешествует
Ваша session застряла там, где она выполнялась: этого агента, этот account, эта machine. Teammate или другой агент не может загрузить контекст вашей работы.

**Фикс → `re0-git`:** очистить message готового commit, чтобы `git log` - единственная общая вещь для всех environments - нес handoff, и любой мог продолжить только по log.

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - самой первой целью `re0-git` был его собственный release commit.
- **Result** - dogfooding выявил два faults, оба исправлены:
  - message, раздутый trivia;
  - spec, который проповедовал "no redundancy" и сам повторялся.
- **So** - его первая cleanup была после самого себя.
</details>

> [!NOTE]
> Пять фиксов выше держат артефакты **clean**. Следующие три держат их **true** - то же недоверие к автору, но направленное на reasoning вместо prose.

### #6 - Gut feeling не source
"Plausible", "absurd", "novel" - самая ненадежная строка в любом артефакте. Human priors ошибаются **в обе стороны**: исключают реальное (desert frogs exist) и нормализуют невозможное (weightless crates).

**Фикс → `factchk`:** перед ship проверять любой reality-grounded claim по external sources в обе стороны; если source недоступен, flag it, не угадывать.

> *Prior art: [WEIRD bias](https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/abs/weirdest-people-in-the-world/BF84F7517D56AFF7B7EB58411A554C17) (Henrich, Heine & Norenzayan, 2010) и [naive-physics / impetus error](https://www.science.org/doi/10.1126/science.210.4474.1139) (McCloskey, Caramazza & Green, 1980) - intuition misjudges reality in both directions.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - мы запустили `factchk` на его собственных shipped citations в обе стороны.
- **Result** - все выдержало, но он все равно поймал две attribution slips: знаменитая формулировка "what's measured becomes the target" принадлежит Strathern (1997), не Goodhart; а "McCloskey 1980" - это co-authored *Science* paper, не статья *Scientific American* 1983 года.
- **So** - fact-checker, который аудитит собственные footnotes, проаудитит и ваши.
</details>

### #7 - Eval подтверждает сам себя
Model, scorer и designer могут все согласиться, что result real, хотя external ground truth ни разу не вошла в loop. Вся комната уверенно помнит то, что независимо никогда не происходило.

**Фикс → `mandela`:** audit любого eval, metric или experiment по 8-pattern leakage taxonomy: входит ли external ground truth независимо, или verifier и есть designer?

> *Prior art: [Goodhart's law](https://en.wikipedia.org/wiki/Goodhart%27s_law), [data leakage](https://dl.acm.org/doi/10.1145/2382577.2382579) (Kaufman et al., 2012), и [circular analysis](https://www.nature.com/articles/nn.2303) - "double dipping" (Kriegeskorte et al., 2009).*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - audit был извлечен из research design, который постоянно умирал от одного failure mode: scorer, model и designer соглашались с result, который никакая outside truth не произвела.
- **Result** - leakage проявилась в восьми формах в одном project: scorer оценивал buckets, которые сам нарисовал; два components "verifying" each other in shared space; private recipe превращал verifier в designer. Этот catalog стал 8-pattern taxonomy skill.
- **So** - checklist не теоретический: каждый pattern в нем уже однажды drew blood.
</details>

### #8 - Вы не можете убить собственный plan
Вы его построили, поэтому защищаете. Вопросы, которые могли бы его сломать, - именно те, которые вы не зададите.

**Фикс → `hate`:** отказаться быть добрым к plan; вернуть одно load-bearing objection, которое может его убить, и самый дешевый experiment, который покажет, важно ли это. User-invoked: вы намеренно направляете его на plan.

> *Prior art: [egoless programming](https://en.wikipedia.org/wiki/Egoless_programming) (Weinberg, 1971 - тот же корень, который цитирует `shower`), hostile review и fail-fast.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - каждый research pass закрывался adversarial critic, и verdict всегда был one root cause plus cheapest test, который решал вопрос, а не checklist.
- **Result** - он убил recombination engine фразой "one more box drawn, not a sharper tip", и human-holdout protocol одними numbers: n≈24 там, где нужно было 36, family-wise error rate около 34%, и design, который цитировал принцип, но реализовывал противоположность.
- **So** - objection, который mattered, всегда был singular и cheap to test - ровно тот `{root, first nail}`, который `hate` обязан вернуть.
</details>

### #9 - Running build все еще может быть wrong product
Длинные agentic cycles создают много working parts: panels, routes, tests, screenshots. Они доказывают activity больше, чем value, а sunk cost соблазняет тащить architecture дальше. Между passes следующий move расплывается в дюжину live threads, и слишком много options становится собственной paralysis.

**Фикс → `retro` + `re0-work` + `flywheel` + `nba`:** извлечь lesson, anti-pattern и next gate; перезапуститься с clean v0, если foundation неверен; запустить loop build → QA → retro → re0-work; а когда thread потерян, прочитать state и вернуть single next best action. Оставлять только то, что earned reuse.

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - game-engine demo дошел до full-stack runnable state: API routes, canvas runtime, leaderboard, arcade pages, remix и telemetry panels, tests, screenshots.
- **Result** - и все равно это был wrong product: generated games были mock, one-screen, без durable replay layer, а каждый pass заканчивался "what now?" перед кучей unmet gates и parked threads.
- **So** - running и shipping-shaped не значит done; cycle нужен skill, который назовет missing gate, и skill, который вернет single next move.
</details>

### #10 - Risk-adjacent work возвращается hedged
Направьте агента на task, который касается guardrails - scraping, licensing, privacy, security, - и получите худшее из двух миров: risky sliver вызывает refusals и retries, а безопасные 90% возвращаются hedged, diluted или тихо missing.

**Фикс → `autobahn`:** до execution вырезать guardrail-adjacent items из scope, для каждого дать safe alternative и archive entry; оставшийся scope запустить на полной мощности в fresh subagent, который видит только carved prompt, а не risky input; отдать descope ledger, чтобы каждое exclusion было visible decision, а не silent gap. Он убирает ask, а не протаскивает его мимо. У autobahn нет speed limit, потому что entry discipline строгая.

> *Prior art прямо из этого лета: США [suspended Fable 5 and Mythos 5](https://www.anthropic.com/news/fable-mythos-access) из-за одного jailbroken safeguard (Anthropic, 2026), а OpenAI shipped [GPT-5.6](https://openai.com/index/previewing-gpt-5-6-sol/) safety-stack-first trusted partners (OpenAI, 2026). На frontier fast lane открыт ровно настолько, насколько держится entry discipline.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - метод был взят из live rewrite конфиденциального strategy doc, который был risk-adjacent сразу по четырем осям: stealth tooling, trademarked names, privacy-adjacent profiling, scraping gray zones.
- **Result** - main loop плюс десять subagents прогнали frontier model end to end: zero flags, zero refusals, zero fallbacks. И safe alternative каждого descoped item оказался лучшим product.
- **So** - main loop carve-ил, clean subagents запускали safe scope, и именно carve позволил им идти на полной мощности.
</details>

<a id="credits"></a>
## Credits

- **Built on** [mattpocock/skills](https://github.com/mattpocock/skills) (MIT) - его architecture и philosophy.
- **Not a fork** - это собственные, non-overlapping workflows [LilMGenius](https://github.com/LilMGenius).
- **Vendored verbatim** - несколько shared building blocks оставлены as-is с per-source attribution в [NOTICE](./NOTICE).
- **Authoring guide** - conventions и philosophy живут в [CLAUDE.md](./CLAUDE.md).
