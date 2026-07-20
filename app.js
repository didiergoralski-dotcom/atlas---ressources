// ---------------------------------------------------------------------------
// ATLAS Auto-École — Boîtier Code (PWA autonome, sans contenu de questions)
// ---------------------------------------------------------------------------

const LETTERS = ["A", "B", "C", "D"];
const SETTINGS_KEY = "atlas-code:settings";
const SESSION_KEY = "atlas-code:session";

let settings = loadSettings();
let session = loadSession();

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { numQuestions: 10 };
}
function saveSettings() { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}
function saveSession(next) {
  session = next;
  if (next) localStorage.setItem(SESSION_KEY, JSON.stringify(next));
  else localStorage.removeItem(SESSION_KEY);
  refreshResumeButton();
}

// ------------------------- Navigation -------------------------
const screens = ["home", "options", "aide", "quiz", "results"];
function showScreen(name) {
  screens.forEach((s) => {
    document.getElementById("screen-" + s).classList.toggle("hidden", s !== name);
  });
}
document.querySelectorAll("[data-back]").forEach((btn) => {
  btn.addEventListener("click", () => showScreen(btn.dataset.back));
});

function refreshResumeButton() {
  document.getElementById("btn-resume").disabled = !session;
}

// ------------------------- Home -------------------------
document.getElementById("btn-new").addEventListener("click", () => {
  saveSession({ total: settings.numQuestions, index: 0, marks: [], selectedLetters: [], showModal: false });
  renderQuiz();
  showScreen("quiz");
});
document.getElementById("btn-resume").addEventListener("click", () => {
  if (session) { renderQuiz(); showScreen("quiz"); }
});
document.getElementById("btn-options").addEventListener("click", () => { renderOptions(); showScreen("options"); });
document.getElementById("btn-aide").addEventListener("click", () => showScreen("aide"));

// ------------------------- Options -------------------------
function renderOptions() {
  document.querySelectorAll('input[name="numq"]').forEach((r) => {
    r.checked = parseInt(r.value, 10) === settings.numQuestions;
  });
}
document.querySelectorAll('input[name="numq"]').forEach((r) => {
  r.addEventListener("change", () => {
    settings.numQuestions = parseInt(r.value, 10);
    saveSettings();
  });
});

// ------------------------- Quiz -------------------------
function renderQuiz() {
  if (!session) return;
  if (!session.selectedLetters) session.selectedLetters = [];
  document.getElementById("progress-fill").style.width = (session.index / session.total) * 100 + "%";
  document.getElementById("q-num").textContent = String(session.index + 1).padStart(2, "0");
  document.getElementById("q-letter").textContent = session.selectedLetters.join(",");
  document.getElementById("q-counter").textContent = `Question ${session.index + 1} / ${session.total}`;

  const markEl = document.getElementById("q-mark");
  const currentMark = session.marks[session.index];
  if (currentMark) {
    markEl.classList.remove("hidden", "ok", "ko");
    markEl.classList.add(currentMark.correct ? "ok" : "ko");
    markEl.textContent = currentMark.correct ? "✓" : "✕";
  } else {
    markEl.classList.add("hidden");
  }

  // answer buttons
  const answersEl = document.getElementById("answers");
  answersEl.innerHTML = "";
  LETTERS.forEach((letter) => {
    const b = document.createElement("button");
    b.className = "answer-btn" + (session.selectedLetters.includes(letter) ? " selected" : "");
    b.textContent = letter;
    b.addEventListener("click", () => toggleLetter(letter));
    answersEl.appendChild(b);
  });

  document.getElementById("btn-correction").disabled = session.selectedLetters.length === 0;
  document.getElementById("btn-valider").disabled = !currentMark;

  document.getElementById("modal-overlay").classList.toggle("hidden", !session.showModal);
  if (session.showModal) {
    document.getElementById("modal-q-title").textContent = `Question ${session.index + 1}`;
    document.getElementById("modal-letter").textContent = session.selectedLetters.join(", ");
  }
}

// Sélection multiple : chaque tap ajoute/retire la lettre. Utile car
// certaines questions du code ont plusieurs bonnes réponses.
function toggleLetter(letter) {
  if (session.showModal) return;
  const i = session.selectedLetters.indexOf(letter);
  if (i === -1) session.selectedLetters.push(letter);
  else session.selectedLetters.splice(i, 1);
  session.selectedLetters.sort();
  saveSession(session);
  renderQuiz();
}

document.getElementById("btn-correction").addEventListener("click", () => {
  if (session.selectedLetters.length === 0) return;
  session.showModal = true;
  saveSession(session);
  renderQuiz();
});

function mark(isCorrect) {
  session.marks[session.index] = { letters: [...session.selectedLetters], correct: isCorrect };
  session.showModal = false;
  saveSession(session);
  renderQuiz();
}
document.getElementById("btn-correct").addEventListener("click", () => mark(true));
document.getElementById("btn-incorrect").addEventListener("click", () => mark(false));

document.getElementById("btn-valider").addEventListener("click", () => {
  if (!session.marks[session.index]) return;
  const isLast = session.index + 1 >= session.total;
  if (isLast) {
    const finished = { total: session.total, marks: session.marks };
    saveSession(null);
    renderResults(finished);
    showScreen("results");
  } else {
    session.index += 1;
    session.selectedLetters = [];
    session.showModal = false;
    saveSession(session);
    renderQuiz();
  }
});

// ------------------------- Results -------------------------
function renderResults(run) {
  const total = run.total;
  const correctCount = run.marks.filter((m) => m && m.correct).length;
  const pct = Math.round((correctCount / total) * 100);
  const passed = pct >= 90;

  document.getElementById("res-score").textContent = `${correctCount}/${total}`;
  document.getElementById("res-score").style.color = passed ? "#2F9E44" : "#E03131";
  document.getElementById("res-pct").textContent = `${pct}% de bonnes réponses`;
  const badge = document.getElementById("res-badge");
  badge.textContent = passed ? "Admissible" : "À retravailler";
  badge.className = "badge " + (passed ? "pass" : "fail");

  const grid = document.getElementById("res-grid");
  grid.innerHTML = "";
  run.marks.forEach((m, i) => {
    const cell = document.createElement("div");
    cell.className = "grid-cell";
    const n = document.createElement("span");
    n.className = "n";
    n.textContent = i + 1;
    const mark = document.createElement("span");
    mark.textContent = m ? (m.correct ? "✓" : "✕") : "—";
    mark.style.color = m ? (m.correct ? "#2F9E44" : "#E03131") : "#5C6B7A";
    mark.style.fontWeight = "700";
    cell.appendChild(n);
    cell.appendChild(mark);
    grid.appendChild(cell);
  });
}
document.getElementById("btn-back-home").addEventListener("click", () => showScreen("home"));

// ------------------------- Init -------------------------
refreshResumeButton();
showScreen("home");

// ------------------------- PWA: service worker + install prompt -------------------------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}

let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById("install-banner").classList.remove("hidden");
});
document.getElementById("install-btn").addEventListener("click", async () => {
  document.getElementById("install-banner").classList.add("hidden");
  if (deferredPrompt) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  }
});
document.getElementById("install-close").addEventListener("click", () => {
  document.getElementById("install-banner").classList.add("hidden");
});
