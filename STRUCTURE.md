# Struktur – BZWU Milchtechnologie Lerntools

Diese Datei definiert die kanonischen Namen für Module, Tool-Typen und Ordner.
**Immer hier nachschauen bevor eine neue Kachel oder ein neues Tool erstellt wird.**

---

## Ordnerstruktur

```
/
├── index.html                          ← Startseite mit Filter-Pills
├── style.css                           ← Gemeinsames Design-System (BZWU Grundbildung)
├── STRUCTURE.md                        ← Diese Datei
├── assets/
│   ├── dnd.js                           ← Gemeinsamer Touch-Drag&Drop-Layer (MTDnD)
│   ├── lernsession-engine.js            ← HUD/XP/Streak/Navigation für lernsession-*.html
│   ├── zuordnung3.js                    ← 3-Stufen-Muster (Zuordnung3.karten / Zuordnung3.wortbank)
│   ├── zellen-zuordnung.js              ← Drag-in-Tabellenzelle (tabellen-luecken-*, zuordnung-verordnungen)
│   ├── wahr-falsch-swipe.js             ← Tinder-Swipe-Engine (MTWahrFalsch)
│   ├── anlagenteile-engine.js           ← Zuordnung Anlagenteile (b7, geruehrt/stichfest)
│   ├── quiz-engine.js                   ← Multiple-Choice-Quiz (MTQuiz)
│   ├── lernkaertchen-engine.js          ← Flip-Karten + Richtig/Falsch-Bestätigung (MTFlashcards)
│   └── logos/
│       ├── bzwu.png                    ← BZWU-Logo (weisser Hintergrund)
│       └── milchtechnologen.svg        ← Branchenlogo
├── b1-hartkaese/
│   ├── images/
│   │   └── aop-memory/                 ← 12 PNG/JPEG (Schweizer AOP-Käse)
│   ├── lernsession-sbrinz.html            ← Lernpfad (Standard) / Challenge (?mode=challenge)
│   ├── lernsession-emmentaler.html        ← Lernpfad (Standard) / Challenge (?mode=challenge)
│   ├── memory-aop-kaese.html
│   ├── quiz-gesetzliches-kaese.html
│   ├── tabellen-luecken-vlth-artikel.html
│   ├── zuordnung-verordnungen.html
│   └── animation-wasserzusatz-teigelastizitaet.html
├── b5-quark/
│   └── animation-labgerinnung.html
├── b7-sauermilch/
│   ├── images/
│   │   ├── b.7_Anlage_stichfest_Nummern.png
│   │   └── b.7_Anlage_geruehrt_Nummern.png
│   ├── lernkaertchen.html
│   ├── qualitaetsmaengel-jogurt.html
│   ├── quiz-qualitaetsmaengel.html
│   ├── quiz-gesetzliches.html
│   ├── sortierer-jogurtherstellung.html
│   ├── zuordnung-anlagenteile-stichfest.html
│   ├── zuordnung-anlagenteile-geruehrt.html
│   ├── lueckentext-saeuregerinnung.html
│   ├── lueckentext-symbiose-kultur.html
│   ├── fachrechner-mischungskreuz.html
│   ├── wahr-falsch-sauermilch.html
│   ├── tabellen-luecken-kulturen.html
│   ├── tabellen-luecken-richtwerte.html
│   ├── prozessvergleich-jogurt.html
│   ├── prozess-entscheid-jogurt.html
│   ├── fliessschema-stichfest.html
│   ├── lernsession-pruefung-jogurt.html   ← Lernpfad (Standard) / Challenge (?mode=challenge)
│   └── animation-sauergerinnung.html
├── a1-rohstoffe/
│   ├── images/
│   │   ├── milchsammelwagen/           ← 2 PNG (mit/ohne Nummern)
│   │   └── MID/                        ← 2 PNG (mit/ohne Nummern)
│   ├── milchsammelwagen-beschriften.html  ← 3-Stufen-Tool (Einfach/Mittel/Schwer)
│   ├── mid-beschriften.html               ← 3-Stufen-Tool (Einfach/Mittel/Schwer)
│   ├── milchinhaltsstoffe-zuordnen.html
│   ├── baukasten-milchfett.html           ← Triglycerid aus Glycerin + 3 Fettsäuren zusammenbauen
│   ├── zuordnung-eiweisse.html
│   └── wahr-falsch-milchbestandteile.html
├── a2-rohstoffe-trennen/
│   ├── images/
│   │   └── trommelbestandteile/        ← 11 PNG-Bilder
│   ├── memory-trommelbestandteile.html
│   └── zuordnung-trommelbestandteile.html
├── a7-technische-einrichtungen/
│   ├── images/                         ← Ölbrenner, Dreizugdampfkessel, Warmwasseranlage (je mit/ohne Nummern)
│   ├── tabellen-luecken-metalle.html
│   ├── quiz-werkstoffe-schmierstoffe.html
│   ├── beschriften.html                  ← 3-Stufen-Tool; ?set=oelbrenner|dampfkessel|warmwasser
│   ├── zuordnung-dampfkessel-gefahren.html ← 3 Stufen (Einfach/Mittel/Schwer); Gefahrenquelle → Ursache & Sofortmassnahme
│   ├── wahr-falsch-dampfkessel.html      ← 12 Aussagen, Swipe-Karten
│   ├── lernsession-waermeerzeugung.html  ← Lernpfad (Standard) / Challenge (?mode=challenge)
│   └── lernsession-kaelteanlagen.html    ← Lernpfad (Standard) / Challenge (?mode=challenge)
├── a8-kulturen/
│   ├── images/
│   │   ├── a.8_Bakterienzelle_leer.png
│   │   ├── a.8_Phage_unbeschriftet.png    ← Beschriften-Station in lernsession-pruefung-kulturen.html
│   │   └── a.8_Phage_beschriftet.png      ← Lösungsbild dazu
│   ├── hotspot-bakterienzelle.html
│   ├── hotspot-lebensphasen.html          ← trotz Namen: Zuordnung (Drag & Drop), 2 Stufen: Einfach (Phasen an Wachstumskurve) / Schwer (Merkmale an Phase)
│   ├── tabellen-luecken-kuehlung.html
│   ├── tabellen-luecken-kontrolle.html
│   ├── zuordnung-hauptaufgaben-milchsaeure.html ← 3-Stufen-Tool (Zuordnung3.karten): Einfach=5 Definitionen zuordnen (Ziele kennen), Mittel=9 Beispiele zuordnen, Schwer=Freitext + Musterantwort; deckt Lernziel + Prüfungsaufgabe 13/14 ab
│   ├── tabellen-luecken-milchsaeuregaerung.html
│   ├── quiz-abweichungen-phagen.html
│   ├── zuordnung-vermehrungszyklus.html   ← 3 Stufen (Einfach=Wahr/Falsch, Mittel=Diagramm beschriften mit exakten %-Zonen über den Ellipsen, Schwer=lytisch/lysogen sortieren)
│   ├── kreuzwortraetsel-kulturen.html
│   ├── spiel-homofermentativ.html
│   ├── zuordnung-kulturenformen.html      ← 3 Stufen (Einfach/Mittel/Schwer); Vor-/Nachteile Kulturenformen
│   ├── sortierer-fettsirtenkultur.html    ← Herstellungsschritte Fettsirtenkultur in Reihenfolge bringen
│   ├── begruenden-massnahmen-abweichungen.html ← 3 Stufen (Einfach/Mittel/Schwer); Begründen-Trainer-Variante (TS4) statt reinem Zuordnen, siehe Abschnitt "3-Stufen-Muster" unten
│   └── lernsession-pruefung-kulturen.html  ← Lernpfad (Standard) / Challenge (?mode=challenge); Prüfungsumfang Lektion 1–10 (MIT25b, 14.09.2026)
├── d1-hygiene/
│   ├── images/                            ← 7 SVG-Piktogramme (Arbeitskleidung, Rauchverbot, Händewaschen, …)
│   ├── spiel-desinfektion.html
│   ├── sortierer-haendedesinfektion.html
│   ├── wahr-falsch-personalhygiene.html
│   ├── zuordnung-piktogramme.html         ← 3-Stufen-Tool (Einfach/Mittel/Schwer) — Referenzdatei fürs 3-Stufen-Muster
│   └── zuordnung-hygienezonen.html        ← 3-Stufen-Tool (Einfach/Mittel/Schwer)
└── tools/
    ├── einheiten-trainer.html
    ├── fachrechner-salzbad.html
    └── fachrechner-fettgehalt.html
```

---

## Module

✅ = Tools vorhanden · 🔲 = noch keine Tools

| `data-module` | Badge | Sektions-Titel                             | Ordner                          | Status |
|---------------|-------|--------------------------------------------|---------------------------------|--------|
| `a1`          | a.1   | a.1 – Rohstoffe annehmen                   | `a1-rohstoffe/`                 | ✅     |
| `a2`          | a.2   | a.2 – Rohstoffe trennen                    | `a2-rohstoffe-trennen/`         | ✅     |
| `a3`          | a.3   | a.3 – Rohstoffe aufkonzentrieren           | `a3-aufkonzentrieren/`          | 🔲     |
| `a4`          | a.4   | a.4 – Wärmebehandlung durchführen          | `a4-waermebehandlung/`          | 🔲     |
| `a5`          | a.5   | a.5 – Homogenisation durchführen           | `a5-homogenisation/`            | 🔲     |
| `a6`          | a.6   | a.6 – Zutaten beimischen                   | `a6-zutaten/`                   | 🔲     |
| `a7`          | a.7   | a.7 – Technische Einrichtungen bedienen    | `a7-technische-einrichtungen/`  | ✅     |
| `a8`          | a.8   | a.8 – Kulturen herstellen                  | `a8-kulturen/`                  | ✅     |
| `b1`          | b.1   | b.1 – Hartkäse herstellen                  | `b1-hartkaese/`                 | ✅     |
| `b2`          | b.2   | b.2 – Halbhartkäse herstellen              | `b2-halbhartkase/`              | 🔲     |
| `b3`          | b.3   | b.3 – Weichkäse herstellen                 | `b3-weichkaese/`                | 🔲     |
| `b4`          | b.4   | b.4 – Mozzarella herstellen                | `b4-mozzarella/`                | 🔲     |
| `b5`          | b.5   | b.5 – Quark herstellen                     | `b5-quark/`                     | ↗ Anim |
| `b6`          | b.6   | b.6 – Konsummilch herstellen               | `b6-konsummilch/`               | 🔲     |
| `b7`          | b.7   | b.7 – Sauermilchprodukte herstellen        | `b7-sauermilch/`                | ✅     |
| `b8`          | b.8   | b.8 – Speiseeis herstellen                 | `b8-speiseeis/`                 | 🔲     |
| `b9`          | b.9   | b.9 – Dessertprodukte herstellen           | `b9-dessert/`                   | 🔲     |
| `b10`         | b.10  | b.10 – Butter herstellen                   | `b10-butter/`                   | 🔲     |
| `b11`         | b.11  | b.11 – Milchpulver herstellen              | `b11-milchpulver/`              | 🔲     |
| `d1`          | d.1   | d.1 – Hygiene                              | `d1-hygiene/`                   | ✅     |
| `d2`          | d.2   | d.2 – Reinigung und Entkeimung             | `d2-reinigung/`                 | 🔲     |
| `d3`          | d.3   | d.3 – Basis-Analysen                       | `d3-analysen/`                  | 🔲     |
| `d4`          | d.4   | d.4 – Qualitätsmanagement                  | `d4-qualitaet/`                 | 🔲     |
| `e2`          | e.2   | e.2 – Umweltschutz                         | `e2-umweltschutz/`              | 🔲     |
| `allgemein`   | Allg. | Allgemeine Tools                           | `tools/`                        | ✅     |
| `animationen` | –     | Animationen (modulübergreifende Rubrik)    | (Dateien im jeweiligen Modulordner) | ✅ |

> **Animationen** ist eine eigenständige Rubrik (kein Modul). Tools vom Typ `animation` werden
> mit `data-module="animationen"` ausgezeichnet und in der Sektion `#section-animationen` gesammelt.
> Die Datei bleibt physisch im Themen-Modulordner (z. B. `b5-quark/`, `b7-sauermilch/`); das
> Modul-Badge auf der Kachel zeigt weiterhin das Thema (b.5, b.7 …). `↗ Anim` in der Status-Spalte
> oben heisst: Modul hat (nur) Tools, die unter der Rubrik Animationen gelistet sind.

---

## Tool-Typen

### Gebaut

| `data-type`        | Badge-Text        | Datei-Beispiel                          | Beschreibung                                            |
|--------------------|-------------------|-----------------------------------------|---------------------------------------------------------|
| `lernkaertchen`    | Lernkärtchen      | `lernkaertchen-sauermilch.html`         | Flip-Karten Begriff ↔ Erklärung, Shuffle, Kategoriefilter |
| `quiz`             | Quiz              | `quiz-qualitaetsmaengel.html`           | Multiple-Choice mit Sofortfeedback und Erklärung        |
| `memory`           | Memory            | `memory-trommelbestandteile.html`       | Paare aufdecken (Bild ↔ Name)                           |
| `sortierer`        | Sortierer         | `sortierer-jogurtherstellung.html`      | Schritte per Drag & Drop in richtige Reihenfolge bringen |
| `zuordnung`        | Zuordnung         | `zuordnung-anlagenteile-stichfest.html` | Begriffe/Aussagen per Drag & Drop auf Kategorie-Karten ziehen |
| `beschriften`      | Beschriften       | `beschriften.html`                      | Begriffe per Drag & Drop auf nummerierte Positionen in einem Bild ziehen |
| `lueckentext`      | Lückentext        | `lueckentext-saeuregerinnung.html`      | Lücken füllen – Einfach (Wortbank) oder Schwer (Tippen) |
| `fachrechner`      | Fachrechner       | `fachrechner-mischungskreuz.html`       | Fachspezifische Berechnung mit Rechenweg                |
| `trainer`          | Trainer           | `einheiten-trainer.html`               | Randomisierte Aufgaben, nie gleiche Aufgabe zweimal     |
| `wahr-falsch`      | Wahr/Falsch       | `wahr-falsch-sauermilch.html`           | Tinder-Swipe: rechts = wahr, links = falsch             |
| `tabellen-luecken` | Tabellen-Lücken   | `tabellen-luecken-kulturen.html`        | Vergleichstabelle mit Wortbank ausfüllen                |
| `prozessvergleich` | Prozessvergleich  | `prozessvergleich-jogurt.html`          | Zwei Produktionswege nebeneinander, aufklappbare Details |
| `hotspot`          | Hotspot           | `hotspot-bakterienzelle.html`           | Bild mit anklickbaren Zonen (Polygon/Kreis/Polylinie)   |
| `kreuzwortraetsel` | Kreuzworträtsel   | `kreuzwortraetsel-kulturen.html`        | Auto-Gitter aus Fachbegriffen, Hinweise waagrecht/senkrecht |
| `spiel`            | Spiel             | `spiel-homofermentativ.html`            | Geschicklichkeitsspiel (Canvas), Maus/Touch/Tasten, 3 Leben |
| `animation`        | Animation         | `animation-labgerinnung.html`           | Schrittweise SVG-Animation eines Prozesses mit Nav      |
| `prozess-entscheid`| Prozess-Entscheid | `prozess-entscheid-jogurt.html`         | Entscheidung pro Prozessschritt mit Fehleranalyse       |
| `fliessschema`     | Fliessschema      | `fliessschema-stichfest.html`           | Produktionsschritte frei in leere, verkettete Kästchen eintippen |
| `lernpfad` / `challenge` | Lernpfad / Challenge | `lernsession-sbrinz.html` | Eine Datei, zwei Modi: **Lernpfad** (Standard, mit Slides + Übungen einfach/mittel) und **Challenge** (`?mode=challenge`: ohne Slides/Info/PDF, schwerste Stufe, voll gamifiziert: XP/Streak/Abzeichen/Rang) |
| `baukasten`        | Baukasten         | `baukasten-milchfett.html`              | Bauteile per Drag & Drop auf feste Bindungsstellen ziehen, Resultat wird berechnet/klassiert; Tabs oben für Frei-Bauen-Modus vs. gezielte Aufgaben |

---

### Didaktische Begründung je Tool-Typ

Warum dieses Format lernwirksam ist — nicht nur was es tut. Wo ein Typ zu keinem echten lerntheoretischen Prinzip passt, steht das ehrlich so da (reine Abwechslung/Vokabeltraining ist auch ein legitimer, aber schwächerer Grund).

| `data-type` | Prinzip | Begründung |
|---|---|---|
| `lernkaertchen` | Testing-Effekt / Retrieval Practice | Aktives Abrufen (Begriff → Erklärung) statt Wiederlesen stärkt das Behalten stärker als passives Repetieren. |
| `quiz` | Testing-Effekt, niederschwellig | Schnelle, risikoarme Abrufübung mit Sofort-Feedback; deckt v. a. TS1/TS2 ab, keine Konstruktionsleistung. |
| `memory` | Testing-Effekt + Dual Coding | Wiederholtes Abrufen von Bild-Begriff-Paaren, spielerisch verpackt; die Bild-Text-Kopplung unterstützt zusätzlich die Encodierung. |
| `sortierer` | Prozedurales Sequenzverständnis | Baut ein korrektes mentales Modell eines mehrstufigen Herstellungsprozesses auf statt isolierter Einzelfakten. |
| `zuordnung` | Diskriminationslernen mit Distraktoren | Erzwingt echtes Unterscheiden zwischen ähnlichen richtigen/falschen Optionen statt blossem Wiedererkennen — wirksamer, wenn Distraktoren plausibel falsch sind, nicht offensichtlich falsch. |
| `beschriften` | Dual Coding / räumlich-visuelles Lernen | Kopplung von Bild/Position und Fachbegriff unterstützt reichhaltigere Encodierung als Text allein; meist als 3-Stufen-Tool ausgeführt (siehe unten). |
| `lueckentext` | Testing-Effekt mit Kontext | Abruf im Satzkontext statt isoliert, Einfach-Stufe (Wortbank) und Schwer-Stufe (Tippen) fadenweise abgestuft. |
| `fachrechner` | Prozedurales Üben mit Rechenweg | Übt einen konkreten Berechnungsablauf inkl. sichtbarem Rechenweg statt nur des Endresultats — wichtig für Prüfungen, die den Rechenweg mitbewerten. |
| `trainer` | Verteiltes Üben (Spaced Practice) | Randomisierte, nie identische Aufgaben ermöglichen wiederholtes Training ohne Auswendiglernen der Aufgabenreihenfolge. |
| `wahr-falsch` | Testing-Effekt, sehr niederschwellig | Schnellste Form der Abrufübung; gut für hohe Wiederholungsfrequenz, aber flachste Taxonomiestufe (reine Erkennung). |
| `tabellen-luecken` | Vergleichendes Lernen | Die Tabellenform (Vergleichstabelle) macht sichtbar, was zwischen Fällen variiert und was konstant bleibt — stärker als isolierte Einzelfragen zum selben Stoff. |
| `prozessvergleich` | Vergleichendes Lernen | Zwei Produktionswege nebeneinander, aufklappbar — gleiches Prinzip wie Tabellen-Lücken, aber für ganze Prozessabläufe statt einzelner Werte. |
| `hotspot` | Dual Coding / räumlich-visuelles Lernen | Bild mit anklickbaren Zonen verankert Begriffe an ihrer realen räumlichen Position in Anlage/Zelle. |
| `kreuzwortraetsel` | Reine Begriffsfestigung | Passt zu keinem starken Lernprinzip aus der Forschung — trainiert Rechtschreibung/Wiedererkennung von Fachbegriffen, nicht die im Leistungsziel geforderte Fertigkeit (nennen/erklären). Bewusst als Auflockerung/Abwechslung eingesetzt, nicht als Haupttrainingsform für ein Leistungsziel. |
| `spiel` | Gamification/Motivation | Zeit-/Punktedruck und spielerischer Rahmen erhöhen Engagement und Wiederholungsbereitschaft, auf Kosten von Reflexionstiefe — bewusster Trade-off, nicht für TS3/TS4-Inhalte geeignet. |
| `animation` | Direkte Instruktion (Input-Phase) | Zeigt einen Prozess schrittweise, bevor geübt wird — Input-Teil im Input→Üben→Korrigieren-Rhythmus, keine eigene Abrufleistung der Lernenden. |
| `prozess-entscheid` | Entscheidungssimulation / Branching | Simuliert eine echte Entscheidungssituation mit Fehleranalyse/Konsequenz — erreicht höhere Taxonomiestufen (TS3 anwenden) als reine Abruf-Tools. |
| `fliessschema` | Prozedurales Sequenzverständnis, produktiv | Wie Sortierer, aber ohne Vorgabe der Bausteine — die Lernenden füllen freie Kästchen selbst, höhere Eigenleistung als Drag-and-Drop-Sortierung. |
| `lernpfad` / `challenge` | Fading + Testing-Effekt + Gamification | Eine Datei, zwei Stufen von Unterstützung: Lernpfad mit Lesetexten/Input (Slides-Stationen, Input→Üben→Korrigieren) für den Aufbau, Challenge ohne Hilfen als reine, gamifizierte Abrufprüfung — simuliert Prüfungsbedingungen. Siehe eigener Abschnitt unten. |
| `baukasten` | Konstruktives Lernen | Ein Ergebnis (z. B. Triglycerid) wird aus Einzelteilen selbst zusammengebaut statt nur erkannt — baut Verständnis der Zusammensetzung auf, nicht nur des Endprodukts. |

---

### Lernsession / Lernpfad (Canonical Pattern)

Die HUD/XP/Streak/Navigation-Engine ist gemeinsam in **`assets/lernsession-engine.js`** ausgelagert (nicht mehr copy-pasten). Referenz für den Init-Aufruf: `a7-technische-einrichtungen/lernsession-waermeerzeugung.html` oder jede andere `lernsession-*.html`.

**Neues Tool erstellen:**
1. `<script src="../assets/lernsession-engine.js"></script>` einbinden.
2. Eigenes `STATIONS`-Array (Daten) + `buildBody()` für stationseigene Bau-Logik definieren.
3. `LSEngine.configure({...})` mit modul-eigenen Texten/Badges/Rank-Namen aufrufen (siehe JSDoc-Kopf der Engine für die Config-Felder, u.a. `finish` für Rang-Texte/Badges).
4. Stations-Typen `pdf`, `video`, `slides`, `tf`, `gaps`, `quiz`, `labelType`, `labelChoose`, `explain` sind in der Engine vorgebaut. Modul-eigene Sonderstationen (z.B. `buildDecide`/`buildErrors`/`buildTable`/`buildOrder`) bleiben lokal in der HTML-Datei, wenn sie zu stark vom Standard abweichen — nicht erzwingen.

**STATIONS-Filter (Challenge-Modus)**, weiterhin pro Datei:
```javascript
var STATIONS = ALL.filter(function(s) {
  return MODE === 'challenge' ? (s.type !== 'info' && s.type !== 'pdf' && s.type !== 'slides') : true;
});
```

Inhaltsregeln für Slides-Stationen: siehe [Slides-Station Canonical Pattern](#slides-station-in-lernsession-canonical-pattern) weiter unten.

---

### 3-Stufen-Muster (Einfach / Mittel / Schwer)

Die Engine ist gemeinsam in **`assets/zuordnung3.js`** ausgelagert (nicht mehr copy-pasten), als zwei Sub-Namespaces, je nach Interaktionsmuster:
- **`Zuordnung3.karten`** – Karten aus einem Pool in Drop-Zonen ziehen. Referenz: `d1-hygiene/zuordnung-piktogramme.html`, `d1-hygiene/zuordnung-hygienezonen.html`.
- **`Zuordnung3.wortbank`** – Begriffe aus einer Wortbank in Tabellen-Lücken ziehen (Stufe Einfach identisch; Mittel/Schwer bleiben pro Datei, wenn die Pädagogik abweicht). Referenz: `a7-technische-einrichtungen/zuordnung-dampfkessel-gefahren.html`, `a8-kulturen/begruenden-massnahmen-abweichungen.html`.

Beide Sub-Namespaces teilen `fold`/`matchKeys`/`showResult` und das Level-Grundgerüst `Zuordnung3.levelBar` (`setLevel`/`resetLevel`/`checkLevel`, global für `onclick`-Attribute im Markup).

Verwendet in: `milchsammelwagen-beschriften.html`, `mid-beschriften.html`, `beschriften.html`, `zuordnung-dampfkessel-gefahren.html`, `zuordnung-piktogramme.html`, `zuordnung-hygienezonen.html`, `zuordnung-kulturenformen.html`, `begruenden-massnahmen-abweichungen.html`.

**Aufbau:** ein `level-bar` mit drei Buttons (`setLevel('einfach'|'mittel'|'schwer')`), pro Stufe ein eigener `resetLevel()`-Aufbau und eine eigene `checkEinfach()`/`checkMittel()`/`checkSchwer()`-Auswertung. Einfach nutzt HTML5-Drag-and-Drop + Touch-Events (Desktop und Mobil), Mittel meist Anklicken aus einer kurzen Optionsliste, Schwer ein Texteingabefeld.

**Didaktische Begründung (Fading):** dieselbe Inhaltsmenge bedient sowohl schwächere als auch fortgeschrittene Lernende, indem die Unterstützung stufenweise abgebaut wird — von geführter Zuordnung über Auswahl bis zur freien Eingabe. Das folgt dem Prinzip des "Fading" aus der Forschung zu Worked Examples: Gerüst schrittweise entfernen, sobald Kompetenz wächst.

**Variante "Begründen-Trainer"** (`begruenden-massnahmen-abweichungen.html`, Pilot seit 2026-09, Ziel a.8.7.2 TS4 "begründen"): dieselbe 3-Stufen-Engine, aber inhaltlich nicht auf reines Zuordnen (TS1) ausgelegt, sondern auf den Aufbau einer vollständigen Begründungskette (Ursache → Massnahme → Wirkung):
- **Einfach:** Ursache-/Massnahme-/Wirkung-Fragmente per Drag & Drop zu einem vollständigen Begründungssatz zusammensetzen.
- **Mittel:** pro Situation 3 vollständige Kandidatensätze zur Auswahl (richtig begründet / nur Massnahme genannt, nicht begründet / falsche Ursache) — trainiert das *Erkennen* einer echten Begründung.
- **Schwer:** freie Texteingabe der eigenen Begründung, danach Musterantwort + kurze Selbstcheck-Checkliste einblenden (keine automatische Bewertung möglich ohne Backend — bewusste Grenze der statischen Seite, siehe Elaborative-Interrogation-Prinzip).

Dieses Muster eignet sich für jedes Leistungsziel mit Taxonomiestufe TS2 ("erklären") oder TS4 ("begründen"), bei dem die bisherigen Tools nur Auswahl/Erkennung statt eigener Konstruktion verlangen — vor einer Ausweitung auf weitere Module den Piloten zuerst mit Lernenden testen.

---

### Geplant / Ideen

| `data-type`        | Badge-Text        | Beschreibung                                                        |
|--------------------|-------------------|---------------------------------------------------------------------|
| `lueckendiagramm`  | Lückendiagramm    | Unvollständiges Flussdiagramm/Kurve ergänzen                        |
| `fehlersuche`      | Fehlersuche       | Text mit eingebauten Fehlern – Lernende markieren und korrigieren   |

---

## Design-System (style.css)

**BZWU Grundbildung Farben:**
- Dunkelblau `--blue-dark: #134061` (Pantone 7694 C) – Header, Buttons, aktive Filter
- Hellblau `--blue-light: #69A9C9` (Pantone 542 C) – sekundäre Elemente
- Blau-Tint `--blue-tint: #ddeef5` – Hintergründe, Badges
- Rot `--red: #CC3333` – nur für Fehler / falsche Antworten

**Logos:** `assets/logos/` – in jedem Header als `.header-logos` eingebunden (auf Mobil ausgeblendet)

---

## Datei-Namenskonvention

```
[typ]-[thema].html

Beispiele:
  lernkaertchen-sauermilchprodukte.html
  quiz-qualitaetsmaengel.html
  memory-trommelbestandteile.html
  sortierer-jogurtherstellung.html
  zuordnung-anlagenteile-stichfest.html
  lueckentext-saeuregerinnung.html
  fachrechner-mischungskreuz.html
  wahr-falsch-sauermilch.html
  tabellen-luecken-kulturen.html
  prozessvergleich-jogurt.html
```

## Bilder-Namenskonvention

```
[modul]_[nr]_[name].[ext]

Beispiele:
  a.2_01_Greiferkammerverschluss.png
  b.7_Anlage_stichfest_Nummern.png
```

Bilder liegen immer in `[modulordner]/images/[thema]/`

---

## Corporate Design – Komponentenvorlagen

Jedes neue Tool **muss** diesen Vorlagen folgen. Abweichungen nur bei technischer Notwendigkeit.

---

### Lernkärtchen (Canonical Pattern)

Die Engine ist gemeinsam in **`assets/lernkaertchen-engine.js`** ausgelagert (nicht mehr copy-pasten). Referenz: `b7-sauermilch/lernkaertchen.html` und `b7-sauermilch/qualitaetsmaengel-jogurt.html` (Init-Aufruf `MTFlashcards.init({...})`).

**Karten-Grösse:**
- Begriff ↔ Erklärung (kurze Inhalte): `width: 440px; height: 270px`
- Frage ↔ Antwort (K2-Fragen, längere Inhalte): `width: 440px; height: 310px`

**Feldschema (immer, keine Alt-Varianten wie `{cat,q,a}` mehr):** `{category, front, back}`, Markup-Klassen `.card-term`/`.card-explanation` (bzw. `.card-question` für K2-Fragenkarten).

**Richtig/Falsch-Bestätigung (Pflicht seit 2026-09):** nach dem Umdrehen erscheinen zwei Buttons "Wusste ich" / "Wusste ich nicht". Als "Wusste ich nicht" markierte Karten werden ans Ende des aktuellen Durchgangs angehängt (nicht neu gemischt); der Durchgang wiederholt sich, bis alle Karten in einem Durchgang "gewusst" wurden. Fortschrittstext zeigt "Karte X von Y", ab dem zweiten Durchgang zusätzlich "(Durchgang n)" bzw. "noch Z zu wiederholen". Kein Score/Punktesystem — reine Selbsteinschätzung.

**Neues Tool erstellen:**
1. `<link rel="stylesheet" href="../style.css">` (Card-Flip-/Progress-Bar-CSS ist dort unter `/* Lernkärtchen-Engine */` definiert, nicht mehr inline duplizieren).
2. `<script src="../assets/lernkaertchen-engine.js"></script>` einbinden.
3. Eigenes Karten-Array (`{category, front, back}`) + Markup-Grundgerüst übernehmen, `MTFlashcards.init({cards, ...})` aufrufen.
4. Bestehende Steuerung (Vorne/Hinten, Mischen, Kategoriefilter, Tastatur-Shortcuts ← → Leertaste/Enter S) kommt automatisch aus der Engine.

**Kategorie-Badge-Farben (Standard):**
```javascript
const CATEGORY_COLORS = {
  "Mikrobiologie":       { bg: "#f3e8ff", fg: "#6b21a8" },
  "Chemie & Physik":     { bg: "#dbeeff", fg: "#1e4e8c" },
  "Produktion":          { bg: "#dcfce7", fg: "#15803d" },
  "Zutaten":             { bg: "#fef9c3", fg: "#854d0e" },
  "Recht & Qualität":    { bg: "#fde8ed", fg: "#c40027" },
  "Qualitätsmängel":     { bg: "#ffedd5", fg: "#9a3412" },
  // Subkategorien Qualitätsmängel:
  "Mikrobiologisch":     { bg: "#ffedd5", fg: "#9a3412" },
  "Konsistenz & Struktur": { bg: "#dbeeff", fg: "#1e4e8c" },
  "Geschmack":           { bg: "#dcfce7", fg: "#15803d" },
};
```

---

### Hotspot (Canonical Pattern)

Referenz: `a8-kulturen/hotspot-bakterienzelle.html`

**Zonentypen:**
- `circle` – Kreiszone: `{ type:'circle', cx:50, cy:46, r:35 }` (cx/cy in %, r in px)
- `polygon` – Flächenzone (point-in-polygon): `{ type:'polygon', points:[{cx,cy},...] }`
- `polyline` – Linienzzone (Nähe zur Linie): `{ type:'polyline', tolerance:25, points:[...] }`

**Debug-Modus:** URL-Parameter `?debug` zeigt alle Zonen + Klickkoordinaten zur Kalibrierung.

**Wann welcher Typ:**
- Einzelne Strukturen (Organellen, Punkte): `circle`
- Flächige Bereiche (Cytoplasma, Chromosom): `polygon`
- Ringe, Linien, Kurven (Membran, Geissel): `polyline`

---

### Slides-Station in Lernsession (Canonical Pattern)

Referenz: `a7-technische-einrichtungen/lernsession-waermeerzeugung.html`

Eine `type:'slides'`-Station zeigt 2–3 Folien als animierte Diashow (swipebar). Im **Challenge-Modus** wird dieser Stationstyp wie `info` und `pdf` herausgefiltert.

**Stations-Datenstruktur:**
```javascript
{ kicker:'Folien · [Thema]', title:'[Stationstitel]', type:'slides',
  lead:'Lesen Sie alle Folien, danach prüfen Sie sich.',
  slides:[
    { icon:'🔥',            // Emoji (gross, in abgerundetem Box)
      color:'#92400e',      // Textfarbe Header
      bg:'#fff7ed',         // Hintergrundfarbe Header
      title:'[Folientitel]',
      body:'<p>...</p>'     // HTML: <p>, <ul>, <ol>, <b>, <div class="factbox">
    },
    // 1–2 weitere Folien
  ]
}
```

**CSS-Klassen:**
```css
.slideshow          /* äusserer Container: border-radius, box-shadow, border */
.slide-panel        /* einzelne Folie (display:none by default) */
.slide-panel.active /* sichtbare Folie */
.slide-in-right / .slide-in-left  /* Eintrittsanimation (cubic-bezier, 0.3 s) */
.slide-header       /* farbige Kopfzeile: icon-box + Titel */
.slide-icon         /* Emoji in abgerundetem Box (56×56 px, shadow) */
.slide-htitle       /* Folientitel (1.05 rem, bold) */
.slide-body         /* weisser Inhaltsbereich, 22 px horizontaler Abstand */
.slide-body .factbox /* blauer Infokasten (var(--blue-tint), linker Balken) */
```

**Inhaltsregeln:**
- Direkte Sie-Form: «Sie», «Ihre Aufgabe», «Sie als Milchtechnologe/in» – nie «Betreiber»
- Keine Gedankenstrich-Separatoren (`–`). Satzende mit Punkt, danach neuer Satz.
- Zahlenbereiche: «80 bis 110 °C» – nicht «80–110 °C»
- 2–3 Folien pro Station; Lesemenge pro Folie: 4–8 kurze Sätze oder 4–6 Listenpunkte
- `.factbox` für Merksätze, Grenzwerte, Formeln

**Lese-Button:** Nur auf der letzten Folie sichtbar, Text `'Gelesen ✓ (+5 XP)'`.

**Touch-Swipe:** Threshold 42 px horizontal (`touchstart`/`touchend` δx).

**Navigation:** Dot-Indikatoren + Pfeil-Buttons links/rechts; Pfeilbuttons auf letzter Folie rechts ausgeblendet.

---

## Checkliste – Neues Tool

1. HTML-Datei im richtigen Modulordner erstellen
2. `<link rel="stylesheet" href="../style.css">` im `<head>`
3. Header mit `.header-text` und `.header-logos` (Pfad `../assets/logos/`)
4. `<a class="back-link" href="../index.html">← Alle Lerntools</a>` oben im `<main>`
5. Kachel in `index.html` in der richtigen Modulsektion eintragen
6. Kachel erhält `data-module="[slug]"` und `data-type="[slug]"` (Werte aus dieser Datei)
7. Neuen `data-type` als Filter-Pill in `index.html` ergänzen
8. `git add / commit / push`
