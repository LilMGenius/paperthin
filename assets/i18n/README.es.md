<div align="center">

# Paperthin: patrones agenticos de bajo nivel

<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/banner.svg" alt="Paperthin - Confia en el artifact, no en el autor." width="820">

**Convierte vieja sabiduria de ingenieria en reflejos que tu agent alcanza por si solo.**

En **cualquier** agent | Claude Code, Codex, OpenCode, Antigravity, Copilot, Cursor, Grok-Build, Pi, Hermes, OpenClaw, etc.

[Inicio rapido](#quickstart-15-seconds) · [El mapa](#the-map) · [El indice](#the-index) · [El problema](#the-problem) · [Los arreglos](#the-fixes) · [Creditos](#credits)

<sub>Read in: [English](../../README.md) · [中文](./README.zh-CN.md) · [हिन्दी](./README.hi.md) · Español · [العربية](./README.ar.md) · [Português](./README.pt.md) · [Русский](./README.ru.md) · [日本語](./README.ja.md) · [Français](./README.fr.md) · [Deutsch](./README.de.md) · [한국어](./README.ko.md)</sub>

</div>

---

<a id="quickstart-15-seconds"></a>
## Inicio rapido (15 segundos)

Elige **una sola ruta por agent**; si instalas dos, cada skill se carga dos veces.

1. **Claude Code**:
   ```bash
   claude plugin marketplace add LilMGenius/paperthin && claude plugin install paperthin@paperthin
   ```
   Luego, en Claude Code, ejecuta `/plugin`, abre **Marketplaces**, selecciona `paperthin` y elige **Enable auto-update**, una sola vez.
2. **Codex**: se actualiza solo al empezar cada sesión.
   ```bash
   codex plugin marketplace add LilMGenius/paperthin && codex plugin add paperthin@paperthin
   ```
3. **Cualquier otro agent**: una sola línea instala las skills y una actualización diaria.
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*' && node "$HOME/.agents/skills/re0-upgrade/scripts/schedule/schedule.mjs" install
   ```
4. **Úsalas**: llama a cualquier skill por su nombre, como `/re0`. Muchas también arrancan solas cuando el trabajo lo pide.

**¿Ya lo tenías instalado?** Ejecuta `/re0-upgrade` una vez en una sesión nueva.

**¿No estás seguro?** Dile a tu agent `install https://github.com/LilMGenius/paperthin` y seguirá los [pasos de instalación](../../.agents/install-block.md#handed-only-this-repository) por su cuenta.

**¿Usas ChatGPT o Claude en la web?** Pásale `https://raw.githubusercontent.com/LilMGenius/paperthin/main/llms-full.txt`.

<a id="the-map"></a>
## El mapa

**Cuantos artifacts, y a traves de cuanto tiempo?**

<div align="center">
<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/map.svg" alt="El mapa Paperthin de LilMGenius/paperthin, una matriz dos por dos. Eje horizontal: cardinalidad (uno, luego muchos); eje vertical: tiempo (ahora, luego a traves de iteraciones); cuatro regiones. Arriba izquierda, depth: un artifact, ahora; esta una cosa es limpia y verdadera? Arriba derecha, breadth: muchos artifacts, ahora; una verdad es consistente en todas partes? Abajo izquierda, coil: un proyecto, a traves de iteraciones; cada pass enseno a la siguiente? Abajo derecha, mesh: muchas mentes, a traves de rondas; la multitud converge en la verdad?" width="820">
</div>

<a id="the-index"></a>
## El indice

### `depth/`

| Skill | Que hace | Alcance | Invocador | Solo lectura |
|---|---|---|---|---|
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | Reescribe como una primera versión limpia un documento o archivo lleno de parches, en lugar de parchearlo otra vez | un artifact | model | |
| 🧭 **[readback](../../skills/depth/readback/SKILL.md)** | Antes de ponerse a trabajar comprueba que entendió tu pedido, y solo pregunta cuando dos lecturas difieren de verdad | una instruccion | model | ✔ |
| 🏹 **[aim](../../skills/depth/aim/SKILL.md)** | Lee los archivos o el texto que le pasas y propone lo que probablemente buscas, para que solo tengas que confirmarlo | una entrega de datos | model | ✔ |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | Elige el nivel de modelo más barato y el esfuerzo de razonamiento justo que aún hacen bien el trabajo | una tarea | model | ✔ |
| 🧹 **[elon](../../skills/depth/elon/SKILL.md)** | Propone quitar los requisitos que solo siguen ahí por costumbre, con el origen de cada uno; nunca toca las normas impuestas desde fuera | un conjunto de requisitos aún no implementados con sus fuentes | model | ✔ |
| 🧩 **[scopechk](../../skills/depth/scopechk/SKILL.md)** | Comprueba, según el alcance que el propio destino tiene escrito, si una pieza nueva encaja donde quieres ponerla, y si no, indica un sitio mejor | un elemento y el destino al que se uniría | model | ✔ |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | Hace de crítico implacable: la única objeción que podría hundir tu plan y la prueba más barata para salir de dudas | un plan | user | |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | Plantea la pregunta, sin tu enfoque, a varias miradas nuevas y muestra primero en qué discrepan | una direccion | user | ✔ |
| 🔀 **[crossthink](../../skills/depth/crossthink/SKILL.md)** | Cuando todas las opciones se parecen, toma ideas que funcionan en cinco o más campos lejanos y se queda solo con las nuevas | un problema atascado | model | ✔ |
| ⚖️ **[re0-decide](../../skills/depth/re0-decide/SKILL.md)** | Convierte el material de una decisión en una lista de comprobación cuyo veredicto sale de tus propias respuestas; nunca elige por ti | material presentado para una decisión | user | ✔ |
| 🧐 **[whychk](../../skills/depth/whychk/SKILL.md)** | Cuestiona una decisión que acabas de tomar hasta que puedas explicarla, o señala el hueco en el razonamiento | una decision | user | ✔ |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | Aparta primero las partes arriesgadas de una tarea con alternativas más seguras, hace el resto a toda velocidad y anota lo que quedó fuera | una tarea | model | |
| 🎨 **[re0-style](../../skills/depth/re0-style/SKILL.md)** | Compara el código con el estilo propio del proyecto; por defecto no cambia nada y entrega un informe breve | un cambio en revisión | model | |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | Cambia los nombres de marcas y herramientas en la documentación duradera por lo que de verdad hacen, para que los textos sobrevivan a las herramientas | un artifact durable | model | |
| 🗜️ **[debloat](../../skills/depth/debloat/SKILL.md)** | Recorta textos o código inflados hasta dejar solo lo que sostiene el peso, sin perder ninguna regla ni ningún comportamiento | un artifact, prosa o código | model | |
| 🔃 **[re0-order](../../skills/depth/re0-order/SKILL.md)** | Devuelve un orden lógico a una lista revuelta según una regla explícita; solo mueve elementos y no cambia ni una palabra | una lista | model | |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | Quita las rayas largas que un agent esparce por las frases y conserva guiones, rangos y separadores de etiquetas | tu prosa | user | |
| ⸱ **[dedot](../../skills/depth/dedot/SKILL.md)** | En textos en coreano, sugiere con su motivo una coma o un conector para cada punto medio que une una enumeración | prosa coreana o filas de etiquetas delimitadas por quien escribe | user | ✔ |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | Le entrega tu trabajo a un lector nuevo sin ningún contexto y le pregunta si se entiende por sí solo | un artifact | model | ✔ |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | Contrasta las afirmaciones con fuentes reales en los dos sentidos: lo absurdo puede ser cierto y lo obvio, falso | una claim | model | |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | Comprueba si una prueba o una métrica se está calificando a sí misma o si es una verdad externa la que decide el resultado | un eval | model | ✔ |
| 🎭 **[demock](../../skills/depth/demock/SKILL.md)** | Encuentra en el código en uso las imitaciones y los atajos silenciosos que vuelven falso un informe de éxito, y propone el arreglo real | archivos, un directorio o un diff indicados | model | |
| 🥸 **[deid](../../skills/depth/deid/SKILL.md)** | Localiza los datos de una persona o empresa en archivos compartidos, los sustituye por el papel que cumplen y enumera los commits antiguos que aún los guardan | un artefacto indicado y un propietario | model | |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | Justo después de cualquier cambio, antes de darlo por terminado, pasa por tu resultado las comprobaciones propias de paperthin | tu output | model | |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | Reescribe el mensaje de un commit terminado sin tocar sus fechas ni su lugar, para que cualquiera pueda retomar el trabajo solo con el historial | un commit | user | |
| 🧨 **[re0-squash](../../skills/depth/re0-squash/SKILL.md)** | Vuelve a publicar un repositorio de GitHub como un único commit firmado con los mismos archivos, sin dejar ningún commit viejo al alcance | un repositorio | user | |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | Recorre la lista de comprobación del lanzamiento y, cuando confirmas, etiqueta y publica | un release | user | |
| 🤝 **[re0-merge](../../skills/depth/re0-merge/SKILL.md)** | Revisa e integra la contribución de otra persona, conserva su autoría y explica cualquier cambio que se le haga | una contribucion | user | |

### `breadth/`

| Skill | Que hace | Alcance | Invocador | Solo lectura |
|---|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | Encuentra un dato copiado en muchos sitios, le da un único hogar cuando lo apruebas y hace que el resto apunte allí | un fact, muchos lugares | model | |
| 🔗 **[ssotize-local](../../skills/breadth/ssotize-local/SKILL.md)** | Une archivos o carpetas duplicados en una sola copia real a la que enlazan los demás, con una vuelta atrás probada | los mismos bytes, muchas rutas | model | |
| 📖 **[re0-readme](../../skills/breadth/re0-readme/SKILL.md)** | Reparte las líneas de un README y su AGENTS.md para que cada una quede en el archivo del lector que la necesita | README y AGENTS.md de un repositorio | model | |
| 📥 **[re0-import](../../skills/breadth/re0-import/SKILL.md)** | Coloca el material recibido en la página adecuada de una base de conocimiento existente, con las reglas de esa base, e informa de lo que no tiene sitio | material entregado y una base de conocimiento | user | |
| 🆙 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | Pone tu instalación al día con el catálogo completo en un solo paso confirmado: retira las skills renombradas y añade las nuevas | tu instalación de skills | user | |

### `coil/`

| Skill | Que hace | Alcance | Invocador | Solo lectura |
|---|---|---|---|---|
| 🗂️ **[re0-plan](../../skills/coil/re0-plan/SKILL.md)** | Antes de empezar un nuevo ciclo de trabajo, abre su carpeta con los archivos de diseño, flujo de trabajo y evidencias | un cycle nuevo | user | |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | Mantiene en marcha el ciclo de construir, probar, aprender y reiniciar, para que se acumulen lecciones y no código | todo el cycle | model | |
| 👁️ **[re0-watch](../../skills/coil/re0-watch/SKILL.md)** | Vigila que un trabajo largo de un agent no se atasque y te avisa; cualquier arreglo es solo una propuesta que tú apruebas | una tarea en curso | user | |
| 📝 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | Saca las lecciones, y los errores que conviene evitar, de un ciclo terminado o fallido | un cycle terminado | model | |
| 🔁 **[backprop](../../skills/coil/backprop/SKILL.md)** | Lleva lo aprendido de una corrección a los documentos y reglas que causaron el error, y luego los ordena | una lección | model | |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | Empieza de cero y se lleva solo las lecciones que demostraron valer la pena | un reinicio | model | |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | Te pone al día tras una ausencia: qué te espera, qué cambió y qué significan los términos nuevos | una reentrada | model | ✔ |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | Lee en qué punto está el trabajo y nombra el mejor paso siguiente, uno solo, sin menús | el cycle vivo | model | ✔ |
| 🪜 **[re0-workflow](../../skills/coil/re0-workflow/SKILL.md)** | Para un objetivo, recomienda qué skills usar y en qué orden, sin ejecutarlas | una intención explícita | model | ✔ |
| 🎓 **[re0-tutorial](../../skills/coil/re0-tutorial/SKILL.md)** | Enseña una skill en tres niveles graduados que se superan con trabajo que entregas tú | una habilidad | user | |

### `mesh/`

| Skill | Que hace | Alcance | Invocador | Solo lectura |
|---|---|---|---|---|
| 🕸️ **[multithink](../../skills/mesh/multithink/SKILL.md)** | Pondera varias opiniones independientes por las pruebas que citan, nunca por cuántas coinciden | muchas lecturas de un artifact o una pregunta | user | ✔ |

*Mas sobre invocacion: [.agents/invocation.md](../../.agents/invocation.md).*

<a id="the-problem"></a>
## El problema

**La mayoria de las skills de agents son slop.**

Apunta un agent a un objetivo y **agrega**: mas archivos, mas opciones, mas boilerplate "util". Agregar parece progreso, y nada lo hace volver para borrar.

> [!WARNING]
> Repite eso en un proyecto y obtienes el toolkit generado por IA de siempre: skills casi duplicadas, configuraciones muertas, un README que dice lo mismo tres veces. Plausible, ocupado y silenciosamente inmantenible.

Estas skills apuestan al revés: **cada una quita algo**, y [el índice](#the-index) dice qué.

> [!TIP]
> La parte dificil no es agregar features; es la contencion. Una pass que no encuentra nada que mejorar no cambia nada. **Esa contencion es el producto.**

<a id="the-fixes"></a>
## Los arreglos

La narrativa completa de Fixes vive como unica fuente canonical en el [README en ingles](../../README.md#the-fixes), para que los ejemplos de prueba no deriven entre traducciones. Este archivo queda para el indice y la orientacion local.

<a id="credits"></a>
## Creditos

- **Construido sobre** [mattpocock/skills](https://github.com/mattpocock/skills) (MIT), su arquitectura y filosofia.
- **No es un fork**: estos son workflows propios y no superpuestos de [LilMGenius](https://github.com/LilMGenius).
- **Vendored verbatim**: algunos building blocks compartidos, conservados tal cual con atribucion por source en [NOTICE](../../NOTICE).
- **Guia de authoring**: las convenciones y la filosofia viven en [AGENTS.md](../../AGENTS.md).
