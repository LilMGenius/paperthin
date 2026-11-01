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
   claude plugin marketplace add LilMGenius/paperthin
   claude plugin install paperthin@paperthin
   ```
   Depois rode `/plugin`, abra **Marketplaces**, escolha `paperthin` e ative **Enable auto-update** uma vez.
2. **Codex**: atualiza sozinho a cada inicio de sessao.
   ```bash
   codex plugin marketplace add LilMGenius/paperthin
   codex plugin add paperthin@paperthin
   ```
3. **Qualquer outro agent** (OpenCode, Cursor e o resto): a segunda linha instala uma tarefa diaria que o mantem atualizado. Execute em uma shell elevada/admin se o seu OS pedir, para que as skills sejam ligadas em vez de copiadas. Se Claude Code ou Codex usam a rota de plugin, troque `'*'` pelos agents que voce usa (como `opencode`) para deixa-los de fora.
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*'
   node "$HOME/.agents/skills/re0-upgrade/scripts/schedule/schedule.mjs" install
   ```
4. **Use-as**. Chame qualquer skill pelo nome, como `/re0` (`/paperthin:re0` no Claude Code, `$re0` no Codex); as model-invoked tambem disparam sozinhas.

**Vem de uma instalacao antiga?** Rode `/re0-upgrade` uma vez em uma sessao nova; ele move voce para a rota acima e remove o antigo aviso de inicio de sessao.

**Nao tem certeza?** Diga ao seu agent `install https://github.com/LilMGenius/paperthin`; ele segue os [passos para agents](../../.agents/install-block.md#handed-only-this-repository) e diz o que falta para voce.

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
| 🧭 **[readback](../../skills/depth/readback/SKILL.md)** | Verifica a leitura do pedido; mostra apenas um fork real que sobrevive | uma instrucao | model | ✔ |
| 🏹 **[aim](../../skills/depth/aim/SKILL.md)** | Le os dados recebidos e propoe a intencao a confirmar, em vez de pedi-la | um lote de dados | model | ✔ |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | Escolhe o tier suficiente mais barato e o esforco de raciocinio | uma tarefa | model | ✔ |
| 🧹 **[elon](../../skills/depth/elon/SKILL.md)** | Propõe remover requisitos ainda não implementados, impostos por inércia e sem benefício restante, anexando a fonte e as evidências; preserva toda obrigação externa | um conjunto de requisitos ainda não implementados com suas fontes | model | ✔ |
| 🧩 **[scopechk](../../skills/depth/scopechk/SKILL.md)** | Verifica se um item cabe no escopo existente de um destino, lido das próprias fontes do destino, e indica o lar adequado quando não cabe | um item e o destino ao qual se juntaria | model | ✔ |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | Recusa ser gentil: a unica objecao que poderia matar o plano, mais o teste mais barato | um plano | user | |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | Remove o bait, abre leituras frescas e relata divergencia primeiro | uma direcao | user | ✔ |
| 🔀 **[crossthink](../../skills/depth/crossthink/SKILL.md)** | Lista primeiro as opcoes do proprio frame, mapeia mecanismos de cinco dominios distantes com seu breaks-where e guarda so o que faltava na lista | um problema travado | model | ✔ |
| ⚖️ **[re0-decide](../../skills/depth/re0-decide/SKILL.md)** | Transforma o material enviado para uma decisão em um instrumento rastreável e verificável cujo veredito é calculado a partir das próprias respostas de quem decide, sem nunca recomendar um resultado | material enviado para uma decisão | user | ✔ |
| 🧐 **[whychk](../../skills/depth/whychk/SKILL.md)** | Pressiona uma decisao recem-tomada ate poder explica-la, ou a lacuna e sinalizada | uma decisao | user | ✔ |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | Recorta o scope inseguro de antemao, executa o restante seguro com forca total e registra o descope | uma tarefa | model | |
| 🎨 **[re0-style](../../skills/depth/re0-style/SKILL.md)** | Verifica estilo, convenções e consistência do código; por padrão, zero edições e um relatório breve | uma alteração em revisão | model | |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | Troca nomes incidentais de stack pelo mecanismo que queriam dizer | um artifact duravel | model | |
| 🗜️ **[debloat](../../skills/depth/debloat/SKILL.md)** | Comprime prosa ou código inchado até sua densidade essencial; corta o excesso, nunca uma regra ou um comportamento | um artefato, prosa ou código | model | |
| 🔃 **[re0-order](../../skills/depth/re0-order/SKILL.md)** | Realinha uma listagem que derivou em uma ordem logica sob um unico principio declarado; apenas move itens, nao reescreve nada | uma listagem | model | |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | Remove os em e en dashes que substituem outra pontuacao dentro das frases; mantem hifens, intervalos e separadores de rotulo | sua prosa | user | |
| ⸱ **[dedot](../../skills/depth/dedot/SKILL.md)** | Propõe uma vírgula ou um conectivo na prosa, ou um espaço numa linha de rótulos, com uma razão para cada ponto médio que liga uma enumeração aberta em coreano; preserva os três usos admitidos e os contextos protegidos | prosa coreana ou linhas de rótulos delimitadas por quem escreve | user | ✔ |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | Faz uma leitura fria, com olhos novos e zero contexto: isso se sustenta sozinho? | um artifact | model | ✔ |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | Verifica o que se afirma contra sources, nas duas direcoes: o absurdo poderia ser real, o obvio falso? | uma claim | model | |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | Audita em busca de leakage: a ground truth externa realmente entra? | um eval | model | ✔ |
| 🎭 **[demock](../../skills/depth/demock/SKILL.md)** | Encontra mocks, stubs, fakes e fallbacks silenciosos no caminho de código real, onde um relatório de sucesso é falso porque nada real rodou; propõe a dependência real ou uma falha honesta | arquivos, um diretório ou um diff indicados | model | |
| 🥸 **[deid](../../skills/depth/deid/SKILL.md)** | Encontra dados pessoais ou de negócio de um proprietário vazados para um repositório ou artefato compartilhado, troca cada ocorrência pelo papel que ela cumpre e lista os commits que ainda os carregam | um artefato indicado e um proprietário | model | |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | Depois de qualquer mudanca, prova seu output com os checks clean-and-true do proprio repo | seu output | model | |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | Reescreve a mensagem de um commit finalizado mantendo todas as datas e posicoes, e encaixa um commit atrasado no historico linear no seu horario, para que `git log` faca o handoff sozinho | um commit | user | |
| 🧨 **[re0-squash](../../skills/depth/re0-squash/SKILL.md)** | Republica um repositorio do GitHub como um unico commit assinado com a mesma arvore: apaga o remote e o recria, porque um force push deixa os commits antigos alcancaveis | um repositorio | user | |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | Percorre o checklist de shipping e releasing, depois cria a tag e publica apos confirmacao | um release | user | |
| 🤝 **[re0-merge](../../skills/depth/re0-merge/SKILL.md)** | Revisa e integra uma contribuicao: faz o gate, preserva o credito do autor, aprova antes de fechar, explica qualquer mudanca | uma contribuicao | user | |

### `breadth/`

| Skill | O que faz | Escopo | Invocador | Somente leitura |
|---|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | Audita a dispersao e consolida o fact em um unico lar, o resto aponta pra ele | um fact, muitos lugares | model | |
| 🔗 **[ssotize-local](../../skills/breadth/ssotize-local/SKILL.md)** | Consolida arquivos ou árvores duplicados em uma identidade gerenciada pelo kernel: hardlink, link simbólico, junção ou montagem bind, com um caminho de reversão verificado | os mesmos bytes, muitos caminhos | model | |
| 📖 **[re0-readme](../../skills/breadth/re0-readme/SKILL.md)** | Audita um README e seu AGENTS.md e move cada linha para o arquivo cujo leitor precisa dela | README e AGENTS.md de um repositorio | model | |
| 📥 **[re0-import](../../skills/breadth/re0-import/SKILL.md)** | Coloca material recebido no documento de uma base de conhecimento existente que o possui, por regras lidas dessa base; informa o que nao pode ser colocado | material recebido e uma base de conhecimento | user | |
| 🆙 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | Leva suas skills ao catálogo atual completo em um comando: aposenta o renomeado, adiciona o novo, tudo confirmado primeiro | sua instalação de skills | user | |

### `coil/`

| Skill | O que faz | Escopo | Invocador | Somente leitura |
|---|---|---|---|---|
| 🗂️ **[re0-plan](../../skills/coil/re0-plan/SKILL.md)** | Abre uma nova pasta de iteração com DESIGN/WORKFLOW/EVIDENCE antes do primeiro turno do re0-loop | um cycle novo | user | |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | Executa o loop build → QA → re0-memo → re0-work para que o aprendizado componha, nao o codigo | o loop inteiro | model | |
| 👁️ **[re0-watch](../../skills/coil/re0-watch/SKILL.md)** | Monitora uma tarefa longa de um agente para detectar travamentos e alerta por padrão; a recuperação é apenas uma proposta sujeita à aprovação humana | uma tarefa em execução | user | |
| 📝 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | Extrai licoes e anti-padroes de um cycle concluido ou falho | um cycle concluido | model | |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | Recomeça da v0, mantendo apenas as licoes que mereceram reuso | um reinicio | model | |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | Reconstroi o contexto perdido a partir do estado ao vivo: o que precisa dele, o que mudou, o que as novas palavras significam | uma reentrada | model | ✔ |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | Le o estado vivo do cycle e retorna uma unica proxima melhor acao, nao um menu | o cycle vivo | model | ✔ |
| 🪜 **[re0-workflow](../../skills/coil/re0-workflow/SKILL.md)** | Recomenda um grafo ordenado de skills para uma intenção declarada, com o tipo de autoridade de cada etapa, sem invocá-los | uma intenção declarada | model | ✔ |
| 🎓 **[re0-tutorial](../../skills/coil/re0-tutorial/SKILL.md)** | Aprenda uma habilidade da suíte em três níveis avaliados; a conclusão depende do trabalho entregue pelo próprio aprendiz, nunca de um registro de invocações | uma habilidade | user | |

### `mesh/`

| Skill | O que faz | Escopo | Invocador | Somente leitura |
|---|---|---|---|---|
| 🕸️ **[multithink](../../skills/mesh/multithink/SKILL.md)** | Avalia leituras independentes já coletadas e as transforma em achados classificados pelas evidências citadas, nunca pela contagem; uma rodada opcional de troca faz circular apenas as citações em disputa e registra cada revisão causada pelas evidências. | muitas leituras de um artifact ou uma pergunta | user | ✔ |

*Mais sobre invocacao: [.agents/invocation.md](../../.agents/invocation.md).*

<a id="the-problem"></a>
## O problema

**A maioria das skills de agents e slop.**

Aponte um agent para um objetivo e ele **adiciona**: mais arquivos, mais opcoes, mais boilerplate "util". Adicionar parece progresso, e nada o faz voltar para apagar.

> [!WARNING]
> Repita isso em um projeto e voce ganha o toolkit gerado por IA familiar: skills quase duplicadas, configuracoes mortas, um README que diz a mesma coisa tres vezes. Plausivel, ocupado e silenciosamente impossivel de manter.

Essas skills apostam no outro lado. **Cada uma remove algo:**

- `re0` reescreve um rascunho como uma v0 limpa em vez de remenda-lo.
- `readback` reformula o pedido e so pergunta quando sobrevive uma bifurcacao real.
- `aim` le um data drop entregue e propoe a intencao a confirmar, em vez de pedi-la.
- `modelchk` escolhe o tier mais barato suficiente e o esforco de raciocinio antes de o trabalho comecar.
- `elon` propoe remover requisitos mantidos so pela inercia, com a fonte e a evidencia, e nunca toca uma exigencia externa.
- `scopechk` confere um item contra o escopo que o proprio alvo deixa escrito, antes que ele caia onde nao pertence.
- `hate` se recusa a ser gentil e devolve a unica objecao que poderia matar um plano, com o teste mais barato.
- `macrothink` espalha leituras novas e reporta a divergencia antes que a convergencia pareca prova.
- `crossthink` toma emprestados mecanismos que funcionam em dominios distantes e guarda so os que o frame do problema nunca ofereceu.
- `re0-decide` transforma o material enviado para uma decisao em um instrumento verificavel cujo veredito vem das proprias respostas de quem decide.
- `whychk` pressiona uma decisao recem-tomada ate voce conseguir explica-la a um cetico, ou nomeia a lacuna que voce nao consegue.
- `autobahn` recorta o scope inseguro de antemao, para que o restante seguro rode em velocidade total.
- `re0-style` confere uma mudanca contra as convencoes do proprio codebase e por padrao nao edita nada.
- `detool` troca nomes de ferramentas incidentais em conteudo portavel pelo mecanismo que eles significam.
- `debloat` comprime um artefato inchado ate sua densidade essencial, cortando palavras mas nunca uma regra.
- `re0-order` realinha uma listagem que derivou sob um unico principio, movendo itens e sem reescrever nada.
- `dedash` remove os em dash e en dash que um agente enfia dentro das frases, uma ocorrencia julgada por vez, e mantem os que separam um rotulo.
- `dedot` propoe uma virgula ou um conectivo, com o motivo, para cada ponto medio que une uma enumeracao aberta em coreano.
- `shower` corta o que um estranho nao consegue acompanhar.
- `factchk` confronta o que foi afirmado com fontes nas duas direcoes, para que um palpite nunca seja publicado como fato.
- `mandela` audita um eval em busca de leakage, para que um resultado que nenhuma verdade externa produziu nao seja tomado como real.
- `demock` encontra mocks, stubs e fallbacks silenciosos no caminho real do codigo e propoe a dependencia real ou uma falha honesta.
- `deid` encontra os dados de um proprietario em um artefato compartilhado, troca-os pelo papel que cumprem e lista os commits do historico que ainda os carregam.
- `sip` executa `shower`, `ssotize` e `re0` sobre o seu proprio output, e `factchk`, `mandela` ou `detool` onde se aplicam.
- `re0-git` reescreve a mensagem de um commit concluido mantendo cada data, para que o `git log` sozinho faca a passagem.
- `re0-squash` republica um repositorio como um unico commit assinado com a mesma arvore, sem deixar nenhum commit antigo alcancavel.
- `re0-release` executa o checklist de shipping antes de qualquer tag ou publicacao.
- `re0-merge` revisa e integra uma contribuicao mantendo o credito do autor.
- `ssotize` audita facts espalhados, pede aprovacao e entao os colapsa em um unico lar.
- `ssotize-local` colapsa arquivos ou arvores duplicados em uma unica identidade do sistema de arquivos, com um caminho de volta verificado.
- `re0-readme` move cada linha de um README e do seu AGENTS.md para o arquivo cujo leitor precisa dela.
- `re0-import` coloca o material entregue no documento da base de conhecimento que o possui e reporta o que nao tem lugar.
- `re0-upgrade` aposenta os skills renomeados e adiciona os novos em um unico passo confirmado.
- `re0-plan` abre os arquivos de design, workflow e evidence de um ciclo antes do primeiro turno.
- `re0-loop` mantem o ciclo build, QA, re0-memo e re0-work rodando para que o aprendizado se acumule em vez do codigo.
- `re0-watch` vigia um trabalho longo em busca de travamentos e oferece a recuperacao so como proposta que um humano aprova.
- `re0-memo` extrai as licoes e anti-patterns de um ciclo concluido ou fracassado.
- `re0-work` recomeca da v0 e deixa o build errado morrer, mantendo so as licoes que conquistaram reuso.
- `catchup` reconstroi o mapa do humano a partir do estado ao vivo: o que precisa dele, o que mudou, o que as palavras novas significam.
- `nba` le o ciclo ao vivo e devolve a unica proxima jogada, nunca um menu.
- `re0-workflow` recomenda um grafo ordenado de skills para uma intencao declarada sem invoca-los.
- `re0-tutorial` ensina um skill em tres niveis avaliados que se apoiam na entrega do proprio aprendiz.
- `multithink` classifica leituras independentes pela evidencia citada, nunca por contagem.

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
