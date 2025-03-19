// Function to parse CSV into JSON
const parseCSV = (csvText) => {
  const lines = csvText.split("\n").filter(line => line.trim());
  
  if (lines.length === 0) return [];

  // ตรวจสอบ header
  const headers = lines[0].split(",").map(header => header.trim());

  return lines.slice(1).map(line => {
    // รองรับ `""` ครอบข้อความ และ `,` ในข้อความ
    const values = [];
    let current = "";
    let insideQuotes = false;

    for (let char of line) {
      if (char === '"' && insideQuotes) {
        insideQuotes = false;
      } else if (char === '"' && !insideQuotes) {
        insideQuotes = true;
      } else if (char === "," && !insideQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    // สร้าง Object ตาม header
    return Object.fromEntries(
      headers.map((header, index) => [
        header,
        isNaN(values[index]) ? values[index] || "" : Number(values[index])
      ])
    );
  });
};

// Function to mock distribute scores to tasks
const mockDistributeScores = (totalScore, tasks) => {
  let remainingScore = totalScore;
  return tasks.map((task, index) => {
    const maxAllocation = Math.min(task.maxScore, remainingScore);
    const isLastTask = index === tasks.length - 1;
    const score = isLastTask
      ? remainingScore
      : Math.floor(Math.random() * (maxAllocation + 1));
    remainingScore -= score;
    return Math.min(score, task.maxScore); // Ensure score doesn't exceed maxScore
  });
};

// Function to generate a random completion time
const randomCompletionTime = (progressLevel, totalSessions) => {
  const maxTime = 300;
  const minTime = 10;
  const bias = progressLevel / totalSessions;
  return Math.max(
    minTime,
    Math.floor((1 - bias) * (Math.random() * (maxTime - minTime) + minTime) + bias * minTime)
  );
};

// Mock data generation function
const generateMockDataForStudent = (csvData, progressLevel, totalSessions, scenarioTitle, subjectId, subjectName) => {
  const tasks = csvData.map((row, index) => ({
    taskId: row.taskId || `T${index + 1}`,
    taskCode: row.taskCode || `TASK${index + 1}`,
    taskTitle: row.taskTitle || "Task Title",
    maxScore: row.maxScore || 1,
    obtainedScore: 0,
    // 1. mock completion time
    completionTime: randomCompletionTime(progressLevel, totalSessions),
  }));

  const totalMaxScore = tasks.reduce((sum, task) => sum + task.maxScore, 0);

  // พังตรงนี้ totalMaxScore ไม่ได้เป็นค่าที่ถูกต้อง
  const targetScore = Math.floor(totalMaxScore * (progressLevel / totalSessions));
  // 2. mock distributed score
  const distributedScores = mockDistributeScores(targetScore, tasks);

  tasks.forEach((task, index) => {
    task.obtainedScore = distributedScores[index];
  });

  const totalObtainScore = tasks.reduce((sum, task) => sum + task.obtainedScore, 0);

  return {
    subjectId,
    subjectName,
    scenarioId: `Scenario_${Math.random().toString(36).substring(2, 8)}`,
    scenarioTitle,
    steps: [
      {
        stepId: "SCENARIO_STEP",
        parentStepId: null,
        stepTitle: "Training Scenario",
        type: "normal",
        totalMaxScore,
        totalObtainScore,
        tasks,
      },
    ],
  };
};

// Fetch CSV and generate mock data with date field
const fetchCSVAndGenerateMockData = async (progressLevel, totalSessions, templateList, templateColorMap, subjectId, subjectName) => {
  try {
    // random template from list
    const selectedTemplate = templateList[Math.floor(Math.random() * templateList.length)];
    const response = await fetch(selectedTemplate);

    if (!response.ok) {
      throw new Error("Failed to fetch the CSV file.");
    }

    const csvText = await response.text();
    const csvData = parseCSV(csvText);
    const scenarioTitle = selectedTemplate.split("/").pop().replace(".csv", "").replace(/_/g, " ");

    // Generate mock data
    const mockData = generateMockDataForStudent(csvData, progressLevel, totalSessions, scenarioTitle, subjectId, subjectName);
    mockData.color = templateColorMap[selectedTemplate] || "rgba(128, 128, 128, 0.8)";
    mockData.template = selectedTemplate;

    // Add date field based on progressLevel
    const startDate = new Date();
    const sessionDate = new Date(startDate);
    sessionDate.setDate(startDate.getDate() - (totalSessions - progressLevel));
    mockData.date = sessionDate.toISOString().split("T")[0];

    return mockData;
  } catch (error) {
    console.error("Error fetching or generating mock data:", error);
    throw error;
  }
};

// Function to fetch and process task list CSV
const fetchTaskList = async (csvListPath) => {
  try {
    const response = await fetch(csvListPath);
    if (!response.ok) {
      throw new Error("Failed to fetch the task list CSV file.");
    }

    const csvText = await response.text();
    const taskList = parseCSV(csvText);

    const tasksByStepId = taskList.reduce((acc, task) => {
      acc[task.stepId] = acc[task.stepId] || [];
      acc[task.stepId].push(task);
      return acc;
    }, {});

    return { allTasks: taskList, tasksByStepId };
  } catch (error) {
    console.error("Error fetching task list:", error);
    throw error;
  }
};
