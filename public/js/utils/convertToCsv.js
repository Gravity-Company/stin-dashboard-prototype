function formatDateForFilenameUTC7(date = new Date()) {
  // Convert the current date to Bangkok time (UTC+7)
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000)
  const bkkOffset = 7 * 60 * 60000 // 7 hours in milliseconds
  const bkkDate = new Date(utc + bkkOffset)

  const pad = (n) => n.toString().padStart(2, '0')

  const year = bkkDate.getFullYear()
  const month = pad(bkkDate.getMonth() + 1)
  const day = pad(bkkDate.getDate())
  const hours = pad(bkkDate.getHours())
  const minutes = pad(bkkDate.getMinutes())
  const seconds = pad(bkkDate.getSeconds())

  return `${year}${month}${day}_${hours}${minutes}${seconds}_UTC+7`
}

function generateCsvFromTasks(data, filename = 'tasks.csv') {
  if (!data || !Array.isArray(data)) {
    console.error("Invalid data provided for CSV export.");
    return;
  }

  // Define the column headers you want in the CSV
  const headers = [
    'stepTitle','type','taskId','taskCode','taskTitle','maxScore','obtainedScore','startTime','completionTime'
  ];

  // Convert each task object to a CSV row
  const rows = data.map(task => [
    `"${task.stepTitle}"`,
    task.type,
    task.taskId,
    task.taskCode,
    `"${task.taskTitle}"`,
    task.maxScore,
    task.obtainedScore,
    task.startTime,
    task.completionTime
  ]);

   // Join headers and rows
   const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

   // Create blob and auto-download
   const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
   const url = URL.createObjectURL(blob);
 
   const link = document.createElement('a');
   link.href = url;
   link.setAttribute('download', filename);
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
}
