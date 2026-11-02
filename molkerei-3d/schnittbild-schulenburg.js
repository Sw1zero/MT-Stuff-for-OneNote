// Schnittbild Schulenburgverfahren: Querschnitt quer zur Wanne, schematisch, in fünf Schritten.
// Quarkwanne, Lochsieb und Molkenwanne sind konzentrische U-Formen um dieselbe Bogenmitte (abgesenkt).
// Schritttexte: Lehrmittel b.5 «Gewerbliche Quarkproduktion in einer Wanne (Schulenburgverfahren)».
// Braucht ANLAGEN (anlagen.js) und svgEl (schnittbild.js). Testeinstieg: window.schulenburgSchnitt.

const SW_CX = 400, SW_CY = 190;   // Bogenmitte
const SW_HUB = 300;               // px, so hoch steht die Molkenwanne angehoben
const SW_R = { quarkAussen: 240, quarkInnen: 225, sieb: 200, molkeAussen: 185, molkeInnen: 178 };
const SW_SCHRITTE = [
  { titel: 'Einfüllen und Einlaben', text: 'In der unteren Wanne füllen Sie die pasteurisierte Quarkmilch ein, säuern diese an und laben ein.' },
  { titel: 'Schneiden', text: 'Wenn der gewünschte pH-Wert erreicht ist, schneiden Sie die Gallerte in grobe Würfel.' },
  { titel: 'Absenken', text: 'Nach dem Schneiden senken Sie die obere Wanne ab. Auf dieser oberen Wanne ist aussen ein feines Lochsieb angebracht.' },
  { titel: 'Abpressen', text: 'Zwischen dem Sieb und der Wannenwand sammelt sich die abgepresste Molke. Eine Pumpe fördert diese in die obere Wanne. Mit zunehmender Pressdauer nimmt die Molkenmenge zu und damit wird auch der Pressdruck verstärkt.' },
  { titel: 'Anheben und Entleeren', text: 'Ist genügend Molke abgepresst, so heben Sie die Molkenwanne wieder an. Nun rühren Sie den Quark auf und schieben ihn mit einem Schaber durch eine Luke aus der Wanne.' }
];

// U-Form (oben offen) mit Radius r ab Höhe oben, und Sichel zwischen zwei Radien
const swU = (r, oben, dy = 0) => `M${SW_CX - r},${oben + dy} L${SW_CX - r},${SW_CY + dy} A${r},${r} 0 0 0 ${SW_CX + r},${SW_CY + dy} L${SW_CX + r},${oben + dy}`;
const swSichel = (r1, r2, oben) => `${swU(r2, oben)} L${SW_CX + r1},${oben} L${SW_CX + r1},${SW_CY} A${r1},${r1} 0 0 1 ${SW_CX - r1},${SW_CY} L${SW_CX - r1},${oben} Z`;

function baueSchulenburg(svg, zeigeTeil) {
  svg.setAttribute('viewBox', '20 -300 760 780');
  const defs = svgEl('defs', {}, svg);
  const mk = svgEl('marker', { id: 'sw-spitze', viewBox: '0 0 10 10', refX: 5, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto' }, defs);
  svgEl('path', { d: 'M0,0 L10,5 L0,10 z', class: 'sw-spitze' }, mk);
  // Molkenpegel in der oberen Wanne: Rechteck, das beim Abpressen hochfährt
  const clip = svgEl('clipPath', { id: 'sw-pegel' }, defs);
  svgEl('rect', { x: 0, y: 0, width: 800, height: 600, class: 'sw-pegel' }, clip);

  const teil = (id, name, ax, ay, anker = 'start') => {
    const g = svgEl('g', { class: 'sb-teil sw-teil', 'data-sb-teil': id, tabindex: 0, role: 'button', 'aria-label': name }, svg);
    g.addEventListener('click', () => zeigeTeil(id));
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); zeigeTeil(id); } });
    if (ax !== undefined) svgEl('text', { x: ax, y: ay, class: 'sb-text', 'text-anchor': anker }, g).textContent = name;
    return g;
  };

  // Inhalt der Quarkwanne: Milch (Schritt 1), Gallerte mit Schnitten (2), Quark als Sichel um das Sieb (3 bis 5)
  svgEl('path', { d: `${swU(SW_R.quarkInnen, 135)} Z`, class: 'sw-milch' }, svg);
  const gallerte = svgEl('g', { class: 'sw-gallerte' }, svg);
  svgEl('path', { d: `${swU(SW_R.quarkInnen, 135)} Z`, class: 'sw-quark' }, gallerte);
  const innen = svgEl('clipPath', { id: 'sw-innen' }, defs);
  svgEl('path', { d: `${swU(SW_R.quarkInnen, 135)} Z` }, innen);
  const schnitte = svgEl('g', { class: 'sw-schnitte', 'clip-path': 'url(#sw-innen)' }, gallerte);
  for (let x = SW_CX - 180; x <= SW_CX + 180; x += 60) svgEl('line', { x1: x, y1: 135, x2: x, y2: 420 }, schnitte);
  for (let y = 195; y < 420; y += 60) svgEl('line', { x1: SW_CX - 230, y1: y, x2: SW_CX + 230, y2: y }, schnitte);
  svgEl('path', { d: swSichel(SW_R.sieb, SW_R.quarkInnen, 120), class: 'sw-quark sw-quarksichel' }, svg);
  svgEl('path', { d: 'M400,395 L560,470', class: 'sw-pfeil sw-ausstoss', 'marker-end': 'url(#sw-spitze)' }, svg);

  // Quarkwanne mit Doppelmantel
  const qw = teil('quarkwanne', 'Quarkwanne', 645, 300);
  svgEl('path', { d: swSichel(SW_R.quarkInnen, SW_R.quarkAussen, 110) }, qw);
  svgEl('path', { d: swU(232, 110), class: 'sb-linie' }, qw);
  svgEl('line', { x1: 640, y1: 295, x2: 630, y2: 280, class: 'sb-linie' }, qw);

  // Entnahmeluke an der Stirnseite, hinter der Schnittebene
  const luke = teil('entnahmeluke', 'Entnahmeluke (Stirnseite)', 330, 462, 'end');
  svgEl('circle', { cx: 400, cy: 400, r: 17, class: 'sw-luke' }, luke);
  svgEl('line', { x1: 334, y1: 455, x2: 386, y2: 410, class: 'sb-linie' }, luke);

  // Molkenwanne mit Lochsieb und Molke: bewegt sich als Ganzes
  const oben = svgEl('g', { class: 'sw-oben' }, svg);
  svgEl('path', { d: swSichel(SW_R.molkeAussen, SW_R.sieb, 100), class: 'sw-molke sw-spalt' }, oben);
  svgEl('path', { d: `${swU(SW_R.molkeInnen, 80)} Z`, class: 'sw-molke', 'clip-path': 'url(#sw-pegel)' }, oben);
  const molkenwanne = teil('molkenwanne', 'Molkenwanne', 150, 40, 'end'); oben.appendChild(molkenwanne);
  svgEl('path', { d: swSichel(SW_R.molkeInnen, SW_R.molkeAussen, 80) }, molkenwanne);
  svgEl('line', { x1: 155, y1: 36, x2: 210, y2: 75, class: 'sb-linie' }, molkenwanne);
  const sieb = teil('lochsieb', 'Lochsieb', 150, 175, 'end'); oben.appendChild(sieb);
  svgEl('path', { d: swU(SW_R.sieb, 100), class: 'sw-sieb' }, sieb);
  svgEl('line', { x1: 155, y1: 170, x2: 199, y2: 160, class: 'sb-linie' }, sieb);
  // Pressdruck: Pfeile auf der Molkenwanne
  const druck = svgEl('g', { class: 'sw-druck' }, oben);
  for (const x of [310, 380]) svgEl('path', { d: `M${x},-10 L${x},60`, class: 'sw-pfeil', 'marker-end': 'url(#sw-spitze)' }, druck);

  // Molkenpumpe: saugt aus dem Spalt zwischen Sieb und Wannenwand, fördert in die obere Wanne
  const pumpe = teil('molkenpumpe', 'Molkenpumpe', 640, -40);
  svgEl('circle', { cx: 690, cy: 60, r: 22 }, pumpe);
  svgEl('path', { d: 'M690,38 L712,60 L690,82', class: 'sb-linie' }, pumpe);
  const leitung = svgEl('g', { class: 'sw-leitung' }, svg);
  svgEl('polyline', { points: '592,180 592,40 668,40 676,45', class: 'sw-rohr' }, leitung);
  svgEl('polyline', { points: '690,38 690,0 480,0 480,90', class: 'sw-rohr' }, leitung);
  svgEl('polyline', { points: '592,180 592,40 668,40', class: 'sb-strich sw-strich' }, leitung);
  svgEl('polyline', { points: '690,38 690,0 480,0 480,90', class: 'sb-strich sw-strich' }, leitung);

  return {
    schritt(n) { svg.dataset.schritt = n; }
  };
}

window.schulenburgSchnitt = (() => {
  let bild = null, schritt = 1, teile = [];
  const d = () => document.querySelector('[data-testid="schnittbild-sw"]');
  const q = id => d().querySelector(`[data-testid="${id}"]`);
  const aktiv = id => { for (const g of d().querySelectorAll('[data-sb-teil]')) g.classList.toggle('sb-aktiv', g.dataset.sbTeil === id); };
  const zeigeSchritt = n => {
    schritt = Math.max(1, Math.min(SW_SCHRITTE.length, n));
    const s = SW_SCHRITTE[schritt - 1];
    bild.schritt(schritt);
    q('sw-nr').textContent = `Schritt ${schritt} von ${SW_SCHRITTE.length}`;
    q('sw-titel').textContent = s.titel;
    q('sw-text').textContent = s.text;
    q('sw-zurueck').disabled = schritt === 1;
    q('sw-weiter').textContent = schritt === SW_SCHRITTE.length ? 'Von vorne' : 'Weiter';
    aktiv(null);
  };
  const zeigeTeil = id => {
    const t = teile.find(t => t.id === id);
    q('sw-titel').textContent = t.name;
    q('sw-text').textContent = t.text;
    aktiv(id);
  };
  return {
    oeffnen(anlageId) {
      teile = ANLAGEN.find(a => a.id === anlageId).teile;
      if (!bild) bild = baueSchulenburg(d().querySelector('svg'), zeigeTeil);
      zeigeSchritt(1);
      d().showModal();
    },
    weiter() { zeigeSchritt(schritt === SW_SCHRITTE.length ? 1 : schritt + 1); },
    zurueck() { zeigeSchritt(schritt - 1); },
    schliessen() { d().close(); }
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  const d = document.querySelector('[data-testid="schnittbild-sw"]');
  d.querySelector('[data-testid="schnittbild-sw-schliessen"]').addEventListener('click', () => d.close());
  d.querySelector('[data-testid="sw-weiter"]').addEventListener('click', () => window.schulenburgSchnitt.weiter());
  d.querySelector('[data-testid="sw-zurueck"]').addEventListener('click', () => window.schulenburgSchnitt.zurueck());
});
