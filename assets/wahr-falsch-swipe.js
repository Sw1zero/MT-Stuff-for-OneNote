/* assets/wahr-falsch-swipe.js – MT-Lerntools Wahr/Falsch-Swipe-Engine
   ---------------------------------------------------------------
   Tinder-artige Swipe-Karten (rechts = Wahr, links = Falsch) für
   Wahr/Falsch-Quiz. Ersetzt die duplizierte Swipe-/Score-Logik in
   den einzelnen Tools. Erwartet im HTML dieselben Element-IDs wie
   bisher: cardStack, cardNum, scoreCorrect, scoreWrong, endScreen,
   endScore, endMsg, feedbackToast, feedbackLabel, feedbackText
   sowie ein Element mit Klasse .action-btns.

   API:
     MTWahrFalsch.init({ cards, topicPhrase })
       cards        Array von { statement, answer (bool), explanation }
       topicPhrase  Textbaustein für die Erfolgsmeldung, z.B.
                     'die Sauermilchprodukte' ->
                     "Ausgezeichnet! Sie kennen die Sauermilchprodukte sehr gut."
       Startet das Spiel gleich selbst (kein separater start()-Aufruf nötig).

     MTWahrFalsch.swipe(dir)     dir = 'left' | 'right' – für Buttons/Tastatur
     MTWahrFalsch.startGame()    Spiel neu mischen & starten – für "Nochmals spielen"
   --------------------------------------------------------------- */
(function (win, doc) {
  var CARDS = [];
  var topicPhrase = '';

  var deck = [];
  var current = 0;
  var scoreCorrect = 0;
  var scoreWrong = 0;

  var dragging = false;
  var startX = 0;
  var currentX = 0;
  var topCard = null;
  var toastTimer = null;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function startGame() {
    deck = shuffle(CARDS);
    current = 0;
    scoreCorrect = 0;
    scoreWrong = 0;
    doc.getElementById('scoreCorrect').textContent = '0';
    doc.getElementById('scoreWrong').textContent = '0';
    doc.getElementById('endScreen').className = 'end-screen';
    doc.getElementById('cardStack').style.display = '';
    doc.querySelector('.action-btns').style.display = '';
    buildStack();
  }

  function buildStack() {
    var stack = doc.getElementById('cardStack');
    stack.innerHTML = '';

    for (var i = Math.min(current + 2, deck.length - 1); i >= current; i--) {
      var card = createCardEl(i);
      if (i === current) {
        card.classList.add('top');
        attachDrag(card);
        topCard = card;
      } else if (i === current + 1) {
        card.classList.add('behind-1');
      } else {
        card.classList.add('behind-2');
      }
      stack.appendChild(card);
    }

    doc.getElementById('cardNum').textContent = current + 1;
  }

  function createCardEl(idx) {
    var card = doc.createElement('div');
    card.className = 'swipe-card';

    var num = doc.createElement('div');
    num.className = 'card-number';
    num.textContent = 'Aussage ' + (idx + 1) + ' von ' + CARDS.length;

    var stmt = doc.createElement('div');
    stmt.className = 'card-statement';
    stmt.textContent = deck[idx].statement;

    var vW = doc.createElement('div');
    vW.className = 'vote-overlay vote-wahr';
    vW.textContent = 'WAHR';

    var vF = doc.createElement('div');
    vF.className = 'vote-overlay vote-falsch';
    vF.textContent = 'FALSCH';

    card.appendChild(num);
    card.appendChild(stmt);
    card.appendChild(vW);
    card.appendChild(vF);
    return card;
  }

  function attachDrag(card) {
    card.addEventListener('mousedown', function (e) {
      dragging = true;
      startX = e.clientX;
      card.classList.remove('snapping');
    });
    doc.addEventListener('mousemove', onMove);
    doc.addEventListener('mouseup', onEnd);

    card.addEventListener('touchstart', function (e) {
      dragging = true;
      startX = e.touches[0].clientX;
      card.classList.remove('snapping');
    }, { passive: true });
    doc.addEventListener('touchmove', onMoveTouch, { passive: true });
    doc.addEventListener('touchend', onEndTouch);
  }

  function onMove(e) {
    if (!dragging || !topCard) return;
    currentX = e.clientX - startX;
    updateCardPos();
  }
  function onMoveTouch(e) {
    if (!dragging || !topCard) return;
    currentX = e.touches[0].clientX - startX;
    updateCardPos();
  }

  function updateCardPos() {
    var rotate = currentX / 12;
    var opacity = Math.min(Math.abs(currentX) / 80, 1);
    topCard.style.transform = 'translateX(' + currentX + 'px) rotate(' + rotate + 'deg)';

    var vW = topCard.querySelector('.vote-wahr');
    var vF = topCard.querySelector('.vote-falsch');
    if (currentX > 0) {
      vW.style.opacity = opacity;
      vF.style.opacity = 0;
    } else {
      vF.style.opacity = opacity;
      vW.style.opacity = 0;
    }
  }

  function onEnd() {
    if (!dragging) return;
    dragging = false;
    finishDrag();
    doc.removeEventListener('mousemove', onMove);
    doc.removeEventListener('mouseup', onEnd);
  }
  function onEndTouch() {
    if (!dragging) return;
    dragging = false;
    finishDrag();
    doc.removeEventListener('touchmove', onMoveTouch);
    doc.removeEventListener('touchend', onEndTouch);
  }

  function finishDrag() {
    if (!topCard) return;
    if (Math.abs(currentX) > 80) {
      swipe(currentX > 0 ? 'right' : 'left');
    } else {
      topCard.classList.add('snapping');
      topCard.style.transform = '';
      topCard.querySelector('.vote-wahr').style.opacity = 0;
      topCard.querySelector('.vote-falsch').style.opacity = 0;
    }
    currentX = 0;
  }

  function swipe(dir) {
    if (!topCard || current >= deck.length) return;

    var answered = dir === 'right';
    var correct = answered === deck[current].answer;

    if (correct) scoreCorrect++;
    else scoreWrong++;

    doc.getElementById('scoreCorrect').textContent = scoreCorrect;
    doc.getElementById('scoreWrong').textContent = scoreWrong;

    topCard.querySelector('.vote-wahr').style.opacity = dir === 'right' ? 1 : 0;
    topCard.querySelector('.vote-falsch').style.opacity = dir === 'left' ? 1 : 0;

    var flyClass = dir === 'right' ? 'flying-right' : 'flying-left';
    topCard.classList.add(flyClass);
    topCard.style.transform = 'translateX(' + (dir === 'right' ? '150%' : '-150%') + ') rotate(' + (dir === 'right' ? 25 : -25) + 'deg)';
    topCard.style.opacity = '0';

    showFeedback(correct, deck[current].explanation);

    current++;
    var cardRef = topCard;
    topCard = null;

    setTimeout(function () {
      cardRef.remove();
      if (current < deck.length) {
        buildStack();
      } else {
        showEnd();
      }
    }, 380);
  }

  function showFeedback(correct, text) {
    var toast = doc.getElementById('feedbackToast');
    var label = doc.getElementById('feedbackLabel');
    var msg = doc.getElementById('feedbackText');

    clearTimeout(toastTimer);
    toast.className = 'feedback-toast';
    label.className = 'feedback-label ' + (correct ? 'correct' : 'wrong');
    label.textContent = correct ? 'Richtig!' : 'Falsch!';
    msg.textContent = text;

    requestAnimationFrame(function () {
      toast.classList.add('show', correct ? 'correct' : 'wrong');
    });

    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 2800);
  }

  function showEnd() {
    doc.getElementById('cardStack').style.display = 'none';
    doc.querySelector('.action-btns').style.display = 'none';

    var pct = Math.round(scoreCorrect / CARDS.length * 100);
    doc.getElementById('endScore').innerHTML = scoreCorrect + ' <span>/ ' + CARDS.length + '</span>';
    doc.getElementById('endMsg').textContent =
      pct >= 85 ? 'Ausgezeichnet! Sie kennen ' + topicPhrase + ' sehr gut.' :
      pct >= 60 ? 'Gut gemacht! Einige Punkte nochmals wiederholen.' :
                  'Üben Sie weiter – schauen Sie nochmals ins Lehrmittel.';
    doc.getElementById('endScreen').className = 'end-screen show';
  }

  doc.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') swipe('right');
    if (e.key === 'ArrowLeft') swipe('left');
  });

  win.MTWahrFalsch = {
    init: function (opts) {
      CARDS = opts.cards;
      topicPhrase = opts.topicPhrase;
      startGame();
    },
    swipe: swipe,
    startGame: startGame
  };
})(window, document);
