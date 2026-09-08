import React from 'react';
import { Target } from 'lucide-react';

export const KpiProgress: React.FC = () => {
  const kpis = [
    {
      title: 'Stockout Incidents Reduction',
      target: '-30%',
      current: '-28%',
      progress: 93,
      status: 'On Track',
      description: 'Down from 5 incidents/mo to 1 incident/mo',
    },
    {
      title: 'Excess Inventory Cut',
      target: '-20%',
      current: '-18%',
      progress: 90,
      status: 'On Track',
      description: 'Reduced stagnant holding of bulk sugar & flour',
    },
    {
      title: 'Sales Availability Rate',
      target: '98%',
      current: '96.4%',
      progress: 98,
      status: 'Target Met',
      description: 'Percentage of customer menu requests fulfilled',
    },
    {
      title: 'Working Capital Efficiency',
      target: '+25%',
      current: '+22%',
      progress: 88,
      status: 'Optimal',
      description: 'Optimized reorder frequency without tying cash',
    },
  ];

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900">Operational Objectives vs. Bakery Targets</h3>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Q3 Operational Goals</span>
      </div>

      <div className="space-y-3.5">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-slate-50/80 border border-slate-200/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="font-semibold text-slate-800 flex items-center space-x-2">
                <span>{kpi.title}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-slate-500 border border-slate-200">
                  Target: {kpi.target}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 font-mono text-xs">
                <span className="font-bold text-slate-900">{kpi.current}</span>
                <span className="text-slate-400">({kpi.progress}%)</span>
              </div>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-1.5 rounded-full bg-amber-600 transition-all duration-300"
                style={{ width: `${Math.min(100, kpi.progress)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
              <span>{kpi.description}</span>
              <span className="text-emerald-700 font-medium">{kpi.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
