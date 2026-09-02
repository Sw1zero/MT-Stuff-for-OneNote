/* assets/zellen-zuordnung.js – MT-Lerntools gemeinsame Zellen-Zuordnung-Engine
   ---------------------------------------------------------------
   Wortbank -> Tabellenzellen zuordnen per Klick, Drag & Drop oder Touch.
   Baut auf MTDnD (assets/dnd.js) für das Touch-Handling auf.
   Erwartet: #wordBank (Wortbank-Container), .blank-cell[data-answer]
   (Lückenzellen), #resultBanner (Ergebnisanzeige) – siehe bestehende Module.

   API:
     ZellenZuordnung.init(options)
       options.answers         Array der Lösungswörter (= data-answer-Werte)
       options.perfectMessage  function(n) -> Text bei 100% Treffern
                                (default: 'Perfekt! Alle n richtig zugeordnet.')
     ZellenZuordnung.checkAll()   – vom "Überprüfen"-Button aufgerufen
     ZellenZuordnung.resetAll()   – vom "Zurücksetzen"-Button aufgerufen
   --------------------------------------------------------------- */
(function(win) {
  var opts = null;
  var selected = null;
  var dragWord = null;

  function isLocked(cell) { return cell.classList.contains('correct') || cell.classList.contains('wrong'); }

  function init(options) {
    opts = {
      answers: options.answers,
      perfectMessage: options.perfectMessage || function(n) { return 'Perfekt! Alle ' + n + ' richtig zugeordnet.'; }
    };

    var bank = document.getElementById('wordBank');
    bank.innerHTML = '';
    MTDnD.shuffle(opts.answers).forEach(function(word) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'word-chip';
      chip.textContent = word;
      chip.dataset.word = word;
      chip.setAttribute('draggable', 'true');
      chip.onclick = function() { selectChip(this); };
      chip.addEventListener('dragstart', function(e) {
        dragWord = word; e.dataTransfer.effectAllowed = 'move'; chip.classList.add('dragging');
      });
      chip.addEventListener('dragend', function() { chip.classList.remove('dragging'); });
      chip.addEventListener('touchstart', function(e) { MTDnD.touchStart(e, chip, word, false, '.blank-cell', onDrop); }, {passive: false});
      bank.appendChild(chip);
    });

    document.querySelectorAll('.blank-cell').forEach(function(cell) {
      cell.textContent = '—';
      cell.className = 'blank-cell';
      delete cell.dataset.filled;
      cell.onclick = function() { clickCell(this); };
      cell.addEventListener('dragover', function(e) { e.preventDefault(); if (!isLocked(cell) && !cell.dataset.filled) cell.classList.add('over'); });
      cell.addEventListener('dragleave', function() { cell.classList.remove('over'); });
      cell.addEventListener('drop', function(e) {
        e.preventDefault(); cell.classList.remove('over');
        if (dragWord) { placeInCell(cell, dragWord); dragWord = null; }
      });
    });

    selected = null;
    document.getElementById('resultBanner').className = 'result-banner';
  }

  function selectChip(chip) {
    if (chip.classList.contains('selected')) {
      chip.classList.remove('selected');
      selected = null;
      clearReady();
      return;
    }
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
    clearSelectedChip();
    clearReady();
  }

  function clearSelectedChip() {
    document.querySelectorAll('.word-chip.selected').forEach(function(c) { c.classList.remove('selected'); });
  }

  function returnWord(word) {
    document.querySelectorAll('.word-chip').forEach(function(c) {
      if (c.dataset.word === word) c.classList.remove('used', 'selected');
    });
  }

  function markUsed(word) {
    document.querySelectorAll('.word-chip').forEach(function(c) {
      if (c.dataset.word === word) { c.classList.remove('selected'); c.classList.add('used'); }
    });
  }

  function clearReady() {
    document.querySelectorAll('.blank-cell').forEach(function(c) { c.classList.remove('ready'); });
  }

  function onDrop(box, word, source) {
    if (isLocked(box)) return;
    placeInCell(box, word);
  }

  function checkAll() {
    var correct = 0, filled = 0;
    document.querySelectorAll('.blank-cell').forEach(function(cell) {
      var val = cell.dataset.filled;
      if (!val) return;
      filled++;
      cell.classList.remove('filled', 'ready');
      if (val === cell.dataset.answer) { cell.classList.add('correct'); correct++; }
      else                              { cell.classList.add('wrong'); }
    });

    var banner = document.getElementById('resultBanner');
    if (correct === opts.answers.length) {
      banner.textContent = opts.perfectMessage(opts.answers.length);
      banner.className = 'result-banner show perfect';
    } else {
      banner.textContent = correct + ' von ' + filled + ' Feldern korrekt. Rot markierte Felder nochmals überprüfen.';
      banner.className = 'result-banner show partial';
    }
  }

  function resetAll() { init(opts); }

  win.ZellenZuordnung = {
    init: init,
    checkAll: checkAll,
    resetAll: resetAll
  };
})(window);
