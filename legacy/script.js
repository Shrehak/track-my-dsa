document.getElementById("logForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const problem = {
    date: document.getElementById("date").value || new Date().toISOString().slice(0, 10),
    topic: document.getElementById("topic").value,
    difficulty: document.getElementById("difficulty").value,
    name: document.getElementById("problem").value,
    notes: document.getElementById("notes").value
  };
  saveProblem(problem);
  calculateXP();
  updateStreak();
  updateReflections();
  updateChart();
  this.reset();
});

window.onload = function () {
  calculateXP();
  updateStreak();
  updateReflections();
  updateChart();
};

function updateStreak() {
  const streakDiv = document.getElementById("streakDisplay");
  const problems = getProblems();
  const today = new Date();
  streakDiv.innerHTML = "";

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const didSolve = problems.some(p => p.date === dateStr);
    const mark = document.createElement("span");
    mark.textContent = didSolve ? "✅" : "❌";
    mark.style.marginRight = "10px";
    streakDiv.appendChild(mark);
  }
}

function updateReflections() {
  const reflections = getProblems().slice(-7).reverse();
  const ul = document.getElementById("reflectionList");
  ul.innerHTML = "";
  reflections.forEach(p => {
    const li = document.createElement("li");
    li.innerText = `${p.name} (${p.difficulty}) - ${p.notes}`;
    ul.appendChild(li);
  });
}

// Toggle dark mode when button is clicked
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});
