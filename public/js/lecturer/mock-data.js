/**
 * =============================================================================
 * Shared Utilities
 * =============================================================================
 */

/**
 * Parses a CSV string into an array of objects.
 */
function parseCSV(csvText) {
  const lines = csvText.split("\n").filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(",").map(h => h.trim());
  return lines.slice(1).map(line => parseCSVLine(line, headers));
}

/**
 * Parses a single CSV line using the given headers.
 */
function parseCSVLine(line, headers) {
  const values = [];
  let current = "";
  let insideQuotes = false;

  for (let char of line) {
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());

  return Object.fromEntries(
    headers.map((header, i) => [
      header,
      isNaN(values[i]) ? values[i] || "" : Number(values[i])
    ])
  );
}

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

/**
 * =============================================================================
 * Public: Fetch and Structure Task List from CSV
 * =============================================================================
 */
async function fetchTaskList(csvListPath) {
  try {
    const response = await fetch(csvListPath);
    if (!response.ok) throw new Error("Failed to fetch task list CSV file.");

    const csvText = await response.text();
    const allTasks = parseCSV(csvText);

    const tasksByStepId = allTasks.reduce((map, task) => {
      const step = task.stepId;
      if (!map[step]) map[step] = [];
      map[step].push(task);
      return map;
    }, {});

    return { allTasks, tasksByStepId };

  } catch (error) {
    console.error("Error fetching task list:", error);
    throw error;
  }
}
