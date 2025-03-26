/**
 * =============================================================================
 * Shared Utilities
 * =============================================================================
 */

/**
 * Generates a randomized, progress-weighted completion time.
 */
function generateCompletionTime(progressLevel, totalSessions) {
  const min = 10;
  const max = 300;
  const bias = progressLevel / totalSessions;
  const random = Math.random() * (max - min) + min;
  return Math.max(min, Math.floor((1 - bias) * random + bias * min));
}

/**
 * =============================================================================
 * Public: Generate Mock Session from CSV
 * =============================================================================
 */

/**
 * Generates mock session data and stores it globally.
 */
async function initializeMockSessionData(sessionCount, scenarioPaths, colorMap, subjectId, subjectName) {
  const sessions = [];

  for (let i = 0; i < sessionCount; i++) {
    const progress = Math.ceil(((i + 1) / sessionCount) * 10);

    const session = await fetchCSVAndGenerateMockData(
      progress,
      sessionCount,
      scenarioPaths,
      colorMap,
      subjectId,
      subjectName
    );

    sessions.push(session);

    console.log(`Session ${i + 1}/${sessionCount} initialized`, session);
  }

  console.log("All mock sessions initialized.");
  
  return sessions;
}

async function fetchCSVAndGenerateMockData(progressLevel, totalSessions, scenarioList, scenarioColorMap, subjectId, subjectName) {
  try {
    const selectedScenario = scenarioList[Math.floor(Math.random() * scenarioList.length)];
    const response = await fetch(selectedScenario);
    if (!response.ok) throw new Error("Failed to fetch scenario CSV file.");

    const csvText = await response.text();
    const tasks = parseCSV(csvText);

    const totalMaxScore = tasks.reduce((sum, t) => sum + t.maxScore, 0);
    const targetScore = Math.floor(totalMaxScore * (progressLevel / totalSessions));
    let remainingScore = targetScore;

    tasks.forEach((task, index) => {
      const isLast = index === tasks.length - 1;
      const maxAlloc = Math.min(task.maxScore, remainingScore);
      const score = isLast ? remainingScore : Math.floor(Math.random() * (maxAlloc + 1));
      remainingScore -= score;

      task.obtainedScore = Math.min(score, task.maxScore);
      task.startTime = new Date().toISOString();
      task.completionTime = generateCompletionTime(progressLevel, totalSessions);
    });

    const totalObtainScore = tasks.reduce((sum, t) => sum + t.obtainedScore, 0);
    const fileName = selectedScenario.split("/").pop().replace(".csv", "");
    const scenarioName = fileName.toUpperCase();
    const scenarioId = `SCENARIO${fileName.split("_")[0]}`;
    const color = scenarioColorMap[selectedScenario] || "rgba(128, 128, 128, 0.8)";

    const today = new Date();
    today.setDate(today.getDate() - (totalSessions - progressLevel));
    const date = today.toISOString().split("T")[0];

    return {
      subjectId,
      subjectName,
      scenarioId,
      scenarioName,
      scenarioPath: selectedScenario,
      color,
      date,
      totalMaxScore,
      totalObtainScore,
      tasks
    };

  } catch (error) {
    console.error("Error generating mock session data:", error);
    throw error;
  }
}
