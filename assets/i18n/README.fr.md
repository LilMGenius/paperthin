<div align="center">

# Paperthin : modèles de conception agentic de bas niveau

<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/banner.svg" alt="Paperthin : patrons de conception agentiques de bas niveau" width="820">

Le livre de compétences pour l'auto-amélioration récursive (**RSI**).<br>La dernière preuve de **NVIDIA**, décortiquée avec une ingénierie qui ne vieillit pas.<br>Distillé de la méthode sans clavier du vainqueur du hackathon de harness engineering d'**OpenAI**.

Sur **n'importe quel** agent | Codex, Claude Code, OpenCode, Cursor, Grok Build, Grok Bot, Muse, Pi, etc.

*"Best part is no part."* Elon Musk[^musk]

**Conçu par [Bran Lee](https://github.com/LilMGenius)**<br>2026 : hackathon de harness engineering d'**OpenAI** (Ralphthon Seoul #2, tenu en même temps à Séoul et à San Francisco), *1re place*, seule équipe d'une personne face à des équipes issues des big tech et de doctorants des meilleures universités<br>2026 : intervenant invité du meetup officiel **Claude Code**, *deux fois*<br>2026 : *juré* invité du hackathon IA de **Google DeepMind**<br>2014 : concours national de l'Olympiade coréenne d'informatique (KOI), *prix d'argent*<br>2009~ : code depuis l'âge de *9* ans

[Démarrage rapide](#quickstart-30-seconds) · [La carte](#the-map) · [L'index](#the-index) · [Le problème](#the-problem) · [La preuve](#the-proof) · [Crédits](#credits)

<sub>Read in: [English](../../README.md) · [中文](./README.zh-CN.md) · [हिन्दी](./README.hi.md) · [Español](./README.es.md) · [العربية](./README.ar.md) · [Português](./README.pt.md) · [Русский](./README.ru.md) · [日本語](./README.ja.md) · Français · [Deutsch](./README.de.md) · [한국어](./README.ko.md)</sub>

</div>

---

<a id="quickstart-30-seconds"></a>
## Démarrage rapide (30 secondes)

Choisissez **une seule voie par agent** ; en installer deux charge chaque skill deux fois.

1. **Codex**: il se met à jour seul à chaque début de session.
   ```bash
   codex plugin marketplace add LilMGenius/paperthin && codex plugin add paperthin@paperthin
   ```
2. **Claude Code**:
   ```bash
   claude plugin marketplace add LilMGenius/paperthin && claude plugin install paperthin@paperthin
   ```
   Lancez ensuite `/plugin` dans Claude Code, ouvrez **Marketplaces**, sélectionnez `paperthin` et choisissez **Enable auto-update**, une seule fois.
3. **Tout autre agent** : une seule ligne installe les skills et une mise à jour quotidienne.
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*' && node "$HOME/.agents/skills/re0-upgrade/scripts/schedule/schedule.mjs" install
   ```
4. **Utilisez-le** : tapez `/paperthin`, puis votre rêve. C'est tout. Envie de comprendre la mécanique ? Pas d'inquiétude, il y a `/re0-tutorial`.
5. **Payable en étoiles** : si ça vous a servi, le tarif est une [étoile sur GitHub](https://github.com/LilMGenius/paperthin). Donné, je sais.

**Déjà installé ?** Lancez `/re0-upgrade` une fois dans une nouvelle session.

**Pas sûr ?** Dites à votre agent [`install https://github.com/LilMGenius/paperthin`](../../.agents/install-block.md#handed-only-this-repository). Un chat sur le web prend [llms.txt](https://raw.githubusercontent.com/LilMGenius/paperthin/main/llms.txt).

<a id="the-map"></a>
## La carte

**Combien d'artifacts, et sur quelle durée ?**

<div align="center">
<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/map.svg" alt="La carte Paperthin de LilMGenius/paperthin, une matrice deux par deux. Axe horizontal : cardinalité (un, puis plusieurs) ; axe vertical : temps (maintenant, puis au fil des itérations) ; quatre régions. En haut à gauche, depth : un artifact, maintenant ; cette chose est-elle propre et vraie ? En haut à droite, breadth : plusieurs artifacts, maintenant ; une même vérité est-elle cohérente partout ? En bas à gauche, coil : un projet, au fil des itérations ; chaque passe a-t-elle enseigné la suivante ? En bas à droite, mesh : plusieurs esprits, sur plusieurs tours ; la foule converge-t-elle vers la vérité ?" width="820">
</div>

<a id="the-index"></a>
## L'index

### `depth/`

| Skill | Ce qu'il fait | Invocation | Lecture seule |
|---|---|---|---|
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | Réécrit en première version propre un document ou un fichier rapiécé de toutes parts, au lieu d'y ajouter une rustine de plus | modèle | |
| 🗜️ **[debloat](../../skills/depth/debloat/SKILL.md)** | Resserre un texte ou un code boursouflé jusqu'à ce qui porte vraiment, sans perdre une règle ni un comportement | modèle | |
| 🔃 **[re0-order](../../skills/depth/re0-order/SKILL.md)** | Remet une liste en désordre dans un ordre logique selon une règle annoncée ; il déplace les éléments sans changer un mot | modèle | |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | Remplace, dans les documents faits pour durer, les noms de marques et d'outils par ce qu'ils font vraiment, pour que les textes survivent aux outils | modèle | |
| 🎨 **[re0-style](../../skills/depth/re0-style/SKILL.md)** | Corrige le code selon le style propre du projet et demande là où le projet lui-même fait les choses de deux façons | modèle | |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | Retire les tirets longs qu'un agent sème dans les phrases, et garde traits d'union, intervalles et tirets d'étiquette | utilisateur | |
| ⸱ **[dedot](../../skills/depth/dedot/SKILL.md)** | Dans un texte coréen, propose avec sa raison une virgule ou un mot de liaison pour chaque point médian qui relie une énumération | utilisateur | ✔ |
| 🧭 **[readback](../../skills/depth/readback/SKILL.md)** | Vérifie avant de travailler qu'il a bien compris votre demande, et ne pose une question que si deux lectures divergent vraiment | modèle | ✔ |
| 🏹 **[aim](../../skills/depth/aim/SKILL.md)** | Lit les fichiers ou le texte que vous lui confiez et propose ce que vous voulez sans doute faire ; il ne vous reste qu'à confirmer | modèle | ✔ |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | Choisit la gamme de modèle la moins chère et l'effort de réflexion qui suffisent encore à bien faire le travail | modèle | ✔ |
| 🧹 **[elon](../../skills/depth/elon/SKILL.md)** | Propose de retirer ou de reporter les exigences et engagements qui ne tiennent que par habitude, en citant l'origine de chacun ; ne touche jamais aux règles imposées de l'extérieur | modèle | ✔ |
| 🧩 **[scopechk](../../skills/depth/scopechk/SKILL.md)** | Vérifie, d'après le périmètre que la cible a elle-même écrit, si un nouvel élément a sa place là où vous voulez le mettre, et sinon indique un meilleur endroit | modèle | ✔ |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | Joue le critique sans pitié : l'objection unique qui pourrait couler votre plan, et le test le moins cher pour trancher | utilisateur | |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | Pose la question, débarrassée de votre cadrage, à plusieurs regards neufs et montre d'abord où ils divergent | utilisateur | ✔ |
| 🔀 **[crossthink](../../skills/depth/crossthink/SKILL.md)** | Quand toutes les options se ressemblent, emprunte des idées qui marchent à au moins cinq domaines éloignés et ne garde que les nouvelles | modèle | ✔ |
| ⚖️ **[re0-decide](../../skills/depth/re0-decide/SKILL.md)** | Transforme les pièces d'une décision en liste de contrôle dont le verdict découle de vos propres réponses ; il ne choisit jamais à votre place | utilisateur | ✔ |
| 🧐 **[whychk](../../skills/depth/whychk/SKILL.md)** | Interroge une décision que vous venez de prendre jusqu'à ce que vous sachiez l'expliquer, ou montre la faille du raisonnement | utilisateur | ✔ |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | Met d'abord de côté les parties risquées d'une tâche, avec des solutions plus sûres, mène le reste à pleine vitesse et note ce qui a été écarté | modèle | |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | Juste après un changement, avant de le déclarer fini, passe votre résultat aux vérifications propres à paperthin | modèle | |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | Confie votre travail à un lecteur neuf, sans aucun contexte, et lui demande s'il se comprend tout seul | modèle | ✔ |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | Confronte les affirmations à de vraies sources dans les deux sens : l'absurde peut être vrai, et l'évident faux | modèle | |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | Vérifie si un test ou une métrique se note lui-même, ou si c'est une vérité extérieure qui décide du résultat | modèle | ✔ |
| 🎭 **[demock](../../skills/depth/demock/SKILL.md)** | Repère dans le code en service les imitations et les replis silencieux qui rendent un rapport de réussite mensonger, et propose la vraie correction | modèle | |
| 🥸 **[deid](../../skills/depth/deid/SKILL.md)** | Retrouve les données d'une personne ou d'une entreprise dans des fichiers partagés, les remplace par le rôle qu'elles jouent et liste les anciens commits qui les contiennent encore | modèle | |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | Réécrit le message d'un commit terminé en gardant ses dates et sa place, pour que n'importe qui reprenne le travail à partir de l'historique seul | utilisateur | |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | Déroule la liste de contrôle de la publication, puis pose le tag et publie une fois que vous confirmez | utilisateur | |
| 🤝 **[re0-merge](../../skills/depth/re0-merge/SKILL.md)** | Relit et intègre la contribution de quelqu'un d'autre, lui garde son crédit et explique toute modification apportée | utilisateur | |
| 🧨 **[re0-squash](../../skills/depth/re0-squash/SKILL.md)** | Republie un dépôt GitHub sous la forme d'un seul commit signé aux fichiers identiques, sans laisser aucun ancien commit accessible | utilisateur | |

### `breadth/`

| Skill | Ce qu'il fait | Invocation | Lecture seule |
|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | Repère un fait copié à plusieurs endroits, lui donne un seul foyer après votre accord et fait pointer le reste vers lui | modèle | |
| 🔗 **[ssotize-local](../../skills/breadth/ssotize-local/SKILL.md)** | Fusionne des fichiers ou dossiers en double en une seule vraie copie vers laquelle les autres pointent, avec un retour en arrière éprouvé | modèle | |
| 📖 **[re0-readme](../../skills/breadth/re0-readme/SKILL.md)** | Répartit les lignes d'un README et de son AGENTS.md pour que chacune se trouve dans le fichier du lecteur qui en a besoin | modèle | |
| 📥 **[re0-import](../../skills/breadth/re0-import/SKILL.md)** | Range le matériel reçu à la bonne page d'une base de connaissances existante, selon les règles de cette base, et signale ce qui n'a pas de place | utilisateur | |
| 🆙 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | Met votre installation au niveau du catalogue complet en une étape confirmée : retire les skills renommés et ajoute les nouveaux | utilisateur | |

### `coil/`

| Skill | Ce qu'il fait | Invocation | Lecture seule |
|---|---|---|---|
| 🚪 **[paperthin](../../skills/coil/paperthin/SKILL.md)** | La seule commande à retenir : écrivez votre rêve juste après | utilisateur | |
| 🪜 **[re0-workflow](../../skills/coil/re0-workflow/SKILL.md)** | Pour un objectif, choisit quels skills lancer et dans quel ordre, vous le montre, les lance et s'arrête là où vous devez agir | modèle | |
| 📝 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | Tire d'un cycle terminé ou raté ses leçons et les erreurs à éviter | modèle | |
| 🔁 **[backprop](../../skills/coil/backprop/SKILL.md)** | Reporte la leçon d'une correction dans les documents et les règles qui ont causé l'erreur, puis les remet au propre | modèle | |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | Repart de zéro en n'emportant que les leçons qui ont prouvé leur valeur | modèle | |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | Vous remet à niveau après une absence : ce qui vous attend, ce qui a changé et ce que veulent dire les nouveaux termes | modèle | ✔ |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | Lit où en est le travail et désigne la meilleure étape suivante, une seule, pas un menu | modèle | ✔ |
| 🗂️ **[re0-plan](../../skills/coil/re0-plan/SKILL.md)** | Avant qu'un nouveau cycle de travail commence, ouvre son dossier avec les fichiers de conception, de déroulé et de preuves | utilisateur | |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | Fait tourner le cycle construire, tester, tirer les leçons, recommencer, pour que ce soient les leçons qui s'accumulent plutôt que le code | modèle | |
| 👁️ **[re0-watch](../../skills/coil/re0-watch/SKILL.md)** | Surveille un long travail d'agent pour repérer un blocage et vous prévient ; toute réparation reste une proposition que vous approuvez | utilisateur | |
| 🎓 **[re0-tutorial](../../skills/coil/re0-tutorial/SKILL.md)** | Enseigne un skill en trois niveaux gradués, chacun validé par un travail que vous rendez vous-même | utilisateur | |

### `mesh/`

| Skill | Ce qu'il fait | Invocation | Lecture seule |
|---|---|---|---|
| 🕸️ **[multithink](../../skills/mesh/multithink/SKILL.md)** | Pèse plusieurs avis indépendants selon les preuves qu'ils citent, jamais selon le nombre de ceux qui sont d'accord | utilisateur | ✔ |

*Plus d'informations sur l'invocation : [.agents/invocation.md](../../.agents/invocation.md).*

<a id="the-problem"></a>
## Le problème

**La plupart des skills d'agents sont du slop.**

Donnez un objectif à un agent et il **ajoute** : plus de fichiers, plus d'options, plus de boilerplate "utile". Ajouter ressemble à du progrès, et rien ne le force à revenir supprimer.

> [!WARNING]
> Répétez cela dans un projet et vous obtenez la boîte à outils IA familière : skills presque dupliqués, réglages morts, fichier markdown qui dit la même chose trois fois. Plausible, occupé, et discrètement impossible à maintenir.

Ces skills parient à l'inverse : **chacun retire quelque chose**, et [l'index](#the-index) dit quoi.

> [!TIP]
> Le plus dur n'est pas d'ajouter des fonctionnalités : c'est la retenue. Une passe qui ne trouve rien à améliorer ne change rien. **Cette retenue est le produit.**

<a id="the-proof"></a>
## La preuve

**NVIDIA l'a mesuré : un agent qui lâche son long historique et travaille à partir d'une note courte garde son score.**

| Ce que NVIDIA a mesuré | Contexte long | Note courte |
|---|---|---|
| SWE-bench Verified, Claude Opus 4.5 | 70.0 | 70.2 |
| Plus grand contexte nécessaire au run | 200K tokens | 16K tokens |
| Débit de service des modèles à poids ouverts, H100 | fenêtre de 256K | jusqu'à 7x plus à 16K |

<sub>Belcak et al. (NVIDIA), [You don't need long context](https://arxiv.org/abs/2611.05306), arXiv 2611.05306, 2026-11-03. Les lignes un et deux viennent du tableau 2 : Opus 4.5 agissant pas à pas sur une note d'état. La ligne trois vient de la figure 1 (GLM 5.2 3,6x, Kimi K2.6 5,6x, Qwen 3 Coder Next 7x).</sub>

**La skill de Paperthin qui prend en charge chaque résultat :**

| Ce que l'article a trouvé | Skills qui agissent |
|---|---|
| Un long travail n'a pas besoin d'un long contexte : quand la conversation est pleine, on écrit une note et on repart dans une nouvelle | `re0-work` repart de v0 avec les seules leçons prouvées, `re0-git` laisse le relais dans l'historique git pour la session suivante |
| Une bonne note garde la tâche au plus près de ses mots d'origine | `re0-loop` garde chaque demande ouverte sur la liste quand la session est compactée ou repart à neuf |
| Une bonne note garde ce qui est en cours, pourquoi, et la suite | `re0-memo` fait d'un cycle terminé la porte du suivant, `nba` désigne le prochain pas |
| Une bonne note garde le plan, les conditions de fin et l'emplacement des ressources | `re0-plan` ouvre le cycle avec ses fichiers de conception, de déroulé et de preuves, `re0-workflow` consigne l'ordre des skills |
| Une action à la fois sur une note d'état garde le score entier | `shower` confie la note seule à un lecteur sans historique et demande si elle tient debout |
| Une fenêtre plus petite sert jusqu'à 7x plus vite | `elon` retire ce qui ne reste que par habitude, `debloat` garde ce qui porte, `re0` réécrit au lieu d'empiler les rustines |

<a id="credits"></a>
## Crédits

- **Construit sur** [mattpocock/skills](https://github.com/mattpocock/skills) (MIT), son architecture et sa philosophie.
- **Pas un fork** : ce sont les workflows propres, non chevauchants, de [LilMGenius](https://github.com/LilMGenius).
- **Vendored verbatim** : quelques briques partagées, conservées telles quelles avec attribution par source dans [NOTICE](../../NOTICE).
- **Guide d'authoring** : conventions et philosophie vivent dans [AGENTS.md](../../AGENTS.md).

[^musk]: Elon Musk, [réponse sur X](https://x.com/elonmusk/status/2103537444910248312), 2026-09-25, à @Erdayastronaut au sujet de SpaceX retirant une grille d'empennage du booster V3 ; cela veut dire « la meilleure pièce est celle qui n'existe pas ». Il parlait d'ingénierie, pas de Paperthin.
