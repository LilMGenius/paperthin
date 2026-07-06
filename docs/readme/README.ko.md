<div align="center">

# Paperthin: 로우레벨 에이전트 설계 패턴

<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/banner.svg" alt="Paperthin - 저자가 아니라 아티팩트를 믿어라." width="820">

**오래된 엔지니어링 지혜를 에이전트가 스스로 꺼내 쓰는 반사 동작으로 바꿉니다.**

**어떤** 에이전트에서도 | Claude Code, Codex, OpenCode, Antigravity, Copilot, Cursor, Grok-Build, Pi, Hermes, OpenClaw 등.

[빠른 시작](#quickstart-15-seconds) · [지도](#the-map) · [색인](#the-index) · [문제](#the-problem) · [해법](#the-fixes) · [크레딧](#credits)

<sub>Read in: [English](../../README.md) · [中文](./README.zh-CN.md) · [हिन्दी](./README.hi.md) · [Español](./README.es.md) · [العربية](./README.ar.md) · [Português](./README.pt.md) · [Русский](./README.ru.md) · [日本語](./README.ja.md) · [Français](./README.fr.md) · [Deutsch](./README.de.md) · 한국어</sub>

</div>

---

<a id="quickstart-15-seconds"></a>
## 빠른 시작 (15초)

1. 사용하는 모든 에이전트에 **설치**합니다.
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*'
   ```
2. 스킬들이 복사되지 않고 심볼릭 링크로 연결되도록, 상승 권한으로 실행합니다. 그러면 자동으로 업데이트됩니다.
3. **사용하세요.** 모델이 스스로 호출하므로 에이전트가 필요할 때 알아서 꺼내 씁니다. `/re0`처럼 이름으로 직접 호출해도 됩니다.

**잘 모르겠다면?** 쓰는 에이전트에 위 명령을 붙여 넣고 `set this up for me`라고 말하세요. 나머지는 에이전트가 처리합니다.

<a id="the-map"></a>
## 지도

**아티팩트는 몇 개이고, 시간은 어느 정도에 걸쳐 있는가?**

<div align="center">
<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/map.svg" alt="LilMGenius/paperthin의 Paperthin 지도, 2x2 매트릭스. 가로축은 개수(하나, 그리고 여럿), 세로축은 시간(지금, 그리고 iteration을 거쳐). 네 영역은 다음과 같다. 왼쪽 위 depth: 아티팩트 하나, 지금. 이 하나가 깨끗하고 참인가? 오른쪽 위 breadth: 아티팩트 여럿, 지금. 하나의 진실이 모든 곳에서 일관적인가? 왼쪽 아래 coil: 프로젝트 하나, iteration을 거쳐. 각 패스가 다음 패스를 가르쳤는가? 오른쪽 아래 mesh: 여러 생각, 여러 라운드. 집단이 진실로 수렴하는가?" width="820">
</div>

<a id="the-index"></a>
## 색인

### `depth/`

| 스킬 | 하는 일 | 스코프 | 호출자 |
|---|---|---|---|
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | drift된 아티팩트를 또 다른 패치가 아니라 깨끗한 v0로 다시 씁니다 | 아티팩트 하나 | 모델 |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | 맥락 없는 새 눈으로 차갑게 읽습니다. 이것이 혼자서도 서는가? *(읽기 전용)* | 아티팩트 하나 | 모델 |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | 클레임을 양방향으로 소스에 대조합니다. 말도 안 되는 것이 팩트일 수 있고, 당연한 것이 거짓일 수 있는가? *(읽기 전용 → 수정)* | 클레임 하나 | 모델 |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | validation에 leakage가 있는지 audit을 수행합니다. 외부 ground truth가 실제로 들어오는가? *(읽기 전용)* | eval 하나 | 모델 |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | 안전하지 않은 스코프를 앞에서 도려내고, 안전한 나머지는 전력으로 실행한 뒤 descope ledger를 냅니다 | 작업 하나 | 모델 |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | 변경 뒤마다 레포 자체의 clean-and-true 체크로 아웃풋을 맛봅니다 | 내 아웃풋 | 모델 |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | 친절하기를 거부합니다. 계획을 죽일 수 있는 반론 하나와 가장 싼 테스트를 냅니다 | 계획 하나 | 사용자 |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | em dash와 비슷한 tell을 지우고, 각 위치에 맞는 문장부호를 고릅니다 | 내 문장 | 사용자 |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | 완료된 커밋 메시지를 깨끗한 v0로 다시 써서 `git log`만으로 handoff가 되게 합니다 | 커밋 하나 | 사용자 |

### `breadth/`

| 스킬 | 하는 일 | 스코프 | 호출자 |
|---|---|---|---|
| 🔎 **[ssotchk](../../skills/breadth/ssotchk/SKILL.md)** | 하나의 팩트가 흩어지거나 중복된 곳을 찾고, canonical source를 지목합니다 *(읽기 전용)* | 팩트 하나, 여러 위치 | 모델 |
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | 그 팩트를 한 집으로 모으고, 나머지는 그곳을 가리키게 합니다 | 팩트 하나, 여러 위치 | 모델 |
| 🧰 **[ppt-upgrade](../../skills/breadth/ppt-upgrade/SKILL.md)** | 릴리스 뒤 설치된 예전 Paperthin 스킬 이름을 맞춰 줍니다 | 설치된 스킬 이름 | 사용자 |

### `coil/`

| 스킬 | 하는 일 | 스코프 | 호출자 |
|---|---|---|---|
| 🧭 **[retro](../../skills/coil/retro/SKILL.md)** | 끝났거나 실패한 사이클에서 교훈과 anti-pattern을 뽑아냅니다 | 완료된 사이클 하나 | 모델 |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | 재사용할 자격을 얻은 교훈만 남기고 v0에서 다시 시작합니다 | 재시작 하나 | 모델 |
| 🌀 **[flywheel](../../skills/coil/flywheel/SKILL.md)** | build → QA → retro → re0-work 루프를 돌려 배움이 코드가 아니라 축적되게 합니다 | 전체 루프 | 모델 |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | 살아 있는 사이클 state를 읽고 메뉴가 아니라 단 하나의 다음 최선 행동을 돌려줍니다 *(읽기 전용)* | 현재 사이클 | 모델 |

### `mesh/`

*개발 중 - 독립적인 관점들을 합의로 수렴시킵니다.*

*호출 방식은 [docs/invocation.md](../invocation.md)를 참고하세요.*

<a id="the-problem"></a>
## 문제

**대부분의 에이전트 스킬은 slop입니다.**

에이전트에게 목표를 주면 에이전트는 **더합니다.** 파일을 더 만들고, 옵션을 더 만들고, "도움 되는" boilerplate를 더합니다. 더하는 일은 진행처럼 보이고, 아무것도 돌아가서 지우게 만들지 않습니다.

> [!WARNING]
> 이 일이 프로젝트 전체에서 반복되면 익숙한 AI 생성 toolkit이 됩니다. 거의 같은 스킬, 죽은 설정, 같은 말을 세 번 하는 README. 그럴듯하고 바쁘지만 조용히 유지보수 불가능합니다.

이 스킬들은 반대로 겁니다. **모든 스킬이 무언가를 제거합니다.**

- `re0`는 draft를 패치하지 않고 깨끗한 v0로 다시 씁니다.
- `ssotchk` / `ssotize`는 파일 곳곳에 흩어진 같은 팩트를 접습니다.
- `shower`는 낯선 사람이 따라가지 못하는 부분을 잘라냅니다.
- `retro` / `re0-work`는 교훈만 보존하고 잘못된 빌드는 죽게 둡니다.
- `autobahn`은 안전하지 않은 스코프를 앞에서 도려내 안전한 나머지가 전속력으로 달리게 합니다.
- `dedash`는 em dash tell과 닮은꼴까지 하나씩 판단해 제거합니다.
- `sip`은 이 모든 것을 내 아웃풋에 자동으로 실행합니다.

> [!TIP]
> 어려운 부분은 기능 추가가 아니라 절제입니다. 개선할 것이 없다고 판단한 패스는 아무것도 바꾸지 않습니다. **그 절제가 제품입니다.**

<a id="the-fixes"></a>
## 해법

<!-- Fixes follow the lifecycle of a piece of work, not the skill list: keep it clean (draft → read fresh → reconcile across files → automate → ship), keep it true (a single claim → a validation → the whole plan), then keep the loop learning and the run unblocked. Slot any new fix in by where it acts in that arc. -->

**각각은 오래 검증된 원칙을 자동화한 것입니다.**

### #1 - 아티팩트는 썩습니다
문서를 세션 내내 조금씩 고치면 부풀어 오릅니다. 오래된 델타, 중복된 잡음, changelog 흉터가 남습니다. 그 위에 패치를 얹는 것은 부패를 보존할 뿐입니다.

**해법 → `re0`:** 아티팩트를 처음 버전처럼 깨끗한 v0로 다시 씁니다.

> *선행 원칙: 보이스카우트 규칙 - "leave it cleaner than you found it" (Robert C. Martin, [Clean Code](https://www.informit.com/articles/article.aspx?p=1235624&seqNum=6), 2008). `re0`는 더 나아갑니다. 단순 정리가 아니라 다시 씁니다.*

<details>
<summary><b>[PROOF]</b></summary>

- **설정** - `re0`에게 이 문서를 한 번 더 새로 고치라고 했지만, 이미 v0 상태였습니다.
- **결과** - 개선할 것을 찾지 못했고 산문 한 줄도 건드리지 않았습니다.
- **따라서** - 문제가 없을 때 아무것도 하지 않는 툴은 레포를 부풀리지 않습니다. 이 스킬들은 잡음을 제거하지, 더하지 않습니다.
</details>

### #2 - 자기 작업에는 눈이 멉니다
긴 세션 뒤에는 자기 작업을 똑바로 읽을 수 없는 유일한 사람이 바로 자신입니다. 너무 많이 알고 있어서 뇌가 틈을 조용히 메우고, 구멍은 보이지 않게 됩니다.

**해법 → `shower`:** 세션을 전혀 보지 못한 낯선 사람에게 아티팩트만 건네고 묻습니다. "이게 실제로 말이 되는가?"

> *선행 원칙: [egoless programming](https://en.wikipedia.org/wiki/Egoless_programming) - 자기 작업은 객관적으로 리뷰할 수 없고, 다른 사람이 해야 합니다 (Gerald Weinberg, 1971). 여기서 그 다른 사람은 맥락 없는 sub-session입니다.*

<details>
<summary><b>[PROOF]</b></summary>

- **설정** - `shower` 자신의 명세를, 파일 하나만 들고 있는 맥락 0의 sub-session에 넘겼습니다.
- **결과** - 몇 분 만에 작성자가 놓친 버그 세 개를 찾았습니다.
  - 숨겨야 할 답을 암시하는 단계,
  - spoiler 파일을 새게 하는 경로,
  - 실행하기엔 너무 모호한 스코프.
- **따라서** - 자기 버그를 잡는 스킬은 당신의 버그도 잡을 수 있습니다.
</details>

### #3 - 같은 팩트는 결국 모든 곳에 생깁니다
타임아웃 값, 결정, 상태. README, 문서, 티켓, Slack 스레드에 복사됩니다. 복사본은 drift되고, 이제 무엇이 진짜인지 아무도 모릅니다.

**해법 → `ssotchk` + `ssotize`:** 흩어진 곳을 찾고, canonical source를 지목한 뒤, 한곳으로 모아 나머지가 그곳을 가리키게 합니다.

> *선행 원칙: [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) - 하나의 팩트, 하나의 권위 있는 집 (Hunt & Thomas, The Pragmatic Programmer, 1999).*

### #4 - "validation을 기억하라"는 절대 실행되지 않습니다
문서 속 가이드라인은 새 세션에서 트리거되지 않습니다. 바로 작성자 편향이 가장 큰 순간에 말입니다.

**해법 → `sip`:** 무언가를 끝내는 순간 clean 체크(`shower`, `ssotchk`, `re0`)를 실행하고, 클레임이나 eval이 있으면 true 체크(`factchk`, `mandela`)도 자동으로 실행합니다.

> *선행 원칙: [dogfooding](https://en.wikipedia.org/wiki/Eating_your_own_dog_food) - eat your own dog food (Microsoft, 1988). 내놓기 전에 자기 요리를 직접 맛봅니다.*

<details>
<summary><b>[PROOF]</b></summary>

- **설정** - 모든 스킬을 self-contained로 만든 대규모 리팩터 직후 `sip`이 자동 실행되었습니다.
- **결과** - 작성자가 더는 볼 수 없던 두 가지를 fresh-eyes 패스가 잡았습니다. 같은 리팩터가 방금 지운 skill-to-skill 링크를 아직 가리키는 유지보수 규칙, 그리고 파일 편집 안전 규칙이 두 스킬에는 있지만 역시 파일을 편집하는 세 번째 스킬에는 빠져 있던 문제입니다.
- **따라서** - 이 체크는 편향이 가장 큰 곳을 뭅니다. 새 아티팩트이 아니라 큰 변경이 남긴 drift, 작성자의 눈이 그대로 미끄러지는 바로 그곳입니다.
</details>

### #5 - 세션은 이동하지 않지만 git log는 이동합니다
세션은 실행된 곳에 묶여 있습니다. 이 에이전트, 이 계정, 이 머신. 팀원이나 다른 에이전트는 작업이 일어난 맥락을 불러올 수 없습니다.

**해법 → `re0-git`:** 완료된 커밋 메시지를 정리해 모든 환경이 공유하는 `git log`가 handoff를 담게 합니다. 그러면 누구든 로그만 보고 이어받을 수 있습니다.

<details>
<summary><b>[PROOF]</b></summary>

- **설정** - `re0-git`의 첫 대상은 자기 자신의 릴리스 커밋이었습니다.
- **결과** - dogfooding으로 두 결함이 드러났고 둘 다 고쳤습니다.
  - 사소한 정보로 부풀린 메시지,
  - "중복 금지"를 설교하면서 스스로 반복하던 명세.
- **따라서** - 첫 정리는 자기 자신 뒤처리였습니다.
</details>

> [!NOTE]
> 위 다섯 해법은 아티팩트를 **깨끗하게** 유지합니다. 다음 세 가지는 아티팩트를 **참되게** 유지합니다. 저자를 믿지 않는 같은 태도를 산문이 아니라 추론에 적용합니다.

### #6 - 직감은 소스가 아닙니다
"그럴듯하다", "말도 안 된다", "새롭다"는 어떤 아티팩트에서도 가장 믿을 수 없는 줄입니다. 인간의 사전 믿음은 **양방향**으로 실패합니다. 실제인 것을 배제하고(사막 개구리는 존재합니다), 불가능한 것을 정상화합니다(무중력 상자).

**해법 → `factchk`:** 현실에 닿은 클레임은 출시 전에 외부 소스와 양방향으로 대조합니다. 소스에 닿을 수 없으면 추측하지 않고 표시합니다.

> *선행 원칙: [WEIRD bias](https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/abs/weirdest-people-in-the-world/BF84F7517D56AFF7B7EB58411A554C17) (Henrich, Heine & Norenzayan, 2010)와 [naive-physics / impetus error](https://www.science.org/doi/10.1126/science.210.4474.1139) (McCloskey, Caramazza & Green, 1980) - 직관은 현실을 양방향으로 오판합니다.*

<details>
<summary><b>[PROOF]</b></summary>

- **설정** - `factchk`를 자기 자신의 출시된 인용문에 양방향으로 실행했습니다.
- **결과** - 모두 유지되었고, 그래도 고칠 귀속 오류 두 개를 잡았습니다. 유명한 "측정되는 것이 목표가 된다"라는 표현은 Goodhart가 아니라 Strathern(1997)이고, "McCloskey 1980"은 1983년 *Scientific American* 글이 아니라 공저 *Science* 논문입니다.
- **따라서** - 자기 각주를 audit하는 fact-checker는 당신의 각주도 audit합니다.
</details>

### #7 - eval이 스스로를 확인합니다
모델, scorer, designer가 모두 결과가 진짜라고 동의할 수 있습니다. 하지만 독립적인 외부 ground truth는 루프에 한 번도 들어오지 않았을 수 있습니다. 방 전체가 실제로 일어나지 않은 일을 자신 있게 기억하는 셈입니다.

**해법 → `mandela`:** eval, metric, experiment를 8가지 leakage taxonomy로 audit합니다. 외부 ground truth가 독립적으로 들어오는가, 아니면 verifier가 곧 designer인가?

> *선행 원칙: [Goodhart's law](https://en.wikipedia.org/wiki/Goodhart%27s_law), [data leakage](https://dl.acm.org/doi/10.1145/2382577.2382579) (Kaufman et al., 2012), 그리고 [circular analysis](https://www.nature.com/articles/nn.2303) - "double dipping" (Kriegeskorte et al., 2009).*

<details>
<summary><b>[PROOF]</b></summary>

- **설정** - 이 audit는 한 연구 설계가 계속 한 가지 실패 모드에 죽던 데서 추출되었습니다. scorer, 모델, designer가 동의하지만 외부 truth는 아무것도 만들지 않은 상황입니다.
- **결과** - 그 한 프로젝트에서 leakage가 여덟 가지 형태로 드러났습니다. 자신이 그린 버킷을 채점하는 scorer, 공유 공간에서 서로를 "검증"하는 두 컴포넌트, verifier를 designer로 만든 비공개 레시피. 그 카탈로그가 스킬의 8-pattern taxonomy가 되었습니다.
- **따라서** - 체크리스트는 이론이 아닙니다. 그 안의 모든 패턴은 이미 한 번 피를 냈습니다.
</details>

### #8 - 자기 계획은 스스로 죽일 수 없습니다
직접 만들었기 때문에 방어하게 됩니다. 계획을 부술 질문이야말로 묻지 않을 질문입니다.

**해법 → `hate`:** 계획에 친절하기를 거부합니다. 계획을 죽일 수 있는 load-bearing 반론 하나와 그것이 실제로 중요한지 증명할 가장 싼 experiment를 돌려줍니다. 사용자 호출형입니다. 의도적으로 계획을 겨눕니다.

> *선행 원칙: [egoless programming](https://en.wikipedia.org/wiki/Egoless_programming) (Weinberg, 1971 - `shower`가 인용한 같은 뿌리), hostile review, fail-fast.*

<details>
<summary><b>[PROOF]</b></summary>

- **설정** - 모든 연구 패스는 adversarial critic으로 닫혔고, 판정은 언제나 하나의 root cause와 그것을 판정할 가장 싼 테스트였습니다. 체크리스트가 아니었습니다.
- **결과** - "더 날카로운 끝이 아니라 상자 하나를 더 그렸을 뿐"이라는 말로 recombination engine을 죽였고, 숫자만으로 human-holdout protocol도 죽였습니다. 필요한 36명 대신 약 24명, family-wise error rate 약 34%, 원칙을 인용하면서 정반대로 구현한 설계였습니다.
- **따라서** - 중요한 반론은 늘 단수였고 싸게 test할 수 있었습니다. 바로 `hate`가 반환하도록 고정된 `{root, first nail}`입니다.
</details>

### #9 - 돌아가는 빌드도 틀린 제품일 수 있습니다
긴 에이전트 사이클은 패널, 라우트, 테스트, 스크린샷처럼 작동하는 부품을 많이 만듭니다. 하지만 그것들은 가치보다 활동을 더 잘 증명하고, sunk cost는 그 아키텍처를 계속 들고 가게 만듭니다. 패스 사이에서는 다음 움직임이 수십 개의 살아 있는 스레드로 흐려지고, 선택지가 너무 많은 것 자체가 마비가 됩니다.

**해법 → `retro` + `re0-work` + `flywheel` + `nba`:** 교훈, anti-pattern, 다음 gate를 추출합니다. 토대가 틀렸으면 깨끗한 v0에서 다시 시작합니다. build → QA → retro → re0-work 루프를 실행합니다. 스레드를 잃었을 때는 state를 읽고 단 하나의 다음 행동을 돌려줍니다. 재사용할 자격을 얻은 것만 남깁니다.

<details>
<summary><b>[PROOF]</b></summary>

- **설정** - 한 게임 엔진 데모가 API 라우트, canvas runtime, leaderboard, arcade page, remix와 telemetry panel, 테스트, 스크린샷까지 갖춘 full-stack runnable 상태에 도달했습니다.
- **결과** - 그런데도 여전히 틀린 제품이었습니다. 생성된 게임은 mock에 가깝고 한 화면짜리였으며, durable replay layer가 없었습니다. 매 패스는 unmet gate와 parked 스레드 더미 앞에서 "이제 뭐 하지?"로 끝났습니다.
- **따라서** - 돌아가고 출시처럼 보인다고 완료가 아닙니다. 사이클에는 빠진 gate를 이름 붙이는 스킬과 단 하나의 다음 움직임을 돌려주는 스킬이 필요합니다.
</details>

### #10 - 위험 근처 작업은 늘 얼버무려 돌아옵니다
스크래핑, 라이선스, 프라이버시, 보안처럼 guardrail을 스치는 작업을 에이전트에게 맡기면 최악의 조합이 나옵니다. 위험한 조각은 거절과 재시도를 부르고, 안전한 90%는 hedging으로 묽어지거나 조용히 빠집니다.

**해법 → `autobahn`:** 실행 전에 guardrail에 가까운 항목을 스코프 밖으로 도려냅니다. 각 항목에는 안전한 대안과 archive entry가 붙습니다. 남은 스코프는 위험한 입력을 보지 못하고 carved prompt만 보는 fresh subagent가 전력으로 실행합니다. descope ledger를 내서 모든 제외가 조용한 누락이 아니라 보이는 결정이 되게 합니다. 우회가 아니라 요청 자체를 제거합니다. autobahn에 속도 제한이 없는 이유는 진입 규율이 엄격하기 때문입니다.

> *선행 사례, 바로 올여름: 미국은 jailbroken safeguard 하나 때문에 Fable 5와 Mythos 5를 [중단](https://www.anthropic.com/news/fable-mythos-access)했고 (Anthropic, 2026), OpenAI는 신뢰 파트너에게 safety-stack-first로 [GPT-5.6](https://openai.com/index/previewing-gpt-5-6-sol/)을 출시했습니다 (OpenAI, 2026). frontier에서 고속 차선은 진입 규율이 유지되는 만큼만 열립니다.*

<details>
<summary><b>[PROOF]</b></summary>

- **설정** - 이 방법은 기밀 전략 문서를 실제로 다시 쓰던 작업에서 나왔습니다. 그 문서는 stealth tooling, trademarked names, privacy-adjacent profiling, scraping gray zones 네 축에서 동시에 risk-adjacent였습니다.
- **결과** - main loop와 열 개의 subagent가 frontier model을 끝까지 돌렸고, flag 0, refusal 0, fallback 0이었습니다. 그리고 descoped item마다 안전한 대안이 오히려 더 나은 제품으로 드러났습니다.
- **따라서** - main loop가 도려냈고, clean subagent가 안전한 스코프를 실행했으며, 바로 그 carve 덕분에 전력으로 달릴 수 있었습니다.
</details>

<a id="credits"></a>
## 크레딧

- **기반** - [mattpocock/skills](https://github.com/mattpocock/skills) (MIT)의 아키텍처와 철학.
- **포크 아님** - 이 워크플로들은 [LilMGenius](https://github.com/LilMGenius)의 고유하고 겹치지 않는 작업입니다.
- **그대로 vendored** - 몇 가지 공유 building block은 원문 그대로 유지하며, 출처별 귀속은 [NOTICE](../../NOTICE)에 있습니다.
- **작성 가이드** - 규칙과 철학은 [CLAUDE.md](../../CLAUDE.md)에 있습니다.
