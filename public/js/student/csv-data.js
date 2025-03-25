
/**
 * =============================================================================
 * Public: Get Session Data from CSV
 * =============================================================================
 */
async function fetchCSVSessionData(scenarioColorMap, subjectId, subjectName) {
  try {
    // FIXME: Hardcoded file path & related data
    const filePath = './data/subject3/csv/';
    const fileList = [
      '1_studentId_68200988_subject_SUBJECT3_scenario_SCENARIO_2_20250325_151618_UTC+7.csv',
      '2_studentId_68200988_subject_SUBJECT3_scenario_SCENARIO_2_20250325_151618_UTC+7.csv',
      '3_studentId_68200988_subject_SUBJECT3_scenario_SCENARIO_1_20250325_151618_UTC+7.csv',
      '4_studentId_68200988_subject_SUBJECT3_scenario_SCENARIO_1_20250325_151618_UTC+7.csv',
      '5_studentId_68200988_subject_SUBJECT3_scenario_SCENARIO_1_20250325_151618_UTC+7.csv',
      '6_studentId_68200988_subject_SUBJECT3_scenario_SCENARIO_1_20250325_151618_UTC+7.csv',
      '7_studentId_68200988_subject_SUBJECT3_scenario_SCENARIO_1_20250325_151618_UTC+7.csv',
      '8_studentId_68200988_subject_SUBJECT3_scenario_SCENARIO_1_20250325_151618_UTC+7.csv',
      '9_studentId_68200988_subject_SUBJECT3_scenario_SCENARIO_1_20250325_151618_UTC+7.csv',
      '10_studentId_68200988_subject_SUBJECT3_scenario_SCENARIO_2_20250325_151618_UTC+7.csv',
    ];

    const scenarioPaths = Object.keys(scenarioColorMap);

    const sessions = await Promise.all(
      fileList.map(async (fileName) => {
        const fileInfo = fileName.split("_");
        const tasks = await fetchCSVTasks(`${filePath}/${fileName}`);

        // Dynamically calculate total scores
        const totalMaxScore = tasks.reduce((sum, task) => sum + Number(task.maxScore || 0), 0);
        const totalObtainScore = tasks.reduce((sum, task) => sum + Number(task.obtainedScore || 0), 0);

        // FIXME: To get scenario is quite difficult now
        const selectedScenario = scenarioPaths[parseInt(fileInfo[7]) - 1];
        const color = scenarioColorMap[selectedScenario] || "rgba(128, 128, 128, 0.8)";

        return {
          subjectId,
          subjectName,
          scenarioId: `${fileInfo[6]}_${fileInfo[7]}`,
          scenarioName: `${fileInfo[6]}_${fileInfo[7]}`,
          scenarioPath: selectedScenario,
          color,
          date: `${fileInfo[9]}: ${fileInfo[10]} ${fileInfo[11]}`,
          totalMaxScore,
          totalObtainScore,
          tasks
        };
      })
    );
  
    return sessions;

  } catch (error) {
    console.error("Error read CSV session data:", error);
    throw error;
  }
}
