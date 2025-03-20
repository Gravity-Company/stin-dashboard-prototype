/**
 * ============================================================================
 * Calculates top-performing and lowest-performing tasks from session data.
 * ============================================================================
 */
function getTopTasks(data, topCount = 5) {
  const metricsByTask = aggregateTaskMetrics(data);

  const rankedTasks = Object.values(metricsByTask).map(task => ({
    ...task,
    avgScore: task.totalScore / task.count,
    avgTime: task.totalTime / task.count,
  }));

  return {
    topBest: getTopBestTasks(rankedTasks, topCount),
    topWorst: getTopWorstTasks(rankedTasks, topCount),
  };
}

/**
 * ============================================================================
 * Aggregates raw score/time data for each unique task.
 * ============================================================================
 */
function aggregateTaskMetrics(data) {
  const metrics = {};

  for (const session of data) {
    const tasks = session.tasks || [];

    for (const task of tasks) {
      const { taskId, taskTitle, obtainedScore, completionTime } = task;

      if (!metrics[taskId]) {
        metrics[taskId] = {
          taskId,
          taskTitle,
          totalScore: 0,
          totalTime: 0,
          count: 0,
        };
      }

      metrics[taskId].totalScore += obtainedScore;
      metrics[taskId].totalTime += completionTime;
      metrics[taskId].count += 1;
    }
  }

  return metrics;
}

/**
 * ============================================================================
 * Returns top best tasks — high score, low time.
 * ============================================================================
 */
function getTopBestTasks(tasks, limit) {
  return tasks
    .slice() // avoid mutating original
    .sort((a, b) =>
      b.avgScore === a.avgScore
        ? a.avgTime - b.avgTime
        : b.avgScore - a.avgScore
    )
    .slice(0, limit);
}

/**
 * ============================================================================
 * Returns top worst tasks — low score, high time.
 * ============================================================================
 */
function getTopWorstTasks(tasks, limit) {
  return tasks
    .slice()
    .sort((a, b) =>
      a.avgScore === b.avgScore
        ? b.avgTime - a.avgTime
        : a.avgScore - b.avgScore
    )
    .slice(0, limit);
}
