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
 * Filters mock session data by scenario value.
 */
function filterSessionDataByScenario(scenarioValue) {
  if (scenarioValue === "all") return mockDataSessions;
  return mockDataSessions.filter(session => session.scenario === scenarioValue);
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

  const subjectId = `SUBJECT_${subjectPath.split('/').pop().toUpperCase()}`;
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
 * Populates the scenario filter dropdown menu.
 */
async function renderScenarioDropdown(subjectPath) {
  const dropdown = document.getElementById("scenarioFilter");
  dropdown.innerHTML = "";

  try {
    const fileList = await fetchJSON(`${subjectPath}/file_list.json`);

    dropdown.appendChild(createOption("all", "All Scenarios"));

    fileList.forEach(file => {
      const scenarioPath = `${subjectPath}/scenarios/${file}`;
      const displayName = file.replace(".csv", "").replace(/_/g, " ");
      dropdown.appendChild(createOption(scenarioPath, displayName));
    });

    dropdown.value = "all";
  } catch (error) {
    console.error("Error populating scenario dropdown:", error);
  }
}

/**
 * =============================================================================
 * SECTION 4: Dashboard Logic
 * =============================================================================
 */

// Store globally for filtering
let mockDataSessions = [];

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

  mockDataSessions = sessions;
  console.log("All mock sessions initialized.");
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

    renderSubjectHeader(subjectName);
    await renderScenarioDropdown(subjectPath);
    await initializeMockSessionData(sessionCount, scenarioPaths, scenarioColors, subjectId, subjectName);

    const { allTasks } = await fetchTaskList(csvListPath);

    // TODO: Final rendering logic (charts, visuals, etc.)
    renderProgressChart(allTasks);
    renderPerformanceChart(mockDataSessions);
    renderRecommendedSessions(mockDataSessions, sessionCount);
    renderFocusTaskList("all");

    // renderTimeImprovementChart(mockDataSessions);
    // renderTopTasksChart(mockDataSessions);

    console.log(`Subject initialized: ${subjectPath}`);
  } catch (error) {
    console.error("Failed to initialize subject:", error);
  }
}

/**
 * Updates the dashboard when a new subject is selected.
 */
async function updateDashboardForSubject(subjectPath) {
  try {
    await initializeSubject(subjectPath);
  } catch (error) {
    console.error("Dashboard update failed:", error);
  }
}

/**
 * Initializes the dashboard when the app is loaded.
 */
async function initializeDashboard(defaultSessionCount = 10) {
  try {
    const subjectDropdown = document.getElementById("subjectFilter");
    const defaultSubject = subjectDropdown.value;

    await initializeSubject(defaultSubject, defaultSessionCount);

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
 * SECTION 5: Event Listeners
 * =============================================================================
 */

/**
 * Attaches UI interaction event handlers.
 */
function attachEventHandlers() {
  const subjectDropdown = document.getElementById("subjectFilter");
  const scenarioDropdown = document.getElementById("scenarioFilter");

  subjectDropdown.addEventListener("change", (event) => {
    const selectedSubject = event.target.value;
    updateDashboardForSubject(selectedSubject);
  });

  scenarioDropdown.addEventListener("change", (event) => {
    const selectedScenario = event.target.value;
    const filteredSessions = filterSessionDataByScenario(selectedScenario);

    // TODO: Update visualizations with filtered data
    // renderTimeImprovementChart(filteredSessions);
    // renderTopTasksChart(filteredSessions);
  });
}

/**
 * =============================================================================
 * SECTION 6: App Entry Point
 * =============================================================================
 */

attachEventHandlers();
initializeDashboard(10);
