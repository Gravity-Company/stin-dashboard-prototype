/**
 * ============================================================================
 * Updates UI elements showing total sessions and estimated remaining days.
 * ============================================================================
 */
function renderRecommendedSessions(sessionData, maxSessions = 10) {
  if (!Array.isArray(sessionData) || sessionData.length === 0) return;

  const totalSessions = sessionData.length;

  const lastSession = sessionData[sessionData.length - 1];
  const lastDate = new Date(lastSession.date);
  const today = new Date();

  const daysSinceLast = Math.ceil((today - lastDate) / (1000 * 60 * 60 * 24));
  const remainingDays = Math.max(0, maxSessions - daysSinceLast);

  const sessionCountEl = document.getElementById("recommendedSessions");
  const remainingDaysEl = document.getElementById("remainingDays");

  if (sessionCountEl) sessionCountEl.textContent = totalSessions;
  if (remainingDaysEl) remainingDaysEl.textContent = remainingDays;
}

/**
 * ============================================================================
 * Renders the focus task list (lowest scoring tasks) for a given template.
 * ============================================================================
 */
function renderFocusTaskList(filteredSessions) {
  const taskListElement = document.getElementById("focusTaskList");
  if (!taskListElement) return;

  const { topWorst } = getTopTasks(filteredSessions);

  const renderedTasks = topWorst.map((task, index) => renderTaskItem(task, index)).join("");
  taskListElement.innerHTML = renderedTasks;
}

/**
 * ============================================================================
 * Helper: Renders a single <li> task item with styled progress info.
 * ============================================================================
 */
function renderTaskItem(task, index) {
  return `
    <li class="flex items-start mb-4">
      <div class="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-lg">
        ${index + 1}
      </div>
      <div class="ml-4">
        <p class="text-sm font-medium">
          <span class="text-red-600 font-bold">${task.taskId}:</span> ${task.taskTitle}
        </p>
        <p class="text-sm text-gray-600">
          <span class="font-bold">Avg Score:</span> ${task.avgScore.toFixed(2)} |
          <span class="font-bold">Avg Time:</span> ${task.avgTime.toFixed(2)}s
        </p>
      </div>
    </li>
  `;
}
