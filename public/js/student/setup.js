/**
 * =============================================================================
 * SECTION 1: Core Utilities
 * =============================================================================
 */

const ENABLE_MOCK_DATA = false;
const ENABLE_GEN_CSV_FROM_MOCK_DATA = false;

const student_profile = {
  id: '68200988',
  firstName: 'John',
  lastName: 'Doe',
  class: '1A',
}

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
  return mockDataSessions.filter(session => session.scenarioPath === scenarioValue);
}

/**
 * Generate CSV from mock data.
 */
function generateCSVFromMockData(dataSessions, profile) {
  dataSessions.forEach((session, i) => {
    const { subjectId, scenarioId, tasks } = session
    const fileName = `${i+1}_studentId_${profile.id}_subject_${subjectId}_scenario_${scenarioId}_${formatDateForFilenameUTC7()}.csv`;
    generateCsvFromTasks(tasks, fileName);
  });
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
 * Updates student name.
 */
function renderStudentName() {
  const name = document.getElementById("user-profile");
  name.textContent = `${student_profile.firstName} ${student_profile.lastName}`;
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
const mockDataSessions = [];
const globalScenarioColors = {};

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

    // User profile setup
    renderSubjectHeader(subjectName);
    renderStudentName();

    await renderScenarioDropdown(subjectPath);
    
    // Generate mock data
    if (ENABLE_MOCK_DATA) {
      const sessions = await initializeMockSessionData(sessionCount, scenarioPaths, globalScenarioColors, subjectId, subjectName);
      mockDataSessions.push(...sessions);
    } else {
      const sessions = await fetchCSVSessionData(globalScenarioColors, subjectId, subjectName);
      mockDataSessions.push(...sessions);
    }

    // Generate CSV files from mock data
    if (ENABLE_GEN_CSV_FROM_MOCK_DATA) {
      generateCSVFromMockData(mockDataSessions, student_profile);
    }

    const { allTasks } = await fetchTaskList(csvListPath);

    // TODO: Final rendering logic (charts, visuals, etc.)
    renderProgressChart(allTasks, mockDataSessions);
    renderPerformanceChart(mockDataSessions);
    renderRecommendedSessions(mockDataSessions, sessionCount);
    renderFocusTaskList(mockDataSessions);

    const defaultScenario = "all";
    const filteredSessions = filterSessionDataByScenario(defaultScenario);

    // Individual Scenario Data (effected by scenarioFilter)
    renderTimeImprovementChart(filteredSessions, globalScenarioColors);
    renderCalendar(filteredSessions);
    renderTopTasksChart(filteredSessions);
    renderActivityList(filteredSessions);

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
    // not so sure that why member of mockDataSessions is reversed at this step
    const filteredSessions = filterSessionDataByScenario(selectedScenario) //.reverse();

    // TODO: Update visualizations with filtered data
    renderTimeImprovementChart(filteredSessions, globalScenarioColors);
    renderCalendar(filteredSessions);
    renderTopTasksChart(filteredSessions);
    renderActivityList(filteredSessions);
  });
}

/**
 * =============================================================================
 * SECTION 6: App Entry Point
 * =============================================================================
 */

attachEventHandlers();
initializeDashboard(10);
