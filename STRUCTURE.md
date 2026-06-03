# Struktur – BZWU Milchtechnologie Lerntools

Diese Datei definiert die kanonischen Namen für Module, Tool-Typen und Ordner.
**Immer hier nachschauen bevor eine neue Kachel oder ein neues Tool erstellt wird.**

---

## Module

| `data-module` | Badge-Text | Sektions-Titel               | Ordner                  |
|---------------|------------|------------------------------|-------------------------|
| `a1`          | a.1        | a.1 – Milch annehmen         | `a1-milch-annehmen/`    |
| `a2`          | a.2        | a.2 – Rohstoffe trennen      | `a2-rohstoffe-trennen/` |
| `a3`          | a.3        | a.3 – Wärmebehandlung        | `a3-waermebehandlung/`  |
| `a4`          | a.4        | a.4 – Wärmebehandlung        | `a4-waermebehandlung/`  |
| `b1`          | b.1        | b.1 – Hartkäse herstellen    | `b1-hartkaese/`         |
| `b7`          | b.7        | b.7 – Sauermilchprodukte herstellen | `b7-sauermilch/` |
| `d1`          | d.1        | d.1 – Hygiene                | `d1-hygiene/`           |
| `allgemein`   | Allgemein  | Allgemeine Tools             | `tools/`                |

---

## Tool-Typen

### Gebaut

| `data-type`    | Badge-Text    | Beschreibung                                  |
|----------------|---------------|-----------------------------------------------|
| `lernkaertchen`| Lernkärtchen  | Flip-Karten Begriff ↔ Erklärung               |
| `quiz`         | Quiz          | Multiple-Choice-Fragen mit Feedback           |
| `memory`       | Memory        | Paare aufdecken (Bild ↔ Name oder Begriff ↔ Definition) |
| `sortierer`    | Sortierer     | Schritte/Objekte per Drag & Drop sortieren    |
| `zuordnung`    | Zuordnung     | Begriffe/Bilder per Drag & Drop zuordnen      |
| `lueckentext`  | Lückentext    | Lücken füllen (Wortbank oder Tippen)          |
| `fachrechner`  | Fachrechner   | Berechnungen mit Rechenweg                    |
| `trainer`      | Trainer       | Randomisierte Übungsaufgaben                  |

### Geplant / Ideen

| `data-type`        | Badge-Text        | Beschreibung                                                        |
|--------------------|-------------------|---------------------------------------------------------------------|
| `wahr-falsch`      | Wahr/Falsch       | Tinder-Swipe: Karte rechts = wahr, links = falsch                   |
| `tabellen-luecken` | Tabellen-Lücken   | Vergleichstabelle mit leeren Zellen ausfüllen (z.B. Produktvergleich) |
| `kreuzwortraetsel` | Kreuzworträtsel   | Klassisches Kreuzworträtsel aus Fachbegriffen                       |
| `hotspot`          | Hotspot           | Bild mit anklickbaren Punkten beschriften                           |
| `prozess-entscheid`| Prozess-Entscheid | Verzweigter Entscheidungsbaum: Was passiert wenn...?                |
| `lueckendiagramm`  | Lückendiagramm    | Unvollständiges Flussdiagramm/Kurve ergänzen                        |
| `fehlersuche`      | Fehlersuche       | Text mit eingebauten Fehlern – Lernende markieren und korrigieren   |
| `prozessvergleich` | Prozessvergleich  | Zwei Produktionswege interaktiv nebeneinander vergleichen           |

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
3. `<a class="back-link" href="../index.html">← Alle Lerntools</a>` oben im `<main>`
4. Kachel in `index.html` in der richtigen Modulsektion eintragen
5. Kachel erhält `data-module="[slug]"` und `data-type="[slug]"` (Werte aus dieser Datei)
6. `git add / commit / push`
