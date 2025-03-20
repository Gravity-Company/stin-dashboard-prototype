/**
 * ============================================================================
 * Public: Renders the Time Improvement Line Chart (completion time per session)
 * ============================================================================
 */
function renderTimeImprovementChart(filteredSessions, scenarioColors) {
  if (!Array.isArray(filteredSessions) || filteredSessions.length === 0) return;

  const chartData = buildTimeImprovementChartData(filteredSessions, scenarioColors);
  const chartConfig = buildTimeImprovementChartConfig(chartData, filteredSessions);

  const canvas = document.getElementById("timeImprovementChart");
  if (!canvas) {
    console.warn("Chart canvas #timeImprovementChart not found.");
    return;
  }

  const ctx = canvas.getContext("2d");

  if (window.timeImprovementChartInstance) {
    window.timeImprovementChartInstance.destroy();
  }

  window.timeImprovementChartInstance = new Chart(ctx, chartConfig);
}

/**
 * ============================================================================
 * Helper: Prepares line chart data (labels, points, colors)
 * ============================================================================
 */
function buildTimeImprovementChartData(sessions, scenarioColors) {
  const labels = sessions.map((_, i) => `Session ${i + 1}`);

  const timeData = sessions.map(session =>
    session.tasks.reduce((sum, task) => sum + task.completionTime, 0) || 0
  );
  
  const pointColors = sessions.map(
    session => scenarioColors[session.scenarioPath] || "#9CA3AF"
  );

  return {
    labels,
    datasets: [
      {
        label: "Time Used (Seconds)",
        data: timeData,
        borderColor: "rgba(237, 85, 59, 1)",
        backgroundColor: "rgba(237, 85, 59, 0.2)",
        tension: 0.4,
        fill: true,
        borderDash: [5, 5],
        pointRadius: 5,
        pointBackgroundColor: pointColors,
      },
    ],
  };
}

/**
 * ============================================================================
 * Helper: Returns config object for time improvement chart
 * ============================================================================
 */
function buildTimeImprovementChartConfig(data, sessions) {
  return {
    type: "line",
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
        easing: "easeInOutSine",
      },
      plugins: {
        legend: { position: "top" },
        tooltip: {
          callbacks: {
            title: items => items[0].label,
            label: item => {
              const session = sessions[item.dataIndex];
              return `Template: ${session.template} | Time: ${item.raw} seconds`;
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Session",
            font: { size: 14 },
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Time (Seconds)",
            font: { size: 14 },
          },
        },
      },
    },
  };
}
