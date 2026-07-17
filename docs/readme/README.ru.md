<div align="center">

# Paperthin: низкоуровневые agentic design patterns

<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/banner.svg" alt="Paperthin - доверяйте артефакту, а не автору." width="820">

**Превращает старую инженерную мудрость в рефлексы, к которым агент обращается сам.**

Для **любого** агента | Claude Code, Codex, OpenCode, Antigravity, Copilot, Cursor, Grok-Build, Pi, Hermes, OpenClaw и т. д.

[Быстрый старт](#quickstart-15-seconds) · [Карта](#the-map) · [Индекс](#the-index) · [Проблема](#the-problem) · [Фиксы](#the-fixes) · [Credits](#credits)

<sub>Read in: [English](../../README.md) · [中文](./README.zh-CN.md) · [हिन्दी](./README.hi.md) · [Español](./README.es.md) · [العربية](./README.ar.md) · [Português](./README.pt.md) · Русский · [日本語](./README.ja.md) · [Français](./README.fr.md) · [Deutsch](./README.de.md) · [한국어](./README.ko.md)</sub>

</div>

---

<a id="quickstart-15-seconds"></a>
## Быстрый старт (15 секунд)

1. **Установите** для каждого агента, которым пользуетесь:
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*'
   ```
2. **Запустите из повышенной/admin shell, если OS этого требует**, чтобы skills были установлены как symlinks и автоматически обновлялись, а не копировались.
3. **Оставайтесь в курсе**. Запускайте `/re0-upgrade`, когда хотите обновиться; он также включает тихое уведомление при старте сессии о новых skills.
4. **Используйте их**. Вызывайте любой skill по имени, например `/re0`; model-invoked срабатывают и сами.

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

| Skill | Что делает | Scope | Invoker | read-only |
|---|---|---|---|---|
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | Переписывает поплывший артефакт в чистую v0, а не накладывает еще один patch | один артефакт | model | |
| 🧭 **[readchk](../../skills/depth/readchk/SKILL.md)** | Проверяет прочтение запроса и показывает только реальную оставшуюся развилку | одна инструкция | model | ✔ |
| 🏹 **[aim](../../skills/depth/aim/SKILL.md)** | Читает переданные данные и предлагает подтвердить намерение, вместо того чтобы о нём спрашивать | один data drop | model | ✔ |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | Подбирает самый дешевый достаточный tier: fast, standard или frontier | одна task | model | ✔ |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | Отказывается быть добрым: одно objection, которое может убить plan, плюс самый дешевый test | один plan | user | |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | Убирает bait, запускает свежие прочтения и первым сообщает divergence | одно direction | user | ✔ |
| 🧐 **[feynman](../../skills/depth/feynman/SKILL.md)** | Давит на только что принятое решение, пока не сможешь его объяснить, иначе помечает пробел | одно решение | user | ✔ |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | Заранее вырезает unsafe scope, запускает безопасный остаток на полной мощности и логирует descope | одна task | model | |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | Заменяет случайные имена stack на механизм, который они означают | один durable artifact | model | |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | Убирает em dashes и их look-alikes, выбирая пунктуацию, которая реально нужна в каждом месте | ваша prose | user | |
| 🔃 **[reorder](../../skills/depth/reorder/SKILL.md)** | Выравнивает поплывший список в логический порядок по одному заявленному принципу; только переставляет элементы, ничего не переписывает | один список | user | |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | Cold-read свежими глазами без контекста: держится ли артефакт сам по себе? | один артефакт | model | ✔ |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | Проверяет утверждаемое по sources в обе стороны: может ли абсурд быть реальным, а очевидное ложным? | один claim | model | |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | Аудитит на leakage: действительно ли внутрь входит внешняя ground truth? | один eval | model | ✔ |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | После любого изменения пробует output через собственные clean-and-true checks репозитория | ваш output | model | |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | Переписывает message готового commit, чтобы один `git log` нес handoff | один commit | user | |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | Проходит чек-лист shipping и releasing, затем создаёт tag и публикует после подтверждения | один release | user | |
| 🤝 **[re0-merge](../../skills/depth/re0-merge/SKILL.md)** | Ревьюит и принимает contribution: проводит через gate, сохраняет авторский credit, апрувит перед закрытием и объясняет любое изменение | одна contribution | user | |

### `breadth/`

| Skill | Что делает | Scope | Invoker | read-only |
|---|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | Аудитит разброс, затем consolidates fact в одном доме, остальное указывает на него | один fact, много мест | model | |
| 🧰 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | Приводит установленные skills к полному актуальному каталогу одной командой: удаляет переименованное, добавляет новое, всё сначала подтверждается | ваша установка skills | user | |

### `coil/`

| Skill | Что делает | Scope | Invoker | read-only |
|---|---|---|---|---|
| 🗂️ **[re0-plan](../../skills/coil/re0-plan/SKILL.md)** | Открывает новую папку iteration с DESIGN/WORKFLOW/EVIDENCE до первого хода re0-loop | один новый cycle | user | |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | Запускает loop build → QA → re0-memo → re0-work, чтобы накапливалось learning, а не code | весь loop | model | |
| 🧭 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | Извлекает lessons и anti-patterns из завершенного или проваленного cycle | один завершенный cycle | model | |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | Начинает заново с v0, оставляя только lessons, заслужившие reuse | один restart | model | |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | Восстанавливает потерянный context из live-состояния: что от него нужно, что изменилось, что значат новые слова | один re-entry | model | ✔ |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | Читает live cycle state и возвращает один next best action, а не меню | текущий cycle | model | ✔ |

### `mesh/`

| Skill | Что делает | Scope | Invoker | read-only |
|---|---|---|---|---|
| 🔺 **[prism](../../skills/mesh/prism/SKILL.md)** | Разбивает один артефакт по независимым линзам; возвращает, где они расходятся, и вопрос, который это разрешает | один артефакт | user | ✔ |

*Подробнее о вызове: [docs/invocation.md](../invocation.md).*

<a id="the-problem"></a>
## Проблема

**Большинство агентских skills - это slop.**

Дайте агенту цель, и он начнет **добавлять**: больше файлов, больше опций, больше "полезного" boilerplate. Добавление выглядит как прогресс, и ничто не заставляет его вернуться и удалить лишнее.

> [!WARNING]
> Повторите это в проекте несколько раз, и получите знакомый AI-generated toolkit: почти дублирующиеся skills, мертвые настройки, README, который трижды говорит одно и то же. Правдоподобно, занято, и тихо непригодно к поддержке.

Эти skills ставят на обратное. **Каждый из них что-то убирает:**

- `re0` переписывает draft в чистую v0 вместо того, чтобы patchить его дальше.
- `readchk` переформулирует запрос и спрашивает только тогда, когда выживает настоящая развилка.
- `modelchk` определяет самый дешевый достаточный tier до начала работы.
- `macrothink` разворачивает свежие прочтения и сообщает о divergence прежде, чем convergence сойдет за доказательство.
- `autobahn` заранее вырезает unsafe scope, чтобы безопасный остаток шел на полной скорости.
- `detool` заменяет случайные названия инструментов в переносимом контенте на механизм, который они означают.
- `dedash` убирает даже em-dash tell и его look-alikes, оценивая каждое вхождение отдельно.
- `shower` вырезает то, за чем незнакомый читатель не сможет проследить.
- `ssotize` аудитит разбросанные facts, просит подтверждение и затем сворачивает их в один дом.
- `re0-memo` / `re0-work` / `re0-loop` сохраняют lesson, дают неправильному build умереть и держат loop живым.
- `catchup` / `nba` восстанавливают карту человека из live-состояния и возвращают один следующий ход.
- `sip` автоматически запускает все это на вашем own output.

> [!TIP]
> Трудная часть - не добавлять features, а удерживаться. Pass, который не нашел, что улучшить, ничего не меняет. **Это restraint и есть продукт.**

<a id="the-fixes"></a>
## Исправления

Полная история Fixes живет как единый canonical source в [английском README](../../README.md#the-fixes), чтобы proof examples не расходились между переводами. Этот файл остается для индекса и локальной ориентации.

<a id="credits"></a>
## Credits

- **Built on** [mattpocock/skills](https://github.com/mattpocock/skills) (MIT) - его architecture и philosophy.
- **Not a fork** - это собственные, non-overlapping workflows [LilMGenius](https://github.com/LilMGenius).
- **Vendored verbatim** - несколько shared building blocks оставлены as-is с per-source attribution в [NOTICE](../../NOTICE).
- **Authoring guide** - conventions и philosophy живут в [CLAUDE.md](../../CLAUDE.md).
