// Schnittbild Plattenwärmetauscher: Längsschnitt durch einige Plattenspalten eines Pakets. Milch und Medium
// fliessen abwechselnd in den Spalten, die Farbe zeigt die Temperatur. Umschalten Gegenstrom/Gleichstrom zeigt,
// warum der PWT im Gegenstrom arbeitet (a.4 «Plattenapparat»). Rechts der Temperaturverlauf, auf gleicher Höhe.
// Braucht ANLAGEN (anlagen.js) und svgEl (schnittbild.js). Testeinstieg: window.pwtSchnitt.

// Eintrittstemperaturen sind Beispielwerte (Lehrmittel nennt nur 72 °C), k = Wärmeübergang je Plattenlänge,
// so gewählt, dass im Gegenstrom typische Austrittswerte entstehen. km Milch, kd Medium (kleiner = mehr Mediumstrom).
const PWT_PAKETE = {
  paket_rueckgewinnung: { kurz: 'Rückgewinnung', farbe: Z('rueckgewinn'), milch: 'Rohmilch', milchEin: 4, medium: 'Pastmilch', mediumEin: 72, km: 5.7, kd: 5.7 },
  paket_erhitzer: { kurz: 'Erhitzer', farbe: Z('heiss'), milch: 'Milch', milchEin: 62, medium: 'Warmwasser', mediumEin: 76, km: 2.0, kd: 1.0 },
  paket_kuehlung: { kurz: 'Kühlung', farbe: Z('kalt'), milch: 'Pastmilch', milchEin: 14, medium: 'Eiswasser', mediumEin: 1, km: 2.1, kd: 1.05 }
};
const PWT_N = 100;              // Rechenschritte über die Plattenlänge
const PWT_Y = [60, 360];        // Plattenoberkante, -unterkante; Milch fliesst von unten nach oben
const PWT_TMAX = 80;            // °C, Skala Farbe und Diagramm

// Temperaturverlauf der Milch (m) und des Mediums (d) über die Plattenlänge x = 0 (Milcheintritt) bis 1.
// Gegenstrom: Medium tritt bei x = 1 ein, Austritt bei x = 0 unbekannt, darum Halbierungssuche.
function pwtVerlauf(p, gegen) {
  const lauf = d0 => {
    const m = [p.milchEin], d = [d0];
    for (let i = 0; i < PWT_N; i++) {
      const diff = (d[i] - m[i]) / PWT_N;
      m.push(m[i] + p.km * diff);
      d.push(d[i] + (gegen ? p.kd : -p.kd) * diff);
    }
    return { m, d };
  };
  if (!gegen) return lauf(p.mediumEin);
  let a = p.milchEin, b = p.mediumEin, v;
  for (let i = 0; i < 50; i++) {
    const mitte = (a + b) / 2;
    v = lauf(mitte);
    // zu hohe Austrittstemperatur unten ergibt zu hohe Temperatur oben, gilt fürs Heizen und Kühlen
    if ((v.d[PWT_N] - p.mediumEin) * (p.mediumEin - p.milchEin) > 0) b = mitte; else a = mitte;
  }
  return v;
}

const pwtFarbe = t => `hsl(${(220 - 220 * Math.min(Math.max(t / PWT_TMAX, 0), 1)).toFixed(0)}, 70%, 55%)`;

function bauePwt(svg) {
  svg.setAttribute('viewBox', '0 0 720 430');
  const [oben, unten] = PWT_Y, x0 = 50, spalt = 52, n = 6; // 6 Spalten, abwechselnd Milch und Medium
  const defs = svgEl('defs', {}, svg);
  svgEl('path', { d: 'M0,0 L8,4 L0,8 Z', fill: Z('oeffnung') }, svgEl('marker', { id: 'pwt-pfeil', viewBox: '0 0 8 8', refX: 4, refY: 4, markerWidth: 7, markerHeight: 7, orient: 'auto' }, defs));
  const verlauf = art => svgEl('linearGradient', { id: `pwt-${art}`, x1: 0, y1: 1, x2: 0, y2: 0 }, defs);
  const vg = { m: verlauf('m'), d: verlauf('d') };
  const text = (x, y, t, a = {}, eltern = svg) => { const e = svgEl('text', { x, y, class: 'sb-medium', ...a }, eltern); e.textContent = t; return e; };

  // Spalten, darüber die gerippten Platten (Zickzack)
  const namen = [];
  for (let i = 0; i < n; i++) {
    const art = i % 2 ? 'd' : 'm', xm = x0 + spalt * (i + 0.5);
    svgEl('rect', { x: x0 + spalt * i, y: oben, width: spalt, height: unten - oben, fill: `url(#pwt-${art})` }, svg);
    namen.push([art, text(xm, (oben + unten) / 2, '', { transform: `rotate(-90 ${xm} ${(oben + unten) / 2})`, 'text-anchor': 'middle', class: 'sb-medium pwt-name' })]);
  }
  for (let i = 0; i <= n; i++) {
    const x = x0 + spalt * i;
    let d = `M${x},${oben}`;
    for (let y = oben + 10; y <= unten; y += 10) d += ` L${x + ((y - oben) / 10 % 2 ? 4 : -4)},${y}`;
    svgEl('path', { d, class: 'pwt-platte' }, svg);
  }
  const dicht = [0, 1].map(k => svgEl('rect', { x: x0 - 4, y: k ? unten : oben - 8, width: spalt * n + 8, height: 8, class: 'pwt-dichtung' }, svg));
  // Fliessrichtung: laufende Striche mit Pfeilspitze, Richtung je Spalte setzt zeigen()
  const striche = Array.from({ length: n }, (_, i) => svgEl('path', { class: 'pwt-strich', 'marker-end': 'url(#pwt-pfeil)' }, svg));
  // Farbskala unter dem Schnitt
  const skala = svgEl('linearGradient', { id: 'pwt-skala' }, defs);
  for (let t = 0; t <= PWT_TMAX; t += 10) svgEl('stop', { offset: t / PWT_TMAX, 'stop-color': pwtFarbe(t) }, skala);
  svgEl('rect', { x: x0, y: 390, width: spalt * n, height: 10, fill: 'url(#pwt-skala)' }, svg);
  text(x0, 420, '0 °C', { class: 'mb-klein' });
  text(x0 + spalt * n, 420, `${PWT_TMAX} °C`, { 'text-anchor': 'end', class: 'mb-klein' });

  // Diagramm rechts: senkrecht Weg durch das Paket (gleiche Höhe wie der Schnitt), waagrecht Temperatur
  const dl = 420, dr = 690, tx = t => dl + (dr - dl) * t / PWT_TMAX;
  svgEl('rect', { x: dl, y: oben, width: dr - dl, height: unten - oben, class: 'pwt-diagramm' }, svg);
  for (let t = 0; t <= PWT_TMAX; t += 20) {
    svgEl('line', { x1: tx(t), y1: oben, x2: tx(t), y2: unten, class: 'pwt-raster' }, svg);
    text(tx(t), unten + 18, `${t}`, { 'text-anchor': 'middle', class: 'mb-klein' });
  }
  text((dl + dr) / 2, unten + 38, 'Temperatur in °C', { 'text-anchor': 'middle', class: 'mb-klein' });
  text(dl - 8, (oben + unten) / 2, 'Weg durch das Paket', { transform: `rotate(-90 ${dl - 8} ${(oben + unten) / 2})`, 'text-anchor': 'middle', class: 'mb-klein' });
  const kurve = { m: svgEl('polyline', { class: 'pwt-kurve pwt-kurve-m' }, svg), d: svgEl('polyline', { class: 'pwt-kurve pwt-kurve-d' }, svg) };
  const wert = Array.from({ length: 4 }, () => text(0, 0, '', { class: 'sb-medium pwt-wert' }));
  const legende = { m: text(dl, oben - 30, '', { class: 'sb-medium' }), d: text(dl, oben - 12, '', { class: 'sb-medium' }) };

  const yVon = i => unten - (unten - oben) * i / PWT_N;
  return {
    zeigen(p, gegen) {
      const v = pwtVerlauf(p, gegen);
      for (const art of ['m', 'd']) {
        vg[art].replaceChildren();
        for (let i = 0; i <= PWT_N; i += 10) svgEl('stop', { offset: i / PWT_N, 'stop-color': pwtFarbe(v[art][i]) }, vg[art]);
        kurve[art].setAttribute('points', v[art].map((t, i) => `${tx(t).toFixed(1)},${yVon(i).toFixed(1)}`).join(' '));
      }
      dicht.forEach(r => r.setAttribute('fill', p.farbe));
      namen.forEach(([art, e]) => { e.textContent = art === 'm' ? p.milch : p.medium; });
      striche.forEach((s, i) => {
        const xm = x0 + spalt * (i + 0.5) + 12, hoch = i % 2 === 0 || !gegen;
        s.setAttribute('d', hoch ? `M${xm},${unten - 10} L${xm},${oben + 14}` : `M${xm},${oben + 10} L${xm},${unten - 14}`);
      });
      legende.m.textContent = `—— ${p.milch}`;
      legende.d.textContent = `- - - ${p.medium}`;
      // Ein- und Austrittswerte an die Kurvenenden
      const enden = [[v.m[0], PWT_N * 0], [v.m[PWT_N], PWT_N], [v.d[0], 0], [v.d[PWT_N], PWT_N]];
      enden.forEach(([t, i], k) => {
        const e = wert[k], rechts = k < 2 ? v.m[i] < v.d[i] : v.d[i] < v.m[i];
        e.setAttribute('x', tx(t) + (rechts ? -6 : 6)); e.setAttribute('y', yVon(i) + (i ? 14 : -6));
        e.setAttribute('text-anchor', rechts ? 'end' : 'start');
        e.textContent = `${Math.round(t)} °C`;
      });
      return v;
    }
  };
}

window.pwtSchnitt = (() => {
  let bild = null, paket = 'paket_rueckgewinnung', gegen = true, v = null;
  const d = () => document.querySelector('[data-testid="schnittbild-pwt"]');
  const q = i => d().querySelector(`[data-testid="${i}"]`);
  const teiltext = id => ANLAGEN.find(a => a.id === 'plattenwaermetauscher').teile.find(t => t.id === id).text;
  const zeigen = () => {
    const p = PWT_PAKETE[paket];
    v = bild.zeigen(p, gegen);
    d().querySelectorAll('[data-pwt]').forEach(b => b.setAttribute('aria-pressed', b.dataset.pwt === paket));
    q('pwt-gegen').checked = gegen;
    q('pwt-titel').textContent = PWT_PAKETE[paket].kurz + (gegen ? ' im Gegenstrom' : ' im Gleichstrom');
    q('pwt-text').textContent = teiltext(paket);
    q('pwt-werte').textContent = `${p.milch}: ${Math.round(v.m[0])} °C → ${Math.round(v.m[PWT_N])} °C. ${p.medium}: ${p.mediumEin} °C → ${Math.round(gegen ? v.d[0] : v.d[PWT_N])} °C.`;
    q('pwt-prinzip').textContent = gegen
      ? 'Die Fliessrichtungen in den benachbarten Plattenzwischenräumen sind entgegengesetzt. Die Milch trifft kurz vor dem Austritt auf das frisch eintretende Medium. So bleibt über die ganze Plattenlänge ein Temperaturunterschied, und die Milch kommt nahe an die Eintrittstemperatur des Mediums heran.'
      : 'Beide fliessen in die gleiche Richtung. Am Eintritt ist der Temperaturunterschied gross, danach gleichen sich die Temperaturen immer mehr an. Die Milch kommt höchstens bis zur gemeinsamen Mischtemperatur. Darum arbeitet der Plattenwärmetauscher im Gegenstrom.';
  };
  return {
    oeffnen() {
      if (!bild) bild = bauePwt(d().querySelector('svg'));
      zeigen();
      d().showModal();
    },
    paket(id) { paket = id; zeigen(); },
    gegenstrom(an) { gegen = an; zeigen(); },
    stand: () => ({ paket, gegen, milchAus: Math.round(v.m[PWT_N]) }),
    schliessen() { d().close(); }
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  const d = document.querySelector('[data-testid="schnittbild-pwt"]');
  d.querySelector('[data-testid="schnittbild-pwt-schliessen"]').addEventListener('click', () => d.close());
  d.querySelectorAll('[data-pwt]').forEach(b => b.addEventListener('click', () => window.pwtSchnitt.paket(b.dataset.pwt)));
  d.querySelector('[data-testid="pwt-gegen"]').addEventListener('change', e => window.pwtSchnitt.gegenstrom(e.target.checked));
});
