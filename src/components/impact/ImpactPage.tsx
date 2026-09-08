import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Calculator,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrencyINR } from '../../services/reorderEngine';

export const ImpactPage: React.FC = () => {
  const { financialConfig, updateFinancialConfig } = useApp();
  const { currentUser } = useAuth();
  const { tokens } = useTheme();

  const { incidentsBefore, avgLossPerIncident, incidentsAfter } = financialConfig;

  // Formula calculations (Section 5 Spec)
  const monthlyLossBefore = incidentsBefore * avgLossPerIncident;
  const monthlyLossAfter = incidentsAfter * avgLossPerIncident;
  const monthlySavings = Math.max(0, monthlyLossBefore - monthlyLossAfter);
  const annualSavings = monthlySavings * 12;

  // SaaS Cost Comparison
  const annualSaasCost = 999 * 12; // ₹11,988
  const roiMultiplier = annualSavings > 0 ? (annualSavings / annualSaasCost).toFixed(1) : '0';

  // Role Gate - silently return null if not owner
  if (currentUser?.role !== 'owner') {
    return null;
  }

  const comparisonData = [
    {
      period: 'Monthly Loss',
      Before: monthlyLossBefore,
      After: monthlyLossAfter,
    },
    {
      period: 'Annualized Loss',
      Before: monthlyLossBefore * 12,
      After: monthlyLossAfter * 12,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2.5">
            <Calculator className="w-6 h-6 text-amber-600 stroke-[2.2]" />
            <span>Financial Impact & ROI Calculator</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Quantifying bottom-line savings from stockout prevention and automated reordering.
          </p>
        </div>

        <button
          onClick={() =>
            updateFinancialConfig({
              incidentsBefore: 5,
              avgLossPerIncident: 2000,
              incidentsAfter: 1,
            })
          }
          className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl border border-slate-200/90 shadow-2xs transition flex items-center space-x-1.5 self-start cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Default Benchmarks</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Monthly Saved Revenue
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono tabular-nums mt-1">
            {formatCurrencyINR(monthlySavings)}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Preserved from unfulfilled orders</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Annual Cumulative Savings
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tabular-nums mt-1">
            {formatCurrencyINR(annualSavings)}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Annual retail margin protection</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Net ROI Multiplier
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tabular-nums mt-1">
            {roiMultiplier}x ROI
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Against ₹999/mo plan cost</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-teal-500" />
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Stockout Drop
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tabular-nums mt-1">
            {Math.round(((incidentsBefore - incidentsAfter) / (incidentsBefore || 1)) * 100)}% Drop
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">From {incidentsBefore} to {incidentsAfter} / mo</p>
        </div>
      </div>

      {/* Sliders vs Before/After Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Adjust Operating Benchmarks
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize values to match your store volume
            </p>
          </div>

          {/* Slider 1 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700">Stockouts / Month (Before)</label>
              <span className="font-extrabold text-rose-600 font-mono tabular-nums">
                {incidentsBefore} incidents
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={incidentsBefore}
              onChange={(e) =>
                updateFinancialConfig({ incidentsBefore: parseInt(e.target.value) || 1 })
              }
              className="w-full accent-rose-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Slider 2 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700">Avg Loss / Stockout</label>
              <span className="font-extrabold text-slate-900 font-mono tabular-nums">
                {formatCurrencyINR(avgLossPerIncident)}
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="15000"
              step="250"
              value={avgLossPerIncident}
              onChange={(e) =>
                updateFinancialConfig({ avgLossPerIncident: parseInt(e.target.value) || 500 })
              }
              className="w-full accent-amber-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Slider 3 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700">Stockouts / Month (With SmartStock)</label>
              <span className="font-extrabold text-emerald-700 font-mono tabular-nums">
                {incidentsAfter} incident
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={incidentsAfter}
              onChange={(e) =>
                updateFinancialConfig({ incidentsAfter: parseInt(e.target.value) || 0 })
              }
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl text-xs space-y-1">
            <div className="font-bold text-emerald-950 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Payback Period: &lt; 4 Days</span>
            </div>
            <p className="text-emerald-800 text-[11px] leading-relaxed">
              At {formatCurrencyINR(monthlySavings)}/mo protected revenue, the ₹999/mo plan cost is recouped in the first week.
            </p>
          </div>
        </div>

        {/* Before vs After Chart & Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Before vs. After Financial Comparison
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Loss before SmartStock vs. loss with automated replenishment
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={tokens.chart.grid} />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: tokens.chart.axisText }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: tokens.chart.axisText }}
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrencyINR(Number(val)), 'Loss Amount']}
                  contentStyle={{
                    backgroundColor: tokens.chart.tooltipBg,
                    borderColor: tokens.chart.tooltipBorder,
                    color: tokens.textPrimary,
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.4)',
                    padding: '8px 12px',
                  }}
                  itemStyle={{ color: tokens.textPrimary }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Before" name="Before SmartStock" fill={tokens.status.critical} radius={[6, 6, 0, 0]} />
                <Bar dataKey="After" name="With Automated Buffers" fill={tokens.status.healthy} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Net Estimated Annual Benefit:</span>
            <span className="text-base font-black text-emerald-700 font-mono tabular-nums">
              +{formatCurrencyINR(annualSavings)} / yr
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
