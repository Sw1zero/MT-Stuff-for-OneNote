/* assets/quiz-engine.js – MT-Lerntools gemeinsame Multiple-Choice-Quiz-Engine
   ---------------------------------------------------------------
   Fortschrittsbalken, Antwort-Feedback, Score-Tracking und Endscreen.
   Ersetzt die duplizierte Quiz-Logik in den einzelnen quiz-*.html-Dateien.
   Erwartet folgendes Markup mit diesen IDs: progressText, progressBar,
   quizCard, questionBadge, questionText, answersContainer, feedback,
   nextWrap, nextBtn, endScreen, scoreNumber, scoreTotal, endMessage, endSub.

   API:
     MTQuiz.init({ questions, subMessages })
       questions: Array von { badge, question, answers[] (max. 4), correct, explanation }
       subMessages (optional): { excellent, retry } – Untertitel im Endscreen
         bei 100% bzw. < 50%. "good" (>=75%) und "ok" (>=50%) sind für alle
         Quizzes gleich und müssen nicht übergeben werden.

     MTQuiz.selectAnswer(i) / MTQuiz.nextQuestion() / MTQuiz.restartQuiz()
       werden aus dem Markup heraus aufgerufen (Antwort-Buttons, "Weiter →",
       "Nochmals versuchen").
   --------------------------------------------------------------- */
(function (win, doc) {
  var LETTERS = ["A", "B", "C", "D"];
  var DEFAULT_SUB = {
    excellent: "Alle Fragen richtig beantwortet.",
    good: "Fast alle Fragen richtig. Wiederholen Sie die markierten Themen kurz.",
    ok: "Mehr als die Hälfte richtig. Schauen Sie die falschen Antworten nochmals an.",
    retry: "Wiederholen Sie den Stoff und versuchen Sie es nochmals."
  };

  var QUESTIONS = [];
  var SUB = DEFAULT_SUB;
  var currentIndex = 0, score = 0, answered = false, order = [];

  function $(id) { return doc.getElementById(id); }

  function shuffle(arr) {
    arr = arr.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function startQuiz() {
    order = shuffle(QUESTIONS.map(function (_, i) { return i; }));
    currentIndex = 0;
    score = 0;
    $("endScreen").style.display = "none";
    $("quizCard").style.display = "block";
    showQuestion();
  }

  function showQuestion() {
    answered = false;
    var q = QUESTIONS[order[currentIndex]];
    var total = QUESTIONS.length;

    $("progressText").textContent = "Frage " + (currentIndex + 1) + " von " + total;
    $("progressBar").style.width = (((currentIndex + 1) / total) * 100) + "%";

    $("questionBadge").textContent = q.badge;
    $("questionText").textContent = q.question;

    $("answersContainer").innerHTML = q.answers.map(function (a, i) {
      return '<button class="answer-btn" onclick="MTQuiz.selectAnswer(' + i + ')" id="ans-' + i + '">' +
        '<span class="letter">' + LETTERS[i] + '</span><span>' + a + '</span></button>';
    }).join("");

    var fb = $("feedback");
    fb.className = "feedback";
    fb.textContent = "";

    $("nextWrap").style.display = "none";
    $("nextBtn").textContent = currentIndex < total - 1 ? "Weiter →" : "Ergebnis anzeigen";
  }

  function selectAnswer(chosen) {
    if (answered) return;
    answered = true;

    var q = QUESTIONS[order[currentIndex]];
    var correct = q.correct;
    var isCorrect = chosen === correct;
    if (isCorrect) score++;

    for (var i = 0; i < q.answers.length; i++) {
      var btn = $("ans-" + i);
      btn.disabled = true;
      if (i === correct && i === chosen) btn.classList.add("correct");
      else if (i === chosen && !isCorrect) btn.classList.add("wrong");
      else if (i === correct) btn.classList.add("reveal");
    }

    var fb = $("feedback");
    if (isCorrect) {
      fb.className = "feedback correct";
      fb.innerHTML = '<span class="feedback-icon">&#10003;</span><strong>Richtig!</strong> ' + q.explanation;
    } else {
      fb.className = "feedback wrong";
      fb.innerHTML = '<span class="feedback-icon">&#10007;</span><strong>Nicht ganz.</strong> ' + q.explanation;
    }

    $("nextWrap").style.display = "flex";
  }

  function nextQuestion() {
    currentIndex++;
    if (currentIndex >= QUESTIONS.length) showEndScreen();
    else showQuestion();
  }

  function showEndScreen() {
    $("quizCard").style.display = "none";
    $("nextWrap").style.display = "none";
    $("progressText").textContent = "";
    $("progressBar").style.width = "100%";

    var total = QUESTIONS.length;
    var pct = Math.round((score / total) * 100);

    $("scoreNumber").textContent = score;
    $("scoreTotal").textContent = "von " + total;

    var msg, sub;
    if (pct === 100) { msg = "Ausgezeichnet!"; sub = SUB.excellent; }
    else if (pct >= 75) { msg = "Sehr gut!"; sub = SUB.good; }
    else if (pct >= 50) { msg = "Gut gemacht."; sub = SUB.ok; }
    else { msg = "Weiter üben."; sub = SUB.retry; }

    $("endMessage").textContent = msg;
    $("endSub").textContent = sub;
    $("endScreen").style.display = "block";
  }

  function restartQuiz() { startQuiz(); }

  win.MTQuiz = {
    init: function (config) {
      QUESTIONS = config.questions;
      SUB = {
        excellent: (config.subMessages && config.subMessages.excellent) || DEFAULT_SUB.excellent,
        good: DEFAULT_SUB.good,
        ok: DEFAULT_SUB.ok,
        retry: (config.subMessages && config.subMessages.retry) || DEFAULT_SUB.retry
      };
      startQuiz();
    },
    selectAnswer: selectAnswer,
    nextQuestion: nextQuestion,
    restartQuiz: restartQuiz
  };
})(window, document);
