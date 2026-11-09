<div align="center">

# Paperthin: patrones agenticos de bajo nivel

<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/banner.svg" alt="Paperthin: patrones de diseño agéntico de bajo nivel" width="820">

El libro de habilidades para la automejora recursiva (**RSI**).<br>La prueba más reciente de **NVIDIA**, desmontada con ingeniería de siempre.<br>Destilado del método sin teclado del ganador del hackathon de harness engineering de **OpenAI**.

En **cualquier** agent | Codex, Claude Code, OpenCode, Cursor, Grok Build, Grok Bot, Muse, Pi, etc.

*"Best part is no part."* Elon Musk[^musk]

**Lo construye [Bran Lee](https://github.com/LilMGenius)**<br>2026: hackathon de harness engineering de **OpenAI** (Ralphthon Seoul #2, celebrado a la vez en Seúl y San Francisco), *1.er puesto*, el único equipo de una sola persona frente a equipos de big tech y doctores de universidades top<br>2026: ponente invitado del meetup oficial de **Claude Code**, *dos veces*<br>2026: *jurado* invitado del hackathon de IA de **Google DeepMind**<br>2014: concurso nacional de la Olimpiada de Informática de Corea (KOI), *premio de plata*<br>2009~: programando desde los *9* años

[Inicio rapido](#quickstart-30-seconds) · [El mapa](#the-map) · [El indice](#the-index) · [El problema](#the-problem) · [La prueba](#the-proof) · [Creditos](#credits)

<sub>Read in: [English](../../README.md) · [中文](./README.zh-CN.md) · [हिन्दी](./README.hi.md) · Español · [العربية](./README.ar.md) · [Português](./README.pt.md) · [Русский](./README.ru.md) · [日本語](./README.ja.md) · [Français](./README.fr.md) · [Deutsch](./README.de.md) · [한국어](./README.ko.md)</sub>

</div>

---

<a id="quickstart-30-seconds"></a>
## Inicio rapido (30 segundos)

Elige **una sola ruta por agent**; si instalas dos, cada skill se carga dos veces.

1. **Codex**: se actualiza solo al empezar cada sesión.
   ```bash
   codex plugin marketplace add LilMGenius/paperthin && codex plugin add paperthin@paperthin
   ```
2. **Claude Code**:
   ```bash
   claude plugin marketplace add LilMGenius/paperthin && claude plugin install paperthin@paperthin
   ```
   Luego, en Claude Code, ejecuta `/plugin`, abre **Marketplaces**, selecciona `paperthin` y elige **Enable auto-update**, una sola vez.
3. **Cualquier otro agent**: una sola línea instala las skills y una actualización diaria.
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*' && node "$HOME/.agents/skills/re0-upgrade/scripts/schedule/schedule.mjs" install
   ```
4. **Úsalo**: escribe `/paperthin` y luego tu sueño. Eso es todo. ¿Quieres entender cómo funciona? Tranquilo, para eso está `/re0-tutorial`.
5. **Se paga en estrellas**: si te sirvió, la tarifa es una [estrella en GitHub](https://github.com/LilMGenius/paperthin). Barato, lo sé.

**¿Ya lo tenías instalado?** Ejecuta `/re0-upgrade` una vez en una sesión nueva.

**¿No estás seguro?** Dile a tu agent [`install https://github.com/LilMGenius/paperthin`](../../.agents/install-block.md#handed-only-this-repository). A un chat web, dale [llms-full.txt](https://raw.githubusercontent.com/LilMGenius/paperthin/main/llms-full.txt).

<a id="the-map"></a>
## El mapa

**Cuantos artifacts, y a traves de cuanto tiempo?**

<div align="center">
<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/map.svg" alt="El mapa Paperthin de LilMGenius/paperthin, una matriz dos por dos. Eje horizontal: cardinalidad (uno, luego muchos); eje vertical: tiempo (ahora, luego a traves de iteraciones); cuatro regiones. Arriba izquierda, depth: un artifact, ahora; esta una cosa es limpia y verdadera? Arriba derecha, breadth: muchos artifacts, ahora; una verdad es consistente en todas partes? Abajo izquierda, coil: un proyecto, a traves de iteraciones; cada pass enseno a la siguiente? Abajo derecha, mesh: muchas mentes, a traves de rondas; la multitud converge en la verdad?" width="820">
</div>

<a id="the-index"></a>
## El indice

### `depth/`

| Skill | Que hace | Invocador | Solo lectura |
|---|---|---|---|
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | Reescribe como una primera versión limpia un documento o archivo lleno de parches, en lugar de parchearlo otra vez | model | |
| 🗜️ **[debloat](../../skills/depth/debloat/SKILL.md)** | Recorta textos o código inflados hasta dejar solo lo que sostiene el peso, sin perder ninguna regla ni ningún comportamiento | model | |
| 🔃 **[re0-order](../../skills/depth/re0-order/SKILL.md)** | Devuelve un orden lógico a una lista revuelta según una regla explícita; solo mueve elementos y no cambia ni una palabra | model | |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | Cambia los nombres de marcas y herramientas en la documentación duradera por lo que de verdad hacen, para que los textos sobrevivan a las herramientas | model | |
| 🎨 **[re0-style](../../skills/depth/re0-style/SKILL.md)** | Ajusta el código al estilo propio del proyecto y pregunta donde el propio proyecto lo hace de dos maneras | model | |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | Quita las rayas largas que un agent esparce por las frases y conserva guiones, rangos y separadores de etiquetas | user | |
| ⸱ **[dedot](../../skills/depth/dedot/SKILL.md)** | En textos en coreano, sugiere con su motivo una coma o un conector para cada punto medio que une una enumeración | user | ✔ |
| 🧭 **[readback](../../skills/depth/readback/SKILL.md)** | Antes de ponerse a trabajar comprueba que entendió tu pedido, y solo pregunta cuando dos lecturas difieren de verdad | model | ✔ |
| 🏹 **[aim](../../skills/depth/aim/SKILL.md)** | Lee los archivos o el texto que le pasas y propone lo que probablemente buscas, para que solo tengas que confirmarlo | model | ✔ |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | Elige el nivel de modelo más barato y el esfuerzo de razonamiento justo que aún hacen bien el trabajo | model | ✔ |
| 🧹 **[elon](../../skills/depth/elon/SKILL.md)** | Propone quitar o aplazar los requisitos y compromisos que solo siguen ahí por costumbre, con el origen de cada uno; nunca toca las normas impuestas desde fuera | model | ✔ |
| 🧩 **[scopechk](../../skills/depth/scopechk/SKILL.md)** | Comprueba, según el alcance que el propio destino tiene escrito, si una pieza nueva encaja donde quieres ponerla, y si no, indica un sitio mejor | model | ✔ |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | Hace de crítico implacable: la única objeción que podría hundir tu plan y la prueba más barata para salir de dudas | user | |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | Plantea la pregunta, sin tu enfoque, a varias miradas nuevas y muestra primero en qué discrepan | user | ✔ |
| 🔀 **[crossthink](../../skills/depth/crossthink/SKILL.md)** | Cuando todas las opciones se parecen, toma ideas que funcionan en cinco o más campos lejanos y se queda solo con las nuevas | model | ✔ |
| ⚖️ **[re0-decide](../../skills/depth/re0-decide/SKILL.md)** | Convierte el material de una decisión en una lista de comprobación cuyo veredicto sale de tus propias respuestas; nunca elige por ti | user | ✔ |
| 🧐 **[whychk](../../skills/depth/whychk/SKILL.md)** | Cuestiona una decisión que acabas de tomar hasta que puedas explicarla, o señala el hueco en el razonamiento | user | ✔ |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | Aparta primero las partes arriesgadas de una tarea con alternativas más seguras, hace el resto a toda velocidad y anota lo que quedó fuera | model | |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | Justo después de cualquier cambio, antes de darlo por terminado, pasa por tu resultado las comprobaciones propias de paperthin | model | |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | Le entrega tu trabajo a un lector nuevo sin ningún contexto y le pregunta si se entiende por sí solo | model | ✔ |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | Contrasta las afirmaciones con fuentes reales en los dos sentidos: lo absurdo puede ser cierto y lo obvio, falso | model | |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | Comprueba si una prueba o una métrica se está calificando a sí misma o si es una verdad externa la que decide el resultado | model | ✔ |
| 🎭 **[demock](../../skills/depth/demock/SKILL.md)** | Encuentra en el código en uso las imitaciones y los atajos silenciosos que vuelven falso un informe de éxito, y propone el arreglo real | model | |
| 🥸 **[deid](../../skills/depth/deid/SKILL.md)** | Localiza los datos de una persona o empresa en archivos compartidos, los sustituye por el papel que cumplen y enumera los commits antiguos que aún los guardan | model | |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | Reescribe el mensaje de un commit terminado sin tocar sus fechas ni su lugar, para que cualquiera pueda retomar el trabajo solo con el historial | user | |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | Recorre la lista de comprobación del lanzamiento y, cuando confirmas, etiqueta y publica | user | |
| 🤝 **[re0-merge](../../skills/depth/re0-merge/SKILL.md)** | Revisa e integra la contribución de otra persona, conserva su autoría y explica cualquier cambio que se le haga | user | |
| 🧨 **[re0-squash](../../skills/depth/re0-squash/SKILL.md)** | Vuelve a publicar un repositorio de GitHub como un único commit firmado con los mismos archivos, sin dejar ningún commit viejo al alcance | user | |

### `breadth/`

| Skill | Que hace | Invocador | Solo lectura |
|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | Encuentra un dato copiado en muchos sitios, le da un único hogar cuando lo apruebas y hace que el resto apunte allí | model | |
| 🔗 **[ssotize-local](../../skills/breadth/ssotize-local/SKILL.md)** | Une archivos o carpetas duplicados en una sola copia real a la que enlazan los demás, con una vuelta atrás probada | model | |
| 📖 **[re0-readme](../../skills/breadth/re0-readme/SKILL.md)** | Reparte las líneas de un README y su AGENTS.md para que cada una quede en el archivo del lector que la necesita | model | |
| 📥 **[re0-import](../../skills/breadth/re0-import/SKILL.md)** | Coloca el material recibido en la página adecuada de una base de conocimiento existente, con las reglas de esa base, e informa de lo que no tiene sitio | user | |
| 🆙 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | Pone tu instalación al día con el catálogo completo en un solo paso confirmado: retira las skills renombradas y añade las nuevas | user | |

### `coil/`

| Skill | Que hace | Invocador | Solo lectura |
|---|---|---|---|
| 🚪 **[paperthin](../../skills/coil/paperthin/SKILL.md)** | El único comando que hay que recordar: escribe tu sueño después | user | |
| 🪜 **[re0-workflow](../../skills/coil/re0-workflow/SKILL.md)** | Para un objetivo, elige qué skills usar y en qué orden, te lo muestra, las ejecuta y se detiene donde te toca actuar | model | |
| 📝 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | Saca las lecciones, y los errores que conviene evitar, de un ciclo terminado o fallido | model | |
| 🔁 **[backprop](../../skills/coil/backprop/SKILL.md)** | Lleva lo aprendido de una corrección a los documentos y reglas que causaron el error, y luego los ordena | model | |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | Empieza de cero y se lleva solo las lecciones que demostraron valer la pena | model | |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | Te pone al día tras una ausencia: qué te espera, qué cambió y qué significan los términos nuevos | model | ✔ |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | Lee en qué punto está el trabajo y nombra el mejor paso siguiente, uno solo, sin menús | model | ✔ |
| 🗂️ **[re0-plan](../../skills/coil/re0-plan/SKILL.md)** | Antes de empezar un nuevo ciclo de trabajo, abre su carpeta con los archivos de diseño, flujo de trabajo y evidencias | user | |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | Mantiene en marcha el ciclo de construir, probar, aprender y reiniciar, para que se acumulen lecciones y no código | model | |
| 👁️ **[re0-watch](../../skills/coil/re0-watch/SKILL.md)** | Vigila que un trabajo largo de un agent no se atasque y te avisa; cualquier arreglo es solo una propuesta que tú apruebas | user | |
| 🎓 **[re0-tutorial](../../skills/coil/re0-tutorial/SKILL.md)** | Enseña una skill en tres niveles graduados que se superan con trabajo que entregas tú | user | |

### `mesh/`

| Skill | Que hace | Invocador | Solo lectura |
|---|---|---|---|
| 🕸️ **[multithink](../../skills/mesh/multithink/SKILL.md)** | Pondera varias opiniones independientes por las pruebas que citan, nunca por cuántas coinciden | user | ✔ |

*Mas sobre invocacion: [.agents/invocation.md](../../.agents/invocation.md).*

<a id="the-problem"></a>
## El problema

**La mayoria de las skills de agents son slop.**

Apunta un agent a un objetivo y **agrega**: mas archivos, mas opciones, mas boilerplate "util". Agregar parece progreso, y nada lo hace volver para borrar.

> [!WARNING]
> Repite eso en un proyecto y obtienes el toolkit generado por IA de siempre: skills casi duplicadas, configuraciones muertas, un markdown que dice lo mismo tres veces. Plausible, ocupado y silenciosamente inmantenible.

Estas skills apuestan al revés: **cada una quita algo**, y [el índice](#the-index) dice qué.

> [!TIP]
> La parte dificil no es agregar features; es la contencion. Una pass que no encuentra nada que mejorar no cambia nada. **Esa contencion es el producto.**

<a id="the-proof"></a>
## La prueba

**NVIDIA lo midió: un agente que suelta su larga historia y trabaja con una nota corta conserva su puntuación.**

| Lo que midió NVIDIA | Contexto largo | Nota corta |
|---|---|---|
| SWE-bench Verified, Claude Opus 4.5 | 70.0 | 70.2 |
| Contexto máximo que necesitó la ejecución | 200K tokens | 16K tokens |
| Rendimiento de servicio de pesos abiertos, H100 | ventana de 256K | hasta 7x más con 16K |

<sub>Belcak et al. (NVIDIA), [You don't need long context](https://arxiv.org/abs/2611.05306), arXiv 2611.05306, 2026-11-03. Las filas uno y dos son la tabla 2: Opus 4.5 actuando paso a paso sobre una nota de estado. La fila tres es la figura 1 (GLM 5.2 3,6x, Kimi K2.6 5,6x, Qwen 3 Coder Next 7x).</sub>

**Qué skill de Paperthin se encarga de cada hallazgo:**

| Lo que encontró el artículo | Skills que actúan |
|---|---|
| El trabajo largo no necesita contexto largo: cuando la conversación se llena, se escribe una nota y se sigue en una nueva | `re0-work` reinicia desde v0 solo con las lecciones probadas, `re0-git` deja el relevo en el historial de git para la siguiente sesión |
| Una buena nota mantiene la tarea cerca de sus palabras originales | `re0-loop` mantiene en la lista cada petición abierta cuando la sesión se compacta o empieza de nuevo |
| Una buena nota guarda qué se hace, por qué y qué sigue | `re0-memo` convierte un ciclo terminado en la puerta del siguiente, `nba` nombra el siguiente paso |
| Una buena nota guarda el plan, las condiciones de cierre y dónde está cada cosa | `re0-plan` abre el ciclo con sus archivos de diseño, flujo y evidencia, `re0-workflow` deja escrito el orden de las skills |
| Una acción a la vez sobre una nota de estado mantiene la puntuación completa | `shower` entrega la nota sola a un lector sin historia y pregunta si se sostiene por sí misma |
| Una ventana más pequeña sirve hasta 7x más rápido | `elon` quita lo que solo sigue por costumbre, `debloat` deja lo que carga peso, `re0` reescribe en lugar de apilar parches |

<a id="credits"></a>
## Creditos

- **Construido sobre** [mattpocock/skills](https://github.com/mattpocock/skills) (MIT), su arquitectura y filosofia.
- **No es un fork**: estos son workflows propios y no superpuestos de [LilMGenius](https://github.com/LilMGenius).
- **Vendored verbatim**: algunos building blocks compartidos, conservados tal cual con atribucion por source en [NOTICE](../../NOTICE).
- **Guia de authoring**: las convenciones y la filosofia viven en [AGENTS.md](../../AGENTS.md).

[^musk]: Elon Musk, [respuesta en X](https://x.com/elonmusk/status/2103537444910248312), 2026-09-25, a @Erdayastronaut sobre SpaceX quitando una aleta de rejilla del propulsor V3; significa "la mejor pieza es la que no existe". Lo dijo sobre ingeniería, no sobre Paperthin.
