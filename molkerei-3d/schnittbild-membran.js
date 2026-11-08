// Schnittbild Querstromfiltration: Das Produkt strömt oben entlang der Membran, kleine Bestandteile gehen
// durch die Poren auf die Permeatseite, grosse bleiben im Retentat. Ein Code für MF, UF und UO (MB_VERFAHREN).
// Teilchenarten wie in den Illustrationen in Lehrmittel a.3 (Fett, Kasein, Molkenproteine, Laktose, Salze, Wasser).
// Wandernde Pfeile zeigen die Fliessrichtung. Braucht ANLAGEN (anlagen.js) und svgEl (schnittbild.js).
// Testeinstieg: window.membranSchnitt.

const MB_K = { l: 70, r: 650, oben: 75, membran: 200, unten: 214, boden: 300 }; // Kanal, Membran, Permeatseite
const MB_STOFFE = {
  fett: { name: 'Fett', r: 10, farbe: Z('rahm'), n: 5 },
  kasein: { name: 'Kasein', r: 6.5, farbe: Z('kasein'), n: 10 },
  molkenprotein: { name: 'Molkenproteine', r: 4, farbe: Z('molkenprotein'), n: 10 },
  laktose: { name: 'Laktose', r: 4, farbe: Z('laktose'), n: 10, form: 'raute' },
  salze: { name: 'Salze', r: 2.8, farbe: Z('salze'), n: 10, form: 'quadrat' },
  wasser: { name: 'Wasser', r: 2.2, farbe: Z('wasser'), n: 18 }
};
// Eigene Sätze nach a.3 «Prinzip der Membranfiltration» und «Ultrafiltration».
const MB_VERFAHREN = {
  uf: {
    titel: 'Ultrafiltration: Proteine aufkonzentrieren', produkt: 'Milch', druck: '1 bis 10 bar', poren: '0,01 bis 0,1 µm',
    stoffe: ['fett', 'kasein', 'molkenprotein', 'laktose', 'salze', 'wasser'], durch: ['laktose', 'salze', 'wasser'],
    text: 'Die Zirkulationspumpe und das Druckhalteventil erzeugen auf der Produktseite einen höheren Druck. Laktose, Salze und Wasser sind kleiner als die Poren und gehen durch die Membran: Sie bilden das Permeat. Fett, Kasein und Molkenproteine bleiben zurück und werden entlang der Membran immer mehr aufkonzentriert: Das ist das Retentat. Weil das Produkt entlang der Membran fliesst und nicht gegen sie, bildet sich viel weniger Filterkuchen.'
  }
};

function mbForm(eltern, s, x = 0, y = 0) {
  const a = { fill: s.farbe, stroke: 'rgba(0,0,0,0.35)', 'stroke-width': 0.6 };
  if (s.form === 'raute') return svgEl('path', { d: `M${x},${y - s.r * 1.3} L${x + s.r * 1.3},${y} L${x},${y + s.r * 1.3} L${x - s.r * 1.3},${y} Z`, ...a }, eltern);
  if (s.form === 'quadrat') return svgEl('rect', { x: x - s.r, y: y - s.r, width: 2 * s.r, height: 2 * s.r, ...a }, eltern);
  return svgEl('circle', { cx: x, cy: y, r: s.r, ...a }, eltern);
}

function baueMembran(svg) {
  const { l, r, oben, membran, unten, boden } = MB_K;
  svg.setAttribute('viewBox', '0 20 720 430');
  svgEl('rect', { x: l, y: oben, width: r - l, height: membran - oben, class: 'mb-kanal' }, svg);
  svgEl('rect', { x: l, y: unten, width: r - l, height: boden - unten, class: 'mb-permeatseite' }, svg);
  svgEl('rect', { x: l, y: membran, width: r - l, height: unten - membran, class: 'mb-membran' }, svg);
  for (let x = l + 9; x < r; x += 14) svgEl('rect', { x, y: membran, width: 3, height: unten - membran, class: 'mb-pore' }, svg);
  for (const y of [oben, boden]) svgEl('line', { x1: l, y1: y, x2: r, y2: y, class: 'mb-wand' }, svg);
  const text = (x, y, t, a = {}) => { const e = svgEl('text', { x, y, class: 'sb-medium', ...a }, svg); e.textContent = t; return e; };
  const produkt = text(l - 6, (oben + membran) / 2 + 5, '', { 'text-anchor': 'end' });
  text(r + 6, (oben + membran) / 2 + 5, 'Retentat');
  text(r + 6, (unten + boden) / 2 + 5, 'Permeat');
  text(l - 6, membran + 12, 'Membran', { 'text-anchor': 'end', class: 'mb-klein' });
  const kennwerte = text((l + r) / 2, oben - 14, '', { 'text-anchor': 'middle' });
  const legende = svgEl('g', {}, svg);
  const bahnenG = svgEl('g', {}, svg), stoffG = svgEl('g', {}, svg), pfeilG = svgEl('g', { class: 'mb-pfeile' }, svg);
  // Bahnen: [Weg, Anzahl Pfeile, Geschwindigkeit px/s]
  const wege = [...[105, 138, 171].map(y => [`M${l + 5},${y} L${r - 5},${y}`, 5, 80]), [`M${l + 5},${(unten + boden) / 2} L${r - 5},${(unten + boden) / 2}`, 4, 45],
    ...[170, 300, 430, 560].map(x => [`M${x},${membran - 18} L${x + 8},${unten + 22}`, 1, 25])];
  const bahnen = wege.map(([d, n, v]) => {
    const p = svgEl('path', { d, class: 'mb-bahn' }, bahnenG), L = p.getTotalLength();
    return { p, L, v, punkte: Array.from({ length: n }, (_, i) => ({ s: i * L / n, c: svgEl('path', { d: 'M7,0 L-5,-5.5 L-2,0 L-5,5.5 Z' }, pfeilG) })) };
  });
  let teilchen = [], verfahren = null;
  const neu = (t, start) => {
    const s = MB_STOFFE[t.id], rand = s.r + 3;
    t.x = start ? l + Math.random() * (r - l) : l - s.r; t.y = oben + rand + Math.random() * (membran - oben - 2 * rand);
    t.v = 55 + Math.random() * 35; t.ort = 'kanal';
    t.quer = l + 40 + Math.random() * (r - l - 120); // hier geht ein durchgehendes Teilchen durch die Membran
    t.ziel = unten + rand + Math.random() * (boden - unten - 2 * rand);
  };
  const setzen = t => t.c.setAttribute('transform', `translate(${t.x.toFixed(1)} ${t.y.toFixed(1)})`);

  return {
    zeigen(id) {
      verfahren = MB_VERFAHREN[id];
      produkt.textContent = verfahren.produkt;
      kennwerte.textContent = `Druck ${verfahren.druck} · Porengrösse ${verfahren.poren}`;
      legende.replaceChildren(); stoffG.replaceChildren();
      [['Bleibt zurück: Retentat', verfahren.stoffe.filter(s => !verfahren.durch.includes(s))], ['Geht durch: Permeat', verfahren.durch]].forEach(([titel, ids], spalte) => {
        const x0 = 90 + spalte * 300;
        svgEl('text', { x: x0, y: 340, class: 'sb-medium mb-legende-titel' }, legende).textContent = titel;
        ids.forEach((s, i) => {
          mbForm(legende, MB_STOFFE[s], x0 + 8, 366 + i * 24);
          svgEl('text', { x: x0 + 24, y: 371 + i * 24, class: 'sb-medium' }, legende).textContent = MB_STOFFE[s].name;
        });
      });
      teilchen = verfahren.stoffe.flatMap(id => Array.from({ length: MB_STOFFE[id].n }, () => {
        const t = { id, durch: verfahren.durch.includes(id), c: mbForm(stoffG, MB_STOFFE[id]) };
        t.c.dataset.stoff = id; neu(t, true); return t;
      }));
      for (let i = 0; i < 80; i++) this.schritt(0.1); // Bild füllen, auch für Permeatseite
    },
    schritt(dt) {
      for (const t of teilchen) {
        if (t.ort === 'kanal') {
          t.x += t.v * dt;
          if (t.durch && t.x >= t.quer) t.ort = 'quer';
        } else if (t.ort === 'quer') {
          t.x += 12 * dt; t.y += 60 * dt;
          if (t.y >= t.ziel) { t.y = t.ziel; t.ort = 'permeat'; }
        } else t.x += 40 * dt;
        if (t.x > r + MB_STOFFE[t.id].r) neu(t, false);
        t.c.dataset.ort = t.ort;
        setzen(t);
      }
      for (const b of bahnen) for (const p of b.punkte) {
        p.s = (p.s + b.v * dt) % b.L;
        const q = b.p.getPointAtLength(p.s), q2 = b.p.getPointAtLength(Math.min(p.s + 3, b.L));
        p.c.setAttribute('transform', `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)}) rotate(${(Math.atan2(q2.y - q.y, q2.x - q.x) * 180 / Math.PI).toFixed(0)})`);
      }
    },
    // welche Stoffe gerade auf der Permeatseite sind (für pruefe.js)
    imPermeat: () => [...new Set(teilchen.filter(t => t.ort !== 'kanal').map(t => t.id))].sort()
  };
}

window.membranSchnitt = (() => {
  let bild = null, id = null, lauf = null, zuletzt = 0;
  const d = () => document.querySelector('[data-testid="schnittbild-mb"]');
  const q = i => d().querySelector(`[data-testid="${i}"]`);
  const tick = zeit => {
    bild.schritt(Math.min(zeit - zuletzt, 100) / 1000); zuletzt = zeit;
    lauf = requestAnimationFrame(tick);
  };
  return {
    oeffnen(anlageId) {
      id = ANLAGEN.find(a => a.id === anlageId).membran;
      if (!bild) bild = baueMembran(d().querySelector('svg'));
      bild.zeigen(id);
      q('mb-titel').textContent = MB_VERFAHREN[id].titel;
      q('mb-text').textContent = MB_VERFAHREN[id].text;
      d().showModal();
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches && !lauf) {
        zuletzt = performance.now(); lauf = requestAnimationFrame(tick);
        d().addEventListener('close', () => { cancelAnimationFrame(lauf); lauf = null; }, { once: true });
      }
    },
    stand: () => ({ verfahren: id, imPermeat: bild.imPermeat() }),
    schliessen() { d().close(); }
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  const d = document.querySelector('[data-testid="schnittbild-mb"]');
  d.querySelector('[data-testid="schnittbild-mb-schliessen"]').addEventListener('click', () => d.close());
});
