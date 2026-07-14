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

1. **Instala** para cada agent que uses:
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*'
   ```
2. **Ejecutalo desde una shell elevada/admin si tu OS lo pide** para que las skills queden enlazadas por symlink y se actualicen solas, en lugar de copiarse.
3. **Usalas**. Los agents que soportan model invocation alcanzan automaticamente las skills model-invoked; puedes llamar cualquier skill por nombre, como `/re0`, y las user-invoked solo corren asi.

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
| 🧭 **[readchk](../../skills/depth/readchk/SKILL.md)** | Revisa la lectura de la solicitud antes de trabajo no trivial; solo expone un fork real que sobreviva *(solo lectura)* | una instruccion | model |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | Dimensiona el tier suficiente mas barato: fast, standard o frontier *(solo lectura)* | una tarea | model |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | Quita el bait de la sesion, abre lecturas frescas y reporta primero la divergencia *(solo lectura)* | una direccion | user |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | Se niega a ser amable: la objecion unica que podria matar el plan + la prueba mas barata | un plan | user |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | Recorta el scope inseguro desde el principio, ejecuta el resto seguro a plena fuerza y entrega un descope ledger | una tarea | model |
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | Reescribe un artifact desviado como una v0 limpia, no como otro patch | un artifact | model |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | Sustituye nombres incidentales de stack en contenido portable por el mecanismo que querian decir | un artifact durable | model |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | Lo lee en frio, con ojos frescos y cero contexto: se sostiene por si solo? *(solo lectura)* | un artifact | model |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | Verifica una claim contra sources, en ambas direcciones: podria lo absurdo ser real y lo obvio ser falso? *(solo lectura → arreglo)* | una claim | model |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | Audita una validation en busca de leakage: entra de verdad una ground truth externa? *(solo lectura)* | un eval | model |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | Despues de cualquier cambio, prueba tu output con los checks clean-and-true del propio repo | tu output | model |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | Elimina em dashes y sus imitaciones, eligiendo la puntuacion que cada lugar necesita | tu prosa | user |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | Reescribe el mensaje de un commit terminado como una v0 limpia para que `git log` haga el handoff por si solo | un commit | user |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | Recorre la checklist de shipping y releasing, luego etiqueta y publica una vez confirmado | un release | user |

### `breadth/`

| Skill | Que hace | Alcance | Invocador |
|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | Audita la dispersion, pide aprobacion y luego consolida el fact en un solo hogar | un fact, muchos lugares | model |
| 🧰 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | Actualiza tus skills instaladas de forma segura con un solo comando, sin dejar nada obsoleto ni instalar nada de más | tu instalación de skills | user |

### `coil/`

| Skill | Que hace | Alcance | Invocador |
|---|---|---|---|
| 🧭 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | Extrae lecciones y anti-patrones de un cycle terminado o fallido | un cycle terminado | model |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | Reinicia desde v0, conservando solo las lecciones que ganaron derecho a reutilizarse | un reinicio | model |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | Ejecuta el cycle build → QA → re0-memo → re0-work para que el aprendizaje componga, no el codigo | todo el cycle | model |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | Reconstruye el contexto perdido del humano a partir del estado en vivo: que necesita, que cambio, que significan las palabras nuevas *(solo lectura)* | una reentrada | model |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | Lee el estado vivo del cycle y devuelve una sola siguiente mejor accion, no un menu *(solo lectura)* | el cycle vivo | model |

### `mesh/`

*En desarrollo - hacer converger vistas independientes hacia consenso.*

*Mas sobre invocacion: [docs/invocation.md](../invocation.md).*

<a id="the-problem"></a>
## El problema

**La mayoria de las skills de agents son slop.**

Apunta un agent a un objetivo y **agrega**: mas archivos, mas opciones, mas boilerplate "util". Agregar parece progreso, y nada lo hace volver para borrar.

> [!WARNING]
> Repite eso en un proyecto y obtienes el toolkit generado por IA de siempre: skills casi duplicadas, configuraciones muertas, un README que dice lo mismo tres veces. Plausible, ocupado y silenciosamente inmantenible.

Estas skills apuestan en la direccion contraria. **Cada una elimina algo:**

- `re0` reescribe un borrador como una v0 limpia en vez de patcharlo.
- `ssotize` audita facts dispersos, pide aprobacion y luego los colapsa en un solo hogar.
- `shower` corta lo que un desconocido no puede seguir.
- `re0-memo` / `re0-work` preservan la leccion y dejan morir el build equivocado.
- `autobahn` recorta el scope inseguro desde el principio para que el resto seguro corra a toda velocidad.
- `dedash` elimina incluso el tic del em dash y sus parecidos, una ocurrencia juzgada a la vez.
- `sip` ejecuta todo eso automaticamente sobre tu propio output.

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
- **Guia de authoring**: las convenciones y la filosofia viven en [CLAUDE.md](../../CLAUDE.md).
