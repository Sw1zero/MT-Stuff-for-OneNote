// Molkerei 3D: Szene aus anlagen.js aufbauen, Steuerung, Overlay.
// Testeinstieg: window.kaeserei (select, schliessen, gehZu, raum). body[data-bereit="ja"], sobald die Szene steht.

const GEHEN = 1.4;   // m/s
const RENNEN = 4;    // m/s, mit Shift
const RADIUS = 0.3;  // Abstand der Person zur Wand
const DRAG_PX = 5;   // ab dieser Mausbewegung ist es Umschauen, kein Klick

const THREE = AFRAME.THREE;

// Text als Fläche: A-Frame-Schriften haben keine Umlaute, darum Canvas-Textur.
AFRAME.registerComponent('beschriftung', {
  schema: { text: { type: 'string' }, hoehe: { default: 0.5 }, farbe: { default: '#134061' }, grund: { default: '' } },
  init() {
    const d = this.data, px = 96;
    const c = document.createElement('canvas'), g = c.getContext('2d');
    const font = `600 ${px}px Inter, Arial, sans-serif`;
    g.font = font;
    c.width = Math.ceil(g.measureText(d.text).width + px * 0.6);
    c.height = Math.ceil(px * 1.5);
    g.font = font;
    if (d.grund) { g.fillStyle = d.grund; g.fillRect(0, 0, c.width, c.height); }
    g.fillStyle = d.farbe;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(d.text, c.width / 2, c.height / 2);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: !d.grund });
    this.el.setObject3D('mesh', new THREE.Mesh(new THREE.PlaneGeometry(d.hoehe * c.width / c.height, d.hoehe), mat));
  }
});

// Oberflächen als Canvas-Texturen (keine Bilddateien). groesse = Meter, die eine Textur abdeckt.
function textur(groesse, zeichne) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  zeichne(c.getContext('2d'), 256);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return { t, groesse };
}

function fliesen(n, platte, fuge, streuung) {
  return (g, px) => {
    const s = px / n;
    g.fillStyle = fuge; g.fillRect(0, 0, px, px);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const v = Math.round((Math.random() - 0.5) * streuung);
      g.fillStyle = `rgb(${platte.map(k => k + v).join(',')})`;
      g.fillRect(i * s + 1.5, j * s + 1.5, s - 3, s - 3);
    }
  };
}

const TEXTUREN = {
  boden: () => textur(0.8, fliesen(4, [236, 230, 222], '#a39d95', 10)),     // Bodenfliesen 20 cm
  fliese: () => textur(0.6, fliesen(4, [250, 250, 250], '#cfd4d8', 4)),     // Wandplatten 15 cm
  paneel: () => textur(1, (g, px) => {                                       // Sandwichpaneel 1 m breit
    g.fillStyle = '#eef1f3'; g.fillRect(0, 0, px, px);
    g.fillStyle = '#d3d9de'; g.fillRect(0, 0, 3, px);
    g.fillStyle = '#e6eaed'; for (let x = 32; x < px; x += 32) g.fillRect(x, 0, 1, px);
  }),
  gitterrost: () => textur(0.3, (g, px) => {                               // Gitterrost, Maschen 3 cm
    g.fillStyle = '#3a3f44'; g.fillRect(0, 0, px, px);
    g.fillStyle = '#b4bcc3'; for (let i = 0; i < px; i += px / 10) { g.fillRect(i, 0, 5, px); g.fillRect(0, i, px, 3); }
  }),
  beton: () => textur(2, (g, px) => {
    g.fillStyle = '#b8b7b2'; g.fillRect(0, 0, px, px);
    for (let i = 0; i < 4000; i++) {
      const v = 150 + Math.random() * 70 | 0;
      g.fillStyle = `rgba(${v},${v},${v - 4},0.35)`;
      g.fillRect(Math.random() * px, Math.random() * px, 2, 2);
    }
  })
};
const texturCache = {};

// Rechteckige Fläche mit gekachelter Textur, Kachelgrösse unabhängig von der Flächengrösse.
AFRAME.registerComponent('flaeche', {
  schema: { breite: { default: 1 }, hoehe: { default: 1 }, muster: { default: 'boden' }, farbe: { default: '#ffffff' } },
  init() {
    const d = this.data;
    const tex = texturCache[d.muster] || (texturCache[d.muster] = TEXTUREN[d.muster]());
    const geo = new THREE.PlaneGeometry(d.breite, d.hoehe);
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * d.breite / tex.groesse, uv.getY(i) * d.hoehe / tex.groesse);
    this.el.setObject3D('mesh', new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex.t, color: d.farbe, roughness: 0.85 })));
  }
});

// Rohr zwischen zwei Punkten
// Leitung durch die Punkte "x y z, x y z, ...": gerade Stücke, an jeder Ecke ein Rohrbogen (Radius ROHR_BOGEN,
// bei kurzen Stücken kleiner). Punkte, die doppelt sind oder auf einer Geraden liegen, fallen weg.
// ROHR_R: Leitungen Ø 8 cm, dünner als die Stutzen der Anlagen (Ø 9 cm), damit sie sichtbar im Stutzen stecken.
const ROHR_R = 0.04, ROHR_BOGEN = 0.15;
// Hülse, wo eine senkrechte Leitung durch den Boden des Erdgeschosses (= Decke des Untergeschosses) geht.
const HUELSE = new THREE.CylinderGeometry(ROHR_R + 0.025, ROHR_R + 0.025, 0.1, 24);
const HUELSE_MAT = new THREE.MeshStandardMaterial({ color: '#8a9299', roughness: 0.5, metalness: 0.6 });
function rohrPunkte(text) {
  const p = [];
  for (const v of text.split(',').map(s => new THREE.Vector3(...s.trim().split(/\s+/).map(Number)))) {
    if (p.length && v.distanceTo(p[p.length - 1]) < 1e-3) continue;
    if (p.length >= 2) {
      const d1 = p[p.length - 1].clone().sub(p[p.length - 2]).normalize(), d2 = v.clone().sub(p[p.length - 1]).normalize();
      if (d1.dot(d2) > 0.999) p.pop();
    }
    p.push(v);
  }
  return p;
}
AFRAME.registerComponent('rohr', {
  schema: { punkte: { default: '' }, farbe: { default: '#ffffff' } },
  init() {
    const p = rohrPunkte(this.data.punkte), g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: this.data.farbe, roughness: 0.4, metalness: 0.2 });
    const stueck = kurve => g.add(new THREE.Mesh(new THREE.TubeGeometry(kurve, kurve.isLineCurve3 ? 1 : 10, ROHR_R, 12, false), mat));
    const zu = (i, j, r) => p[i].clone().add(p[j].clone().sub(p[i]).normalize().multiplyScalar(r));
    let start = p[0];
    for (let i = 1; i < p.length; i++) {
      if (i === p.length - 1) { stueck(new THREE.LineCurve3(start, p[i])); break; }
      const r = Math.min(ROHR_BOGEN, p[i].distanceTo(p[i - 1]) / 2, p[i].distanceTo(p[i + 1]) / 2);
      const vor = zu(i, i - 1, r), nach = zu(i, i + 1, r);
      if (vor.distanceTo(start) > 1e-3) stueck(new THREE.LineCurve3(start, vor));
      stueck(new THREE.QuadraticBezierCurve3(vor, p[i], nach));
      start = nach;
    }
    for (let i = 1; i < p.length; i++) {
      const u = p[i - 1], v = p[i];
      if (Math.abs(u.x - v.x) < 1e-6 && Math.abs(u.z - v.z) < 1e-6 && Math.min(u.y, v.y) < 0 && Math.max(u.y, v.y) > 0) {
        const h = new THREE.Mesh(HUELSE, HUELSE_MAT); h.position.set(u.x, 0.02, u.z); h.name = 'huelse'; g.add(h);
      }
    }
    this.el.setObject3D('mesh', g);
  }
});

let waendeFest = [];

function frei(x, z, boden) {
  return !waendeFest.some(w => w.boden === boden && (w.laeuft === 'x'
    ? x > w.a - RADIUS && x < w.b + RADIUS && Math.abs(z - w.c) < WAND_DICKE / 2 + RADIUS
    : z > w.a - RADIUS && z < w.b + RADIUS && Math.abs(x - w.c) < WAND_DICKE / 2 + RADIUS));
}

// WASD/Pfeiltasten, Shift = rennen. Eigene Komponente statt wasd-controls, damit Tempo in m/s stimmt und Wände blockieren.
AFRAME.registerComponent('gehen', {
  init() {
    this.tasten = new Set();
    this.kamera = this.el.querySelector('[camera]');
    window.addEventListener('keydown', e => this.tasten.add(e.code));
    window.addEventListener('keyup', e => this.tasten.delete(e.code));
    window.addEventListener('blur', () => this.tasten.clear());
  },
  tick(t, dt) {
    const k = this.tasten;
    const vor = (k.has('KeyW') || k.has('ArrowUp')) - (k.has('KeyS') || k.has('ArrowDown'));
    const seit = (k.has('KeyD') || k.has('ArrowRight')) - (k.has('KeyA') || k.has('ArrowLeft'));
    if ((!vor && !seit) || document.querySelector('dialog[open]')) return;
    const tempo = k.has('ShiftLeft') || k.has('ShiftRight') ? RENNEN : GEHEN;
    const s = tempo * Math.min(dt, 100) / 1000 / Math.hypot(vor, seit);
    const th = this.kamera.object3D.rotation.y;
    const dx = (-Math.sin(th) * vor + Math.cos(th) * seit) * s;
    const dz = (-Math.cos(th) * vor - Math.sin(th) * seit) * s;
    const p = this.el.object3D.position, boden = geschossVon(p.y);
    // Eine Stufe geht, eine höhere Kante (Podestrand zur Anlage) blockiert wie ein Geländer.
    // In Schritten von höchstens 10 cm, damit bei wenigen Bildern pro Sekunde keine Stufe übersprungen wird.
    const geht = (x, z) => frei(x, z, boden) && Math.abs(hoeheAn(x, z, boden) - hoeheAn(p.x, p.z, boden)) <= STUFE_H + 0.05;
    const n = Math.ceil(Math.hypot(dx, dz) / 0.1);
    for (let i = 0; i < n; i++) {
      if (geht(p.x + dx / n, p.z)) p.x += dx / n;
      if (geht(p.x, p.z + dz / n)) p.z += dz / n;
    }
    p.y = boden + hoeheAn(p.x, p.z, boden);
    zeigeRaum();
  }
});

function el(tag, attrs, eltern) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  eltern.appendChild(e);
  return e;
}

// BAUTEN und Materialien: bauten.js

function baueSzene(szene) {
  for (const r of RAEUME) {
    const w = r.x1 - r.x0, t = r.z1 - r.z0, cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2, b = bodenVon(r);
    el('a-entity', { flaeche: `breite: ${w}; hoehe: ${t}; muster: boden; farbe: ${r.farbe}`, rotation: '-90 0 0', position: `${cx} ${b} ${cz}`, 'data-boden': r.id, shadow: 'cast: false; receive: true' }, szene);
    el('a-plane', { width: w, height: t, rotation: '90 0 0', position: `${cx} ${b + r.hoehe} ${cz}`, material: 'color: #f4f5f6; roughness: 1' }, szene);
  }

  const alle = waende();
  waendeFest = alle.filter(w => w.y0 === 0);
  for (const w of alle) {
    const h = w.hoehe - w.y0, mitte = (w.a + w.b) / 2, y = w.boden + w.y0 + h / 2;
    const pos = w.laeuft === 'x' ? `${mitte} ${y} ${w.c}` : `${w.c} ${y} ${mitte}`;
    el('a-box', {
      width: w.laeuft === 'x' ? w.b - w.a : WAND_DICKE, depth: w.laeuft === 'x' ? WAND_DICKE : w.b - w.a,
      height: h, position: pos, material: 'color: #fafbfc; roughness: 0.9'
    }, szene);
  }

  // Wandverkleidung pro Raumseite: Fliesen bis 2 m, darüber Paneele, oder Beton. Stürze bleiben glatt.
  for (const w of waendeFest) {
    const mitte = (w.a + w.b) / 2, breite = w.b - w.a;
    for (const seite of [-1, 1]) {
      const r = w.laeuft === 'x' ? raumAn(mitte, w.c + seite * 0.5, w.boden) : raumAn(w.c + seite * 0.5, mitte, w.boden);
      if (!r) continue; // Aussenseite
      const o = w.c + seite * (WAND_DICKE / 2 + 0.005);
      const rot = w.laeuft === 'x' ? (seite > 0 ? 0 : 180) : (seite > 0 ? 90 : -90);
      const baender = r.wand === 'beton' ? [['beton', 0, r.hoehe]] : [['fliese', 0, 2], ['paneel', 2, r.hoehe]];
      for (const [muster, y0, y1] of baender) {
        const y = w.boden + (y0 + y1) / 2;
        el('a-entity', {
          flaeche: `breite: ${breite}; hoehe: ${y1 - y0}; muster: ${muster}`, rotation: `0 ${rot} 0`,
          position: w.laeuft === 'x' ? `${mitte} ${y} ${o}` : `${o} ${y} ${mitte}`
        }, szene);
      }
    }
  }

  // Leitungen: hoch aus der Anlage, gerade hinüber, runter in die Zielanlage (bzw. den Bahnhof).
  // Aus dem Untergeschoss steigen sie durch die Decke bis auf LEITUNG_HOEHE im Erdgeschoss.
  for (const r of anschluesse()) {
    const punkte = rohrWeg(r).map(v => `${v.x} ${v.y} ${v.z}`).join(', ');
    el('a-entity', { 'data-leitung': `${r.von}>${r.nach}:${r.medium}`, rohr: `punkte: ${punkte}; farbe: ${MEDIEN[r.medium].farbe}` }, szene);
  }

  // Raumschild über jedem Durchgang, auf beiden Seiten mit dem Namen des Raums dahinter.
  for (const d of DURCHGAENGE) {
    const a = raumVon(d.a), b = raumVon(d.b), y = TUER_HOEHE + 0.45;
    const aVorne = d.laeuft === 'z' ? a.x1 === d.c : a.z1 === d.c; // a liegt auf der kleineren Koordinate
    for (const [ziel, seite] of [[b, aVorne ? -1 : 1], [a, aVorne ? 1 : -1]]) {
      const o = 0.15 * seite;
      const pos = d.laeuft === 'z' ? `${d.c + o} ${y} ${d.m}` : `${d.m} ${y} ${d.c + o}`;
      const rot = d.laeuft === 'z' ? (seite < 0 ? -90 : 90) : (seite < 0 ? 180 : 0);
      el('a-entity', { beschriftung: `text: ${ziel.name}; hoehe: 0.5; grund: #ffffff`, position: pos, rotation: `0 ${rot} 0`, 'data-schild': ziel.id }, szene);
    }
  }

  for (const p of PODESTE) podest(p, szene);

  for (const an of ANLAGEN) {
    const r = raumVon(an.raum);
    const g = el('a-entity', { 'data-anlage': an.id, position: `${r.x0 + an.x} ${bodenVon(r)} ${r.z0 + an.z}` }, szene);
    if (an.bau) {
      BAUTEN[an.bau](g);
    } else {
      el('a-plane', { width: an.b, height: an.t, rotation: '-90 0 0', position: '0 0.01 0', material: 'color: #69A9C9; opacity: 0.35; transparent: true' }, g);
      el('a-entity', { beschriftung: `text: ${an.name}; hoehe: ${Math.min(0.4, an.t * 0.3)}`, rotation: '-90 0 0', position: '0 0.02 0' }, g);
    }
    // Raycaster trifft nur Entities mit eigenem Mesh, darum die Bauteile markieren, nicht die Gruppe.
    for (const t of g.querySelectorAll('*')) t.classList.add('klickbar');
  }
}

// ---- Overlay ----

const $ = sel => document.querySelector(`[data-testid="${sel}"]`);
let aktuellerRaum = null;

function zeigeRaum() {
  const p = document.getElementById('spieler').object3D.position;
  const r = raumAn(p.x, p.z, geschossVon(p.y));
  if (!r || r.id === aktuellerRaum) return;
  aktuellerRaum = r.id;
  $('raum-aktuell').textContent = 'Sie sind in: ' + r.name;
  for (const b of document.querySelectorAll('[data-raum]')) b.toggleAttribute('aria-current', b.dataset.raum === r.id);
}

function setzeSpieler(x, z, dx, dz, boden = 0) {
  document.getElementById('spieler').object3D.position.set(x, boden, z);
  const lc = document.getElementById('kamera').components['look-controls'];
  lc.yawObject.rotation.y = Math.atan2(-dx, -dz);
  lc.pitchObject.rotation.x = 0;
  zeigeRaum();
}

function hervorheben(g, an) {
  // Eigenes Leuchten (Licht, Temperaturanzeige) merken, sonst ist es nach dem Hervorheben weg
  g.object3D.traverse(o => {
    if (!o.material || !o.material.emissive) return;
    if (o.userData.leuchten === undefined) o.userData.leuchten = o.material.emissive.getHex();
    o.material.emissive.setHex(an ? 0x1d4a66 : o.userData.leuchten);
  });
}

// Getroffenes Teil bzw. Anlage zu einem Klick-/Hover-Ziel
const ziel = e => e.target.closest && (e.target.closest('[data-teil]') || e.target.closest('[data-anlage]'));

window.kaeserei = {
  // Anlage oder ein Teil davon (teilId aus anlagen.js teile) im Overlay zeigen
  select(id, teilId) {
    const an = anlageVon(id);
    const t = teilId ? (an.teile || []).find(t => t.id === teilId) : null;
    if (teilId && !t) throw new Error(`Unbekanntes Teil: ${id}/${teilId}`);
    $('overlay-titel').textContent = an.name;
    $('overlay-teil').textContent = t ? t.name : '';
    $('overlay-teil').hidden = !t;
    $('overlay-bild').hidden = !(t && t.bild);
    if (t && t.bild) { $('overlay-bild').src = t.bild; $('overlay-bild').alt = `Zeichnung ${t.name}`; }
    $('overlay-text').textContent = t ? t.text : an.text || (an.bau ? 'Infotext folgt.' : 'Diese Anlage folgt. Sie wird später in 3D gebaut.');
    $('overlay-uebersicht').hidden = !t;
    const aktion = $('overlay-aktion');
    aktion.hidden = !an.oeffnen;
    const g = document.querySelector(`[data-anlage="${id}"]`);
    if (an.oeffnen) aktion.textContent = g.dataset.offen ? an.oeffnen.zu : an.oeffnen.auf;
    $('overlay-betrieb').hidden = !an.betrieb;
    if (an.betrieb) $('overlay-betrieb').textContent = g.dataset.betrieb ? an.betrieb.aus : an.betrieb.an;
    $('overlay-hinweis').hidden = !(an.betrieb && an.betrieb.hinweis && g.dataset.betrieb);
    $('overlay-schnitt').hidden = !an.schnittbild;
    $('overlay-wechsel').hidden = !an.wechsel;
    if (an.wechsel) $('overlay-wechsel').textContent = an.wechsel.text;
    if (an.betrieb) $('overlay-hinweis').textContent = an.betrieb.hinweis;
    $('overlay').dataset.anlage = id;
    $('overlay').dataset.teil = t ? t.id : '';
    $('overlay').hidden = false;
  },
  schliessen() { $('overlay').hidden = true; },
  // Bewegliche Teile ([data-oeffnen] = Hub in m nach oben, oder Weg "x y z") bewegen, z.B. Separator-Haube, Pumpen-Explosion
  oeffnen(id) {
    const g = document.querySelector(`[data-anlage="${id}"]`);
    const auf = !g.dataset.offen;
    if (auf && g.dataset.betrieb) window.kaeserei.betrieb(id); // offen läuft nichts
    if (auf) g.dataset.offen = 'ja'; else delete g.dataset.offen;
    const dur = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1500;
    for (const t of g.querySelectorAll('[data-oeffnen]')) {
      const weg = t.dataset.oeffnen.includes(' ') ? t.dataset.oeffnen : `0 ${t.dataset.oeffnen} 0`;
      t.setAttribute('animation__oeffnen', { property: 'position', to: auf ? weg : '0 0 0', dur, easing: 'easeInOutQuad' });
    }
    // Abgekoppelte Anlage (z.B. Pumpen-Explosion): Leitungen sofort weg, nach dem Zusammenbauen wieder da
    if (anlageVon(id).oeffnen.leitungenWeg) {
      const zeigen = () => { for (const l of document.querySelectorAll(`[data-leitung^="${id}>"], [data-leitung*=">${id}:"]`)) l.setAttribute('visible', !g.dataset.offen); };
      if (auf) zeigen(); else setTimeout(zeigen, dur);
    }
    if ($('overlay').dataset.anlage === id && !$('overlay').hidden) window.kaeserei.select(id, $('overlay').dataset.teil || undefined);
  },
  // Betrieb ein/aus: Bau hört auf das Ereignis 'betrieb' an der Anlage, z.B. Separator-Schnitt mit Strömung
  betrieb(id) {
    const g = document.querySelector(`[data-anlage="${id}"]`);
    const an = !g.dataset.betrieb;
    if (an && g.dataset.offen) window.kaeserei.oeffnen(id); // erst Haube schliessen
    if (an) g.dataset.betrieb = 'ja'; else delete g.dataset.betrieb;
    g.emit('betrieb', { an }, false);
    if ($('overlay').dataset.anlage === id && !$('overlay').hidden) window.kaeserei.select(id, $('overlay').dataset.teil || undefined);
  },
  // Nächste Variante zeigen (z.B. anderer Rührer): Bau hört auf das Ereignis 'wechsel', Overlay zeigt das neue Teil
  wechsel(id) {
    const g = document.querySelector(`[data-anlage="${id}"]`);
    const v = anlageVon(id).wechsel.varianten;
    const i = ((+g.dataset.variante || 0) + 1) % v.length;
    g.dataset.variante = i;
    g.emit('wechsel', { teile: v[i] }, false);
    if ($('overlay').dataset.anlage === id && !$('overlay').hidden) window.kaeserei.select(id, v[i][0]);
  },
  // An den Eingang des Raums (erster Durchgang in TUEREN), 2 m im Raum, Blick hinein.
  gehZu(raumId) {
    const r = raumVon(raumId);
    const d = DURCHGAENGE.find(d => d.a === raumId || d.b === raumId);
    if (!d) return setzeSpieler((r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2, 1, 0, bodenVon(r)); // z.B. Untergeschoss ohne Treppe
    if (d.laeuft === 'z') { const s = (r.x0 + r.x1) / 2 > d.c ? 1 : -1; setzeSpieler(d.c + 2 * s, d.m, s, 0, bodenVon(r)); }
    else { const s = (r.z0 + r.z1) / 2 > d.c ? 1 : -1; setzeSpieler(d.m, d.c + 2 * s, 0, s, bodenVon(r)); }
  },
  raum: () => aktuellerRaum
};

document.addEventListener('DOMContentLoaded', () => {
  if (matchMedia('(hover: none) and (pointer: coarse)').matches) { $('nur-desktop').hidden = false; return; }

  const szene = document.querySelector('a-scene');
  baueSzene(szene);

  const liste = $('raumliste').querySelector('ul');
  for (const r of RAEUME) {
    const li = el('li', {}, liste);
    const b = el('button', { type: 'button', 'data-raum': r.id }, li);
    b.textContent = r.name;
    b.addEventListener('click', () => window.kaeserei.gehZu(r.id));
  }

  // Klick nur, wenn die Maus nicht zum Umschauen gezogen wurde.
  let unten = null, gezogen = false;
  window.addEventListener('mousedown', e => { unten = [e.clientX, e.clientY]; gezogen = false; }, true);
  window.addEventListener('mousemove', e => { if (unten && Math.hypot(e.clientX - unten[0], e.clientY - unten[1]) > DRAG_PX) gezogen = true; }, true);
  szene.addEventListener('click', e => {
    const z = ziel(e);
    if (!z || gezogen) return;
    const g = z.closest('[data-anlage]');
    window.kaeserei.select(g.dataset.anlage, z.dataset.teil);
    if (z.dataset.teil) g.emit('teil', { teil: z.dataset.teil }, false); // z.B. Mannloch öffnen, Licht schalten
  });
  szene.addEventListener('mouseenter', e => { const z = ziel(e); if (z) hervorheben(z, true); });
  szene.addEventListener('mouseleave', e => { const z = ziel(e); if (z) hervorheben(z, false); });

  $('overlay-schliessen').addEventListener('click', () => window.kaeserei.schliessen());
  $('overlay-aktion').addEventListener('click', () => window.kaeserei.oeffnen($('overlay').dataset.anlage));
  $('overlay-betrieb').addEventListener('click', () => window.kaeserei.betrieb($('overlay').dataset.anlage));
  $('overlay-schnitt').addEventListener('click', () => {
    const id = $('overlay').dataset.anlage;
    ({ schulenburg: window.schulenburgSchnitt, ruehrwerk: window.ruehrwerkSchnitt, membran: window.membranSchnitt }[anlageVon(id).schnittbild] || window.schnittbild).oeffnen(id);
  });
  $('overlay-wechsel').addEventListener('click', () => window.kaeserei.wechsel($('overlay').dataset.anlage));
  $('overlay-uebersicht').addEventListener('click', () => window.kaeserei.select($('overlay').dataset.anlage));
  window.addEventListener('keydown', e => { if (e.key === 'Escape' && !document.querySelector('dialog[open]')) window.kaeserei.schliessen(); });

  const start = () => { setzeSpieler(START.x, START.z, START.blick[0], START.blick[1]); document.body.dataset.bereit = 'ja'; };
  if (szene.hasLoaded) start(); else szene.addEventListener('loaded', start);
});
