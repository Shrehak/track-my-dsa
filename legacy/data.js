function getProblems() {
  return JSON.parse(localStorage.getItem("problems")) || [];
}

function saveProblem(problem) {
  const problems = getProblems();
  problems.push(problem);
  localStorage.setItem("problems", JSON.stringify(problems));
}
