import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral' | 'warning';
  iconBgColor?: string;
  iconColor?: string;
  onClick?: () => void;
  highlight?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  trendType = 'neutral',
  iconBgColor = 'bg-blue-50',
  iconColor = 'text-blue-600',
  onClick,
  highlight = false
}) => {
  const getTrendColor = () => {
    switch (trendType) {
      case 'positive':
        return 'text-emerald-600 bg-emerald-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      case 'warning':
        return 'text-amber-700 bg-amber-50';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`stat-card relative overflow-hidden transition-all duration-300 ${
        highlight ? 'ring-2 ring-blue-500/20 shadow-md' : ''
      } ${onClick ? 'cursor-pointer hover:border-blue-200' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 line-clamp-1">
            {label}
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {value}
          </h3>
          {trend && (
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${getTrendColor()}`}>
                {trend}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-2xl ${iconBgColor} shrink-0`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};
