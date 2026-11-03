// Schnittbilder Quarklinie: Quarkseparator (Düsenseparator) und Kreiskolbenpumpe.
// Separator: Trommel im Schnitt, rechte Hälfte in px (r nach rechts, y nach unten), links gespiegelt. Steiglöcher bei 3/4 der
// Tellerbreite (Quark 25 % aussen), Quark als Punkte durch die Düsen in den Auffangraum. Texte: Lehrmittel b.5 «Separieren».
// Pumpe: Pumpenkammer von vorne, zwei Dreiflügelkolben drehen gegenläufig und tragen den Quark aussen herum. Text: a.1.
// Braucht ANLAGEN (anlagen.js), svgEl, spiegel und punkteVon (schnittbild.js). Testeinstieg: window.quarkSchnitt, window.kreiskolbenSchnitt.

// --- Quarkseparator
const QS_TELLER = Array.from({ length: 9 }, (_, i) => [250, 450 - 16 * i, 92, 300 - 16 * i]); // [r aussen, y, r innen, y]
const qsTellerY = (t, r) => t[1] + (t[3] - t[1]) * (t[0] - r) / (t[0] - t[2]);
const QS_LOCH = 92 + 0.75 * (250 - 92), QS_LOCH_B = 10; // Steigloch bei 3/4 der Tellerbreite
const qsSpalt = (i, r) => qsTellerY(QS_TELLER[i], r) - 8;
const QS_TEILE = [
  // [id, Polygone rechte Hälfte, Anker für die Beschriftung]
  ['haube', ['48,0 62,0 312,290 312,470 298,470 298,295 48,14'], [210, 180]],
  ['zulauf', ['14,-30 20,-30 20,470 14,470', '34,60 40,60 40,452 150,480 150,488 34,462'], [100, 470]],
  ['molkenablauf', ['32,-30 36,-30 36,96 70,96 70,104 32,104'], [60, 100]]
];
const QS_TROMMEL = '40,500 80,500 288,392 288,342 80,122 40,122 40,112 88,112 300,338 300,396 88,512 40,512'; // Wand, dreht mit
const QS_DUESE = [289, 361, 14, 12]; // x, y, Breite, Höhe
const QS_STRICHE = [
  ['gallerte', [[7, -30], [7, 470], [40, 476], [QS_LOCH, 496], [QS_LOCH, qsTellerY(QS_TELLER[8], QS_LOCH) + 6]]],
  ...[1, 4, 7].map(i => ['molke', [[QS_LOCH - QS_LOCH_B, qsSpalt(i, QS_LOCH - QS_LOCH_B)], [92, qsSpalt(i, 92)], [62, qsSpalt(i, 92)], [62, 108], [26, 100], [26, -30]]]),
  ...[1, 4, 7].map(i => ['quark', [[QS_LOCH + QS_LOCH_B, qsSpalt(i, QS_LOCH + QS_LOCH_B)], [250, qsSpalt(i, 250)], [278, qsSpalt(i, 250)], [282, 367]]])
];
const QS_ZONEN = [
  ['molke', '40,122 80,122 288,342 288,392 80,500 40,500'],
  ['molke', '20,-30 32,-30 32,104 20,104'],
  ['tellerpaket', `92,${300 - 16 * 8} 250,${450 - 16 * 8 + 10} 250,460 92,310`],
  ['quark', '250,300 288,342 288,392 250,412'],
  ['gallerte', `0,-30 14,-30 14,470 40,476 ${QS_LOCH - QS_LOCH_B},482 ${QS_LOCH - QS_LOCH_B},${qsTellerY(QS_TELLER[8], QS_LOCH)} ${QS_LOCH + QS_LOCH_B},${qsTellerY(QS_TELLER[8], QS_LOCH)} ${QS_LOCH + QS_LOCH_B},500 0,500`]
];
const QS_PUNKTE = 14; // je Seite
const QS_TEXT = 'Die Quarkgallerte (weiss) wird von oben zugeführt, im Zentrum nach unten geleitet und steigt durch die Löcher im Tellerpaket nach oben. '
  + 'Der Quark (beige) mit der grösseren Dichte wird nach aussen gedrückt und verlässt die Trommel über die Düsen. Er prallt im Auffangraum auf die Separatorhülle. '
  + 'Die Molke (grün) wird Richtung Zentrum verdrängt und verlässt über einen Greifer den Separator.';

function baueQuarkseparator(svg, zeigeTeil) {
  svg.setAttribute('viewBox', '-340 -60 1000 740');
  const defs = svgEl('defs', {}, svg);
  const verlauf = svgEl('linearGradient', { id: 'qs-verlauf', gradientUnits: 'userSpaceOnUse', x1: 92, y1: 0, x2: 250, y2: 0 }, defs);
  const l = (QS_LOCH - 92) / 158, b = QS_LOCH_B / 158;
  [[0, 'var(--sw-molke)'], [l - b - 0.12, 'var(--sw-molke)'], [l - b, '#ffffff'], [l + b, '#ffffff'], [l + b + 0.06, 'var(--sw-quark)'], [1, 'var(--sw-quark)']]
    .forEach(([o, c]) => svgEl('stop', { offset: o, style: `stop-color: ${c}` }, verlauf));
  const mk = svgEl('marker', { id: 'qs-spitze', viewBox: '0 0 10 10', refX: 5, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, defs);
  svgEl('path', { d: 'M0,0 L10,5 L0,10 z', class: 'sb-spitze' }, mk);

  const gruppen = {};
  const gruppe = id => gruppen[id] || (gruppen[id] = svgEl('g', { class: 'sb-teil', 'data-sb-teil': id, tabindex: 0, role: 'button' }, svg));
  // Flüssigkeit rechts zeichnen, links spiegeln
  const rechts = svgEl('g', { id: 'qs-fluessig' }, svg);
  for (const [m, p] of QS_ZONEN) svgEl('polygon', { points: p, class: `qs-zone qs-zone-${m}` }, rechts);
  for (const [m, w] of QS_STRICHE) svgEl('polyline', { points: punkteVon(w), class: `sb-strich qs-strich-${m}` }, rechts);
  svgEl('use', { href: '#qs-fluessig', transform: 'scale(-1,1)' }, svg);
  // Auffangraum unten: Boden fällt zum Quarkablauf rechts
  svgEl('polygon', { points: '-298,470 298,470 298,548 -298,520', class: 'qs-auffang' }, svg);

  for (const [id, polys] of QS_TEILE) for (const p of polys) {
    svgEl('polygon', { points: p }, gruppe(id)); svgEl('polygon', { points: spiegel(p) }, gruppe(id));
  }
  for (const s of [-1, 1]) svgEl('polygon', { points: s > 0 ? QS_TROMMEL : spiegel(QS_TROMMEL), class: 'qs-trommel' }, svg);
  for (const t of QS_TELLER) for (const s of [-1, 1]) {
    const a = QS_LOCH + QS_LOCH_B, b2 = QS_LOCH - QS_LOCH_B;
    svgEl('line', { x1: s * t[0], y1: t[1], x2: s * a, y2: qsTellerY(t, a), class: 'sb-teller' }, gruppe('tellerpaket'));
    svgEl('line', { x1: s * b2, y1: qsTellerY(t, b2), x2: s * t[2], y2: t[3], class: 'sb-teller' }, gruppe('tellerpaket'));
  }
  const [dx, dy, dw, dh] = QS_DUESE;
  for (const s of [-1, 1]) svgEl('rect', { x: s > 0 ? dx : -dx - dw, y: dy, width: dw, height: dh, class: 'qs-duese' }, gruppe('duesen'));
  // Boden des Auffangraums fällt nach rechts, dort der Quarkablauf hinaus und hinunter zum Vorlaufgefäss
  svgEl('polygon', { points: '298,540 372,540 372,690 358,690 358,554 298,554', class: 'qs-zone-quark' }, svg);
  svgEl('polygon', { points: '-312,470 -298,470 -298,520 298,554 358,554 358,690 344,690 344,568 298,568 -312,534', class: 'qs-gestell' }, svg);
  svgEl('polygon', { points: '298,470 312,470 312,526 386,526 386,690 372,690 372,540 298,540' }, gruppe('quarkablauf'));
  // Beschriftung rechts mit Linie
  const anker = { haube: [250, 240], zulauf: [17, 300], molkenablauf: [29, 40], tellerpaket: [180, qsTellerY(QS_TELLER[4], 180)], duesen: [300, 367], quarkablauf: [379, 620] };
  ['molkenablauf', 'zulauf', 'haube', 'tellerpaket', 'duesen', 'quarkablauf'].forEach((id, i) => {
    const y = 20 + i * 90, [ax, ay] = anker[id], g = gruppe(id);
    svgEl('polyline', { points: `${ax},${ay} 400,${y} 412,${y}`, class: 'sb-linie' }, g);
    svgEl('text', { x: 418, y: y + 5, class: 'sb-text' }, g).textContent = ANLAGEN.find(a => a.id === 'quarkseparator').teile.find(t => t.id === id).name;
  });
  [['Quarkgallerte', 0, -35, -130, -45, 'end'], ['Molke', -26, -35, -130, -15, 'end']].forEach(([n, x, y, tx, ty, a]) => {
    svgEl('text', { x: tx, y: ty, class: 'sb-medium', 'text-anchor': a }, svg).textContent = n;
    svgEl('line', { x1: tx + 5, y1: ty - 4, x2: x, y2: y, class: 'sb-linie' }, svg);
  });
  svgEl('text', { x: 395, y: 655, class: 'sb-medium' }, svg).textContent = 'Quark zum Vorlaufgefäss';
  svgEl('path', { d: 'M -120 625 A 120 14 0 1 0 120 625', class: 'sb-dreh', 'marker-end': 'url(#qs-spitze)' }, svg);
  for (const [id, g] of Object.entries(gruppen)) {
    g.addEventListener('click', () => zeigeTeil(id));
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); zeigeTeil(id); } });
  }

  // Quarkpunkte: aus der Düse an die Haube, an der Wand hinunter, über den Boden zum Ablauf (links gespiegelt, rechts hinaus)
  const schicht = svgEl('g', { class: 'sb-kugeln' }, svg);
  const weg = s => s > 0 ? [[302, 367], [306, 380], [305, 470], [296, 547], [365, 547], [365, 690]] : [[-302, 367], [-306, 380], [-305, 470], [-292, 513]]; // links bleibt er am Boden liegen, rutscht im Bild nicht nach
  const punkte = [];
  for (let i = 0; i < QS_PUNKTE * 2; i++) punkte.push({ s: i % 2 ? 1 : -1, t: Math.random(), el: svgEl('circle', { r: 4, class: 'qs-punkt' }, schicht) });
  const lage = (w, t) => {
    const len = w.slice(1).map((p, i) => Math.hypot(p[0] - w[i][0], p[1] - w[i][1])), ges = len.reduce((a, b) => a + b);
    let d = t * ges, k = 0;
    while (k < len.length - 1 && d > len[k]) d -= len[k++];
    const f = d / len[k];
    return [w[k][0] + (w[k + 1][0] - w[k][0]) * f, w[k][1] + (w[k + 1][1] - w[k][1]) * f];
  };
  return {
    schritt(dt) {
      for (const p of punkte) {
        p.t = (p.t + dt * 0.18) % 1;
        const [x, y] = lage(weg(p.s), p.t);
        p.el.setAttribute('cx', x); p.el.setAttribute('cy', y);
      }
    }
  };
}

// --- Kreiskolbenpumpe: Kammer von vorne, Saugseite rechts (zum Vorlaufgefäss), Druckseite links
const KP_A = 92, KP_B = 32, KP_C = [[400, 190], [400, 374]]; // Grundradius, Flügelhöhe, Wellen oben und unten (Abstand 2 * KP_A)
const KP_RG = KP_A + KP_B + 8; // Kammer
const kpKolben = () => {
  const p = [];
  for (let i = 0; i < 120; i++) {
    const f = 2 * Math.PI * i / 120, r = KP_A + KP_B * Math.cos(3 * f - Math.PI / 2); // Lücke unten beim oberen, Flügel oben beim unteren
    p.push(`${(r * Math.cos(f)).toFixed(1)},${(r * Math.sin(f)).toFixed(1)}`);
  }
  return p.join(' ');
};
const kpKammer = r => { // Achterform aus zwei Kreisen
  const [[x, y1], [, y2]] = KP_C, w = Math.sqrt(r * r - ((y2 - y1) / 2) ** 2);
  return `M${x - w},${(y1 + y2) / 2} A${r},${r} 0 1 1 ${x + w},${(y1 + y2) / 2} A${r},${r} 0 1 1 ${x - w},${(y1 + y2) / 2} Z`;
};

function baueKreiskolben(svg, zeigeTeil) {
  svg.setAttribute('viewBox', '60 20 680 540');
  const teil = (id, name, ax, ay, anker = 'start') => {
    const g = svgEl('g', { class: 'sb-teil', 'data-sb-teil': id, tabindex: 0, role: 'button', 'aria-label': name }, svg);
    g.addEventListener('click', () => zeigeTeil(id));
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); zeigeTeil(id); } });
    if (ax !== undefined) svgEl('text', { x: ax, y: ay, class: 'sb-text', 'text-anchor': anker }, g).textContent = name;
    return g;
  };
  const ym = (KP_C[0][1] + KP_C[1][1]) / 2;
  // Quark in Saug- und Druckleitung und in der Kammer
  svgEl('rect', { x: 400 + 60, y: ym - 34, width: 270, height: 68, class: 'qs-zone-quark' }, svg);
  svgEl('rect', { x: 70, y: ym - 34, width: 270, height: 68, class: 'qs-zone-quark' }, svg);
  svgEl('path', { d: kpKammer(KP_RG), class: 'qs-zone-quark' }, svg);
  // Gehäuse und Stutzen
  const kopf = teil('pumpenkopf', 'Drehkolben', 560, 60);
  svgEl('path', { d: `${kpKammer(KP_RG + 22)} ${kpKammer(KP_RG)}`, 'fill-rule': 'evenodd' }, kopf);
  const kolben = KP_C.map(([x, y]) => {
    const g = svgEl('g', { transform: `translate(${x} ${y})` }, kopf);
    const k = svgEl('polygon', { points: kpKolben(), class: 'kp-kolben' }, g);
    svgEl('circle', { r: 16, class: 'kp-welle' }, g);
    return k;
  });
  svgEl('line', { x1: 555, y1: 56, x2: 470, y2: 120, class: 'sb-linie' }, kopf);
  for (const s of [-1, 1]) svgEl('rect', { x: s > 0 ? 400 + KP_RG - 4 : 400 - KP_RG - 26, y: ym - 34, width: 30, height: 68, class: 'qs-zone-quark' }, svg);
  const saug = teil('saugstutzen', 'Saugstutzen', 730, ym - 50, 'end');
  svgEl('path', { d: `M${400 + KP_RG + 10},${ym - 40} L730,${ym - 40} L730,${ym - 34} L${400 + KP_RG + 4},${ym - 34} Z M${400 + KP_RG + 4},${ym + 34} L730,${ym + 34} L730,${ym + 40} L${400 + KP_RG + 10},${ym + 40} Z` }, saug);
  const druck = teil('druckstutzen', 'Druckstutzen', 70, ym - 50);
  svgEl('path', { d: `M${400 - KP_RG - 10},${ym - 40} L70,${ym - 40} L70,${ym - 34} L${400 - KP_RG - 4},${ym - 34} Z M${400 - KP_RG - 4},${ym + 34} L70,${ym + 34} L70,${ym + 40} L${400 - KP_RG - 10},${ym + 40} Z` }, druck);
  // Pfeile und Druckverhältnisse
  const mk = svgEl('marker', { id: 'kp-spitze', viewBox: '0 0 10 10', refX: 5, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, svgEl('defs', {}, svg));
  svgEl('path', { d: 'M0,0 L10,5 L0,10 z', class: 'sb-spitze' }, mk);
  svgEl('polyline', { points: `720,${ym} 600,${ym}`, class: 'sb-strich qs-strich-quark', 'marker-end': 'url(#kp-spitze)' }, svg);
  svgEl('polyline', { points: `200,${ym} 80,${ym}`, class: 'sb-strich qs-strich-quark', 'marker-end': 'url(#kp-spitze)' }, svg);
  for (const [x, zeilen] of [[580, ['Saugseite:', 'Volumen wird grösser,', 'Unterdruck']], [80, ['Druckseite:', 'Volumen wird kleiner,', 'Überdruck']]])
    zeilen.forEach((z, i) => { svgEl('text', { x, y: ym + 70 + i * 22, class: 'sb-medium' }, svg).textContent = z; });
  for (const [x, y, d] of [[400, 30, 'M 470 52 A 90 30 0 0 0 330 52'], [400, 545, 'M 470 512 A 90 30 0 0 1 330 512']])
    svgEl('path', { d, class: 'sb-dreh', 'marker-end': 'url(#kp-spitze)' }, svg);

  // Quarkpunkte in den Kammern zwischen Flügel und Gehäuse: oben und unten von rechts nach links
  const schicht = svgEl('g', { class: 'sb-kugeln' }, svg);
  const punkte = [];
  for (let k = 0; k < 2; k++) for (let i = 0; i < 9; i++) punkte.push({ k, i, el: svgEl('circle', { r: 5, class: 'qs-punkt' }, schicht) });
  let winkel = 0;
  const stelle = () => {
    const g = winkel * 180 / Math.PI;
    kolben[0].setAttribute('transform', `rotate(${-g})`); // oben gegen den Uhrzeiger: Flügel oben laufen nach links
    kolben[1].setAttribute('transform', `rotate(${g})`);
    for (const p of punkte) {
      const v = ((winkel + p.i * Math.PI / 9) % Math.PI); // 0..180° je Durchgang
      const f = p.k === 0 ? 2 * Math.PI - v : v, [cx, cy] = KP_C[p.k], r = KP_A + KP_B - 4;
      p.el.setAttribute('cx', cx + r * Math.cos(f)); p.el.setAttribute('cy', cy + r * Math.sin(f));
    }
  };
  stelle();
  return { schritt(dt) { winkel += dt * 0.9; stelle(); }, winkel: () => winkel };
}

// --- Dialog-Steuerung, gleich für beide
const quarkDialog = (testid, baue, start) => {
  let bild = null, teile = [], lauf = null, zuletzt = 0;
  const d = () => document.querySelector(`[data-testid="${testid}"]`);
  const q = n => d().querySelector(`[data-testid="${testid}-${n}"]`);
  const zeigeTeil = id => {
    const t = teile.find(t => t.id === id);
    q('titel').textContent = t.name; q('text').textContent = t.text;
    for (const g of d().querySelectorAll('[data-sb-teil]')) g.classList.toggle('sb-aktiv', g.dataset.sbTeil === id);
  };
  const tick = zeit => { bild.schritt(Math.min(zeit - zuletzt, 100) / 1000); zuletzt = zeit; lauf = requestAnimationFrame(tick); };
  return {
    oeffnen(anlageId) {
      teile = ANLAGEN.find(a => a.id === anlageId).teile;
      if (!bild) bild = baue(d().querySelector('svg'), zeigeTeil);
      q('titel').textContent = start.titel; q('text').textContent = start.text;
      for (const g of d().querySelectorAll('[data-sb-teil]')) g.classList.remove('sb-aktiv');
      d().showModal();
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches && !lauf) {
        zuletzt = performance.now(); lauf = requestAnimationFrame(tick);
        d().addEventListener('close', () => { cancelAnimationFrame(lauf); lauf = null; }, { once: true });
      }
    },
    stand: () => ({ offen: d().open, laeuft: !!lauf, winkel: bild?.winkel?.() }),
    schliessen() { d().close(); }
  };
};
window.quarkSchnitt = quarkDialog('schnittbild-qs', baueQuarkseparator, { titel: 'Separieren', text: QS_TEXT });
window.kreiskolbenSchnitt = quarkDialog('schnittbild-kp', baueKreiskolben, {
  titel: 'Kreiskolbenpumpe',
  text: 'Die Kreisbewegung der Drehkolben bewirkt auf der Saugseite eine Volumenvergrösserung und damit einen Unterdruck, womit der Quark in die Pumpe gelangt. '
    + 'Zur Druckseite hin verkleinert sich das Volumen zwischen Drehkolben und Gehäuse, es entsteht ein Überdruck. Der Quark wird zwangsweise in die Druckleitung gepresst.'
});

document.addEventListener('DOMContentLoaded', () => {
  for (const id of ['schnittbild-qs', 'schnittbild-kp']) {
    const d = document.querySelector(`[data-testid="${id}"]`);
    d.querySelector(`[data-testid="${id}-schliessen"]`).addEventListener('click', () => d.close());
  }
});
