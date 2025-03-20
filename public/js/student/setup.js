/**
 * =============================================================================
 * SECTION 1: Core Utilities
 * =============================================================================
 */

/**
 * Fetch JSON data from a URL.
 */
async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch JSON from ${url}`);
  }
  return response.json();
}

/**
 * Fetch plain text from a URL.
 */
async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch text from ${url}`);
  }
  return response.text();
}

/**
 * Generate a random RGB color string.
 */
function generateRandomRGB() {
  const rand = () => Math.floor(Math.random() * 256);
  return `rgb(${rand()}, ${rand()}, ${rand()})`;
}

/**
 * Create a color map for all scenario files.
 */
function getScenarioColorMap(scenarioPaths) {
  const colorMap = {};
  for (const path of scenarioPaths) {
    colorMap[path] = generateRandomRGB();
  }
  return colorMap;
}

/**
 * Create a single <option> element for a <select>.
 */
function createOption(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

/**
 * Return filtered mock sessions by scenario.
 */
function filterSessionDataByScenario(scenarioValue) {
  if (scenarioValue === "all") return mockDataSessions;
  return mockDataSessions.filter(session => session.scenario === scenarioValue);
}

/**
 * =============================================================================
 * SECTION 2: Subject Data
 * =============================================================================
 */

async function loadSubjectData(subjectPath) {
  const fileList = await fetchJSON(`${subjectPath}/file_list.json`);
  const csvListPath = `${subjectPath}/task_list.csv`;

  // lookup file via /:subject/:scenario/ dir
  const scenarioFiles = fileList.map(name => `${subjectPath}/scenarios/${name}`);

  const scenarioColors = getScenarioColorMap(scenarioFiles);
  // const rawCSV = await fetchText(csvListPath);
  // const parsedCSV = parseCSV(rawCSV); // external

  const subjectId = `SUBJECT_${subjectPath.split('/').pop().toUpperCase()}`;
  const subjectName = subjectNames[subjectPath];

  return {
    csvListPath,
    scenarioFiles,
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
 * Set subject name in header.
 */
function renderSubjectHeader(name) {
  const header = document.getElementById("subject-header");
  if (header) {
    const h1 = header.querySelector("h1");
    if (h1) h1.textContent = name;
  }
}

/**
 * Populate the scenario filter dropdown.
 */
async function renderScenarioDropdown(scenarioPath) {
  const dropdown = document.getElementById("scenarioFilter");
  dropdown.innerHTML = "";

  try {
    const files = await fetchJSON(`${scenarioPath}/file_list.json`);
    dropdown.appendChild(createOption("all", "All Scenario"));

    files.forEach((file) => {
      const scenarioFilePath = `${scenarioPath}/scenarios/${file}`;
      const scenarioName = file
        .split("/")
        .pop()
        .replace(".csv", "")
        .replace(/_/g, " ")

      dropdown.appendChild(createOption(scenarioFilePath, scenarioName));
    });

    dropdown.value = "all";
  } catch (error) {
    console.error("Failed to populate scenario dropdown:", error);
  }
}

/**
 * =============================================================================
 * SECTION 4: Dashboard Logic
 * =============================================================================
 */

let mockDataSessions = [];

/**
 * Generate mock sessions and store globally.
 */
async function initializeMockSessionData(count, scenarios, colorMap, subjectId, subjectName) {
  const sessions = [];

  for (let i = 0; i < count; i++) {
    const progress = Math.ceil(((i + 1) / count) * 10);
    const session = await fetchCSVAndGenerateMockData(
      progress,
      count,
      scenarios,
      colorMap,
      subjectId,
      subjectName
    );
    sessions.push(session);
    console.log(session);
  }

  mockDataSessions = sessions;
  console.log("Mock sessions initialized:", sessions);
}

/**
 * Handle full subject load (data + UI).
 */
async function initializeSubject(subjectPath, sessionCount = 10) {
  try {
    const {
      csvListPath,
      scenarioFiles,
      scenarioColors,
      subjectId,
      subjectName
    } = await loadSubjectData(subjectPath);

    renderSubjectHeader(subjectName);
    await renderScenarioDropdown(subjectPath);
    await initializeMockSessionData(sessionCount, scenarioFiles, scenarioColors, subjectId, subjectName);

    const { allTasks } = await fetchTaskList(csvListPath);
    // TODO: render charts from here

    console.log(`Scenario initialized: ${subjectPath}`);
  } catch (err) {
    console.error("Failed to initialize scenario:", err);
  }
}

/**
 * Update entire dashboard (used on dropdown change).
 */
async function updateDashboardForSubject(subjectPath) {
  try {
    await initializeSubject(subjectPath);
  } catch (error) {
    console.error("Dashboard update failed:", error);
  }
}

/**
 * Initialize dashboard on load.
 */
async function initializeDashboard(sessionCount = 10) {
  try {
    const defaultSubject = document.getElementById("subjectFilter").value;
    await initializeSubject(defaultSubject, sessionCount);

    const seeAllButton = document.getElementById("see-all-button");
    if (seeAllButton) {
      seeAllButton.addEventListener("click", () => {
        alert("Redirect to full activity history!");
      });
    }

    console.log("Dashboard is ready.");
  } catch (error) {
    console.error("Initial dashboard setup failed:", error);
  }
}

/**
 * =============================================================================
 * SECTION 5: Event Listeners
 * =============================================================================
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
    const filtered = filterSessionDataByScenario(selectedScenario);

    // renderTimeImprovementChart(filtered);
    // renderTopTasksChart(filtered);
  });
}

/**
 * =============================================================================
 * SECTION 6: App Entry Point
 * =============================================================================
 */

attachEventHandlers();
initializeDashboard(10);
