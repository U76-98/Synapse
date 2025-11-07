'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  ExclamationTriangleIcon, 
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';

interface KPIStatsCircleProps {
  title: string;
  value: number | string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  loading?: boolean;
}

const AnimatedNumber = ({ value }: { value: number | string }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey(prev => prev + 1);
    
    // Only animate if value is a number
    if (typeof value === 'number') {
      const start = typeof displayValue === 'number' ? displayValue : 0;
      const duration = 1000; // 1 second
      const startTime = performance.now();
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = start + (value - start) * progress;
        setDisplayValue(Math.round(currentValue * 10) / 10); // Round to 1 decimal
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  return <span key={key} className="inline-block">{displayValue}</span>;
};

export default function KPIStatsCircle({ 
  title, 
  value, 
  icon: Icon,
  trend = 'neutral',
  trendValue = '',
  className = '',
  loading = false
}: KPIStatsCircleProps) {
  const trendConfig = useMemo(() => ({
    up: {
      color: 'text-green-500',
      bg: 'bg-green-50',
      icon: <ArrowUpIcon className="w-4 h-4" />,
      text: 'text-green-700',
    },
    down: {
      color: 'text-red-500',
      bg: 'bg-red-50',
      icon: <ArrowDownIcon className="w-4 h-4" />,
      text: 'text-red-700',
    },
    neutral: {
      color: 'text-gray-500',
      bg: 'bg-gray-50',
      icon: <ArrowsRightLeftIcon className="w-4 h-4" />,
      text: 'text-gray-700',
    },
  }), []);

  const iconColorMap = useMemo(() => ({
    'Productivity': 'text-green-500',
    'Active': 'text-blue-500',
    'Risk': 'text-amber-500',
    'Utilization': 'text-purple-500',
  }), []);

  const iconBgMap = useMemo(() => ({
    'Productivity': 'bg-green-50',
    'Active': 'bg-blue-50',
    'Risk': 'bg-amber-50',
    'Utilization': 'bg-purple-50',
  }), []);

  const icon = useMemo(() => {
    if (Icon) return <Icon className="w-6 h-6" />;
    
    const iconMap = {
      'Productivity': <ChartBarIcon className="w-6 h-6" />,
      'Active': <UserGroupIcon className="w-6 h-6" />,
      'Risk': <ExclamationTriangleIcon className="w-6 h-6" />,
      'Utilization': <ClockIcon className="w-6 h-6" />,
    };
    
    return iconMap[title.split(' ')[0] as keyof typeof iconMap] || null;
  }, [Icon, title]);

  const iconType = title.split(' ')[0];
  const trendData = trendConfig[trend];
  const iconColor = iconColorMap[iconType as keyof typeof iconColorMap] || 'text-gray-500';
  const iconBg = iconBgMap[iconType as keyof typeof iconBgMap] || 'bg-gray-50';

  if (loading) {
    return (
      <div className={`p-6 bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-6 rounded-full bg-gray-200"></div>
          <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 ${className}`}>
      <div className={`p-3 mb-4 rounded-full ${iconBg} w-12 h-12 flex items-center justify-center`}>
        {icon && React.cloneElement(icon, { className: `${iconColor} w-6 h-6` })}
      </div>
      
      <div className="flex items-baseline">
        <span className="text-2xl md:text-3xl font-bold text-gray-900">
          {typeof value === 'number' ? <AnimatedNumber value={value} /> : value ?? '–'}
        </span>
        {title.includes('%') && (
          <span className="ml-1 text-sm text-gray-500">%</span>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-1">
        <span className="text-sm font-medium text-gray-500">
          {title}
        </span>
        
        {trendValue && (
          <div className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${trendData.bg} ${trendData.text}`}>
            <span className="mr-1">{trendData.icon}</span>
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Container component for KPI stats
export function KPIStatsContainer({ children, className = '' }: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full ${className}`}>
      {children}
    </div>
  );
}
