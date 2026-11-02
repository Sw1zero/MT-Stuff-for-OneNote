// Leitet Wände und Durchgänge aus anlagen.js ab. Gebraucht von script.js (3D) und grundriss.html (Plan).
// Räume sind achsparallele Rechtecke, die aneinanderstossen.

const TUER_BREITE = 3;
const TUER_HOEHE = 3.2;
const WAND_DICKE = 0.2;

function raumVon(id) {
  const r = RAEUME.find(r => r.id === id);
  if (!r) throw new Error('Unbekannter Raum: ' + id);
  return r;
}

const bodenVon = r => r.boden || 0;

function raumAn(x, z, boden = 0) {
  return RAEUME.find(r => bodenVon(r) === boden && x >= r.x0 && x < r.x1 && z >= r.z0 && z < r.z1);
}

// Durchgang zwischen zwei Räumen: Mitte ihrer gemeinsamen Wand.
// laeuft 'z' = Wand entlang z bei x = c, laeuft 'x' = Wand entlang x bei z = c. m = Lage der Türmitte auf der Wand.
function tuer(aId, bId) {
  const a = raumVon(aId), b = raumVon(bId);
  if (bodenVon(a) !== bodenVon(b)) throw new Error(`Durchgang zwischen Geschossen: ${aId} / ${bId}`);
  if (a.x1 === b.x0 || a.x0 === b.x1) {
    const von = Math.max(a.z0, b.z0), bis = Math.min(a.z1, b.z1);
    if (bis - von >= TUER_BREITE) return { a: aId, b: bId, laeuft: 'z', c: a.x1 === b.x0 ? a.x1 : a.x0, m: (von + bis) / 2 };
  }
  if (a.z1 === b.z0 || a.z0 === b.z1) {
    const von = Math.max(a.x0, b.x0), bis = Math.min(a.x1, b.x1);
    if (bis - von >= TUER_BREITE) return { a: aId, b: bId, laeuft: 'x', c: a.z1 === b.z0 ? a.z1 : a.z0, m: (von + bis) / 2 };
  }
  throw new Error(`Keine gemeinsame Wand für einen Durchgang: ${aId} / ${bId}`);
}

const DURCHGAENGE = TUEREN.map(([a, b]) => tuer(a, b));

// Wandstücke {laeuft, c, a, b, y0, hoehe, boden}. y0 > 0 = Sturz über einem Durchgang. y0/hoehe relativ zum Geschossboden.
// Gemeinsame Wände werden nur einmal erzeugt, mit der Höhe des höheren Raums. Jedes Geschoss für sich.
function waende() {
  return [...new Set(RAEUME.map(bodenVon))].flatMap(boden => waendeGeschoss(RAEUME.filter(r => bodenVon(r) === boden), boden));
}

function waendeGeschoss(raeume, boden) {
  const xs = [...new Set(raeume.flatMap(r => [r.x0, r.x1]))].sort((p, q) => p - q);
  const zs = [...new Set(raeume.flatMap(r => [r.z0, r.z1]))].sort((p, q) => p - q);
  const stuecke = new Map();
  const add = (laeuft, c, a, b, h) => {
    const key = `${laeuft}:${c}:${a}:${b}`;
    const alt = stuecke.get(key);
    stuecke.set(key, { laeuft, c, a, b, y0: 0, boden, hoehe: Math.max(h, alt ? alt.hoehe : 0) });
  };
  for (const r of raeume) {
    for (let i = 0; i < xs.length - 1; i++) {
      if (xs[i] >= r.x0 && xs[i + 1] <= r.x1) { add('x', r.z0, xs[i], xs[i + 1], r.hoehe); add('x', r.z1, xs[i], xs[i + 1], r.hoehe); }
    }
    for (let i = 0; i < zs.length - 1; i++) {
      if (zs[i] >= r.z0 && zs[i + 1] <= r.z1) { add('z', r.x0, zs[i], zs[i + 1], r.hoehe); add('z', r.x1, zs[i], zs[i + 1], r.hoehe); }
    }
  }
  const aus = [];
  const platziert = new Set();
  for (const s of stuecke.values()) {
    let a = s.a;
    const hier = DURCHGAENGE.filter(d => bodenVon(raumVon(d.a)) === boden && d.laeuft === s.laeuft && d.c === s.c && d.m - TUER_BREITE / 2 >= s.a && d.m + TUER_BREITE / 2 <= s.b)
      .sort((p, q) => p.m - q.m);
    for (const d of hier) {
      aus.push({ ...s, a, b: d.m - TUER_BREITE / 2 });
      aus.push({ ...s, a: d.m - TUER_BREITE / 2, b: d.m + TUER_BREITE / 2, y0: TUER_HOEHE });
      a = d.m + TUER_BREITE / 2;
      platziert.add(d);
    }
    aus.push({ ...s, a });
  }
  // shortcut: Durchgang muss ganz in einem Wandstück liegen, nicht über einer Raumecke. Bei krummen Grundrissen Türlage frei wählbar machen.
  for (const d of DURCHGAENGE) {
    if (bodenVon(raumVon(d.a)) === boden && !platziert.has(d)) throw new Error(`Durchgang liegt über einer Ecke: ${d.a} / ${d.b}`);
  }
  return aus;
}

function anlageVon(id) {
  const an = ANLAGEN.find(a => a.id === id);
  if (!an) throw new Error('Unbekannte Anlage: ' + id);
  return an;
}

// Mitte einer Anlage in Weltkoordinaten
function anlagePunkt(an) {
  const r = raumVon(an.raum);
  return { x: r.x0 + an.x, z: r.z0 + an.z, y: bodenVon(r) };
}

for (const l of LEITUNGEN) {
  anlageVon(l.von); anlageVon(l.nach);
  if (!MEDIEN[l.medium]) throw new Error('Unbekanntes Medium: ' + l.medium);
}
anlageVon(BAHNHOF);

// Gezeichnete Rohrstücke: Produkte laufen über den Bahnhof (zwei Stücke), Versorgung direkt.
const ROHRE = LEITUNGEN.flatMap(l => MEDIEN[l.medium].produkt && !l.direkt
  ? [{ ...l, nach: BAHNHOF, an: undefined }, { ...l, von: BAHNHOF, ab: undefined }]
  : [l]);

// Anschlusspunkte: mehrere Rohre an einer Anlage stehen nebeneinander entlang ihrer langen Seite (0.15 m Abstand).
function anschluesse() {
  const zahl = {}, k = {};
  for (const r of ROHRE) for (const id of [r.von, r.nach]) zahl[id] = (zahl[id] || 0) + 1;
  const punkt = (id, name) => {
    const an = anlageVon(id), p = anlagePunkt(an);
    const fest = an.anschluesse && an.anschluesse[name];
    if (fest) return { x: p.x + fest[0], y: p.y, z: p.z + fest[2], hoch: fest[1] };
    const v = ((k[id] = (k[id] || 0) + 1) - 1 - (zahl[id] - 1) / 2) * 0.15;
    return an.t > an.b ? { ...p, z: p.z + v } : { ...p, x: p.x + v };
  };
  // shortcut: jede Leitung auf eigener Höhe (LEITUNG_ABSTAND), damit parallele Stücke sich nicht decken. Ab ~25 Leitungen stossen die obersten an 5-m-Decken: dann Rohrtrassen bündeln.
  return ROHRE.map((r, i) => ({ ...r, a: punkt(r.von, r.ab || r.medium), b: punkt(r.nach, r.an || r.medium),
    h: r.hoehe !== undefined ? r.hoehe : LEITUNG_HOEHE + i * LEITUNG_ABSTAND }));
}

// Weg einer Leitung, nur parallel zu den Wänden: hoch, entlang x, entlang z, runter.
function rohrWeg(r) {
  const unten = (id, p) => p.y + (p.hoch !== undefined ? p.hoch : id === BAHNHOF ? 1.2 : 1);
  return [
    { x: r.a.x, y: unten(r.von, r.a), z: r.a.z },
    { x: r.a.x, y: r.h, z: r.a.z },
    { x: r.b.x, y: r.h, z: r.a.z },
    { x: r.b.x, y: r.h, z: r.b.z },
    { x: r.b.x, y: unten(r.nach, r.b), z: r.b.z }
  ];
}

// Plausibilität der Daten, damit Tippfehler beim Anpassen des Grundrisses sofort auffallen.
for (const an of ANLAGEN) {
  const r = raumVon(an.raum);
  if (an.x - an.b / 2 < 0 || an.x + an.b / 2 > r.x1 - r.x0 || an.z - an.t / 2 < 0 || an.z + an.t / 2 > r.z1 - r.z0) {
    throw new Error(`Anlage ragt aus dem Raum: ${an.id} in ${r.id}`);
  }
}
