// Schnittbild Strömungsformen im Mehrzweckerhitzer: links Schnitt durch den Kessel, rechts Draufsicht.
// Pfeile wandern auf Bahnen: axial (Propeller), radial (Scheibe), tangential (Anker, Harfe, ohne Strömungsbrecher).
// Ohne Strömungsbrecher bildet sich beim Propeller und der Scheibe eine Trombe.
// Texte: Lehrmittel a.1 «Strömungsformen», b.1 «Form des Käsefertigers». Rührertexte aus anlagen.js (teile).
// Braucht ANLAGEN (anlagen.js) und svgEl (schnittbild.js). Testeinstieg: window.ruehrwerkSchnitt.

const RW_S = { cx: 200, l: 70, r: 330, oben: 110, unten: 380 };   // Kessel im Schnitt, Innenwand und Milchspiegel
const RW_O = { cx: 560, cy: 245, r: 130 };                         // Draufsicht
const RW_FORM = { propellerruehrer: 'axiale Strömung', scheibenruehrer: 'radiale Strömung', ankerruehrer: 'tangentiale Strömung', kaeseharfe: 'tangentiale Strömung' };
const RW_SCHNELL = { propellerruehrer: true, scheibenruehrer: true };
const RW_BRECHERTEXT = {
  trombe: 'Ohne Strömungsbrecher überlagert sich eine Tangentialströmung, die den Behälterinhalt in eine Drehbewegung versetzt. Ist sie zu intensiv, bildet sich eine Wirbelsenke oder Trombe, durch die unter Umständen Luft eingesaugt wird. Rührgut mit unterschiedlicher Dichte kann separiert werden.',
  ruhig: 'Strömungsbrecher verhindern die unerwünschte Tangentialströmung weitgehend. Die Oberfläche bleibt ruhig, und die Milch wird im ganzen Kessel durchmischt.',
  anker: 'Der Ankerrührer läuft wandnah. Für Strömungsbrecher hat es keinen Platz.',
  harfeOhne: 'Ohne Strömungsbleche dreht sich der ganze Inhalt im Kreis, ohne Schneidewirkung.',
  harfeMit: 'Strömungsbleche sorgen zusätzlich für eine gleichmässige Durchmischung, was mithilft, eine ausgeglichene Bruchgrösse zu erhalten.'
};

// Geschlossener Weg durch Eckpunkte mit gerundeten Ecken (Radius k)
function rwRund(pts, k = 22) {
  const n = pts.length, P = i => pts[(i + n) % n];
  const zu = (a, b, d) => { const l = Math.hypot(b[0] - a[0], b[1] - a[1]); return [a[0] + (b[0] - a[0]) * d / l, a[1] + (b[1] - a[1]) * d / l]; };
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = zu(P(i), P(i - 1), k), b = zu(P(i), P(i + 1), k);
    d += `${i ? 'L' : 'M'}${a[0]},${a[1]} Q${P(i)[0]},${P(i)[1]} ${b[0]},${b[1]} `;
  }
  return d + 'Z';
}
const rwEllipse = (cx, cy, rx, ry) => `M${cx - rx},${cy} A${rx},${ry} 0 1 0 ${cx + rx},${cy} A${rx},${ry} 0 1 0 ${cx - rx},${cy}`;

// Bahnen je Zustand: [Weg, Anzahl Teilchen, Geschwindigkeit px/s, Ellipsenmitte (für vorne/hinten) oder null]
function rwBahnen(ruehrer, brecher) {
  const { cx, l, r, oben, unten } = RW_S, seite = [], aufsicht = [];
  const trombe = RW_SCHNELL[ruehrer] && !brecher;
  const top = trombe ? oben + 70 : oben + 25;                   // in der Trombe fehlt in der Mitte die Milch
  const schleifen = (pts, n, v) => { for (const s of [1, -1]) seite.push([rwRund(pts.map(([x, y]) => [cx + s * x, y])), n, v, null]); };
  const kreise = (v, n = 7, radien = [40, 80, 118]) => radien.forEach(rr => aufsicht.push([rwEllipse(RW_O.cx, RW_O.cy, rr, rr), Math.round(n * rr / 80), v, null]));
  const strahlen = v => { for (let i = 0; i < 8; i++) { const w = (i + 0.5) * Math.PI / 4, c = Math.cos(w), s = Math.sin(w); aufsicht.push([`M${RW_O.cx + 25 * c},${RW_O.cy + 25 * s} L${RW_O.cx + 120 * c},${RW_O.cy + 120 * s} Z`, 3, v, null]); } };
  const ellipsen = (v, n, rx = [110, 110]) => [200, 320].forEach((y, i) => seite.push([rwEllipse(cx, y, rx[i % 2], 14), n, v, y]));
  const k = trombe ? 0.6 : 1;                                     // Trombe: die Drehung frisst einen Teil der Strömung
  if (ruehrer === 'propellerruehrer') {
    schleifen([[25, top], [25, unten - 25], [r - cx - 18, unten - 25], [r - cx - 18, oben + 25]], 6, 90 * k);
    schleifen([[50, top + 45], [50, unten - 70], [r - cx - 55, unten - 70], [r - cx - 55, oben + 70]], 4, 70 * k);
  }
  if (ruehrer === 'scheibenruehrer') {
    const yd = 300;
    schleifen([[35, yd], [r - cx - 18, yd], [r - cx - 18, oben + 25], [35, top]], 7, 90 * k);
    schleifen([[35, yd], [r - cx - 18, yd], [r - cx - 18, unten - 22], [35, unten - 22]], 5, 90 * k);
  }
  if (RW_SCHNELL[ruehrer]) {
    if (brecher) strahlen(55); else { kreise(140); ellipsen(150, 4); }
  } else if (ruehrer === 'ankerruehrer') { kreise(35, 6, [60, 95, 120]); ellipsen(35, 5, [118, 85]); }
  else if (brecher) { kreise(25, 5); strahlen(30); ellipsen(25, 3); schleifen([[40, oben + 30], [40, unten - 30], [r - cx - 25, unten - 30], [r - cx - 25, oben + 30]], 5, 30); }
  else { kreise(60, 8); ellipsen(60, 6); }
  return { seite, aufsicht, trombe };
}

// Rührer im Schnitt (um die Welle mit scaleX gedreht) und von oben (rotate)
function rwRuehrerSeite(g, id) {
  const { cx, oben } = RW_S, e = (tag, a) => svgEl(tag, a, g);
  e('line', { x1: cx, y1: 30, x2: cx, y2: { ankerruehrer: 372, kaeseharfe: 140, scheibenruehrer: 300 }[id] || 345, class: 'rw-welle' });
  if (id === 'propellerruehrer') { e('polygon', { points: `${cx},338 ${cx + 52},328 ${cx + 52},344 ${cx},352 ${cx - 52},344 ${cx - 52},328`, class: 'rw-ruehrer' }); e('circle', { cx, cy: 345, r: 9, class: 'rw-ruehrer' }); }
  if (id === 'scheibenruehrer') { e('rect', { x: cx - 48, y: 297, width: 96, height: 6, class: 'rw-ruehrer' }); for (const s of [-1, 1]) e('rect', { x: cx + s * 44 - 8, y: 286, width: 16, height: 28, class: 'rw-ruehrer' }); }
  if (id === 'ankerruehrer') { e('path', { d: `M${cx - 122},${oben + 30} L${cx - 122},350 Q${cx - 122},372 ${cx - 100},372 L${cx + 100},372 Q${cx + 122},372 ${cx + 122},350 L${cx + 122},${oben + 30}`, class: 'rw-buegel' }); e('line', { x1: cx - 122, y1: 220, x2: cx + 122, y2: 220, class: 'rw-buegel' }); }
  if (id === 'kaeseharfe') { e('rect', { x: cx - 100, y: 140, width: 200, height: 210, class: 'rw-buegel' }); for (let x = cx - 85; x <= cx + 85; x += 17) e('line', { x1: x, y1: 140, x2: x, y2: 350, class: 'rw-messer' }); }
}
function rwRuehrerOben(g, id) {
  const { cx, cy } = RW_O, e = (tag, a) => svgEl(tag, a, g);
  if (id === 'propellerruehrer') for (let i = 0; i < 3; i++) e('ellipse', { cx: cx + 28, cy, rx: 26, ry: 10, transform: `rotate(${i * 120} ${cx} ${cy})`, class: 'rw-ruehrer' });
  if (id === 'scheibenruehrer') { e('circle', { cx, cy, r: 45, class: 'rw-ruehrer' }); for (let i = 0; i < 6; i++) e('rect', { x: cx + 32, y: cy - 2, width: 22, height: 4, transform: `rotate(${i * 60} ${cx} ${cy})`, class: 'rw-schaufel' }); }
  if (id === 'ankerruehrer') e('line', { x1: cx - 122, y1: cy, x2: cx + 122, y2: cy, class: 'rw-buegel' });
  if (id === 'kaeseharfe') { e('line', { x1: cx - 100, y1: cy, x2: cx + 100, y2: cy, class: 'rw-buegel' }); for (let x = cx - 85; x <= cx + 85; x += 17) e('line', { x1: x, y1: cy - 5, x2: x, y2: cy + 5, class: 'rw-messer' }); }
  e('circle', { cx, cy, r: 7, class: 'rw-nabe' });
}

function baueRuehrwerk(svg) {
  const { cx, l, r, oben, unten } = RW_S;
  svg.setAttribute('viewBox', '30 10 700 430');
  // Kessel im Schnitt: Mantel, Innenraum, Milch; Draufsicht: Kreis
  svgEl('path', { d: `M${l - 14},80 L${l - 14},${unten + 6} Q${l - 14},${unten + 20} ${l},${unten + 20} L${r},${unten + 20} Q${r + 14},${unten + 20} ${r + 14},${unten + 6} L${r + 14},80 Z`, class: 'rw-mantel' }, svg);
  svgEl('path', { d: `M${l},80 L${l},${unten - 20} Q${l},${unten} ${l + 20},${unten} L${r - 20},${unten} Q${r},${unten} ${r},${unten - 20} L${r},80 Z`, class: 'rw-innen' }, svg);
  const milch = svgEl('path', { class: 'rw-milch' }, svg);
  svgEl('circle', { cx: RW_O.cx, cy: RW_O.cy, r: RW_O.r + 12, class: 'rw-mantel' }, svg);
  svgEl('circle', { cx: RW_O.cx, cy: RW_O.cy, r: RW_O.r, class: 'rw-milch' }, svg);
  svgEl('text', { x: cx, y: 432, class: 'sb-medium', 'text-anchor': 'middle' }, svg).textContent = 'Schnitt';
  svgEl('text', { x: RW_O.cx, y: 432, class: 'sb-medium', 'text-anchor': 'middle' }, svg).textContent = 'Von oben';
  const trombeText = svgEl('text', { x: cx + 30, y: oben + 22, class: 'rw-trombe' }, svg);
  trombeText.textContent = 'Trombe';
  const dyn = svgEl('g', {}, svg);
  let bahnen = [], seite, oben2, schnell = false, winkel = 0;

  return {
    zeigen(ruehrer, brecher) {
      const b = rwBahnen(ruehrer, brecher);
      schnell = !!RW_SCHNELL[ruehrer];
      milch.setAttribute('d', `M${l},${oben} ` + (b.trombe ? `C${cx - 60},${oben + 2} ${cx - 25},${oben + 60} ${cx},${oben + 60} C${cx + 25},${oben + 60} ${cx + 60},${oben + 2} ${r},${oben}` : `L${r},${oben}`) +
        ` L${r},${unten - 20} Q${r},${unten} ${r - 20},${unten} L${l + 20},${unten} Q${l},${unten} ${l},${unten - 20} Z`);
      svg.dataset.trombe = b.trombe ? 'ja' : 'nein';
      dyn.replaceChildren();
      if (brecher) {
        for (const x of [l, r - 10]) svgEl('rect', { x, y: oben - 25, width: 10, height: 210, class: 'rw-brecher' }, dyn);
        for (let i = 0; i < 4; i++) svgEl('rect', { x: RW_O.cx + RW_O.r - 18, y: RW_O.cy - 3, width: 18, height: 6, transform: `rotate(${45 + i * 90} ${RW_O.cx} ${RW_O.cy})`, class: 'rw-brecher' }, dyn);
      }
      seite = svgEl('g', {}, dyn); rwRuehrerSeite(seite, ruehrer);
      oben2 = svgEl('g', {}, dyn); rwRuehrerOben(oben2, ruehrer);
      const teilchen = svgEl('g', { class: 'rw-teilchen' }, dyn);
      bahnen = [...b.seite, ...b.aufsicht].map(([d, n, v, ey]) => {
        const p = svgEl('path', { d, class: 'rw-bahn' }, dyn);
        dyn.insertBefore(p, seite);
        const L = p.getTotalLength();
        return { p, L, v, ey, punkte: Array.from({ length: n }, (_, i) => ({ s: i * L / n, c: svgEl('path', { d: 'M7,0 L-5,-5.5 L-2,0 L-5,5.5 Z' }, teilchen) })) };
      });
      this.schritt(0);
    },
    // Teilchen um dt Sekunden weiterbewegen, Rührer drehen
    schritt(dt) {
      winkel += dt * 2 * Math.PI * (schnell ? 1 : 0.25);
      seite.setAttribute('transform', `translate(${cx} 0) scale(${Math.cos(winkel).toFixed(3)} 1) translate(${-cx} 0)`);
      oben2.setAttribute('transform', `rotate(${(winkel * 180 / Math.PI) % 360} ${RW_O.cx} ${RW_O.cy})`);
      for (const b of bahnen) for (const t of b.punkte) {
        t.s = (t.s + b.v * dt) % b.L;
        const q = b.p.getPointAtLength(t.s), q2 = b.p.getPointAtLength((t.s + 3) % b.L); // Pfeil zeigt in Fliessrichtung
        t.c.setAttribute('transform', `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)}) rotate(${(Math.atan2(q2.y - q.y, q2.x - q.x) * 180 / Math.PI).toFixed(0)})`);
        t.c.dataset.y = q.y.toFixed(1);
        if (b.ey !== null) t.c.setAttribute('opacity', q.y < b.ey ? 0.3 : 1); // hintere Hälfte der Drehung blass
      }
    }
  };
}

window.ruehrwerkSchnitt = (() => {
  let bild = null, teile = [], ruehrer = 'propellerruehrer', lauf = null, zuletzt = 0;
  const d = () => document.querySelector('[data-testid="schnittbild-rw"]');
  const q = id => d().querySelector(`[data-testid="${id}"]`);
  const ruhig = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const zeigen = () => {
    const box = q('rw-brecher');
    box.disabled = ruehrer === 'ankerruehrer';
    if (box.disabled) box.checked = false;
    const brecher = box.checked, t = teile.find(t => t.id === ruehrer);
    bild.zeigen(ruehrer, brecher);
    for (const b of d().querySelectorAll('[data-rw]')) b.setAttribute('aria-pressed', b.dataset.rw === ruehrer);
    q('rw-titel').textContent = `${t.name}: ${RW_FORM[ruehrer]}`;
    q('rw-text').textContent = t.text;
    q('rw-brechertext').textContent = RW_BRECHERTEXT[ruehrer === 'ankerruehrer' ? 'anker' : ruehrer === 'kaeseharfe' ? (brecher ? 'harfeMit' : 'harfeOhne') : (brecher ? 'ruhig' : 'trombe')];
  };
  const tick = zeit => {
    bild.schritt(Math.min(zeit - zuletzt, 100) / 1000); zuletzt = zeit;
    lauf = requestAnimationFrame(tick);
  };
  return {
    oeffnen(anlageId) {
      const an = ANLAGEN.find(a => a.id === anlageId);
      teile = an.teile;
      const v = an.wechsel.varianten[+document.querySelector(`[data-anlage="${anlageId}"]`)?.dataset.variante || 0];
      ruehrer = v[0];
      if (!bild) bild = baueRuehrwerk(d().querySelector('svg'));
      q('rw-brecher').checked = v.includes('stroemungsbrecher');
      zeigen();
      d().showModal();
      if (!ruhig() && !lauf) {
        zuletzt = performance.now(); lauf = requestAnimationFrame(tick);
        d().addEventListener('close', () => { cancelAnimationFrame(lauf); lauf = null; }, { once: true }); // nur bei offenem Dialog
      }
    },
    waehlen(id) { ruehrer = id; zeigen(); },
    brecher(an) { q('rw-brecher').checked = an; zeigen(); },
    stand: () => ({ ruehrer, brecher: q('rw-brecher').checked, trombe: d().querySelector('svg').dataset.trombe === 'ja' }),
    schliessen() { d().close(); }
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  const d = document.querySelector('[data-testid="schnittbild-rw"]');
  d.querySelector('[data-testid="schnittbild-rw-schliessen"]').addEventListener('click', () => d.close());
  for (const b of d.querySelectorAll('[data-rw]')) b.addEventListener('click', () => window.ruehrwerkSchnitt.waehlen(b.dataset.rw));
  d.querySelector('[data-testid="rw-brecher"]').addEventListener('change', e => window.ruehrwerkSchnitt.brecher(e.target.checked));
});
