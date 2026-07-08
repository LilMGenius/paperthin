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
2. **Lancez avec les droits élevés** afin que les skills soient liés par symlink et mis à jour automatiquement, au lieu d'être copiés.
3. **Utilisez-les** : ils sont invoqués par le modèle, donc l'agent les atteint de lui-même ; vous pouvez aussi en appeler un par son nom, comme `/re0`.

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
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | Réécrit un artifact qui a dérivé en v0 propre, plutôt qu'un patch de plus | un artifact | modèle |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | Relit à froid, avec des yeux neufs et zéro contexte : tient-il debout seul ? *(lecture seule)* | un artifact | modèle |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | Vérifie une claim contre les sources, dans les deux sens : l'absurde pourrait-il être vrai, l'évident faux ? *(lecture seule → correction)* | une claim | modèle |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | Audite une validation pour détecter les leakage : une ground truth externe entre-t-elle vraiment ? *(lecture seule)* | un eval | modèle |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | Découpe le périmètre dangereux en amont, exécute le reste sûr à pleine puissance, livre un descope ledger | une tâche | modèle |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | Après chaque changement, goûte votre output avec les propres checks clean-and-true du dépôt | votre output | modèle |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | Refuse d'être gentil : l'objection unique qui peut tuer le plan + le test le moins cher | un plan | user |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | Retire les em dashes et leurs sosies, en choisissant la ponctuation juste à chaque endroit | votre prose | user |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | Réécrit le message d'un commit terminé en v0 propre, afin que `git log` fasse l'handoff à lui seul | un commit | user |

### `breadth/`

| Skill | Ce qu'il fait | Portée | Invocation |
|---|---|---|---|
| 🔎 **[ssotchk](../../skills/breadth/ssotchk/SKILL.md)** | Trouve où un fait est dispersé ou dupliqué ; nomme la canonical source *(lecture seule)* | un fait, plusieurs endroits | modèle |
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | Le consolide dans un seul foyer et fait pointer le reste vers lui | un fait, plusieurs endroits | modèle |
| 🧰 **[ppt-upgrade](../../skills/breadth/ppt-upgrade/SKILL.md)** | Met à jour vos skills installés en toute sécurité en une seule commande, sans rien laisser d'obsolète ni rien installer en trop | votre installation de skills | user |

### `coil/`

| Skill | Ce qu'il fait | Portée | Invocation |
|---|---|---|---|
| 🧭 **[retro](../../skills/coil/retro/SKILL.md)** | Extrait les leçons et anti-patterns d'un cycle terminé ou raté | un cycle terminé | modèle |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | Redémarre depuis v0 en gardant seulement les leçons qui ont mérité d'être réutilisées | un redémarrage | modèle |
| 🌀 **[flywheel](../../skills/coil/flywheel/SKILL.md)** | Lance la boucle build → QA → retro → re0-work pour que l'apprentissage compose, pas le code | toute la boucle | modèle |
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
- `ssotchk` / `ssotize` replient le même fait dispersé entre fichiers.
- `shower` coupe ce qu'un inconnu ne peut pas suivre.
- `retro` / `re0-work` préservent la leçon et laissent mourir la mauvaise construction.
- `autobahn` découpe le périmètre dangereux en amont, pour que le reste sûr tourne à pleine vitesse.
- `dedash` retire même le tic de l'em dash et ses sosies, occurrence par occurrence.
- `sip` exécute tout cela automatiquement sur votre propre output.

> [!TIP]
> Le plus dur n'est pas d'ajouter des fonctionnalités : c'est la retenue. Une passe qui ne trouve rien à améliorer ne change rien. **Cette retenue est le produit.**

<a id="the-fixes"></a>
## Les correctifs

<!-- Fixes follow the lifecycle of a piece of work, not the skill list: keep it clean (draft → read fresh → reconcile across files → automate → ship), keep it true (a single claim → a validation → the whole plan), then keep the loop learning and the run unblocked. Slot any new fix in by where it acts in that arc. -->

**Chacun est un principe éprouvé, rendu automatique.**

### #1 - Les artifacts pourrissent
Modifier un document morceau par morceau pendant une session le fait gonfler : deltas périmés, bruit dupliqué, cicatrices de changelog. Rajouter des patchs ne fait que préserver la pourriture.

**Le correctif → `re0` :** réécrire l'artifact comme une v0 propre, comme si c'était la première version.

> *Antécédent : la règle du Boy Scout, "leave it cleaner than you found it" (Robert C. Martin, [Clean Code](https://www.informit.com/articles/article.aspx?p=1235624&seqNum=6), 2008). `re0` va plus loin : réécrire, pas seulement ranger.*

<details>
<summary><b>[PROOF]</b></summary>

- **Mise en place** - nous avons demandé à `re0` de rafraîchir ces docs une fois de plus, mais elles étaient déjà à v0.
- **Résultat** - il n'a rien trouvé à améliorer et n'a touché aucune ligne de prose.
- **Donc** - un outil qui ne fait rien quand rien ne va mal ne gonfle jamais votre dépôt : ces skills retirent le bruit, ils ne l'ajoutent pas.
</details>

### #2 - Vous devenez aveugle à votre propre travail
Après une longue session, vous êtes la personne qui peut le moins lire votre propre travail droit : vous en savez trop, donc votre cerveau remplit les trous en silence, et les failles deviennent invisibles.

**Le correctif → `shower` :** donner uniquement l'artifact à un inconnu qui n'a jamais vu votre session, et demander : "est-ce que cela a vraiment du sens ?"

> *Antécédent : [egoless programming](https://en.wikipedia.org/wiki/Egoless_programming) - vous ne pouvez pas relire objectivement votre propre travail ; quelqu'un d'autre doit le faire (Gerald Weinberg, 1971). Ici, ce quelqu'un est une sub-session sans contexte.*

<details>
<summary><b>[PROOF]</b></summary>

- **Mise en place** - nous avons remis la propre spec de `shower` à une sub-session zéro contexte, avec seulement le fichier.
- **Résultat** - en quelques minutes, elle a trouvé trois bugs manqués par l'auteur :
  - une étape qui suggérait la réponse qu'elle devait cacher,
  - un chemin qui fuyait des fichiers spoiler,
  - un périmètre trop vague pour agir.
- **Donc** - un skill qui attrape ses propres bugs peut attraper les vôtres.
</details>

### #3 - Le même fait finit partout
Une valeur de timeout, une décision, un statut : copiés dans un README, une doc, un ticket et un fil Slack. Les copies dérivent, et plus personne ne sait laquelle est vraie.

**Le correctif → `ssotchk` + `ssotize` :** trouver la dispersion, nommer la canonical source, puis consolider et faire pointer le reste vers elle.

> *Antécédent : [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) - un fait, un foyer autoritaire (Hunt & Thomas, The Pragmatic Programmer, 1999).*

### #4 - "N'oublie pas de vérifier" ne se déclenche jamais
Une règle enfouie dans la doc ne se déclenchera pas dans une toute nouvelle session, exactement quand le biais de l'auteur est maximal.

**Le correctif → `sip` :** dès que vous terminez quelque chose, il lance les checks propres (`shower`, `ssotchk`, `re0`) et, s'il y a une claim ou un eval, les vrais checks (`factchk`, `mandela`) sur votre output, automatiquement.

> *Antécédent : [dogfooding](https://en.wikipedia.org/wiki/Eating_your_own_dog_food) - eat your own dog food (Microsoft, 1988). Goûtez votre propre cuisine avant de la servir.*

<details>
<summary><b>[PROOF]</b></summary>

- **Mise en place** - juste après un gros refactor rendant chaque skill autonome, `sip` s'est déclenché automatiquement.
- **Résultat** - sa passe à yeux frais a attrapé deux choses que l'auteur ne pouvait plus voir : une règle de maintenance pointant encore vers des liens skill-to-skill que le refactor venait de supprimer, et une règle de sécurité d'édition de fichiers présente dans deux skills mais absente d'un troisième qui édite aussi des fichiers.
- **Donc** - le check mord là où le biais est le plus haut : pas sur un artifact frais, mais sur la dérive laissée par un gros changement, exactement là où les yeux de l'auteur glissent.
</details>

### #5 - Votre session ne voyage pas ; le git log, si
Votre session reste coincée là où elle a tourné : cet agent, ce compte, cette machine. Un coéquipier ou un autre agent ne peut pas charger le contexte de votre travail.

**Le correctif → `re0-git` :** nettoyer le message d'un commit terminé afin que `git log`, la chose que tous les environnements partagent, porte l'handoff, et que n'importe qui reprenne à partir du log seul.

<details>
<summary><b>[PROOF]</b></summary>

- **Mise en place** - la toute première cible de `re0-git` fut son propre commit de release.
- **Résultat** - en le dogfoodant, deux défauts sont remontés, tous deux corrigés :
  - un message bourré de trivia,
  - une spec qui prêchait "pas de redondance" tout en se répétant.
- **Donc** - son premier nettoyage fut après lui-même.
</details>

> [!NOTE]
> Les cinq correctifs ci-dessus gardent un artifact **propre**. Les trois suivants le gardent **vrai** : la même méfiance envers l'auteur, tournée vers le raisonnement plutôt que vers la prose.

### #6 - Votre intuition n'est pas une source
"Plausible", "absurde", "nouveau" : la ligne la moins fiable de n'importe quel artifact. Les priors humains échouent **dans les deux sens** : ils excluent le réel (les grenouilles du désert existent) et normalisent l'impossible (des caisses sans poids).

**Le correctif → `factchk` :** vérifier toute claim ancrée dans le réel contre des sources externes, dans les deux sens, avant publication ; et signaler, plutôt que deviner, lorsqu'aucune source n'est atteignable.

> *Antécédents : [WEIRD bias](https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/abs/weirdest-people-in-the-world/BF84F7517D56AFF7B7EB58411A554C17) (Henrich, Heine & Norenzayan, 2010) et [naive-physics / impetus error](https://www.science.org/doi/10.1126/science.210.4474.1139) (McCloskey, Caramazza & Green, 1980) - l'intuition juge mal la réalité dans les deux sens.*

<details>
<summary><b>[PROOF]</b></summary>

- **Mise en place** - nous avons lancé `factchk` sur ses propres citations publiées, dans les deux sens.
- **Résultat** - elles tenaient toutes, et il a quand même attrapé deux erreurs d'attribution : la formule "what's measured becomes the target" est de Strathern (1997), pas de Goodhart ; et "McCloskey 1980" est l'article *Science* coécrit, pas le texte *Scientific American* de 1983.
- **Donc** - un fact-checker qui audite ses propres notes auditera les vôtres.
</details>

### #7 - L'eval se confirme elle-même
Un modèle, un scorer et un designer peuvent tous être d'accord qu'un résultat est réel alors qu'aucune ground truth externe n'est jamais entrée dans la boucle. Toute une salle se souvient avec assurance de quelque chose qui n'a jamais été produit indépendamment.

**Le correctif → `mandela` :** auditer tout eval, metric ou experiment avec une taxonomie de 8 leakage : une ground truth externe entre-t-elle indépendamment, ou le vérificateur est-il le designer ?

> *Antécédents : [Goodhart's law](https://en.wikipedia.org/wiki/Goodhart%27s_law), [data leakage](https://dl.acm.org/doi/10.1145/2382577.2382579) (Kaufman et al., 2012) et [circular analysis](https://www.nature.com/articles/nn.2303), le "double dipping" (Kriegeskorte et al., 2009).*

<details>
<summary><b>[PROOF]</b></summary>

- **Mise en place** - l'audit a été distillé d'un design de recherche qui mourait toujours sur un seul mode d'échec : scorer, modèle et designer s'accordant sur un résultat qu'aucune vérité externe n'avait produit.
- **Résultat** - la leakage est apparue sous huit formes dans ce seul projet : un scorer notant des buckets qu'il avait dessinés, deux composants se "vérifiant" dans un espace partagé, une recette privée qui faisait du vérificateur le designer. Ce catalogue est devenu la taxonomie 8-pattern du skill.
- **Donc** - la checklist n'est pas théorique : chaque pattern a déjà fait saigner un projet.
</details>

### #8 - Vous ne pouvez pas tuer votre propre plan
Vous l'avez construit, donc vous le défendez. Les questions qui le briseraient sont exactement celles que vous ne poserez pas.

**Le correctif → `hate` :** refuser d'être gentil avec le plan ; renvoyer l'objection porteuse qui pourrait le tuer et l'expérience la moins chère qui prouverait qu'elle compte. Invoqué par l'user : vous le pointez volontairement vers un plan.

> *Antécédents : [egoless programming](https://en.wikipedia.org/wiki/Egoless_programming) (Weinberg, 1971, la même racine que cite `shower`), hostile review et fail-fast.*

<details>
<summary><b>[PROOF]</b></summary>

- **Mise en place** - chaque passe de recherche se terminait par un critique adversarial, et son verdict était toujours une root cause plus le test le moins cher pour la trancher, jamais une checklist.
- **Résultat** - il a tué un moteur de recombination avec "une boîte de plus dessinée, pas une pointe plus nette", et un protocole human-holdout sur les chiffres seuls : n≈24 quand 36 étaient nécessaires, un taux d'erreur family-wise proche de 34 %, et un design qui citait un principe tout en implémentant son contraire.
- **Donc** - l'objection qui comptait était toujours singulière et bon marché à tester, exactement le `{root, first nail}` que `hate` est verrouillé pour retourner.
</details>

### #9 - Un build qui tourne peut encore être le mauvais produit
Les longs cycles agentics produisent beaucoup de pièces qui fonctionnent : panels, routes, tests, screenshots. Elles prouvent l'activité plus que la valeur, et le sunk cost pousse à garder l'architecture. Puis, entre les passes, le prochain mouvement se floute en une douzaine de fils vivants, et trop d'options devient sa propre paralysie.

**Le correctif → `retro` + `re0-work` + `flywheel` + `nba` :** extraire la leçon, l'anti-pattern et le prochain gate ; redémarrer depuis une v0 propre quand la fondation est fausse ; lancer la boucle build → QA → retro → re0-work ; et, quand le fil est perdu, lire l'état et renvoyer la seule meilleure prochaine action. Ne garder que ce qui a mérité d'être réutilisé.

<details>
<summary><b>[PROOF]</b></summary>

- **Mise en place** - une démo de moteur de jeu a atteint un état full-stack runnable : routes API, runtime canvas, leaderboard, pages arcade, panels remix et telemetry, tests, screenshots.
- **Résultat** - et c'était encore le mauvais produit : les jeux générés étaient mock, mono-écran, sans durable replay layer ; chaque passe finissait par "what now?" devant une pile de gates non satisfaits et de fils parqués.
- **Donc** - tourner et ressembler à une livraison ne veut pas dire terminé ; le cycle a besoin d'un skill pour nommer le gate manquant et d'un autre pour renvoyer le seul prochain mouvement.
</details>

### #10 - Le travail proche du risque revient édulcoré
Pointez un agent vers une tâche qui frôle les guardrails - scraping, licensing, privacy, sécurité - et vous obtenez le pire des deux mondes : le petit morceau risqué déclenche refus et retries, tandis que les 90 % sûrs reviennent hésitants, dilués ou silencieusement absents.

**Le correctif → `autobahn` :** découper les éléments guardrail-adjacent avant exécution, chacun avec une alternative sûre et une entrée d'archive ; faire tourner le périmètre restant à pleine puissance dans un subagent frais qui ne voit que le prompt découpé, jamais l'entrée risquée ; livrer un descope ledger afin que chaque exclusion soit une décision visible, pas un trou silencieux. Il retire la demande au lieu de la faire passer. L'autobahn n'a pas de limite de vitesse **parce que** la discipline d'entrée est stricte.

> *Antécédents, de cet été même : les États-Unis ont [suspendu Fable 5 et Mythos 5](https://www.anthropic.com/news/fable-mythos-access) à cause d'un safeguard jailbreaké (Anthropic, 2026), et OpenAI a livré [GPT-5.6](https://openai.com/index/previewing-gpt-5-6-sol/) safety-stack-first à des partenaires de confiance (OpenAI, 2026). À la frontière, la voie rapide reste ouverte seulement aussi loin que tient la discipline d'entrée.*

<details>
<summary><b>[PROOF]</b></summary>

- **Mise en place** - la méthode vient d'une réécriture réelle d'un document stratégique confidentiel, risk-adjacent sur quatre axes : stealth tooling, noms trademarked, profiling proche privacy, zones grises de scraping.
- **Résultat** - une boucle principale plus dix subagents ont fait tourner le modèle frontier de bout en bout avec zéro flag, zéro refus, zéro fallback ; et chaque alternative sûre d'élément descoped s'est révélée être le meilleur produit.
- **Donc** - la boucle principale a découpé, les subagents propres ont exécuté le périmètre sûr, et c'est cette découpe qui leur a permis d'accélérer à fond.
</details>

<a id="credits"></a>
## Crédits

- **Construit sur** [mattpocock/skills](https://github.com/mattpocock/skills) (MIT), son architecture et sa philosophie.
- **Pas un fork** : ce sont les workflows propres, non chevauchants, de [LilMGenius](https://github.com/LilMGenius).
- **Vendored verbatim** : quelques briques partagées, conservées telles quelles avec attribution par source dans [NOTICE](../../NOTICE).
- **Guide d'authoring** : conventions et philosophie vivent dans [CLAUDE.md](../../CLAUDE.md).
