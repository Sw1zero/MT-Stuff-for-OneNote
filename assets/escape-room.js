/* Escape-Room-Engine für MT (Quelle: bzwu/.claude/skills/lerntool/basis/escape-room.js, verteilt mit sync_basis.py).

   Ein Raum ist nur Daten:
     EscapeRoom.init({
       id: 'b6-pastmilch',                       // Schlüssel für den Zwischenstand im Browser
       titel, intro: 'html',                    // Startbild (Story)
       warten: [15, 30, 45], sperre: 30, fehlerBisSperre: 3,   // optional: Hinweis 1, Hinweis 2, Lösung (s), Sperre (s)
       raum: function (z) { return { orte, dokumente, schloesser }; },  // ein Aufruf pro Durchlauf: alle Zahlen passen zusammen
       schluss: { uhr: '07:00', szene: 'html', ziele: ['…'], html?: 'Schemas zum Mitnehmen' }
     });
   z ist ein Zufall mit festem Seed pro Durchlauf: z.r(), z.int(a, b), z.pick(l), z.mische(l), z.codes(n) (10..99), z.ziffern(n) (1..9)
   orte:       [{ id, name, uhr?, plan: { x, y, b, h } (Grundriss 0..100 × 0..64), szene: 'html', bild?: { src, alt, quelle? }, oeffnetMit?: [schlossIds],
                 ansicht?: { src, alt, hotspots: [{ titel, x, y, b, h (Prozent), dok: dokumentId | schloss: schlossId }] } }]   // Szene mit anklickbaren Objekten, ersetzt bild und die Dokumentliste
   dokumente:  [{ id, ort, titel, html }]   // im Raum aufklappen, danach in der Mappe von überall abrufbar
   schloesser: [{ id, ort, titel, aufgabe: 'html', ziel, quelle, notiz, loesung: 'html', hinweise: ['Stufe 1', 'Stufe 2'],
                  felder: [{ label, einheit?, art?: 'zahl' | 'zeit' | 'code', wert, tol?, irrtum?: [{ wert, tol?, text }], fremd?: { ziffer: text } }],
                  wahl?: { label, richtig: 'Text', falsch: [{ text, warum }] },              // Karten mit Zufallscode 10..99
                  reihe?: { label, folge: ['Text', …], falsch?: [{ text, warum }], irrtum?: [{ folge: [...], text }] },  // Karten mit Ziffer, Code = Ziffern in Reihenfolge
                  ausgang?: true, kurz?: false }]    // kurz: false = fehlt in der Kurzfassung (?kurz=1), seine Türen sind dann offen
   Feldarten: zahl (tol fehlt = exakt), zeit (Minuten ab 00:00, Eingabe «05:16», «5.16», «0516»), code (Ziffernfolge, exakt).
   Testschnittstelle: EscapeRoom.aufbauen(cfg, seed, kurz), EscapeRoom.pruefe(feld, eingabe), window.LerntoolTest. */
var EscapeRoom = (function () {
  var OK = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  var NOK = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  var cfg, welt, st, aktOrt, uhrTimer, sperrTimer = [];

  /* ---------- reine Logik (auch für den Node-Selbsttest) ---------- */
  function zufall(seed) {
    var a = seed >>> 0;
    function r() {  // mulberry32
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    function int(x, y) { return x + Math.floor(r() * (y - x + 1)); }
    function mische(l) { l = l.slice(); for (var i = l.length - 1; i > 0; i--) { var j = int(0, i), t = l[i]; l[i] = l[j]; l[j] = t; } return l; }
    function verschieden(n, x, y) { var c = []; while (c.length < n) { var k = int(x, y); if (c.indexOf(k) < 0) c.push(k); } return c; }
    return { r: r, int: int, pick: function (l) { return l[int(0, l.length - 1)]; }, mische: mische,
      codes: function (n) { return verschieden(n, 10, 99); }, ziffern: function (n) { return verschieden(n, 1, 9); } };
  }
  function lesen(s) {
    s = String(s).trim().replace(/['\s]/g, '').replace(',', '.');
    return s === '' || isNaN(s) ? NaN : parseFloat(s);
  }
  function zeitLesen(s) {
    var m = String(s).trim().match(/^(\d{1,2})\s*[:.,h ]?\s*(\d{2})(\s*uhr)?$/i);
    if (!m || +m[1] > 23 || +m[2] > 59) return NaN;
    return +m[1] * 60 + +m[2];
  }
  function zeit(min) { var h = Math.floor(min / 60), m = min % 60; return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; }
  function zahl(n) { var s = String(parseFloat((+n).toFixed(2))).split('.'); s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, "'"); return s.join('.'); }
  function anzeige(f) { return f.art === 'zeit' ? zeit(f.wert) : f.art === 'code' ? f.wert : zahl(f.wert); }

  function pruefe(f, eingabe) {
    if (f.art === 'code') {
      var c = String(eingabe).replace(/\D/g, '');
      if (!c) return { leer: true, ok: false };
      if (c === f.wert) return { ok: true };
      var genau = (f.irrtum || []).filter(function (i) { return i.wert === c; })[0];
      if (genau) return { ok: false, irrtum: genau.text };
      var fremd = c.split('').filter(function (d) { return f.fremd && f.fremd[d]; })[0];
      if (fremd) return { ok: false, irrtum: f.fremd[fremd] };
      return { ok: false, irrtum: c.length !== f.wert.length && !f.reihe ? 'Der Code hat ' + f.wert.length + ' Ziffern, Sie haben ' + c.length + ' eingegeben.' : '' };
    }
    var v = f.art === 'zeit' ? zeitLesen(eingabe) : lesen(eingabe);
    if (isNaN(v)) return { leer: true, ok: false };
    var tol = (f.tol || 0) + 1e-9;
    if (Math.abs(v - f.wert) <= tol) return { ok: true };
    var irr = (f.irrtum || []).filter(function (i) { return Math.abs(v - i.wert) <= (i.tol === undefined ? tol : i.tol + 1e-9); })[0];
    return { ok: false, irrtum: irr ? irr.text : '' };
  }

  // Ganzer Raum für einen Seed: Generator einmal aufrufen, dann Karten mit Codes versehen, dann Kurzfassung anwenden
  function aufbauen(c, seed, kurz) {
    var z = zufall(seed * 31 + 1), w = c.raum(z);
    w.schloesser.forEach(function (s) {
      var feld;
      if (s.wahl) {
        var codes = z.codes(s.wahl.falsch.length + 1);
        var karten = z.mische([{ text: s.wahl.richtig, richtig: true }].concat(s.wahl.falsch));
        feld = { label: s.wahl.label || 'Code der Karte', wert: 0, irrtum: [] };
        s.karten = karten.map(function (k, j) {
          if (k.richtig) feld.wert = codes[j]; else feld.irrtum.push({ wert: codes[j], text: k.warum });
          return { code: codes[j], text: k.text };
        });
      }
      if (s.reihe) {
        var r = s.reihe, alle = r.folge.map(function (t) { return { text: t }; }).concat(r.falsch || []);
        alle = alle.map(function (k) { return typeof k.text === 'object' ? k.text : k; });  // folge darf { text, code } enthalten (Code aus dem Raum)
        var ziffern = z.ziffern(alle.length), nr = {};
        alle.forEach(function (k, j) { nr[k.text] = k.code !== undefined ? k.code : ziffern[j]; });
        r.folge = r.folge.map(function (t) { return typeof t === 'object' ? t.text : t; });
        (r.irrtum || []).forEach(function (i) { i.folge = i.folge.map(function (t) { return typeof t === 'object' ? t.text : t; }); });
        var code = function (folge) { return folge.map(function (t) { return nr[t]; }).join(''); };
        feld = { label: r.label || 'Code', art: 'code', reihe: true, wert: code(r.folge), fremd: {},
          irrtum: (r.irrtum || []).map(function (i) { return { wert: code(i.folge), text: i.text }; }) };
        (r.falsch || []).forEach(function (k) { feld.fremd[nr[k.text]] = k.warum; });
        s.karten = z.mische(alle).map(function (k) { return { code: nr[k.text], text: k.text }; });
      }
      if (feld) s.felder = [feld].concat(s.felder || []);
    });
    if (kurz) {
      var weg = w.schloesser.filter(function (s) { return s.kurz === false; }).map(function (s) { return s.id; });
      w.schloesser = w.schloesser.filter(function (s) { return weg.indexOf(s.id) < 0; });
      w.orte.forEach(function (o) { o.oeffnetMit = (o.oeffnetMit || []).filter(function (id) { return weg.indexOf(id) < 0; }); });
    }
    return w;
  }

  /* ---------- Zwischenstand ---------- */
  function schluessel() { return 'escape-' + cfg.id + (st && st.kurz ? '-kurz' : ''); }
  function laden(kurz) { try { return JSON.parse(localStorage.getItem('escape-' + cfg.id + (kurz ? '-kurz' : ''))); } catch (e) { return null; } }
  function speichern() { st.zuletzt = Date.now(); try { localStorage.setItem(schluessel(), JSON.stringify(st)); } catch (e) {} }
  function neuerStand(kurz) {
    return { v: 2, seed: Math.floor(Math.random() * 1e9), kurz: kurz, start: Date.now(), warte: 0, hinweise: 0, ende: 0,
      geloest: {}, log: [], offen: {}, fehl: {}, sperreBis: {}, tippBis: {}, gelesen: {}, ort: null };
  }

  /* ---------- Zustand der Räume ---------- */
  function el(id) { return document.getElementById(id); }
  function ort(id) { return welt.orte.filter(function (o) { return o.id === id; })[0]; }
  function istOffen(o) { return (o.oeffnetMit || []).every(function (id) { return st.geloest[id]; }); }
  function schloesserIn(o) { return welt.schloesser.filter(function (s) { return s.ort === o.id; }); }
  function erledigt(o) { var l = schloesserIn(o); return l.length > 0 && l.every(function (s) { return st.geloest[s.id]; }); }
  function anzahlGeloest() { return welt.schloesser.filter(function (s) { return st.geloest[s.id]; }).length; }

  /* ---------- Raumplan und Mappe ---------- */
  function plan() {
    var r = welt.orte.map(function (o) {
      var p = o.plan, offen = istOffen(o), klasse = !offen ? 'zu' : erledigt(o) ? 'fertig' : 'offen';
      if (o.id === aktOrt) klasse += ' hier';
      return '<g class="er-raum ' + klasse + '" data-ort="' + o.id + '"><rect x="' + p.x + '" y="' + p.y + '" width="' + p.b + '" height="' + p.h + '" rx="1.5"/>' +
        '<text x="' + (p.x + p.b / 2) + '" y="' + (p.y + p.h / 2) + '" text-anchor="middle">' + o.name + '</text>' +
        '<text x="' + (p.x + p.b / 2) + '" y="' + (p.y + p.h / 2 + 4.5) + '" text-anchor="middle" class="er-zustand">' + (!offen ? 'gesperrt' : erledigt(o) ? '✓ erledigt' : o.id === aktOrt ? 'Sie sind hier' : 'offen') + '</text></g>';
    }).join('');
    var knoepfe = welt.orte.map(function (o) {
      var offen = istOffen(o);
      return '<button type="button" class="lk-chip' + (o.id === aktOrt ? ' active' : '') + '" data-ort="' + o.id + '"' + (offen ? '' : ' disabled') +
        (o.id === aktOrt ? ' aria-current="location"' : '') + '>' + o.name + '<span> ' + (!offen ? 'gesperrt' : erledigt(o) ? '✓' : '') + '</span></button>';
    }).join('');
    return '<div class="er-plan"><svg viewBox="0 0 100 64" aria-hidden="true">' + r + '</svg></div>' +
      '<nav class="lk-filter er-nav" aria-label="Räume">' + knoepfe + '</nav>' +
      '<p class="er-stand">' + anzahlGeloest() + ' von ' + welt.schloesser.length + ' Schlössern offen</p>';
  }
  function mappe() {
    var docs = welt.dokumente.filter(function (d) { return st.gelesen[d.id]; });
    var prot = st.log.map(function (l) { return '<li>' + l.notiz + (l.art === 'loesung' ? ' <em>(Lösung angezeigt)</em>' : l.h ? ' <em>(mit Hinweis)</em>' : '') + '</li>'; }).join('');
    return '<details class="er-protokoll" id="erMappe"><summary>Mappe: ' + docs.length + ' Dokumente, ' + st.log.length + ' Einträge im Freigabeprotokoll</summary><div class="er-mappe">' +
      '<h3>Freigabeprotokoll</h3>' + (prot ? '<ol>' + prot + '</ol>' : '<p>Noch leer. Jedes offene Schloss trägt hier seinen Fachwert ein.</p>') +
      '<h3>Dokumente</h3>' + (docs.length ? docs.map(function (d) { return '<details class="er-dok"><summary>' + d.titel + ' <span>(' + ort(d.ort).name + ')</span></summary><div>' + d.html + '</div></details>'; }).join('')
        : '<p>Noch keine. Öffnen Sie Dokumente in den Räumen, dann liegen sie hier.</p>') + '</div></details>';
  }
  function kopfNeu() {
    var offenMappe = el('erMappe') && el('erMappe').open;
    el('erKopf').innerHTML = plan() + mappe();
    if (offenMappe) el('erMappe').open = true;
    [].forEach.call(el('erKopf').querySelectorAll('[data-ort]'), function (x) {
      x.addEventListener('click', function () { var o = ort(x.dataset.ort); if (istOffen(o)) gehe(o.id); });
    });
  }

  /* ---------- Start ---------- */
  function startbild() {
    var kurz = /[?&]kurz=1/.test(location.search), alt = laden(kurz);
    if (alt && alt.v !== 2) alt = null;  // Stand aus Version 1 passt nicht mehr
    el('escape').innerHTML = '<section class="er-szene"><p class="er-ort">' + cfg.titel + '</p>' + cfg.intro + '</section>' +
      '<section class="q-card er-regeln"><h2>So funktioniert es</h2><ul>' +
      '<li>Die Molkerei hat mehrere Räume. Schauen Sie sich in jedem Raum die Dokumente an: Protokolle, Listen, Schemas. Geöffnete Dokumente liegen danach in Ihrer Mappe.</li>' +
      '<li>Jedes Schloss verlangt einen Code: eine Zahl, eine Uhrzeit, Ziffern in der richtigen Reihenfolge oder einen Code aus mehreren Teilen. Oft brauchen Sie dafür Dokumente aus anderen Räumen.</li>' +
      '<li>Nicht jedes Dokument hilft. Prüfen Sie jede Angabe mit Ihrem Fachwissen.</li>' +
      '<li>Ihre Zahlen sind zufällig, die Nachbargruppe hat andere Codes. Hinweise kosten Wartezeit, keine Punkte. Nach ' + (cfg.fehlerBisSperre || 3) + ' Fehlversuchen ist ein Schloss ' + (cfg.sperre || 30) + ' s gesperrt.</li>' +
      '<li>Ihr Stand bleibt in diesem Browser gespeichert.</li></ul></section>' +
      '<div class="er-knoepfe">' +
      (alt && !alt.ende && alt.log.length ? '<button type="button" class="q-btn" id="erWeiter">Weiterspielen (' + alt.log.length + ' Schlösser offen)</button><button type="button" class="q-btn ghost" id="erNeu">Neu beginnen (neue Zahlen)</button>'
        : '<button type="button" class="q-btn" id="erNeu">Starten</button>') + '</div>';
    el('erNeu').onclick = function () { st = neuerStand(kurz); speichern(); spiel(); };
    if (el('erWeiter')) el('erWeiter').onclick = function () {
      st = alt;
      var pause = Date.now() - (st.zuletzt || Date.now());
      if (pause > 10 * 60000) st.start += pause;  // lange Pause (z. B. nächster Tag) zählt nicht zur Zeit
      spiel();
    };
  }

  function spiel() {
    welt = aufbauen(cfg, st.seed, st.kurz);
    st.tippBis = st.tippBis || {};
    el('escape').innerHTML = '<div id="erKopf"></div><div id="erOrt"></div>';
    gehe(st.ort && istOffen(ort(st.ort)) ? st.ort : welt.orte[0].id, true);
  }

  /* ---------- Raum ---------- */
  function gehe(id, ohneFokus) {
    clearInterval(uhrTimer); uhrTimer = null;  // laufende Wartezeit läuft in st.tippBis weiter und wird beim Zurückkommen fortgesetzt
    sperrTimer.forEach(clearInterval); sperrTimer = [];
    aktOrt = id; st.ort = id; speichern();
    var o = ort(id), docs = welt.dokumente.filter(function (d) { return d.ort === id; });
    kopfNeu();
    el('erOrt').innerHTML = '<div class="er-station">' +
      '<section class="er-szene"><p class="er-ort">' + (o.uhr ? o.uhr + ' Uhr · ' : '') + o.name + '</p>' + o.szene + '</section>' +
      '<h2 class="er-sr" id="erTitel" tabindex="-1">' + o.name + '</h2>' +
      (o.ansicht ? ansicht(o.ansicht) : (o.bild ? '<figure class="er-bild"><img src="' + o.bild.src + '" alt="' + o.bild.alt + '" loading="lazy">' + (o.bild.quelle ? '<figcaption>' + o.bild.quelle + '</figcaption>' : '') + '</figure>' : '') +
      (docs.length ? '<section class="er-doks"><h3>Im Raum</h3>' + docs.map(function (d) {
        return '<details class="er-dok" data-dok="' + d.id + '"><summary>' + d.titel + (st.gelesen[d.id] ? ' <span>(in der Mappe)</span>' : '') + '</summary><div>' + d.html + '</div></details>';
      }).join('') + '</section>' : '')) +
      schloesserIn(o).map(function (s) { return '<section class="q-card er-karte" id="erS-' + s.id + '"></section>'; }).join('') +
      '<div class="er-knoepfe"><button type="button" class="q-btn ghost" id="erPlan">Zum Raumplan</button></div></div>';
    [].forEach.call(el('erOrt').querySelectorAll('.er-dok'), function (d) {
      d.addEventListener('toggle', function () {
        if (d.open && !st.gelesen[d.dataset.dok]) { st.gelesen[d.dataset.dok] = 1; speichern(); kopfNeu(); }
      });
    });
    ansichtBinden();
    schloesserIn(o).forEach(schloss);
    el('erPlan').onclick = function () { window.scrollTo(0, 0); el('erKopf').querySelector('.er-nav button:not([disabled])').focus(); };
    if (!ohneFokus) el('erTitel').focus();
  }

  /* ---------- Szene mit Hotspots (Blender-Render) ---------- */
  // Hotspots in Prozent des Bildes. Kleine zuletzt nennen, sie liegen dann oben. Kein Etikett im Bild, nur Rahmen bei Hover und Häkchen nach dem Lesen.
  function ansicht(a) {
    return '<div class="er-ansicht"><img src="' + a.src + '" alt="' + a.alt + '">' + a.hotspots.filter(function (h) {
      return !h.schloss || welt.schloesser.some(function (s) { return s.id === h.schloss; });  // Schloss fehlt in der Kurzfassung: kein toter Hotspot
    }).map(function (h) {
      var gelesen = h.dok && st.gelesen[h.dok];
      return '<button type="button" class="er-hot' + (gelesen ? ' er-gelesen' : '') + '" style="left:' + h.x + '%;top:' + h.y + '%;width:' + h.b + '%;height:' + h.h + '%" aria-label="' +
        h.titel + (gelesen ? ' (gelesen)' : '') + '" title="' + h.titel + '"' + (h.dok ? ' data-dok="' + h.dok + '"' : ' data-schloss="' + h.schloss + '"') + '></button>';
    }).join('') + '</div><dialog class="er-dlg" id="erDlg"><div id="erDlgInhalt"></div><div class="er-knoepfe"><button type="button" class="q-btn" id="erDlgZu">Schliessen</button></div></dialog>';
  }
  function ansichtBinden() {
    var dlg = el('erDlg');
    if (!dlg) return;
    el('erDlgZu').onclick = function () { dlg.close(); };
    dlg.onclick = function (e) { if (e.target === dlg) dlg.close(); };
    [].forEach.call(el('erOrt').querySelectorAll('.er-hot'), function (b) {
      b.onclick = function () {
        if (b.dataset.schloss) { var k = el('erS-' + b.dataset.schloss); if (k) k.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
        var d = welt.dokumente.filter(function (x) { return x.id === b.dataset.dok; })[0];
        el('erDlgInhalt').innerHTML = '<h3>' + d.titel + '</h3>' + d.html;
        if (!st.gelesen[d.id]) { st.gelesen[d.id] = 1; speichern(); b.classList.add('er-gelesen'); kopfNeu(); }
        dlg.showModal();
      };
    });
  }

  /* ---------- Schloss ---------- */
  function schloss(s) {
    var box = el('erS-' + s.id), p = 'er' + s.id;
    var titel = '<span class="q-badge">Schloss</span><h3 class="er-titel">' + s.titel + '</h3>';
    if (st.geloest[s.id]) {
      box.innerHTML = titel + '<div class="q-feedback show ok">' + OK + '<div><b>Offen.</b><span>' + s.notiz + '</span></div></div>' + loesungHtml(s) + weiterHtml(s);
      weiterBinden(s);
      return;
    }
    var karten = s.karten ? '<div class="q-answers er-karten" role="group" aria-label="Karten">' + s.karten.map(function (k) {
      return '<button type="button" class="q-answer" data-code="' + k.code + '"><span class="q-letter">' + k.code + '</span><span>' + k.text + '</span></button>';
    }).join('') + '</div>' : '';
    var felder = s.felder.map(function (f, i) {
      var ph = f.art === 'zeit' ? ' placeholder="hh:mm"' : f.art === 'code' ? ' placeholder="' + (f.reihe ? 'Ziffern' : f.wert.length + ' Ziffern') + '"' : '';  // Reihenfolge: Länge verraten wäre ein Gratis-Hinweis
      return '<label class="r-feld"><span class="r-label">' + f.label + '</span><span class="r-eingabe">' +
        '<input type="text" inputmode="' + (f.art === 'zeit' ? 'text' : f.art === 'code' ? 'numeric' : 'decimal') + '" autocomplete="off" id="' + p + 'In' + i + '"' + ph + '>' +
        '<span class="r-einheit">' + (f.art === 'zeit' ? 'Uhr' : f.einheit || '') + '</span></span><span class="r-hinweis" id="' + p + 'Hin' + i + '"></span></label>';
    }).join('');
    var h = st.offen[s.id] || 0;
    box.innerHTML = titel + '<div class="er-aufgabe">' + s.aufgabe + '</div>' + karten +
      '<form class="r-felder er-schloss" id="' + p + 'Form" novalidate><p class="er-schloss-titel">Codeschloss</p>' + felder +
      (s.reihe ? '<button type="button" class="q-btn ghost er-loeschen" id="' + p + 'Clr">Eingabe löschen</button>' : '') +
      '<button type="submit" class="q-btn" id="' + p + 'Btn">Code eingeben</button></form>' +
      '<div class="q-feedback" id="' + p + 'Fb" role="status" aria-live="polite"></div>' +
      '<p class="er-warte"><span id="' + p + 'Warte" role="status" aria-live="polite"></span> <span id="' + p + 'Uhr"></span></p>' +
      '<ol class="er-tipps" id="' + p + 'Tipps" aria-live="polite">' + s.hinweise.slice(0, h).map(function (t, i) { return '<li>' + t + '</li>'; }).join('') + '</ol>' +
      '<div class="er-hilfe"><button type="button" class="q-btn ghost er-tipp" id="' + p + 'Tipp"></button></div>';
    [].forEach.call(box.querySelectorAll('.er-karten .q-answer'), function (b) {
      b.onclick = function () {
        var inp = el(p + 'In0');
        if (s.reihe) inp.value += b.dataset.code;
        else {
          inp.value = b.dataset.code;
          [].forEach.call(box.querySelectorAll('.er-karten .q-answer'), function (x) { x.setAttribute('aria-pressed', x === b); x.classList.toggle('er-gewaehlt', x === b); });
        }
      };
    });
    if (s.reihe) el(p + 'Clr').onclick = function () { el(p + 'In0').value = ''; el(p + 'In0').focus(); };
    el(p + 'Form').onsubmit = function (e) { e.preventDefault(); pruefen(s); };
    el(p + 'Tipp').onclick = function () { tipp(s); };
    tippKnopf(s);
    sperre(s);
    if (st.tippBis[s.id] && !uhrTimer) laufen(s);
  }

  function tippKnopf(s) {
    var b = el('er' + s.id + 'Tipp'), h = st.offen[s.id] || 0, w = cfg.warten || [15, 30, 45];
    b.textContent = h < 2 ? 'Hinweis ' + (h + 1) + ' (' + w[h] + ' s warten)' : 'Lösung zeigen (' + w[2] + ' s warten)';
    b.disabled = !!uhrTimer;
  }

  function tipp(s) {
    if (uhrTimer) return;
    var h = st.offen[s.id] || 0, sek = (cfg.warten || [15, 30, 45])[Math.min(h, 2)];
    st.tippBis[s.id] = Date.now() + sek * 1000; st.warte += sek; speichern();
    laufen(s);
  }
  // Wartezeit mit Endzeit im Stand: übersteht Raumwechsel und Neuladen, wird nicht doppelt gebucht
  function laufen(s) {
    var p = 'er' + s.id, h = st.offen[s.id] || 0;
    var text = h < 2 ? 'Hinweis ' + (h + 1) : 'Die Lösung erscheint';
    function rest() { return Math.ceil((st.tippBis[s.id] - Date.now()) / 1000); }
    function tick() {
      if (rest() > 0) { el(p + 'Uhr').textContent = 'Noch ' + rest() + ' s.'; return; }
      clearInterval(uhrTimer); uhrTimer = null; delete st.tippBis[s.id];
      el(p + 'Warte').textContent = ''; el(p + 'Uhr').textContent = '';
      if (h < 2) {
        var li = document.createElement('li'); li.innerHTML = s.hinweise[h];
        el(p + 'Tipps').appendChild(li);
        st.offen[s.id] = h + 1; st.hinweise++; speichern();
      } else geloest(s, 'loesung');
      [].forEach.call(document.querySelectorAll('.er-tipp'), function (b) { b.disabled = false; });
      if (el(p + 'Tipp')) tippKnopf(s);
    }
    el(p + 'Warte').textContent = text + ' in ' + Math.max(rest(), 0) + ' s.';  // nur einmal ansagen, die Sekunden laufen ohne aria-live
    [].forEach.call(document.querySelectorAll('.er-tipp'), function (b) { b.disabled = true; });
    uhrTimer = setInterval(tick, 1000);
    tick();
  }

  function sperre(s) {
    var p = 'er' + s.id;
    function pruef() {
      var rest = Math.ceil(((st.sperreBis[s.id] || 0) - Date.now()) / 1000), aus = rest > 0;
      var box = el('erS-' + s.id);
      if (!box || st.geloest[s.id]) return false;
      [].forEach.call(box.querySelectorAll('form input, form button, .er-karten button'), function (x) { x.disabled = aus; });
      if (aus) {
        if (!el(p + 'Warte').textContent) el(p + 'Warte').textContent = 'Zu viele Fehlversuche: Das Schloss ist gesperrt. Lesen Sie die Dokumente nochmals oder holen Sie einen Hinweis.';
        el(p + 'Uhr').textContent = 'Noch ' + rest + ' s.';
        return true;
      }
      if (st.sperreBis[s.id]) { delete st.sperreBis[s.id]; st.fehl[s.id] = 0; speichern(); el(p + 'Uhr').textContent = ''; el(p + 'Warte').textContent = 'Das Schloss ist wieder offen.'; }
      return false;
    }
    if (pruef()) { var t = setInterval(function () { if (!pruef()) clearInterval(t); }, 1000); sperrTimer.push(t); }
  }

  function pruefen(s) {
    var p = 'er' + s.id;
    if ((st.sperreBis[s.id] || 0) > Date.now()) return;
    var leer = false, erg = s.felder.map(function (f, i) {
      var r = pruefe(f, el(p + 'In' + i).value);
      el(p + 'Hin' + i).textContent = r.leer ? (f.art === 'zeit' ? 'Bitte eine Uhrzeit eingeben, z. B. 05:40.' : f.art === 'code' ? 'Bitte Ziffern eingeben.' : 'Bitte eine Zahl eingeben.') : '';
      if (r.leer) leer = true;
      return r;
    });
    if (leer) return;
    var richtig = erg.filter(function (r) { return r.ok; }).length;
    if (richtig === s.felder.length) return geloest(s, st.offen[s.id] ? 'hinweis' : 'ok');
    st.fehl[s.id] = (st.fehl[s.id] || 0) + 1;
    var texte = erg.filter(function (r) { return !r.ok && r.irrtum; }).map(function (r) { return r.irrtum; });
    var fb = el(p + 'Fb');
    fb.className = 'q-feedback show nok';
    fb.innerHTML = NOK + '<div><b>Nicht ganz. Das Schloss bleibt zu.</b><span>' +
      (s.felder.length > 1 ? richtig + ' von ' + s.felder.length + ' Teilen stimmen. ' : '') +
      (texte.length ? texte.join(' ') : 'Prüfen Sie Ihren Weg und die Dokumente nochmals.') + '</span></div>';
    if (st.fehl[s.id] >= (cfg.fehlerBisSperre || 3)) {
      st.sperreBis[s.id] = Date.now() + (cfg.sperre || 30) * 1000; speichern(); el(p + 'Warte').textContent = ''; sperre(s);
    } else speichern();
  }

  function loesungHtml(s) { return '<div class="r-weg"><b>Warum</b><div>' + s.loesung + '</div><p class="er-quelle">Quelle: ' + s.quelle + '</p></div>'; }
  function neueTueren(s) { return welt.orte.filter(function (o) { return (o.oeffnetMit || []).indexOf(s.id) >= 0 && istOffen(o); }); }
  function weiterHtml(s) {
    if (s.ausgang) return '<div class="er-knoepfe"><button type="button" class="q-btn" id="erAus">Zur Freigabe</button></div>';
    var neu = neueTueren(s);
    return neu.length ? '<div class="er-knoepfe">' + neu.map(function (o) { return '<button type="button" class="q-btn" data-gehe="' + o.id + '">Weiter: ' + o.name + '</button>'; }).join('') + '</div>' : '';
  }
  function weiterBinden(s) {
    var box = el('erS-' + s.id);
    [].forEach.call(box.querySelectorAll('[data-gehe]'), function (b) { b.onclick = function () { gehe(b.dataset.gehe); window.scrollTo(0, 0); }; });
    if (el('erAus')) el('erAus').onclick = schlussbild;
  }

  function geloest(s, art) {
    st.geloest[s.id] = { art: art, h: st.offen[s.id] || 0 };
    st.fehl[s.id] = 0; delete st.sperreBis[s.id];
    st.log.push({ notiz: s.notiz, art: art, h: st.offen[s.id] || 0, ziel: s.ziel });
    speichern();
    var box = el('erS-' + s.id), p = 'er' + s.id;
    s.felder.forEach(function (f, i) {
      var inp = el(p + 'In' + i); inp.value = anzeige(f); inp.readOnly = true; inp.disabled = false;
      inp.closest('.r-feld').className = 'r-feld ok';
      el(p + 'Hin' + i).innerHTML = '';
    });
    [].forEach.call(box.querySelectorAll('.er-karten .q-answer'), function (b) {
      var gut = s.reihe ? s.felder[0].wert.indexOf(b.dataset.code) >= 0 : +b.dataset.code === s.felder[0].wert;
      b.disabled = true; b.classList.toggle('is-correct', gut); b.classList.toggle('is-dimmed', !gut);
    });
    [].forEach.call(box.querySelectorAll('form button, .er-hilfe'), function (x) { x.hidden = true; });
    el(p + 'Warte').textContent = ''; el(p + 'Uhr').textContent = '';
    var neu = neueTueren(s);
    var fb = el(p + 'Fb');
    fb.className = 'q-feedback show ' + (art === 'loesung' ? 'nok' : 'ok');
    fb.innerHTML = (art === 'loesung' ? NOK : OK) + '<div><b>' + (art === 'loesung' ? 'Lösung angezeigt.' : 'Richtig! Das Schloss ist offen.') + '</b>' +
      '<span>' + (neu.length ? 'Neu offen: ' + neu.map(function (o) { return o.name; }).join(', ') + '. ' : '') + 'Der Eintrag steht im Freigabeprotokoll.</span></div>';
    fb.insertAdjacentHTML('afterend', loesungHtml(s) + weiterHtml(s));
    weiterBinden(s);
    kopfNeu();
  }

  function schlussbild() {
    clearInterval(uhrTimer); uhrTimer = null;
    if (!st.ende) { st.ende = Date.now(); speichern(); }
    var min = Math.max(1, Math.round((st.ende - st.start) / 60000)), warteMin = Math.round(st.warte / 60);
    var loesungen = st.log.filter(function (l) { return l.art === 'loesung'; }).length;
    el('escape').innerHTML = '<section class="er-szene er-ende"><p class="er-ort">' + cfg.schluss.uhr + ' Uhr · Freigabe</p>' + cfg.schluss.szene + '</section>' +
      '<section class="q-card"><h2 class="er-titel" id="erTitel" tabindex="-1">Ihr Freigabeprotokoll</h2><ol class="er-liste">' +
      st.log.map(function (l) { return '<li>' + l.notiz + (l.art === 'loesung' ? ' <em>(Lösung angezeigt)</em>' : '') + '</li>'; }).join('') + '</ol>' +
      '<p class="er-bilanz">Zeit: etwa ' + min + ' min, davon ' + warteMin + ' min Wartezeit. Hinweise: ' + st.hinweise + '. Lösungen angezeigt: ' + loesungen + '.' +
      (loesungen ? ' Spielen Sie den Raum nochmals mit neuen Zahlen, um die Schlösser mit angezeigter Lösung selbst zu öffnen.' : '') + '</p></section>' +
      '<section class="q-card er-ziele"><h2>Was Sie gerade repetiert haben</h2><ul>' + cfg.schluss.ziele.map(function (z) { return '<li>' + z + '</li>'; }).join('') + '</ul></section>' +
      (cfg.schluss.html ? '<section class="q-card er-ziele">' + cfg.schluss.html + '</section>' : '') +
      '<div class="er-knoepfe"><button type="button" class="q-btn" id="erNeu">Nochmals mit neuen Zahlen</button></div>';
    el('erNeu').onclick = function () { st = neuerStand(st.kurz); speichern(); spiel(); };
    el('erTitel').focus();
    window.scrollTo(0, 0);
  }

  /* ---------- Messprotokoll als SVG ---------- */
  function kurve(punkte, o) {
    var B = 340, H = 190, L = 40, R = 10, T = 14, U = 34;
    function x(i) { return L + (B - L - R) * (punkte.length < 2 ? 0.5 : i / (punkte.length - 1)); }
    function y(v) { return T + (H - T - U) * (o.max - v) / (o.max - o.min); }
    var gitter = (o.linien || []).map(function (v) {
      return '<line x1="' + L + '" x2="' + (B - R) + '" y1="' + y(v) + '" y2="' + y(v) + '" class="er-gitter"/><text x="' + (L - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + zahl(v) + '</text>';
    }).join('');
    var linie = punkte.map(function (p, i) { return x(i) + ',' + y(p.wert); }).join(' ');
    var marken = punkte.map(function (p, i) {
      return '<circle cx="' + x(i) + '" cy="' + y(p.wert) + '" r="4"/><text x="' + x(i) + '" y="' + (y(p.wert) - 8) + '" text-anchor="middle" class="er-wert">' + zahl(p.wert) + '</text>' +
        '<text x="' + x(i) + '" y="' + (H - 12) + '" text-anchor="middle">' + p.zeit + '</text>';
    }).join('');
    var alt = (o.label || 'Messwerte') + ': ' + punkte.map(function (p) { return p.zeit + ' Uhr ' + zahl(p.wert) + ' ' + o.einheit; }).join(', ');
    return '<figure class="er-kurve"><svg viewBox="0 0 ' + B + ' ' + H + '" role="img" aria-label="' + alt + '">' + gitter +
      '<polyline points="' + linie + '"/>' + marken + '<text x="4" y="' + (T - 2) + '">' + o.einheit + '</text></svg>' +
      '<figcaption>' + (o.label || '') + '</figcaption></figure>';
  }

  window.LerntoolTest = {
    typ: 'escape-room',
    loesung: function () { return welt ? welt.schloesser.filter(function (s) { return s.ort === aktOrt && !st.geloest[s.id]; }).map(function (s) { return s.felder.map(anzeige); }) : []; }
  };

  return {
    init: function (c) { cfg = c; startbild(); },
    aufbauen: aufbauen, pruefe: pruefe, zufall: zufall, zeit: zeit, zahl: zahl, kurve: kurve, anzeige: anzeige
  };
})();
