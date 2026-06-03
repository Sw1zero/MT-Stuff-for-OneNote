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
│   └── logos/
│       ├── bzwu.png                    ← BZWU-Logo (weisser Hintergrund)
│       └── milchtechnologen.svg        ← Branchenlogo
├── b7-sauermilch/
│   ├── images/
│   │   └── b.7_Anlage_stichfest_Nummern.png
│   ├── lernkaertchen.html
│   ├── quiz-qualitaetsmaengel.html
│   ├── sortierer-jogurtherstellung.html
│   ├── zuordnung-anlagenteile.html
│   ├── lueckentext-saeuregerinnung.html
│   ├── fachrechner-mischungskreuz.html
│   ├── wahr-falsch-sauermilch.html
│   ├── tabellen-luecken-kulturen.html
│   └── prozessvergleich-jogurt.html
├── a2-rohstoffe-trennen/
│   ├── images/
│   │   └── trommelbestandteile/        ← 11 PNG-Bilder
│   └── memory-trommelbestandteile.html
└── tools/
    └── einheiten-trainer.html
```

---

## Module

| `data-module` | Badge-Text | Sektions-Titel                      | Ordner                  |
|---------------|------------|-------------------------------------|-------------------------|
| `a1`          | a.1        | a.1 – Milch annehmen                | `a1-milch-annehmen/`    |
| `a2`          | a.2        | a.2 – Rohstoffe trennen             | `a2-rohstoffe-trennen/` |
| `a3`          | a.3        | a.3 – Rohstoffe aufkonzentrieren    | `a3-aufkonzentrieren/`  |
| `a4`          | a.4        | a.4 – Wärmebehandlung durchführen   | `a4-waermebehandlung/`  |
| `b1`          | b.1        | b.1 – Hartkäse herstellen           | `b1-hartkaese/`         |
| `b7`          | b.7        | b.7 – Sauermilchprodukte herstellen | `b7-sauermilch/`        |
| `d1`          | d.1        | d.1 – Hygiene                       | `d1-hygiene/`           |
| `allgemein`   | Allgemein  | Allgemeine Tools                    | `tools/`                |

---

## Tool-Typen

### Gebaut

| `data-type`        | Badge-Text        | Datei-Beispiel                          | Beschreibung                                            |
|--------------------|-------------------|-----------------------------------------|---------------------------------------------------------|
| `lernkaertchen`    | Lernkärtchen      | `lernkaertchen-sauermilch.html`         | Flip-Karten Begriff ↔ Erklärung, Shuffle, Kategoriefilter |
| `quiz`             | Quiz              | `quiz-qualitaetsmaengel.html`           | Multiple-Choice mit Sofortfeedback und Erklärung        |
| `memory`           | Memory            | `memory-trommelbestandteile.html`       | Paare aufdecken (Bild ↔ Name)                           |
| `sortierer`        | Sortierer         | `sortierer-jogurtherstellung.html`      | Schritte per Drag & Drop in richtige Reihenfolge bringen |
| `zuordnung`        | Zuordnung         | `zuordnung-anlagenteile.html`           | Begriffe per Drag & Drop auf Nummern/Positionen ziehen  |
| `lueckentext`      | Lückentext        | `lueckentext-saeuregerinnung.html`      | Lücken füllen – Einfach (Wortbank) oder Schwer (Tippen) |
| `fachrechner`      | Fachrechner       | `fachrechner-mischungskreuz.html`       | Fachspezifische Berechnung mit Rechenweg                |
| `trainer`          | Trainer           | `einheiten-trainer.html`               | Randomisierte Aufgaben, nie gleiche Aufgabe zweimal     |
| `wahr-falsch`      | Wahr/Falsch       | `wahr-falsch-sauermilch.html`           | Tinder-Swipe: rechts = wahr, links = falsch             |
| `tabellen-luecken` | Tabellen-Lücken   | `tabellen-luecken-kulturen.html`        | Vergleichstabelle mit Wortbank ausfüllen                |
| `prozessvergleich` | Prozessvergleich  | `prozessvergleich-jogurt.html`          | Zwei Produktionswege nebeneinander, aufklappbare Details |

### Geplant / Ideen

| `data-type`        | Badge-Text        | Beschreibung                                                        |
|--------------------|-------------------|---------------------------------------------------------------------|
| `kreuzwortraetsel` | Kreuzworträtsel   | Klassisches Kreuzworträtsel aus Fachbegriffen                       |
| `hotspot`          | Hotspot           | Bild mit anklickbaren Punkten beschriften                           |
| `prozess-entscheid`| Prozess-Entscheid | Verzweigter Entscheidungsbaum: Was passiert wenn...?                |
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
  zuordnung-anlagenteile.html
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

## Checkliste – Neues Tool

1. HTML-Datei im richtigen Modulordner erstellen
2. `<link rel="stylesheet" href="../style.css">` im `<head>`
3. Header mit `.header-text` und `.header-logos` (Pfad `../assets/logos/`)
4. `<a class="back-link" href="../index.html">← Alle Lerntools</a>` oben im `<main>`
5. Kachel in `index.html` in der richtigen Modulsektion eintragen
6. Kachel erhält `data-module="[slug]"` und `data-type="[slug]"` (Werte aus dieser Datei)
7. Neuen `data-type` als Filter-Pill in `index.html` ergänzen
8. `git add / commit / push`
