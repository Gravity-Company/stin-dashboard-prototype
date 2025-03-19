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
 * Create a color map for all template files.
 */
function getTemplateColorMap(templatePaths) {
  const colorMap = {};
  for (const path of templatePaths) {
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
 * Return filtered mock sessions by template.
 */
function filterSessionsByTemplate(templateValue) {
  if (templateValue === "all") return mockDataSessions;
  return mockDataSessions.filter(session => session.template === templateValue);
}

/**
 * =============================================================================
 * SECTION 2: Scenario Data
 * =============================================================================
 */

async function loadScenarioData(scenarioPath) {
  const fileList = await fetchJSON(`${scenarioPath}/file_list.json`);
  const csvListPath = `${scenarioPath}/task_list.csv`;

  const templateFiles = fileList
    .filter(name => name !== "task_list.csv")
    .map(name => `${scenarioPath}/${name}`);

  const templateColors = getTemplateColorMap(templateFiles);
  const rawCSV = await fetchText(csvListPath);
  const parsedCSV = parseCSV(rawCSV); // external

  const subjectId = `SUBJ${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const subjectName = scenarioNames[scenarioPath];

  return {
    csvListPath,
    templateFiles,
    templateColors,
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
 * Populate the template filter dropdown.
 */
async function renderTemplateDropdown(scenarioPath) {
  const dropdown = document.getElementById("templateFilter");
  dropdown.innerHTML = "";

  try {
    const files = await fetchJSON(`${scenarioPath}/file_list.json`);
    const templates = files.filter(file => file !== "task_list.csv");

    dropdown.appendChild(createOption("all", "All Templates"));

    templates.forEach((file, index) => {
      const fullPath = `${scenarioPath}/${file}`;
      dropdown.appendChild(createOption(fullPath, `Template ${index + 1}`));
    });

    dropdown.value = "all";
  } catch (error) {
    console.error("Failed to populate template dropdown:", error);
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
async function initializeMockSessions(count, templates, colorMap, subjectId, subjectName) {
  const sessions = [];

  for (let i = 0; i < count; i++) {
    const progress = Math.ceil(((i + 1) / count) * 10);
    const session = await fetchCSVAndGenerateMockData(
      progress,
      count,
      templates,
      colorMap,
      subjectId,
      subjectName
    );
    sessions.push(session);
  }

  mockDataSessions = sessions;
  console.log("Mock sessions initialized:", sessions);
}

/**
 * Handle full scenario load (data + UI).
 */
async function initializeScenario(scenarioPath, sessionCount = 10) {
  try {
    const {
      csvListPath,
      templateFiles,
      templateColors,
      subjectId,
      subjectName
    } = await loadScenarioData(scenarioPath);

    renderSubjectHeader(subjectName);
    await renderTemplateDropdown(scenarioPath);
    await initializeMockSessions(sessionCount, templateFiles, templateColors, subjectId, subjectName);

    const { allTasks } = await fetchTaskList(csvListPath); // optional for now

    console.log(`Scenario initialized: ${scenarioPath}`);
  } catch (err) {
    console.error("Failed to initialize scenario:", err);
  }
}

/**
 * Update entire dashboard (used on dropdown change).
 */
async function updateDashboardForScenario(scenarioPath) {
  try {
    await initializeScenario(scenarioPath);
  } catch (error) {
    console.error("Dashboard update failed:", error);
  }
}

/**
 * Initialize dashboard on load.
 */
async function initializeDashboard(sessionCount = 10) {
  try {
    const defaultScenario = document.getElementById("scenarioFilter").value;
    await initializeScenario(defaultScenario, sessionCount);

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
  const scenarioDropdown = document.getElementById("scenarioFilter");
  const templateDropdown = document.getElementById("templateFilter");

  scenarioDropdown.addEventListener("change", (event) => {
    const selectedScenario = event.target.value;
    updateDashboardForScenario(selectedScenario);
  });

  templateDropdown.addEventListener("change", (event) => {
    const selectedTemplate = event.target.value;
    const filtered = filterSessionsByTemplate(selectedTemplate);

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
