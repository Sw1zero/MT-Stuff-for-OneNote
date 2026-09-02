/* assets/lernkaertchen-engine.js – MT-Lerntools gemeinsame Lernkärtchen-Engine
   ---------------------------------------------------------------------------
   Karten-Flip, Kategorie-Filter, Navigation, Mischen sowie eine
   Richtig/Falsch-Selbsteinschätzung ("Wusste ich" / "Wusste ich nicht").
   Nicht gewusste Karten werden ans Ende des aktuellen Stapels angehängt;
   der Durchgang wiederholt sich, bis alle Karten in einem Durchgang als
   "Wusste ich" markiert wurden.

   Erwartetes Karten-Format: { term, explanation, category }
   Erwartete Element-IDs im Markup (siehe lernkaertchen.html als Vorlage):
     filterWrap, progressText, progressBar, scene, card,
     frontLabel, frontTerm, backLabel, backExplanation,
     prevBtn, flipBtn, nextBtn, shuffleBtn,
     ratingRow, knownBtn, unknownBtn,
     controlsNav, completePanel, completeText

   API:
     MTFlashcards.init({ cards: [...], categoryColors: {...} })
   ---------------------------------------------------------------------------- */
(function (win, doc) {
  function init(config) {
    var ALL_CARDS = config.cards || [];
    var CATEGORY_COLORS = config.categoryColors || {};

    var el = {
      filterWrap:     doc.getElementById('filterWrap'),
      progressText:   doc.getElementById('progressText'),
      progressBar:    doc.getElementById('progressBar'),
      scene:          doc.getElementById('scene'),
      card:           doc.getElementById('card'),
      frontLabel:     doc.getElementById('frontLabel'),
      frontTerm:      doc.getElementById('frontTerm'),
      backLabel:      doc.getElementById('backLabel'),
      backExplanation: doc.getElementById('backExplanation'),
      prevBtn:        doc.getElementById('prevBtn'),
      flipBtn:        doc.getElementById('flipBtn'),
      nextBtn:        doc.getElementById('nextBtn'),
      shuffleBtn:     doc.getElementById('shuffleBtn'),
      ratingRow:      doc.getElementById('ratingRow'),
      knownBtn:       doc.getElementById('knownBtn'),
      unknownBtn:     doc.getElementById('unknownBtn'),
      controlsNav:    doc.getElementById('controlsNav'),
      completePanel:  doc.getElementById('completePanel'),
      completeText:   doc.getElementById('completeText'),
    };

    var activeCategory = 'Alle';
    var baseDeck = [];   // Karten dieser Runde (Filter/Mischen), unveränderlich bis zum Reset
    var queue = [];       // Karten des aktuellen Durchgangs
    var nextQueue = [];   // "Wusste ich nicht" → nächster Durchgang
    var pos = 0;           // Position in queue
    var passNumber = 1;
    var isFlipped = false;
    var isComplete = false;

    function getFilteredCards() {
      return activeCategory === 'Alle'
        ? ALL_CARDS.slice()
        : ALL_CARDS.filter(function (c) { return c.category === activeCategory; });
    }

    function shuffleArray(a) {
      a = a.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }

    function renderFilters() {
      if (!el.filterWrap) return;
      var categories = ['Alle'].concat(Object.keys(CATEGORY_COLORS));
      el.filterWrap.innerHTML = categories.map(function (cat) {
        var count = cat === 'Alle'
          ? ALL_CARDS.length
          : ALL_CARDS.filter(function (c) { return c.category === cat; }).length;
        var active = cat === activeCategory ? ' active' : '';
        return '<button class="filter-btn' + active + '" data-cat="' + cat + '">' + cat +
          ' <span style="opacity:0.65;font-size:0.68rem">' + count + '</span></button>';
      }).join('');
      Array.prototype.forEach.call(el.filterWrap.querySelectorAll('.filter-btn'), function (btn) {
        btn.addEventListener('click', function () { setCategory(btn.getAttribute('data-cat')); });
      });
    }

    function startRound(cards) {
      baseDeck = cards;
      queue = cards.slice();
      nextQueue = [];
      pos = 0;
      passNumber = 1;
      isComplete = false;
      showCard(true);
    }

    function setCategory(cat) {
      activeCategory = cat;
      renderFilters();
      startRound(getFilteredCards());
    }

    function shuffle() {
      startRound(shuffleArray(getFilteredCards()));
    }

    function currentCard() {
      return queue[pos];
    }

    function setRatingVisible(visible) {
      if (el.ratingRow) el.ratingRow.hidden = !visible;
    }

    function showCard(forceUnflip) {
      if (!queue.length) { showComplete(); return; }
      hideComplete();
      if (isFlipped || forceUnflip) {
        isFlipped = false;
        if (el.card) el.card.classList.remove('flipped');
      }
      var c = currentCard();
      var col = CATEGORY_COLORS[c.category] || { bg: '#f1f5f9', fg: '#4a5568' };

      if (el.frontTerm) el.frontTerm.textContent = c.term;
      if (el.backExplanation) el.backExplanation.innerHTML = c.explanation;

      [el.frontLabel, el.backLabel].forEach(function (label) {
        if (!label) return;
        label.textContent = c.category;
        label.style.background = col.bg;
        label.style.color = col.fg;
      });

      updateProgress();
      setRatingVisible(false);
    }

    function updateProgress() {
      var total = queue.length;
      if (!total || !el.progressText) return;
      var main = 'Karte ' + (pos + 1) + ' von ' + total;
      if (passNumber > 1) {
        main += ' (Durchgang ' + passNumber + ')';
        if (nextQueue.length > 0) main += ' · noch ' + nextQueue.length + ' zu wiederholen';
      }
      el.progressText.textContent = main;
      if (el.progressBar) el.progressBar.style.width = ((pos + 1) / total * 100) + '%';
    }

    function flip() {
      if (isComplete || !queue.length) return;
      isFlipped = !isFlipped;
      if (el.card) el.card.classList.toggle('flipped');
      setRatingVisible(isFlipped);
    }

    function advance(known) {
      if (!known) nextQueue.push(currentCard());
      pos++;
      if (pos >= queue.length) {
        if (nextQueue.length === 0) { showComplete(); return; }
        passNumber++;
        queue = nextQueue;
        nextQueue = [];
        pos = 0;
      }
      showCard(true);
    }

    function markKnown() { if (!isComplete && isFlipped) advance(true); }
    function markUnknown() { if (!isComplete && isFlipped) advance(false); }

    function next() {
      if (isComplete || !queue.length) return;
      pos = (pos + 1) % queue.length;
      showCard(true);
    }

    function prev() {
      if (isComplete || !queue.length) return;
      pos = (pos - 1 + queue.length) % queue.length;
      showCard(true);
    }

    function showComplete() {
      isComplete = true;
      if (el.scene) el.scene.hidden = true;
      if (el.controlsNav) el.controlsNav.hidden = true;
      setRatingVisible(false);
      if (el.completePanel) el.completePanel.hidden = false;
      if (el.completeText) el.completeText.textContent = 'Alle Karten gewusst.';
      if (el.progressBar) el.progressBar.style.width = '100%';
    }

    function hideComplete() {
      if (isComplete && el.scene) el.scene.hidden = false;
      if (isComplete && el.controlsNav) el.controlsNav.hidden = false;
      if (el.completePanel) el.completePanel.hidden = true;
      isComplete = false;
    }

    if (el.scene)      el.scene.addEventListener('click', flip);
    if (el.flipBtn)    el.flipBtn.addEventListener('click', flip);
    if (el.prevBtn)    el.prevBtn.addEventListener('click', prev);
    if (el.nextBtn)    el.nextBtn.addEventListener('click', next);
    if (el.shuffleBtn) el.shuffleBtn.addEventListener('click', shuffle);
    if (el.knownBtn)   el.knownBtn.addEventListener('click', markKnown);
    if (el.unknownBtn) el.unknownBtn.addEventListener('click', markUnknown);

    doc.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); }
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 's' || e.key === 'S') shuffle();
    });

    renderFilters();
    startRound(getFilteredCards());
  }

  win.MTFlashcards = { init: init };
})(window, document);
