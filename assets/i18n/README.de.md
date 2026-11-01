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

Wähle **einen Weg pro Agent**; wer zwei installiert, lädt jeden Skill doppelt.

1. **Claude Code**:
   ```bash
   claude plugin marketplace add LilMGenius/paperthin && claude plugin install paperthin@paperthin
   ```
   Dann `/plugin` ausführen, **Marketplaces** öffnen, `paperthin` wählen und einmal **Enable auto-update** aktivieren.
2. **Codex**: aktualisiert sich bei jedem Sessionstart selbst.
   ```bash
   codex plugin marketplace add LilMGenius/paperthin && codex plugin add paperthin@paperthin
   ```
3. **Jeder andere Agent**: eine Zeile installiert die Skills samt täglichem Update.
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*' && node "$HOME/.agents/skills/re0-upgrade/scripts/schedule/schedule.mjs" install
   ```
4. **Loslegen**: ruf jeden Skill beim Namen, etwa `/re0`. Viele starten auch von selbst, wenn die Arbeit es verlangt.

**Schon einmal installiert?** Führe `/re0-upgrade` einmal in einer neuen Session aus.

**Unsicher?** Sag deinem Agent `install https://github.com/LilMGenius/paperthin`, dann folgt er selbst den [Installationsschritten](../../.agents/install-block.md#handed-only-this-repository).

**ChatGPT oder Claude im Browser?** Gib ihm `https://raw.githubusercontent.com/LilMGenius/paperthin/main/llms-full.txt`.

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
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | Schreibt ein vielfach geflicktes, unübersichtliches Dokument oder eine Datei als saubere erste Fassung neu, statt erneut zu flicken | ein Artifact | Modell | |
| 🧭 **[readback](../../skills/depth/readback/SKILL.md)** | Prüft vor der Arbeit, ob er deine Anfrage richtig verstanden hat, und fragt nur nach, wenn zwei Lesarten wirklich auseinandergehen | eine Anweisung | Modell | ✔ |
| 🏹 **[aim](../../skills/depth/aim/SKILL.md)** | Liest die Dateien oder den Text, die du übergibst, und schlägt vor, was du vermutlich willst; du bestätigst nur noch | eine Datenübergabe | Modell | ✔ |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | Wählt die günstigste Modellstufe und Denktiefe, mit denen die Aufgabe noch gut gelingt | eine Aufgabe | Modell | ✔ |
| 🧹 **[elon](../../skills/depth/elon/SKILL.md)** | Schlägt vor, Anforderungen zu streichen, die nur aus Gewohnheit bestehen, und nennt jeweils ihre Herkunft; von außen gesetzte Regeln bleiben unberührt | noch nicht umgesetzte Anforderungen mit ihren Quellen | Modell | ✔ |
| 🧩 **[scopechk](../../skills/depth/scopechk/SKILL.md)** | Prüft am selbst beschriebenen Umfang des Ziels, ob ein neues Teil dorthin gehört, wo du es ablegen willst, und nennt sonst einen besseren Platz | ein Element und das Ziel, dem es beitreten soll | Modell | ✔ |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | Spielt den gnadenlosen Kritiker: der eine Einwand, der deinen Plan versenken könnte, und der billigste Test, der ihn klärt | ein Plan | Nutzer | |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | Stellt die Frage ohne deine Rahmung mehreren frischen Blicken und zeigt zuerst, wo sie sich widersprechen | eine Richtung | Nutzer | ✔ |
| 🔀 **[crossthink](../../skills/depth/crossthink/SKILL.md)** | Wenn alle Optionen gleich aussehen, borgt er bewährte Ideen aus fünf oder mehr fernen Fachgebieten und behält nur die neuen | ein festgefahrenes Problem | Modell | ✔ |
| ⚖️ **[re0-decide](../../skills/depth/re0-decide/SKILL.md)** | Macht aus den Unterlagen einer Entscheidung eine Checkliste, deren Urteil aus deinen eigenen Antworten folgt; die Wahl trifft er nie für dich | zur Entscheidung vorgelegtes Material | Nutzer | ✔ |
| 🧐 **[whychk](../../skills/depth/whychk/SKILL.md)** | Hakt bei einer eben getroffenen Entscheidung nach, bis du sie erklären kannst, oder zeigt die Lücke im Gedankengang | eine Entscheidung | Nutzer | ✔ |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | Legt riskante Teile einer Aufgabe samt sichereren Alternativen zuerst beiseite, erledigt den Rest mit voller Kraft und hält fest, was wegfiel | eine Aufgabe | Modell | |
| 🎨 **[re0-style](../../skills/depth/re0-style/SKILL.md)** | Gleicht Code mit dem projekteigenen Stil ab; standardmäßig ändert er nichts und liefert einen kurzen Bericht | eine Änderung im Review | Modell | |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | Ersetzt in langlebigen Dokumenten Marken- und Werkzeugnamen durch das, was sie tatsächlich tun, damit die Texte die Werkzeuge überdauern | ein dauerhaftes Artifact | Modell | |
| 🗜️ **[debloat](../../skills/depth/debloat/SKILL.md)** | Strafft aufgeblähte Texte oder aufgeblähten Code auf das Tragende, ohne eine Regel oder ein Verhalten zu verlieren | ein Artefakt, Prosa oder Code | Modell | |
| 🔃 **[re0-order](../../skills/depth/re0-order/SKILL.md)** | Bringt eine durcheinandergeratene Liste nach einer benannten Regel wieder in sinnvolle Ordnung; er verschiebt nur Einträge und ändert kein Wort | eine Auflistung | Modell | |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | Entfernt die langen Striche, die ein Agent in Sätze streut, und lässt Bindestriche, Bereiche und Trennstriche in Beschriftungen stehen | deine prose | Nutzer | |
| ⸱ **[dedot](../../skills/depth/dedot/SKILL.md)** | Schlägt in koreanischen Texten für jeden Mittelpunkt, der eine Aufzählung verbindet, mit Begründung ein Komma oder ein Bindewort vor | vom Autor eingegrenzte koreanische Prosa oder Label-Zeilen | Nutzer | ✔ |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | Gibt deine Arbeit einem frischen Leser ohne jeden Hintergrund und fragt, ob sie für sich allein verständlich ist | ein Artifact | Modell | ✔ |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | Gleicht Behauptungen in beide Richtungen mit echten Quellen ab: Das Absurde kann stimmen, das Offensichtliche falsch sein | einen Claim | Modell | |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | Prüft, ob ein Test oder eine Kennzahl sich selbst benotet oder ob eine echte äußere Wahrheit über das Ergebnis entscheidet | ein Eval | Modell | ✔ |
| 🎭 **[demock](../../skills/depth/demock/SKILL.md)** | Findet im laufenden Code Attrappen und stille Ausweichwege, die eine Erfolgsmeldung zur Lüge machen, und schlägt die echte Lösung vor | benannte Dateien, ein Verzeichnis oder ein Diff | Modell | |
| 🥸 **[deid](../../skills/depth/deid/SKILL.md)** | Findet die Daten einer Person oder Firma in geteilten Dateien, ersetzt sie durch die Rolle, die sie spielen, und listet die alten Commits auf, die sie noch enthalten | ein benanntes Artefakt und ein Eigentümer | Modell | |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | Lässt direkt nach jeder Änderung, bevor du sie für fertig erklärst, die Prüfungen der Sammlung selbst über dein Ergebnis laufen | dein Output | Modell | |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | Schreibt die Nachricht eines fertigen Commits neu und behält Datum und Platz, sodass jeder allein anhand der Historie übernehmen kann | ein Commit | Nutzer | |
| 🧨 **[re0-squash](../../skills/depth/re0-squash/SKILL.md)** | Veröffentlicht ein GitHub-Repository als einen einzigen signierten Commit mit denselben Dateien neu, sodass kein alter Commit mehr erreichbar bleibt | ein Repository | Nutzer | |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | Arbeitet die Release-Checkliste ab, setzt nach deiner Bestätigung das Tag und veröffentlicht | ein Release | Nutzer | |
| 🤝 **[re0-merge](../../skills/depth/re0-merge/SKILL.md)** | Prüft und übernimmt den Beitrag einer anderen Person, wahrt ihre Urheberschaft und erklärt jede Änderung daran | einen Beitrag | Nutzer | |

### `breadth/`

| Skill | Was er tut | Scope | Invoker | Nur Lesen |
|---|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | Findet eine Tatsache, die an vielen Stellen kopiert steht, gibt ihr nach deiner Freigabe ein Zuhause und lässt den Rest darauf verweisen | ein Fact, viele Orte | Modell | |
| 🔗 **[ssotize-local](../../skills/breadth/ssotize-local/SKILL.md)** | Führt doppelte Dateien oder Ordner zu einer echten Kopie zusammen, auf die die übrigen verlinken, mit einem erprobten Rückweg | dieselben Bytes, viele Pfade | Modell | |
| 📖 **[re0-readme](../../skills/breadth/re0-readme/SKILL.md)** | Sortiert die Zeilen einer README und ihrer AGENTS.md so, dass jede in der Datei des Lesers steht, der sie braucht | README und AGENTS.md eines Repositorys | Modell | |
| 📥 **[re0-import](../../skills/breadth/re0-import/SKILL.md)** | Legt übergebenes Material nach den Regeln einer bestehenden Wissensbasis auf der passenden Seite ab und meldet, was keinen Platz findet | übergebenes Material und eine Wissensbasis | Nutzer | |
| 🆙 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | Bringt deine Installation in einem bestätigten Schritt auf den vollen aktuellen Katalog: entfernt umbenannte Skills und fügt neue hinzu | deine Skill-Installation | Nutzer | |

### `coil/`

| Skill | Was er tut | Scope | Invoker | Nur Lesen |
|---|---|---|---|---|
| 🗂️ **[re0-plan](../../skills/coil/re0-plan/SKILL.md)** | Legt vor einem neuen Arbeitszyklus seinen Ordner mit den Dateien für Entwurf, Ablauf und Belege an | ein neuer cycle | Nutzer | |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | Hält den Kreislauf aus Bauen, Testen, Lernen und Neustarten in Gang, damit sich Lehren ansammeln statt Code | die ganze Schleife | Modell | |
| 👁️ **[re0-watch](../../skills/coil/re0-watch/SKILL.md)** | Achtet darauf, ob ein langer Agent-Job hängt, und warnt dich; jede Reparatur ist nur ein Vorschlag, den du freigibst | ein laufender Auftrag | Nutzer | |
| 📝 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | Zieht aus einem abgeschlossenen oder gescheiterten Zyklus die Lehren und die Fehler, die man meiden sollte | ein abgeschlossener cycle | Modell | |
| 🔁 **[backprop](../../skills/coil/backprop/SKILL.md)** | Trägt die Lehre aus einer Korrektur zurück in die Dokumente und Regeln, die den Fehler verursacht haben, und räumt sie auf | eine Lehre | Modell | |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | Fängt bei null an und nimmt nur die Lehren mit, die sich als wiederverwendbar erwiesen haben | ein Neustart | Modell | |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | Bringt dich nach einer Pause auf Stand: was auf dich wartet, was sich geändert hat und was neue Begriffe bedeuten | ein Wiedereinstieg | Modell | ✔ |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | Liest, wo die Arbeit steht, und nennt den einen besten nächsten Schritt statt einer Auswahlliste | der laufende cycle | Modell | ✔ |
| 🪜 **[re0-workflow](../../skills/coil/re0-workflow/SKILL.md)** | Empfiehlt für ein Ziel, welche Skills in welcher Reihenfolge laufen sollen, ohne sie zu starten | eine erklärte Absicht | Modell | ✔ |
| 🎓 **[re0-tutorial](../../skills/coil/re0-tutorial/SKILL.md)** | Lehrt einen Skill in drei bewerteten Stufen, jede bestanden mit Arbeit, die du selbst einreichst | eine Fertigkeit | Nutzer | |

### `mesh/`

| Skill | Was er tut | Scope | Invoker | Nur Lesen |
|---|---|---|---|---|
| 🕸️ **[multithink](../../skills/mesh/multithink/SKILL.md)** | Wägt mehrere unabhängige Meinungen nach den Belegen ab, die sie anführen, nie nach der Zahl der Zustimmenden | viele Lesarten eines Artifacts oder einer Frage | Nutzer | ✔ |

*Mehr zur Invocation: [.agents/invocation.md](../../.agents/invocation.md).*

<a id="the-problem"></a>
## Das Problem

**Die meisten Agent Skills sind Slop.**

Gib einem Agent ein Ziel und er **fügt hinzu**: mehr Dateien, mehr Optionen, mehr "hilfreiches" Boilerplate. Hinzufügen sieht nach Fortschritt aus, und nichts zwingt ihn zurückzugehen und zu löschen.

> [!WARNING]
> Wiederholt man das in einem Projekt, entsteht das bekannte AI-generierte Toolkit: fast doppelte Skills, tote Einstellungen, ein README, das dasselbe dreimal sagt. Plausibel, geschäftig und leise unwartbar.

Diese Skills setzen aufs Gegenteil: **jeder entfernt etwas**, und [der Index](#the-index) sagt, was.

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
- **Authoring Guide**: Konventionen und Philosophie stehen in [AGENTS.md](../../AGENTS.md).
