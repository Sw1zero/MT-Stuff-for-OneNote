/* assets/zuordnung3.js – MT-Lerntools gemeinsame 3-Stufen-Zuordnung-Engine
   ------------------------------------------------------------------------
   Gemeinsame Bausteine für Tools nach dem Muster "Einfach – zuordnen /
   Mittel – anklicken / Schwer – eintippen". Jede Seite behält ihre
   eigenen Daten, ihr Markup und die level-spezifischen buildMittel-/
   buildSchwer-Funktionen; hier ausgelagert ist nur die Mechanik, die in
   mehreren Tools wortgleich kopiert war.

   Deckt zwei Tool-Familien ab:
     Zuordnung3.karten     – Karten aus einem Pool in Zonen ziehen
                             (z.B. Hygienezonen, Piktogramme)
     Zuordnung3.wortbank   – Begriffe aus einer Wortbank in Tabellen-
                             Lücken ziehen (z.B. Dampfkessel, Begründen)

   API:
     Zuordnung3.fold(s) -> String
     Zuordnung3.matchKeys(input, keys) -> Boolean
     Zuordnung3.showResult(bannerEl, isPerfect, message)
       Setzt Text + Klassen der Ergebnis-Banner. Die Meldung selbst
       bleibt Sache der Seite, damit der Wortlaut pro Tool erhalten bleibt.

     Zuordnung3.levelBar(config) -> { setLevel, resetLevel, checkLevel }
       config = {
         instructions: { einfach, mittel, schwer },   // Text für #instruction
         checkBtn:     { einfach, mittel, schwer },   // '' oder 'none' für #checkBtn
         build:        { einfach, mittel, schwer },   // fn(bodyEl)
         check:        { einfach, schwer }            // optional, fn() ohne Argumente
       }
       Registriert window.setLevel/resetLevel/checkLevel für die
       onclick-Attribute im Markup (level-btn, checkBtn).

     Zuordnung3.karten.createEngine(karten, fieldName, opts)
       karten:    Array von { id, text, [fieldName]: ... }
       fieldName: Name des Zuordnungsfelds, z.B. 'zone' oder 'match'.
                  Muss dem data-Attribut der Drop-Zonen entsprechen
                  (data-zone bzw. data-match).
       opts:      { singleSlot: Boolean } – true wenn jede Zone genau
                  eine Karte aufnimmt (bestehende wird zurück in den
                  Pool gelegt), false wenn mehrere Karten pro Zone
                  erlaubt sind.
       -> {
            karteById,
            renderPool(poolEl),      // mischt + befüllt den Karten-Pool
            setupZones(selector),    // verdrahtet Drop-Zonen (default '.drop-zone')
            checkEinfach(selector)   // -> { correct, total }
          }

     Zuordnung3.wortbank.createEngine()
       -> {
            wireBank(bankEl, answers),  // mischt + befüllt die Wortbank
            wireCells(selector),        // verdrahtet Lücken (default '.blank-cell')
            checkEinfach(selector)      // -> { correct, filled }
          }
   ------------------------------------------------------------------------ */
(function(win) {

  function fold(s) {
    return String(s).toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function matchKeys(input, keys) {
    var f = fold(input);
    if (!f) return false;
    for (var i = 0; i < keys.length; i++) {
      if (f.indexOf(fold(keys[i])) !== -1) return true;
    }
    return false;
  }

  function isLocked(el) {
    return el.classList.contains('correct') || el.classList.contains('wrong');
  }

  function showResult(bannerEl, isPerfect, message) {
    bannerEl.textContent = message;
    bannerEl.className = 'result-banner show ' + (isPerfect ? 'perfect' : 'partial');
  }

  /* ---------- gemeinsames Level-Grundgerüst ---------- */
  function levelBar(config) {
    var level = 'einfach';

    function setLevel(l) {
      level = l;
      ['einfach', 'mittel', 'schwer'].forEach(function(k) {
        document.getElementById('lvl-' + k).classList.toggle('active', k === l);
      });
      resetLevel();
    }

    function resetLevel() {
      document.getElementById('resultBanner').className = 'result-banner';
      var body = document.getElementById('modeBody');
      body.innerHTML = '';
      document.getElementById('checkBtn').style.display = config.checkBtn[level];
      document.getElementById('instruction').textContent = config.instructions[level];
      config.build[level](body);
    }

    function checkLevel() {
      var fn = config.check && config.check[level];
      if (fn) fn();
    }

    win.setLevel = setLevel;
    win.resetLevel = resetLevel;
    win.checkLevel = checkLevel;

    return { setLevel: setLevel, resetLevel: resetLevel, checkLevel: checkLevel };
  }

  /* ---------- Familie 1: Karten aus Pool in Zonen ziehen ---------- */
  function createKartenEngine(karten, fieldName, opts) {
    opts = opts || {};
    var singleSlot = !!opts.singleSlot;

    var karteById = {};
    for (var i = 0; i < karten.length; i++) { karteById[karten[i].id] = karten[i]; }

    var dragId = null, dragSource = null, dragFromPool = false, selectedId = null;

    function makePoolChip(k) {
      var chip = document.createElement('span');
      chip.className = 'karte';
      chip.textContent = k.text;
      chip.dataset.id = k.id;
      chip.setAttribute('draggable', 'true');

      chip.addEventListener('dragstart', function(e) {
        dragId = k.id; dragSource = chip; dragFromPool = true;
        chip.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      chip.addEventListener('dragend', function() { chip.classList.remove('dragging'); });
      chip.addEventListener('touchstart', function(e) { win.MTDnD.touchStart(e, chip, k.id, false, '.drop-zone', onDrop); }, {passive: false});
      chip.addEventListener('click', function() { selectPoolChip(chip, k.id); });

      return chip;
    }

    function selectPoolChip(chip, id) {
      if (chip.classList.contains('used')) return;
      if (selectedId === id) { chip.classList.remove('selected'); selectedId = null; clearReadyZones(); return; }
      document.querySelectorAll('.karte.selected').forEach(function(c) { c.classList.remove('selected'); });
      chip.classList.add('selected');
      selectedId = id;
      document.querySelectorAll('.drop-zone').forEach(function(z) {
        z.classList.remove('ready');
        if (!z.classList.contains('checked')) z.classList.add('ready');
      });
    }

    function clickZone(zone) {
      if (zone.classList.contains('checked')) return;
      if (selectedId === null) return;
      placeCardInZone(zone, selectedId);
      markPoolChipUsed(selectedId);
      selectedId = null;
      document.querySelectorAll('.karte.selected').forEach(function(c) { c.classList.remove('selected'); });
      clearReadyZones();
    }

    function clickPlacedKarte(el, id, zone) {
      if (isLocked(el)) return;
      if (selectedId !== null) {
        returnToPool(id);
        removeFromZone(zone, id);
        placeCardInZone(zone, selectedId);
        markPoolChipUsed(selectedId);
        selectedId = null;
        document.querySelectorAll('.karte.selected').forEach(function(c) { c.classList.remove('selected'); });
        clearReadyZones();
      } else {
        returnToPool(id);
        removeFromZone(zone, id);
      }
    }

    function clearReadyZones() { document.querySelectorAll('.drop-zone').forEach(function(z) { z.classList.remove('ready'); }); }

    function placeCardInZone(zone, id) {
      if (singleSlot) {
        var existing = zone.querySelector('.placed-karte');
        if (existing) { returnToPool(parseInt(existing.dataset.id)); zone.removeChild(existing); }
      }

      var k = karteById[id];
      var el = document.createElement('div');
      el.className = 'placed-karte';
      el.textContent = k.text;
      el.dataset.id = id;
      el.setAttribute('draggable', 'true');

      el.addEventListener('dragstart', function(e) {
        if (isLocked(el)) { e.preventDefault(); return; }
        dragId = id; dragSource = el; dragFromPool = false;
        el.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      el.addEventListener('dragend', function() { el.classList.remove('dragging'); });
      el.addEventListener('touchstart', function(e) {
        if (isLocked(el)) return;
        win.MTDnD.touchStart(e, el, id, true, '.drop-zone', onDrop);
      }, {passive: false});
      el.addEventListener('click', function(e) { e.stopPropagation(); clickPlacedKarte(el, id, zone); });

      zone.appendChild(el);
    }

    function removeFromZone(zone, id) {
      var children = zone.querySelectorAll('.placed-karte');
      for (var i = 0; i < children.length; i++) {
        if (parseInt(children[i].dataset.id) === parseInt(id)) { zone.removeChild(children[i]); return; }
      }
    }

    function findZoneForPlacedEl(el) { return el.closest('.drop-zone'); }

    function markPoolChipUsed(id) {
      document.querySelectorAll('.karte').forEach(function(c) { if (parseInt(c.dataset.id) === parseInt(id)) c.classList.add('used'); });
    }
    function returnToPool(id) {
      document.querySelectorAll('.karte').forEach(function(c) { if (parseInt(c.dataset.id) === parseInt(id)) c.classList.remove('used'); });
    }

    function dropOnZone(zone) {
      if (!dragId) return;
      if (zone.classList.contains('checked')) return;
      if (!dragFromPool && dragSource) {
        var srcZone = findZoneForPlacedEl(dragSource);
        if (srcZone) srcZone.removeChild(dragSource);
      } else if (dragFromPool) {
        markPoolChipUsed(dragId);
      }
      placeCardInZone(zone, dragId);
      dragId = dragSource = null; dragFromPool = false;
    }

    function onDrop(targetZone, id, source) {
      if (targetZone.classList.contains('checked')) return;
      if (source.isSlot) {
        var srcZone = findZoneForPlacedEl(source.el);
        if (srcZone) srcZone.removeChild(source.el);
      } else {
        markPoolChipUsed(id);
      }
      placeCardInZone(targetZone, id);
    }

    function renderPool(poolEl) {
      win.MTDnD.shuffle(karten).forEach(function(k) { poolEl.appendChild(makePoolChip(k)); });
      dragId = dragSource = null; selectedId = null;
    }

    function setupZones(selector) {
      document.querySelectorAll(selector || '.drop-zone').forEach(function(zone) {
        zone.addEventListener('dragover', function(e) { e.preventDefault(); if (!zone.classList.contains('checked')) zone.classList.add('over'); });
        zone.addEventListener('dragleave', function() { zone.classList.remove('over'); });
        zone.addEventListener('drop', function(e) { e.preventDefault(); zone.classList.remove('over'); dropOnZone(zone); });
        zone.addEventListener('click', function() { clickZone(zone); });
      });
    }

    function checkEinfach(selector) {
      var correct = 0, total = 0;
      document.querySelectorAll(selector || '.drop-zone').forEach(function(zone) {
        var correctVal = zone.dataset[fieldName];
        zone.classList.add('checked');
        zone.querySelectorAll('.placed-karte').forEach(function(el) {
          var id = parseInt(el.dataset.id);
          var k = karteById[id];
          total++;
          el.classList.remove('placed-karte');
          if (k[fieldName] === correctVal) { el.classList.add('placed-karte', 'correct'); correct++; }
          else { el.classList.add('placed-karte', 'wrong'); }
          el.setAttribute('draggable', 'false');
        });
      });
      return { correct: correct, total: total };
    }

    return { karteById: karteById, renderPool: renderPool, setupZones: setupZones, checkEinfach: checkEinfach };
  }

  /* ---------- Familie 2: Begriffe aus Wortbank in Tabellen-Lücken ziehen ---------- */
  function createWortbankEngine() {
    var selected = null, dragWord = null;

    function selectChip(chip) {
      if (chip.classList.contains('selected')) { chip.classList.remove('selected'); selected = null; clearReady(); return; }
      document.querySelectorAll('.word-chip.selected').forEach(function(c) { c.classList.remove('selected'); });
      chip.classList.add('selected');
      selected = chip.dataset.word;
      document.querySelectorAll('.blank-cell').forEach(function(c) {
        c.classList.remove('ready');
        if (!c.dataset.filled && !isLocked(c)) c.classList.add('ready');
      });
    }

    function clickCell(cell) {
      if (isLocked(cell)) return;
      if (cell.dataset.filled) {
        returnWord(cell.dataset.filled);
        delete cell.dataset.filled;
        cell.textContent = '—';
        cell.className = 'blank-cell';
        if (selected) cell.classList.add('ready');
        return;
      }
      if (!selected) return;
      placeInCell(cell, selected);
    }

    function placeInCell(cell, word) {
      if (isLocked(cell)) return;
      var displaced = cell.dataset.filled || null;
      cell.dataset.filled = word;
      cell.textContent = word;
      cell.className = 'blank-cell filled';
      markUsed(word);
      if (displaced && displaced !== word) returnWord(displaced);
      selected = null;
      document.querySelectorAll('.word-chip.selected').forEach(function(c) { c.classList.remove('selected'); });
      clearReady();
    }

    function returnWord(word) { document.querySelectorAll('.word-chip').forEach(function(c) { if (c.dataset.word === word) c.classList.remove('used', 'selected'); }); }
    function markUsed(word) { document.querySelectorAll('.word-chip').forEach(function(c) { if (c.dataset.word === word) { c.classList.remove('selected'); c.classList.add('used'); } }); }
    function clearReady() { document.querySelectorAll('.blank-cell').forEach(function(c) { c.classList.remove('ready'); }); }
    function onDrop(box, word) { if (isLocked(box)) return; placeInCell(box, word); }

    function wireBank(bankEl, answers) {
      win.MTDnD.shuffle(answers).forEach(function(word) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'word-chip';
        chip.textContent = word;
        chip.dataset.word = word;
        chip.setAttribute('draggable', 'true');
        chip.onclick = function() { selectChip(this); };
        chip.addEventListener('dragstart', function(e) { dragWord = word; e.dataTransfer.effectAllowed = 'move'; chip.classList.add('dragging'); });
        chip.addEventListener('dragend', function() { chip.classList.remove('dragging'); });
        chip.addEventListener('touchstart', function(e) { win.MTDnD.touchStart(e, chip, word, false, '.blank-cell', onDrop); }, {passive: false});
        bankEl.appendChild(chip);
      });
      selected = null; dragWord = null;
    }

    function wireCells(selector) {
      document.querySelectorAll(selector || '.blank-cell').forEach(function(cell) {
        cell.onclick = function() { clickCell(this); };
        cell.addEventListener('dragover', function(e) { e.preventDefault(); if (!isLocked(cell) && !cell.dataset.filled) cell.classList.add('over'); });
        cell.addEventListener('dragleave', function() { cell.classList.remove('over'); });
        cell.addEventListener('drop', function(e) {
          e.preventDefault(); cell.classList.remove('over');
          if (dragWord) { placeInCell(cell, dragWord); dragWord = null; }
        });
      });
    }

    function checkEinfach(selector) {
      var correct = 0, filled = 0;
      document.querySelectorAll(selector || '.blank-cell').forEach(function(cell) {
        var val = cell.dataset.filled;
        if (!val) return;
        filled++;
        cell.classList.remove('filled', 'ready');
        if (val === cell.dataset.answer) { cell.classList.add('correct'); correct++; }
        else { cell.classList.add('wrong'); }
      });
      return { correct: correct, filled: filled };
    }

    return { wireBank: wireBank, wireCells: wireCells, checkEinfach: checkEinfach };
  }

  win.Zuordnung3 = {
    fold: fold,
    matchKeys: matchKeys,
    isLocked: isLocked,
    showResult: showResult,
    levelBar: levelBar,
    karten: { createEngine: createKartenEngine },
    wortbank: { createEngine: createWortbankEngine }
  };

})(window);
