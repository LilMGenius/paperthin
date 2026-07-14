<div align="center">

# Paperthin : modèles de conception agentic de bas niveau

<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/banner.svg" alt="Paperthin - Faites confiance à l'artifact, pas à l'auteur." width="820">

**Transformer de vieux réflexes d'ingénierie en gestes que votre agent sait appeler de lui-même.**

Sur **n'importe quel** agent | Claude Code, Codex, OpenCode, Antigravity, Copilot, Cursor, Grok-Build, Pi, Hermes, OpenClaw, etc.

[Démarrage rapide](#quickstart-15-seconds) · [La carte](#the-map) · [L'index](#the-index) · [Le problème](#the-problem) · [Les correctifs](#the-fixes) · [Crédits](#credits)

<sub>Read in: [English](../../README.md) · [中文](./README.zh-CN.md) · [हिन्दी](./README.hi.md) · [Español](./README.es.md) · [العربية](./README.ar.md) · [Português](./README.pt.md) · [Русский](./README.ru.md) · [日本語](./README.ja.md) · Français · [Deutsch](./README.de.md) · [한국어](./README.ko.md)</sub>

</div>

---

<a id="quickstart-15-seconds"></a>
## Démarrage rapide (15 secondes)

1. **Installez** pour chaque agent que vous utilisez :
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*'
   ```
2. **Lancez depuis un shell élevé/admin si votre OS le demande** afin que les skills soient liés par symlink et mis à jour automatiquement, au lieu d'être copiés.
3. **Utilisez-les** : les agents qui prennent en charge model invocation atteignent automatiquement les skills model-invoked ; vous pouvez appeler n'importe quel skill par son nom, comme `/re0`, et les user-invoked ne s'exécutent que ainsi.

**Pas sûr ?** Collez cette commande dans l'agent que vous utilisez et dites simplement `set this up for me`. Il fera le reste.

<a id="the-map"></a>
## La carte

**Combien d'artifacts, et sur quelle durée ?**

<div align="center">
<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/map.svg" alt="La carte Paperthin de LilMGenius/paperthin, une matrice deux par deux. Axe horizontal : cardinalité (un, puis plusieurs) ; axe vertical : temps (maintenant, puis au fil des itérations) ; quatre régions. En haut à gauche, depth : un artifact, maintenant ; cette chose est-elle propre et vraie ? En haut à droite, breadth : plusieurs artifacts, maintenant ; une même vérité est-elle cohérente partout ? En bas à gauche, coil : un projet, au fil des itérations ; chaque passe a-t-elle enseigné la suivante ? En bas à droite, mesh : plusieurs esprits, sur plusieurs tours ; la foule converge-t-elle vers la vérité ?" width="820">
</div>

<a id="the-index"></a>
## L'index

### `depth/`

| Skill | Ce qu'il fait | Portée | Invocation |
|---|---|---|---|
| 🧭 **[readchk](../../skills/depth/readchk/SKILL.md)** | Vérifie la lecture de la demande avant un travail non trivial ; ne remonte qu'une vraie bifurcation restante *(lecture seule)* | une instruction | modèle |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | Calibre le niveau suffisant le moins coûteux : fast, standard ou frontier *(lecture seule)* | une tâche | modèle |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | Retire le bait de la session, lance des lectures fraîches et signale d'abord la divergence *(lecture seule)* | une direction | utilisateur |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | Refuse d'être gentil : l'objection unique qui peut tuer le plan + le test le moins cher | un plan | utilisateur |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | Découpe le périmètre dangereux en amont, exécute le reste sûr à pleine puissance, livre un descope ledger | une tâche | modèle |
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | Réécrit un artifact qui a dérivé en v0 propre, plutôt qu'un patch de plus | un artifact | modèle |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | Remplace les noms d'outils accidentels dans le contenu portable par le mécanisme visé | un artifact durable | modèle |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | Relit à froid, avec des yeux neufs et zéro contexte : tient-il debout seul ? *(lecture seule)* | un artifact | modèle |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | Vérifie une claim contre les sources, dans les deux sens : l'absurde pourrait-il être vrai, l'évident faux ? *(lecture seule → correction)* | une claim | modèle |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | Audite une validation pour détecter les leakage : une ground truth externe entre-t-elle vraiment ? *(lecture seule)* | un eval | modèle |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | Après chaque changement, goûte votre output avec les propres checks clean-and-true du dépôt | votre output | modèle |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | Retire les em dashes et leurs sosies, en choisissant la ponctuation juste à chaque endroit | votre prose | utilisateur |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | Réécrit le message d'un commit terminé en v0 propre, afin que `git log` fasse l'handoff à lui seul | un commit | utilisateur |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | Parcourt la checklist de shipping et releasing, puis tag et publie une fois confirmé | une release | utilisateur |

### `breadth/`

| Skill | Ce qu'il fait | Portée | Invocation |
|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | Audite la dispersion, demande l'approbation, puis consolide le fait dans un seul foyer | un fait, plusieurs endroits | modèle |
| 🧰 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | Met à jour vos skills installés en toute sécurité en une seule commande, sans rien laisser d'obsolète ni rien installer en trop | votre installation de skills | utilisateur |

### `coil/`

| Skill | Ce qu'il fait | Portée | Invocation |
|---|---|---|---|
| 🧭 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | Extrait les leçons et anti-patterns d'un cycle terminé ou raté | un cycle terminé | modèle |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | Redémarre depuis v0 en gardant seulement les leçons qui ont mérité d'être réutilisées | un redémarrage | modèle |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | Lance la boucle build → QA → re0-memo → re0-work pour que l'apprentissage compose, pas le code | toute la boucle | modèle |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | Reconstruit le contexte perdu de l'humain à partir de l'état en direct : ce dont il a besoin, ce qui a changé, ce que signifient les nouveaux mots *(lecture seule)* | une réentrée | modèle |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | Lit l'état vivant du cycle et renvoie la seule meilleure prochaine action, pas un menu *(lecture seule)* | le cycle en cours | modèle |

### `mesh/`

*En développement - faire converger des vues indépendantes vers un consensus.*

*Plus d'informations sur l'invocation : [docs/invocation.md](../invocation.md).*

<a id="the-problem"></a>
## Le problème

**La plupart des skills d'agents sont du slop.**

Donnez un objectif à un agent et il **ajoute** : plus de fichiers, plus d'options, plus de boilerplate "utile". Ajouter ressemble à du progrès, et rien ne le force à revenir supprimer.

> [!WARNING]
> Répétez cela dans un projet et vous obtenez la boîte à outils IA familière : skills presque dupliqués, réglages morts, README qui dit la même chose trois fois. Plausible, occupé, et discrètement impossible à maintenir.

Ces skills parient dans l'autre sens. **Chacun enlève quelque chose :**

- `re0` réécrit un brouillon en v0 propre au lieu de le patcher.
- `ssotize` audite les faits dispersés, demande l'approbation, puis les replie dans un seul foyer.
- `shower` coupe ce qu'un inconnu ne peut pas suivre.
- `re0-memo` / `re0-work` préservent la leçon et laissent mourir la mauvaise construction.
- `autobahn` découpe le périmètre dangereux en amont, pour que le reste sûr tourne à pleine vitesse.
- `dedash` retire même le tic de l'em dash et ses sosies, occurrence par occurrence.
- `sip` exécute tout cela automatiquement sur votre propre output.

> [!TIP]
> Le plus dur n'est pas d'ajouter des fonctionnalités : c'est la retenue. Une passe qui ne trouve rien à améliorer ne change rien. **Cette retenue est le produit.**

<a id="the-fixes"></a>
## Les correctifs

Le récit complet des correctifs vit comme source canonical unique dans le [README anglais](../../README.md#the-fixes), afin que les exemples de preuve ne dérivent pas entre traductions. Ce fichier garde l'index et l'orientation locale.

<a id="credits"></a>
## Crédits

- **Construit sur** [mattpocock/skills](https://github.com/mattpocock/skills) (MIT), son architecture et sa philosophie.
- **Pas un fork** : ce sont les workflows propres, non chevauchants, de [LilMGenius](https://github.com/LilMGenius).
- **Vendored verbatim** : quelques briques partagées, conservées telles quelles avec attribution par source dans [NOTICE](../../NOTICE).
- **Guide d'authoring** : conventions et philosophie vivent dans [CLAUDE.md](../../CLAUDE.md).
