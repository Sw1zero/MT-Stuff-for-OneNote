// 3D-Bauten der Anlagen. Ursprung = Mitte der Anlage am Boden, Masse in Metern, Vorderseite zeigt nach +z.
// Teile mit data-teil sind einzeln anklickbar, Name und Text stehen in anlagen.js unter teile.
// Braucht el() aus script.js.

const METALL = 'color: #c3ccd4; metalness: 0.6; roughness: 0.35';
const CHROM = 'color: #d3d8dc; metalness: 0.45; roughness: 0.28';
const MATT = 'color: #b9c0c6; metalness: 0.35; roughness: 0.5';
const SCHWARZ = 'color: #22262a; roughness: 0.6';

// Drehkörper aus einem Profil "r y, r y, ..." (wie an der Drehbank)
AFRAME.registerComponent('drehprofil', {
  schema: { punkte: { type: 'string' }, farbe: { default: '#d3d8dc' }, metall: { default: 0.45 }, rau: { default: 0.28 } },
  init() {
    const pts = this.data.punkte.split(',').map(p => { const [r, y] = p.trim().split(/\s+/).map(Number); return new THREE.Vector2(r, y); });
    const mat = new THREE.MeshStandardMaterial({ color: this.data.farbe, metalness: this.data.metall, roughness: this.data.rau, side: THREE.DoubleSide });
    this.el.setObject3D('mesh', new THREE.Mesh(new THREE.LatheGeometry(pts, 48), mat));
  }
});

const teil = (g, id, attrs = {}) => el('a-entity', { 'data-teil': id, ...attrs }, g);

// In Blender gebaute Anlage (glTF). Gruppen unter dem Knoten wurzel mit einer Teil-id aus anlagen.js werden
// nach dem Laden eigene Entities mit data-teil (Klick, Hervorheben). hub: Teil-id > "x y z" für data-oeffnen.
function glbTeile(g, datei, wurzel, hub = {}) {
  const m = el('a-entity', { 'gltf-model': datei }, g);
  const ids = anlageVon(g.dataset.anlage).teile.map(t => t.id);
  m.addEventListener('model-loaded', () => {
    // glTF-Teile (und gleiche Anlagen) teilen sich Materialien: eigene Kopie, sonst leuchtet beim Hervorheben alles mit
    m.getObject3D('mesh').traverse(o => { if (o.material) o.material = o.material.clone(); });
    for (const node of [...m.getObject3D('mesh').getObjectByName(wurzel).children]) {
      if (!ids.includes(node.name)) continue;
      const attrs = { 'data-teil': node.name, class: 'klickbar' };
      if (hub[node.name]) attrs['data-oeffnen'] = hub[node.name];
      el('a-entity', attrs, g).setObject3D('mesh', node);
    }
  });
}
const liegend = (g, r, laenge, x, y, z, mat = CHROM) =>
  el('a-cylinder', { radius: r, height: laenge, rotation: '0 0 90', position: `${x} ${y} ${z}`, material: mat, 'segments-radial': 32 }, g);
const stehend = (g, r, h, x, yUnten, z, mat = CHROM, segmente = 24) =>
  el('a-cylinder', { radius: r, height: h, position: `${x} ${yUnten + h / 2} ${z}`, material: mat, 'segments-radial': segmente }, g);

// Klemmverbindung (Rohrkupplung): Wulstring ums Rohr, achse 'y' = senkrechtes Rohr, 'x' = waagrechtes
const klemme = (g, r, x, y, z, achse = 'y') =>
  el('a-torus', { radius: r + 0.006, 'radius-tubular': 0.009, rotation: achse === 'y' ? '90 0 0' : '0 90 0', position: `${x} ${y} ${z}`, material: CHROM, 'segments-tubular': 24 }, g);

// Drosselventil auf waagrechtem Rohr: Gehäuse, Spindel, Handrad mit drei Speichen
function drosselventil(g, x, y) {
  stehend(g, 0.038, 0.07, x, y - 0.035, 0, CHROM);
  stehend(g, 0.008, 0.07, x, y + 0.035, 0, CHROM);
  el('a-torus', { radius: 0.042, 'radius-tubular': 0.006, rotation: '90 0 0', position: `${x} ${y + 0.105} 0`, material: SCHWARZ, 'segments-tubular': 24 }, g);
  for (let i = 0; i < 3; i++) el('a-box', { width: 0.084, height: 0.006, depth: 0.006, rotation: `0 ${i * 60} 0`, position: `${x} ${y + 0.105} 0`, material: SCHWARZ }, g);
}

// Warnschild nach Foto: gelbes Feld mit zwei Warndreiecken (Ausrufezeichen, Hand)
AFRAME.registerComponent('warnschild', {
  init() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 160;
    const k = c.getContext('2d');
    k.fillStyle = '#f2c81d'; k.fillRect(0, 0, 256, 160);
    k.strokeStyle = '#1a1a1a'; k.lineWidth = 4; k.strokeRect(4, 4, 248, 152); k.beginPath(); k.moveTo(128, 4); k.lineTo(128, 156); k.stroke();
    for (const cx of [64, 192]) {
      k.beginPath(); k.moveTo(cx, 26); k.lineTo(cx + 48, 110); k.lineTo(cx - 48, 110); k.closePath(); k.lineWidth = 8; k.stroke();
    }
    k.fillStyle = '#1a1a1a'; k.font = 'bold 44px Arial, sans-serif'; k.textAlign = 'center'; k.fillText('!', 64, 100);
    // Drehpfeil: Gefahr durch drehende Teile
    k.lineWidth = 6; k.beginPath(); k.arc(192, 84, 16, -0.3, 4.4); k.stroke();
    k.beginPath(); k.moveTo(206, 66); k.lineTo(214, 80); k.lineTo(198, 80); k.closePath(); k.fill();
    k.fillRect(20, 124, 216, 6); k.fillRect(20, 138, 160, 6);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    this.el.setObject3D('mesh', new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.094), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 })));
  }
});
const kasten = (g, b, h, t, x, yUnten, z, mat = CHROM) =>
  el('a-box', { width: b, height: h, depth: t, position: `${x} ${yUnten + h / 2} ${z}`, material: mat }, g);

// Manometer mit Zifferblatt nach vorn
function manometer(g, x, y, z) {
  stehend(g, 0.012, 0.06, x, y, z);
  el('a-cylinder', { radius: 0.055, height: 0.025, rotation: '90 0 0', position: `${x} ${y + 0.11} ${z}`, material: CHROM }, g);
  el('a-circle', { radius: 0.047, position: `${x} ${y + 0.11} ${z + 0.0135}`, material: 'color: #f7f7f2; roughness: 0.4' }, g);
  el('a-box', { width: 0.004, height: 0.035, depth: 0.002, rotation: '0 0 -40', position: `${x + 0.008} ${y + 0.118} ${z + 0.015}`, material: SCHWARZ }, g);
}

// Separator im Betrieb: vordere Hälfte von Haube, Gehäuse und Trommel weggeschnitten, drehende Teile drehen
// (rund 100-mal langsamer als echt). Die Strömung zeigt das Schnittbild (schnittbild.js), nicht die 3D-Szene:
// mitdrehende Kugeln in der kleinen Trommel waren nicht zu verfolgen.
const SEP_GESCHNITTEN = ['gestellhaube', 'gestelloberteil', 'trommelunterteil', 'kolbenschieber', 'verteiler', 'tellerpaket',
  'einlaufrohr', 'scheideteller', 'dichtring', 'trommeldeckel', 'trommelverschlussring', 'magermilchgreifer',
  'greiferkammerdeckel', 'greiferkammerverschlussring'];
const SEP_DREHEND = ['trommelunterteil', 'kolbenschieber', 'verteiler', 'tellerpaket', 'scheideteller', 'dichtring',
  'trommeldeckel', 'trommelverschlussring', 'greiferkammerdeckel', 'greiferkammerverschlussring']; // Greifer stehen still

AFRAME.registerComponent('separatorbetrieb', {
  init() {
    this.an = false; this.winkel = 0;
    this.ebene = new THREE.Plane();
    this.ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.el.closest('[data-anlage]').addEventListener('betrieb', e => this.schalten(e.detail.an));
  },
  schalten(an) {
    this.an = an;
    if (!this.drehend) { // erst jetzt: die Teile entstehen nach dieser Komponente
      const teile = id => [...this.el.querySelectorAll(`[data-teil="${id}"]`)];
      this.drehend = SEP_DREHEND.flatMap(teile);
      this.geschnitten = SEP_GESCHNITTEN.flatMap(teile);
    }
    this.el.sceneEl.renderer.localClippingEnabled = true;
    // Schnittebene durch die Trommelachse, vordere Hälfte (+z) weg
    const achse = this.el.object3D.getWorldPosition(new THREE.Vector3());
    this.ebene.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, -1), achse);
    for (const t of this.geschnitten) t.object3D.traverse(o => {
      if (!o.material) return;
      if (!o.userData.eigen) { o.material = o.material.clone(); o.userData.eigen = true; } // Material nicht mit anderen Anlagen teilen
      o.material.clippingPlanes = an ? [this.ebene] : null;
      o.material.needsUpdate = true;
    });
    if (!an) for (const t of this.drehend) t.object3D.rotation.y = 0;
  },
  tick(t, dt) {
    if (!this.an || this.ruhig) return;
    this.winkel += Math.min(dt, 100) / 1000 * Math.PI * 2; // 1 U/s statt rund 100 U/s
    for (const d of this.drehend) d.object3D.rotation.y = this.winkel;
  }
});

const BAUTEN = {
  // Separator nach Fotos references/_inbox/molkerei/zentrifuge_1+2 (SPX), gut 1.6 m hoch.
  // Teile nach Lehrmittel a.2 «Aufbau des Separators». Die Haube lässt sich öffnen (aktion 'haube').
  separator(g) {
    const m = el('a-entity', { position: '0.23 0 0', separatorbetrieb: '' }, g); // Modell ist nach links (Motor) länger: mittig rücken

    // 3 Gestellunterteil: Rahmen aus Vierkantrohr, Gewindefüsse mit Tellern, Gussfuss unter dem Getriebe
    const unter = teil(m, 'gestellunterteil');
    for (const z of [-0.27, 0.27]) kasten(unter, 1.04, 0.05, 0.05, -0.19, 0.17, z, MATT);
    for (const x of [-0.69, -0.42, 0.29]) kasten(unter, 0.05, 0.05, 0.5, x, 0.17, 0, MATT);
    for (const x of [-0.66, 0.26]) for (const z of [-0.27, 0.27]) {
      stehend(unter, 0.012, 0.15, x, 0.02, z, CHROM);
      stehend(unter, 0.022, 0.025, x, 0.12, z, MATT, 6);   // Kontermutter
      stehend(unter, 0.055, 0.02, x, 0, z, SCHWARZ);
    }
    kasten(unter, 0.25, 0.16, 0.25, -0.55, 0.22, 0, MATT);                 // Motorträger
    el('a-entity', { drehprofil: 'punkte: 0.27 0.22, 0.27 0.25, 0.22 0.27, 0.22 0.36, 0.25 0.37, 0.25 0.39, 0 0.39', farbe: '#b9c0c6', metall: 0.35, rau: 0.5 }, unter); // Gussfuss rund
    for (let i = 0; i < 6; i++) {
      const w = i * Math.PI / 3;
      stehend(unter, 0.014, 0.02, 0.245 * Math.cos(w), 0.25, 0.245 * Math.sin(w), CHROM, 6);
    }

    // 2 Elektromotor: Kühlrippen, Lüfterhaube hinten, Lüftungsschlitze vorn, Klemmenkasten unten
    const motor = teil(m, 'elektromotor');
    liegend(motor, 0.2, 0.7, -0.675, 0.57, 0);
    for (const x of [-1.0, -0.35]) liegend(motor, 0.206, 0.015, x, 0.57, 0, MATT);
    el('a-entity', { drehprofil: 'punkte: 0 -0.06, 0.08 -0.055, 0.17 -0.04, 0.2 -0.01, 0.205 0', farbe: '#b9c0c6', metall: 0.35, rau: 0.5, rotation: '0 0 -90', position: '-1.025 0.57 0' }, motor);
    for (let s = 0; s < 3; s++) for (let r = 0; r < 4; r++) {
      kasten(motor, 0.07, 0.012, 0.012, -0.9 + s * 0.09, 0.44 + r * 0.025, 0.155 + r * 0.012, SCHWARZ);
    }
    kasten(motor, 0.14, 0.08, 0.14, -0.72, 0.31, 0.02, MATT);              // Klemmenkasten
    el('a-plane', { width: 0.07, height: 0.035, position: '-0.72 0.35 0.091', material: 'color: #f2c81d' }, motor);

    // 1 Getriebe: Gehäuse mit Flanschringen, Typenschild, Ölstopfen, Schauglas, Sterngriff
    const getriebe = teil(m, 'getriebe');
    liegend(getriebe, 0.23, 0.65, 0, 0.56, 0);
    for (const x of [-0.32, 0.32]) liegend(getriebe, 0.236, 0.02, x, 0.56, 0, MATT);
    el('a-entity', { beschriftung: 'text: SPX; hoehe: 0.045; grund: #e9ecef; farbe: #3a4148', position: '-0.06 0.67 0.205', rotation: '-28 0 0' }, getriebe);
    el('a-cylinder', { radius: 0.018, height: 0.02, rotation: '90 0 0', position: '0.13 0.67 0.205', material: CHROM }, getriebe);
    el('a-cylinder', { radius: 0.088, height: 0.035, rotation: '90 0 0', position: '0.075 0.47 0.212', material: CHROM }, getriebe);
    el('a-torus', { radius: 0.072, 'radius-tubular': 0.01, position: '0.075 0.47 0.232', material: CHROM }, getriebe);
    el('a-circle', { radius: 0.062, position: '0.075 0.47 0.231', material: 'color: #8fbcd4; metalness: 0.2; roughness: 0.08' }, getriebe);
    el('a-cylinder', { radius: 0.03, height: 0.05, rotation: '90 0 0', position: '-0.15 0.53 0.245', material: SCHWARZ }, getriebe);
    for (let i = 0; i < 3; i++) el('a-box', { width: 0.09, height: 0.022, depth: 0.03, rotation: `0 0 ${i * 60}`, position: '-0.15 0.53 0.275', material: SCHWARZ }, getriebe);
    stehend(getriebe, 0.3, 0.06, 0, 0.73, 0, MATT);                        // Lagerhals unter der Haube

    // 5 Gestelloberteil (Trommelgehäuse): Ring mit Wulst, Deckelschraube, Spannband zur Haube
    const ober = teil(m, 'gestelloberteil');
    el('a-entity', { drehprofil: 'punkte: 0.30 0.775, 0.36 0.79, 0.375 0.84, 0.365 0.89, 0.39 0.91, 0.385 0.94, 0.33 0.94' }, ober);
    el('a-cylinder', { radius: 0.034, height: 0.03, rotation: '90 0 0', position: '0 0.85 0.372', material: CHROM }, ober);
    el('a-cylinder', { radius: 0.022, height: 0.02, rotation: '90 0 0', position: '0 0.85 0.392', material: CHROM, 'segments-radial': 6 }, ober);
    el('a-torus', { radius: 0.389, 'radius-tubular': 0.011, rotation: '90 0 0', position: '0 0.935 0', material: MATT, 'segments-radial': 8, 'segments-tubular': 64 }, ober);

    // 4 Trommel: erst sichtbar bei offener Haube. Bauweise nach Westfalia MHA (Bild 19, Schnitt) und
    // Lehrmittel a.2 «Trommelbestandteile» 1-12. Beim Öffnen heben sich die Teile in umgekehrter
    // Einbaureihenfolge wie in der Explosionszeichnung (data-oeffnen = Hub in m): 12 bleibt, 1 hebt am meisten.
    const hub = (g, wert) => el('a-entity', { 'data-oeffnen': String(wert) }, g);
    const profil = (g, punkte, farbe) => el('a-entity', { drehprofil: `punkte: ${punkte}; farbe: ${farbe}; metall: 0.2; rau: 0.45` }, g);
    // Jedes Trommelteil eine eigene Farbe, Nachbarn im Kontrast: geöffnet sind die Teile so klar zu unterscheiden.
    // Didaktische Farben, in Wirklichkeit ist alles Chromstahl.
    const F = {
      trommelunterteil: '#6f98bd', kolbenschieber: '#e09a4f', verteiler: '#7dba73', tellerpaket: '#e6e9ec',
      einlaufrohr: '#d9675f', scheideteller: '#3f5f80', trommeldeckel: '#5fb3a8', trommelverschlussring: '#9b78c4',
      magermilchgreifer: '#d98cb3', greiferkammerdeckel: '#c9a86a', greiferkammerverschlussring: '#4f8a55'
    };
    const mat = id => `color: ${F[id]}; metalness: 0.2; roughness: 0.45`;

    // 12 Trommelunterteil: Topf mit Schlammaustrittsöffnungen rundum, Spindelmutter in der Mitte
    const unterteil = teil(m, 'trommelunterteil');
    profil(unterteil, '0.05 0.80, 0.22 0.80, 0.27 0.815, 0.29 0.85, 0.29 0.97, 0.265 0.97, 0.265 0.845, 0.05 0.845', F.trommelunterteil);
    for (let i = 0; i < 10; i++) {
      const w = i * Math.PI / 5;
      el('a-cylinder', { radius: 0.011, height: 0.01, rotation: `90 ${-w * 180 / Math.PI + 90} 0`, position: `${0.29 * Math.cos(w)} 0.89 ${0.29 * Math.sin(w)}`, material: SCHWARZ }, unterteil);
    }
    el('a-cone', { 'radius-bottom': 0.03, 'radius-top': 0.008, height: 0.05, position: '0 0.87 0', material: mat('trommelunterteil') }, unterteil);

    // 11 Kolbenschieber (Schieberboden): Scheibe, die die Schlammaustrittsöffnungen von innen abdeckt
    profil(hub(teil(m, 'kolbenschieber'), 0.15), '0.04 0.86, 0.255 0.86, 0.26 0.875, 0.24 0.885, 0.07 0.915, 0.04 0.915', F.kolbenschieber);

    // 10 Verteiler: Kegelfuss mit Steigrohr
    const verteiler = hub(teil(m, 'verteiler'), 0.32);
    el('a-cone', { 'radius-bottom': 0.2, 'radius-top': 0.045, height: 0.09, position: '0 0.965 0', material: mat('verteiler') }, verteiler);
    stehend(verteiler, 0.045, 0.24, 0, 0.92, 0, mat('verteiler'));

    // 9 Teller: rücken beim Öffnen auseinander, damit man das Paket als einzelne Teller sieht
    const teller = teil(m, 'tellerpaket');
    for (let i = 0; i < 10; i++) {
      el('a-cone', { 'radius-bottom': 0.235, 'radius-top': 0.07, height: 0.085, 'open-ended': true, position: `0 ${0.975 + i * 0.009} 0`, material: mat('tellerpaket') + '; side: double', 'segments-radial': 36 }, hub(teller, (0.48 + i * 0.035).toFixed(3)));
    }

    // 8 Einlaufrohr mit Rahmgreifer: Rohr durch die Mitte, Greiferscheibe oben
    const einlauf = hub(teil(m, 'einlaufrohr'), 0.95);
    stehend(einlauf, 0.02, 0.2, 0, 1.03, 0, mat('einlaufrohr'));
    stehend(einlauf, 0.05, 0.012, 0, 1.17, 0, mat('einlaufrohr'));

    // 7 Scheideteller: grösser und dunkler als die Teller, trennt Rahm- und Magermilchweg
    el('a-cone', { 'radius-bottom': 0.22, 'radius-top': 0.08, height: 0.08, 'open-ended': true, position: '0 1.09 0', material: mat('scheideteller') + '; side: double', 'segments-radial': 36 }, hub(teil(m, 'scheideteller'), 1.05));

    // 6 Dichtring zwischen Unterteil und Deckel
    el('a-torus', { radius: 0.277, 'radius-tubular': 0.006, rotation: '90 0 0', position: '0 0.972 0', material: SCHWARZ, 'segments-tubular': 64 }, hub(teil(m, 'dichtring'), 1.15));

    // 5 Trommeldeckel: Kegel mit Hals zur Greiferkammer
    profil(hub(teil(m, 'trommeldeckel'), 1.25), '0.29 0.975, 0.275 1.0, 0.11 1.15, 0.09 1.17, 0.09 1.215, 0.065 1.215', F.trommeldeckel);

    // 4 Trommelverschlussring: grosser Gewindering, hält Deckel und Unterteil zusammen
    profil(hub(teil(m, 'trommelverschlussring'), 1.38), '0.29 0.95, 0.312 0.95, 0.312 1.0, 0.285 1.0', F.trommelverschlussring);

    // 3 Magermilchgreifer, 2 Greiferkammerdeckel, 1 Greiferkammerverschlussring
    const mager = hub(teil(m, 'magermilchgreifer'), 1.5);
    stehend(mager, 0.075, 0.01, 0, 1.195, 0, mat('magermilchgreifer'));
    stehend(mager, 0.025, 0.04, 0, 1.205, 0, mat('magermilchgreifer'));
    stehend(hub(teil(m, 'greiferkammerdeckel'), 1.58), 0.088, 0.015, 0, 1.215, 0, mat('greiferkammerdeckel'));
    el('a-torus', { radius: 0.09, 'radius-tubular': 0.008, rotation: '90 0 0', position: '0 1.232 0', material: mat('greiferkammerverschlussring'), 'segments-tubular': 32 }, hub(teil(m, 'greiferkammerverschlussring'), 1.66));

    // 6 Gestellhaube mit Kragen und Warnschild, darauf Zulauf und Abläufe: hebt sich beim Öffnen am weitesten
    const oben = hub(m, 2.0);
    const haube = teil(oben, 'gestellhaube');
    el('a-entity', { drehprofil: 'punkte: 0.385 0.94, 0.32 1.04, 0.21 1.21, 0.10 1.37, 0.06 1.41, 0.06 1.43, 0 1.43' }, haube);
    stehend(haube, 0.07, 0.02, 0, 1.425, 0, MATT);
    el('a-entity', { warnschild: '', position: '0 1.155 0.262', rotation: '-34 0 0' }, haube);

    // 7 Milchzulauf: senkrecht oben in der Mitte, Klemmverbindungen
    const zulauf = teil(oben, 'milchzulauf');
    stehend(zulauf, 0.035, 0.31, 0, 1.445, 0);
    klemme(zulauf, 0.035, 0, 1.6, 0);
    klemme(zulauf, 0.035, 0, 1.745, 0);

    // 8 Rahmauslauf (rechts) mit Rahmschraube und Manometer, 9 Magermilchauslauf (links) mit Magermilchschraube und Manometer
    stehend(zulauf, 0.048, 0.06, 0, 1.43, 0); // Kreuzstück unter den Abläufen
    const auslauf = (id, seite) => {
      const t = teil(oben, id);
      liegend(t, 0.026, 0.4, seite * 0.24, 1.47, 0);
      klemme(t, 0.026, seite * 0.08, 1.47, 0, 'x');
      stehend(t, 0.026, 0.03, seite * 0.4, 1.455, 0);
      klemme(t, 0.026, seite * 0.4, 1.485, 0);
      return t;
    };
    const rahm = auslauf('rahmauslauf', 1);
    auslauf('magermilchauslauf', -1);
    drosselventil(teil(oben, 'rahmschraube'), 0.18, 1.47);
    drosselventil(teil(oben, 'magermilchschraube'), -0.18, 1.47);
    manometer(rahm, 0.3, 1.495, 0);
    manometer(teil(oben, 'manometer'), -0.3, 1.495, 0);

    // 10 Steuerwasseranschluss: Kasten mit Manometer, Filter mit Glasbecher, Magnetventil, Leitung zum Gehäuse
    const steuer = teil(m, 'steuerwasser');
    kasten(steuer, 0.17, 0.19, 0.14, 0.5, 0.6, 0);
    manometer(steuer, 0.5, 0.72, 0.09);
    stehend(steuer, 0.048, 0.035, 0.5, 0.79, 0, 'color: #2f6fd6; roughness: 0.4');
    stehend(steuer, 0.04, 0.09, 0.5, 0.825, 0, 'color: #dfe9f2; opacity: 0.55; transparent: true; roughness: 0.1');
    stehend(steuer, 0.018, 0.08, 0.5, 0.83, 0, 'color: #f4f1e8; roughness: 0.8');
    liegend(steuer, 0.01, 0.13, 0.36, 0.7, 0);
    kasten(steuer, 0.04, 0.05, 0.04, 0.34, 0.715, 0, SCHWARZ);              // Magnetventil
  },

  // Rohrbahnhof: Wandtafel 2.4 m lang mit Rohrstutzen, Schwenkbogen als Rohr-U
  bahnhof(g) {
    el('a-box', { width: 0.15, height: 2.2, depth: 2.4, position: '0 1.1 0', material: METALL }, g);
    for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) {
      el('a-cylinder', { radius: 0.05, height: 0.2, rotation: '0 0 90', position: `0.17 ${0.8 + j * 0.45} ${-1 + i * 0.4}`, material: METALL }, g);
    }
    el('a-torus', { radius: 0.2, 'radius-tubular': 0.04, arc: 180, rotation: '0 90 90', position: '0.27 1.025 -0.6', material: METALL }, g);
  },

  // Zentrifugalpumpe nach Alfa Laval LKH-35: in Blender gebaut (material/molkerei-3d/zentrifugalpumpe.blend in bzwu).
  // Achse entlang x, Saugstutzen axial nach -x (zum Tank), Druckstutzen tangential nach oben.
  // Explosionsansicht: Gehäuse, Laufrad und Gleitringdichtung fahren entlang der Achse heraus, Motor und Rückwand bleiben.
  pumpe(g) {
    glbTeile(g, 'modelle/zentrifugalpumpe.glb', 'zentrifugalpumpe',
      { pumpengehaeuse: '-0.45 0 0', saugstutzen: '-0.45 0 0', druckstutzen: '-0.45 0 0', laufrad: '-0.28 0 0', gleitringdichtung: '-0.12 0 0' });
  },

  // Lagertank: in Blender gebaut (material/molkerei-3d/lagertank.blend in bzwu), hier nur das exportierte Modell
  lagertank(g) {
    glbTeile(g, 'modelle/lagertank.glb', 'lagertank');
  },

  // Schulenburg-Wanne nach Plevnik SLB 2000: in Blender gebaut (material/molkerei-3d/schulenburgwanne.blend in bzwu).
  // Molkenwanne mit Lochsieb steht oben und fährt beim Absenken 0.9 m in die Quarkwanne.
  schulenburg(g) {
    glbTeile(g, 'modelle/schulenburgwanne.glb', 'schulenburgwanne', { molkenwanne: '-0.9', lochsieb: '-0.9' });
  },

  // Käsefertiger: Kessi Ø 3 m, Rand 1.5 m, Brücke mit Antrieb, Harfe in der Milch
  kaesefertiger(g) {
    el('a-cylinder', { radius: 1.5, height: 1.5, position: '0 0.75 0', 'open-ended': true, material: METALL + '; side: double' }, g);
    el('a-circle', { radius: 1.48, rotation: '-90 0 0', position: '0 1.2 0', material: 'color: #fbfaf3; roughness: 0.9' }, g);
    for (const x of [-1.6, 1.6]) el('a-box', { width: 0.12, height: 2.2, depth: 0.3, position: `${x} 1.1 0`, material: METALL }, g);
    el('a-box', { width: 3.32, height: 0.25, depth: 0.4, position: '0 2.2 0', material: METALL }, g);
    el('a-box', { width: 0.6, height: 0.5, depth: 0.6, position: '0 2.55 0', material: 'color: #134061' }, g);
    el('a-cylinder', { radius: 0.04, height: 1.0, position: '0 1.7 0', material: METALL }, g);
    el('a-box', { width: 1.3, height: 1.0, depth: 0.04, position: '0.65 1.0 0', material: 'color: #8a99a6; opacity: 0.6; transparent: true' }, g);
  }
};
