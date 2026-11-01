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

Choisissez **une seule voie par agent** ; en installer deux charge chaque skill deux fois.

1. **Claude Code**:
   ```bash
   claude plugin marketplace add LilMGenius/paperthin && claude plugin install paperthin@paperthin
   ```
   Lancez ensuite `/plugin` dans Claude Code, ouvrez **Marketplaces**, sélectionnez `paperthin` et choisissez **Enable auto-update**, une seule fois.
2. **Codex**: il se met à jour seul à chaque début de session.
   ```bash
   codex plugin marketplace add LilMGenius/paperthin && codex plugin add paperthin@paperthin
   ```
3. **Tout autre agent** : une seule ligne installe les skills et une mise à jour quotidienne.
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*' && node "$HOME/.agents/skills/re0-upgrade/scripts/schedule/schedule.mjs" install
   ```
4. **Utilisez-les** : appelez n'importe quel skill par son nom, comme `/re0`. Beaucoup se lancent aussi d'eux-mêmes quand le travail le demande.

**Déjà installé ?** Lancez `/re0-upgrade` une fois dans une nouvelle session.

**Pas sûr ?** Dites à votre agent `install https://github.com/LilMGenius/paperthin` et il suit seul les [étapes d'installation](../../.agents/install-block.md#handed-only-this-repository).

**Sur ChatGPT ou Claude dans le navigateur ?** Donnez-lui `https://raw.githubusercontent.com/LilMGenius/paperthin/main/llms-full.txt`.

<a id="the-map"></a>
## La carte

**Combien d'artifacts, et sur quelle durée ?**

<div align="center">
<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/map.svg" alt="La carte Paperthin de LilMGenius/paperthin, une matrice deux par deux. Axe horizontal : cardinalité (un, puis plusieurs) ; axe vertical : temps (maintenant, puis au fil des itérations) ; quatre régions. En haut à gauche, depth : un artifact, maintenant ; cette chose est-elle propre et vraie ? En haut à droite, breadth : plusieurs artifacts, maintenant ; une même vérité est-elle cohérente partout ? En bas à gauche, coil : un projet, au fil des itérations ; chaque passe a-t-elle enseigné la suivante ? En bas à droite, mesh : plusieurs esprits, sur plusieurs tours ; la foule converge-t-elle vers la vérité ?" width="820">
</div>

<a id="the-index"></a>
## L'index

### `depth/`

| Skill | Ce qu'il fait | Portée | Invocation | Lecture seule |
|---|---|---|---|---|
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | Réécrit en première version propre un document ou un fichier rapiécé de toutes parts, au lieu d'y ajouter une rustine de plus | un artifact | modèle | |
| 🧭 **[readback](../../skills/depth/readback/SKILL.md)** | Vérifie avant de travailler qu'il a bien compris votre demande, et ne pose une question que si deux lectures divergent vraiment | une instruction | modèle | ✔ |
| 🏹 **[aim](../../skills/depth/aim/SKILL.md)** | Lit les fichiers ou le texte que vous lui confiez et propose ce que vous voulez sans doute faire ; il ne vous reste qu'à confirmer | un lot de données | modèle | ✔ |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | Choisit la gamme de modèle la moins chère et l'effort de réflexion qui suffisent encore à bien faire le travail | une tâche | modèle | ✔ |
| 🧹 **[elon](../../skills/depth/elon/SKILL.md)** | Propose de retirer les exigences qui ne tiennent que par habitude, en citant l'origine de chacune ; ne touche jamais aux règles imposées de l'extérieur | un ensemble d’exigences non encore mises en œuvre avec leurs sources | modèle | ✔ |
| 🧩 **[scopechk](../../skills/depth/scopechk/SKILL.md)** | Vérifie, d'après le périmètre que la cible a elle-même écrit, si un nouvel élément a sa place là où vous voulez le mettre, et sinon indique un meilleur endroit | un élément et la cible qu’il rejoindrait | modèle | ✔ |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | Joue le critique sans pitié : l'objection unique qui pourrait couler votre plan, et le test le moins cher pour trancher | un plan | utilisateur | |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | Pose la question, débarrassée de votre cadrage, à plusieurs regards neufs et montre d'abord où ils divergent | une direction | utilisateur | ✔ |
| 🔀 **[crossthink](../../skills/depth/crossthink/SKILL.md)** | Quand toutes les options se ressemblent, emprunte des idées qui marchent à au moins cinq domaines éloignés et ne garde que les nouvelles | un problème bloqué | modèle | ✔ |
| ⚖️ **[re0-decide](../../skills/depth/re0-decide/SKILL.md)** | Transforme les pièces d'une décision en liste de contrôle dont le verdict découle de vos propres réponses ; il ne choisit jamais à votre place | dossier soumis à décision | utilisateur | ✔ |
| 🧐 **[whychk](../../skills/depth/whychk/SKILL.md)** | Interroge une décision que vous venez de prendre jusqu'à ce que vous sachiez l'expliquer, ou montre la faille du raisonnement | une décision | utilisateur | ✔ |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | Met d'abord de côté les parties risquées d'une tâche, avec des solutions plus sûres, mène le reste à pleine vitesse et note ce qui a été écarté | une tâche | modèle | |
| 🎨 **[re0-style](../../skills/depth/re0-style/SKILL.md)** | Confronte le code au style propre du projet ; par défaut il ne modifie rien et rend un court rapport | un changement en revue | modèle | |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | Remplace, dans les documents faits pour durer, les noms de marques et d'outils par ce qu'ils font vraiment, pour que les textes survivent aux outils | un artifact durable | modèle | |
| 🗜️ **[debloat](../../skills/depth/debloat/SKILL.md)** | Resserre un texte ou un code boursouflé jusqu'à ce qui porte vraiment, sans perdre une règle ni un comportement | un artefact, prose ou code | modèle | |
| 🔃 **[re0-order](../../skills/depth/re0-order/SKILL.md)** | Remet une liste en désordre dans un ordre logique selon une règle annoncée ; il déplace les éléments sans changer un mot | une liste | modèle | |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | Retire les tirets longs qu'un agent sème dans les phrases, et garde traits d'union, intervalles et tirets d'étiquette | votre prose | utilisateur | |
| ⸱ **[dedot](../../skills/depth/dedot/SKILL.md)** | Dans un texte coréen, propose avec sa raison une virgule ou un mot de liaison pour chaque point médian qui relie une énumération | prose coréenne ou lignes d'étiquettes délimitées par leur auteur | utilisateur | ✔ |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | Confie votre travail à un lecteur neuf, sans aucun contexte, et lui demande s'il se comprend tout seul | un artifact | modèle | ✔ |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | Confronte les affirmations à de vraies sources dans les deux sens : l'absurde peut être vrai, et l'évident faux | une claim | modèle | |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | Vérifie si un test ou une métrique se note lui-même, ou si c'est une vérité extérieure qui décide du résultat | un eval | modèle | ✔ |
| 🎭 **[demock](../../skills/depth/demock/SKILL.md)** | Repère dans le code en service les imitations et les replis silencieux qui rendent un rapport de réussite mensonger, et propose la vraie correction | des fichiers, un dossier ou un diff désignés | modèle | |
| 🥸 **[deid](../../skills/depth/deid/SKILL.md)** | Retrouve les données d'une personne ou d'une entreprise dans des fichiers partagés, les remplace par le rôle qu'elles jouent et liste les anciens commits qui les contiennent encore | un artefact désigné et un propriétaire | modèle | |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | Juste après un changement, avant de le déclarer fini, passe votre résultat aux vérifications propres à paperthin | votre output | modèle | |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | Réécrit le message d'un commit terminé en gardant ses dates et sa place, pour que n'importe qui reprenne le travail à partir de l'historique seul | un commit | utilisateur | |
| 🧨 **[re0-squash](../../skills/depth/re0-squash/SKILL.md)** | Republie un dépôt GitHub sous la forme d'un seul commit signé aux fichiers identiques, sans laisser aucun ancien commit accessible | un dépôt | utilisateur | |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | Déroule la liste de contrôle de la publication, puis pose le tag et publie une fois que vous confirmez | une release | utilisateur | |
| 🤝 **[re0-merge](../../skills/depth/re0-merge/SKILL.md)** | Relit et intègre la contribution de quelqu'un d'autre, lui garde son crédit et explique toute modification apportée | une contribution | utilisateur | |

### `breadth/`

| Skill | Ce qu'il fait | Portée | Invocation | Lecture seule |
|---|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | Repère un fait copié à plusieurs endroits, lui donne un seul foyer après votre accord et fait pointer le reste vers lui | un fait, plusieurs endroits | modèle | |
| 🔗 **[ssotize-local](../../skills/breadth/ssotize-local/SKILL.md)** | Fusionne des fichiers ou dossiers en double en une seule vraie copie vers laquelle les autres pointent, avec un retour en arrière éprouvé | mêmes octets, plusieurs chemins | modèle | |
| 📖 **[re0-readme](../../skills/breadth/re0-readme/SKILL.md)** | Répartit les lignes d'un README et de son AGENTS.md pour que chacune se trouve dans le fichier du lecteur qui en a besoin | README et AGENTS.md d'un dépôt | modèle | |
| 📥 **[re0-import](../../skills/breadth/re0-import/SKILL.md)** | Range le matériel reçu à la bonne page d'une base de connaissances existante, selon les règles de cette base, et signale ce qui n'a pas de place | matériau transmis et une base de connaissances | utilisateur | |
| 🆙 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | Met votre installation au niveau du catalogue complet en une étape confirmée : retire les skills renommés et ajoute les nouveaux | votre installation de skills | utilisateur | |

### `coil/`

| Skill | Ce qu'il fait | Portée | Invocation | Lecture seule |
|---|---|---|---|---|
| 🗂️ **[re0-plan](../../skills/coil/re0-plan/SKILL.md)** | Avant qu'un nouveau cycle de travail commence, ouvre son dossier avec les fichiers de conception, de déroulé et de preuves | un nouveau cycle | utilisateur | |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | Fait tourner le cycle construire, tester, tirer les leçons, recommencer, pour que ce soient les leçons qui s'accumulent plutôt que le code | toute la boucle | modèle | |
| 👁️ **[re0-watch](../../skills/coil/re0-watch/SKILL.md)** | Surveille un long travail d'agent pour repérer un blocage et vous prévient ; toute réparation reste une proposition que vous approuvez | une tâche en cours | utilisateur | |
| 📝 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | Tire d'un cycle terminé ou raté ses leçons et les erreurs à éviter | un cycle terminé | modèle | |
| 🔁 **[backprop](../../skills/coil/backprop/SKILL.md)** | Reporte la leçon d'une correction dans les documents et les règles qui ont causé l'erreur, puis les remet au propre | une leçon | modèle | |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | Repart de zéro en n'emportant que les leçons qui ont prouvé leur valeur | un redémarrage | modèle | |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | Vous remet à niveau après une absence : ce qui vous attend, ce qui a changé et ce que veulent dire les nouveaux termes | une réentrée | modèle | ✔ |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | Lit où en est le travail et désigne la meilleure étape suivante, une seule, pas un menu | le cycle en cours | modèle | ✔ |
| 🪜 **[re0-workflow](../../skills/coil/re0-workflow/SKILL.md)** | Pour un objectif, recommande quels skills lancer et dans quel ordre, sans les lancer | une intention exprimée | modèle | ✔ |
| 🎓 **[re0-tutorial](../../skills/coil/re0-tutorial/SKILL.md)** | Enseigne un skill en trois niveaux gradués, chacun validé par un travail que vous rendez vous-même | une compétence | utilisateur | |

### `mesh/`

| Skill | Ce qu'il fait | Portée | Invocation | Lecture seule |
|---|---|---|---|---|
| 🕸️ **[multithink](../../skills/mesh/multithink/SKILL.md)** | Pèse plusieurs avis indépendants selon les preuves qu'ils citent, jamais selon le nombre de ceux qui sont d'accord | plusieurs lectures d’un artifact ou d’une question | utilisateur | ✔ |

*Plus d'informations sur l'invocation : [.agents/invocation.md](../../.agents/invocation.md).*

<a id="the-problem"></a>
## Le problème

**La plupart des skills d'agents sont du slop.**

Donnez un objectif à un agent et il **ajoute** : plus de fichiers, plus d'options, plus de boilerplate "utile". Ajouter ressemble à du progrès, et rien ne le force à revenir supprimer.

> [!WARNING]
> Répétez cela dans un projet et vous obtenez la boîte à outils IA familière : skills presque dupliqués, réglages morts, README qui dit la même chose trois fois. Plausible, occupé, et discrètement impossible à maintenir.

Ces skills parient à l'inverse : **chacun retire quelque chose**, et [l'index](#the-index) dit quoi.

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
- **Guide d'authoring** : conventions et philosophie vivent dans [AGENTS.md](../../AGENTS.md).
