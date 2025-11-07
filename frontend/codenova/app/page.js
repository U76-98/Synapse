'use client';

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
