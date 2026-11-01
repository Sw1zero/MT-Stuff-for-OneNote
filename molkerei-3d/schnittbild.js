// Schnittbild der Separator-Trommel im Betrieb: flach wie Westfalia MHA Bild 19, schematisch (eigene Masse,
// damit die Spalten breit genug sind). Rechte Hälfte in px (r nach rechts, y nach unten), die linke gespiegelt.
// Darstellung nach Vorbild Andritz-Animation: Flüssigkeiten als Farbflächen, die Trommel füllt sich beim Öffnen
// von unten, Striche zeigen die Fliessrichtung, nur der Schmutz wandert als Punkte nach aussen.
// Braucht ANLAGEN (anlagen.js). Testeinstieg: window.schnittbild (oeffnen, schliessen).

const SB_TEILE = [
  // [id aus anlagen.js, Polygone "r,y r,y ..." der rechten Hälfte, Ankerpunkt für die Beschriftung]
  ['trommelunterteil', ['50,600 250,600 290,585 300,555 300,420 275,420 275,580 50,580'], [300, 520]],
  ['kolbenschieber', ['40,575 270,575 272,562 250,555 70,530 40,530'], [200, 550]],
  ['verteiler', ['38,175 46,175 46,470 240,525 240,532 38,477'], [130, 494]],
  ['scheideteller', ['235,338 85,190 85,135 93,135 93,187 240,334'], [150, 251]],
  ['trommeldeckel', ['300,420 300,400 120,140 120,90 108,90 108,143 288,398 288,420'], [250, 328]],
  ['trommelverschlussring', ['302,392 324,392 324,432 302,432'], [324, 410]],
  ['greiferkammerdeckel', ['58,76 126,76 126,90 58,90'], [90, 80]],
  ['greiferkammerverschlussring', ['120,62 136,62 136,100 126,100 126,76 120,76'], [136, 70]],
  ['magermilchgreifer', ['50,0 55,0 55,112 100,112 100,120 50,120'], [90, 116]],
  ['einlaufrohr', ['14,0 20,0 20,430 14,430', '32,0 38,0 38,158 78,158 78,165 32,165'], [70, 161]]
];
// Teller mit Steigloch bei r 160..180, 10 statt 70 bis 130
const SB_TELLER = Array.from({ length: 10 }, (_, i) => [245, 505 - 16 * i, 75, 360 - 16 * i]);
const sbTellerY = (t, r) => t[1] + (t[3] - t[1]) * (t[0] - r) / (t[0] - t[2]);
const SB_SPALT = i => 433 - 16 * i; // Mitte des Tellerspalts i am Steigloch (r 170)

// Flüssigkeitsräume, rechte Hälfte. Reihenfolge = Malreihenfolge.
const SB_ZONEN = [
  // ganzer Innenraum Magermilch, darüber die anderen
  ['magermilch', '0,90 108,90 108,143 288,398 288,420 275,420 275,580 40,580 40,530 0,530'], // Mitte unten: Spindel
  ['magermilch', '38,-20 50,-20 50,112 38,112'],                                      // Ableiter Magermilch
  ['tellerpaket', '46,135 85,135 85,190 240,338 245,361 245,520 240,525 46,470'],     // Verlauf Rahm innen bis Magermilch aussen
  ['rahm', '20,-20 32,-20 32,135 46,135 46,190 20,190'],                              // Rahmgreifer und Ableiter
  ['milch', '0,-20 14,-20 14,175 38,175 38,477 160,510 160,300 180,300 180,545 70,530 0,530']
];
// Fliessrichtung als laufende Striche. h = Tellerspalt am Steigloch.
const SB_STRICHE = [
  ['milch', [[7, -20], [7, 440], [40, 500], [170, 528], [170, 310]]],
  ...[1, 4, 7].map(i => ['rahm', [[165, SB_SPALT(i) - 4], [75, SB_SPALT(i) - 81], [60, SB_SPALT(i) - 81], [60, 200], [56, 165], [26, 150], [26, -20]]]),
  ...[1, 4, 7].map(i => ['magermilch', [[175, SB_SPALT(i) + 4], [245, SB_SPALT(i) + 64], [262, SB_SPALT(i) + 64], [262, 380], [96, 168], [96, 125], [80, 116], [44, 105], [44, -20]]])
];
const SB_SCHMUTZ = 18;       // Punkte je Hälfte
const SB_SCHMUTZ_TEMPO = 40; // px/s
const SB_FUELLZEIT = 3;      // s, bis die Trommel voll ist

const svgEl = (tag, attrs, eltern) => {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (eltern) eltern.appendChild(e);
  return e;
};
const spiegel = pts => pts.split(' ').map(p => { const [r, y] = p.split(','); return `${-r},${y}`; }).join(' ');
const punkteVon = weg => weg.map(p => p.join(',')).join(' ');

function baueSchnittbild(svg, teile, zeigeTeil) {
  svg.setAttribute('viewBox', '-340 -40 990 680');
  const defs = svgEl('defs', {}, svg);
  // Tellerpaket: innen Rahm, am Steigloch Milch, aussen Magermilch (wird mit der Hälfte gespiegelt)
  const verlauf = svgEl('linearGradient', { id: 'sb-verlauf', gradientUnits: 'userSpaceOnUse', x1: 46, y1: 0, x2: 245, y2: 0 }, defs);
  [[0, 'var(--sb-rahm)'], [0.12, 'var(--sb-rahm)'], [0.5, 'var(--sb-milch)'], [0.62, 'var(--sb-milch)'], [0.8, 'var(--sb-mager)'], [1, 'var(--sb-mager)']] // Rahm schmal: wenig Fett
    .forEach(([o, c]) => svgEl('stop', { offset: o, style: `stop-color: ${c}` }, verlauf));
  // Auffüllen: Rechteck, das von unten hochfährt
  const clip = svgEl('clipPath', { id: 'sb-fuellung' }, defs);
  const pegel = svgEl('rect', { x: -400, y: 600, width: 800, height: 700 }, clip);
  const mk = svgEl('marker', { id: 'sb-spitze', viewBox: '0 0 10 10', refX: 5, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, defs);
  svgEl('path', { d: 'M0,0 L10,5 L0,10 z', class: 'sb-spitze' }, mk);

  // Flüssigkeit: rechte Hälfte zeichnen, linke per <use> spiegeln
  svgEl('polygon', { points: '-275,580 275,580 275,420 288,420 288,398 108,143 108,90 -108,90 -108,143 -288,398 -288,420 -275,420', class: 'sb-leer' }, svg);
  const fluessig = svgEl('g', { 'clip-path': 'url(#sb-fuellung)' }, svg);
  const rechts = svgEl('g', { id: 'sb-fluessig' }, fluessig);
  for (const [medium, p] of SB_ZONEN) svgEl('polygon', { points: p, class: `sb-zone sb-zone-${medium}`, 'data-sb-zone': medium }, rechts);
  for (const [medium, weg] of SB_STRICHE) svgEl('polyline', { points: punkteVon(weg), class: `sb-strich sb-strich-${medium}` }, rechts);
  svgEl('use', { href: '#sb-fluessig', transform: 'scale(-1,1)' }, fluessig);
  // Die Milch fliesst schon vor dem Auffüllen ein, darum ausserhalb der Füllung noch einmal das Einlaufrohr
  for (const s of [-1, 1]) svgEl('rect', { x: s > 0 ? 0 : -14, y: -20, width: 14, height: 450, class: 'sb-zone sb-zone-milch' }, svg);

  // Schlammdepot an der Trommelwand
  for (let i = 0; i < 14; i++) for (const s of [-1, 1]) svgEl('circle', { cx: s * (262 + (i % 3) * 5), cy: 470 + i * 7, r: 3.2, class: 'sb-schlamm' }, svg);

  const gruppen = {};
  const gruppe = id => gruppen[id] || (gruppen[id] = svgEl('g', { class: 'sb-teil', 'data-sb-teil': id, tabindex: 0 }, svg));
  for (const [id, polys] of SB_TEILE) for (const p of polys) {
    svgEl('polygon', { points: p }, gruppe(id));
    svgEl('polygon', { points: spiegel(p) }, gruppe(id));
  }
  for (const t of SB_TELLER) for (const s of [-1, 1]) {
    svgEl('line', { x1: s * t[0], y1: t[1], x2: s * 180, y2: sbTellerY(t, 180), class: 'sb-teller' }, gruppe('tellerpaket'));
    svgEl('line', { x1: s * 160, y1: sbTellerY(t, 160), x2: s * t[2], y2: t[3], class: 'sb-teller' }, gruppe('tellerpaket'));
  }
  // Schlammaustrittsöffnungen in der Wand, vom Kolbenschieber verschlossen
  for (const s of [-1, 1]) svgEl('rect', { x: s > 0 ? 275 : -300, y: 545, width: 25, height: 9, class: 'sb-oeffnung' }, gruppe('trommelunterteil'));
  for (const s of [-1, 1]) svgEl('circle', { cx: s * 294, cy: 408, r: 5 }, gruppe('dichtring'));

  // Beschriftung rechts, Linie zum Teil
  const reihe = ['greiferkammerverschlussring', 'greiferkammerdeckel', 'magermilchgreifer', 'einlaufrohr', 'scheideteller',
    'trommeldeckel', 'tellerpaket', 'dichtring', 'trommelverschlussring', 'verteiler', 'trommelunterteil', 'kolbenschieber'];
  const anker = Object.fromEntries(SB_TEILE.map(t => [t[0], t[2]]));
  anker.tellerpaket = [220, sbTellerY(SB_TELLER[5], 220)];
  anker.dichtring = [294, 408];
  reihe.forEach((id, i) => {
    const y = 10 + i * 52, [ax, ay] = anker[id];
    const g = gruppe(id);
    svgEl('polyline', { points: `${ax},${ay} 360,${y} 372,${y}`, class: 'sb-linie' }, g);
    const tx = svgEl('text', { x: 378, y: y + 5, class: 'sb-text' }, g);
    tx.textContent = teile.find(t => t.id === id).name;
  });

  // Ein- und Ausläufe oben, Drehpfeil unten
  [['Milch', 0, -5, -150, -14, 'end'], ['Rahm', -26, 5, -150, 14, 'end'], ['Magermilch', 44, -5, 150, -14, 'start']].forEach(([n, x, y, tx, ty, a]) => {
    svgEl('text', { x: tx, y: ty, class: 'sb-medium', 'text-anchor': a }, svg).textContent = n;
    svgEl('line', { x1: tx + (a === 'end' ? 5 : -5), y1: ty - 4, x2: x, y2: y, class: 'sb-linie' }, svg);
  });
  svgEl('path', { d: 'M -120 622 A 120 14 0 1 0 120 622', class: 'sb-dreh', 'marker-end': 'url(#sb-spitze)' }, svg);
  svgEl('text', { x: 140, y: 640, class: 'sb-medium' }, svg).textContent = 'dreht 5000 bis 7000 U/min';

  for (const [id, g] of Object.entries(gruppen)) {
    g.addEventListener('click', () => zeigeTeil(id));
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); zeigeTeil(id); } });
  }

  // Schmutz: vom Steigloch im Tellerspalt nach aussen, dann an der Wand hinunter ins Schlammdepot
  const schicht = svgEl('g', { class: 'sb-kugeln' }, svg);
  const schmutz = [];
  const neu = k => {
    const h = SB_SPALT(Math.floor(Math.random() * 9));
    k.weg = [[170, h], [245, h + 64], [258 + Math.random() * 12, Math.max(h + 70, 450 + Math.random() * 100)]];
    k.len = Math.hypot(75, 64) + Math.hypot(k.weg[2][0] - 245, k.weg[2][1] - h - 64);
    k.s = 0;
  };
  for (let i = 0; i < SB_SCHMUTZ * 2; i++) {
    const k = { seite: i % 2 ? 1 : -1, el: svgEl('circle', { r: 3.2, class: 'sb-schlamm' }, schicht) };
    neu(k);
    k.s = Math.random() * k.len;
    schmutz.push(k);
  }

  let zeit = 0;
  return {
    neustart() { zeit = 0; },
    schritt(dt) {
      zeit += dt;
      const voll = Math.min(zeit / SB_FUELLZEIT, 1);
      pegel.setAttribute('y', 600 - voll * 650);
      schicht.style.opacity = voll < 1 ? 0 : 1;
      if (voll < 1) return;
      for (const k of schmutz) {
        k.s += SB_SCHMUTZ_TEMPO * dt;
        if (k.s >= k.len) neu(k);
        const [a, b] = k.s < Math.hypot(75, 64) ? [k.weg[0], k.weg[1]] : [k.weg[1], k.weg[2]];
        const s0 = k.s < Math.hypot(75, 64) ? 0 : Math.hypot(75, 64);
        const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, f = Math.min((k.s - s0) / l, 1);
        k.el.setAttribute('cx', k.seite * (a[0] + (b[0] - a[0]) * f));
        k.el.setAttribute('cy', a[1] + (b[1] - a[1]) * f);
      }
    }
  };
}

window.schnittbild = (() => {
  let bild = null, lauf = null, vorher = 0;
  const d = () => document.querySelector('[data-testid="schnittbild"]');
  const zeigeTeil = (id, teile) => {
    const t = teile.find(t => t.id === id);
    d().querySelector('[data-testid="schnittbild-teil"]').textContent = t.name;
    d().querySelector('[data-testid="schnittbild-text"]').textContent = t.text;
    for (const g of d().querySelectorAll('[data-sb-teil]')) g.classList.toggle('sb-aktiv', g.dataset.sbTeil === id);
  };
  const tick = t => {
    bild.schritt(Math.min((t - vorher) / 1000, 0.1));
    vorher = t;
    lauf = requestAnimationFrame(tick);
  };
  return {
    oeffnen(anlageId) {
      const teile = ANLAGEN.find(a => a.id === anlageId).teile;
      if (!bild) bild = baueSchnittbild(d().querySelector('svg'), teile, id => zeigeTeil(id, teile));
      bild.neustart();
      d().showModal();
      vorher = performance.now();
      if (!lauf) lauf = requestAnimationFrame(tick);
    },
    schliessen() { d().close(); },
    anhalten() { cancelAnimationFrame(lauf); lauf = null; }
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  const d = document.querySelector('[data-testid="schnittbild"]');
  d.querySelector('[data-testid="schnittbild-schliessen"]').addEventListener('click', () => d.close());
  d.addEventListener('close', () => window.schnittbild.anhalten());
});
