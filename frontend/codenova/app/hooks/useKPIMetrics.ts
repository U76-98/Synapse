'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchEmployeeData, getPrediction } from './useApi';

interface KPIMetrics {
  avgProductivity: number;
  activeEmployees: number;
  riskCases: number;
  avgUtilization: number;
  loading: boolean;
  error: string | null;
  lastUpdated?: string;
  refresh: () => Promise<void>;
}

export function useKPIMetrics(): KPIMetrics {
  const [metrics, setMetrics] = useState<Omit<KPIMetrics, 'loading' | 'error' | 'refresh'>>({
    avgProductivity: 0,
    activeEmployees: 0,
    riskCases: 0,
    avgUtilization: 0,
    lastUpdated: new Date().toISOString(),
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAndProcessData = useCallback(async () => {
    try {
      setLoading(true);
      const employees = await fetchEmployeeData();
      
      if (!employees || employees.length === 0) {
        throw new Error('No employee data available');
      }

      // Get predictions for all employees
      const predictions = await Promise.all(
        employees.map(employee => 
          getPrediction(employee.performance_metrics)
            .then(pred => ({
              ...pred,
              employeeId: employee.Employee_ID
            }))
            .catch(() => ({
              predicted_productivity: 0,
              confidence: 0,
              employeeId: employee.Employee_ID
            }))
        )
      );

      // Calculate metrics
      const activeEmployees = employees.length;
      const riskThreshold = 50; // Below 50% is considered 'at risk'
      
      const { totalProductivity, totalUtilization, highRiskCount } = employees.reduce(
        (acc, employee, index) => {
          const perf = employee.performance_metrics;
          const prediction = predictions[index] || {};
          
          return {
            totalProductivity: acc.totalProductivity + (prediction.predicted_productivity || 0),
            totalUtilization: acc.totalUtilization + (perf?.Utilization_Rate || 0),
            highRiskCount: acc.highRiskCount + ((prediction.predicted_productivity || 0) < riskThreshold ? 1 : 0)
          };
        },
        { totalProductivity: 0, totalUtilization: 0, highRiskCount: 0 }
        );

        setMetrics({
          avgProductivity: totalProductivity / activeEmployees,
          activeEmployees,
          riskCases: highRiskCount,
          avgUtilization: totalUtilization / activeEmployees,
        });
        setError(null);
      } catch (err) {
        console.error('Error loading KPI metrics:', err);
        setError('Failed to load metrics. Using sample data.');
        // Fallback to sample data
        setMetrics({
          avgProductivity: 10.5,
          activeEmployees: 2,
          riskCases: 1,
          avgUtilization: 86.6,
        });
      } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAndProcessData();
  }, [fetchAndProcessData]);

  // Add refresh function to return
  const refresh = useCallback(async () => {
    await fetchAndProcessData();
  }, [fetchAndProcessData]);

  return { ...metrics, loading, error, refresh };
}
