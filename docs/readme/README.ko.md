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
2. OS가 요구하면 상승 권한/admin 셸에서 실행해 스킬들이 복사되지 않고 심볼릭 링크로 연결되게 합니다. 그러면 자동으로 업데이트됩니다.
3. **최신 유지.** 업데이트하고 싶을 때 `/re0-upgrade`를 실행하세요. 새 스킬이 나오면 알려주는 가벼운 session-start 알림도 함께 켜집니다.
4. **사용하세요.** 어떤 스킬이든 `/re0`처럼 이름으로 부르면 되고, model-invoked는 알아서도 실행됩니다.

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

| 스킬 | 하는 일 | 스코프 | 호출자 | 읽기 전용 |
|---|---|---|---|---|
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | drift된 아티팩트를 또 다른 패치가 아니라 깨끗한 v0로 다시 씁니다 | 아티팩트 하나 | 모델 | |
| 🧭 **[readchk](../../skills/depth/readchk/SKILL.md)** | 요청을 어떻게 읽었는지 확인하고, 실제로 남은 갈림길만 드러냅니다 | 지시 하나 | 모델 | ✔ |
| 🏹 **[aim](../../skills/depth/aim/SKILL.md)** | 넘겨받은 데이터를 읽고, 물어보는 대신 확인할 의도를 먼저 제안합니다 | 넘겨받은 데이터 하나 | 모델 | ✔ |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | 충분한 가장 싼 tier를 고릅니다: fast, standard, frontier | 작업 하나 | 모델 | ✔ |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | 친절하기를 거부합니다. 계획을 죽일 수 있는 반론 하나와 가장 싼 테스트를 냅니다 | 계획 하나 | 사용자 | |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | bait를 걷어내고 새 읽기를 펼친 뒤 divergence를 먼저 보고합니다 | 방향 하나 | 사용자 | ✔ |
| 🧐 **[feynman](../../skills/depth/feynman/SKILL.md)** | 방금 내린 결정을 설명할 수 있을 때까지 밀어붙이고, 안 되면 그 빈틈을 드러냅니다 | 결정 하나 | 사용자 | ✔ |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | 안전하지 않은 스코프를 앞에서 도려내고, 안전한 나머지는 전력으로 실행한 뒤 descope를 기록합니다 | 작업 하나 | 모델 | |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | 우연히 섞인 도구 이름을 그것이 뜻한 메커니즘으로 바꿉니다 | durable 아티팩트 하나 | 모델 | |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | em dash와 비슷한 tell을 지우고, 각 위치에 맞는 문장부호를 고릅니다 | 내 문장 | 사용자 | |
| 🔃 **[reorder](../../skills/depth/reorder/SKILL.md)** | drift된 목록을 하나의 명시된 원칙 아래 논리적 순서로 다시 맞춥니다. 항목만 옮기고, 표현은 바꾸지 않습니다 | 목록 하나 | 사용자 | |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | 맥락 없는 새 눈으로 차갑게 읽습니다. 이것이 혼자서도 서는가? | 아티팩트 하나 | 모델 | ✔ |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | 주장된 것을 양방향으로 소스에 대조합니다. 말도 안 되는 것이 팩트일 수 있고, 당연한 것이 거짓일 수 있는가? | 클레임 하나 | 모델 | |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | leakage가 있는지 audit합니다. 외부 ground truth가 실제로 들어오는가? | eval 하나 | 모델 | ✔ |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | 변경 뒤마다 레포 자체의 clean-and-true 체크로 아웃풋을 맛봅니다 | 내 아웃풋 | 모델 | |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | 완료된 커밋 메시지를 다시 써서 `git log`만으로 handoff가 되게 합니다 | 커밋 하나 | 사용자 | |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | shipping·releasing 체크리스트를 실행하고, 확인 후 태그·퍼블리시합니다 | 릴리스 하나 | 사용자 | |
| 🤝 **[re0-merge](../../skills/depth/re0-merge/SKILL.md)** | 기여를 리뷰하고 반영합니다: gate를 통과시키고, 작성자 크레딧을 유지하고, 닫기 전에 승인하고, 변경 사항을 설명합니다 | 기여 하나 | 사용자 | |

### `breadth/`

| 스킬 | 하는 일 | 스코프 | 호출자 | 읽기 전용 |
|---|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | 흩어진 곳을 감사한 뒤 한 집으로 모아 나머지가 그곳을 가리키게 합니다 | 팩트 하나, 여러 위치 | 모델 | |
| 🧰 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | 한 번에 현재 전체 카탈로그로 올립니다: 이름 바뀐 건 정리, 새 건 추가, 전부 먼저 확인 | 내 스킬 설치 | 사용자 | |

### `coil/`

| 스킬 | 하는 일 | 스코프 | 호출자 | 읽기 전용 |
|---|---|---|---|---|
| 🗂️ **[re0-plan](../../skills/coil/re0-plan/SKILL.md)** | re0-loop의 첫 turn 전에 새 iteration 폴더를 열고 DESIGN/WORKFLOW/EVIDENCE를 씁니다 | 새 사이클 하나 | 사용자 | |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | build → QA → re0-memo → re0-work 루프를 돌려 배움이 코드가 아니라 축적되게 합니다 | 전체 루프 | 모델 | |
| 🧭 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | 끝났거나 실패한 사이클에서 교훈과 anti-pattern을 뽑아냅니다 | 완료된 사이클 하나 | 모델 | |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | 재사용할 자격을 얻은 교훈만 남기고 v0에서 다시 시작합니다 | 재시작 하나 | 모델 | |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | 실시간 state에서 잃어버린 context를 재구성합니다: 누구에게 필요한지, 무엇이 바뀌었는지, 새 단어가 무엇을 뜻하는지 | 재진입 하나 | 모델 | ✔ |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | 살아 있는 사이클 state를 읽고 메뉴가 아니라 단 하나의 다음 최선 행동을 돌려줍니다 | 현재 사이클 | 모델 | ✔ |

### `mesh/`

| 스킬 | 하는 일 | 스코프 | 호출자 | 읽기 전용 |
|---|---|---|---|---|
| 🔺 **[prism](../../skills/mesh/prism/SKILL.md)** | 아티팩트 하나를 독립적인 렌즈들로 쪼갠 뒤, 충돌하는 지점과 그것을 푸는 질문을 돌려줍니다 | 아티팩트 하나 | 사용자 | ✔ |

*호출 방식은 [docs/invocation.md](../invocation.md)를 참고하세요.*

<a id="the-problem"></a>
## 문제

**대부분의 에이전트 스킬은 slop입니다.**

에이전트에게 목표를 주면 에이전트는 **더합니다.** 파일을 더 만들고, 옵션을 더 만들고, "도움 되는" boilerplate를 더합니다. 더하는 일은 진행처럼 보이고, 아무것도 돌아가서 지우게 만들지 않습니다.

> [!WARNING]
> 이 일이 프로젝트 전체에서 반복되면 익숙한 AI 생성 toolkit이 됩니다. 거의 같은 스킬, 죽은 설정, 같은 말을 세 번 하는 README. 그럴듯하고 바쁘지만 조용히 유지보수 불가능합니다.

이 스킬들은 반대로 겁니다. **모든 스킬이 무언가를 제거합니다.**

- `re0`는 draft를 패치하지 않고 깨끗한 v0로 다시 씁니다.
- `readchk`는 요청을 다시 진술하고, 실제로 갈림길이 남을 때만 묻습니다.
- `modelchk`는 작업이 시작되기 전에 충분한 가장 싼 tier를 정합니다.
- `macrothink`는 새로운 읽기를 펼치고, 수렴이 증거처럼 보이기 전에 divergence를 먼저 보고합니다.
- `autobahn`은 안전하지 않은 스코프를 앞에서 도려내 안전한 나머지가 전속력으로 달리게 합니다.
- `detool`은 이식 가능한 콘텐츠에 우연히 섞인 도구 이름을 그것이 뜻하는 mechanism으로 바꿉니다.
- `dedash`는 em dash tell과 닮은꼴까지 하나씩 판단해 제거합니다.
- `shower`는 낯선 사람이 따라가지 못하는 부분을 잘라냅니다.
- `ssotize`는 파일 곳곳에 흩어진 팩트를 감사하고, 승인받은 뒤 한 집으로 접습니다.
- `re0-memo` / `re0-work` / `re0-loop`는 교훈을 보존하고, 잘못된 빌드는 죽게 두고, loop는 계속 돌립니다.
- `catchup` / `nba`는 실시간 state에서 인간의 지도를 재구성한 뒤, 단 하나의 다음 수만 돌려줍니다.
- `sip`은 이 모든 것을 내 아웃풋에 자동으로 실행합니다.

> [!TIP]
> 어려운 부분은 기능 추가가 아니라 절제입니다. 개선할 것이 없다고 판단한 패스는 아무것도 바꾸지 않습니다. **그 절제가 제품입니다.**

<a id="the-fixes"></a>
## 해법

전체 Fixes narrative는 [영문 README](../../README.md#the-fixes)를 단일 canonical source로 둡니다. proof 사례가 번역본 사이에서 drift되지 않게 하기 위해서입니다. 이 파일은 색인과 로컬 안내를 유지합니다.

<a id="credits"></a>
## 크레딧

- **기반** - [mattpocock/skills](https://github.com/mattpocock/skills) (MIT)의 아키텍처와 철학.
- **포크 아님** - 이 워크플로들은 [LilMGenius](https://github.com/LilMGenius)의 고유하고 겹치지 않는 작업입니다.
- **그대로 vendored** - 몇 가지 공유 building block은 원문 그대로 유지하며, 출처별 귀속은 [NOTICE](../../NOTICE)에 있습니다.
- **작성 가이드** - 규칙과 철학은 [CLAUDE.md](../../CLAUDE.md)에 있습니다.
