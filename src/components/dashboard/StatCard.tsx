import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  alertLevel?: 'none' | 'warning' | 'critical';
  icon?: LucideIcon;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  alertLevel = 'none',
  icon: Icon,
  onClick,
}) => {
  const getBorderHighlight = () => {
    if (alertLevel === 'critical') return 'border-rose-300 bg-rose-50/20';
    if (alertLevel === 'warning') return 'border-amber-300 bg-amber-50/20';
    return 'border-slate-200/80 bg-white hover:border-slate-300';
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-5 border transition-all duration-150 ${getBorderHighlight()} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight font-mono">
            {value}
          </h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div
            className={`p-2 rounded-lg text-slate-400 ${
              alertLevel === 'critical'
                ? 'text-rose-600'
                : alertLevel === 'warning'
                ? 'text-amber-600'
                : 'text-slate-400'
            }`}
          >
            <Icon className="w-5 h-5 stroke-[1.8]" />
          </div>
        )}
      </div>

      {change && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span
            className={`font-semibold flex items-center space-x-1 ${
              alertLevel === 'critical'
                ? 'text-rose-600'
                : alertLevel === 'warning'
                ? 'text-amber-600'
                : isPositive
                ? 'text-emerald-700'
                : 'text-slate-600'
            }`}
          >
            <span>{isPositive ? '↑' : '•'}</span>
            <span>{change}</span>
          </span>
          <span className="text-slate-400 text-[11px]">vs last month</span>
        </div>
      )}
    </div>
  );
};
