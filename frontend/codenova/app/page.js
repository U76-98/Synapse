'use client';

/**
 * Cursor Context:
 * Data is fetched from /api/employees endpoint
 * Returns fields: Employee_ID, Claimed_Hours, Active_Hours, Utilization_Rate, 
 * Performance_Score, Recent_HR_Flag, Productivity_Level
 * Please make all KPIs and table dynamic, using normalized values for productivity.
 */

import Header from './components/Header';
import Overview from './components/dashboard/Overview';
import EmployeeList from './components/dashboard/EmployeeList';
import ActiveTeams from './components/dashboard/ActiveTeams';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Overview />
        <EmployeeList />
        <ActiveTeams />
      </main>
    </div>
  );
}
