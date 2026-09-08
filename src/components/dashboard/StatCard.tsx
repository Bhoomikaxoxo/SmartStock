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
  const getCardTheme = () => {
    if (alertLevel === 'critical') {
      return {
        border: 'border-rose-200/90 hover:border-rose-300 dark:border-slate-800 dark:hover:border-rose-700/60',
        bg: 'bg-white',
        iconBg: 'bg-rose-50 text-rose-600 border border-rose-200/60',
        accentBar: 'bg-rose-500',
      };
    }
    if (alertLevel === 'warning') {
      return {
        border: 'border-amber-200/90 hover:border-amber-300 dark:border-slate-800 dark:hover:border-amber-700/60',
        bg: 'bg-white',
        iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/60',
        accentBar: 'bg-amber-500',
      };
    }
    return {
      border: 'border-slate-200/80 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-600',
      bg: 'bg-white',
      iconBg: 'bg-slate-50 text-slate-600 border border-slate-200/60',
      accentBar: 'bg-emerald-500',
    };
  };

  const theme = getCardTheme();

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-5 border shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 ${theme.bg} ${theme.border} ${
        onClick ? 'cursor-pointer group' : ''
      }`}
    >
      {/* Top micro accent bar (Original light theme; hidden in dark mode) */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${theme.accentBar} dark:hidden`} />

      <div className="flex items-start justify-between">
        <div className="flex-1 pr-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 tracking-tight font-mono tabular-nums">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 font-medium truncate">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${theme.iconBg}`}
          >
            <Icon className="w-5 h-5 stroke-[2]" />
          </div>
        )}
      </div>

      {change && (
        <div className="mt-3.5 pt-3 border-t border-slate-100/90 flex items-center justify-between text-xs">
          <span
            className={`font-bold flex items-center space-x-1.5 ${
              alertLevel === 'critical'
                ? 'text-rose-600'
                : alertLevel === 'warning'
                ? 'text-amber-600'
                : isPositive
                ? 'text-emerald-700'
                : 'text-slate-600'
            }`}
          >
            <span className="text-xs">{isPositive ? '↑' : '•'}</span>
            <span>{change}</span>
          </span>
          <span className="text-slate-400 text-[11px] font-medium">vs last month</span>
        </div>
      )}
    </div>
  );
};
