'use client';

import { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceLine
} from 'recharts';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const generateMockData = (period: string) => {
  const data = [];
  const now = new Date();
  const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      productivity: Math.floor(Math.random() * 20) + 70, // 70-90
      target: 80,
    });
  }
  
  return data;
};

export default function ProductivityChart() {
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
        <h3 className="text-lg font-medium text-gray-900">Team Productivity</h3>
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
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorProductivity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
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
                formatter={(value: number) => [`${value}%`, 'Productivity']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <ReferenceLine 
                y={80} 
                stroke="#EF4444" 
                strokeDasharray="3 3"
                label={{
                  value: 'Target',
                  position: 'right',
                  fill: '#EF4444',
                  fontSize: 12,
                }}
              />
              <Area 
                type="monotone" 
                dataKey="productivity" 
                stroke="#10B981" 
                fillOpacity={1} 
                fill="url(#colorProductivity)"
                strokeWidth={2}
                dot={{
                  stroke: '#10B981',
                  strokeWidth: 2,
                  fill: '#ffffff',
                  r: 3,
                  strokeDasharray: ''
                }}
                activeDot={{
                  stroke: '#10B981',
                  strokeWidth: 2,
                  fill: '#ffffff',
                  r: 5
                }}
              />
              <Legend 
                verticalAlign="top"
                height={36}
                formatter={(value) => {
                  if (value === 'productivity') return 'Productivity';
                  return value;
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
