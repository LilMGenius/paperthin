<div align="center">

# Paperthin: padroes agenticos de baixo nivel

<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/banner.svg" alt="Paperthin: padrões de design agêntico de baixo nível" width="820">

O livro de habilidades para o autoaperfeiçoamento recursivo (**RSI**).<br>A prova mais recente da **NVIDIA**, destrinchada com engenharia que não envelhece.<br>Destilado do método sem toque no teclado do vencedor do hackathon de harness engineering da **OpenAI**.

Em **qualquer** agent | Codex, Claude Code, OpenCode, Cursor, Grok Build, Grok Bot, Muse, Pi, etc.

*"Best part is no part."* Elon Musk[^musk]

**Feito por [Bran Lee](https://github.com/LilMGenius)**<br>2026: hackathon de harness engineering da **OpenAI** (Ralphthon Seoul #2, realizado ao mesmo tempo em Seul e San Francisco), *1º lugar*, a única equipe de uma pessoa só contra equipes de big techs e doutores de universidades de ponta<br>2026: palestrante convidado do meetup oficial do **Claude Code**, *duas vezes*<br>2026: *jurado* convidado do hackathon de IA do **Google DeepMind**<br>2014: concurso nacional da Olimpíada de Informática da Coreia (KOI), *prêmio de prata*<br>2009~: programando desde os *9* anos

[Inicio rapido](#quickstart-30-seconds) · [O mapa](#the-map) · [O indice](#the-index) · [O problema](#the-problem) · [A prova](#the-proof) · [Creditos](#credits)

<sub>Read in: [English](../../README.md) · [中文](./README.zh-CN.md) · [हिन्दी](./README.hi.md) · [Español](./README.es.md) · [العربية](./README.ar.md) · Português · [Русский](./README.ru.md) · [日本語](./README.ja.md) · [Français](./README.fr.md) · [Deutsch](./README.de.md) · [한국어](./README.ko.md)</sub>

</div>

---

<a id="quickstart-30-seconds"></a>
## Inicio rapido (30 segundos)

Escolha **uma rota por agent**; instalar duas carrega cada skill duas vezes.

1. **Codex**: atualiza sozinho a cada início de sessão.
   ```bash
   codex plugin marketplace add LilMGenius/paperthin && codex plugin add paperthin@paperthin
   ```
2. **Claude Code**:
   ```bash
   claude plugin marketplace add LilMGenius/paperthin && claude plugin install paperthin@paperthin
   ```
   Depois, no Claude Code, rode `/plugin`, abra **Marketplaces**, selecione `paperthin` e escolha **Enable auto-update**, uma vez só.
3. **Qualquer outro agent**: uma linha instala as skills e uma atualização diária.
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*' && node "$HOME/.agents/skills/re0-upgrade/scripts/schedule/schedule.mjs" install
   ```
4. **Use**: digite `/paperthin` e depois o seu sonho. Só isso. Quer entender como funciona? Relaxa, tem o `/re0-tutorial`.
5. **Pago em estrelas**: se ajudou, a taxa é uma [estrela no GitHub](https://github.com/LilMGenius/paperthin). Barato, eu sei.

**Já instalou antes?** Rode `/re0-upgrade` uma vez em uma sessão nova.

**Na dúvida?** Diga ao seu agent [`install https://github.com/LilMGenius/paperthin`](../../.agents/install-block.md#handed-only-this-repository). Um chat na web recebe o [llms.txt](https://raw.githubusercontent.com/LilMGenius/paperthin/main/llms.txt).

<a id="the-map"></a>
## O mapa

**Quantos artifacts, e ao longo de quanto tempo?**

<div align="center">
<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/map.svg" alt="O mapa Paperthin de LilMGenius/paperthin, uma matriz dois por dois. Eixo horizontal: cardinalidade (um, depois muitos); eixo vertical: tempo (agora, depois ao longo de iteracoes); quatro regioes. Superior esquerda, depth: um artifact, agora; esta uma coisa e limpa e verdadeira? Superior direita, breadth: muitos artifacts, agora; uma verdade e consistente em todos os lugares? Inferior esquerda, coil: um projeto, ao longo de iteracoes; cada pass ensinou a seguinte? Inferior direita, mesh: muitas mentes, ao longo de rodadas; a multidao converge para a verdade?" width="820">
</div>

<a id="the-index"></a>
## O indice

### `depth/`

| Skill | O que faz | Invocador | Somente leitura |
|---|---|---|---|
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | Reescreve como uma primeira versão limpa um documento ou arquivo cheio de remendos, em vez de remendá-lo de novo | model | |
| 🗜️ **[debloat](../../skills/depth/debloat/SKILL.md)** | Enxuga textos ou código inchados até sobrar só o que sustenta o peso, sem perder nenhuma regra nem comportamento | model | |
| 🔃 **[re0-order](../../skills/depth/re0-order/SKILL.md)** | Devolve uma ordem lógica a uma lista bagunçada sob uma regra declarada; só muda itens de lugar e não troca uma palavra | model | |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | Troca nomes de marcas e ferramentas em documentos duradouros pelo que elas de fato fazem, para os documentos durarem mais que as ferramentas | model | |
| 🎨 **[re0-style](../../skills/depth/re0-style/SKILL.md)** | Ajusta o código ao estilo do próprio projeto e pergunta onde o projeto faz a mesma coisa de dois jeitos | model | |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | Tira os travessões longos que um agent espalha pelas frases e mantém hifens, intervalos e separadores de rótulo | user | |
| ⸱ **[dedot](../../skills/depth/dedot/SKILL.md)** | Em textos em coreano, sugere com o motivo uma vírgula ou um conectivo para cada ponto médio que une uma enumeração | user | ✔ |
| 🧭 **[readback](../../skills/depth/readback/SKILL.md)** | Antes de trabalhar, confere se entendeu seu pedido e só pergunta quando duas leituras realmente divergem | model | ✔ |
| 🏹 **[aim](../../skills/depth/aim/SKILL.md)** | Lê os arquivos ou o texto que você entrega e sugere o que você provavelmente quer, para você só confirmar | model | ✔ |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | Escolhe o nível de modelo mais barato e o esforço de raciocínio que ainda dão conta do trabalho | model | ✔ |
| 🧹 **[elon](../../skills/depth/elon/SKILL.md)** | Sugere tirar ou adiar requisitos e compromissos que só ficaram por hábito, com a origem de cada um; nunca mexe em regras impostas de fora | model | ✔ |
| 🧩 **[scopechk](../../skills/depth/scopechk/SKILL.md)** | Confere, pelo escopo que o próprio destino deixou escrito, se uma peça nova cabe onde você quer colocá-la e, se não couber, aponta um lugar melhor | model | ✔ |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | Faz o papel de crítico sem piedade: a única objeção que pode afundar seu plano e o teste mais barato para tirar a dúvida | user | |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | Faz a pergunta, sem o seu enquadramento, a vários olhares novos e mostra primeiro onde eles discordam | user | ✔ |
| 🔀 **[crossthink](../../skills/depth/crossthink/SKILL.md)** | Quando todas as opções parecem iguais, pega ideias que funcionam em cinco ou mais áreas distantes e fica só com as novas | model | ✔ |
| ⚖️ **[re0-decide](../../skills/depth/re0-decide/SKILL.md)** | Transforma o material de uma decisão numa lista de verificação cujo veredito sai das suas próprias respostas; nunca escolhe por você | user | ✔ |
| 🧐 **[whychk](../../skills/depth/whychk/SKILL.md)** | Questiona uma decisão recém-tomada até você conseguir explicá-la, ou mostra o furo no raciocínio | user | ✔ |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | Separa primeiro as partes arriscadas de uma tarefa, com alternativas mais seguras, faz o resto a todo vapor e registra o que ficou de fora | model | |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | Logo depois de qualquer mudança, antes de dar por encerrado, roda as verificações do próprio paperthin sobre o seu resultado | model | |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | Entrega seu trabalho a um leitor novo, sem contexto nenhum, e pergunta se ele se sustenta sozinho | model | ✔ |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | Confronta afirmações com fontes reais nos dois sentidos: o absurdo pode ser verdade e o óbvio, falso | model | |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | Verifica se um teste ou uma métrica está dando nota a si mesmo ou se é uma verdade externa que decide o resultado | model | ✔ |
| 🎭 **[demock](../../skills/depth/demock/SKILL.md)** | Acha no código em uso as imitações e os desvios silenciosos que tornam falso um relatório de sucesso, e sugere a correção de verdade | model | |
| 🥸 **[deid](../../skills/depth/deid/SKILL.md)** | Encontra dados de uma pessoa ou empresa em arquivos compartilhados, troca-os pelo papel que cumprem e lista os commits antigos que ainda os guardam | model | |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | Reescreve a mensagem de um commit concluído mantendo datas e posição, para qualquer pessoa assumir o trabalho só pelo histórico | user | |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | Passa pela lista de verificação do lançamento e, quando você confirma, cria a tag e publica | user | |
| 🤝 **[re0-merge](../../skills/depth/re0-merge/SKILL.md)** | Revisa e incorpora a contribuição de outra pessoa, mantém o crédito dela e explica qualquer mudança feita | user | |
| 🧨 **[re0-squash](../../skills/depth/re0-squash/SKILL.md)** | Republica um repositório do GitHub como um único commit assinado com os mesmos arquivos, sem deixar nenhum commit antigo ao alcance | user | |

### `breadth/`

| Skill | O que faz | Invocador | Somente leitura |
|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | Acha um dado copiado em vários lugares, dá a ele uma casa só depois da sua aprovação e faz o resto apontar para lá | model | |
| 🔗 **[ssotize-local](../../skills/breadth/ssotize-local/SKILL.md)** | Junta arquivos ou pastas duplicados numa só cópia real à qual os outros se ligam, com um caminho de volta testado | model | |
| 📖 **[re0-readme](../../skills/breadth/re0-readme/SKILL.md)** | Separa as linhas de um README e do seu AGENTS.md para que cada uma fique no arquivo do leitor que precisa dela | model | |
| 📥 **[re0-import](../../skills/breadth/re0-import/SKILL.md)** | Coloca o material recebido na página certa de uma base de conhecimento existente, pelas regras dessa base, e avisa o que ficou sem lugar | user | |
| 🆙 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | Leva sua instalação ao catálogo completo atual num só passo confirmado: aposenta skills renomeadas e adiciona as novas | user | |

### `coil/`

| Skill | O que faz | Invocador | Somente leitura |
|---|---|---|---|
| 🚪 **[paperthin](../../skills/coil/paperthin/SKILL.md)** | O único comando para lembrar: escreva seu sonho depois dele | user | |
| 🪜 **[re0-workflow](../../skills/coil/re0-workflow/SKILL.md)** | Para um objetivo, escolhe quais skills rodar e em que ordem, mostra a você, roda e para onde é a sua vez de agir | model | |
| 📝 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | Tira as lições, e os erros a evitar, de um ciclo concluído ou fracassado | model | |
| 🔁 **[backprop](../../skills/coil/backprop/SKILL.md)** | Leva a lição de uma correção de volta aos documentos e regras que causaram o erro e depois os arruma | model | |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | Recomeça do zero e leva só as lições que provaram valer a reutilização | model | |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | Atualiza você depois de um tempo fora: o que espera por você, o que mudou e o que querem dizer os termos novos | model | ✔ |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | Lê em que ponto o trabalho está e indica o melhor próximo passo, um só, sem cardápio | model | ✔ |
| 🗂️ **[re0-plan](../../skills/coil/re0-plan/SKILL.md)** | Antes de começar um novo ciclo de trabalho, abre a pasta dele com os arquivos de desenho, fluxo e evidências | user | |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | Mantém girando o ciclo de construir, testar, aprender e recomeçar, para acumular lições e não código | model | |
| 👁️ **[re0-watch](../../skills/coil/re0-watch/SKILL.md)** | Vigia um trabalho longo de agent para ver se ele travou e avisa você; qualquer correção é só uma proposta que você aprova | user | |
| 🎓 **[re0-tutorial](../../skills/coil/re0-tutorial/SKILL.md)** | Ensina uma skill em três níveis graduados, cada um aprovado por um trabalho que você mesmo entrega | user | |

### `mesh/`

| Skill | O que faz | Invocador | Somente leitura |
|---|---|---|---|
| 🕸️ **[multithink](../../skills/mesh/multithink/SKILL.md)** | Pesa várias opiniões independentes pelas evidências que citam, nunca pelo número de quem concorda | user | ✔ |

*Mais sobre invocacao: [.agents/invocation.md](../../.agents/invocation.md).*

<a id="the-problem"></a>
## O problema

**A maioria das skills de agents e slop.**

Aponte um agent para um objetivo e ele **adiciona**: mais arquivos, mais opcoes, mais boilerplate "util". Adicionar parece progresso, e nada o faz voltar para apagar.

> [!WARNING]
> Repita isso em um projeto e voce ganha o toolkit gerado por IA familiar: skills quase duplicadas, configuracoes mortas, um markdown que diz a mesma coisa tres vezes. Plausivel, ocupado e silenciosamente impossivel de manter.

Estas skills apostam no contrário: **cada uma tira algo**, e [o índice](#the-index) diz o quê.

> [!TIP]
> A parte dificil nao e adicionar recursos; e contencao. Uma pass que nao encontra nada a melhorar nao muda nada. **Essa contencao e o produto.**

<a id="the-proof"></a>
## A prova

**A NVIDIA mediu: um agente que larga o histórico longo e trabalha a partir de uma nota curta mantém a pontuação.**

| O que a NVIDIA mediu | Contexto longo | Nota curta |
|---|---|---|
| SWE-bench Verified, Claude Opus 4.5 | 70.0 | 70.2 |
| Maior contexto de que a execução precisou | 200K tokens | 16K tokens |
| Vazão de serviço de pesos abertos, H100 | janela de 256K | até 7x maior com 16K |

<sub>Belcak et al. (NVIDIA), [You don't need long context](https://arxiv.org/abs/2611.05306), arXiv 2611.05306, 2026-11-03. As linhas um e dois são a tabela 2: Opus 4.5 agindo um passo por vez sobre uma nota de estado. A linha três é a figura 1 (GLM 5.2 3,6x, Kimi K2.6 5,6x, Qwen 3 Coder Next 7x).</sub>

**Qual skill do Paperthin cuida de cada achado:**

| O que o artigo encontrou | Skills que agem |
|---|---|
| Trabalho longo não precisa de contexto longo: quando a conversa enche, escreve-se uma nota e segue-se numa nova | `re0-work` recomeça do v0 só com as lições comprovadas, `re0-git` deixa a passagem de bastão no histórico do git para a próxima sessão |
| Uma boa nota mantém a tarefa perto das palavras originais | `re0-loop` mantém na lista cada pedido em aberto quando a sessão é compactada ou recomeça |
| Uma boa nota guarda o que está sendo feito, por quê e o que vem depois | `re0-memo` transforma um ciclo terminado no portão do próximo, `nba` aponta o próximo passo |
| Uma boa nota guarda o plano, as condições de conclusão e onde está cada coisa | `re0-plan` abre o ciclo com seus arquivos de design, fluxo e evidência, `re0-workflow` registra a ordem das skills |
| Uma ação por vez sobre uma nota de estado mantém a pontuação inteira | `shower` entrega só a nota a um leitor sem histórico e pergunta se ela se sustenta sozinha |
| Uma janela menor serve até 7x mais rápido | `elon` tira o que só ficou por hábito, `debloat` corta até o que sustenta peso, `re0` reescreve em vez de empilhar remendos |

<a id="credits"></a>
## Creditos

- **Construido sobre** [mattpocock/skills](https://github.com/mattpocock/skills) (MIT), sua arquitetura e filosofia.
- **Nao e um fork**: estes sao workflows proprios e sem sobreposicao de [LilMGenius](https://github.com/LilMGenius).
- **Vendored verbatim**: alguns building blocks compartilhados, mantidos como estao com atribuicao por source em [NOTICE](../../NOTICE).
- **Guia de autoria**: convencoes e filosofia vivem em [AGENTS.md](../../AGENTS.md).

[^musk]: Elon Musk, [resposta no X](https://x.com/elonmusk/status/2103537444910248312), 2026-09-25, a @Erdayastronaut sobre a SpaceX ter retirado uma aleta de grade do propulsor V3; quer dizer "a melhor peça é a que não existe". Ele falou de engenharia, não do Paperthin.
