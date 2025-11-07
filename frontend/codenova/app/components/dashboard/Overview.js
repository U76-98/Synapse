'use client';

/**
 * Cursor context:
 * Data fields available: Employee_ID, Claimed_Hours, Active_Hours, Utilization_Rate, 
 * Performance_Score, Recent_HR_Flag, Productivity_Level
 * API endpoint: /api/employees (returns aggregated stats)
 * Please apply normalization and redesigned UI as per prompt.
 * 
 * KPI Calculation Logic:
 * - Average Productivity: Normalize Performance_Score (0-15) to percentage: (avg / 15) * 100
 * - Active Employees: Count unique Employee_IDs
 * - Predicted Risk Cases: Count employees with Recent_HR_Flag == 1
 * - Average Utilization Rate: Mean of Utilization_Rate (already 0-100), show as percentage
 */

import { useEffect, useState } from 'react';
import { fetchEmployeeData } from '../../hooks/useApi';

export default function Overview() {
  const [kpis, setKpis] = useState({
    averageProductivity: 0,
    activeEmployees: 0,
    predictedRiskCases: 0,
    avgUtilizationRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadKPIs = async () => {
      try {
        setLoading(true);
        
        // Load employee data with timeout
        const employees = await Promise.race([
          fetchEmployeeData(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Data fetch timeout')), 10000)
          )
        ]);
        
        console.log(`📊 Overview: Fetched ${Array.isArray(employees) ? employees.length : 0} employees for KPI calculations`);
        
        if (employees && Array.isArray(employees) && employees.length > 0) {
          // Filter employees with valid performance metrics
          const employeesWithMetrics = employees.filter(emp => emp.performance_metrics);
          
          if (employeesWithMetrics.length > 0) {
            // 1. Average Productivity: Normalize to percentage (Performance_Score / 15 * 100)
            const avgPerformanceScore = employeesWithMetrics.reduce((sum, emp) => {
              const score = parseFloat(emp.performance_metrics?.Performance_Score) || 0;
              return sum + score;
            }, 0) / employeesWithMetrics.length;
            const normalizedProductivity = (avgPerformanceScore / 15) * 100;

            // 2. Active Employees: Count unique Employee_IDs
            const uniqueEmployeeIds = new Set(employees.map(emp => emp.Employee_ID));
            const activeEmployees = uniqueEmployeeIds.size;

            // 3. Predicted Risk Cases: Count employees with Recent_HR_Flag == 1
            const riskCases = employeesWithMetrics.filter(emp => {
              const hrFlag = parseInt(emp.performance_metrics?.Recent_HR_Flag) || 0;
              return hrFlag === 1;
            }).length;

            // 4. Average Utilization Rate: Mean of Utilization_Rate (already 0-100), round to 1 decimal
            const avgUtilization = employeesWithMetrics.reduce((sum, emp) => {
              const utilization = parseFloat(emp.performance_metrics?.Utilization_Rate) || 0;
              return sum + utilization;
            }, 0) / employeesWithMetrics.length;

            setKpis({
              averageProductivity: Math.round(normalizedProductivity),
              activeEmployees,
              predictedRiskCases: riskCases,
              avgUtilizationRate: parseFloat(avgUtilization.toFixed(1)) // Round to 1 decimal place
            });
          } else {
            // No employees with metrics
            setKpis({
              averageProductivity: 0,
              activeEmployees: employees.length,
              predictedRiskCases: 0,
              avgUtilizationRate: 0
            });
          }
        } else {
          // No employees data
          setKpis({
            averageProductivity: 0,
            activeEmployees: 0,
            predictedRiskCases: 0,
            avgUtilizationRate: 0
          });
        }
      } catch (error) {
        console.error('Error loading KPIs:', error);
        // Set default values on error - don't leave loading state
        setKpis({
          averageProductivity: 0,
          activeEmployees: 0,
          predictedRiskCases: 0,
          avgUtilizationRate: 0
        });
      } finally {
        // Always set loading to false, even on error
        setLoading(false);
      }
    };

    loadKPIs();
  }, []);

  const kpiCards = [
    {
      label: 'Average Productivity',
      value: loading ? '...' : `${kpis.averageProductivity}%`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100'
    },
    {
      label: 'Active Employees',
      value: loading ? '...' : kpis.activeEmployees,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100'
    },
    {
      label: 'Predicted Risk Cases',
      value: loading ? '...' : kpis.predictedRiskCases,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      iconBg: 'bg-red-100'
    },
    {
      label: 'Avg Utilization Rate',
      value: loading ? '...' : `${(kpis.avgUtilizationRate || 0).toFixed(1)}%`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100'
    }
  ];

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${kpi.iconBg} ${kpi.color}`}>
                {kpi.icon}
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-2">{kpi.label}</p>
            <p className={`text-3xl font-bold ${kpi.color}`}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
