/* assets/anlagenteile-engine.js – gemeinsame Logik für die Anlagenteile-Zuordnungen (b.7)
   Wird von zuordnung-anlagenteile-geruehrt.html und -stichfest.html eingebunden.
   Erwartet ein globales ANSWERS-Array (Reihenfolge = Nummerierung im Anlagenschema),
   das die einbindende Seite VOR diesem Script definiert. Benötigt assets/dnd.js. */
(function() {
  var dragWord = null, dragSource = null, selectedWord = null;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function init() {
    buildBank();
    buildSlots();
    dragWord = dragSource = null;
    selectedWord = null;
    document.getElementById('resultBanner').className = 'result-banner';
  }

  // ---- Build word bank ----
  function buildBank() {
    var bank = document.getElementById('wordBank');
    bank.innerHTML = '';
    shuffle(ANSWERS).forEach(function(word) {
      var chip = document.createElement('span');
      chip.className = 'word-chip';
      chip.textContent = word;
      chip.dataset.word = word;
      chip.setAttribute('draggable', 'true');

      // Mouse drag
      chip.addEventListener('dragstart', function(e) {
        dragWord   = word;
        dragSource = chip;
        chip.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      chip.addEventListener('dragend', function() {
        chip.classList.remove('dragging');
      });

      // Touch drag
      chip.addEventListener('touchstart', function(e) { MTDnD.touchStart(e, chip, word, false, '.slot-box', onDrop); }, {passive: false});

      // Klick zum Auswählen
      chip.addEventListener('click', function() { selectChipZ(chip, word); });

      bank.appendChild(chip);
    });
  }

  // ---- Klick-Bedienung ----
  function selectChipZ(chip, word) {
    if (chip.classList.contains('selected')) {
      chip.classList.remove('selected');
      selectedWord = null;
      clearReadySlots();
      return;
    }
    document.querySelectorAll('.word-chip.selected').forEach(function(c) { c.classList.remove('selected'); });
    chip.classList.add('selected');
    selectedWord = word;
    document.querySelectorAll('.slot-box').forEach(function(b) {
      b.classList.remove('ready');
      if (!b.dataset.filled && !b.classList.contains('correct') && !b.classList.contains('wrong')) b.classList.add('ready');
    });
  }

  function clickBoxZ(box) {
    if (box.classList.contains('correct') || box.classList.contains('wrong')) return;
    // Gefülltes Feld per Klick zurückgeben
    if (box.dataset.filled) {
      returnWordToBank(box.dataset.filled);
      clearSlot(box);
      if (selectedWord) box.classList.add('ready');
      return;
    }
    if (!selectedWord) return;
    fillSlot(box, selectedWord);
    markChipUsed(selectedWord);
    selectedWord = null;
    document.querySelectorAll('.word-chip.selected').forEach(function(c) { c.classList.remove('selected'); });
    clearReadySlots();
  }

  function clearReadySlots() {
    document.querySelectorAll('.slot-box').forEach(function(b) { b.classList.remove('ready'); });
  }

  // ---- Build slots ----
  function buildSlots() {
    var grid = document.getElementById('slotsGrid');
    grid.innerHTML = '';
    for (var i = 1; i <= ANSWERS.length; i++) {
      (function(num) {
        var row = document.createElement('div');
        row.className = 'slot-row';

        var badge = document.createElement('div');
        badge.className = 'slot-num';
        badge.textContent = num;

        var box = document.createElement('div');
        box.className = 'slot-box';
        box.dataset.slot = num;
        box.textContent = '—';

        // Desktop drop target
        box.addEventListener('dragover', function(e) {
          e.preventDefault();
          if (!box.classList.contains('correct') && !box.classList.contains('wrong')) {
            box.classList.add('over');
          }
        });
        box.addEventListener('dragleave', function() {
          box.classList.remove('over');
        });
        box.addEventListener('drop', function(e) {
          e.preventDefault();
          box.classList.remove('over');
          dropOnSlot(box);
        });

        // Drag FROM filled slot
        box.addEventListener('dragstart', function(e) {
          if (!box.dataset.filled) { e.preventDefault(); return; }
          dragWord   = box.dataset.filled;
          dragSource = box;
          box.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
        });
        box.addEventListener('dragend', function() {
          box.classList.remove('dragging');
        });

        // Touch drag from filled slot
        box.addEventListener('touchstart', function(e) {
          if (!box.dataset.filled) return;
          MTDnD.touchStart(e, box, box.dataset.filled, true, '.slot-box', onDrop);
        }, {passive: false});

        // Klick: ausgewähltes Wort setzen / gefülltes Feld leeren
        box.addEventListener('click', function() { clickBoxZ(box); });

        row.appendChild(badge);
        row.appendChild(box);
        grid.appendChild(row);
      })(i);
    }
  }

  // ---- Drop logic (Maus) ----
  function dropOnSlot(targetBox) {
    if (!dragWord) return;
    if (targetBox.classList.contains('correct') || targetBox.classList.contains('wrong')) return;

    var displaced = targetBox.dataset.filled || null;

    // Clear source
    if (dragSource && dragSource.classList.contains('slot-box')) {
      // Dragging from another slot
      clearSlot(dragSource);
      if (displaced) {
        // Swap: put displaced word in source slot
        fillSlot(dragSource, displaced);
      }
    } else if (dragSource) {
      // Dragging from word bank chip
      markChipUsed(dragWord);
      if (displaced) returnWordToBank(displaced);
    }

    fillSlot(targetBox, dragWord);
    dragWord = dragSource = null;
  }

  // ---- Drop logic (Touch, via MTDnD) ----
  function onDrop(targetBox, word, source) {
    if (targetBox.classList.contains('correct') || targetBox.classList.contains('wrong')) return;

    var displaced = targetBox.dataset.filled || null;

    if (source.isSlot) {
      clearSlot(source.el);
      if (displaced) fillSlot(source.el, displaced);
    } else {
      markChipUsed(word);
      if (displaced) returnWordToBank(displaced);
    }

    fillSlot(targetBox, word);
  }

  function fillSlot(box, word) {
    box.dataset.filled = word;
    box.textContent = word;
    box.className = 'slot-box filled';
    box.setAttribute('draggable', 'true');
  }

  function clearSlot(box) {
    delete box.dataset.filled;
    box.textContent = '—';
    box.className = 'slot-box';
    box.setAttribute('draggable', 'false');
  }

  function markChipUsed(word) {
    document.querySelectorAll('.word-chip').forEach(function(c) {
      if (c.dataset.word === word) c.classList.add('used');
    });
  }

  function returnWordToBank(word) {
    document.querySelectorAll('.word-chip').forEach(function(c) {
      if (c.dataset.word === word) c.classList.remove('used');
    });
  }

  // ---- Check & Reset ----
  function checkAll() {
    var correct = 0, filled = 0;
    document.querySelectorAll('.slot-box').forEach(function(box) {
      var val = box.dataset.filled;
      if (!val) return;
      filled++;
      var idx = parseInt(box.dataset.slot) - 1;
      box.classList.remove('filled');
      if (val === ANSWERS[idx]) { box.classList.add('correct'); correct++; }
      else                       { box.classList.add('wrong'); }
    });

    var banner = document.getElementById('resultBanner');
    if (correct === ANSWERS.length) {
      banner.textContent = 'Perfekt! Alle ' + ANSWERS.length + ' Anlagenteile richtig zugeordnet.';
      banner.className = 'result-banner show perfect';
    } else {
      banner.textContent = correct + ' von ' + filled + ' Feldern korrekt. Rot markierte Felder nochmals überprüfen.';
      banner.className = 'result-banner show partial';
    }
  }

  function resetAll() { init(); }

  window.checkAll = checkAll;
  window.resetAll = resetAll;

  init();
})();
