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

async function fetchCSVTasks(csvFilePath) {
  try {
    const response = await fetch(csvFilePath);
    if (!response.ok) throw new Error("Failed to fetch task list CSV file.");

    const csvText = await response.text();
    const tasks = parseCSV(csvText);

    return tasks;
  } catch (error) {
    console.error("Error fetching task list:", error);
    throw error;
  }
}
