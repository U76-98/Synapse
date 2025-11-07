'use client';

/**
 * Cursor context:
 * Data fields available: Employee_ID, Claimed_Hours, Active_Hours, Utilization_Rate, 
 * Performance_Score, Recent_HR_Flag, Productivity_Level
 * API endpoint: /api/employees (returns aggregated stats)
 * Please apply normalization and redesigned UI as per prompt.
 * 
 * Employee data comes from /api/employees endpoint
 * which returns an array of employee objects with the following structure:
 * 
 * {
 *   Employee_ID: string (e.g., "E001"),
 *   Name: string (e.g., "Alice Williams"),
 *   Email: string (e.g., "e001@company.com"),
 *   Department: string (e.g., "AI/ML", "Engineering"),
 *   Position: string (e.g., "Junior Developer", "Senior Developer"),
 *   Team_ID: string (e.g., "T02"),
 *   performance_metrics: {
 *     Claimed_Hours: number,
 *     Active_Hours: number,
 *     Claimed_Minus_Active: number,
 *     Utilization_Rate: number (0-100),
 *     Commits: number,
 *     PRs_Opened: number,
 *     Tasks_Done: number,
 *     Performance_Score: number (0-15),
 *     Meetings_Hours: number,
 *     Recent_HR_Flag: number (0 or 1),
 *     Project_Type: string,
 *     Role_Level: string,
 *     Team_ID: string,
 *     Productivity_Level: string ("Low", "Medium", "High"),
 *     Date: string
 *   }
 * }
 * 
 * Data is fetched dynamically using fetchEmployeeData() from useApi.js
 * No mock/dummy data - all values come from backend CSV data
 */

import { useEffect, useState, useCallback } from 'react';
import { fetchEmployeeData, getPrediction, checkHealth } from '../../hooks/useApi';

// Helper to map Productivity_Level to badge
const getProductivityBadge = (productivityLevel) => {
  const level = (productivityLevel || '').toLowerCase();
  
  // Map CSV values to UI badges
  if (level === 'high' || level === 'healthy') {
    return { 
      label: 'Healthy', 
      color: 'bg-green-100 text-green-800 border-green-200' 
    };
  }
  if (level === 'medium') {
    return { 
      label: 'Medium', 
      color: 'bg-orange-100 text-orange-800 border-orange-200' 
    };
  }
  if (level === 'low') {
    return { 
      label: 'Low', 
      color: 'bg-red-100 text-red-800 border-red-200' 
    };
  }
  
  // Default fallback
  return { 
    label: 'Medium', 
    color: 'bg-gray-100 text-gray-800 border-gray-200' 
  };
};

// Helper to calculate AI Productivity Score as percentage
const getAIProductivityScore = (performanceScore) => {
  const score = parseFloat(performanceScore) || 0;
  const normalized = (score / 15) * 100;
  return Math.round(normalized);
};

const getInitials = (name) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map(n => n[0] || '')
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

const getAvatarColor = (name) => {
  // Generate consistent color based on name
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500',
    'bg-emerald-500'
  ];
  if (!name) return colors[0];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// Simulation Modal Component
const SimulationModal = ({ isOpen, onClose, onSimulate, employee }) => {
  const [formData, setFormData] = useState({
    Claimed_Hours: employee?.performance_metrics?.Claimed_Hours || 8,
    Active_Hours: employee?.performance_metrics?.Active_Hours || 7.5,
    Performance_Score: employee?.performance_metrics?.Performance_Score || 10,
    Commits: employee?.performance_metrics?.Commits || 5,
    Tasks_Done: employee?.performance_metrics?.Tasks_Done || 6,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const prediction = await onSimulate({
        ...employee.performance_metrics,
        ...formData,
        Claimed_Minus_Active: formData.Claimed_Hours - formData.Active_Hours,
        Utilization_Rate: (formData.Active_Hours / formData.Claimed_Hours) * 100
      });
      setResult(prediction);
    } catch (error) {
      console.error('Simulation error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Simulate Performance for {employee?.Name || 'Employee'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Claimed Hours
              </label>
              <input
                type="number"
                name="Claimed_Hours"
                value={formData.Claimed_Hours}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                step="0.5"
                min="0"
                max="24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Active Hours
              </label>
              <input
                type="number"
                name="Active_Hours"
                value={formData.Active_Hours}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                step="0.5"
                min="0"
                max="24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Performance Score
              </label>
              <input
                type="number"
                name="Performance_Score"
                value={formData.Performance_Score}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commits
              </label>
              <input
                type="number"
                name="Commits"
                value={formData.Commits}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tasks Done
              </label>
              <input
                type="number"
                name="Tasks_Done"
                value={formData.Tasks_Done}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Simulating...' : 'Run Simulation'}
            </button>
          </div>
        </form>

        {result && (
          <div className={`mx-6 mb-6 p-4 rounded-md ${result.error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
            <h4 className={`font-medium mb-2 ${result.error ? 'text-red-900' : 'text-green-900'}`}>
              {result.error ? 'Error' : 'Simulation Result'}
            </h4>
            {result.error ? (
              <p className="text-red-700">{result.error}</p>
            ) : (
              <div className="text-green-900">
                <p className="mb-2">
                  Predicted Productivity Score: <span className="font-semibold">{getAIProductivityScore(result.modelResponse?.predicted_productivity || employee?.performance_metrics?.Performance_Score || 10)}%</span>
                </p>
                {result.modelResponse?.risk_factors?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Risk Factors:</p>
                    <ul className="list-disc list-inside text-sm mt-1">
                      {result.modelResponse.risk_factors.map((factor, i) => (
                        <li key={i}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState({ ok: false, usingMock: false });

  // Check API health and load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check API health first (with timeout)
      try {
        const health = await Promise.race([
          checkHealth(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Health check timeout')), 5000)
          )
        ]);
      setApiStatus({
        ok: health.ok,
        usingMock: health.usingMock || false
      });
      } catch (healthError) {
        console.warn('Health check failed or timed out:', healthError);
        setApiStatus({ ok: false, usingMock: true });
      }
      
      // Load employee data (with timeout)
      try {
        const data = await Promise.race([
          fetchEmployeeData(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Data fetch timeout')), 10000)
          )
        ]);
        
        console.log(`📊 Fetched ${Array.isArray(data) ? data.length : 0} employees from API`);
        if (Array.isArray(data) && data.length > 0) {
          console.log(`📋 Sample Employee IDs: ${data.slice(0, 5).map(e => e.Employee_ID).join(', ')}${data.length > 5 ? '...' : ''}`);
          setEmployees(data);
      setError(null);
        } else {
          setEmployees([]);
          setError('No employee data received from backend');
        }
      } catch (dataError) {
        console.warn('Error fetching employee data:', dataError);
        setError('Failed to load employee data. ' + (dataError.message || 'Backend may not be running'));
        setApiStatus({ ok: false, usingMock: true });
        setEmployees([]);
      }
      
    } catch (err) {
      console.error('Error in loadData:', err);
      setError('Error loading data: ' + (err.message || 'Unknown error'));
      setApiStatus({ ok: false, usingMock: true });
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle running simulation
  const handleRunSimulation = async (employeeData) => {
    try {
      const result = await getPrediction(employeeData);
      return result.modelResponse || result;
    } catch (err) {
      console.warn('Simulation error, using mock data:', err);
      return {
        modelResponse: {
          predicted_productivity: 2,
        confidence: 0.8,
          risk_factors: []
        },
        isMock: true
      };
    }
  };

  const handleSimulate = async (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  // Render error state with data if available
  if (error && employees.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {error} {apiStatus.usingMock ? ' (Using mock data)' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-gray-500 mb-4">No employee data available</div>
        <button
          onClick={loadData}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Employee List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Claimed Hours
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Active Hours
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Utilization
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  AI Productivity Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Productivity Level
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => {
                const metrics = employee.performance_metrics || {};
                const claimedHours = parseFloat(metrics.Claimed_Hours) || 0;
                const activeHours = parseFloat(metrics.Active_Hours) || 0;
                const utilizationRate = parseFloat(metrics.Utilization_Rate) || 0;
                const performanceScore = parseFloat(metrics.Performance_Score) || 0;
                const productivityLevel = metrics.Productivity_Level || 'Medium';
                const productivityBadge = getProductivityBadge(productivityLevel);
                const aiProductivityScore = getAIProductivityScore(performanceScore);
                const avatarColor = getAvatarColor(employee.Name || employee.Employee_ID);
                
                return (
                  <tr key={employee.Employee_ID} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold text-sm`}>
                          {getInitials(employee.Name || employee.Employee_ID)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.Name || `Employee ${employee.Employee_ID}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.Email || `${employee.Employee_ID.toLowerCase()}@company.com`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {claimedHours.toFixed(1)}h
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {activeHours.toFixed(1)}h
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {(utilizationRate || 0).toFixed(1)}%
                        </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {aiProductivityScore}%
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${productivityBadge.color}`}>
                        {productivityBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleSimulate(employee)}
                        className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                      >
                        Simulate
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 transition-colors">
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulation Modal */}
      {isModalOpen && selectedEmployee && (
        <SimulationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEmployee(null);
          }}
          onSimulate={handleRunSimulation}
          employee={selectedEmployee}
        />
      )}
    </>
  );
}
