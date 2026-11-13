<div align="center">

# Paperthin: Low-level Design Patterns für Agents

<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/banner.svg" alt="Paperthin: Agentische Entwurfsmuster auf niedriger Ebene" width="820">

Das Skillbook für rekursive Selbstverbesserung (**RSI**).<br>**NVIDIA**s jüngster Beweis, zerlegt mit zeitloser Ingenieurskunst.<br>Destilliert aus der tastenfreien Methode des Siegers des **OpenAI**-Hackathons für Harness Engineering.

Auf **jedem** Agent | Codex, Claude Code, OpenCode, Cursor, Grok Build, Grok Bot, Muse, Pi, etc.

*"Best part is no part."* Elon Musk[^musk]

**Gebaut von [Bran Lee](https://github.com/LilMGenius)**<br>2026: **OpenAI** Harness-Engineering-Hackathon (Ralphthon Seoul #2, zeitgleich in Seoul und San Francisco), *1. Platz*, das einzige Ein-Personen-Team gegen Teams aus Big Tech und Promovierenden von Spitzenuniversitäten<br>2026: eingeladener Speaker beim offiziellen **Claude Code** Meetup, *zweimal*<br>2026: eingeladener *Juror* beim KI-Hackathon von **Google DeepMind**<br>2014: Landeswettbewerb der Korea-Informatikolympiade (KOI), *Silberpreis*<br>2009~: programmiert seit dem Alter von *9* Jahren

[Schnellstart](#quickstart-30-seconds) · [Die Karte](#the-map) · [Der Index](#the-index) · [Das Problem](#the-problem) · [Der Beweis](#the-proof) · [Credits](#credits)

<sub>Read in: [English](../../README.md) · [中文](./README.zh-CN.md) · [हिन्दी](./README.hi.md) · [Español](./README.es.md) · [العربية](./README.ar.md) · [Português](./README.pt.md) · [Русский](./README.ru.md) · [日本語](./README.ja.md) · [Français](./README.fr.md) · Deutsch · [한국어](./README.ko.md)</sub>

</div>

---

<a id="quickstart-30-seconds"></a>
## Schnellstart (30 Sekunden)

Wähle **einen Weg pro Agent**; wer zwei installiert, lädt jeden Skill doppelt.

1. **Codex**: aktualisiert sich bei jedem Sessionstart selbst.
   ```bash
   codex plugin marketplace add LilMGenius/paperthin && codex plugin add paperthin@paperthin
   ```
2. **Claude Code**:
   ```bash
   claude plugin marketplace add LilMGenius/paperthin && claude plugin install paperthin@paperthin
   ```
   Dann in Claude Code `/plugin` ausführen, **Marketplaces** öffnen, `paperthin` wählen und einmal **Enable auto-update** aktivieren.
3. **Jeder andere Agent**: eine Zeile installiert die Skills samt täglichem Update.
   ```bash
   npx skills@latest add LilMGenius/paperthin --global --agent '*' && node "$HOME/.agents/skills/re0-upgrade/scripts/schedule/schedule.mjs" install
   ```
4. **Loslegen**: tippe `/paperthin` und dann deinen Traum. Das war's. Du willst wissen, wie es funktioniert? Keine Sorge, dafür gibt es `/re0-tutorial`.
5. **Bezahlt wird in Sternen**: Hat es geholfen, kostet es einen [GitHub-Stern](https://github.com/LilMGenius/paperthin). Ein Schnäppchen, ich weiß.

**Schon einmal installiert?** Führe `/re0-upgrade` einmal in einer neuen Session aus.

**Unsicher?** Sag deinem Agent [`install https://github.com/LilMGenius/paperthin`](../../.agents/install-block.md#handed-only-this-repository). Ein Web-Chat bekommt [llms.txt](https://raw.githubusercontent.com/LilMGenius/paperthin/main/llms.txt).

<a id="the-map"></a>
## Die Karte

**Wie viele Artifacts, und über welchen Zeitraum?**

<div align="center">
<img src="https://raw.githubusercontent.com/LilMGenius/paperthin/main/assets/map.svg" alt="Die Paperthin-Karte von LilMGenius/paperthin, eine Zwei-mal-zwei-Matrix. Horizontale Achse: Kardinalität (eins, dann viele); vertikale Achse: Zeit (jetzt, dann über Iterationen); vier Bereiche. Oben links, depth: ein Artifact, jetzt; ist dieses eine Ding sauber und wahr? Oben rechts, breadth: viele Artifacts, jetzt; ist eine Wahrheit überall konsistent? Unten links, coil: ein Projekt, über Iterationen; hat jeder pass den nächsten gelehrt? Unten rechts, mesh: viele Köpfe, über Runden; konvergiert die Menge zur Wahrheit?" width="820">
</div>

<a id="the-index"></a>
## Der Index

### `depth/`

| Skill | Was er tut | Invoker | Nur Lesen |
|---|---|---|---|
| ♻️ **[re0](../../skills/depth/re0/SKILL.md)** | Schreibt ein vielfach geflicktes, unübersichtliches Dokument oder eine Datei als saubere erste Fassung neu, statt erneut zu flicken | Modell | |
| 🗜️ **[debloat](../../skills/depth/debloat/SKILL.md)** | Strafft aufgeblähte Texte oder aufgeblähten Code auf das Tragende, ohne eine Regel oder ein Verhalten zu verlieren | Modell | |
| 🔃 **[re0-order](../../skills/depth/re0-order/SKILL.md)** | Bringt eine durcheinandergeratene Liste nach einer benannten Regel wieder in sinnvolle Ordnung; er verschiebt nur Einträge und ändert kein Wort | Modell | |
| 🧰 **[detool](../../skills/depth/detool/SKILL.md)** | Ersetzt in langlebigen Dokumenten Marken- und Werkzeugnamen durch das, was sie tatsächlich tun, damit die Texte die Werkzeuge überdauern | Modell | |
| 🎨 **[re0-style](../../skills/depth/re0-style/SKILL.md)** | Bringt Code auf den projekteigenen Stil und fragt nach, wo das Projekt selbst zwei Wege nutzt | Modell | |
| ✂️ **[dedash](../../skills/depth/dedash/SKILL.md)** | Entfernt die langen Striche, die ein Agent in Sätze streut, und lässt Bindestriche, Bereiche und Trennstriche in Beschriftungen stehen | Nutzer | |
| ⸱ **[dedot](../../skills/depth/dedot/SKILL.md)** | Schlägt in koreanischen Texten für jeden Mittelpunkt, der eine Aufzählung verbindet, mit Begründung ein Komma oder ein Bindewort vor | Nutzer | ✔ |
| 🧭 **[readback](../../skills/depth/readback/SKILL.md)** | Prüft vor der Arbeit, ob er deine Anfrage richtig verstanden hat, und fragt nur nach, wenn zwei Lesarten wirklich auseinandergehen | Modell | ✔ |
| 🏹 **[aim](../../skills/depth/aim/SKILL.md)** | Liest die Dateien oder den Text, die du übergibst, und schlägt vor, was du vermutlich willst; du bestätigst nur noch | Modell | ✔ |
| 📏 **[modelchk](../../skills/depth/modelchk/SKILL.md)** | Wählt die günstigste Modellstufe und Denktiefe, mit denen die Aufgabe noch gut gelingt | Modell | ✔ |
| 🧹 **[elon](../../skills/depth/elon/SKILL.md)** | Schlägt vor, Anforderungen und laufende Vorhaben zu streichen oder zu verschieben, die nur aus Gewohnheit bestehen, und nennt jeweils ihre Herkunft; von außen gesetzte Regeln bleiben unberührt | Modell | ✔ |
| 🧩 **[scopechk](../../skills/depth/scopechk/SKILL.md)** | Prüft am selbst beschriebenen Umfang des Ziels, ob ein neues Teil dorthin gehört, wo du es ablegen willst, und nennt sonst einen besseren Platz | Modell | ✔ |
| 😈 **[hate](../../skills/depth/hate/SKILL.md)** | Spielt den gnadenlosen Kritiker: der eine Einwand, der deinen Plan versenken könnte, und der billigste Test, der ihn klärt | Nutzer | |
| 🧠 **[macrothink](../../skills/depth/macrothink/SKILL.md)** | Stellt die Frage ohne deine Rahmung mehreren frischen Blicken und zeigt zuerst, wo sie sich widersprechen | Nutzer | ✔ |
| 🔀 **[crossthink](../../skills/depth/crossthink/SKILL.md)** | Wenn alle Optionen gleich aussehen, borgt er bewährte Ideen aus fünf oder mehr fernen Fachgebieten und behält nur die neuen | Modell | ✔ |
| ⚖️ **[re0-decide](../../skills/depth/re0-decide/SKILL.md)** | Macht aus den Unterlagen einer Entscheidung eine Checkliste, deren Urteil aus deinen eigenen Antworten folgt; die Wahl trifft er nie für dich | Nutzer | ✔ |
| 🧐 **[whychk](../../skills/depth/whychk/SKILL.md)** | Hakt bei einer eben getroffenen Entscheidung nach, bis du sie erklären kannst, oder zeigt die Lücke im Gedankengang | Nutzer | ✔ |
| 🛣️ **[autobahn](../../skills/depth/autobahn/SKILL.md)** | Legt riskante Teile einer Aufgabe samt sichereren Alternativen zuerst beiseite, erledigt den Rest mit voller Kraft und hält fest, was wegfiel | Modell | |
| 🥄 **[sip](../../skills/depth/sip/SKILL.md)** | Lässt direkt nach jeder Änderung, bevor du sie für fertig erklärst, die eigenen Prüfungen von paperthin über dein Ergebnis laufen | Modell | |
| 🚿 **[shower](../../skills/depth/shower/SKILL.md)** | Gibt deine Arbeit einem frischen Leser ohne jeden Hintergrund und fragt, ob sie für sich allein verständlich ist | Modell | ✔ |
| 🔬 **[factchk](../../skills/depth/factchk/SKILL.md)** | Gleicht Behauptungen in beide Richtungen mit echten Quellen ab: Das Absurde kann stimmen, das Offensichtliche falsch sein | Modell | |
| 🧪 **[mandela](../../skills/depth/mandela/SKILL.md)** | Prüft, ob ein Test oder eine Kennzahl sich selbst benotet oder ob eine echte äußere Wahrheit über das Ergebnis entscheidet | Modell | ✔ |
| 🎭 **[demock](../../skills/depth/demock/SKILL.md)** | Findet im laufenden Code Attrappen und stille Ausweichwege, die eine Erfolgsmeldung zur Lüge machen, und schlägt die echte Lösung vor | Modell | |
| 🥸 **[deid](../../skills/depth/deid/SKILL.md)** | Findet die Daten einer Person oder Firma in geteilten Dateien, ersetzt sie durch die Rolle, die sie spielen, und listet die alten Commits auf, die sie noch enthalten | Modell | |
| 🧾 **[re0-git](../../skills/depth/re0-git/SKILL.md)** | Schreibt die Nachricht eines fertigen Commits neu und behält Datum und Platz, sodass jeder allein anhand der Historie übernehmen kann | Nutzer | |
| 🚀 **[re0-release](../../skills/depth/re0-release/SKILL.md)** | Arbeitet die Release-Checkliste ab, setzt nach deiner Bestätigung das Tag und veröffentlicht | Nutzer | |
| 🤝 **[re0-merge](../../skills/depth/re0-merge/SKILL.md)** | Prüft und übernimmt den Beitrag einer anderen Person, wahrt ihre Urheberschaft und erklärt jede Änderung daran | Nutzer | |
| 🧨 **[re0-squash](../../skills/depth/re0-squash/SKILL.md)** | Veröffentlicht ein GitHub-Repository als einen einzigen signierten Commit mit denselben Dateien neu, sodass kein alter Commit mehr erreichbar bleibt | Nutzer | |

### `breadth/`

| Skill | Was er tut | Invoker | Nur Lesen |
|---|---|---|---|
| 🧲 **[ssotize](../../skills/breadth/ssotize/SKILL.md)** | Findet eine Tatsache, die an vielen Stellen kopiert steht, gibt ihr nach deiner Freigabe ein Zuhause und lässt den Rest darauf verweisen | Modell | |
| 🔗 **[ssotize-local](../../skills/breadth/ssotize-local/SKILL.md)** | Führt doppelte Dateien oder Ordner zu einer echten Kopie zusammen, auf die die übrigen verlinken, mit einem erprobten Rückweg | Modell | |
| 📖 **[re0-readme](../../skills/breadth/re0-readme/SKILL.md)** | Sortiert die Zeilen einer README und ihrer AGENTS.md so, dass jede in der Datei des Lesers steht, der sie braucht | Modell | |
| 📥 **[re0-import](../../skills/breadth/re0-import/SKILL.md)** | Legt übergebenes Material nach den Regeln einer bestehenden Wissensbasis auf der passenden Seite ab und meldet, was keinen Platz findet | Nutzer | |
| 🆙 **[re0-upgrade](../../skills/breadth/re0-upgrade/SKILL.md)** | Bringt deine Installation in einem bestätigten Schritt auf den vollen aktuellen Katalog: entfernt umbenannte Skills und fügt neue hinzu | Nutzer | |

### `coil/`

| Skill | Was er tut | Invoker | Nur Lesen |
|---|---|---|---|
| 🚪 **[paperthin](../../skills/coil/paperthin/SKILL.md)** | Der einzige Befehl, den du dir merken musst: schreib deinen Traum dahinter | Nutzer | |
| 🪜 **[re0-workflow](../../skills/coil/re0-workflow/SKILL.md)** | Wählt für ein Ziel, welche Skills in welcher Reihenfolge laufen, zeigt sie dir, startet sie und hält dort an, wo du gefragt bist | Modell | |
| 📝 **[re0-memo](../../skills/coil/re0-memo/SKILL.md)** | Zieht aus einem abgeschlossenen oder gescheiterten Zyklus die Lehren und die Fehler, die man meiden sollte | Modell | |
| 🔁 **[backprop](../../skills/coil/backprop/SKILL.md)** | Trägt die Lehre aus einer Korrektur zurück in die Dokumente und Regeln, die den Fehler verursacht haben, und räumt sie auf | Modell | |
| 🧱 **[re0-work](../../skills/coil/re0-work/SKILL.md)** | Fängt bei null an und nimmt nur die Lehren mit, die sich als wiederverwendbar erwiesen haben | Modell | |
| 🗺️ **[catchup](../../skills/coil/catchup/SKILL.md)** | Bringt dich nach einer Pause auf Stand: was auf dich wartet, was sich geändert hat und was neue Begriffe bedeuten | Modell | ✔ |
| 🎯 **[nba](../../skills/coil/nba/SKILL.md)** | Liest, wo die Arbeit steht, und nennt den einen besten nächsten Schritt statt einer Auswahlliste | Modell | ✔ |
| 🗂️ **[re0-plan](../../skills/coil/re0-plan/SKILL.md)** | Legt vor einem neuen Arbeitszyklus seinen Ordner mit den Dateien für Entwurf, Ablauf und Belege an | Nutzer | |
| 🌀 **[re0-loop](../../skills/coil/re0-loop/SKILL.md)** | Hält den Kreislauf aus Bauen, Testen, Lernen und Neustarten in Gang, damit sich Lehren ansammeln statt Code | Modell | |
| 👁️ **[re0-watch](../../skills/coil/re0-watch/SKILL.md)** | Achtet darauf, ob ein langer Agent-Job hängt, und warnt dich; jede Reparatur ist nur ein Vorschlag, den du freigibst | Nutzer | |
| 🎓 **[re0-tutorial](../../skills/coil/re0-tutorial/SKILL.md)** | Lehrt einen Skill in drei bewerteten Stufen, jede bestanden mit Arbeit, die du selbst einreichst | Nutzer | |

### `mesh/`

| Skill | Was er tut | Invoker | Nur Lesen |
|---|---|---|---|
| 🕸️ **[multithink](../../skills/mesh/multithink/SKILL.md)** | Wägt mehrere unabhängige Meinungen nach den Belegen ab, die sie anführen, nie nach der Zahl der Zustimmenden | Nutzer | ✔ |

*Mehr zur Invocation: [.agents/invocation.md](../../.agents/invocation.md).*

<a id="the-problem"></a>
## Das Problem

**Die meisten Agent Skills sind Slop.**

Gib einem Agent ein Ziel und er **fügt hinzu**: mehr Dateien, mehr Optionen, mehr "hilfreiches" Boilerplate. Hinzufügen sieht nach Fortschritt aus, und nichts zwingt ihn zurückzugehen und zu löschen.

> [!WARNING]
> Wiederholt man das in einem Projekt, entsteht das bekannte AI-generierte Toolkit: fast doppelte Skills, tote Einstellungen, eine Markdown-Datei, die dasselbe dreimal sagt. Plausibel, geschäftig und leise unwartbar.

Diese Skills setzen aufs Gegenteil: **jeder entfernt etwas**, und [der Index](#the-index) sagt, was.

> [!TIP]
> Das Schwere ist nicht, Features hinzuzufügen, sondern Zurückhaltung. Ein pass, der nichts zu verbessern findet, ändert nichts. **Diese Zurückhaltung ist das Produkt.**

<a id="the-proof"></a>
## Der Beweis

**NVIDIA hat es gemessen: Ein Agent, der seinen langen Verlauf fallen lässt und mit einer kurzen Notiz arbeitet, hält seine Punktzahl.**

| Was NVIDIA gemessen hat | Langer Kontext | Kurze Notiz |
|---|---|---|
| SWE-bench Verified, Claude Opus 4.5 | 70.0 | 70.2 |
| Größter Kontext, den der Lauf brauchte | 200K Tokens | 16K Tokens |
| Serving-Durchsatz offener Gewichte, H100 | 256K-Fenster | bis zu 7x höher bei 16K |

<sub>Belcak et al. (NVIDIA), [You don't need long context](https://arxiv.org/abs/2611.05306), arXiv 2611.05306, 2026-11-03. Zeile eins und zwei stammen aus Tabelle 2: Opus 4.5 handelt Schritt für Schritt auf einer Zustandsnotiz. Zeile drei stammt aus Abbildung 1 (GLM 5.2 3,6x, Kimi K2.6 5,6x, Qwen 3 Coder Next 7x).</sub>

**Welcher Paperthin-Skill jede Erkenntnis übernimmt:**

| Was das Paper fand | Skills, die danach handeln |
|---|---|
| Lange Arbeit braucht keinen langen Kontext: Ist das Gespräch voll, schreibt man eine Notiz und macht in einem neuen weiter | `re0-work` startet bei v0 neu, nur mit bewährten Lektionen, `re0-git` hinterlässt die Übergabe im Git-Verlauf für die nächste Sitzung |
| Eine gute Notiz hält die Aufgabe nah an ihrem ursprünglichen Wortlaut | `re0-loop` hält jede offene Anfrage auf der Liste, wenn die Sitzung verdichtet wird oder neu beginnt |
| Eine gute Notiz hält fest, was gerade läuft, warum und was als Nächstes kommt | `re0-memo` macht aus einem abgeschlossenen Zyklus das Tor des nächsten, `nba` nennt den nächsten Schritt |
| Eine gute Notiz hält Plan, Abschlussbedingungen und Fundorte fest | `re0-plan` eröffnet den Zyklus mit Design-, Ablauf- und Nachweisdateien, `re0-workflow` schreibt die Reihenfolge der Skills auf |
| Eine Aktion nach der anderen auf einer Zustandsnotiz hält die volle Punktzahl | `shower` gibt die Notiz allein einem Leser ohne Vorgeschichte und fragt, ob sie für sich steht |
| Ein kleineres Fenster liefert bis zu 7x schneller | `elon` streicht, was nur aus Gewohnheit bleibt, `debloat` kürzt auf das Tragende, `re0` schreibt neu, statt Flicken zu stapeln |

<a id="credits"></a>
## Credits

- **Gebaut auf** [mattpocock/skills](https://github.com/mattpocock/skills) (MIT), seiner Architektur und Philosophie.
- **Kein Fork**: Dies sind [LilMGenius](https://github.com/LilMGenius)' eigene, nicht überlappende Workflows.
- **Vendored verbatim**: einige gemeinsame Bausteine, unverändert mit Sourceszuordnung in [NOTICE](../../NOTICE).
- **Authoring Guide**: Konventionen und Philosophie stehen in [AGENTS.md](../../AGENTS.md).

[^musk]: Elon Musk, [Antwort auf X](https://x.com/elonmusk/status/2103537444910248312), 2026-09-25, an @Erdayastronaut dazu, dass SpaceX eine Gitterflosse vom V3-Booster gestrichen hat; gemeint ist „das beste Teil ist gar kein Teil“. Er sprach über Ingenieurskunst, nicht über Paperthin.
