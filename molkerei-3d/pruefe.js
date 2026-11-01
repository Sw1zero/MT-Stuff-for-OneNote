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
  ok(await t('overlay-hinweis').isVisible(), 'Hinweis «vereinfachte Darstellung» fehlt');
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
  ok(await t('schnittbild-bild').isVisible() && await t('schnittbild-bild').evaluate(i => i.complete && i.naturalWidth > 0), 'Bild des Teils fehlt im Schnittbild');
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
