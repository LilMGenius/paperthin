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
2. **Aus einer erhöhten/Admin-Shell ausführen, wenn dein OS es verlangt**, damit die Skills als Symlinks angelegt werden und sich automatisch aktualisieren, statt kopiert zu werden.
3. **Aktuell bleiben**: `/re0-upgrade` ausführen, wann immer du aktualisieren willst; es aktiviert auch einen leisen Session-Start-Hinweis für neue Skills.
4. **Nutzen**: jeden Skill beim Namen rufen, etwa `/re0`; model-invoked laufen auch von selbst.

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

| Skill | Was er tut | Scope | Invoker | Nur Lesen |
|---|---|---|---|---|
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | Schreibt ein gedriftetes Artifact als saubere v0 neu, statt noch einen Patch daraufzusetzen | ein Artifact | Modell | |
| 🧭 **[readchk](../../skills/depth/readchk/SKILL.md)** | Prüft die Lesart der Anfrage und zeigt nur einen echten verbleibenden Fork | eine Anweisung | Modell | ✔ |
| 🏹 **[aim](../../skills/depth/aim/SKILL.md)** | Liest übergebene Daten und schlägt die zu bestätigende Absicht vor, statt danach zu fragen | eine Datenübergabe | Modell | ✔ |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | Bestimmt die billigste ausreichende Stufe: fast, standard oder frontier | eine Aufgabe | Modell | ✔ |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | Weigert sich, nett zu sein: der eine Einwand, der den Plan töten könnte, plus der billigste Test | ein Plan | Nutzer | |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | Entfernt den Bait, fächert frische Lesarten auf, meldet Divergenz zuerst | eine Richtung | Nutzer | ✔ |
| 🧐 **[feynman](../../skills/depth/feynman/SKILL.md)** | Bohrt bei einer gerade getroffenen Entscheidung nach, bis du sie erklären kannst oder die Lücke markiert ist | eine Entscheidung | Nutzer | ✔ |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | Schneidet unsicheren Scope vorab heraus, fährt den sicheren Rest mit voller Leistung, protokolliert den Descope | eine Aufgabe | Modell | |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | Ersetzt beiläufige Stack-Nomen durch den gemeinten Mechanismus | ein dauerhaftes Artifact | Modell | |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | Entfernt Gedankenstriche und ihre Doppelgänger und wählt an jeder Stelle die passende Zeichensetzung | deine prose | Nutzer | |
| 🔃 **[reorder](../../skills/depth/reorder/SKILL.md)** | Ordnet eine gedriftete Auflistung unter einem genannten Prinzip in eine logische Reihenfolge; verschiebt nur Einträge, formuliert nichts um | eine Auflistung | Nutzer | |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | Liest es kalt, mit frischen Augen und ohne Kontext: steht es für sich? | ein Artifact | Modell | ✔ |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | Prüft, was behauptet wird, in beide Richtungen gegen Sources: Könnte das Absurde wahr sein, das Offensichtliche falsch? | einen Claim | Modell | |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | Auditiert auf Leakage: kommt externe Ground Truth wirklich hinein? | ein Eval | Modell | ✔ |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | Kostet nach jeder Änderung dein Ergebnis mit den repo-eigenen clean-and-true Checks | dein Output | Modell | |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | Schreibt die Nachricht eines fertigen Commits neu, damit `git log` allein die Übergabe trägt | ein Commit | Nutzer | |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | Durchläuft die Shipping- und Releasing-Checkliste, taggt und veröffentlicht nach Bestätigung | ein Release | Nutzer | |
| 🤝 **[re0-merge](../../skills/depth/re0-merge/SKILL.md)** | Prüft einen Beitrag und bringt ihn ins Ziel: kontrolliert den Eingang, behält den Credit des Autors, genehmigt ihn vor dem Schließen, erklärt jede Änderung | einen Beitrag | Nutzer | |

### `breadth/`

| Skill | Was er tut | Scope | Invoker | Nur Lesen |
|---|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | Prüft Streuung, konsolidiert den Fact an einem Ort und lässt den Rest darauf zeigen | ein Fact, viele Orte | Modell | |
| 🧰 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | Bringt installierte Skills mit einem Befehl auf den vollständigen aktuellen Katalog: Umbenanntes ausmustern, Neues hinzufügen, alles vorab bestätigt | deine Skill-Installation | Nutzer | |

### `coil/`

| Skill | Was er tut | Scope | Invoker | Nur Lesen |
|---|---|---|---|---|
| 🗂️ **[re0-plan](../../skills/coil/re0-plan/SKILL.md)** | Öffnet einen neuen Iterationsordner mit DESIGN/WORKFLOW/EVIDENCE, noch vor re0-loops erster Runde | ein neuer cycle | Nutzer | |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | Führt die build → QA → re0-memo → re0-work Schleife aus, damit Lernen komponiert, nicht Code | die ganze Schleife | Modell | |
| 🧭 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | Extrahiert Lektionen und Anti-Patterns aus einem abgeschlossenen oder gescheiterten cycle | ein abgeschlossener cycle | Modell | |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | Startet von v0 neu und behält nur Lektionen, die Wiederverwendung verdient haben | ein Neustart | Modell | |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | Baut den verlorenen Kontext aus dem Live-Zustand wieder auf: was ihn braucht, was sich geändert hat, was neue Begriffe bedeuten | ein Wiedereinstieg | Modell | ✔ |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | Liest den Live-cyclezustand und gibt die eine nächste beste Aktion zurück, kein Menü | der laufende cycle | Modell | ✔ |

### `mesh/`

| Skill | Was er tut | Scope | Invoker | Nur Lesen |
|---|---|---|---|---|
| 🔺 **[prism](../../skills/mesh/prism/SKILL.md)** | Teilt ein Artifact auf unabhängige Blickwinkel auf und gibt zurück, wo sie kollidieren und welche Frage das auflöst | ein Artifact | Nutzer | ✔ |

*Mehr zur Invocation: [docs/invocation.md](../invocation.md).*

<a id="the-problem"></a>
## Das Problem

**Die meisten Agent Skills sind Slop.**

Gib einem Agent ein Ziel und er **fügt hinzu**: mehr Dateien, mehr Optionen, mehr "hilfreiches" Boilerplate. Hinzufügen sieht nach Fortschritt aus, und nichts zwingt ihn zurückzugehen und zu löschen.

> [!WARNING]
> Wiederholt man das in einem Projekt, entsteht das bekannte AI-generierte Toolkit: fast doppelte Skills, tote Einstellungen, ein README, das dasselbe dreimal sagt. Plausibel, geschäftig und leise unwartbar.

Diese Skills wetten in die andere Richtung. **Jeder einzelne entfernt etwas:**

- `re0` schreibt einen Entwurf als saubere v0 neu, statt ihn weiter zu flicken.
- `readchk` formuliert die Anfrage neu und fragt nur, wenn eine echte Weiche übrig bleibt.
- `modelchk` bestimmt die billigste ausreichende Tier, bevor die Arbeit beginnt.
- `macrothink` fächert frische Lesarten auf und meldet Divergenz, bevor Konvergenz wie ein Beweis aussieht.
- `autobahn` schneidet unsicheren Scope vorab heraus, damit der sichere Rest mit voller Geschwindigkeit läuft.
- `detool` ersetzt beiläufige Werkzeugnamen in portablen Inhalten durch den gemeinten Mechanismus.
- `dedash` entfernt sogar den Gedankenstrich-Tell und seine Doppelgänger, Stelle für Stelle beurteilt.
- `shower` schneidet weg, was ein Fremder nicht verfolgen kann.
- `ssotize` prüft verstreute Facts, fragt nach Freigabe und faltet sie dann an einem Ort zusammen.
- `re0-memo` / `re0-work` / `re0-loop` bewahren die Lektion, lassen den falschen Build sterben und halten die Schleife am Laufen.
- `catchup` / `nba` bauen die Landkarte des Menschen aus dem Live-Zustand neu auf und geben dann den einen nächsten Zug zurück.
- `sip` führt all das automatisch auf deinem eigenen Output aus.

> [!TIP]
> Das Schwere ist nicht, Features hinzuzufügen, sondern Zurückhaltung. Ein pass, der nichts zu verbessern findet, ändert nichts. **Diese Zurückhaltung ist das Produkt.**

<a id="the-fixes"></a>
## Die Fixes

Die vollständige Fixes-Erzählung lebt als eine canonical source im [englischen README](../../README.md#the-fixes), damit Proof-Beispiele nicht zwischen Übersetzungen driften. Diese Datei bleibt für Index und lokale Orientierung.

<a id="credits"></a>
## Credits

- **Gebaut auf** [mattpocock/skills](https://github.com/mattpocock/skills) (MIT), seiner Architektur und Philosophie.
- **Kein Fork**: Dies sind [LilMGenius](https://github.com/LilMGenius)' eigene, nicht überlappende Workflows.
- **Vendored verbatim**: einige gemeinsame Bausteine, unverändert mit Sourceszuordnung in [NOTICE](../../NOTICE).
- **Authoring Guide**: Konventionen und Philosophie stehen in [CLAUDE.md](../../CLAUDE.md).
