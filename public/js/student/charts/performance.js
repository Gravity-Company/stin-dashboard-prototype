// Global chart instance reference
let performanceChartInstance = null;

/**
 * ============================================================================
 * Public: Render Line Chart for Performance Progress
 * ============================================================================
 */
function renderPerformanceChart(sessionData) {
  if (!Array.isArray(sessionData) || sessionData.length === 0) return;

  const chartData = getPerformanceChartData(sessionData);
  const chartConfig = getPerformanceChartConfig(chartData, sessionData);

  // Destroy previous chart if it exists
  if (performanceChartInstance) {
    performanceChartInstance.destroy();
  }

  const ctx = document.getElementById("performanceChart").getContext("2d");
  performanceChartInstance = new Chart(ctx, chartConfig);
}

/**
 * ============================================================================
 * Helper: Build chart data from session list
 * ============================================================================
 */
function getPerformanceChartData(sessions) {
  return {
    labels: sessions.map((_, i) => `Session ${i + 1}`),
    datasets: [
      {
        label: "Progress (%)",
        data: sessions.map(session => session.totalObtainScore),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: sessions.map(session => session.color),
      },
    ],
  };
}

/**
 * ============================================================================
 * Helper: Configure line chart appearance and behavior
 * ============================================================================
 */
function getPerformanceChartConfig(data, sessions) {
  return {
    type: "line",
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        tooltip: {
          callbacks: {
            title: (items) => items[0].label,
            label: (item) => {
              const session = sessions[item.dataIndex];
              return `Scenario: ${session.scenarioTitle} | Progress: ${item.raw}%`;
            },
            labelPointStyle: (item) => ({
              pointStyle: "circle",
              backgroundColor: data.datasets[0].pointBackgroundColor[item.dataIndex],
            }),
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
          max: 100,
          title: {
            display: true,
            text: "Progress (%)",
            font: { size: 14 },
          },
        },
      },
      animation: {
        duration: 1000,
        easing: "easeInOutSine",
      },
    },
  };
}
