function generatePlan() {
  const mins = parseInt(document.getElementById("studyTime").value);
  let plan = "Try at least ";

  if (mins < 20) plan += "1 Easy problem.";
  else if (mins <= 40) plan += "1 Easy + 1 Medium.";
  else plan += "2 Medium or 1 Hard + 1 Easy.";

  document.getElementById("planOutput").innerText = plan;
}
