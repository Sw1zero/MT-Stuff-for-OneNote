// Schnittbild der Separator-Trommel im Betrieb: flach wie Westfalia MHA Bild 19, schematisch (eigene Masse,
// damit die Spalten breit genug sind). Rechte Hälfte in px (r nach rechts, y nach unten), die linke gespiegelt.
// Darstellung nach Vorbild Andritz-Animation: Flüssigkeiten als Farbflächen, die Trommel füllt sich beim Öffnen
// von unten, Striche zeigen die Fliessrichtung, nur der Schmutz wandert als Punkte nach aussen.
// Braucht ANLAGEN (anlagen.js). Testeinstieg: window.schnittbild (oeffnen, schliessen).

const SB_TEILE = [
  // [id aus anlagen.js, Polygone "r,y r,y ..." der rechten Hälfte, Ankerpunkt für die Beschriftung]
  ['trommelunterteil', ['50,625 250,625 290,610 300,580 300,420 275,420 275,602 50,602'], [300, 520]],
  ['kolbenschieber', ['40,575 272,575 272,538 258,538 250,555 70,530 40,530'], [200, 550]], // Rand verschliesst die Öffnungen
  ['verteiler', ['38,175 46,175 46,470 240,525 240,532 38,477'], [130, 494]],
  ['scheideteller', ['200,303 85,190 85,135 93,135 93,187 205,299'], [150, 251]], // aussen Spalt zum Trommeldeckel für die Magermilch
  ['trommeldeckel', ['300,420 300,400 120,140 120,90 108,90 108,143 288,398 288,420'], [250, 328]],
  ['trommelverschlussring', ['302,392 324,392 324,432 302,432'], [324, 410]],
  ['greiferkammerdeckel', ['58,76 126,76 126,90 58,90'], [90, 80]],
  ['greiferkammerverschlussring', ['120,62 136,62 136,100 126,100 126,76 120,76'], [136, 70]],
  ['magermilchgreifer', ['50,0 55,0 55,112 100,112 100,120 50,120'], [90, 116]],
  ['auffanghaube', ['305,495 345,495 345,665 300,665 300,659 339,659 339,501 305,501'], [345, 600]], // steht still
  ['einlaufrohr', ['14,0 20,0 20,430 14,430', '32,0 38,0 38,158 78,158 78,165 32,165'], [70, 161]]
];
// Teller (r 75 bis 245), 10 statt 70 bis 130. Steigloch nach Phasenanteil: Rahm rund 11 %, darum bei 1/10 der
// Tellerbreite vom Innenrand (r 92, Loch 82 bis 102). Quarkseparator gleiche Regel: Quark 25 % aussen, Loch bei 3/4.
const SB_TELLER = Array.from({ length: 10 }, (_, i) => [245, 505 - 16 * i, 75, 360 - 16 * i]);
const sbTellerY = (t, r) => t[1] + (t[3] - t[1]) * (t[0] - r) / (t[0] - t[2]);
const SB_LOCH = 92, SB_LOCH_B = 10; // Mitte und halbe Breite des Steiglochs
const SB_SPALT = (i, r = SB_LOCH) => sbTellerY(SB_TELLER[i], r) - 8; // Mitte des Tellerspalts über Teller i bei r
const SB_KANAL_OBEN = sbTellerY(SB_TELLER[9], SB_LOCH) + 4; // Steigkanal endet unter dem obersten Teller

// Flüssigkeitsräume, rechte Hälfte. Reihenfolge = Malreihenfolge.
const SB_ZONEN = [
  // ganzer Innenraum Magermilch, darüber die anderen
  ['magermilch', '0,90 108,90 108,143 288,398 288,420 275,420 275,580 40,580 40,530 0,530'], // Mitte unten: Spindel
  ['magermilch', '38,-20 50,-20 50,112 38,112'],                                      // Ableiter Magermilch
  ['tellerpaket', '46,135 85,135 85,190 200,303 245,361 245,520 240,525 46,470'],     // Verlauf Rahm innen bis Magermilch aussen
  ['rahm', '20,-20 32,-20 32,135 46,135 46,190 20,190'],                              // Rahmgreifer und Ableiter
  ['milch', `0,-20 14,-20 14,175 38,175 38,477 ${SB_LOCH - SB_LOCH_B},489 ${SB_LOCH - SB_LOCH_B},${SB_KANAL_OBEN} ${SB_LOCH + SB_LOCH_B},${SB_KANAL_OBEN} ${SB_LOCH + SB_LOCH_B},534 70,530 0,530`]
];
// Fliessrichtung als laufende Striche, im Tellerspalt vom Steigloch aus: Rahm kurz nach innen, Magermilch lang nach aussen.
const SB_STRICHE = [
  ['milch', [[7, -20], [7, 440], [40, 500], [SB_LOCH, 512], [SB_LOCH, SB_KANAL_OBEN + 8]]],
  ...[1, 4, 7].map(i => ['rahm', [[SB_LOCH - SB_LOCH_B, SB_SPALT(i, SB_LOCH - SB_LOCH_B)], [75, SB_SPALT(i, 75)], [60, SB_SPALT(i, 75)], [60, 200], [56, 165], [26, 150], [26, -20]]]),
  // Magermilch: aus den Tellerspalten nach aussen, dann gemeinsam an der Wand hoch, um den Scheideteller herum,
  // im Spalt zum Trommeldeckel nach innen und durch den Greifer hinaus. Gemeinsamer Weg nur einmal, sonst überlagern sich die Striche.
  ...[1, 4, 7].map(i => ['magermilch', [[SB_LOCH + SB_LOCH_B, SB_SPALT(i, SB_LOCH + SB_LOCH_B)], [245, SB_SPALT(i, 245)], [262, SB_SPALT(i, 245)]]]),
  ['magermilch', [[262, SB_SPALT(1, 245)], [262, 380], [225, 324], [205, 290], [150, 223], [100, 165], [100, 125], [80, 116], [44, 105], [44, -20]]]
];
const SB_SCHMUTZ = 18;       // Punkte je Hälfte
const SB_SCHMUTZ_TEMPO = 40; // px/s
const SB_FUELLZEIT = 3;      // s, bis die Trommel voll ist
const SB_DEPOT = 14;         // Plätze im Schlammdepot je Hälfte
const SB_HUB = 22;           // px, so weit fällt der Kolbenschieber bei der Teilentleerung
// Teilentleerung in s: Schieber fällt bis AUF, Schlamm spritzt bis ZU, Schieber steigt bis ENDE.
// In Wirklichkeit ist die Trommel nur rund 1 s offen, hier zum Zuschauen länger.
const SB_ENTLEER = { auf: 0.4, zu: 2.4, ende: 2.8 };
const SB_KAMMER = [575, 602]; // Schliesskammer zwischen Kolbenschieber und Trommelunterteil
// Teile, die nicht zu den 12 Trommelbestandteilen gehören (Lehrmittel a.2, S. 12 bis 14)
const SB_EXTRA = [
  { id: 'schliesskammer', name: 'Schliesskammer', text: 'In die Schliesskammer fliesst Steuerwasser. Es drückt durch die Zentrifugalkraft den Schieberboden (Kolbenschieber) nach oben: Die Trommel ist geschlossen. Fliesst das Wasser aus der Schliesskammer ab, bewegt sich der Schieberboden nach unten und gibt die Schlammaustrittsöffnungen frei.' },
  { id: 'auffanghaube', name: 'Schlammauffanghaube', text: 'In die Auffanghaube wird der Schlamm ausgeschleudert. Um eine Anlagerung der Feststoffe zu verhindern, wird sie vor und nach jeder Entleerung mit Wasser gespült.' }
];

// Lehrmittel a.2, S. 12 bis 14
const SB_TEILENTLEERUNG = 'Das Wasser fliesst aus der Schliesskammer ab. Weil nun kein Druck mehr von unten auf den Kolbenschieber wirkt, '
  + 'bewegt er sich ein wenig nach unten und gibt die Schlammaustrittsöffnungen frei: Der Schlamm wird in die Auffanghaube ausgeschleudert. '
  + 'Danach drückt das Steuerwasser in der Schliesskammer den Kolbenschieber wieder nach oben, die Trommel ist geschlossen. '
  + 'Die Öffnungen sind nur rund eine Sekunde offen, bei der Milchseparierung ca. alle dreissig Minuten. Die Produktzufuhr muss nicht unterbrochen werden.';

const svgEl = (tag, attrs, eltern) => {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (eltern) eltern.appendChild(e);
  return e;
};
const spiegel = pts => pts.split(' ').map(p => { const [r, y] = p.split(','); return `${-r},${y}`; }).join(' ');
const punkteVon = weg => weg.map(p => p.join(',')).join(' ');

function baueSchnittbild(svg, teile, zeigeTeil) {
  svg.setAttribute('viewBox', '-345 -40 995 740');
  const defs = svgEl('defs', {}, svg);
  // Tellerpaket: innen Rahm, am Steigloch Milch, aussen Magermilch (wird mit der Hälfte gespiegelt)
  const verlauf = svgEl('linearGradient', { id: 'sb-verlauf', gradientUnits: 'userSpaceOnUse', x1: 46, y1: 0, x2: 245, y2: 0 }, defs);
  [[0, 'var(--sb-rahm)'], [0.12, 'var(--sb-rahm)'], [0.18, 'var(--sb-milch)'], [0.28, 'var(--sb-milch)'], [0.45, 'var(--sb-mager)'], [1, 'var(--sb-mager)']] // Milch am Steigloch (r 82 bis 102), Rahm schmal: wenig Fett
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

  // Schlammdepot an der Trommelwand, über dem Rand des Kolbenschiebers. Füllt sich mit dem ankommenden Schmutz.
  const depot = { '-1': [], '1': [] }, stand = { '-1': 6, '1': 6 };
  for (let i = 0; i < SB_DEPOT; i++) for (const s of [-1, 1]) {
    const x = s * (262 + (i % 3) * 5), y = 470 + i * 5;
    depot[s].push({ x, y, el: svgEl('circle', { cx: x, cy: y, r: 3.2, class: 'sb-schlamm', 'data-sb-depot': '' }, svg) });
  }
  const zeigeDepot = () => { for (const s of [-1, 1]) depot[s].forEach((d, i) => { d.el.style.display = i < Math.floor(stand[s]) ? '' : 'none'; }); };
  zeigeDepot();

  const gruppen = {};
  const gruppe = id => gruppen[id] || (gruppen[id] = svgEl('g', { class: 'sb-teil', 'data-sb-teil': id, tabindex: 0 }, svg));
  for (const [id, polys] of SB_TEILE) for (const p of polys) {
    svgEl('polygon', { points: p }, gruppe(id));
    svgEl('polygon', { points: spiegel(p) }, gruppe(id));
  }
  for (const t of SB_TELLER) for (const s of [-1, 1]) {
    const a = SB_LOCH + SB_LOCH_B, b = SB_LOCH - SB_LOCH_B;
    svgEl('line', { x1: s * t[0], y1: t[1], x2: s * a, y2: sbTellerY(t, a), class: 'sb-teller' }, gruppe('tellerpaket'));
    svgEl('line', { x1: s * b, y1: sbTellerY(t, b), x2: s * t[2], y2: t[3], class: 'sb-teller' }, gruppe('tellerpaket'));
  }
  // Schlammaustrittsöffnungen in der Wand, vom Kolbenschieber verschlossen
  for (const s of [-1, 1]) svgEl('rect', { x: s > 0 ? 275 : -300, y: 545, width: 25, height: 9, class: 'sb-oeffnung' }, gruppe('trommelunterteil'));
  for (const s of [-1, 1]) svgEl('circle', { cx: s * 294, cy: 408, r: 5 }, gruppe('dichtring'));
  const wasser = [-1, 1].map(s => svgEl('rect', { x: s > 0 ? 40 : -275, y: SB_KAMMER[0], width: 235, height: SB_KAMMER[1] - SB_KAMMER[0], class: 'sb-wasser' }, gruppe('schliesskammer')));
  gruppe('schliesskammer').parentNode.insertBefore(gruppe('schliesskammer'), gruppe('trommelunterteil')); // unter den Teilen
  // Nur die Form des Kolbenschiebers bewegt sich, nicht seine Beschriftung
  const schieber = svgEl('g', {}, gruppe('kolbenschieber'));
  for (const p of [...gruppe('kolbenschieber').querySelectorAll(':scope > polygon')]) schieber.appendChild(p);

  // Beschriftung rechts, Linie zum Teil
  const reihe = ['greiferkammerverschlussring', 'greiferkammerdeckel', 'magermilchgreifer', 'einlaufrohr', 'scheideteller',
    'trommeldeckel', 'tellerpaket', 'dichtring', 'trommelverschlussring', 'verteiler', 'trommelunterteil', 'kolbenschieber',
    'schliesskammer', 'auffanghaube'];
  const anker = Object.fromEntries(SB_TEILE.map(t => [t[0], t[2]]));
  anker.tellerpaket = [220, sbTellerY(SB_TELLER[5], 220)];
  anker.dichtring = [294, 408];
  anker.schliesskammer = [200, 590];
  reihe.forEach((id, i) => {
    const y = 10 + i * 52, [ax, ay] = anker[id];
    const g = gruppe(id);
    svgEl('polyline', { points: `${ax},${ay} 360,${y} 372,${y}`, class: 'sb-linie' }, g);
    const tx = svgEl('text', { x: 378, y: y + 5, class: 'sb-text' }, g);
    tx.textContent = [...teile, ...SB_EXTRA].find(t => t.id === id).name;
  });

  // Ein- und Ausläufe oben, Drehpfeil unten
  [['Milch', 0, -5, -150, -14, 'end'], ['Rahm', -26, 5, -150, 14, 'end'], ['Magermilch', 44, -5, 150, -14, 'start']].forEach(([n, x, y, tx, ty, a]) => {
    svgEl('text', { x: tx, y: ty, class: 'sb-medium', 'text-anchor': a }, svg).textContent = n;
    svgEl('line', { x1: tx + (a === 'end' ? 5 : -5), y1: ty - 4, x2: x, y2: y, class: 'sb-linie' }, svg);
  });
  svgEl('path', { d: 'M -120 662 A 120 14 0 1 0 120 662', class: 'sb-dreh', 'marker-end': 'url(#sb-spitze)' }, svg);
  svgEl('text', { x: -120, y: 698, class: 'sb-medium' }, svg).textContent = 'dreht 5000 bis 7000 U/min';

  for (const [id, g] of Object.entries(gruppen)) {
    g.addEventListener('click', () => zeigeTeil(id));
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); zeigeTeil(id); } });
  }

  // Schmutz: vom Steigloch im Tellerspalt nach aussen, dann an der Wand hinunter ins Schlammdepot
  const schicht = svgEl('g', { class: 'sb-kugeln' }, svg);
  const schmutz = [];
  const neu = k => {
    const i = Math.floor(Math.random() * 9), r0 = SB_LOCH + SB_LOCH_B, h = SB_SPALT(i, r0), h2 = SB_SPALT(i, 245);
    k.weg = [[r0, h], [245, h2], [258 + Math.random() * 12, Math.max(h2 + 6, 450 + Math.random() * 100)]];
    k.len = Math.hypot(245 - r0, h2 - h) + Math.hypot(k.weg[2][0] - 245, k.weg[2][1] - h2);
    k.s = 0;
  };
  for (let i = 0; i < SB_SCHMUTZ * 2; i++) {
    const k = { seite: i % 2 ? 1 : -1, el: svgEl('circle', { r: 3.2, class: 'sb-schlamm' }, schicht) };
    neu(k);
    k.s = Math.random() * k.len;
    schmutz.push(k);
  }

  let zeit = 0, entleer = null, fertig = null;
  const entleeren = dt => {
    entleer.t += dt;
    const { t } = entleer, { auf, zu, ende } = SB_ENTLEER;
    const hub = t < auf ? t / auf : t < zu ? 1 : Math.max(0, 1 - (t - zu) / (ende - zu));
    schieber.setAttribute('transform', `translate(0 ${hub * SB_HUB})`);
    for (const w of wasser) { w.setAttribute('y', SB_KAMMER[0] + hub * SB_HUB); w.setAttribute('height', SB_KAMMER[1] - SB_KAMMER[0] - hub * SB_HUB); }
    // Schlamm: zur Öffnung, dann hinaus in die Auffanghaube, einer nach dem anderen
    for (const s of [-1, 1]) depot[s].forEach((d, i) => {
      const p = Math.min(Math.max((t - auf - i * 0.07) / 1, 0), 1);
      const weg = [[d.x, d.y], [s * 287, 549], [s * 335, 555 + (i % 5) * 8], [s * (308 + (i % 4) * 7), 653]], teil = [0.2, 0.45, 1];
      const k = teil.findIndex(g => p <= g), von = k ? teil[k - 1] : 0, f = (p - von) / (teil[k] - von);
      d.el.setAttribute('cx', weg[k][0] + (weg[k + 1][0] - weg[k][0]) * f);
      d.el.setAttribute('cy', weg[k][1] + (weg[k + 1][1] - weg[k][1]) * f);
      d.el.style.opacity = p < 0.8 ? 1 : (1 - p) / 0.2;
    });
    if (t < ende) return;
    for (const s of [-1, 1]) { stand[s] = 0; depot[s].forEach(d => { d.el.setAttribute('cx', d.x); d.el.setAttribute('cy', d.y); d.el.style.opacity = ''; }); }
    schieber.removeAttribute('transform');
    for (const w of wasser) { w.setAttribute('y', SB_KAMMER[0]); w.setAttribute('height', SB_KAMMER[1] - SB_KAMMER[0]); }
    zeigeDepot();
    entleer = null;
    fertig();
  };
  return {
    neustart() { zeit = 0; },
    entleeren(wennFertig) { if (!entleer) { entleer = { t: 0 }; fertig = wennFertig; } },
    schritt(dt) {
      zeit += dt;
      if (entleer) entleeren(dt);
      const voll = Math.min(zeit / SB_FUELLZEIT, 1);
      pegel.setAttribute('y', 600 - voll * 650);
      schicht.style.opacity = voll < 1 ? 0 : 1;
      if (voll < 1) return;
      for (const k of schmutz) {
        k.s += SB_SCHMUTZ_TEMPO * dt;
        if (k.s >= k.len) {
          if (!entleer) { stand[k.seite] = Math.min(SB_DEPOT, stand[k.seite] + 0.3); zeigeDepot(); }
          neu(k);
        }
        const l0 = Math.hypot(k.weg[1][0] - k.weg[0][0], k.weg[1][1] - k.weg[0][1]); // erstes Stück: im Tellerspalt
        const [a, b] = k.s < l0 ? [k.weg[0], k.weg[1]] : [k.weg[1], k.weg[2]];
        const s0 = k.s < l0 ? 0 : l0;
        const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, f = Math.min((k.s - s0) / l, 1);
        k.el.setAttribute('cx', k.seite * (a[0] + (b[0] - a[0]) * f));
        k.el.setAttribute('cy', a[1] + (b[1] - a[1]) * f);
      }
    }
  };
}

// Greifer von oben: Flüssigkeitsring rotiert, der Greifer steht still. Die Magermilchschraube (Drossel 0..100)
// verschiebt den Ring zur Mitte (Lehrmittel a.2, S. 7). Greifer reicht bis r 120, Kammerwand bei r 176.
const SB_GREIFER_TEXT = 'Die Flüssigkeiten Rahm und Magermilch rotieren mit Trommeldrehzahl und bilden in den jeweiligen Greiferkammern einen Flüssigkeitsring. '
  + 'Der stillstehende Greifer ragt in diesen Flüssigkeitsring hinein. Seine sichelförmigen Kanäle bremsen die Flüssigkeit ab: Geschwindigkeitsenergie wird in Druckenergie umgewandelt. '
  + 'Damit sich kein Schaum bilden kann, müssen die Greifer unbedingt in den Flüssigkeitsring eintauchen. Je stärker Sie die Abflussmenge drosseln, desto mehr verschiebt sich der Flüssigkeitsring zum Mittelpunkt.';
const sbRingInnen = drossel => 150 - 1.5 * drossel;
const sbGreiferZustand = r => r > 118 ? 'schaum' : r < 25 ? 'ueberlaufen' : 'gut';
const SB_GREIFER_STATUS = {
  schaum: 'Der Greifer taucht nicht in den Flüssigkeitsring ein: Es bildet sich Schaum.',
  gut: 'Der Greifer taucht in den Flüssigkeitsring ein und fördert die Magermilch schaumfrei durch den Ableiter.',
  ueberlaufen: 'Die Greiferkammer ist ganz mit Flüssigkeit gefüllt. Die überschüssige Flüssigkeit fliesst durch die Sicherheitsbohrungen ab: Der Separator läuft über.'
};
console.assert(sbGreiferZustand(sbRingInnen(0)) === 'schaum' && sbGreiferZustand(sbRingInnen(50)) === 'gut' && sbGreiferZustand(sbRingInnen(100)) === 'ueberlaufen', 'Greifer-Zustände');

function baueGreifer(svg) {
  svg.setAttribute('viewBox', '-330 -245 660 460');
  svgEl('circle', { r: 184, class: 'sb-kammerwand' }, svg);
  svgEl('circle', { r: 176, class: 'sb-zone-magermilch' }, svg);
  const luft = svgEl('circle', { r: 75, class: 'sb-luft' }, svg);
  svgEl('circle', { r: 165, class: 'sb-ring' }, svg); // dreht sich: zeigt die Rotation des Flüssigkeitsrings
  svgEl('circle', { r: 120, class: 'sb-greifer' }, svg);
  const kanaele = svgEl('g', {}, svg);
  for (let k = 0; k < 4; k++) {
    const pts = [];
    for (let r = 120; r >= 22; r -= 7) { const w = k * Math.PI / 2 + (120 - r) / 98 * 1.2; pts.push(`${(r * Math.cos(w)).toFixed(1)},${(r * Math.sin(w)).toFixed(1)}`); }
    svgEl('polyline', { points: pts.join(' '), class: 'sb-kanal' }, kanaele);
    svgEl('polyline', { points: pts.join(' '), class: 'sb-strich sb-strich-magermilch' }, kanaele);
  }
  svgEl('circle', { r: 22, class: 'sb-ableiter' }, svg);
  svgEl('path', { d: 'M 120 -176 A 212 212 0 0 1 200 -40', class: 'sb-dreh', 'marker-end': 'url(#sb-spitze-g)' }, svg);
  const mk = svgEl('marker', { id: 'sb-spitze-g', viewBox: '0 0 10 10', refX: 5, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, svgEl('defs', {}, svg));
  svgEl('path', { d: 'M0,0 L10,5 L0,10 z', class: 'sb-spitze' }, mk);
  svgEl('text', { x: 0, y: -222, class: 'sb-medium', 'text-anchor': 'middle' }, svg).textContent = 'Der Flüssigkeitsring dreht mit der Trommel';
  [['Flüssigkeitsring', 205, -110, 155, -65, 'start'], ['Greifer steht still', 205, 120, 95, 60, 'start'],
   ['Ableiter', -205, 120, -18, 12, 'end'], ['Luft', -205, -120, -40, -40, 'end'], ['Kammerwand', -205, 175, -130, 135, 'end']]
    .forEach(([n, tx, ty, x, y, a]) => {
      svgEl('line', { x1: tx + (a === 'end' ? 4 : -4), y1: ty - 5, x2: x, y2: y, class: 'sb-linie' }, svg);
      svgEl('text', { x: tx, y: ty, class: 'sb-medium', 'text-anchor': a }, svg).textContent = n;
    });
  return drossel => {
    const r = sbRingInnen(drossel), zustand = sbGreiferZustand(r);
    luft.setAttribute('r', Math.max(r, 0));
    kanaele.classList.toggle('sb-trocken', zustand === 'schaum');
    return zustand;
  };
}

window.schnittbild = (() => {
  let bild = null, lauf = null, vorher = 0, greifer = null;
  const d = () => document.querySelector('[data-testid="schnittbild"]');
  const zeigeTeil = (id, teile) => {
    const t = [...teile, ...SB_EXTRA].find(t => t.id === id);
    d().querySelector('[data-testid="schnittbild-teil"]').textContent = t.name;
    d().querySelector('[data-testid="schnittbild-text"]').textContent = t.text;
    const bild = d().querySelector('[data-testid="schnittbild-bild"]');
    bild.hidden = !t.bild;
    if (t.bild) { bild.src = t.bild; bild.alt = `Zeichnung ${t.name}`; }
    for (const g of d().querySelectorAll('[data-sb-teil]')) g.classList.toggle('sb-aktiv', g.dataset.sbTeil === id);
  };
  const entleeren = () => {
    const knopf = d().querySelector('[data-testid="schnittbild-entleeren"]');
    knopf.disabled = true;
    d().querySelector('[data-testid="schnittbild-teil"]').textContent = 'Teilentleerung';
    d().querySelector('[data-testid="schnittbild-bild"]').hidden = true;
    d().querySelector('[data-testid="schnittbild-text"]').textContent = SB_TEILENTLEERUNG;
    for (const g of d().querySelectorAll('[data-sb-teil]')) g.classList.toggle('sb-aktiv', g.dataset.sbTeil === 'kolbenschieber');
    bild.entleeren(() => { knopf.disabled = false; });
  };
  const drossel = () => {
    const z = greifer(+d().querySelector('[data-testid="greifer-drossel"]').value);
    const status = d().querySelector('[data-testid="greifer-status"]');
    status.textContent = SB_GREIFER_STATUS[z];
    status.dataset.zustand = z;
  };
  const ansicht = (welche, teile) => {
    const g = welche === 'greifer';
    d().dataset.ansicht = welche;
    d().querySelector('[data-testid="greifer-ansicht"]').hidden = !g;
    d().querySelector('[data-testid="schnittbild-entleeren"]').hidden = g;
    d().querySelector('[data-testid="schnittbild-greifer"]').textContent = g ? 'Zurück zum Schnitt' : 'Greifer von oben';
    d().querySelector('#mk-schnitt-titel').textContent = g ? 'Greifer von oben' : 'Separator-Trommel im Betrieb';
    d().querySelector('[data-testid="schnittbild-bild"]').hidden = true;
    if (g) {
      if (!greifer) greifer = baueGreifer(d().querySelector('[data-testid="greifer-ansicht"] svg'));
      d().querySelector('[data-testid="schnittbild-teil"]').textContent = 'Greifer (Schälkörper)';
      d().querySelector('[data-testid="schnittbild-text"]').textContent = SB_GREIFER_TEXT;
      drossel();
    } else {
      d().querySelector('[data-testid="schnittbild-teil"]').textContent = 'Teil anklicken';
      d().querySelector('[data-testid="schnittbild-text"]').textContent = d().querySelector('[data-testid="schnittbild-text"]').dataset.start;
    }
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
      ansicht('schnitt');
      d().showModal();
      // Die 3D-Szene ist hinter dem Dialog verdeckt: nicht rendern, sonst ruckelt das Schnittbild auf schwachen Laptops
      const szene = document.querySelector('a-scene');
      if (szene && szene.renderer) szene.renderer.setAnimationLoop(null);
      vorher = performance.now();
      if (!lauf) lauf = requestAnimationFrame(tick);
    },
    schliessen() { d().close(); },
    anhalten() {
      cancelAnimationFrame(lauf); lauf = null;
      const szene = document.querySelector('a-scene');
      if (szene && szene.renderer) szene.renderer.setAnimationLoop(szene.render);
    },
    entleeren,
    greifer() { ansicht(d().dataset.ansicht === 'greifer' ? 'schnitt' : 'greifer'); },
    drossel
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  const d = document.querySelector('[data-testid="schnittbild"]');
  d.querySelector('[data-testid="schnittbild-schliessen"]').addEventListener('click', () => d.close());
  d.addEventListener('close', () => window.schnittbild.anhalten());
  d.querySelector('[data-testid="schnittbild-entleeren"]').addEventListener('click', () => window.schnittbild.entleeren());
  d.querySelector('[data-testid="schnittbild-greifer"]').addEventListener('click', () => window.schnittbild.greifer());
  d.querySelector('[data-testid="greifer-drossel"]').addEventListener('input', () => window.schnittbild.drossel());
  const text = d.querySelector('[data-testid="schnittbild-text"]');
  text.dataset.start = text.textContent;
});
