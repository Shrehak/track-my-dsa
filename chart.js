function updateChart() {
  const problems = getProblems();
  const topicMap = {};
  problems.forEach(p => {
    topicMap[p.topic] = (topicMap[p.topic] || 0) + 1;
  });
  const ctx = document.getElementById("chartCanvas").getContext("2d");
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(topicMap),
      datasets: [{
        label: 'Problems Solved',
        data: Object.values(topicMap),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      }]
    }
  });
}
