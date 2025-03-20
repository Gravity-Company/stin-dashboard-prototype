// Global chart reference
let progressChartInstance = null;

/**
 * ============================================================================
 * Renders the progress doughnut chart showing how many tasks have been completed.
 * ============================================================================
 */

function renderProgressChart(allTasks) {
  if (!Array.isArray(allTasks) || allTasks.length === 0) return;

  const totalTasks = new Set(allTasks.map(task => task.taskId));
  const completedTasks = new Set();

  // Collect task IDs from sessions with score > 0
  for (const session of mockDataSessions) {
    for (const task of session.tasks) {
      if (task.obtainedScore > 0) {
        completedTasks.add(task.taskId);
      }
    }
  }

  const completedCount = Array.from(completedTasks).filter(id => totalTasks.has(id)).length;
  const totalCount = totalTasks.size;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Destroy old chart if it exists
  if (progressChartInstance) {
    progressChartInstance.destroy();
  }

  // Draw doughnut chart
  const ctx = document.getElementById("progressChart").getContext("2d");
  progressChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      datasets: [{
        data: [progress, 100 - progress],
        backgroundColor: ["rgba(75, 192, 192, 1)", "#EDEDED"],
        borderWidth: 0
      }]
    },
    options: {
      cutout: "80%",
      responsive: true,
      maintainAspectRatio: true,
      animation: {
        duration: 1200,
        easing: "easeInOutSine"
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) =>
              context.raw === progress
                ? `Progress: ${progress}%`
                : `Remaining: ${100 - progress}%`
          }
        }
      }
    }
  });

  // Update the progress text below the chart
  document.getElementById("progressText").innerHTML = `
    <span class="text-4xl font-bold">${progress}%</span>
    <p class="text-sm text-gray-600">Completed: ${completedCount} / ${totalCount} tasks</p>
  `;
}
