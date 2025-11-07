'use client';

import { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Cell
} from 'recharts';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E'];

const generateMockData = (period: string) => {
  const teams = ['Engineering', 'Design', 'Marketing', 'Sales', 'Support'];
  const data = [];
  
  for (let i = 0; i < teams.length; i++) {
    data.push({
      name: teams[i],
      utilization: Math.floor(Math.random() * 30) + 60, // 60-90%
      target: 75,
    });
  }
  
  return data;
};

export default function UtilizationChart() {
  const [timeRange, setTimeRange] = useState('week');
  const [data, setData] = useState(generateMockData('week'));
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setData(generateMockData(timeRange));
      setIsLoading(false);
    }, 500);
  };

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setData(generateMockData(range));
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Team Utilization</h3>
        <div className="flex items-center space-x-2">
          <select 
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            className="text-sm border-0 bg-transparent text-gray-500 focus:outline-none focus:ring-0"
            disabled={isLoading}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">Last 3 Months</option>
          </select>
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh data"
          >
            <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 min-h-[300px]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading data...</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ 
                  color: '#1e293b',
                  fontWeight: 500,
                  marginBottom: '0.25rem',
                  fontSize: '0.75rem'
                }}
                itemStyle={{ 
                  color: '#475569',
                  fontSize: '0.75rem',
                  padding: '0.125rem 0'
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'target') return [value, 'Target'];
                  return [`${value}%`, 'Utilization'];
                }}
                labelFormatter={(label) => `Team: ${label}`}
              />
              <Legend 
                verticalAlign="top"
                height={36}
                formatter={(value) => {
                  if (value === 'utilization') return 'Utilization';
                  return value;
                }}
              />
              <Bar 
                dataKey="utilization" 
                name="Utilization"
                radius={[4, 4, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
              <Bar 
                dataKey="target" 
                name="Target"
                radius={[4, 4, 0, 0]}
                fill="#EF4444"
                fillOpacity={0.2}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
