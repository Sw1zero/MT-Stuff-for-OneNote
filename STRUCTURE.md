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
├── b1-hartkaese/
│   ├── images/
│   │   └── aop-memory/                 ← 12 PNG/JPEG (Schweizer AOP-Käse)
│   ├── lernsession-sbrinz.html
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
│   ├── lernsession-pruefung-jogurt.html
│   └── animation-sauergerinnung.html
├── a1-rohstoffe/
│   ├── images/
│   │   ├── milchsammelwagen/           ← 2 PNG (mit/ohne Nummern)
│   │   └── MID/                        ← 2 PNG (mit/ohne Nummern)
│   ├── milchsammelwagen-beschriften.html
│   ├── mid-beschriften.html
│   └── milchinhaltsstoffe-zuordnen.html
├── a2-rohstoffe-trennen/
│   ├── images/
│   │   └── trommelbestandteile/        ← 11 PNG-Bilder
│   └── memory-trommelbestandteile.html
├── a7-technische-einrichtungen/
│   ├── images/                         ← Ölbrenner, Dreizugdampfkessel, Warmwasseranlage (je mit/ohne Nummern)
│   ├── tabellen-luecken-metalle.html
│   ├── quiz-werkstoffe-schmierstoffe.html
│   ├── beschriften.html                  ← 3-Stufen-Tool; ?set=oelbrenner|dampfkessel|warmwasser
│   ├── zuordnung-dampfkessel-gefahren.html ← 3 Stufen (Einfach/Mittel/Schwer); Gefahrenquelle → Ursache & Sofortmassnahme
│   ├── wahr-falsch-dampfkessel.html      ← 12 Aussagen, Swipe-Karten
│   └── lernsession-waermeerzeugung.html  ← Lernpfad (Standard) / Challenge (?mode=challenge)
├── a8-kulturen/
│   ├── images/
│   │   └── a.8_Bakterienzelle_leer.png
│   ├── hotspot-bakterienzelle.html
│   ├── tabellen-luecken-kuehlung.html
│   ├── tabellen-luecken-kontrolle.html
│   ├── tabellen-luecken-milchsaeuregaerung.html
│   ├── quiz-kulturenformen.html
│   ├── quiz-abweichungen-phagen.html
│   ├── kreuzwortraetsel-kulturen.html
│   ├── spiel-homofermentativ.html
│   └── lernsession-pruefung-kulturen.html  ← Lernpfad (Standard) / Challenge (?mode=challenge)
├── d1-hygiene/
│   └── spiel-desinfektion.html
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

### Lernsession / Lernpfad (Canonical Pattern)

Referenz: `a7-technische-einrichtungen/lernsession-waermeerzeugung.html` ← **immer von hier kopieren**

#### Pflicht-CSS (vollständig, nichts weglassen)

```css
/* HUD */
.hud { display:flex; align-items:center; gap:12px; background:var(--blue-dark); color:#fff; border-radius:var(--radius-md); padding:10px 14px; margin-bottom:14px; box-shadow:var(--shadow-sm); }
.hud-xp { display:flex; align-items:baseline; gap:5px; flex-shrink:0; }
.hud-label { font-size:0.6rem; font-weight:700; letter-spacing:0.1em; opacity:0.8; }
.hud-val { font-size:1.15rem; font-weight:800; display:inline-block; }
.hud-val.pop { animation:xppop 0.4s ease; }
@keyframes xppop { 0%{transform:scale(1);} 40%{transform:scale(1.45); color:#9ad1e8;} 100%{transform:scale(1);} }
.hud-bar { flex:1; height:8px; background:rgba(255,255,255,0.2); border-radius:4px; overflow:hidden; }
.hud-bar-fill { height:100%; width:0%; background:linear-gradient(90deg,#69A9C9,#9ad1e8); border-radius:4px; transition:width 0.4s ease; }
/* Streak + animierte Flamme */
.hud-streak { position:relative; display:flex; align-items:center; gap:8px; font-size:0.84rem; font-weight:700; background:rgba(255,255,255,0.14); padding:3px 9px; border-radius:12px; white-space:nowrap; flex-shrink:0; transition:transform 0.15s, background 0.3s; }
.streak-num-fire { color:#ff8c00; text-shadow:0 0 6px rgba(255,100,0,0.8); }
.hud-streak.pulse { transform:scale(1.25); }
.streak-pop { position:absolute; top:-4px; right:-4px; font-size:0.72rem; font-weight:800; color:#ffa040; pointer-events:none; white-space:nowrap; animation:streakPopAnim 0.9s ease-out forwards; }
@keyframes streakPopAnim { 0%{opacity:1;transform:translateY(0) scale(1);} 70%{opacity:1;} 100%{opacity:0;transform:translateY(-20px) scale(0.75);} }
/* Feuer-Animation (ab Streak ≥ 3) */
.hud-fire-wrap { display:inline-block; position:relative; width:22px; height:22px; vertical-align:middle; overflow:visible; flex-shrink:0; }
/* ... (vollständiger Block: aus lernsession-waermeerzeugung.html Zeilen 29–44 kopieren) */

/* Read-Button */
.read-btn-row { margin-top:16px; }
.read-btn { width:210px; height:42px; border-radius:40px; border:1px solid rgba(255,255,255,0.25); background-color:var(--blue-dark); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:transform 0.3s; overflow:hidden; font-family:var(--font); padding:0 6px; }
.read-btn-icon { width:32px; height:32px; background:linear-gradient(to bottom,var(--blue-light),#2a6fa8); border-radius:50px; display:flex; align-items:center; justify-content:center; overflow:hidden; z-index:2; transition:width 0.3s; flex-shrink:0; }
.read-btn-text { flex:1; display:flex; align-items:center; justify-content:center; color:#fff; font-size:0.88rem; font-weight:600; white-space:nowrap; overflow:hidden; transition:all 0.3s; }
.read-btn:hover:not(:disabled) .read-btn-icon { width:190px; }
.read-btn:hover:not(:disabled) .read-btn-text { width:0; font-size:0; opacity:0; }
.read-btn:active:not(:disabled) { transform:scale(0.95); }
.read-btn:disabled { cursor:default; }
.read-btn.done .read-btn-icon { background:linear-gradient(to bottom,#48bb78,#38a169); }
```

#### Pflicht-HTML (HUD)

```html
<div class="hud">
  <div class="hud-xp"><span class="hud-label">XP</span><span class="hud-val" id="hudXp">0</span></div>
  <div class="hud-bar"><div class="hud-bar-fill" id="hudBar"></div></div>
  <div class="hud-streak" id="hudStreak">
    <span id="hudStreakEmoji">🔥</span>
    <div class="hud-fire-wrap" id="hudFireWrap" style="display:none">
      <div class="fire">
        <div class="fire-bottom"><div class="main-fire"></div></div>
        <div class="fire-center"><div class="main-fire"></div><div class="particle-fire"></div></div>
        <div class="fire-right"><div class="main-fire"></div><div class="particle-fire"></div></div>
        <div class="fire-left"><div class="main-fire"></div><div class="particle-fire"></div></div>
      </div>
    </div>
    <span id="hudStreakNum">0</span>
  </div>
</div>
```

#### Pflicht-JS (Gamification-Kern)

```javascript
var CHECK_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

var xp = 0, streak = 0, bestStreak = 0;

function renderHud() {
  document.getElementById('hudXp').textContent = xp;
  var sc = 0; for (var i = 0; i < N; i++) { if (solved[i]) sc++; }
  document.getElementById('hudBar').style.width = Math.round(sc / N * 100) + '%';
  document.getElementById('hudStreakNum').textContent = streak;
  var onFire = streak >= 3;
  document.getElementById('hudStreakEmoji').style.display = onFire ? 'none' : '';
  document.getElementById('hudFireWrap').style.display = onFire ? 'inline-block' : 'none';
  document.getElementById('hudStreakNum').className = onFire ? 'streak-num-fire' : '';
}
function addXp(n) { xp += n; var el = document.getElementById('hudXp'); renderHud(); el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
function showStreakPop() { var el = document.createElement('span'); el.className = 'streak-pop'; el.textContent = '+1 🔥'; document.getElementById('hudStreak').appendChild(el); setTimeout(function() { el.remove(); }, 900); }
function registerAnswer(ok) {
  if (ok) { streak++; if (streak > bestStreak) bestStreak = streak; addXp(10 + (streak >= 3 ? 5 : 0)); showStreakPop(); var s = document.getElementById('hudStreak'); s.classList.remove('pulse'); void s.offsetWidth; s.classList.add('pulse'); }
  else { streak = 0; renderHud(); }
}
```

#### STATIONS-Filter (Challenge-Modus)

```javascript
var STATIONS = ALL.filter(function(s) {
  return MODE === 'challenge' ? (s.type !== 'info' && s.type !== 'pdf' && s.type !== 'slides') : true;
});
```

#### Inhaltsregeln für Slides-Stationen

Siehe [Slides-Station Canonical Pattern](#slides-station-in-lernsession-canonical-pattern) weiter unten.

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

Referenz: `b7-sauermilch/lernkaertchen.html` und `b7-sauermilch/qualitaetsmaengel-jogurt.html`

**Karten-Grösse:**
- Begriff ↔ Erklärung (kurze Inhalte): `width: 440px; height: 270px`
- Frage ↔ Antwort (K2-Fragen, längere Inhalte): `width: 440px; height: 310px`

**HTML-Gerüst:**
```html
<div class="scene" id="scene" onclick="flipCard()">
  <div class="card" id="card">
    <div class="card-face card-front">
      <span class="card-category-badge" id="frontLabel"></span>
      <div class="card-term" id="frontTerm"></div>          <!-- oder card-question -->
      <div class="card-hint">Karte umdrehen für die Erklärung</div>
    </div>
    <div class="card-face card-back">
      <span class="card-category-badge" id="backLabel"></span>
      <div class="card-explanation" id="backExplanation"></div>  <!-- oder card-answer -->
    </div>
  </div>
</div>
```

**CSS-Klassen (in style.css definiert):**
- `.scene` – perspektivischer Container
- `.card` – flip-fähige Karte (`transform-style: preserve-3d`)
- `.card.flipped` – rotierter Zustand (`transform: rotateY(180deg)`)
- `.card-face` – gemeinsame Stile für Vorder-/Rückseite
- `.card-front` – weisser Hintergrund (`var(--surface)`)
- `.card-back` – blauer Hintergrund (`var(--blue-light)`)
- `.card-category-badge` – Kategorie-Pill oben links
- `.card-term` – grosser Begriff (1.42rem, fett)
- `.card-question` – K2-Frage (0.97rem, fett) – für Frage-Karten
- `.card-explanation` / `.card-answer` – Erklärungstext Rückseite

**Steuerung (immer gleich):**
```html
<div class="controls">
  <button class="btn btn-ghost"   onclick="prevCard()">← Zurück</button>
  <button class="btn btn-success" onclick="flipCard()">Umdrehen</button>
  <button class="btn btn-ghost"   onclick="nextCard()">Weiter →</button>
</div>
<div class="controls">
  <button class="btn btn-primary" onclick="shuffleCards()">⇄ Mischen</button>
</div>
<p class="keyboard-hint">
  ← → navigieren | Leertaste umdrehen | S mischen
</p>
```

**Keyboard-Shortcuts (immer identisch):**
```javascript
document.addEventListener('keydown', e => {
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flipCard(); }
  if (e.key === 'ArrowRight') nextCard();
  if (e.key === 'ArrowLeft')  prevCard();
  if (e.key === 's' || e.key === 'S') shuffleCards();
});
```

**Fortschrittsanzeige (immer gleich):**
```html
<div class="progress-text" id="progressText"></div>
<div class="progress-bar-wrap">
  <div class="progress-bar-fill" id="progressBar"></div>
</div>
```
```javascript
document.getElementById('progressText').textContent = `Karte ${currentIndex + 1} von ${total}`;
document.getElementById('progressBar').style.width  = `${((currentIndex + 1) / total) * 100}%`;
```

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
