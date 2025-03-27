/**
 * =============================================================================
 * Utilities
 * =============================================================================
 */
// FIXME: Hardcoded file path & related data
function getFilePathsByStudentId(studentId) {  
  if (studentId === '68200988') {
    const filePath = './data/subject3/csv/studentId_68200988/';
    const fileList = [
      '1_studentId_68200988_subject_SUBJECT3_scenario_SCENARIO2_20250325_151618_UTC+7.csv',
      '2_studentId_68200988_subject_SUBJECT3_scenario_SCENARIO2_20250325_151618_UTC+7.csv',
      '3_studentId_68200988_subject_SUBJECT3_scenario_SCENARIO1_20250325_151618_UTC+7.csv',
      '4_studentId_68200988_subject_SUBJECT3_scenario_SCENARIO1_20250325_151618_UTC+7.csv',
      '5_studentId_68200988_subject_SUBJECT3_scenario_SCENARIO1_20250325_151618_UTC+7.csv',
      '6_studentId_68200988_subject_SUBJECT3_scenario_SCENARIO1_20250325_151618_UTC+7.csv',
      '7_studentId_68200988_subject_SUBJECT3_scenario_SCENARIO1_20250325_151618_UTC+7.csv',
      '8_studentId_68200988_subject_SUBJECT3_scenario_SCENARIO1_20250325_151618_UTC+7.csv',
      '9_studentId_68200988_subject_SUBJECT3_scenario_SCENARIO1_20250325_151618_UTC+7.csv',
      '10_studentId_68200988_subject_SUBJECT3_scenario_SCENARIO2_20250325_151618_UTC+7.csv',
    ];

    return { filePath, fileList };
  }

  if (studentId === '68200989') {
    const filePath = './data/subject3/csv/studentId_68200989/';
    const fileList = [
      '1_studentId_68200989_subject_SUBJECT3_scenario_SCENARIO1_20250326_194416_UTC+7.csv',
      '2_studentId_68200989_subject_SUBJECT3_scenario_SCENARIO2_20250326_194416_UTC+7.csv',
      '3_studentId_68200989_subject_SUBJECT3_scenario_SCENARIO2_20250326_194416_UTC+7.csv',
      '4_studentId_68200989_subject_SUBJECT3_scenario_SCENARIO1_20250326_194416_UTC+7.csv',
      '5_studentId_68200989_subject_SUBJECT3_scenario_SCENARIO2_20250326_194416_UTC+7.csv',
      '6_studentId_68200989_subject_SUBJECT3_scenario_SCENARIO1_20250326_194416_UTC+7.csv',
      '7_studentId_68200989_subject_SUBJECT3_scenario_SCENARIO1_20250326_194416_UTC+7.csv',
      '8_studentId_68200989_subject_SUBJECT3_scenario_SCENARIO2_20250326_194416_UTC+7.csv',
      '9_studentId_68200989_subject_SUBJECT3_scenario_SCENARIO2_20250326_194416_UTC+7.csv',
      '10_studentId_68200989_subject_SUBJECT3_scenario_SCENARIO1_20250326_194416_UTC+7.csv',
    ];

    return { filePath, fileList };
  }

  if (studentId === '68200990') {
    const filePath = './data/subject3/csv/studentId_68200990/';
    const fileList = [
      '1_studentId_68200990_subject_SUBJECT3_scenario_SCENARIO1_20250326_094747_UTC+7.csv',
      '2_studentId_68200990_subject_SUBJECT3_scenario_SCENARIO1_20250326_094747_UTC+7.csv',
      '3_studentId_68200990_subject_SUBJECT3_scenario_SCENARIO1_20250326_094747_UTC+7.csv',
      '4_studentId_68200990_subject_SUBJECT3_scenario_SCENARIO2_20250326_094747_UTC+7.csv',
      '5_studentId_68200990_subject_SUBJECT3_scenario_SCENARIO2_20250326_094747_UTC+7.csv',
      '6_studentId_68200990_subject_SUBJECT3_scenario_SCENARIO2_20250326_094747_UTC+7.csv',
      '7_studentId_68200990_subject_SUBJECT3_scenario_SCENARIO2_20250326_094747_UTC+7.csv',
      '8_studentId_68200990_subject_SUBJECT3_scenario_SCENARIO1_20250326_094747_UTC+7.csv',
      '9_studentId_68200990_subject_SUBJECT3_scenario_SCENARIO2_20250326_094747_UTC+7.csv',
      '10_studentId_68200990_subject_SUBJECT3_scenario_SCENARIO1_20250326_094747_UTC+7.csv',
    ];


    return { filePath, fileList };
  }
}

/**
 * =============================================================================
 * Public: Get Session Data from CSV
 * =============================================================================
 */
async function fetchCSVSessionData(scenarioColorMap, subjectId, subjectName, studentId) {
  try {
    const { filePath, fileList } = getFilePathsByStudentId(studentId);
    console.log(studentId, filePath, fileList)

    const scenarioPaths = {};
    Object.keys(scenarioColorMap).forEach((scenario, i) => {
      scenarioPaths[`SCENARIO${i + 1}`] = scenario;
    });

    const sessions = await Promise.all(
      fileList.map(async (fileName) => {
        const fileInfo = fileName.split("_");
        const tasks = await fetchCSVTasks(`${filePath}/${fileName}`);

        // Dynamically calculate total scores
        const totalMaxScore = tasks.reduce((sum, task) => sum + Number(task.maxScore || 0), 0);
        const totalObtainScore = tasks.reduce((sum, task) => sum + Number(task.obtainedScore || 0), 0);

        // FIXME: To get scenario is quite difficult now
        console.log(scenarioPaths, fileInfo)
        const selectedScenario = scenarioPaths[fileInfo[6]];
        const color = scenarioColorMap[selectedScenario] || "rgba(128, 128, 128, 0.8)";

        return {
          subjectId,
          subjectName,
          scenarioId: `${fileInfo[6]}`,
          scenarioName: `${fileInfo[6]}`,
          scenarioPath: selectedScenario,
          color,
          date: `${fileInfo[7]}: ${fileInfo[8]}`,
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
