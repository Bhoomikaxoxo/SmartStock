import React from 'react';
import { Target, CheckCircle2 } from 'lucide-react';

export const KpiProgress: React.FC = () => {
  const kpis = [
    {
      title: 'Stockout Incidents Reduction',
      target: '-30%',
      current: '-28%',
      progress: 93,
      status: 'On Track',
      color: 'from-emerald-500 to-emerald-600',
      description: 'Down from 5 incidents/mo to 1 incident/mo',
    },
    {
      title: 'Excess Inventory Cut',
      target: '-20%',
      current: '-18%',
      progress: 90,
      status: 'On Track',
      color: 'from-amber-500 to-amber-600',
      description: 'Reduced stagnant holding of bulk sugar & flour',
    },
    {
      title: 'Sales Availability Rate',
      target: '98%',
      current: '96.4%',
      progress: 98,
      status: 'Target Met',
      color: 'from-emerald-500 to-teal-600',
      description: 'Percentage of customer menu requests fulfilled',
    },
    {
      title: 'Working Capital Efficiency',
      target: '+25%',
      current: '+22%',
      progress: 88,
      status: 'Optimal',
      color: 'from-blue-500 to-indigo-600',
      description: 'Optimized reorder frequency without tying cash',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60">
            <Target className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Operational Goals vs. Benchmarks
            </h3>
            <p className="text-xs text-slate-500">Q3 Bakery Operations Targets</p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/50">
          Q3 2026
        </span>
      </div>

      <div className="space-y-3">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/60 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="font-bold text-slate-800 flex items-center space-x-2">
                <span>{kpi.title}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white text-slate-500 border border-slate-200/80 font-mono">
                  Goal: {kpi.target}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 font-mono text-xs">
                <span className="font-extrabold text-slate-900">{kpi.current}</span>
                <span className="text-slate-400 text-[11px]">({kpi.progress}%)</span>
              </div>
            </div>

            {/* Gradient progress track */}
            <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${kpi.color} transition-all duration-500`}
                style={{ width: `${Math.min(100, kpi.progress)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
              <span className="truncate pr-2">{kpi.description}</span>
              <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold shrink-0">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{kpi.status}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
