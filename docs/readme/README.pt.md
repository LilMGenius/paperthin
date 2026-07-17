<div align="center">

# Paperthin: padroes agenticos de baixo nivel

<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/banner.svg" alt="Paperthin - Confie no artifact, nao no autor." width="820">

**Transformar sabedoria antiga de engenharia em reflexos que o seu agent alcanca sozinho.**

Em **qualquer** agent | Claude Code, Codex, OpenCode, Antigravity, Copilot, Cursor, Grok-Build, Pi, Hermes, OpenClaw, etc.

[Inicio rapido](#quickstart-15-seconds) · [O mapa](#the-map) · [O indice](#the-index) · [O problema](#the-problem) · [As correcoes](#the-fixes) · [Creditos](#credits)

<sub>Read in: [English](../../README.md) · [中文](./README.zh-CN.md) · [हिन्दी](./README.hi.md) · [Español](./README.es.md) · [العربية](./README.ar.md) · Português · [Русский](./README.ru.md) · [日本語](./README.ja.md) · [Français](./README.fr.md) · [Deutsch](./README.de.md) · [한국어](./README.ko.md)</sub>

</div>

---

<a id="quickstart-15-seconds"></a>
## Inicio rapido (15 segundos)

1. **Instale** para todos os agents que voce usa:
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*'
   ```
2. **Execute em uma shell elevada/admin se o seu OS pedir** para que as skills sejam ligadas por symlink e atualizem automaticamente, em vez de serem copiadas.
3. **Fique atualizado**. Rode `/re0-upgrade` quando quiser atualizar; ele tambem ativa um aviso discreto de inicio de sessao para novas skills.
4. **Use-as**. Chame qualquer skill pelo nome, como `/re0`; as model-invoked tambem disparam sozinhas.

**Nao tem certeza?** Cole esse comando no agent que estiver usando e diga `set this up for me`. Ele faz o resto.

<a id="the-map"></a>
## O mapa

**Quantos artifacts, e ao longo de quanto tempo?**

<div align="center">
<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/map.svg" alt="O mapa Paperthin de LilMGenius/paperthin, uma matriz dois por dois. Eixo horizontal: cardinalidade (um, depois muitos); eixo vertical: tempo (agora, depois ao longo de iteracoes); quatro regioes. Superior esquerda, depth: um artifact, agora; esta uma coisa e limpa e verdadeira? Superior direita, breadth: muitos artifacts, agora; uma verdade e consistente em todos os lugares? Inferior esquerda, coil: um projeto, ao longo de iteracoes; cada pass ensinou a seguinte? Inferior direita, mesh: muitas mentes, ao longo de rodadas; a multidao converge para a verdade?" width="820">
</div>

<a id="the-index"></a>
## O indice

### `depth/`

| Skill | O que faz | Escopo | Invocador | Somente leitura |
|---|---|---|---|---|
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | Reescreve um artifact que derivou como uma v0 limpa, nao como mais um patch | um artifact | model | |
| 🧭 **[readchk](../../skills/depth/readchk/SKILL.md)** | Verifica a leitura do pedido; mostra apenas um fork real que sobrevive | uma instrucao | model | ✔ |
| 🏹 **[aim](../../skills/depth/aim/SKILL.md)** | Le os dados recebidos e propoe a intencao a confirmar, em vez de pedi-la | um lote de dados | model | ✔ |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | Escolhe o tier suficiente mais barato: fast, standard ou frontier | uma tarefa | model | ✔ |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | Recusa ser gentil: a unica objecao que poderia matar o plano, mais o teste mais barato | um plano | user | |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | Remove o bait, abre leituras frescas e relata divergencia primeiro | uma direcao | user | ✔ |
| 🧐 **[feynman](../../skills/depth/feynman/SKILL.md)** | Pressiona uma decisao recem-tomada ate poder explica-la, ou a lacuna e sinalizada | uma decisao | user | ✔ |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | Recorta o scope inseguro de antemao, executa o restante seguro com forca total e registra o descope | uma tarefa | model | |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | Troca nomes incidentais de stack pelo mecanismo que queriam dizer | um artifact duravel | model | |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | Remove em dashes e semelhantes, escolhendo a pontuacao que cada ponto precisa | sua prosa | user | |
| 🔃 **[reorder](../../skills/depth/reorder/SKILL.md)** | Realinha uma listagem que derivou em uma ordem logica sob um unico principio declarado; apenas move itens, nao reescreve nada | uma listagem | user | |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | Faz uma leitura fria, com olhos novos e zero contexto: isso se sustenta sozinho? | um artifact | model | ✔ |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | Verifica o que se afirma contra sources, nas duas direcoes: o absurdo poderia ser real, o obvio falso? | uma claim | model | |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | Audita em busca de leakage: a ground truth externa realmente entra? | um eval | model | ✔ |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | Depois de qualquer mudanca, prova seu output com os checks clean-and-true do proprio repo | seu output | model | |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | Reescreve a mensagem de um commit finalizado para que `git log` faca o handoff sozinho | um commit | user | |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | Percorre o checklist de shipping e releasing, depois cria a tag e publica apos confirmacao | um release | user | |
| 🤝 **[re0-merge](../../skills/depth/re0-merge/SKILL.md)** | Revisa e integra uma contribuicao: faz o gate, preserva o credito do autor, aprova antes de fechar, explica qualquer mudanca | uma contribuicao | user | |

### `breadth/`

| Skill | O que faz | Escopo | Invocador | Somente leitura |
|---|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | Audita a dispersao e consolida o fact em um unico lar, o resto aponta pra ele | um fact, muitos lugares | model | |
| 🧰 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | Leva suas skills ao catálogo atual completo em um comando: aposenta o renomeado, adiciona o novo, tudo confirmado primeiro | sua instalação de skills | user | |

### `coil/`

| Skill | O que faz | Escopo | Invocador | Somente leitura |
|---|---|---|---|---|
| 🗂️ **[re0-plan](../../skills/coil/re0-plan/SKILL.md)** | Abre uma nova pasta de iteração com DESIGN/WORKFLOW/EVIDENCE antes do primeiro turno do re0-loop | um cycle novo | user | |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | Executa o loop build → QA → re0-memo → re0-work para que o aprendizado componha, nao o codigo | o loop inteiro | model | |
| 🧭 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | Extrai licoes e anti-padroes de um cycle concluido ou falho | um cycle concluido | model | |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | Recomeça da v0, mantendo apenas as licoes que mereceram reuso | um reinicio | model | |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | Reconstroi o contexto perdido a partir do estado ao vivo: o que precisa dele, o que mudou, o que as novas palavras significam | uma reentrada | model | ✔ |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | Le o estado vivo do cycle e retorna uma unica proxima melhor acao, nao um menu | o cycle vivo | model | ✔ |

### `mesh/`

| Skill | O que faz | Escopo | Invocador | Somente leitura |
|---|---|---|---|---|
| 🔺 **[prism](../../skills/mesh/prism/SKILL.md)** | Divide um artifact em lentes independentes; retorna onde elas divergem e a pergunta que resolve isso | um artifact | user | ✔ |

*Mais sobre invocacao: [docs/invocation.md](../invocation.md).*

<a id="the-problem"></a>
## O problema

**A maioria das skills de agents e slop.**

Aponte um agent para um objetivo e ele **adiciona**: mais arquivos, mais opcoes, mais boilerplate "util". Adicionar parece progresso, e nada o faz voltar para apagar.

> [!WARNING]
> Repita isso em um projeto e voce ganha o toolkit gerado por IA familiar: skills quase duplicadas, configuracoes mortas, um README que diz a mesma coisa tres vezes. Plausivel, ocupado e silenciosamente impossivel de manter.

Essas skills apostam no outro lado. **Cada uma remove algo:**

- `re0` reescreve um rascunho como uma v0 limpa em vez de remenda-lo.
- `readchk` reformula o pedido e so pergunta quando sobrevive uma bifurcacao real.
- `modelchk` escolhe o tier mais barato suficiente antes de o trabalho comecar.
- `macrothink` espalha leituras novas e reporta a divergencia antes que a convergencia pareca prova.
- `autobahn` recorta o scope inseguro de antemao, para que o restante seguro rode em velocidade total.
- `detool` troca nomes de ferramentas incidentais em conteudo portavel pelo mecanismo que eles significam.
- `dedash` remove ate o sinal do em dash e seus parecidos, uma ocorrencia julgada de cada vez.
- `shower` corta o que um estranho nao consegue acompanhar.
- `ssotize` audita facts espalhados, pede aprovacao e entao os colapsa em um unico lar.
- `re0-memo` / `re0-work` / `re0-loop` preservam a licao, deixam o build errado morrer e mantem o loop rodando.
- `catchup` / `nba` reconstroem o mapa do humano a partir do estado ao vivo, e devolvem o unico proximo passo.
- `sip` executa tudo isso automaticamente sobre o seu proprio output.

> [!TIP]
> A parte dificil nao e adicionar recursos; e contencao. Uma pass que nao encontra nada a melhorar nao muda nada. **Essa contencao e o produto.**

<a id="the-fixes"></a>
## Correcoes

A narrativa completa de Fixes fica como fonte canonical unica no [README em ingles](../../README.md#the-fixes), para que os exemplos de prova nao derivem entre traducoes. Este arquivo permanece para o indice e a orientacao local.

<a id="credits"></a>
## Creditos

- **Construido sobre** [mattpocock/skills](https://github.com/mattpocock/skills) (MIT), sua arquitetura e filosofia.
- **Nao e um fork**: estes sao workflows proprios e sem sobreposicao de [LilMGenius](https://github.com/LilMGenius).
- **Vendored verbatim**: alguns building blocks compartilhados, mantidos como estao com atribuicao por source em [NOTICE](../../NOTICE).
- **Guia de autoria**: convencoes e filosofia vivem em [CLAUDE.md](../../CLAUDE.md).
