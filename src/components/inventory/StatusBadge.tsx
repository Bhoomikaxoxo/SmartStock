import React from 'react';
import { getStockStatus } from '../../services/reorderEngine';

interface StatusBadgeProps {
  currentStock: number;
  minimumRequired: number;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ currentStock, minimumRequired }) => {
  const { status, color } = getStockStatus(currentStock, minimumRequired);

  const styleMap = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-800 border-amber-200/80',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const dotMap = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500 animate-pulse',
    slate: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styleMap[color]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotMap[color]}`} />
      <span>{status}</span>
    </span>
  );
};
