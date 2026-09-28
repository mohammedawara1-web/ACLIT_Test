// ACLIT English placement test engine.
// Each test link (1–10) sets window.TEST_NUMBER; the number seeds which
// questions are picked and how options are ordered, so every link is a
// different version of the same-difficulty test.
(function () {
  var LEVELS = ["A1", "A2", "B1", "B2", "C1"];
  var PER_LEVEL = 6;
  var RESULTS = [
    { min: 0,  level: "A1", name: "Beginner" },
    { min: 8,  level: "A2", name: "Elementary" },
    { min: 15, level: "B1", name: "Intermediate" },
    { min: 21, level: "B2", name: "Upper-Intermediate" },
    { min: 26, level: "C1", name: "Advanced" }
  ];

  var testNo = window.TEST_NUMBER;
  var rand = mulberry32(testNo * 7919);
  var questions = [];

  LEVELS.forEach(function (lvl) {
    shuffle(window.QUESTION_BANK[lvl].slice()).slice(0, PER_LEVEL).forEach(function (item) {
      var options = item.o.map(function (text, i) { return { text: text, correct: i === 0 }; });
      questions.push({ q: item.q, options: shuffle(options) });
    });
  });

  var $ = function (id) { return document.getElementById(id); };
  $("test-no").textContent = testNo;
  $("q-total").textContent = questions.length;

  $("start-form").addEventListener("submit", function (e) {
    e.preventDefault();
    $("intro").hidden = true;
    $("quiz").hidden = false;
    renderQuestions();
    window.scrollTo(0, 0);
  });

  function renderQuestions() {
    var list = $("questions");
    questions.forEach(function (item, qi) {
      var fs = document.createElement("fieldset");
      fs.className = "question";
      var lg = document.createElement("legend");
      lg.innerHTML = "<span class='num'>" + (qi + 1) + "</span>";
      lg.appendChild(document.createTextNode(item.q));
      fs.appendChild(lg);
      item.options.forEach(function (opt, oi) {
        var label = document.createElement("label");
        var input = document.createElement("input");
        input.type = "radio";
        input.name = "q" + qi;
        input.value = oi;
        input.addEventListener("change", updateProgress);
        label.appendChild(input);
        label.appendChild(document.createTextNode(" " + opt.text));
        fs.appendChild(label);
      });
      list.appendChild(fs);
    });
  }

  function updateProgress() {
    var answered = document.querySelectorAll("#questions input:checked").length;
    $("answered").textContent = answered;
    $("bar").style.width = (answered / questions.length * 100) + "%";
  }

  $("quiz").addEventListener("submit", function (e) {
    e.preventDefault();
    var answered = document.querySelectorAll("#questions input:checked").length;
    if (answered < questions.length &&
        !confirm("You answered " + answered + " of " + questions.length + " questions. Submit anyway?")) {
      return;
    }
    var score = 0;
    questions.forEach(function (item, qi) {
      var picked = document.querySelector("input[name=q" + qi + "]:checked");
      if (picked && item.options[picked.value].correct) score++;
    });
    var result = RESULTS[0];
    RESULTS.forEach(function (r) { if (score >= r.min) result = r; });

    var name = $("student-name").value.trim();
    var phone = $("student-phone").value.trim();
    $("r-name").textContent = name;
    $("r-score").textContent = score + " / " + questions.length;
    $("r-level").textContent = result.level;
    $("r-level-name").textContent = result.name;
    $("r-test").textContent = testNo;
    $("r-date").textContent = new Date().toLocaleString("en-GB");

    var summary = "ACLIT Placement Test #" + testNo +
      "\nName: " + name + (phone ? "\nPhone: " + phone : "") +
      "\nScore: " + score + "/" + questions.length +
      "\nLevel: " + result.level + " (" + result.name + ")";
    $("whatsapp").href = "https://wa.me/?text=" + encodeURIComponent(summary);

    $("quiz").hidden = true;
    $("result").hidden = false;
    window.scrollTo(0, 0);
  });

  $("print").addEventListener("click", function () { window.print(); });

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
})();
