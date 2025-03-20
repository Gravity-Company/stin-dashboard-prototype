/**
 * ============================================================================
 * Public: Render Horizontal Bar Chart of Top Best & Worst Tasks
 * ============================================================================
 */
function renderTopTasksChart(sessionsData) {
  const { topBest, topWorst } = getTopTasks(sessionsData);
  const chartData = getTopTasksChartData(topBest, topWorst);
  const chartConfig = getTopTasksChartConfig(chartData, topBest, topWorst);

  const canvas = document.getElementById("topTasksChart");
  if (!canvas) {
    console.warn("Chart element #topTasksChart not found.");
    return;
  }

  const ctx = canvas.getContext("2d");

  if (window.topTasksChartInstance) {
    window.topTasksChartInstance.destroy();
  }

  window.topTasksChartInstance = new Chart(ctx, chartConfig);
}

/**
 * ============================================================================
 * Helper: Build chart data (labels, values, colors)
 * ============================================================================
 */
function getTopTasksChartData(topBest, topWorst) {
  const bestLabels = topBest.map(t => `${t.taskId}: ${t.taskTitle}`);
  const worstLabels = topWorst.map(t => `${t.taskId}: ${t.taskTitle}`);

  const labels = [...bestLabels, ...worstLabels];
  const scores = [...topBest, ...topWorst].map(t => t.avgScore);

  const colors = [
    ...Array(topBest.length).fill("rgba(75, 192, 192, 0.8)"),  // Blue for Best
    ...Array(topWorst.length).fill("rgba(255, 99, 132, 0.8)"),   // Red for Worst
  ];

  return {
    labels,
    scores,
    colors,
  };
}

/**
 * ============================================================================
 * Helper: Prepare chart configuration and tooltips
 * ============================================================================
 */
function getTopTasksChartConfig(data, topBest, topWorst) {
  const allTasks = [...topBest, ...topWorst];

  return {
    type: "bar",
    data: {
      labels: data.labels,
      datasets: [{
        label: "Top Tasks (Best & Worst)",
        data: data.scores,
        backgroundColor: data.colors,
        borderColor: data.colors,
        borderWidth: 1,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
      }],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
        easing: "easeInOutSine",
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => {
              const index = items[0].dataIndex;
              return `Task: ${allTasks[index].taskTitle}`;
            },
            label: (item) => {
              const task = allTasks[item.dataIndex];
              return `Avg Time: ${task.avgTime.toFixed(2)}s | Avg Score: ${task.avgScore}`;
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Average Score",
            font: { size: 14 },
          },
        },
        y: {
          title: { display: false },
          ticks: {
            font: { size: 12 },
          },
        },
      },
    },
  };
}
