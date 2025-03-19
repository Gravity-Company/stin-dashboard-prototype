// Array ของชื่อ Scenario
const scenarioNames = {
  "./data/scenario1": "การปั๊มหัวใจ CPR",
  "./data/scenario2": "การดูแลผู้คลอดที่มีภาวะตกเลือด",
  "./data/scenario3": "การทำคลอดปกติ",
  "./data/scenario4": "การให้สารละลายทางหลอดเลือดดำ",
  "./data/scenario5": "การให้อาหารทางสาย",
  "./data/scenario6": "การดูแลผู้ป่วยจิตเวช",
  "./data/scenario7": "การซักประวัติและการตรวจร่างกาย",
}

// Mock data สำหรับ progress
const progressData = [80, 65, 90, 50, 75, 40, 85]; // Example progress (%) สำหรับแต่ละ scenario

// Chart.js configuration
const config = {
  type: "bar",
  data: {
    labels: Object.values(scenarioNames),
    datasets: [
      {
        label: "Progress (%)",
        data: progressData, // ใช้ mock progress data
        backgroundColor: [
          "rgba(75, 192, 192, 0.8)", // Green
          "rgba(255, 205, 86, 0.8)", // Yellow
          "rgba(54, 162, 235, 0.8)", // Blue
          "rgba(255, 99, 132, 0.8)", // Red
          "rgba(153, 102, 255, 0.8)", // Purple
          "rgba(201, 203, 207, 0.8)", // Gray
          "rgba(255, 159, 64, 0.8)", // Orange
        ],
      },
    ],
  },
  options: {
    indexAxis: "y", // Horizontal Bar Chart
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `${tooltipItem.raw}% completed`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Progress (%)", font: { size: 14 } },
        beginAtZero: true,
        max: 100,
      },
      y: {
        title: { display: false },
        ticks: { font: { size: 12 } },
      },
    },
  },
};

// Render the chart
const ctx = document.getElementById("scenarioProgressChart").getContext("2d");
new Chart(ctx, config);
