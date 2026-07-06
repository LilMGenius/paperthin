<div align="center">

# Paperthin: patrones agenticos de bajo nivel

<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/banner.svg" alt="Paperthin - Confia en el artifact, no en el autor." width="820">

**Convierte vieja sabiduria de ingenieria en reflejos que tu agent alcanza por si solo.**

En **cualquier** agent | Claude Code, Codex, OpenCode, Antigravity, Copilot, Cursor, Grok-Build, Pi, Hermes, OpenClaw, etc.

[Inicio rapido](#quickstart-15-seconds) · [El mapa](#the-map) · [El indice](#the-index) · [El problema](#the-problem) · [Los arreglos](#the-fixes) · [Creditos](#credits)

Idiomas: [English](./README.md) · Espanol

</div>

---

<a id="quickstart-15-seconds"></a>
## Inicio rapido (15 segundos)

1. **Instala** para cada agent que uses:
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*'
   ```
2. **Ejecutalo con permisos elevados** para que las skills queden enlazadas por symlink y se actualicen solas, en lugar de copiarse.
3. **Usalas**. Las invoca el modelo, asi que tu agent las alcanza por su cuenta; tambien puedes llamar una por nombre, como `/re0`.

**No estas seguro?** Pega ese comando en el agent que estes usando y di `set this up for me`. Hara el resto.

<a id="the-map"></a>
## El mapa

**Cuantos artifacts, y a traves de cuanto tiempo?**

<div align="center">
<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/map.svg" alt="El mapa Paperthin de LilMGenius/paperthin, una matriz dos por dos. Eje horizontal: cardinalidad (uno, luego muchos); eje vertical: tiempo (ahora, luego a traves de iteraciones); cuatro regiones. Arriba izquierda, depth: un artifact, ahora; esta una cosa es limpia y verdadera? Arriba derecha, breadth: muchos artifacts, ahora; una verdad es consistente en todas partes? Abajo izquierda, coil: un proyecto, a traves de iteraciones; cada pass enseno a la siguiente? Abajo derecha, mesh: muchas mentes, a traves de rondas; la multitud converge en la verdad?" width="820">
</div>

<a id="the-index"></a>
## El indice

### `depth/`

| Skill | Que hace | Alcance | Invocador |
|---|---|---|---|
| ♻️ **[re0](./skills/depth/re0/SKILL.md)** | Reescribe un artifact desviado como una v0 limpia, no como otro patch | un artifact | model |
| 🚿 **[shower](./skills/depth/shower/SKILL.md)** | Lo lee en frio, con ojos frescos y cero contexto: se sostiene por si solo? *(solo lectura)* | un artifact | model |
| 🔬 **[factchk](./skills/depth/factchk/SKILL.md)** | Verifica una claim contra sources, en ambas direcciones: podria lo absurdo ser real y lo obvio ser falso? *(solo lectura → arreglo)* | una claim | model |
| 🧪 **[mandela](./skills/depth/mandela/SKILL.md)** | Audita una validation en busca de leakage: entra de verdad una ground truth externa? *(solo lectura)* | un eval | model |
| 🛣️ **[autobahn](./skills/depth/autobahn/SKILL.md)** | Recorta el scope inseguro desde el principio, ejecuta el resto seguro a plena fuerza y entrega un descope ledger | una tarea | model |
| 🥄 **[sip](./skills/depth/sip/SKILL.md)** | Despues de cualquier cambio, prueba tu output con los checks clean-and-true del propio repo | tu output | model |
| 😈 **[hate](./skills/depth/hate/SKILL.md)** | Se niega a ser amable: la objecion unica que podria matar el plan + la prueba mas barata | un plan | user |
| ✂️ **[dedash](./skills/depth/dedash/SKILL.md)** | Elimina em dashes y sus imitaciones, eligiendo la puntuacion que cada lugar necesita | tu prosa | user |
| 🧾 **[re0-git](./skills/depth/re0-git/SKILL.md)** | Reescribe el mensaje de un commit terminado como una v0 limpia para que `git log` haga el handoff por si solo | un commit | user |

### `breadth/`

| Skill | Que hace | Alcance | Invocador |
|---|---|---|---|
| 🔎 **[ssotchk](./skills/breadth/ssotchk/SKILL.md)** | Encuentra donde un fact esta disperso o duplicado; nombra la canonical source *(solo lectura)* | un fact, muchos lugares | model |
| 🧲 **[ssotize](./skills/breadth/ssotize/SKILL.md)** | Lo consolida en un solo hogar y hace que el resto apunte alli | un fact, muchos lugares | model |
| 🧰 **[ppt-upgrade](./skills/breadth/ppt-upgrade/SKILL.md)** | Reconcilia nombres antiguos de skills Paperthin instaladas despues de releases | nombres de skills instaladas | user |

### `coil/`

| Skill | Que hace | Alcance | Invocador |
|---|---|---|---|
| 🧭 **[retro](./skills/coil/retro/SKILL.md)** | Extrae lecciones y anti-patrones de un cycle terminado o fallido | un cycle terminado | model |
| 🧱 **[re0-work](./skills/coil/re0-work/SKILL.md)** | Reinicia desde v0, conservando solo las lecciones que ganaron derecho a reutilizarse | un reinicio | model |
| 🌀 **[flywheel](./skills/coil/flywheel/SKILL.md)** | Ejecuta el cycle build → QA → retro → re0-work para que el aprendizaje componga, no el codigo | todo el cycle | model |
| 🎯 **[nba](./skills/coil/nba/SKILL.md)** | Lee el estado vivo del cycle y devuelve una sola siguiente mejor accion, no un menu *(solo lectura)* | el cycle vivo | model |

### `mesh/`

*En desarrollo - hacer converger vistas independientes hacia consenso.*

*Mas sobre invocacion: [docs/invocation.md](./docs/invocation.md).*

<a id="the-problem"></a>
## El problema

**La mayoria de las skills de agents son slop.**

Apunta un agent a un objetivo y **agrega**: mas archivos, mas opciones, mas boilerplate "util". Agregar parece progreso, y nada lo hace volver para borrar.

> [!WARNING]
> Repite eso en un proyecto y obtienes el toolkit generado por IA de siempre: skills casi duplicadas, configuraciones muertas, un README que dice lo mismo tres veces. Plausible, ocupado y silenciosamente inmantenible.

Estas skills apuestan en la direccion contraria. **Cada una elimina algo:**

- `re0` reescribe un borrador como una v0 limpia en vez de patcharlo.
- `ssotchk` / `ssotize` colapsan el mismo fact disperso entre archivos.
- `shower` corta lo que un desconocido no puede seguir.
- `retro` / `re0-work` preservan la leccion y dejan morir el build equivocado.
- `autobahn` recorta el scope inseguro desde el principio para que el resto seguro corra a toda velocidad.
- `dedash` elimina incluso el tic del em dash y sus parecidos, una ocurrencia juzgada a la vez.
- `sip` ejecuta todo eso automaticamente sobre tu propio output.

> [!TIP]
> La parte dificil no es agregar features; es la contencion. Una pass que no encuentra nada que mejorar no cambia nada. **Esa contencion es el producto.**

<a id="the-fixes"></a>
## Los arreglos

<!-- Fixes follow the lifecycle of a piece of work, not the skill list: keep it clean (draft → read fresh → reconcile across files → automate → ship), keep it true (a single claim → a validation → the whole plan), then keep the loop learning and the run unblocked. Slot any new fix in by where it acts in that arc. -->

**Cada uno es un principio probado, hecho automatico.**

### #1 - Los artifacts se pudren
Edita un doc pieza por pieza durante una session y se infla: deltas viejos, ruido duplicado, cicatrices de changelog. Parchear encima solo conserva la podredumbre.

**El arreglo → `re0`:** reescribir el artifact como una v0 limpia, como si fuera la primera version.

> *Antecedente: la Boy Scout Rule - "leave it cleaner than you found it" (Robert C. Martin, [Clean Code](https://www.informit.com/articles/article.aspx?p=1235624&seqNum=6), 2008). `re0` va mas lejos: reescribe, no solo ordena.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - le pedimos a `re0` refrescar estos docs una vez mas, pero ya estaban en v0.
- **Resultado** - no encontro nada que mejorar y dejo intacta cada linea de prosa.
- **Entonces** - una herramienta que no hace nada cuando nada esta mal nunca infla tu repo: estas skills eliminan ruido, no lo agregan.
</details>

### #2 - Te vuelves ciego a tu propio trabajo
Despues de una session larga eres la unica persona que no puede leer su propio trabajo en linea recta: sabes demasiado, asi que tu cerebro rellena cada hueco en silencio y los agujeros desaparecen.

**El arreglo → `shower`:** entregar solo el artifact a un desconocido que nunca vio tu session y preguntar: "esto realmente tiene sentido?"

> *Antecedente: [egoless programming](https://en.wikipedia.org/wiki/Egoless_programming) - no puedes revisar tu propio trabajo objetivamente; alguien mas debe hacerlo (Gerald Weinberg, 1971). Aqui, ese alguien es una sub-session sin contexto.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - le dimos a `shower` su propia spec, en una sub-session con cero contexto y solo el archivo.
- **Resultado** - en minutos encontro tres bugs que el autor habia pasado por alto:
  - un paso que insinuaba la respuesta que debia ocultar,
  - una ruta que filtraba archivos spoiler,
  - un scope demasiado vago para actuar.
- **Entonces** - una skill que atrapa sus propios bugs puede atrapar los tuyos.
</details>

### #3 - El mismo fact termina en todas partes
Un valor de timeout, una decision, un estado: copiados en un README, un doc, un ticket y un hilo de Slack. Las copias derivan, y nadie sabe ya cual es verdadera.

**El arreglo → `ssotchk` + `ssotize`:** encontrar la dispersion, nombrar la canonical source, luego consolidar y hacer que el resto apunte a ella.

> *Antecedente: [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) - un fact, un hogar autoritativo (Hunt & Thomas, The Pragmatic Programmer, 1999).*

### #4 - "Recuerda verificar" nunca se dispara
Una guia enterrada en docs no se activara en una session nueva, justo cuando el sesgo del autor es mas alto.

**El arreglo → `sip`:** en el momento en que terminas algo, ejecuta los checks clean (`shower`, `ssotchk`, `re0`) y, cuando hay una claim o un eval, los true (`factchk`, `mandela`) sobre tu output, automaticamente.

> *Antecedente: [dogfooding](https://en.wikipedia.org/wiki/Eating_your_own_dog_food) - eat your own dog food (Microsoft, 1988). Prueba tu propia cocina antes de servirla.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - justo despues de un gran refactor que hizo cada skill self-contained, `sip` se disparo automaticamente.
- **Resultado** - su pass de ojos frescos encontro dos cosas que el autor ya no podia ver: una regla de mantenimiento que seguia apuntando a enlaces skill-to-skill que el mismo refactor acababa de borrar, y una regla de seguridad de edicion de archivos presente en dos skills pero ausente en una tercera que tambien edita archivos.
- **Entonces** - el check muerde donde el sesgo es mas alto: no en un artifact fresco, sino en la deriva que deja un gran cambio, justo donde los ojos del autor patinan.
</details>

### #5 - Tu session no viaja; el git log si
Tu session queda atrapada donde corrio: este agent, esta cuenta, esta maquina. Un companero o otro agent no puede cargar el contexto donde ocurrio tu trabajo.

**El arreglo → `re0-git`:** limpiar el mensaje de un commit terminado para que `git log`, lo unico que todos los entornos comparten, lleve el handoff y cualquiera pueda continuar desde el log solamente.

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - el primer objetivo de `re0-git` fue su propio commit de release.
- **Resultado** - dogfooding saco a la luz dos fallas, ambas corregidas:
  - un mensaje inflado con trivia,
  - una spec que predicaba "sin redundancia" mientras se repetia.
- **Entonces** - su primera limpieza fue detras de si mismo.
</details>

> [!NOTE]
> Los cinco arreglos anteriores mantienen un artifact **limpio**. Los tres siguientes lo mantienen **verdadero**: la misma desconfianza del autor, aplicada al razonamiento en vez de a la prosa.

### #6 - Tu intuicion no es una source
"Plausible", "absurdo", "nuevo": la linea menos confiable de cualquier artifact. Los priors humanos fallan **en ambas direcciones**: excluyen lo real (existen ranas del desierto) y normalizan lo imposible (cajas sin peso).

**El arreglo → `factchk`:** verificar cualquier claim anclada en la realidad contra sources externas, en ambas direcciones, antes de shippear; y marcar, no adivinar, cuando no se puede alcanzar una source.

> *Antecedentes: [WEIRD bias](https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/abs/weirdest-people-in-the-world/BF84F7517D56AFF7B7EB58411A554C17) (Henrich, Heine & Norenzayan, 2010) y [naive-physics / impetus error](https://www.science.org/doi/10.1126/science.210.4474.1139) (McCloskey, Caramazza & Green, 1980) - la intuicion juzga mal la realidad en ambas direcciones.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - ejecutamos `factchk` sobre sus propias citas publicadas, en ambas direcciones.
- **Resultado** - todas se sostuvieron, y aun asi encontro dos errores de atribucion que corregir: la famosa formulacion "what's measured becomes the target" es de Strathern (1997), no de Goodhart; y "McCloskey 1980" es el paper coautorado de *Science*, no la pieza de *Scientific American* de 1983.
- **Entonces** - un fact-checker que audita sus propias notas auditara las tuyas.
</details>

### #7 - El eval se confirma a si mismo
Un model, un scorer y un designer pueden estar de acuerdo en que un resultado es real mientras ninguna ground truth externa entro jamas al loop. Toda una sala recuerda con confianza algo que nunca ocurrio de manera independiente.

**El arreglo → `mandela`:** auditar cualquier eval, metric o experiment contra una taxonomia de 8 patrones de leakage: entra ground truth externa de forma independiente, o el verifier es el designer?

> *Antecedentes: [Goodhart's law](https://en.wikipedia.org/wiki/Goodhart%27s_law), [data leakage](https://dl.acm.org/doi/10.1145/2382577.2382579) (Kaufman et al., 2012) y [circular analysis](https://www.nature.com/articles/nn.2303), "double dipping" (Kriegeskorte et al., 2009).*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - la auditoria se destilo de un diseno de investigacion que seguia muriendo por un unico modo de falla: un scorer, un model y un designer acordando un resultado que ninguna verdad externa habia producido.
- **Resultado** - la leakage aparecio en ocho formas dentro de ese proyecto: un scorer calificando buckets que el mismo dibujo, dos componentes "verificandose" en un espacio compartido, una receta privada que convertia al verifier en designer. Ese catalogo se volvio la taxonomia de 8 patrones de la skill.
- **Entonces** - la checklist no es teorica: cada patron ya hizo sangrar una vez.
</details>

### #8 - No puedes matar tu propio plan
Lo construiste, asi que lo defiendes. Las preguntas que lo romperian son exactamente las que no haras.

**El arreglo → `hate`:** negarse a ser amable con el plan; devolver la objecion de carga que podria matarlo y el experiment mas barato que demostraria que importa. Invocado por el user: lo apuntas deliberadamente a un plan.

> *Antecedentes: [egoless programming](https://en.wikipedia.org/wiki/Egoless_programming) (Weinberg, 1971, la misma raiz que cita `shower`), hostile review y fail-fast.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - cada pass de investigacion cerro con un critico adversarial, y su veredicto siempre fue una root cause mas la prueba mas barata para resolverla, nunca una checklist.
- **Resultado** - mato un motor de recombinacion con "one more box drawn, not a sharper tip", y un protocolo human-holdout solo con los numeros: n≈24 cuando hacian falta 36, una family-wise error rate cerca de 34 %, y un diseno que citaba un principio mientras implementaba su opuesto.
- **Entonces** - la objecion que importaba siempre fue singular y barata de probar, exactamente el `{root, first nail}` que `hate` esta fijado para devolver.
</details>

### #9 - Un build que corre aun puede ser el producto equivocado
Ciclos agenticos largos producen muchas piezas funcionales: paneles, rutas, tests, screenshots. Prueban actividad mas que valor, y el sunk cost tienta a seguir cargando la arquitectura. Luego, entre passs, el siguiente movimiento se difumina en una docena de hilos vivos, y demasiadas opciones se vuelven su propia paralisis.

**El arreglo → `retro` + `re0-work` + `flywheel` + `nba`:** extraer la leccion, el anti-patron y la siguiente gate; reiniciar desde una v0 limpia cuando la base es incorrecta; ejecutar el loop build → QA → retro → re0-work; y cuando se pierde el hilo, leer el estado y devolver la unica siguiente mejor accion. Conserva solo lo que gano reutilizacion.

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - una demo de game engine alcanzo un estado full-stack y runnable: API routes, canvas runtime, leaderboard, paginas arcade, paneles de remix y telemetry, tests, screenshots.
- **Resultado** - y aun asi era el producto equivocado: los juegos generados eran mock, de una sola pantalla, sin durable replay layer, mientras cada pass terminaba en "what now?" frente a una pila de unmet gates y parked threads.
- **Entonces** - correr y parecer listo para ship no es done; el cycle necesita una skill que nombre la gate faltante y otra que devuelva el unico proximo movimiento.
</details>

### #10 - El trabajo cercano al riesgo vuelve diluido
Apunta un agent a una tarea que roza guardrails como scraping, licencias, privacidad o seguridad, y obtienes lo peor de ambos mundos: la astilla riesgosa dispara refusals y retries, mientras el 90 % seguro vuelve con hedging, diluido o silenciosamente incompleto.

**El arreglo → `autobahn`:** recortar los items guardrail-adjacent antes de ejecutar, cada uno con una alternativa segura y una entrada de archivo; ejecutar el scope restante a plena fuerza en un subagent fresco que solo ve el carved prompt, nunca el input riesgoso; entregar un descope ledger para que cada exclusion sea una decision visible, no un hueco silencioso. Elimina la peticion en vez de colarla. La autobahn no tiene limite de velocidad **porque** la disciplina de entrada es estricta.

> *Antecedentes de este mismo verano: EE. UU. [suspended Fable 5 and Mythos 5](https://www.anthropic.com/news/fable-mythos-access) por un safeguard jailbreakeado (Anthropic, 2026), y OpenAI envio [GPT-5.6](https://openai.com/index/previewing-gpt-5-6-sol/) safety-stack-first a partners de confianza (OpenAI, 2026). En la frontera, el carril rapido permanece abierto solo hasta donde aguanta la disciplina de entrada.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - el metodo salio de una reescritura real de un documento estrategico confidencial que era risk-adjacent en cuatro ejes a la vez: stealth tooling, nombres trademarked, profiling cercano a privacidad, zonas grises de scraping.
- **Resultado** - un main loop mas diez subagents corrieron el frontier model de punta a punta con cero flags, cero refusals, cero fallbacks; y la alternativa segura de cada item descoped resulto ser mejor producto de todos modos.
- **Entonces** - el main loop recorto, los subagents limpios ejecutaron el scope seguro, y ese recorte es la razon por la que pudieron acelerar a fondo.
</details>

<a id="credits"></a>
## Creditos

- **Construido sobre** [mattpocock/skills](https://github.com/mattpocock/skills) (MIT), su arquitectura y filosofia.
- **No es un fork**: estos son workflows propios y no superpuestos de [LilMGenius](https://github.com/LilMGenius).
- **Vendored verbatim**: algunos building blocks compartidos, conservados tal cual con atribucion por source en [NOTICE](./NOTICE).
- **Guia de authoring**: las convenciones y la filosofia viven en [CLAUDE.md](./CLAUDE.md).
