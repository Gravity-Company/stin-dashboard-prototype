
/** 
 * =====================
 * 1. Init scenario data
 * =====================
 */

// Helper function to fetch JSON data
const fetchJSON = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch JSON data from ${url}`);
  }
  return response.json();
};

// Helper function to fetch text data
const fetchText = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch text data from ${url}`);
  }
  return response.text();
};

// Helper function to generate random RGB color
const generateRandomColor = () => {
  const randomColor = () => Math.floor(Math.random() * 256);
  return `rgb(${randomColor()}, ${randomColor()}, ${randomColor()})`;
};

// Helper function to map template colors
const createTemplateColorMap = (templateList) => {
  return templateList.reduce((map, template) => {
    map[template] = generateRandomColor();
    return map;
  }, {});
};

// Main function to fetch and prepare scenario data
const fetchScenarioData = async (scenarioPath) => {
  try {
    // Fetch the list of files
    const files = await fetchJSON(`${scenarioPath}/file_list.json`);

    // Prepare paths and lists
    const csvListPath = `${scenarioPath}/task_list.csv`;
    const templateList = files
      .filter((file) => file !== "task_list.csv")
      .map((file) => `${scenarioPath}/${file}`);
    const templateColorMap = createTemplateColorMap(templateList);

    // Fetch CSV data and parse
    const csvText = await fetchText(csvListPath);
    const csvData = parseCSV(csvText); // Assume parseCSV is implemented

    // Randomly select subject details
    const subjectId = `SUBJ${Math.random().toString(36).substring(2, 6).toUpperCase()}`; // Random ID
    const subjectName = scenarioNames[scenarioPath];

    return { csvListPath, templateList, templateColorMap, subjectId, subjectName };
  } catch (error) {
    console.error("Error fetching scenario data:", error);
    throw error;
  }
};

/** 
 * =========================
 * 2. Init scenario dropdown
 * =========================
 */

// Event listener for dropdown change
const scenarioDropdown = document.getElementById("scenarioFilter");
scenarioDropdown.addEventListener("change", (event) => {
  const selectedScenario = event.target.value;
  updateDashboardForScenario(selectedScenario);
});

/** 
 * =========================
 * 3. Prepare Header Section
 * =========================
 */

// Function to update subject name in the header
const updateSubjectHeader = (subjectName) => {
  const headerElement = document.getElementById("subject-header");
  if (headerElement) {
    headerElement.querySelector("h1").textContent = subjectName;
  }
};

/** 
 * =========================
 * 4. Init template dropdown
 * =========================
 */

// Function to dynamically populate dropdown
const populateTemplateDropdown = async (scenarioPath) => {
  const dropdown = document.getElementById("templateFilter");

  try {
    // Fetch file_list.json
    const response = await fetch(`${scenarioPath}/file_list.json`);
    if (!response.ok) {
      throw new Error("Failed to fetch file list");
    }

    const files = await response.json(); // Assuming file_list.json contains an array of filenames

    // Update dropdown options
    updateDropdownOptions(dropdown, files, scenarioPath);

    // Set default selection to "All Templates"
    dropdown.value = "all";

    console.log("Dropdown updated with templates from:", scenarioPath);
  } catch (error) {
    console.error("Error populating dropdown:", error);
  }
};

// Helper function to update dropdown options
const updateDropdownOptions = (dropdown, files, scenarioPath) => {
  // Clear existing options
  dropdown.innerHTML = "";

  // Add "All Templates" option
  const allOption = createDropdownOption("all", "All Templates");
  dropdown.appendChild(allOption);

  // Add options dynamically from files
  files
    .filter((file) => file !== "task_list.csv")
    .forEach((file, index) => {
      const optionValue = `${scenarioPath}/${file}`;
      const optionText = `Template ${index + 1}`;
      dropdown.appendChild(createDropdownOption(optionValue, optionText));
    });
};

// Helper function to create dropdown options
const createDropdownOption = (value, text) => {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  return option;
};

// Event listener for Sub Scenario dropdown
const dropdown = document.getElementById("templateFilter");
dropdown.addEventListener("change", (event) => {
  const selectedTemplate = event.target.value;
  const filteredData = filterMockDataByTemplate(selectedTemplate);

  renderTimeImprovementChart(filteredData);
  renderTopTasksChart(filteredData);
});

/** 
 * =========================
 * 5. Init dashboard section
 * =========================
 */

// Function to initialize the dashboard
const initDashboard = async (totalSessions = 10) => {
  try {
    const defaultScenario = document.getElementById("scenarioFilter").value;

    // Initialize the dashboard with the default scenario
    await initializeScenario(defaultScenario, totalSessions);

    // Add event listener for "See All" button
    document.getElementById("see-all-button").addEventListener("click", () => {
      alert("Redirect to full activity history!");
    });

    console.log("Dashboard initialized successfully");
  } catch (error) {
    console.error("Failed to initialize the dashboard:", error);
  }
};

// Function to update the dashboard for a given scenario
const updateDashboardForScenario = async (scenarioPath) => {
  try {
    await initializeScenario(scenarioPath);
    console.log(`Dashboard updated for ${scenarioPath}`);
  } catch (error) {
    console.error("Error updating dashboard for scenario:", error);
  }
};

// Helper function to initialize a scenario
const initializeScenario = async (scenarioPath, totalSessions = 10) => {
  try {
    // Fetch scenario data
    const { 
      subjectName, 
      subjectId, 
      templateList, 
      templateColorMap, 
      csvListPath 
    } = await fetchScenarioData(scenarioPath);

    // Update UI components
    updateSubjectHeader(subjectName);
    await populateTemplateDropdown(scenarioPath);

    // Initialize mock data and fetch tasks
    await initMockData(totalSessions, templateList, templateColorMap, subjectId, subjectName);
    const { allTasks } = await fetchTaskList(csvListPath);

    console.log(`Scenario initialized: ${scenarioPath}`);
  } catch (error) {
    console.error("Failed to initialize scenario:", error);
    throw error;
  }
};

// Initialize the dashboard
initDashboard(10);
