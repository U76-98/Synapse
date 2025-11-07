'use client';

import { useState, useEffect } from 'react';
import { useKPIMetrics } from '../../../hooks/useKPIMetrics';
import KPIStatsCircle, { KPIStatsContainer } from './KPIStatsCircle';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  ExclamationTriangleIcon, 
  ClockIcon,
  ArrowPathIcon,
  UserCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import ProductivityChart from './charts/ProductivityChart';
import UtilizationChart from './charts/UtilizationChart';

const formatNumber = (num: number, decimals: number = 1): string => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
};

export default function Dashboard() {
  const { 
    avgProductivity, 
    activeEmployees, 
    riskCases, 
    avgUtilization,
    lastUpdated,
    loading, 
    error,
    refresh
  } = useKPIMetrics();

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) refresh();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [loading, refresh]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mb-4"></div>
        <p className="text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Employee Productivity Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Real-time insights and analytics for team performance
              {lastUpdated && (
                <span className="text-xs text-gray-400 ml-2">
                  Updated: {new Date(lastUpdated).toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error} {error.includes('Using sample data') ? 'Please check your backend connection.' : ''}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPIStatsCircle
            title="Avg. Productivity"
            value={parseFloat(avgProductivity.toFixed(1))}
            icon={ChartBarIcon}
            trend="up"
            trendValue="2.1%"
          />
          <KPIStatsCircle
            title="Active Employees"
            value={activeEmployees}
            icon={UserGroupIcon}
            trend="up"
            trendValue="+2"
          />
          <KPIStatsCircle
            title="Risk Cases"
            value={riskCases}
            icon={ExclamationTriangleIcon}
            trend={riskCases > 2 ? 'up' : 'down'}
            trendValue={riskCases > 2 ? '3.2%' : '1.1%'}
          />
          <KPIStatsCircle
            title="Avg. Utilization"
            value={parseFloat(avgUtilization.toFixed(1))}
            icon={ClockIcon}
            trend={avgUtilization > 75 ? 'up' : 'down'}
            trendValue={avgUtilization > 75 ? '4.5%' : '2.1%'}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ProductivityChart />
          <UtilizationChart />
        </div>

        {/* Employee Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Employee Performance</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Real-time productivity metrics across teams
                </p>
              </div>
              <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Export Report
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="bg-gray-50 grid grid-cols-12 gap-4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-4">Employee</div>
                <div className="col-span-2 text-center">Role</div>
                <div className="col-span-2 text-center">Productivity</div>
                <div className="col-span-2 text-center">Utilization</div>
                <div className="col-span-2 text-right">Status</div>
              </div>
              <div className="divide-y divide-gray-100">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="grid grid-cols-12 gap-4 items-center py-3 px-6 hover:bg-gray-50 transition-colors">
                    <div className="col-span-4 flex items-center">
                      <UserCircleIcon className="h-8 w-8 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Employee {item}</p>
                        <p className="text-xs text-gray-500">Team {String.fromCharCode(64 + item)}</p>
                      </div>
                    </div>
                    <div className="col-span-2 text-center text-sm text-gray-500">
                      {['Developer', 'Designer', 'Manager', 'Analyst', 'Support'][item - 1]}
                    </div>
                    <div className="col-span-2 text-center">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {Math.floor(Math.random() * 30) + 70}%
                      </div>
                    </div>
                    <div className="col-span-2 text-center">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {Math.floor(Math.random() * 20) + 60}%
                      </div>
                    </div>
                    <div className="col-span-2 flex justify-end">
                      {item % 3 === 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <ExclamationCircleIcon className="-ml-0.5 mr-1.5 h-3 w-3 text-red-500" />
                          At Risk
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircleIcon className="-ml-0.5 mr-1.5 h-3 w-3 text-green-500" />
                          On Track
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
