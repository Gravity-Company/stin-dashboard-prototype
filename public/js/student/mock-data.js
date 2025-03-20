/**
 * =============================================================================
 * SECTION 1: CSV Parsing
 * =============================================================================
 */

/**
 * Parses CSV text into an array of JSON objects.
 * Handles quoted values and commas within strings.
 */
function parseCSV(csvText) {
  const lines = csvText.split("\n").filter(line => line.trim());

  if (lines.length === 0) return [];

  const headers = lines[0].split(",").map(header => header.trim());

  return lines.slice(1).map(line => {
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
      headers.map((header, index) => [
        header,
        isNaN(values[index]) ? values[index] || "" : Number(values[index])
      ])
    );
  });
}

/**
 * =============================================================================
 * SECTION 2: Mock Score Distribution
 * =============================================================================
 */

/**
 * Distributes a total score across tasks, respecting each task's maxScore.
 * Ensures the last task gets the remaining score.
 */
function mockDistributeScores(totalScore, tasks) {
  let remaining = totalScore;

  return tasks.map((task, index) => {
    const isLast = index === tasks.length - 1;
    const maxAllowed = Math.min(task.maxScore, remaining);

    const score = isLast
      ? remaining
      : Math.floor(Math.random() * (maxAllowed + 1));

    remaining -= score;

    return Math.min(score, task.maxScore);
  });
}

/**
 * =============================================================================
 * SECTION 3: Time Generation
 * =============================================================================
 */

/**
 * Generates a randomized completion time with slight bias toward progress.
 */
function mockCompletionTime(progressLevel, totalSessions) {
  const minTime = 10;
  const maxTime = 300;
  const bias = progressLevel / totalSessions;

  const baseTime = Math.random() * (maxTime - minTime) + minTime;
  const biasedTime = (1 - bias) * baseTime + bias * minTime;

  return Math.max(minTime, Math.floor(biasedTime));
}

/**
 * =============================================================================
 * SECTION 4: Mock Data Generation
 * =============================================================================
 */

/**
 * Generates mock data for a student scenario based on CSV input.
 * Most important logic to generate data.
 */
function generateMockDataForStudent(csvData, progressLevel, totalSessions, scenarioId, scenarioName, subjectId, subjectName) {
   /** !!! distributedScores === mock scores with progress !!! */ 

  const tasks = csvData;

  const totalMaxScore = tasks.reduce((sum, task) => sum + task.maxScore, 0);
  const targetScore = Math.floor(totalMaxScore * (progressLevel / totalSessions));
  const distributedScores = mockDistributeScores(targetScore, tasks);

  tasks.forEach((task, index) => {
    task.obtainedScore = distributedScores[index];
    task.startTime = new Date().toISOString();
    task.completionTime = mockCompletionTime(progressLevel, totalSessions);
  });

  const totalObtainScore = tasks.reduce((sum, task) => sum + task.obtainedScore, 0);

  return {
    subjectId,
    subjectName,
    scenarioId,
    scenarioName,
    totalMaxScore,
    totalObtainScore,
    tasks,
  };
}

/**
 * =============================================================================
 * SECTION 5: Fetch and Combine CSV with Mock Data
 * =============================================================================
 */

/**
 * Fetches a scenario CSV, parses it, and creates a mock session object.
 */
async function fetchCSVAndGenerateMockData(progressLevel, totalSessions, scenarioList, scenarioColorMap, subjectId, subjectName) {
  try {
    const randomScenario = scenarioList[Math.floor(Math.random() * scenarioList.length)];
    const response = await fetch(randomScenario);

    if (!response.ok) {
      throw new Error("Failed to fetch scenario CSV file.");
    }

    const csvText = await response.text();
    const csvData = parseCSV(csvText);

    const scenarioId = `SCENARIO_${randomScenario
      .split("/")
      .pop()
      .replace(".csv", "")
      .split("_")
      .shift()
    }`;

    const scenarioName = randomScenario
      .split("/")
      .pop()
      .replace(".csv", "")
      .toUpperCase();

    const mockData = generateMockDataForStudent(
      csvData,
      progressLevel,
      totalSessions,
      scenarioId,
      scenarioName,
      subjectId,
      subjectName
    );

    mockData.color = scenarioColorMap[randomScenario] || "rgba(128, 128, 128, 0.8)";
    mockData.scenarioPath = randomScenario;

    const today = new Date();
    const sessionDate = new Date(today);
    sessionDate.setDate(today.getDate() - (totalSessions - progressLevel));

    mockData.date = sessionDate.toISOString().split("T")[0];

    return mockData;
  } catch (error) {
    console.error("Error generating mock session data:", error);
    throw error;
  }
}

/**
 * =============================================================================
 * SECTION 6: Fetch Task List
 * =============================================================================
 */

/**
 * Fetches and parses the main task list CSV, returning structured tasks.
 */
async function fetchTaskList(csvListPath) {
  try {
    const response = await fetch(csvListPath);
    if (!response.ok) {
      throw new Error("Failed to fetch the task list CSV file.");
    }

    const csvText = await response.text();
    const taskList = parseCSV(csvText);

    const tasksByStepId = taskList.reduce((grouped, task) => {
      if (!grouped[task.stepId]) grouped[task.stepId] = [];
      grouped[task.stepId].push(task);
      return grouped;
    }, {});

    return { allTasks: taskList, tasksByStepId };
  } catch (error) {
    console.error("Error fetching task list:", error);
    throw error;
  }
}
