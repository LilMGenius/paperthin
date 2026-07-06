<div align="center">

# Paperthin: padroes agenticos de baixo nivel

<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/banner.svg" alt="Paperthin - Confie no artifact, nao no autor." width="820">

**Transformar sabedoria antiga de engenharia em reflexos que o seu agent alcanca sozinho.**

Em **qualquer** agent | Claude Code, Codex, OpenCode, Antigravity, Copilot, Cursor, Grok-Build, Pi, Hermes, OpenClaw, etc.

[Inicio rapido](#quickstart-15-seconds) · [O mapa](#the-map) · [O indice](#the-index) · [O problema](#the-problem) · [As correcoes](#the-fixes) · [Creditos](#credits)

Idiomas: [English](./README.md) · Portugues

</div>

---

<a id="quickstart-15-seconds"></a>
## Inicio rapido (15 segundos)

1. **Instale** para todos os agents que voce usa:
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*'
   ```
2. **Execute com privilegios elevados** para que as skills sejam ligadas por symlink e atualizem automaticamente, em vez de serem copiadas.
3. **Use-as**. Elas sao invocadas pelo modelo, entao o agent recorre a elas por conta propria; voce tambem pode chamar uma pelo nome, como `/re0`.

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

| Skill | O que faz | Escopo | Invocador |
|---|---|---|---|
| ♻️ **[re0](./skills/depth/re0/SKILL.md)** | Reescreve um artifact que derivou como uma v0 limpa, nao como mais um patch | um artifact | model |
| 🚿 **[shower](./skills/depth/shower/SKILL.md)** | Faz uma leitura fria, com olhos novos e zero contexto: isso se sustenta sozinho? *(somente leitura)* | um artifact | model |
| 🔬 **[factchk](./skills/depth/factchk/SKILL.md)** | Verifica uma claim contra sources, nas duas direcoes: o absurdo poderia ser real, o obvio falso? *(somente leitura → correcao)* | uma claim | model |
| 🧪 **[mandela](./skills/depth/mandela/SKILL.md)** | Audita uma validation em busca de leakage: a ground truth externa realmente entra? *(somente leitura)* | um eval | model |
| 🛣️ **[autobahn](./skills/depth/autobahn/SKILL.md)** | Recorta o scope inseguro de antemao, executa o restante seguro com forca total e entrega um descope ledger | uma tarefa | model |
| 🥄 **[sip](./skills/depth/sip/SKILL.md)** | Depois de qualquer mudanca, prova seu output com os checks clean-and-true do proprio repo | seu output | model |
| 😈 **[hate](./skills/depth/hate/SKILL.md)** | Recusa ser gentil: a unica objecao que poderia matar o plano + o teste mais barato | um plano | user |
| ✂️ **[dedash](./skills/depth/dedash/SKILL.md)** | Remove em dashes e semelhantes, escolhendo a pontuacao que cada ponto precisa | sua prosa | user |
| 🧾 **[re0-git](./skills/depth/re0-git/SKILL.md)** | Reescreve a mensagem de um commit finalizado como uma v0 limpa para que `git log` faca o handoff sozinho | um commit | user |

### `breadth/`

| Skill | O que faz | Escopo | Invocador |
|---|---|---|---|
| 🔎 **[ssotchk](./skills/breadth/ssotchk/SKILL.md)** | Encontra onde um fact esta espalhado ou duplicado; nomeia a canonical source *(somente leitura)* | um fact, muitos lugares | model |
| 🧲 **[ssotize](./skills/breadth/ssotize/SKILL.md)** | Consolida esse fact em um unico lar e faz o restante apontar para ele | um fact, muitos lugares | model |
| 🧰 **[ppt-upgrade](./skills/breadth/ppt-upgrade/SKILL.md)** | Reconcilia nomes antigos de skills Paperthin instaladas depois de releases | nomes de skills instaladas | user |

### `coil/`

| Skill | O que faz | Escopo | Invocador |
|---|---|---|---|
| 🧭 **[retro](./skills/coil/retro/SKILL.md)** | Extrai licoes e anti-padroes de um cycle concluido ou falho | um cycle concluido | model |
| 🧱 **[re0-work](./skills/coil/re0-work/SKILL.md)** | Recomeça da v0, mantendo apenas as licoes que mereceram reuso | um reinicio | model |
| 🌀 **[flywheel](./skills/coil/flywheel/SKILL.md)** | Executa o loop build → QA → retro → re0-work para que o aprendizado componha, nao o codigo | o loop inteiro | model |
| 🎯 **[nba](./skills/coil/nba/SKILL.md)** | Le o estado vivo do cycle e retorna uma unica proxima melhor acao, nao um menu *(somente leitura)* | o cycle vivo | model |

### `mesh/`

*Em desenvolvimento - convergir visoes independentes em consenso.*

*Mais sobre invocacao: [docs/invocation.md](./docs/invocation.md).*

<a id="the-problem"></a>
## O problema

**A maioria das skills de agents e slop.**

Aponte um agent para um objetivo e ele **adiciona**: mais arquivos, mais opcoes, mais boilerplate "util". Adicionar parece progresso, e nada o faz voltar para apagar.

> [!WARNING]
> Repita isso em um projeto e voce ganha o toolkit gerado por IA familiar: skills quase duplicadas, configuracoes mortas, um README que diz a mesma coisa tres vezes. Plausivel, ocupado e silenciosamente impossivel de manter.

Essas skills apostam no outro lado. **Cada uma remove algo:**

- `re0` reescreve um rascunho como uma v0 limpa em vez de remenda-lo.
- `ssotchk` / `ssotize` colapsam o mesmo fact espalhado por arquivos.
- `shower` corta o que um estranho nao consegue acompanhar.
- `retro` / `re0-work` preservam a licao e deixam o build errado morrer.
- `autobahn` recorta o scope inseguro de antemao, para que o restante seguro rode em velocidade total.
- `dedash` remove ate o sinal do em dash e seus parecidos, uma ocorrencia julgada de cada vez.
- `sip` executa tudo isso automaticamente sobre a seu proprio output.

> [!TIP]
> A parte dificil nao e adicionar recursos; e contencao. Uma pass que nao encontra nada a melhorar nao muda nada. **Essa contencao e o produto.**

<a id="the-fixes"></a>
## As correcoes

<!-- Fixes follow the lifecycle of a piece of work, not the skill list: keep it clean (draft → read fresh → reconcile across files → automate → ship), keep it true (a single claim → a validation → the whole plan), then keep the loop learning and the run unblocked. Slot any new fix in by where it acts in that arc. -->

**Cada uma e um principio gasto pelo uso, tornado automatico.**

### #1 - Artifacts apodrecem
Edite um doc pedaco por pedaco durante uma session e ele incha: deltas vencidos, ruido duplicado, cicatrizes de changelog. Remendar por cima so preserva o apodrecimento.

**A correcao → `re0`:** reescrever o artifact como uma v0 limpa, como se fosse a primeira versao.

> *Antecedente: a Boy Scout Rule - "leave it cleaner than you found it" (Robert C. Martin, [Clean Code](https://www.informit.com/articles/article.aspx?p=1235624&seqNum=6), 2008). `re0` vai alem: reescreva, nao apenas arrume.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - pedimos ao `re0` para atualizar estes docs mais uma vez, mas eles ja estavam em v0.
- **Resultado** - ele nao encontrou nada a melhorar e deixou cada linha de prosa intacta.
- **Entao** - uma ferramenta que nao faz nada quando nada esta errado nunca infla seu repo: essas skills removem ruido, nao adicionam.
</details>

### #2 - Voce fica cego para o proprio trabalho
Depois de uma session longa, voce e a unica pessoa que nao consegue ler o proprio trabalho direito. Voce sabe demais, entao o cerebro preenche cada lacuna em silencio e os buracos desaparecem.

**A correcao → `shower`:** entregue apenas o artifact a um estranho que nunca viu sua session e pergunte: "isso realmente faz sentido?"

> *Antecedente: [egoless programming](https://en.wikipedia.org/wiki/Egoless_programming) - voce nao consegue revisar seu proprio trabalho objetivamente; outra pessoa precisa fazer isso (Gerald Weinberg, 1971). Aqui, essa pessoa e uma sub-session sem contexto.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - entregamos a propria spec do `shower` a uma sub-session com zero contexto, segurando apenas o arquivo.
- **Resultado** - em minutos ela encontrou tres bugs que o autor perdeu:
  - um passo que insinuava a resposta que deveria esconder,
  - um caminho que vazava arquivos spoiler,
  - um scope vago demais para agir.
- **Entao** - uma skill que pega os proprios bugs pode pegar os seus.
</details>

### #3 - O mesmo fact acaba em todos os lugares
Um valor de timeout, uma decisao, um status: copiados para um README, um doc, um ticket e uma thread do Slack. As copias derivam, e agora ninguem sabe qual e verdadeira.

**A correcao → `ssotchk` + `ssotize`:** encontrar a dispersao, nomear a canonical source, depois consolidar e fazer o restante apontar para ela.

> *Antecedente: [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) - um fact, um lar autoritativo (Hunt & Thomas, The Pragmatic Programmer, 1999).*

### #4 - "Lembre de verificar" nunca dispara
Uma diretriz enterrada em docs nao sera acionada em uma session nova, exatamente quando o viés do autor e maior.

**A correcao → `sip`:** no momento em que voce termina algo, ele roda os checks clean (`shower`, `ssotchk`, `re0`) e, quando ha uma claim ou um eval, os checks true (`factchk`, `mandela`) sobre seu output, automaticamente.

> *Antecedente: [dogfooding](https://en.wikipedia.org/wiki/Eating_your_own_dog_food) - eat your own dog food (Microsoft, 1988). Prove sua propria comida antes de servir.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - logo depois de um grande refactor que tornou cada skill self-contained, `sip` disparou automaticamente.
- **Resultado** - sua pass de olhos frescos pegou duas coisas que o autor ja nao via: uma regra de manutencao ainda apontando para links skill-to-skill que o mesmo refactor tinha acabado de apagar, e uma regra de seguranca de edicao de arquivos presente em duas skills mas ausente de uma terceira que tambem edita arquivos.
- **Entao** - o check morde onde o vies e maior: nao em um artifact fresco, mas na deriva que uma grande mudanca deixa para tras, exatamente onde os olhos do autor escorregam.
</details>

### #5 - Sua session nao viaja; o git log viaja
Sua session fica presa onde rodou: este agent, esta conta, esta maquina. Um colega ou outro agent nao consegue carregar o contexto em que seu trabalho aconteceu.

**A correcao → `re0-git`:** limpar a mensagem de um commit finalizado para que `git log`, a unica coisa que todo ambiente compartilha, carregue o handoff, e qualquer pessoa continue a partir apenas do log.

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - o primeiro alvo do `re0-git` foi seu proprio commit de release.
- **Resultado** - o dogfooding revelou duas falhas, ambas corrigidas:
  - uma mensagem cheia de trivia,
  - uma spec que pregava "sem redundancia" enquanto se repetia.
- **Entao** - sua primeira limpeza foi depois de si mesmo.
</details>

> [!NOTE]
> As cinco correcoes acima mantem um artifact **limpo**. As proximas tres o mantem **verdadeiro**: a mesma desconfianca do autor, aplicada ao raciocinio em vez da prosa.

### #6 - Seu instinto nao e uma source
"Plausivel", "absurdo", "novo": a linha menos confiavel de qualquer artifact. Priors humanos falham **nos dois sentidos**: excluem o real (existem sapos do deserto) e normalizam o impossivel (caixas sem peso).

**A correcao → `factchk`:** verificar qualquer claim ligada a realidade contra sources externas, nos dois sentidos, antes de enviar; e sinalizar, nao adivinhar, quando nao se consegue alcancar uma source.

> *Antecedentes: [WEIRD bias](https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/abs/weirdest-people-in-the-world/BF84F7517D56AFF7B7EB58411A554C17) (Henrich, Heine & Norenzayan, 2010) e [naive-physics / impetus error](https://www.science.org/doi/10.1126/science.210.4474.1139) (McCloskey, Caramazza & Green, 1980) - a intuicao julga mal a realidade nos dois sentidos.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - rodamos `factchk` nas proprias citacoes publicadas, nos dois sentidos.
- **Resultado** - todas se sustentaram, e ainda assim ele pegou dois deslizes de atribuicao: a famosa formulacao "what's measured becomes the target" e de Strathern (1997), nao de Goodhart; e "McCloskey 1980" e o artigo coautorado da *Science*, nao a peca da *Scientific American* de 1983.
- **Entao** - um fact-checker que audita as proprias notas auditara as suas.
</details>

### #7 - O eval confirma a si mesmo
Um model, um scorer e um designer podem concordar que um resultado e real enquanto nenhuma ground truth externa jamais entrou no loop. Uma sala inteira lembra com confianca algo que nunca aconteceu de forma independente.

**A correcao → `mandela`:** auditar qualquer eval, metric ou experiment contra uma taxonomia de 8 padroes de leakage: a ground truth externa entra de forma independente, ou o verifier e o designer?

> *Antecedentes: [Goodhart's law](https://en.wikipedia.org/wiki/Goodhart%27s_law), [data leakage](https://dl.acm.org/doi/10.1145/2382577.2382579) (Kaufman et al., 2012), e [circular analysis](https://www.nature.com/articles/nn.2303), "double dipping" (Kriegeskorte et al., 2009).*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - a auditoria foi destilada de um design de pesquisa que continuava morrendo por um unico modo de falha: um scorer, um model e um designer concordando sobre um resultado que nenhuma verdade externa tinha produzido.
- **Resultado** - leakage apareceu em oito formas nesse unico projeto: um scorer avaliando buckets que ele mesmo desenhou, dois componentes "verificando" um ao outro em um espaco compartilhado, uma receita privada que tornava o verifier o designer. Esse catalogo virou a taxonomia de 8 padroes da skill.
- **Entao** - a checklist nao e teorica: cada padrao nela ja tirou sangue uma vez.
</details>

### #8 - Voce nao consegue matar seu proprio plano
Voce o construiu, entao o defende. As perguntas que o quebrariam sao exatamente as que voce nao fara.

**A correcao → `hate`:** recusar ser gentil com o plano; devolver a objecao estrutural que poderia mata-lo e o experiment mais barato que provaria que ela importa. Invocada pelo user: voce aponta deliberadamente para um plano.

> *Antecedentes: [egoless programming](https://en.wikipedia.org/wiki/Egoless_programming) (Weinberg, 1971, a mesma raiz citada por `shower`), hostile review e fail-fast.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - cada pass de pesquisa fechava com um critico adversarial, e seu veredito era sempre uma root cause mais o teste mais barato para resolve-la, nunca uma checklist.
- **Resultado** - matou um motor de recombinacao com "one more box drawn, not a sharper tip", e um protocolo human-holdout apenas pelos numeros: n≈24 quando 36 eram necessarios, family-wise error rate perto de 34 %, e um design que citava um principio enquanto implementava seu oposto.
- **Entao** - a objecao que importava sempre era singular e barata de testar, exatamente o `{root, first nail}` que `hate` e travado para retornar.
</details>

### #9 - Um build rodando ainda pode ser o produto errado
Ciclos agenticos longos produzem muitas partes funcionais: panels, routes, tests, screenshots. Elas provam atividade mais do que valor, e sunk cost tenta carregar a arquitetura adiante. Entao, entre passes, o proximo movimento se desfoca em uma duzia de threads vivos, e opcoes demais viram sua propria paralisia.

**A correcao → `retro` + `re0-work` + `flywheel` + `nba`:** extrair a licao, o anti-padrao e o proximo gate; recomecar de uma v0 limpa quando a fundacao esta errada; executar o loop build → QA → retro → re0-work; e, quando o fio se perde, ler o estado e devolver a unica proxima melhor acao. Guarde apenas o que ganhou o direito de ser reutilizado.

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - uma demo de game engine chegou a um estado full-stack e runnable: API routes, canvas runtime, leaderboard, arcade pages, panels de remix e telemetry, tests, screenshots.
- **Resultado** - e ainda era o produto errado: os jogos gerados eram mock, de uma tela, sem durable replay layer, enquanto cada pass terminava em "what now?" diante de uma pilha de unmet gates e parked threads.
- **Entao** - rodar e parecer pronto para envio nao e done; o cycle precisa de uma skill para nomear o gate faltante e outra para devolver o unico proximo movimento.
</details>

### #10 - Trabalho perto de risco volta diluido
Aponte um agent para uma tarefa que encosta em guardrails, como scraping, licenciamento, privacidade ou seguranca, e voce recebe o pior dos dois mundos: o pedaco arriscado dispara refusals e retries, enquanto os 90 % seguros voltam com hedging, diluidos ou silenciosamente ausentes.

**A correcao → `autobahn`:** recortar itens guardrail-adjacent fora do scope antes da execucao, cada um com uma alternativa segura e uma entrada de arquivo; executar o scope restante com forca total em um subagent novo que ve apenas o carved prompt, nunca o input arriscado; entregar um descope ledger para que toda exclusao seja uma decisao visivel, nao uma lacuna silenciosa. Ele remove o pedido em vez de passa-lo por baixo. A autobahn nao tem limite de velocidade **porque** a disciplina de entrada e estrita.

> *Antecedentes deste mesmo verao: os EUA [suspended Fable 5 and Mythos 5](https://www.anthropic.com/news/fable-mythos-access) por causa de um safeguard com jailbreak (Anthropic, 2026), e a OpenAI enviou [GPT-5.6](https://openai.com/index/previewing-gpt-5-6-sol/) safety-stack-first para parceiros confiaveis (OpenAI, 2026). Na fronteira, a via rapida fica aberta apenas ate onde a disciplina de entrada se sustenta.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - o metodo veio de uma reescrita real de um documento estrategico confidencial que era risk-adjacent em quatro eixos ao mesmo tempo: stealth tooling, nomes trademarked, privacy-adjacent profiling, zonas cinzentas de scraping.
- **Resultado** - um main loop mais dez subagents rodaram o frontier model de ponta a ponta com zero flags, zero refusals, zero fallbacks; e a alternativa segura de cada item descoped acabou sendo o melhor produto de qualquer forma.
- **Entao** - o main loop recortou, subagents limpos rodaram o scope seguro, e esse recorte foi o motivo pelo qual puderam acelerar.
</details>

<a id="credits"></a>
## Creditos

- **Construido sobre** [mattpocock/skills](https://github.com/mattpocock/skills) (MIT), sua arquitetura e filosofia.
- **Nao e um fork**: estes sao workflows proprios e sem sobreposicao de [LilMGenius](https://github.com/LilMGenius).
- **Vendored verbatim**: alguns building blocks compartilhados, mantidos como estao com atribuicao por source em [NOTICE](./NOTICE).
- **Guia de autoria**: convencoes e filosofia vivem em [CLAUDE.md](./CLAUDE.md).
