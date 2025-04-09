/**
 * =============================================================================
 * SECTION 1: Core Utilities
 * =============================================================================
 */

/**
 * Fetches JSON data from a given URL.
 */
async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch JSON from ${url}`);
  }
  return response.json();
}

/**
 * Fetches plain text data from a given URL.
 */
async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch text from ${url}`);
  }
  return response.text();
}

/**
 * Generates a random RGB color string.
 */
function generateRandomRGB() {
  const rand = () => Math.floor(Math.random() * 256);
  return `rgb(${rand()}, ${rand()}, ${rand()})`;
}

/**
 * Maps each scenario path to a unique RGB color.
 */
function createScenarioColorMap(scenarioPaths) {
  return scenarioPaths.reduce((map, path) => {
    map[path] = generateRandomRGB();
    return map;
  }, {});
}

/**
 * Creates an <option> element for dropdown menus.
 */
function createOption(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

/**
 * =============================================================================
 * SECTION 2: Subject Data Loading
 * =============================================================================
 */

/**
 * Loads subject-related data including CSV and scenario paths.
 */
async function loadSubjectData(subjectPath) {
  const fileList = await fetchJSON(`${subjectPath}/file_list.json`);
  const csvListPath = `${subjectPath}/task_list.csv`;

  const scenarioPaths = fileList.map(file => `${subjectPath}/scenarios/${file}`);
  const scenarioColors = createScenarioColorMap(scenarioPaths);

  const subjectId = `${subjectPath.split('/').pop().toUpperCase()}`;
  const subjectName = subjectNames[subjectPath];

  return {
    csvListPath,
    scenarioPaths,
    scenarioColors,
    subjectId,
    subjectName
  };
}

/**
 * =============================================================================
 * SECTION 3: UI Rendering
 * =============================================================================
 */

/**
 * Updates the subject name in the header area.
 */
function renderSubjectHeader(subjectName) {
  const header = document.getElementById("subject-header");
  const title = header?.querySelector("h1");

  if (title) {
    title.textContent = subjectName;
  }
}

/**
 * =============================================================================
 * SECTION 4: Dashboard Logic
 * =============================================================================
 */

// Store globally for filtering
const mockDataSessionsAllStudents = [];
const globalScenarioColors = {};

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

/**
 * Initializes the dashboard for a selected subject.
 */
async function initializeSubject(subjectPath, sessionCount = 10) {
  try {
    const {
      csvListPath,
      scenarioPaths,
      scenarioColors,
      subjectId,
      subjectName
    } = await loadSubjectData(subjectPath);

    Object.assign(globalScenarioColors, scenarioColors);

    renderSubjectHeader(subjectName);
    console.log(`Subject initialized: ${subjectPath}`);

    return { scenarioPaths, globalScenarioColors, subjectId, subjectName };
  } catch (error) {
    console.error("Failed to initialize subject:", error);
  }
}

/**
 * Initializes the dashboard when the app is loaded.
 */
async function initializeDashboard(defaultSessionCount = 10, numberOfStudent) {
  try {
    const subjectDropdown = document.getElementById("subjectFilter");
    const defaultSubject = subjectDropdown.value;

    for (let i = 0; i < numberOfStudent; i++) {
      const sessions = await initializeSubject(defaultSubject, defaultSessionCount);
      console.log(sessions);
      mockDataSessionsAllStudents.push(...sessions);
    }

    // console.log(mockDataSessionsAllStudents);

    const seeAllButton = document.getElementById("see-all-button");
    seeAllButton?.addEventListener("click", () => {
      alert("Redirect to full activity history!");
    });

    console.log("Dashboard initialized.");
  } catch (error) {
    console.error("Dashboard initialization failed:", error);
  }
}

/**
 * =============================================================================
 * SECTION 6: App Entry Point
 * =============================================================================
 */

initializeDashboard(10, 20);
