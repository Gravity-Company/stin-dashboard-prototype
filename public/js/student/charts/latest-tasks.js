/**
 * ============================================================================
 * Public: Render a list of past session activities
 * ============================================================================
 */
function renderActivityList(activities) {
  const container = document.getElementById("activity-list");
  if (!container) {
    console.warn("Element #activity-list not found.");
    return;
  }

  const sortedActivities = activities
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);
  const cards = sortedActivities.map(renderActivityCard).join("");
  container.innerHTML = cards;
}

/**
 * ============================================================================
 * Helper: Generate an individual activity card's HTML
 * ============================================================================
 */
function renderActivityCard(activity) {
  const { scenarioName, date, tasks, totalObtainScore } = activity;
  const task = tasks[0];
  if (!task || !Array.isArray(tasks)) return "";

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.obtainedScore > 0).length;
  const totalTime = tasks.reduce((sum, task) => sum + task.completionTime, 0);
  const avgTimePerTask = (totalTime / totalTasks).toFixed(2);

  return `
    <div class="flex items-center justify-between p-4 border rounded-lg">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <p class="font-medium">${scenarioName}</p>
          <p class="text-sm text-secondary-500">Date: ${date}</p>
          <p class="text-sm text-secondary-500">Avg Time Per Task: ${avgTimePerTask}s</p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-sm font-medium">Score: ${totalObtainScore}</p>
        <p class="text-sm text-secondary-500">${completedTasks} / ${totalTasks} Tasks Completed</p>
      </div>
    </div>
  `;
}
