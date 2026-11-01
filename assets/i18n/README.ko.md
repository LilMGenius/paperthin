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

**에이전트마다 경로 하나**만 고르세요. 둘을 깔면 모든 스킬이 두 번 뜹니다.

1. **Claude Code**:
   ```bash
   claude plugin marketplace add LilMGenius/paperthin && claude plugin install paperthin@paperthin
   ```
   그다음 `/plugin`에서 **Marketplaces**를 열고 `paperthin`을 골라 **Enable auto-update**를 한 번 켭니다.
2. **Codex**: 세션을 시작할 때마다 스스로 업데이트합니다.
   ```bash
   codex plugin marketplace add LilMGenius/paperthin && codex plugin add paperthin@paperthin
   ```
3. **그 밖의 모든 에이전트**: 한 줄로 스킬과 매일 도는 업데이트를 함께 설치합니다.
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*' && node "$HOME/.agents/skills/re0-upgrade/scripts/schedule/schedule.mjs" install
   ```
4. **사용하세요.** `/re0`처럼 스킬 이름으로 부르면 됩니다. 일에 필요하면 알아서 시작하는 스킬도 많습니다.

**예전에 설치했다면?** 새 세션에서 `/re0-upgrade`를 한 번 실행하세요.

**잘 모르겠다면?** 에이전트에게 `install https://github.com/LilMGenius/paperthin`이라고 말하면 [설치 절차](../../.agents/install-block.md#handed-only-this-repository)를 따라 알아서 설치합니다.

**웹에서 ChatGPT나 Claude를 쓴다면?** `https://raw.githubusercontent.com/LilMGenius/paperthin/main/llms-full.txt`를 건네주세요.

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
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | 손질을 거듭해 지저분해진 문서나 파일을 또 고치지 않고 깨끗한 첫 버전으로 다시 씁니다 | 아티팩트 하나 | 모델 | |
| 🧭 **[readback](../../skills/depth/readback/SKILL.md)** | 일을 시작하기 전에 요청을 제대로 이해했는지 확인하고, 해석이 정말 갈릴 때만 묻습니다 | 지시 하나 | 모델 | ✔ |
| 🏹 **[aim](../../skills/depth/aim/SKILL.md)** | 건네받은 파일이나 글을 읽고 원하는 바를 먼저 짐작해 제안하니, 맞는지만 확인하면 됩니다 | 넘겨받은 데이터 하나 | 모델 | ✔ |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | 일을 제대로 해낼 수 있는 가장 저렴한 모델 등급과 생각의 깊이를 고릅니다 | 작업 하나 | 모델 | ✔ |
| 🧹 **[elon](../../skills/depth/elon/SKILL.md)** | 습관처럼 남아 있을 뿐인 요구사항을 출처와 함께 빼자고 제안합니다. 바깥에서 정한 규칙은 건드리지 않습니다 | 미구현 요구사항 집합과 각 요구사항의 출처 | 모델 | ✔ |
| 🧩 **[scopechk](../../skills/depth/scopechk/SKILL.md)** | 새로 넣으려는 것이 그 자리에 맞는지 대상이 스스로 적어 둔 범위로 확인하고, 맞지 않으면 더 알맞은 자리를 알려 줍니다 | 항목 하나와 그 항목이 들어갈 대상 | 모델 | ✔ |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | 일부러 가혹한 비평가가 되어, 계획을 무너뜨릴 수 있는 반론 하나와 그것을 가장 싸게 확인할 방법을 내놓습니다 | 계획 하나 | 사용자 | |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | 내 관점을 걷어 낸 질문을 여러 새로운 시각에게 던지고, 의견이 갈리는 지점부터 보여 줍니다 | 방향 하나 | 사용자 | ✔ |
| 🔀 **[crossthink](../../skills/depth/crossthink/SKILL.md)** | 선택지가 모두 비슷해 보일 때 서로 무관한 분야 다섯 곳 이상에서 통하는 방법을 빌려 와 새로운 것만 남깁니다 | 막힌 문제 하나 | 모델 | ✔ |
| ⚖️ **[re0-decide](../../skills/depth/re0-decide/SKILL.md)** | 결정에 쓰일 자료를 점검표로 바꾸고, 판정은 내 답으로 나오게 합니다. 대신 골라 주지는 않습니다 | 결정을 위해 제출된 자료 | 사용자 | ✔ |
| 🧐 **[whychk](../../skills/depth/whychk/SKILL.md)** | 방금 내린 결정을 내가 설명할 수 있을 때까지 캐묻고, 안 되면 논리의 빈틈을 짚어 줍니다 | 결정 하나 | 사용자 | ✔ |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | 작업의 위험한 부분은 더 안전한 대안과 함께 먼저 떼어 두고, 나머지는 전속력으로 진행한 뒤 뺀 것을 기록합니다 | 작업 하나 | 모델 | |
| 🎨 **[re0-style](../../skills/depth/re0-style/SKILL.md)** | 코드가 프로젝트 고유의 스타일에 맞는지 살핍니다. 기본으로는 아무것도 고치지 않고 짧은 보고서만 씁니다 | 리뷰 중인 변경 하나 | 모델 | |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | 오래 남을 문서 속 제품 이름과 도구 이름을 그것이 실제로 하는 일로 바꿔, 도구가 바뀌어도 문서가 살아남게 합니다 | durable 아티팩트 하나 | 모델 | |
| 🗜️ **[debloat](../../skills/depth/debloat/SKILL.md)** | 군더더기가 붙은 글이나 코드를 꼭 필요한 만큼으로 줄이되, 규칙이나 동작은 하나도 잃지 않습니다 | 아티팩트 하나, 글 또는 코드 | 모델 | |
| 🔃 **[re0-order](../../skills/depth/re0-order/SKILL.md)** | 뒤죽박죽된 목록을 하나의 기준에 따라 다시 정렬합니다. 항목만 옮기고 문구는 그대로 둡니다 | 목록 하나 | 모델 | |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | 에이전트가 문장마다 흩뿌린 긴 대시를 지우고, 하이픈과 범위 표시, 라벨 구분용 대시는 남깁니다 | 내 문장 | 사용자 | |
| ⸱ **[dedot](../../skills/depth/dedot/SKILL.md)** | 한국어 글에서 나열을 잇는 가운뎃점마다 쉼표나 이음말을 이유와 함께 제안합니다 | 글쓴이가 범위를 정한 한국어 산문이나 라벨 행 | 사용자 | ✔ |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | 배경을 전혀 모르는 새 독자에게 결과물을 건네고, 그것만으로 이해되는지 묻습니다 | 아티팩트 하나 | 모델 | ✔ |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | 주장을 실제 출처와 양쪽으로 대조합니다. 황당한 말이 사실일 수도, 당연한 말이 틀릴 수도 있으니까요 | 클레임 하나 | 모델 | |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | 테스트나 지표가 스스로를 채점하고 있는지, 바깥의 진짜 사실이 결과를 정하는지 확인합니다 | eval 하나 | 모델 | ✔ |
| 🎭 **[demock](../../skills/depth/demock/SKILL.md)** | 실제로 도는 코드에서 성공 보고를 거짓으로 만드는 가짜 구현과 조용한 대체 경로를 찾아 진짜 해결책을 제안합니다 | 이름 붙인 파일, 디렉터리, diff | 모델 | |
| 🥸 **[deid](../../skills/depth/deid/SKILL.md)** | 공유 파일에 섞여 든 한 사람이나 회사의 정보를 찾아 그 역할 이름으로 바꾸고, 그 정보가 아직 남은 옛 커밋을 알려 줍니다 | 이름 붙인 산출물 하나와 소유자 한 명 | 모델 | |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | 무언가를 바꾼 직후, 끝났다고 하기 전에 이 모음집의 검사를 내 결과물에 돌립니다 | 내 아웃풋 | 모델 | |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | 끝난 커밋의 메시지를 날짜와 순서는 그대로 둔 채 다시 써서, 기록만 보고도 누구든 이어받을 수 있게 합니다 | 커밋 하나 | 사용자 | |
| 🧨 **[re0-squash](../../skills/depth/re0-squash/SKILL.md)** | GitHub 저장소를 파일은 그대로 둔 채 서명된 커밋 하나로 다시 올려, 옛 커밋에 더는 닿을 수 없게 합니다 | 저장소 하나 | 사용자 | |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | 배포 점검표를 돌리고, 내가 확인하면 태그를 달고 공개합니다 | 릴리스 하나 | 사용자 | |
| 🤝 **[re0-merge](../../skills/depth/re0-merge/SKILL.md)** | 다른 사람의 기여를 검토해 반영하고, 그 사람의 공로를 지키며, 손본 부분은 이유를 설명합니다 | 기여 하나 | 사용자 | |

### `breadth/`

| 스킬 | 하는 일 | 스코프 | 호출자 | 읽기 전용 |
|---|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | 여러 곳에 복사된 사실을 찾아, 승인을 받은 뒤 한 곳에 모으고 나머지는 그곳을 가리키게 합니다 | 팩트 하나, 여러 위치 | 모델 | |
| 🔗 **[ssotize-local](../../skills/breadth/ssotize-local/SKILL.md)** | 중복된 파일이나 폴더를 실제 사본 하나로 합치고 나머지는 링크로 잇습니다. 되돌리는 방법도 검증해 둡니다 | 같은 바이트, 여러 경로 | 모델 | |
| 📖 **[re0-readme](../../skills/breadth/re0-readme/SKILL.md)** | README와 AGENTS.md를 살펴 각 줄을 그 줄이 필요한 독자의 파일로 옮깁니다 | 저장소 하나의 README와 AGENTS.md | 모델 | |
| 📥 **[re0-import](../../skills/breadth/re0-import/SKILL.md)** | 건네받은 자료를 기존 지식 베이스의 알맞은 문서에 그 베이스의 규칙대로 넣고, 자리가 없는 것은 따로 알려 줍니다 | 넘겨받은 자료와 지식 베이스 하나 | 사용자 | |
| 🆙 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | 확인 한 번으로 설치를 최신 전체 목록으로 올립니다. 이름이 바뀐 스킬은 정리하고 새 스킬은 더합니다 | 내 스킬 설치 | 사용자 | |

### `coil/`

| 스킬 | 하는 일 | 스코프 | 호출자 | 읽기 전용 |
|---|---|---|---|---|
| 🗂️ **[re0-plan](../../skills/coil/re0-plan/SKILL.md)** | 새 작업 주기를 시작하기 전에 설계, 작업 순서, 증거 파일이 담긴 폴더를 엽니다 | 새 사이클 하나 | 사용자 | |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | 만들고, 시험하고, 배우고, 다시 시작하는 주기를 계속 돌려 코드 대신 교훈이 쌓이게 합니다 | 전체 루프 | 모델 | |
| 👁️ **[re0-watch](../../skills/coil/re0-watch/SKILL.md)** | 오래 걸리는 에이전트 작업이 멈추지 않는지 지켜보다 알려 줍니다. 복구는 내가 승인할 제안으로만 내놓습니다 | 실행 중인 작업 하나 | 사용자 | |
| 📝 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | 끝났거나 실패한 주기에서 교훈과 피해야 할 실수를 뽑아냅니다 | 완료된 사이클 하나 | 모델 | |
| 🔁 **[backprop](../../skills/coil/backprop/SKILL.md)** | 지적받은 교훈을 그 원인이 된 문서와 규칙에 되돌려 고치고 깔끔하게 정리합니다 | 교훈 하나 | 모델 | |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | 처음부터 다시 시작하되, 다시 쓸 가치가 증명된 교훈만 가져갑니다 | 재시작 하나 | 모델 | |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | 자리를 비운 사이의 일을 따라잡게 해 줍니다. 내가 할 일, 바뀐 것, 새로 생긴 용어의 뜻을 알려 줍니다 | 재진입 하나 | 모델 | ✔ |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | 일이 어디까지 왔는지 읽고, 선택지 목록 대신 가장 좋은 다음 한 걸음을 알려 줍니다 | 현재 사이클 | 모델 | ✔ |
| 🪜 **[re0-workflow](../../skills/coil/re0-workflow/SKILL.md)** | 목표 하나에 맞춰 어떤 스킬을 어떤 순서로 쓸지 추천합니다. 직접 실행하지는 않습니다 | 명시된 의도 하나 | 모델 | ✔ |
| 🎓 **[re0-tutorial](../../skills/coil/re0-tutorial/SKILL.md)** | 스킬 하나를 세 단계로 가르치고, 각 단계는 내가 직접 낸 결과물로 통과합니다 | 스킬 하나 | 사용자 | |

### `mesh/`

| 스킬 | 하는 일 | 스코프 | 호출자 | 읽기 전용 |
|---|---|---|---|---|
| 🕸️ **[multithink](../../skills/mesh/multithink/SKILL.md)** | 여러 독립된 의견을 몇 명이 동의했는지가 아니라 인용한 근거로 따져 봅니다 | 아티팩트나 질문 하나에 대한 여러 해석 | 사용자 | ✔ |

*호출 방식은 [.agents/invocation.md](../../.agents/invocation.md)를 참고하세요.*

<a id="the-problem"></a>
## 문제

**대부분의 에이전트 스킬은 slop입니다.**

에이전트에게 목표를 주면 에이전트는 **더합니다.** 파일을 더 만들고, 옵션을 더 만들고, "도움 되는" boilerplate를 더합니다. 더하는 일은 진행처럼 보이고, 아무것도 돌아가서 지우게 만들지 않습니다.

> [!WARNING]
> 이 일이 프로젝트 전체에서 반복되면 익숙한 AI 생성 toolkit이 됩니다. 거의 같은 스킬, 죽은 설정, 같은 말을 세 번 하는 README. 그럴듯하고 바쁘지만 조용히 유지보수 불가능합니다.

이 스킬들은 반대로 겁니다. **모든 스킬이 무언가를 덜어 내고**, 무엇을 덜어 내는지는 [색인](#the-index)에 있습니다.

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
- **작성 가이드** - 규칙과 철학은 [AGENTS.md](../../AGENTS.md)에 있습니다.
