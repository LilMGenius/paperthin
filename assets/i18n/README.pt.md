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

Escolha **uma rota por agent**; instalar duas carrega cada skill duas vezes.

1. **Claude Code**:
   ```bash
   claude plugin marketplace add LilMGenius/paperthin && claude plugin install paperthin@paperthin
   ```
   Depois rode `/plugin`, abra **Marketplaces**, selecione `paperthin` e escolha **Enable auto-update**, uma vez só.
2. **Codex**: atualiza sozinho a cada início de sessão.
   ```bash
   codex plugin marketplace add LilMGenius/paperthin && codex plugin add paperthin@paperthin
   ```
3. **Qualquer outro agent**: uma linha instala as skills e uma atualização diária.
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*' && node "$HOME/.agents/skills/re0-upgrade/scripts/schedule/schedule.mjs" install
   ```
4. **Use**: chame qualquer skill pelo nome, como `/re0`. Muitas também entram em ação sozinhas quando o trabalho pede.

**Já instalou antes?** Rode `/re0-upgrade` uma vez em uma sessão nova.

**Na dúvida?** Diga ao seu agent `install https://github.com/LilMGenius/paperthin` e ele segue os [passos de instalação](../../.agents/install-block.md#handed-only-this-repository) sozinho.

**Usa ChatGPT ou Claude na web?** Entregue `https://raw.githubusercontent.com/LilMGenius/paperthin/main/llms-full.txt`.

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
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | Reescreve como uma primeira versão limpa um documento ou arquivo cheio de remendos, em vez de remendá-lo de novo | um artifact | model | |
| 🧭 **[readback](../../skills/depth/readback/SKILL.md)** | Antes de trabalhar, confere se entendeu seu pedido e só pergunta quando duas leituras realmente divergem | uma instrucao | model | ✔ |
| 🏹 **[aim](../../skills/depth/aim/SKILL.md)** | Lê os arquivos ou o texto que você entrega e sugere o que você provavelmente quer, para você só confirmar | um lote de dados | model | ✔ |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | Escolhe o nível de modelo mais barato e o esforço de raciocínio que ainda dão conta do trabalho | uma tarefa | model | ✔ |
| 🧹 **[elon](../../skills/depth/elon/SKILL.md)** | Sugere tirar requisitos que só ficaram por hábito, com a origem de cada um; nunca mexe em regras impostas de fora | um conjunto de requisitos ainda não implementados com suas fontes | model | ✔ |
| 🧩 **[scopechk](../../skills/depth/scopechk/SKILL.md)** | Confere, pelo escopo que o próprio destino deixou escrito, se uma peça nova cabe onde você quer colocá-la e, se não couber, aponta um lugar melhor | um item e o destino ao qual se juntaria | model | ✔ |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | Faz o papel de crítico sem piedade: a única objeção que pode afundar seu plano e o teste mais barato para tirar a dúvida | um plano | user | |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | Faz a pergunta, sem o seu enquadramento, a vários olhares novos e mostra primeiro onde eles discordam | uma direcao | user | ✔ |
| 🔀 **[crossthink](../../skills/depth/crossthink/SKILL.md)** | Quando todas as opções parecem iguais, pega ideias que funcionam em cinco ou mais áreas distantes e fica só com as novas | um problema travado | model | ✔ |
| ⚖️ **[re0-decide](../../skills/depth/re0-decide/SKILL.md)** | Transforma o material de uma decisão numa lista de verificação cujo veredito sai das suas próprias respostas; nunca escolhe por você | material enviado para uma decisão | user | ✔ |
| 🧐 **[whychk](../../skills/depth/whychk/SKILL.md)** | Questiona uma decisão recém-tomada até você conseguir explicá-la, ou mostra o furo no raciocínio | uma decisao | user | ✔ |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | Separa primeiro as partes arriscadas de uma tarefa, com alternativas mais seguras, faz o resto a todo vapor e registra o que ficou de fora | uma tarefa | model | |
| 🎨 **[re0-style](../../skills/depth/re0-style/SKILL.md)** | Compara o código com o estilo do próprio projeto; por padrão não muda nada e entrega um relatório curto | uma alteração em revisão | model | |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | Troca nomes de marcas e ferramentas em documentos duradouros pelo que elas de fato fazem, para os documentos durarem mais que as ferramentas | um artifact duravel | model | |
| 🗜️ **[debloat](../../skills/depth/debloat/SKILL.md)** | Enxuga textos ou código inchados até sobrar só o que sustenta o peso, sem perder nenhuma regra nem comportamento | um artefato, prosa ou código | model | |
| 🔃 **[re0-order](../../skills/depth/re0-order/SKILL.md)** | Devolve uma ordem lógica a uma lista bagunçada sob uma regra declarada; só muda itens de lugar e não troca uma palavra | uma listagem | model | |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | Tira os travessões longos que um agent espalha pelas frases e mantém hifens, intervalos e separadores de rótulo | sua prosa | user | |
| ⸱ **[dedot](../../skills/depth/dedot/SKILL.md)** | Em textos em coreano, sugere com o motivo uma vírgula ou um conectivo para cada ponto médio que une uma enumeração | prosa coreana ou linhas de rótulos delimitadas por quem escreve | user | ✔ |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | Entrega seu trabalho a um leitor novo, sem contexto nenhum, e pergunta se ele se sustenta sozinho | um artifact | model | ✔ |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | Confronta afirmações com fontes reais nos dois sentidos: o absurdo pode ser verdade e o óbvio, falso | uma claim | model | |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | Verifica se um teste ou uma métrica está dando nota a si mesmo ou se é uma verdade externa que decide o resultado | um eval | model | ✔ |
| 🎭 **[demock](../../skills/depth/demock/SKILL.md)** | Acha no código em uso as imitações e os desvios silenciosos que tornam falso um relatório de sucesso, e sugere a correção de verdade | arquivos, um diretório ou um diff indicados | model | |
| 🥸 **[deid](../../skills/depth/deid/SKILL.md)** | Encontra dados de uma pessoa ou empresa em arquivos compartilhados, troca-os pelo papel que cumprem e lista os commits antigos que ainda os guardam | um artefato indicado e um proprietário | model | |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | Logo depois de qualquer mudança, antes de dar por encerrado, roda as verificações da própria coleção sobre o seu resultado | seu output | model | |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | Reescreve a mensagem de um commit concluído mantendo datas e posição, para qualquer pessoa assumir o trabalho só pelo histórico | um commit | user | |
| 🧨 **[re0-squash](../../skills/depth/re0-squash/SKILL.md)** | Republica um repositório do GitHub como um único commit assinado com os mesmos arquivos, sem deixar nenhum commit antigo ao alcance | um repositorio | user | |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | Passa pela lista de verificação do lançamento e, quando você confirma, cria a tag e publica | um release | user | |
| 🤝 **[re0-merge](../../skills/depth/re0-merge/SKILL.md)** | Revisa e incorpora a contribuição de outra pessoa, mantém o crédito dela e explica qualquer mudança feita | uma contribuicao | user | |

### `breadth/`

| Skill | O que faz | Escopo | Invocador | Somente leitura |
|---|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | Acha um dado copiado em vários lugares, dá a ele uma casa só depois da sua aprovação e faz o resto apontar para lá | um fact, muitos lugares | model | |
| 🔗 **[ssotize-local](../../skills/breadth/ssotize-local/SKILL.md)** | Junta arquivos ou pastas duplicados numa só cópia real à qual os outros se ligam, com um caminho de volta testado | os mesmos bytes, muitos caminhos | model | |
| 📖 **[re0-readme](../../skills/breadth/re0-readme/SKILL.md)** | Separa as linhas de um README e do seu AGENTS.md para que cada uma fique no arquivo do leitor que precisa dela | README e AGENTS.md de um repositorio | model | |
| 📥 **[re0-import](../../skills/breadth/re0-import/SKILL.md)** | Coloca o material recebido na página certa de uma base de conhecimento existente, pelas regras dessa base, e avisa o que ficou sem lugar | material recebido e uma base de conhecimento | user | |
| 🆙 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | Leva sua instalação ao catálogo completo atual num só passo confirmado: aposenta skills renomeadas e adiciona as novas | sua instalação de skills | user | |

### `coil/`

| Skill | O que faz | Escopo | Invocador | Somente leitura |
|---|---|---|---|---|
| 🗂️ **[re0-plan](../../skills/coil/re0-plan/SKILL.md)** | Antes de começar um novo ciclo de trabalho, abre a pasta dele com os arquivos de desenho, fluxo e evidências | um cycle novo | user | |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | Mantém girando o ciclo de construir, testar, aprender e recomeçar, para acumular lições e não código | o loop inteiro | model | |
| 👁️ **[re0-watch](../../skills/coil/re0-watch/SKILL.md)** | Vigia um trabalho longo de agent para ver se ele travou e avisa você; qualquer correção é só uma proposta que você aprova | uma tarefa em execução | user | |
| 📝 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | Tira as lições, e os erros a evitar, de um ciclo concluído ou fracassado | um cycle concluido | model | |
| 🔁 **[backprop](../../skills/coil/backprop/SKILL.md)** | Leva a lição de uma correção de volta aos documentos e regras que causaram o erro e depois os arruma | uma lição | model | |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | Recomeça do zero e leva só as lições que provaram valer a reutilização | um reinicio | model | |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | Atualiza você depois de um tempo fora: o que espera por você, o que mudou e o que querem dizer os termos novos | uma reentrada | model | ✔ |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | Lê em que ponto o trabalho está e indica o melhor próximo passo, um só, sem cardápio | o cycle vivo | model | ✔ |
| 🪜 **[re0-workflow](../../skills/coil/re0-workflow/SKILL.md)** | Para um objetivo, recomenda quais skills rodar e em que ordem, sem rodá-las | uma intenção declarada | model | ✔ |
| 🎓 **[re0-tutorial](../../skills/coil/re0-tutorial/SKILL.md)** | Ensina uma skill em três níveis graduados, cada um aprovado por um trabalho que você mesmo entrega | uma habilidade | user | |

### `mesh/`

| Skill | O que faz | Escopo | Invocador | Somente leitura |
|---|---|---|---|---|
| 🕸️ **[multithink](../../skills/mesh/multithink/SKILL.md)** | Pesa várias opiniões independentes pelas evidências que citam, nunca pelo número de quem concorda | muitas leituras de um artifact ou uma pergunta | user | ✔ |

*Mais sobre invocacao: [.agents/invocation.md](../../.agents/invocation.md).*

<a id="the-problem"></a>
## O problema

**A maioria das skills de agents e slop.**

Aponte um agent para um objetivo e ele **adiciona**: mais arquivos, mais opcoes, mais boilerplate "util". Adicionar parece progresso, e nada o faz voltar para apagar.

> [!WARNING]
> Repita isso em um projeto e voce ganha o toolkit gerado por IA familiar: skills quase duplicadas, configuracoes mortas, um README que diz a mesma coisa tres vezes. Plausivel, ocupado e silenciosamente impossivel de manter.

Estas skills apostam no contrário: **cada uma tira algo**, e [o índice](#the-index) diz o quê.

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
- **Guia de autoria**: convencoes e filosofia vivem em [AGENTS.md](../../AGENTS.md).
