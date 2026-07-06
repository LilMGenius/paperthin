<div align="center">

# Paperthin: Low-level Design Patterns für Agents

<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/banner.svg" alt="Paperthin - Vertraue dem Artifact, nicht dem Autor." width="820">

**Alte Engineering-Weisheit wird zu Reflexen, nach denen dein Agent von selbst greift.**

Auf **jedem** Agent | Claude Code, Codex, OpenCode, Antigravity, Copilot, Cursor, Grok-Build, Pi, Hermes, OpenClaw usw.

[Schnellstart](#quickstart-15-seconds) · [Die Karte](#the-map) · [Der Index](#the-index) · [Das Problem](#the-problem) · [Die Fixes](#the-fixes) · [Credits](#credits)

<sub>Read in: [English](../../README.md) · [中文](./README.zh-CN.md) · [हिन्दी](./README.hi.md) · [Español](./README.es.md) · [العربية](./README.ar.md) · [Português](./README.pt.md) · [Русский](./README.ru.md) · [日本語](./README.ja.md) · [Français](./README.fr.md) · Deutsch · [한국어](./README.ko.md)</sub>

</div>

---

<a id="quickstart-15-seconds"></a>
## Schnellstart (15 Sekunden)

1. Für jeden Agents, den du nutzt, **installieren**:
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*'
   ```
2. **Mit erhöhten Rechten ausführen**, damit die Skills als Symlinks angelegt werden und sich automatisch aktualisieren, statt kopiert zu werden.
3. **Nutzen**: Sie werden vom Model aufgerufen, also greift dein Agent selbst danach. Du kannst einen Skill auch direkt beim Namen nennen, etwa `/re0`.

**Unsicher?** Füge den Befehl in den Agent ein, den du gerade verwendest, und sag einfach `set this up for me`. Er erledigt den Rest.

<a id="the-map"></a>
## Die Karte

**Wie viele Artifacts, und über welchen Zeitraum?**

<div align="center">
<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/map.svg" alt="Die Paperthin-Karte von LilMGenius/paperthin, eine Zwei-mal-zwei-Matrix. Horizontale Achse: Kardinalität (eins, dann viele); vertikale Achse: Zeit (jetzt, dann über Iterationen); vier Bereiche. Oben links, depth: ein Artifact, jetzt; ist dieses eine Ding sauber und wahr? Oben rechts, breadth: viele Artifacts, jetzt; ist eine Wahrheit überall konsistent? Unten links, coil: ein Projekt, über Iterationen; hat jeder pass den nächsten gelehrt? Unten rechts, mesh: viele Köpfe, über Runden; konvergiert die Menge zur Wahrheit?" width="820">
</div>

<a id="the-index"></a>
## Der Index

### `depth/`

| Skill | Was er tut | Scope | Invoker |
|---|---|---|---|
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | Schreibt ein gedriftetes Artifact als saubere v0 neu, statt noch einen Patch daraufzusetzen | ein Artifact | Model |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | Liest es kalt, mit frischen Augen und ohne Kontext: steht es für sich? *(nur Lesen)* | ein Artifact | Model |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | Prüft einen Claim in beide Richtungen gegen Sources: Könnte das Absurde wahr sein, das Offensichtliche falsch? *(nur Lesen → Fix)* | einen Claim | Model |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | Auditiert eine validation auf Leakage: kommt externe Ground Truth wirklich hinein? *(nur Lesen)* | ein Eval | Model |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | Schneidet unsicheren Scope vorab heraus, fährt den sicheren Rest mit voller Leistung und liefert ein Descope-Ledger | eine Aufgabe | Model |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | Kostet nach jeder Änderung dein Ergebnis mit den repo-eigenen clean-and-true Checks | dein Output | Model |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | Weigert sich, nett zu sein: der eine Einwand, der den Plan töten könnte, plus der billigste Test | ein Plan | user |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | Entfernt Gedankenstriche und ihre Doppelgänger und wählt an jeder Stelle die passende Zeichensetzung | deine prose | user |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | Schreibt die Nachricht eines fertigen Commits als saubere v0 neu, damit `git log` allein die Übergabe trägt | ein Commit | user |

### `breadth/`

| Skill | Was er tut | Scope | Invoker |
|---|---|---|---|
| 🔎 **[ssotchk](../../skills/breadth/ssotchk/SKILL.md)** | Findet, wo ein Fact verstreut oder doppelt liegt, und benennt die canonical source *(nur Lesen)* | ein Fact, viele Orte | Model |
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | Konsolidiert sie an einem Ort und lässt den Rest dorthin zeigen | ein Fact, viele Orte | Model |
| 🧰 **[ppt-upgrade](../../skills/breadth/ppt-upgrade/SKILL.md)** | Gleicht alte installierte Paperthin-Skillnamen nach Releases ab | installierte Skillnamen | user |

### `coil/`

| Skill | Was er tut | Scope | Invoker |
|---|---|---|---|
| 🧭 **[retro](../../skills/coil/retro/SKILL.md)** | Extrahiert Lektionen und Anti-Patterns aus einem abgeschlossenen oder gescheiterten cycle | ein abgeschlossener cycle | Model |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | Startet von v0 neu und behält nur Lektionen, die Wiederverwendung verdient haben | ein Neustart | Model |
| 🌀 **[flywheel](../../skills/coil/flywheel/SKILL.md)** | Führt die build → QA → retro → re0-work Schleife aus, damit Lernen komponiert, nicht Code | die ganze Schleife | Model |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | Liest den Live-cyclezustand und gibt die eine nächste beste Aktion zurück, kein Menü *(nur Lesen)* | der laufende cycle | Model |

### `mesh/`

*In Entwicklung - unabhängige Sichtweisen zu Konsens zusammenführen.*

*Mehr zur Invocation: [docs/invocation.md](../invocation.md).*

<a id="the-problem"></a>
## Das Problem

**Die meisten Agent Skills sind Slop.**

Gib einem Agent ein Ziel und er **fügt hinzu**: mehr Dateien, mehr Optionen, mehr "hilfreiches" Boilerplate. Hinzufügen sieht nach Fortschritt aus, und nichts zwingt ihn zurückzugehen und zu löschen.

> [!WARNING]
> Wiederholt man das in einem Projekt, entsteht das bekannte AI-generierte Toolkit: fast doppelte Skills, tote Einstellungen, ein README, das dasselbe dreimal sagt. Plausibel, geschäftig und leise unwartbar.

Diese Skills wetten in die andere Richtung. **Jeder einzelne entfernt etwas:**

- `re0` schreibt einen Entwurf als saubere v0 neu, statt ihn weiter zu flicken.
- `ssotchk` / `ssotize` falten dieselbe Fact zusammen, die über Dateien verstreut ist.
- `shower` schneidet weg, was ein Fremder nicht verfolgen kann.
- `retro` / `re0-work` bewahren die Lektion und lassen den falschen Build sterben.
- `autobahn` schneidet unsicheren Scope vorab heraus, damit der sichere Rest mit voller Geschwindigkeit läuft.
- `dedash` entfernt sogar den Gedankenstrich-Tell und seine Doppelgänger, Stelle für Stelle beurteilt.
- `sip` führt all das automatisch auf deinem eigenen Output aus.

> [!TIP]
> Das Schwere ist nicht, Features hinzuzufügen, sondern Zurückhaltung. Ein pass, der nichts zu verbessern findet, ändert nichts. **Diese Zurückhaltung ist das Produkt.**

<a id="the-fixes"></a>
## Die Fixes

<!-- Fixes follow the lifecycle of a piece of work, not the skill list: keep it clean (draft → read fresh → reconcile across files → automate → ship), keep it true (a single Claim → a validation → the whole plan), then keep the loop learning and the run unblocked. Slot any new fix in by where it acts in that arc. -->

**Jeder ist ein bewährtes Prinzip, automatisiert.**

### #1 - Artifacts verrotten
Bearbeitet man ein Dokument in einer Session Stück für Stück, bläht es sich auf: alte Deltas, doppeltes Rauschen, Changelog-Narben. Noch ein Patch konserviert nur die Fäulnis.

**Der Fix → `re0`:** Das Artifact als saubere v0 neu schreiben, als wäre es die erste Version.

> *Vorarbeit: die Boy Scout Rule - "leave it cleaner than you found it" (Robert C. Martin, [Clean Code](https://www.informit.com/articles/article.aspx?p=1235624&seqNum=6), 2008). `re0` geht weiter: neu schreiben, nicht nur aufräumen.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - wir baten `re0`, diese Docs noch einmal zu erneuern, aber sie waren bereits auf v0.
- **Resultat** - es fand nichts zu verbessern und ließ jede Zeile prose unverändert.
- **Also** - ein tool, das nichts tut, wenn nichts falsch ist, bläht dein Repo nie auf: diese Skills entfernen Rauschen, sie fügen keines hinzu.
</details>

### #2 - Du wirst blind für deine eigene Arbeit
Nach einer langen Session bist du die eine Person, die die eigene Arbeit nicht mehr gerade lesen kann. Du weißt zu viel, also füllt dein Gehirn jede Lücke still auf, und die Löcher werden unsichtbar.

**Der Fix → `shower`:** Gib einem Fremden, der deine Session nie gesehen hat, nur das Artifact und frag: "Ergibt das wirklich Sinn?"

> *Vorarbeit: [egoless programming](https://en.wikipedia.org/wiki/Egoless_programming) - du kannst deine eigene Arbeit nicht objektiv prüfen; jemand anderes muss es tun (Gerald Weinberg, 1971). Hier ist dieser Jemand eine kontextfreie Sub-Session.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - wir gaben `shower` seine eigene Spec an eine Sub-Session mit null Kontext und nur dieser Datei.
- **Resultat** - in Minuten fand sie drei Bugs, die der Autor übersehen hatte:
  - einen Schritt, der die Antwort andeutete, die er verbergen sollte,
  - einen Pfad, der Spoiler-Dateien leakte,
  - einen Scope, der zu vage zum Handeln war.
- **Also** - ein Skill, der seine eigenen Bugs fängt, kann auch deine fangen.
</details>

### #3 - Dieselbe Fact landet überall
Ein Timeout-Wert, eine Entscheidung, ein Status: kopiert in README, Doc, Ticket und Slack-Thread. Die Kopien driften, und niemand weiß mehr, was stimmt.

**Der Fix → `ssotchk` + `ssotize`:** Die Streuung finden, die canonical source benennen, dann konsolidieren und den Rest dorthin zeigen lassen.

> *Vorarbeit: [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) - ein Fact, ein autoritativer Ort (Hunt & Thomas, The Pragmatic Programmer, 1999).*

### #4 - "Denk ans Verifizieren" feuert nie
Eine Richtlinie, die in Docs vergraben ist, wird in einer brandneuen Session nicht auslösen, genau dann, wenn Author Bias am höchsten ist.

**Der Fix → `sip`:** Sobald du etwas abschließt, führt es die Clean-Checks (`shower`, `ssotchk`, `re0`) aus und, wenn es einen Claim oder ein Eval gibt, die True-Checks (`factchk`, `mandela`) automatisch auf deinem Output.

> *Vorarbeit: [dogfooding](https://en.wikipedia.org/wiki/Eating_your_own_dog_food) - eat your own dog food (Microsoft, 1988). Koste dein eigenes Essen, bevor du es servierst.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - direkt nach einem großen ReFactor, der jeden Skill self-contained machte, feuerte `sip` automatisch.
- **Resultat** - seine Fresh-Eyes-Pass fand zwei Dinge, die der Autor nicht mehr sehen konnte: eine Wartungsregel, die noch auf skill-to-skill Links zeigte, die derselbe ReFactor gerade gelöscht hatte, und eine File-Editing-Sicherheitsregel, die in zwei Skills stand, aber in einem dritten fehlte, der ebenfalls Dateien editiert.
- **Also** - der Check beißt dort, wo Bias am höchsten ist: nicht an einem frischen Artifact, sondern an der Drift, die eine große Änderung hinterlässt, genau wo die Augen des Autors wegrutschen.
</details>

### #5 - Deine Session reist nicht; das Git-Log schon
Deine Session bleibt dort stecken, wo sie lief: dieser Agent, dieser Account, diese Maschine. Ein Teamkollege oder ein anderer Agent kann den Kontext deiner Arbeit nicht laden.

**Der Fix → `re0-git`:** Die Nachricht eines fertigen Commits bereinigen, damit `git log`, das eine Ding, das jede Umgebung teilt, die Übergabe trägt, und jeder allein aus dem Log weitermachen kann.

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - das allererste Ziel von `re0-git` war sein eigener Release-Commit.
- **Resultat** - Dogfooding zeigte zwei Fehler, beide behoben:
  - eine Nachricht, aufgepolstert mit Trivia,
  - eine Spec, die "keine Redundanz" predigte und sich dabei wiederholte.
- **Also** - die erste Bereinigung war hinter sich selbst.
</details>

> [!NOTE]
> Die fünf Fixes oben halten ein Artifact **sauber**. Die nächsten drei halten es **wahr**: dasselbe Misstrauen gegenüber dem Autor, angewandt auf die Begründung statt auf die prose.

### #6 - Dein Bauchgefühl ist keine Source
"Plausibel", "absurd", "neu": die unzuverlässigste Zeile in jedem Artifact. Menschliche Priors scheitern **in beide Richtungen**: Sie schließen Reales aus (Wüstenfrösche existieren) und normalisieren Unmögliches (schwerelose Kisten).

**Der Fix → `factchk`:** Jede realitätsgebundene Claim vor dem Shippen in beide Richtungen gegen externe Sources prüfen und markieren, statt zu raten, wenn keine erreichbar ist.

> *Vorarbeit: [WEIRD bias](https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/abs/weirdest-people-in-the-world/BF84F7517D56AFF7B7EB58411A554C17) (Henrich, Heine & Norenzayan, 2010) und [naive-physics / impetus error](https://www.science.org/doi/10.1126/science.210.4474.1139) (McCloskey, Caramazza & Green, 1980) - Intuition verkennt Realität in beide Richtungen.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - wir führten `factchk` in beide Richtungen auf seinen eigenen veröffentlichten Zitaten aus.
- **Resultat** - alle hielten, und trotzdem fand es zwei Zuordnungsfehler: die berühmte "what's measured becomes the target"-Formulierung ist Strathern (1997), nicht Goodhart; und "McCloskey 1980" ist der mitverfasste *Science*-Artikel, nicht das *Scientific American*-Stück von 1983.
- **Also** - ein Fact-Checker, der seine eigenen Fußnoten auditiert, auditiert auch deine.
</details>

### #7 - Das Eval bestätigt sich selbst
Ein Model, ein Scorer und ein Designer können sich alle einig sein, dass ein Ergebnis real ist, während nie externe Ground Truth in die Schleife gelangte. Ein ganzer Raum erinnert sich sicher an etwas, das nie unabhängig passiert ist.

**Der Fix → `mandela`:** Jedes Eval, jede metric, jedes experiment gegen eine 8-Pattern-Leakage-Taxonomie auditieren: kommt externe Ground Truth unabhängig hinein, oder ist der verifier der Designer?

> *Vorarbeit: [Goodhart's law](https://en.wikipedia.org/wiki/Goodhart%27s_law), [data leakage](https://dl.acm.org/doi/10.1145/2382577.2382579) (Kaufman et al., 2012) und [circular analysis](https://www.nature.com/articles/nn.2303), "double dipping" (Kriegeskorte et al., 2009).*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - das Audit wurde aus einem Forschungsdesign destilliert, das immer an einem Fehler starb: Scorer, Model und Designer einigen sich auf ein Ergebnis, das keine äußere Wahrheit je erzeugt hat.
- **Resultat** - Leakage erschien in acht Formen in diesem einen Projekt: ein Scorer bewertet Buckets, die er selbst gezeichnet hat; zwei Komponenten "verifizieren" einander in einem gemeinsamen Raum; ein privates Rezept macht den verifier zum Designer. Dieser Katalog wurde zur 8-Pattern-Taxonomie des Skills.
- **Also** - die Checkliste ist nicht theoretisch: jedes Pattern darin hat schon einmal Blut gezogen.
</details>

### #8 - Du kannst deinen eigenen Plan nicht töten
Du hast ihn gebaut, also verteidigst du ihn. Die Fragen, die ihn brechen würden, sind genau die, die du nicht stellst.

**Der Fix → `hate`:** Nicht nett zum Plan sein. Zurück kommt der eine tragende Einwand, der ihn töten könnte, und das billigste experiment, das zeigt, ob er zählt. user-invoked: du zielst absichtlich mit ihm auf einen Plan.

> *Vorarbeit: [egoless programming](https://en.wikipedia.org/wiki/Egoless_programming) (Weinberg, 1971, dieselbe Wurzel, die `shower` zitiert), hostile review und fail-fast.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - jeder Research-Pass endete mit einem adversarial critic, und sein Urteil war immer eine Root Cause plus der billigste Test, der sie klärt, nie eine Checkliste.
- **Resultat** - er tötete eine Recombination Engine mit "noch eine Box gezeichnet, nicht eine schärfere Spitze", und ein Human-Holdout-Protokoll allein über die Zahlen: n≈24, wo 36 nötig waren, Family-wise Error Rate nahe 34 %, und ein Design, das ein Prinzip zitierte und sein Gegenteil implementierte.
- **Also** - der Einwand, der zählte, war immer einzeln und billig testbar, genau das `{root, first nail}`, das `hate` zurückgeben soll.
</details>

### #9 - Ein laufender Build kann trotzdem das falsche Produkt sein
Lange Agentische cycles produzieren viele laufende Teile: Panels, Routes, Tests, Screenshots. Sie beweisen Aktivität mehr als Wert, und Sunk Cost verführt dazu, die Architektur weiterzutragen. Zwischen Durchläufen verschwimmt der nächste Schritt dann in ein Dutzend aktiver Fäden, und zu viele Optionen werden zur eigenen Lähmung.

**Der Fix → `retro` + `re0-work` + `flywheel` + `nba`:** Lektion, Anti-Pattern und nächstes Gate extrahieren; von einer sauberen v0 neu starten, wenn das Fundament falsch ist; die build → QA → retro → re0-work Schleife laufen lassen; und wenn der Faden verloren ist, den State lesen und die eine nächste beste Aktion zurückgeben. Behalte nur, was Wiederverwendung verdient hat.

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - eine Game-Engine-Demo erreichte einen full-stack, runnable Zustand: API-Routes, Canvas-Runtime, Leaderboard, Arcade-Pages, Remix- und Telemetry-Panels, Tests, Screenshots.
- **Resultat** - und war trotzdem das falsche Produkt: Die generierten Spiele waren Mock, ein Bildschirm, ohne durable Replay Layer, während jeder pass vor einem Haufen unerfüllter Gates und geparkter Fäden mit "what now?" endete.
- **Also** - laufen und ship-förmig sein ist nicht fertig; der cycle braucht einen Skill, der das fehlende Gate benennt, und einen, der den einzigen nächsten Schritt zurückgibt.
</details>

### #10 - Risiko-nahe Arbeit kommt verwässert zurück
Richte einen Agents auf eine Aufgabe, die Guardrails streift, etwa Scraping, Lizenzierung, Privacy oder Security, und du bekommst das Schlechteste aus beiden Welten: der riskante Splitter löst Refusals und Retries aus, während die sicheren 90 % gehedged, verdünnt oder still fehlend zurückkommen.

**Der Fix → `autobahn`:** Guardrail-nahe Punkte vor der Ausführung aus dem Scope schneiden, jeweils mit sicherer Alternative und Archiveintrag; den verbleibenden Scope in einem frischen SubAgenten mit voller Leistung laufen lassen, der nur den carved prompt sieht, nie den riskanten Input; ein Descope-Ledger liefern, damit jede Ausnahme eine sichtbare Entscheidung ist, keine stille Lücke. Es entfernt die Anfrage, statt sie vorbeizuschleusen. Die Autobahn hat kein Tempolimit, **weil** die Einfahrtsdisziplin streng ist.

> *Vorarbeit, direkt aus diesem Sommer: Die USA [suspended Fable 5 and Mythos 5](https://www.anthropic.com/news/fable-mythos-access) wegen eines jailbroken Safeguards (Anthropic, 2026), und OpenAI lieferte [GPT-5.6](https://openai.com/index/previewing-gpt-5-6-sol/) safety-stack-first an vertrauenswürdige Partner (OpenAI, 2026). An der Frontier bleibt die Schnellspur nur so weit offen, wie die Einfahrtsdisziplin hält.*

<details>
<summary><b>[PROOF]</b></summary>

- **Setup** - die Methode stammt aus einer echten Neufassung eines vertraulichen Strategiedokuments, risk-adjacent auf vier Achsen zugleich: stealth tooling, trademarked names, privacy-adjacent profiling, scraping gray zones.
- **Resultat** - eine Main Loop plus zehn SubAgenten liefen mit dem Frontier-Model end-to-end: null Flags, null Refusals, null Fallbacks. Und jede sichere Alternative eines descoped Items erwies sich ohnehin als besseres Produkt.
- **Also** - die Main Loop schnitt heraus, saubere SubAgenten liefen den sicheren Scope, und genau dieser Schnitt ließ sie Vollgas fahren.
</details>

<a id="credits"></a>
## Credits

- **Gebaut auf** [mattpocock/skills](https://github.com/mattpocock/skills) (MIT), seiner Architektur und Philosophie.
- **Kein Fork**: Dies sind [LilMGenius](https://github.com/LilMGenius)' eigene, nicht überlappende Workflows.
- **Vendored verbatim**: einige gemeinsame Bausteine, unverändert mit Sourceszuordnung in [NOTICE](../../NOTICE).
- **Authoring Guide**: Konventionen und Philosophie stehen in [CLAUDE.md](../../CLAUDE.md).
