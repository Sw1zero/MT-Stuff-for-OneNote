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

✅ = Tools vorhanden · 🔲 = noch keine Tools

| `data-module` | Badge | Sektions-Titel                             | Ordner                          | Status |
|---------------|-------|--------------------------------------------|---------------------------------|--------|
| `a1`          | a.1   | a.1 – Rohstoffe annehmen                   | `a1-rohstoffe-annehmen/`        | 🔲     |
| `a2`          | a.2   | a.2 – Rohstoffe trennen                    | `a2-rohstoffe-trennen/`         | ✅     |
| `a3`          | a.3   | a.3 – Rohstoffe aufkonzentrieren           | `a3-aufkonzentrieren/`          | 🔲     |
| `a4`          | a.4   | a.4 – Wärmebehandlung durchführen          | `a4-waermebehandlung/`          | 🔲     |
| `a5`          | a.5   | a.5 – Homogenisation durchführen           | `a5-homogenisation/`            | 🔲     |
| `a6`          | a.6   | a.6 – Zutaten beimischen                   | `a6-zutaten/`                   | 🔲     |
| `a7`          | a.7   | a.7 – Technische Einrichtungen bedienen    | `a7-technische-einrichtungen/`  | 🔲     |
| `a8`          | a.8   | a.8 – Kulturen herstellen                  | `a8-kulturen/`                  | 🔲     |
| `b1`          | b.1   | b.1 – Hartkäse herstellen                  | `b1-hartkaese/`                 | 🔲     |
| `b2`          | b.2   | b.2 – Halbhartkäse herstellen              | `b2-halbhartkase/`              | 🔲     |
| `b3`          | b.3   | b.3 – Weichkäse herstellen                 | `b3-weichkaese/`                | 🔲     |
| `b4`          | b.4   | b.4 – Mozzarella herstellen                | `b4-mozzarella/`                | 🔲     |
| `b5`          | b.5   | b.5 – Quark herstellen                     | `b5-quark/`                     | 🔲     |
| `b6`          | b.6   | b.6 – Konsummilch herstellen               | `b6-konsummilch/`               | 🔲     |
| `b7`          | b.7   | b.7 – Sauermilchprodukte herstellen        | `b7-sauermilch/`                | ✅     |
| `b8`          | b.8   | b.8 – Speiseeis herstellen                 | `b8-speiseeis/`                 | 🔲     |
| `b9`          | b.9   | b.9 – Dessertprodukte herstellen           | `b9-dessert/`                   | 🔲     |
| `b10`         | b.10  | b.10 – Butter herstellen                   | `b10-butter/`                   | 🔲     |
| `b11`         | b.11  | b.11 – Milchpulver herstellen              | `b11-milchpulver/`              | 🔲     |
| `d1`          | d.1   | d.1 – Hygiene                              | `d1-hygiene/`                   | 🔲     |
| `d2`          | d.2   | d.2 – Reinigung und Entkeimung             | `d2-reinigung/`                 | 🔲     |
| `d3`          | d.3   | d.3 – Basis-Analysen                       | `d3-analysen/`                  | 🔲     |
| `d4`          | d.4   | d.4 – Qualitätsmanagement                  | `d4-qualitaet/`                 | 🔲     |
| `e2`          | e.2   | e.2 – Umweltschutz                         | `e2-umweltschutz/`              | 🔲     |
| `allgemein`   | Allg. | Allgemeine Tools                           | `tools/`                        | ✅     |

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
