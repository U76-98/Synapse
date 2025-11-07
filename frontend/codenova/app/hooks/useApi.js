'use client';

// ✅ Single original employee (demo-safe)
const FALLBACK_EMPLOYEES = [
  {
    Employee_ID: "E001",
    Name: "Alice Williams",
    Email: "e001@company.com",
    Department: "AI/ML",
    Position: "Junior Developer",
    Team_ID: "T02",
    performance_metrics: {
      Claimed_Hours: 6.09,
      Active_Hours: 6.10,
      Claimed_Minus_Active: 0,
      Utilization_Rate: 100.04,
      Commits: 1,
      PRs_Opened: 1,
      Tasks_Done: 4,
      Performance_Score: 8.25,
      Meetings_Hours: 2.34,
      Productivity_Level: "Low",
    },
  },
];

/**
 * ✅ Mock API for single-record demo
 */
export const fetchEmployeeData = async () => {
  console.log("📊 Using single employee fallback (original data)");
  return FALLBACK_EMPLOYEES;
};

export const getPrediction = async () => ({});
export const checkHealth = async () => ({ ok: true });
