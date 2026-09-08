import React from 'react';
import { getStockStatus } from '../../services/reorderEngine';

interface StatusBadgeProps {
  currentStock: number;
  minimumRequired: number;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ currentStock, minimumRequired }) => {
  const { status, color } = getStockStatus(currentStock, minimumRequired);

  const styleMap = {
    emerald: 'bg-emerald-50/90 text-emerald-800 border-emerald-200/90 shadow-2xs',
    amber: 'bg-amber-50/90 text-amber-900 border-amber-200/90 shadow-2xs',
    rose: 'bg-rose-50/90 text-rose-800 border-rose-200/90 shadow-2xs',
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
      className={`inline-flex items-center space-x-1.5 px-2.5 py-0.8 rounded-full text-xs font-bold border ${styleMap[color]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotMap[color]}`} />
      <span>{status}</span>
    </span>
  );
};
