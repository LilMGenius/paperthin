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
3. **Используйте их**. Agents с поддержкой model invocation автоматически вызывают model-invoked skills; любой skill можно вызвать по имени, например `/re0`, а user-invoked skills запускаются только так.

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
| 🧭 **[readchk](../../skills/depth/readchk/SKILL.md)** | Проверяет прочтение запроса перед нетривиальной работой и показывает только реальную оставшуюся развилку *(read-only)* | одна инструкция | model |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | Подбирает самый дешевый достаточный tier: fast, standard или frontier *(read-only)* | одна task | model |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | Убирает bait сессии, запускает свежие прочтения и первым сообщает divergence *(read-only)* | одно direction | user |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | Отказывается быть добрым: одно objection, которое может убить plan, плюс самый дешевый test | один plan | user |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | Заранее вырезает unsafe scope, запускает безопасный остаток на полной мощности и отдает descope ledger | одна task | model |
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | Переписывает поплывший артефакт в чистую v0, а не накладывает еще один patch | один артефакт | model |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | Заменяет случайные имена stack в переносимом содержании на механизм, который они означают | один durable artifact | model |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | Cold-read свежими глазами без контекста: держится ли артефакт сам по себе? *(read-only)* | один артефакт | model |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | Проверяет claim по sources в обе стороны: может ли абсурд быть реальным, а очевидное ложным? *(read-only → fix)* | один claim | model |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | Аудитит validation на leakage: действительно ли внутрь входит внешняя ground truth? *(read-only)* | один eval | model |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | После любого изменения пробует output через собственные clean-and-true checks репозитория | ваш output | model |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | Убирает em dashes и их look-alikes, выбирая пунктуацию, которая реально нужна в каждом месте | ваша prose | user |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | Переписывает message готового commit в чистую v0, чтобы один `git log` нес handoff | один commit | user |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | Проходит чек-лист shipping и releasing, затем создаёт tag и публикует после подтверждения | один release | user |

### `breadth/`

| Skill | Что делает | Scope | Invoker |
|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | Аудитит разброс, просит подтверждение, затем consolidates fact в одном доме | один fact, много мест | model |
| 🧰 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | Безопасно обновляет установленные skills одной командой, не оставляя ничего устаревшего и не устанавливая ничего лишнего | ваша установка skills | user |

### `coil/`

| Skill | Что делает | Scope | Invoker |
|---|---|---|---|
| 🧭 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | Извлекает lessons и anti-patterns из завершенного или проваленного cycle | один завершенный cycle | model |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | Начинает заново с v0, оставляя только lessons, заслужившие reuse | один restart | model |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | Запускает loop build → QA → re0-memo → re0-work, чтобы накапливалось learning, а не code | весь loop | model |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | Восстанавливает потерянный context человека из live-состояния: что от него нужно, что изменилось, что значат новые слова *(read-only)* | один re-entry | model |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | Читает live cycle state и возвращает один next best action, а не меню *(read-only)* | текущий cycle | model |

### `mesh/`

*В разработке - сводить независимые взгляды к consensus.*

*Подробнее о вызове: [docs/invocation.md](../invocation.md).*

<a id="the-problem"></a>
## Проблема

**Большинство агентских skills - это slop.**

Дайте агенту цель, и он начнет **добавлять**: больше файлов, больше опций, больше "полезного" boilerplate. Добавление выглядит как прогресс, и ничто не заставляет его вернуться и удалить лишнее.

> [!WARNING]
> Повторите это в проекте несколько раз, и получите знакомый AI-generated toolkit: почти дублирующиеся skills, мертвые настройки, README, который трижды говорит одно и то же. Правдоподобно, занято, и тихо непригодно к поддержке.

Эти skills ставят на обратное. **Каждый из них что-то убирает:**

- `re0` переписывает draft в чистую v0 вместо того, чтобы patchить его дальше.
- `ssotize` аудитит разбросанные facts, просит подтверждение и затем сворачивает их в один дом.
- `shower` вырезает то, за чем незнакомый читатель не сможет проследить.
- `re0-memo` / `re0-work` сохраняют lesson и дают неправильному build умереть.
- `autobahn` заранее вырезает unsafe scope, чтобы безопасный остаток шел на полной скорости.
- `dedash` убирает даже em-dash tell и его look-alikes, оценивая каждое вхождение отдельно.
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
