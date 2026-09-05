function calculateXP() {
  const problems = getProblems();
  let xp = 0;
  problems.forEach(p => {
    if (p.difficulty === "Easy") xp += 10;
    else if (p.difficulty === "Medium") xp += 20;
    else if (p.difficulty === "Hard") xp += 30;
  });
  const level = Math.floor(xp / 100);
  document.getElementById("xpStats").innerText = `XP: ${xp} | Level: ${level}`;
}
