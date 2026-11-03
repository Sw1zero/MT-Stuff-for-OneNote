// Bedienungstest für Playwright-MCP: browser_run_code_unsafe mit filename auf diese Datei.
// Vorher Server: python3 -m http.server 8765 --directory /home/philipp/bzwu
async (page) => {
  const fehler = [];
  const ok = (bed, was) => { if (!bed) fehler.push(was); };
  await page.goto('http://localhost:8765/MT-Stuff-for-OneNote/molkerei-3d/');
  await page.waitForSelector('body[data-bereit="ja"]');
  const t = id => page.getByTestId(id);

  ok((await t('raum-aktuell').textContent()).includes('Milchannahme'), 'Start nicht in der Milchannahme');

  // Raumliste springt in den Raum
  await page.locator('[data-raum="kaeserei"]').click();
  ok((await t('raum-aktuell').textContent()).includes('Käserei'), 'Raumliste: Käserei nicht erreicht');

  // Echter Mausklick auf den Käsefertiger: Mitte der Anlage auf den Bildschirm projizieren
  await page.evaluate(() => {
    const p = document.getElementById('spieler').object3D.position;
    p.set(26, 0, 13); // vor dem Käsefertiger (Mitte 26/7)
    const lc = document.getElementById('kamera').components['look-controls'];
    lc.yawObject.rotation.y = 0; lc.pitchObject.rotation.x = -0.2;
  });
  await page.waitForTimeout(300);
  const box = await page.locator('canvas.a-canvas').boundingBox();
  // Raycaster aktualisiert erst im nächsten Frame nach der Mausbewegung
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(200);
  await page.mouse.down(); await page.mouse.up();
  ok(await t('overlay').isVisible(), 'Klick auf Käsefertiger öffnet kein Overlay');
  ok((await t('overlay-titel').textContent()) === 'Käsefertiger', 'Overlay-Titel falsch');
  await page.keyboard.press('Escape');
  ok(!(await t('overlay').isVisible()), 'Esc schliesst nicht');

  // Umriss zeigt "Anlage folgt"
  await page.evaluate(() => window.kaeserei.select('molketank'));
  ok((await t('overlay-text').textContent()).includes('folgt'), 'Umriss ohne Hinweis');
  await t('overlay-schliessen').click();
  ok(!(await t('overlay').isVisible()), 'X schliesst nicht');

  // Lagertank (glTF aus Blender): echter Klick auf das Rührwerk zeigt das Teil
  await page.waitForFunction(() => document.querySelector('[data-anlage="lagertank-1"] [data-teil="ruehrwerk"]'), null, { timeout: 15000 });
  await page.evaluate(() => {
    document.getElementById('spieler').object3D.position.set(12.4, 0, 30);
    const lc = document.getElementById('kamera').components['look-controls'];
    lc.yawObject.rotation.y = 0; lc.pitchObject.rotation.x = 0;
  });
  await page.waitForTimeout(300);
  const rw = await page.evaluate(() => {
    const kam = document.querySelector('a-scene').camera, p = new THREE.Vector3();
    document.querySelector('[data-anlage="lagertank-1"] [data-teil="ruehrwerk"]').object3D.getObjectByName('motor').getWorldPosition(p);
    p.project(kam);
    return [(p.x + 1) / 2, (1 - p.y) / 2];
  });
  await page.mouse.move(box.x + rw[0] * box.width, box.y + rw[1] * box.height);
  await page.waitForTimeout(200);
  // Hervorheben bleibt beim Teil: Mantel von Tank 2 teilte sich im glTF das Material
  ok(await page.evaluate(() => document.querySelector('[data-anlage="lagertank-2"]').object3D.getObjectByName('mantel').material.emissive.getHex() === 0), 'Hervorheben färbt den anderen Tank mit');
  await page.mouse.down(); await page.mouse.up();
  ok((await t('overlay-teil').textContent()) === 'Rührwerk', `Klick auf Rührwerk zeigt: ${await t('overlay-teil').textContent()}`);
  await page.evaluate(() => window.kaeserei.schliessen());
  // Temperaturanzeige leuchtet nach dem Hervorheben weiter
  const wo = async (anlage, teil, name) => page.evaluate(([a, t, n]) => {
    const kam = document.querySelector('a-scene').camera, p = new THREE.Vector3();
    // Mitte der Hülle: bei neu gebauten Meshes liegt der Ursprung am Boden der Anlage
    new THREE.Box3().setFromObject(document.querySelector(`[data-anlage="${a}"] [data-teil="${t}"]`).object3D.getObjectByName(n)).getCenter(p);
    p.project(kam);
    return [(p.x + 1) / 2, (1 - p.y) / 2];
  }, [anlage, teil, name]);
  const th = await wo('lagertank-1', 'thermometer', 'display');
  await page.mouse.move(box.x + th[0] * box.width, box.y + th[1] * box.height);
  await page.waitForTimeout(200);
  await page.mouse.move(box.x + 5, box.y + 5);
  await page.waitForTimeout(200);
  ok(await page.evaluate(() => document.querySelector('[data-anlage="lagertank-1"]').object3D.getObjectByName('wert').material.emissive.getHex() !== 0), 'Temperaturanzeige leuchtet nach dem Hervorheben nicht mehr');
  // Mannloch und Licht von oben: Klick aufs Licht schaltet ein, Klick auf den Deckel klappt ihn auf und wieder zu
  await page.evaluate(() => {
    document.getElementById('spieler').object3D.position.set(11.3, 1.2, 26.6);
    const lc = document.getElementById('kamera').components['look-controls'];
    lc.yawObject.rotation.y = 0; lc.pitchObject.rotation.x = -0.6;
  });
  await page.waitForTimeout(300);
  const glasAn = () => page.evaluate(() => document.querySelector('[data-anlage="lagertank-1"]').object3D.getObjectByName('glas').userData.leuchten > 0);
  ok(!(await glasAn()), 'Tanklicht ist am Anfang an');
  const klick = async ([x, y]) => { await page.mouse.move(box.x + x * box.width, box.y + y * box.height); await page.waitForTimeout(200); await page.mouse.down(); await page.mouse.up(); };
  await klick(await wo('lagertank-1', 'licht', 'glas'));
  ok(await glasAn(), 'Klick aufs Licht schaltet es nicht ein');
  const deckelWinkel = () => page.evaluate(() => document.querySelector('[data-anlage="lagertank-1"]').object3D.getObjectByName('deckel').parent.quaternion.angleTo(new THREE.Quaternion()));
  await klick(await wo('lagertank-1', 'mannloch', 'knopf'));
  ok((await t('overlay-teil').textContent()) === 'Mannloch', 'Klick auf den Deckel zeigt nicht das Mannloch');
  await page.waitForTimeout(1700);
  ok(await deckelWinkel() > 1.7, 'Mannloch geht nicht auf');
  await page.evaluate(() => window.kaeserei.schliessen());
  await klick(await wo('lagertank-1', 'mannloch', 'kragen'));
  await page.waitForTimeout(1700);
  ok(await deckelWinkel() < 0.01, 'Mannloch geht nicht zu');
  await page.evaluate(() => {
    window.kaeserei.schliessen();
    document.getElementById('spieler').object3D.position.set(12.4, 0, 30); // Blick wie beim Rührwerk, für die Pumpe
    const lc = document.getElementById('kamera').components['look-controls'];
    lc.yawObject.rotation.y = 0; lc.pitchObject.rotation.x = 0;
  });
  await page.waitForTimeout(300);
  // Pumpe nach dem Tank (glTF aus Blender): Klick auf die Motorverkleidung, Leitungen Auslauf > Pumpe und CIP vom Bahnhof
  await page.waitForFunction(() => document.querySelector('[data-anlage="milchpumpe"] [data-teil="elektromotor"]'), null, { timeout: 15000 });
  const pu = await page.evaluate(() => {
    const kam = document.querySelector('a-scene').camera, p = new THREE.Vector3();
    // Mitte der Hülle, der Ursprung der Meshes liegt am Boden der Anlage
    new THREE.Box3().setFromObject(document.querySelector('[data-anlage="milchpumpe"] [data-teil="elektromotor"]').object3D.getObjectByName('verkleidung')).getCenter(p);
    p.project(kam);
    return [(p.x + 1) / 2, (1 - p.y) / 2];
  });
  await page.mouse.move(box.x + pu[0] * box.width, box.y + pu[1] * box.height);
  await page.waitForTimeout(200);
  await page.mouse.down(); await page.mouse.up();
  ok((await t('overlay-titel').textContent()) === 'Zentrifugalpumpe' && (await t('overlay-teil').textContent()) === 'Elektromotor', 'Klick auf Pumpenmotor zeigt nicht den Elektromotor');
  // Explosionsansicht: Gehäuse fährt entlang der Achse heraus, Motor bleibt, Zusammenbauen bringt es zurück
  await t('overlay-aktion').click();
  await page.waitForTimeout(1700);
  const pumpeX = id => page.evaluate(i => document.querySelector(`[data-anlage="milchpumpe"] [data-teil="${i}"]`).object3D.position.x, id);
  ok(await pumpeX('pumpengehaeuse') < -0.44 && await pumpeX('laufrad') < -0.27 && await pumpeX('elektromotor') === 0, 'Explosionsansicht der Pumpe fährt nicht auseinander');
  ok((await t('overlay-aktion').textContent()) === 'Zusammenbauen', 'Knopf heisst nach der Explosion nicht Zusammenbauen');
  const pumpenLeitungen = () => page.evaluate(() => ['lagertank-1>milchpumpe:milch', 'milchpumpe>rohrbahnhof:milch']
    .map(l => document.querySelector(`[data-leitung="${l}"]`).object3D.visible));
  ok((await pumpenLeitungen()).every(v => !v), 'Leitungen der Pumpe bleiben in der Explosionsansicht sichtbar');
  ok(await page.evaluate(() => document.querySelector('[data-leitung="rohrbahnhof>lagertank-1:cip"]').object3D.visible), 'Explosion blendet fremde Leitungen aus');
  await t('overlay-aktion').click();
  await page.waitForTimeout(1700);
  ok(await pumpeX('pumpengehaeuse') === 0, 'Pumpe baut sich nicht wieder zusammen');
  ok((await pumpenLeitungen()).every(v => v), 'Leitungen der Pumpe kommen nach dem Zusammenbauen nicht zurück');
  await page.evaluate(() => window.kaeserei.schliessen());
  for (const l of ['lagertank-1>milchpumpe:milch', 'milchpumpe>rohrbahnhof:milch', 'rohrbahnhof>lagertank-1:cip', 'lagertank-1>kaelteanlage:kuehlwasser']) {
    ok(await page.locator(`[data-leitung="${l}"]`).count() === 1, `Leitung fehlt: ${l}`);
  }
  // Leitungen biegen in Bögen ab, Stücke schliessen lückenlos aneinander an
  const rohrFehler = await page.evaluate(() => {
    const f = [];
    for (const g of document.querySelectorAll('[data-leitung]')) {
      const kurven = g.getObject3D('mesh').children.filter(m => m.name !== 'huelse').map(m => m.geometry.parameters.path);
      if (kurven.length > 1 && !kurven.some(k => k.isQuadraticBezierCurve3)) f.push(`${g.dataset.leitung}: keine Bögen`);
      for (let i = 1; i < kurven.length; i++) if (kurven[i - 1].getPoint(1).distanceTo(kurven[i].getPoint(0)) > 1e-6) f.push(`${g.dataset.leitung}: Lücke`);
    }
    return f;
  });
  ok(rohrFehler.length === 0, `Leitungen: ${rohrFehler.slice(0, 3).join('; ')}`);
  // Kühlwasser zum Tank geht durch den Boden: dort sitzt eine Hülse
  ok(await page.evaluate(() => !!document.querySelector('[data-leitung="kaelteanlage>lagertank-1:kuehlwasser"]').getObject3D('mesh').getObjectByName('huelse')), 'Bodenhülse fehlt an der Kühlwasserleitung');

  // Separator: echter Klick auf die Haube zeigt das Teil, Knopf öffnet die Haube, Übersicht zeigt die Anlage
  await page.evaluate(() => {
    document.getElementById('spieler').object3D.position.set(28.2, 0, 28.0);
    const lc = document.getElementById('kamera').components['look-controls'];
    lc.yawObject.rotation.y = 0.05; lc.pitchObject.rotation.x = -0.28;
  });
  await page.waitForTimeout(400);
  await page.mouse.move(box.x + box.width / 2 + 30, box.y + box.height / 2 + 5);
  await page.waitForTimeout(300);
  await page.mouse.down(); await page.mouse.up();
  ok((await t('overlay-teil').textContent()) === 'Gestellhaube', `Klick auf Haube zeigt: ${await t('overlay-teil').textContent()}`);
  ok((await t('overlay-aktion').textContent()) === 'Haube öffnen', 'Knopf «Haube öffnen» fehlt');
  await t('overlay-aktion').click();
  await page.waitForTimeout(2000);
  ok(await page.evaluate(() => document.querySelector('[data-oeffnen="2"]').object3D.position.y > 1.95), 'Haube hebt sich nicht');
  ok((await t('overlay-aktion').textContent()) === 'Haube schliessen', 'Knopf wechselt nicht auf «schliessen»');
  await t('overlay-uebersicht').click();
  ok((await t('overlay-text').textContent()).startsWith('Der Separator trennt'), 'Übersicht zeigt nicht den Anlagentext');
  await page.evaluate(() => { window.kaeserei.oeffnen('separator'); window.kaeserei.schliessen(); });

  const haubeGeschnitten = () => page.evaluate(() => {
    let m; document.querySelector('[data-teil="gestellhaube"]').object3D.traverse(o => { if (!m && o.material) m = o.material; });
    return !!m.clippingPlanes;
  });
  // Betrieb: Knopf schneidet auf und dreht die Trommel, Öffnen der Haube beendet den Betrieb
  await page.evaluate(() => window.kaeserei.select('separator'));
  await t('overlay-betrieb').click();
  ok((await t('overlay-betrieb').textContent()) === 'Betrieb beenden', 'Knopf wechselt nicht auf «Betrieb beenden»');
  ok(!(await t('overlay-hinweis').isVisible()), 'Hinweis im Betrieb wieder da (Philipp: keine Hinweise auf vereinfachte Darstellung)');
  await page.waitForTimeout(500);
  ok(await page.evaluate(() => document.querySelector('[data-teil="tellerpaket"]').object3D.rotation.y > 0), 'Trommel dreht nicht');
  ok(await haubeGeschnitten(), 'Haube nicht aufgeschnitten');
  await t('overlay-aktion').click();
  ok((await t('overlay-betrieb').textContent()) === 'Betrieb zeigen', 'Haube öffnen beendet den Betrieb nicht');
  ok(!(await haubeGeschnitten()), 'Schnitt bleibt nach Betriebsende');
  await page.evaluate(() => { window.kaeserei.oeffnen('separator'); window.kaeserei.schliessen(); });

  // Schnittbild: Knopf öffnet, Klick auf eine Beschriftung zeigt das Teil, Esc schliesst nur das Schnittbild
  await page.evaluate(() => window.kaeserei.select('separator'));
  await t('overlay-schnitt').click();
  ok(await t('schnittbild').evaluate(d => d.open), 'Schnittbild öffnet nicht');
  await page.locator('[data-sb-teil="kolbenschieber"] text').click();
  ok((await t('schnittbild-teil').textContent()).startsWith('Kolbenschieber'), 'Klick im Schnittbild zeigt kein Teil');
  // Auf der VM ohne GPU lädt das Bild teils erst nach dem Klick fertig, darum warten statt sofort prüfen
  const bildDa = await page.waitForFunction(() => { const i = document.querySelector('[data-testid="schnittbild-bild"]'); return i.complete && i.naturalWidth > 0; }, null, { timeout: 5000 }).then(() => true, () => false);
  ok(bildDa && await t('schnittbild-bild').isVisible(), 'Bild des Teils fehlt im Schnittbild');
  ok(await page.evaluate(() => ['milch', 'rahm', 'magermilch'].every(m => document.querySelector(`[data-sb-zone="${m}"]`))), 'Farbfläche fehlt im Schnittbild');
  // Teilentleerung: Knopf gesperrt, solange sie läuft, danach ist das Schlammdepot leer
  const depot = () => page.locator('[data-sb-depot]:visible').count();
  ok(await depot() > 0, 'Schlammdepot leer vor der Teilentleerung');
  await t('schnittbild-entleeren').click();
  ok(await t('schnittbild-entleeren').isDisabled(), 'Knopf während der Teilentleerung nicht gesperrt');
  ok(await t('schnittbild-teil').textContent() === 'Teilentleerung', 'Teilentleerung ohne Text');
  await page.waitForFunction(() => !document.querySelector('[data-testid="schnittbild-entleeren"]').disabled, null, { timeout: 30000 });
  ok(await depot() <= 2, 'Schlammdepot nach der Teilentleerung nicht leer');
  // Greifer von oben: Magermilchschraube offen = Schaum, gedrosselt = Überlaufen
  await t('schnittbild-greifer').click();
  ok(await t('greifer-ansicht').isVisible(), 'Greifer-Ansicht öffnet nicht');
  const zustand = async v => { await t('greifer-drossel').fill(v); return t('greifer-status').getAttribute('data-zustand'); };
  ok(await zustand('0') === 'schaum' && await zustand('50') === 'gut' && await zustand('100') === 'ueberlaufen', 'Magermilchschraube ändert den Zustand nicht');
  await t('schnittbild-greifer').click();
  ok(!(await t('greifer-ansicht').isVisible()) && await t('schnittbild-entleeren').isVisible(), 'Zurück zum Schnitt geht nicht');
  await page.keyboard.press('Escape');
  ok(!(await t('schnittbild').evaluate(d => d.open)), 'Esc schliesst das Schnittbild nicht');
  ok(await t('overlay').isVisible(), 'Esc im Schnittbild schliesst auch das Overlay');
  await page.evaluate(() => window.kaeserei.schliessen());

  // Gehen: 1 s W mit Blick nach Norden = gut 1.4 m
  const pos = () => page.evaluate(() => { const p = document.getElementById('spieler').object3D.position; return [p.x, p.z]; });
  await page.evaluate(() => { document.getElementById('spieler').object3D.position.set(30, 0, 30); document.getElementById('kamera').components['look-controls'].yawObject.rotation.y = 0; });
  let [, z0] = await pos();
  await page.keyboard.down('KeyW'); await page.waitForTimeout(1000); await page.keyboard.up('KeyW');
  let [, z1] = await pos();
  // Untergrenze tief: Auf der VM rendert der Browser ohne GPU (unter 10 fps), dann bremst die 100-ms-Kappe pro Bild.
  ok(z0 - z1 > 0.4 && z0 - z1 < 1.8, `Gehen: ${(z0 - z1).toFixed(2)} m statt ~1.4 m`);

  // Wand blockiert: von x=10 nach Norden (z=20 ist Aussenwand der Annahme, Käsekeller liegt im Untergeschoss)
  await page.evaluate(() => document.getElementById('spieler').object3D.position.set(10, 0, 21.5));
  await page.keyboard.down('ShiftLeft'); await page.keyboard.down('KeyW'); await page.waitForTimeout(1000);
  await page.keyboard.up('KeyW'); await page.keyboard.up('ShiftLeft');
  [, z1] = await pos();
  ok(z1 > 20, `Durch die Wand gelaufen: z=${z1.toFixed(2)}`);

  // Podest am Lagertank: über die Treppe hoch, zur Tankseite hin hält die Podestkante
  const hoch = () => page.evaluate(() => { const p = document.getElementById('spieler').object3D.position; return [p.y, p.z]; });
  await page.evaluate(() => { document.getElementById('spieler').object3D.position.set(8.2, 0, 23.5); document.getElementById('kamera').components['look-controls'].yawObject.rotation.y = -Math.PI / 2; });
  await page.keyboard.down('ShiftLeft'); await page.keyboard.down('KeyW'); await page.waitForTimeout(4000);
  await page.keyboard.up('KeyW'); await page.keyboard.up('ShiftLeft');
  const [y1] = await hoch();
  ok(y1 >= 0.6, `Treppe zum Podest: Höhe ${y1.toFixed(2)} m`);
  await page.evaluate(() => { document.getElementById('kamera').components['look-controls'].yawObject.rotation.y = Math.PI; });
  await page.keyboard.down('KeyW'); await page.waitForTimeout(1500); await page.keyboard.up('KeyW');
  const [y2, z2] = await hoch();
  ok(y2 === y1 && z2 < 23.95, `Vom Podest zum Tank gefallen: y=${y2.toFixed(2)}, z=${z2.toFixed(2)}`);

  // Schulenburg-Wanne (glTF aus Blender, Frischkäserei, Mitte 55.5/14): Klick auf die Quarkwanne, Molkenwanne absenken und anheben
  await page.locator('[data-raum="frischkaeserei"]').click();
  await page.evaluate(() => {
    document.getElementById('spieler').object3D.position.set(55.5, 0, 19.3);
    const lc = document.getElementById('kamera').components['look-controls'];
    lc.yawObject.rotation.y = 0; lc.pitchObject.rotation.x = -0.1;
  });
  await page.waitForFunction(() => document.querySelector('[data-anlage="schulenburgwanne"] [data-teil="quarkwanne"]'), null, { timeout: 15000 });
  await page.waitForTimeout(300);
  const sw = await page.evaluate(() => {
    const kam = document.querySelector('a-scene').camera, p = new THREE.Vector3();
    new THREE.Box3().setFromObject(document.querySelector('[data-anlage="schulenburgwanne"] [data-teil="quarkwanne"]').object3D.getObjectByName('quarkwannenmantel')).getCenter(p);
    p.project(kam);
    return [(p.x + 1) / 2, (1 - p.y) / 2];
  });
  await page.mouse.move(box.x + sw[0] * box.width, box.y + sw[1] * box.height);
  await page.waitForTimeout(200);
  await page.mouse.down(); await page.mouse.up();
  ok((await t('overlay-titel').textContent()) === 'Schulenburg-Wanne' && (await t('overlay-teil').textContent()) === 'Quarkwanne', `Klick auf Quarkwanne zeigt: ${await t('overlay-teil').textContent()}`);
  ok((await t('overlay-aktion').textContent()) === 'Molkenwanne absenken', 'Knopf «Molkenwanne absenken» fehlt');
  const swY = id => page.evaluate(i => document.querySelector(`[data-anlage="schulenburgwanne"] [data-teil="${i}"]`).object3D.position.y, id);
  await t('overlay-aktion').click();
  await page.waitForTimeout(1700);
  ok(await swY('molkenwanne') < -0.89 && await swY('lochsieb') < -0.89 && await swY('quarkwanne') === 0, 'Molkenwanne senkt sich nicht ab');
  ok((await t('overlay-aktion').textContent()) === 'Molkenwanne anheben', 'Knopf wechselt nicht auf «Molkenwanne anheben»');
  await t('overlay-aktion').click();
  await page.waitForTimeout(1700);
  ok(await swY('molkenwanne') === 0, 'Molkenwanne hebt sich nicht wieder');
  // Schnittbild Schulenburgverfahren: fünf Schritte, Teil anklicken, Esc schliesst nur den Dialog
  await t('overlay-schnitt').click();
  ok(await t('schnittbild-sw').evaluate(d => d.open), 'Schnittbild Schulenburg öffnet nicht');
  for (let i = 0; i < 3; i++) await t('sw-weiter').click();
  ok((await t('sw-titel').textContent()) === 'Abpressen' && (await t('sw-nr').textContent()) === 'Schritt 4 von 5', 'Schritt 4 «Abpressen» fehlt');
  await page.locator('[data-testid="schnittbild-sw"] [data-sb-teil="molkenpumpe"] text').click();
  ok((await t('sw-titel').textContent()) === 'Molkenpumpe', 'Klick im Schnittbild zeigt die Molkenpumpe nicht');
  await page.keyboard.press('Escape');
  ok(!(await t('schnittbild-sw').evaluate(d => d.open)) && await t('overlay').isVisible(), 'Esc schliesst Schnittbild nicht oder auch das Overlay');
  await page.evaluate(() => window.kaeserei.schliessen());

  // Mehrzweckerhitzer (glTF aus Blender, Sauermilch, Mitte 76/14): Klick in den Kessel auf den Propeller, Rührer wechseln, Betrieb, Schnittbild
  await page.locator('[data-raum="sauermilch"]').click();
  await page.evaluate(() => {
    document.getElementById('spieler').object3D.position.set(76, 0, 14.6); // näher, sonst verdeckt der Kesselrand den Propeller
    const lc = document.getElementById('kamera').components['look-controls'];
    lc.yawObject.rotation.y = 0; lc.pitchObject.rotation.x = -1.2;
  });
  await page.waitForFunction(() => document.querySelector('[data-anlage="mehrzweckerhitzer"] [data-teil="propellerruehrer"]'), null, { timeout: 15000 });
  await page.waitForTimeout(300);
  const mz = await page.evaluate(() => {
    const kam = document.querySelector('a-scene').camera, p = new THREE.Vector3();
    new THREE.Box3().setFromObject(document.querySelector('[data-anlage="mehrzweckerhitzer"] [data-teil="propellerruehrer"]').object3D.getObjectByName('propellernabe')).getCenter(p);
    p.project(kam);
    return [(p.x + 1) / 2, (1 - p.y) / 2];
  });
  await page.mouse.move(box.x + mz[0] * box.width, box.y + mz[1] * box.height);
  await page.waitForTimeout(200);
  await page.mouse.down(); await page.mouse.up();
  ok((await t('overlay-titel').textContent()) === 'Mehrzweckerhitzer' && (await t('overlay-teil').textContent()) === 'Propellerrührer', `Klick in den Kessel zeigt: ${await t('overlay-teil').textContent()}`);
  const mzTeil = id => page.evaluate(i => { const e = document.querySelector(`[data-anlage="mehrzweckerhitzer"] [data-teil="${i}"]`); return { sichtbar: e.object3D.visible, klickbar: e.classList.contains('klickbar'), dreh: e.object3D.rotation.y }; }, id);
  ok((await mzTeil('scheibenruehrer')).sichtbar === false, 'Scheibenrührer zu Beginn sichtbar');
  await t('overlay-wechsel').click();
  ok((await t('overlay-teil').textContent()) === 'Scheibenrührer', 'Rührer wechseln zeigt nicht den Scheibenrührer');
  const prop = await mzTeil('propellerruehrer');
  ok(!prop.sichtbar && !prop.klickbar && (await mzTeil('scheibenruehrer')).sichtbar, 'Propeller nach dem Wechsel noch da oder Scheibe fehlt');
  await t('overlay-wechsel').click();
  ok((await t('overlay-teil').textContent()) === 'Ankerrührer' && !(await mzTeil('stroemungsbrecher')).sichtbar, 'Ankerrührer fehlt oder Strömungsbrecher noch drin');
  await t('overlay-betrieb').click();
  await page.waitForTimeout(600);
  ok((await mzTeil('ankerruehrer')).dreh !== 0, 'Ankerrührer dreht im Betrieb nicht');
  await t('overlay-betrieb').click();
  ok((await mzTeil('ankerruehrer')).dreh === 0, 'Ankerrührer bleibt nach dem Ausschalten verdreht');
  // Schnittbild übernimmt den Anker (ohne Strömungsbrecher), Propeller ohne Brecher zeigt die Trombe
  await t('overlay-schnitt').click();
  ok(await t('schnittbild-rw').evaluate(d => d.open), 'Schnittbild Rührwerk öffnet nicht');
  let st = await page.evaluate(() => window.ruehrwerkSchnitt.stand());
  ok(st.ruehrer === 'ankerruehrer' && !st.brecher && await t('rw-brecher').isDisabled(), 'Schnittbild übernimmt den Ankerrührer nicht');
  await page.locator('[data-testid="schnittbild-rw"] [data-rw="propellerruehrer"]').click();
  ok((await t('rw-titel').textContent()) === 'Propellerrührer: axiale Strömung', `Titel Propeller: ${await t('rw-titel').textContent()}`);
  st = await page.evaluate(() => window.ruehrwerkSchnitt.stand());
  ok(st.trombe, 'Propeller ohne Strömungsbrecher zeigt keine Trombe');
  await t('rw-brecher').check();
  st = await page.evaluate(() => window.ruehrwerkSchnitt.stand());
  ok(st.brecher && !st.trombe && (await t('rw-brechertext').textContent()).startsWith('Strömungsbrecher'), 'Mit Strömungsbrecher bleibt die Trombe');
  const lage = () => page.evaluate(() => document.querySelector('.rw-teilchen path').dataset.y);
  const l1 = await lage(); await page.waitForTimeout(400);
  ok(l1 !== await lage(), 'Teilchen im Schnittbild bewegen sich nicht');
  await page.keyboard.press('Escape');
  ok(!(await t('schnittbild-rw').evaluate(d => d.open)), 'Esc schliesst Schnittbild Rührwerk nicht');
  await page.evaluate(() => window.kaeserei.schliessen());

  // Abtropfgestell (glTF aus Blender, Kühlraum, Mitte 92/35.5): Klick auf einen Quarksack, Abtropfen und zurück
  await page.locator('[data-raum="abfuellung"]').click();
  await page.evaluate(() => {
    document.getElementById('spieler').object3D.position.set(92, 0, 38.3);
    const lc = document.getElementById('kamera').components['look-controls'];
    lc.yawObject.rotation.y = 0; lc.pitchObject.rotation.x = -0.05;
  });
  await page.waitForFunction(() => document.querySelector('[data-anlage="abtropfgestell"] [data-teil="quarksack"]'), null, { timeout: 15000 });
  await page.waitForTimeout(300);
  const sa = await page.evaluate(() => {
    const kam = document.querySelector('a-scene').camera, p = new THREE.Vector3();
    new THREE.Box3().setFromObject(document.querySelector('[data-anlage="abtropfgestell"]').object3D.getObjectByName('sack_2')).getCenter(p);
    p.project(kam);
    return [(p.x + 1) / 2, (1 - p.y) / 2];
  });
  await page.mouse.move(box.x + sa[0] * box.width, box.y + sa[1] * box.height);
  await page.waitForTimeout(200);
  await page.mouse.down(); await page.mouse.up();
  ok((await t('overlay-titel').textContent()) === 'Abtropfgestell (Sackverfahren)' && (await t('overlay-teil').textContent()) === 'Quarksack', `Klick auf Quarksack zeigt: ${await t('overlay-teil').textContent()}`);
  const saStand = () => page.evaluate(() => { const o = document.querySelector('[data-anlage="abtropfgestell"]').object3D; return [o.getObjectByName('sack_2').scale.x, o.getObjectByName('molkenspiegel').position.y]; });
  const [sx0, my0] = await saStand();
  await t('overlay-betrieb').click();
  await page.waitForTimeout(1500);
  const [sx1, my1] = await saStand();
  ok(sx1 < sx0 && my1 > my0, `Säcke tropfen nicht ab: Breite ${sx1}, Molke ${my1}`);
  ok((await t('overlay-betrieb').textContent()) === 'Säcke neu füllen', 'Knopf wechselt nicht auf «Säcke neu füllen»');
  await t('overlay-betrieb').click();
  const [sx2, my2] = await saStand();
  ok(sx2 === 1 && my2 === my0, 'Säcke neu füllen stellt nicht zurück');
  await page.evaluate(() => window.kaeserei.schliessen());

  // Ultrafiltration (glTF aus Blender): echter Klick auf den Vorlauftank, Betrieb, Schnittbild
  await page.locator('[data-raum="membran"]').click();
  await page.evaluate(() => {
    document.getElementById('spieler').object3D.position.set(70.5, 0, 53.4); // vor der UF (Mitte 70/50)
    const lc = document.getElementById('kamera').components['look-controls'];
    lc.yawObject.rotation.y = 0; lc.pitchObject.rotation.x = -0.15;
  });
  await page.waitForFunction(() => document.querySelector('[data-anlage="ultrafiltration"] [data-teil="vorlauftank"]'), null, { timeout: 15000 });
  await page.waitForTimeout(300);
  const uf = await page.evaluate(() => {
    const kam = document.querySelector('a-scene').camera, p = new THREE.Vector3();
    new THREE.Box3().setFromObject(document.querySelector('[data-anlage="ultrafiltration"]').object3D.getObjectByName('tankmantel')).getCenter(p);
    p.project(kam);
    return [(p.x + 1) / 2, (1 - p.y) / 2];
  });
  await page.mouse.move(box.x + uf[0] * box.width, box.y + uf[1] * box.height);
  await page.waitForTimeout(200);
  await page.mouse.down(); await page.mouse.up();
  ok((await t('overlay-titel').textContent()) === 'Ultrafiltration' && (await t('overlay-teil').textContent()) === 'Vorlauftank', `Klick auf Vorlauftank zeigt: ${await t('overlay-teil').textContent()}`);
  const ufStand = () => page.evaluate(() => { const o = document.querySelector('[data-anlage="ultrafiltration"]').object3D; return [o.getObjectByName('fuellsaeule').scale.y, o.getObjectByName('manometerzeiger').rotation.z, o.getObjectByName('permeatfaden').visible]; });
  await t('overlay-betrieb').click();
  await page.waitForTimeout(1500);
  const [fs1, zg1, pf1] = await ufStand();
  ok(fs1 < 1 && zg1 < 0 && pf1, `UF-Betrieb: Füllstand ${fs1}, Zeiger ${zg1}, Permeat ${pf1}`);
  ok((await t('overlay-betrieb').textContent()) === 'Filtration beenden', 'Knopf wechselt nicht auf «Filtration beenden»');
  await t('overlay-betrieb').click();
  const [fs2, zg2, pf2] = await ufStand();
  ok(fs2 === 1 && zg2 === 0 && !pf2, 'Filtration beenden stellt nicht zurück');
  await t('overlay-schnitt').click();
  ok(await t('schnittbild-mb').isVisible(), 'UF-Schnittbild öffnet nicht');
  ok((await t('mb-titel').textContent()).startsWith('Ultrafiltration'), 'UF-Schnittbild: falscher Titel');
  const mb = await page.evaluate(() => window.membranSchnitt.stand());
  ok(mb.imPermeat.join() === 'laktose,salze,wasser', `UF-Schnittbild: im Permeat ${mb.imPermeat.join()}`);
  await t('schnittbild-mb-schliessen').click();
  await page.evaluate(() => window.kaeserei.schliessen());

  // Durch den Durchgang Milchbehandlung -> Käserei (Tür bei x=30, z=20)
  await page.evaluate(() => document.getElementById('spieler').object3D.position.set(30, 0, 22));
  // rennen, damit es auch bei wenigen fps auf der VM reicht
  await page.keyboard.down('ShiftLeft'); await page.keyboard.down('KeyW'); await page.waitForTimeout(2500);
  await page.keyboard.up('KeyW'); await page.keyboard.up('ShiftLeft');
  ok((await t('raum-aktuell').textContent()).includes('Käserei'), 'Durchgang nicht passierbar');

  // Untergeschoss über die Raumliste, dort blockieren die Wände des Untergeschosses
  await page.locator('[data-raum="technik"]').click();
  ok((await t('raum-aktuell').textContent()).includes('Technik'), 'Raumliste: Technik nicht erreicht');
  ok(await page.evaluate(() => document.getElementById('spieler').object3D.position.y) === -5, 'Technik nicht im Untergeschoss');
  await page.evaluate(() => { document.getElementById('spieler').object3D.position.x = 41; document.getElementById('kamera').components['look-controls'].yawObject.rotation.y = Math.PI / 2; });
  await page.keyboard.down('KeyW'); await page.waitForTimeout(1000); await page.keyboard.up('KeyW');
  ok(await page.evaluate(() => document.getElementById('spieler').object3D.position.x) > 40, 'Untergeschoss: durch die Wand gelaufen');

  return fehler.length ? 'FEHLER:\n' + fehler.join('\n') : 'Alle Prüfungen bestanden';
}
