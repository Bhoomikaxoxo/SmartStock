import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
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
  CheckCircle,
  Lock,
} from 'lucide-react';
import { formatCurrencyINR } from '../../services/reorderEngine';

export const ImpactPage: React.FC = () => {
  const { financialConfig, updateFinancialConfig, stockouts } = useApp();
  const { currentUser } = useAuth();

  const { incidentsBefore, avgLossPerIncident, incidentsAfter } = financialConfig;

  // Formula calculations (Section 5 Spec)
  const monthlyLossBefore = incidentsBefore * avgLossPerIncident;
  const monthlyLossAfter = incidentsAfter * avgLossPerIncident;
  const monthlySavings = Math.max(0, monthlyLossBefore - monthlyLossAfter);
  const annualSavings = monthlySavings * 12;

  // SaaS Cost Comparison
  const annualSaasCost = 999 * 12; // ₹11,988
  const roiMultiplier = annualSavings > 0 ? (annualSavings / annualSaasCost).toFixed(1) : '0';

  // Role Gate
  if (currentUser?.role !== 'owner') {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto my-12">
        <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center mx-auto mb-3">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Owner Access Required</h2>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          The Financial Impact & Savings Calculator contains confidential revenue and margin data. Only bakery owners can access this module.
        </p>
      </div>
    );
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
            <Calculator className="w-6 h-6 text-amber-600" />
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
          className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center space-x-1.5 self-start cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Default Benchmarks</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Monthly Saved Revenue
          </p>
          <h3 className="text-3xl font-extrabold text-emerald-700 font-mono mt-1">
            {formatCurrencyINR(monthlySavings)}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Preserved from unfulfilled orders</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Annual Cumulative Savings
          </p>
          <h3 className="text-3xl font-extrabold text-slate-900 font-mono mt-1">
            {formatCurrencyINR(annualSavings)}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Annual margin protection</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Net ROI Multiplier
          </p>
          <h3 className="text-3xl font-extrabold text-slate-900 font-mono mt-1">
            {roiMultiplier}x ROI
          </h3>
          <p className="text-xs text-slate-500 mt-1">Against ₹999/mo plan cost</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Stockout Drop
          </p>
          <h3 className="text-3xl font-extrabold text-slate-900 font-mono mt-1">
            {Math.round(((incidentsBefore - incidentsAfter) / (incidentsBefore || 1)) * 100)}% Drop
          </h3>
          <p className="text-xs text-slate-500 mt-1">From {incidentsBefore} to {incidentsAfter} / mo</p>
        </div>
      </div>

      {/* Sliders vs Before/After Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Adjust Operating Benchmarks</h3>
            <p className="text-xs text-slate-500">
              Customize values to match your store volume
            </p>
          </div>

          {/* Slider 1 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700">Stockouts / Month (Before)</label>
              <span className="font-bold text-rose-600 font-mono">{incidentsBefore} incidents</span>
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
              className="w-full accent-rose-600 cursor-pointer"
            />
          </div>

          {/* Slider 2 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700">Avg Loss / Stockout</label>
              <span className="font-bold text-slate-900 font-mono">
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
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          {/* Slider 3 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700">Stockouts / Month (With System)</label>
              <span className="font-bold text-emerald-700 font-mono">{incidentsAfter} incident</span>
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
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Payback Period: &lt; 4 Days</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              At ₹{monthlySavings.toLocaleString('en-IN')}/mo protected revenue, the ₹999/mo plan cost is recouped in the first week.
            </p>
          </div>
        </div>

        {/* Before vs After Chart & Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Before vs. After Revenue Protection</h3>
            <p className="text-xs text-slate-500">Comparing manual guessing vs automated lead-time reordering</p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrencyINR(Number(val)), 'Revenue Lost']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Before" name="Before SmartStock" fill="#e11d48" radius={[4, 4, 0, 0]} />
                <Bar dataKey="After" name="With Automated Buffer" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Section 5 Exact Table Layout */}
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Metric</th>
                  <th className="py-2.5 px-3">Before SmartStock</th>
                  <th className="py-2.5 px-3">After SmartStock</th>
                  <th className="py-2.5 px-3 text-right">Net Difference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-2.5 px-3 text-slate-700">Stockout Incidents / Month</td>
                  <td className="py-2.5 px-3 text-rose-600 font-mono">{incidentsBefore}</td>
                  <td className="py-2.5 px-3 text-emerald-700 font-mono">{incidentsAfter}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 font-bold font-mono">
                    -{incidentsBefore - incidentsAfter} incidents
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-slate-700">Monthly Revenue Loss</td>
                  <td className="py-2.5 px-3 text-rose-600 font-mono">
                    {formatCurrencyINR(monthlyLossBefore)}
                  </td>
                  <td className="py-2.5 px-3 text-emerald-700 font-mono">
                    {formatCurrencyINR(monthlyLossAfter)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 font-bold font-mono">
                    +{formatCurrencyINR(monthlySavings)} / mo
                  </td>
                </tr>
                <tr className="bg-slate-50 font-bold text-slate-900">
                  <td className="py-2.5 px-3">Annual Net Savings</td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono">—</td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono">—</td>
                  <td className="py-2.5 px-3 text-right text-slate-900 font-extrabold font-mono text-sm">
                    {formatCurrencyINR(annualSavings)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Historical Stockouts Evidence */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Historical Stockout Log</h3>
            <p className="text-xs text-slate-500">
              Documented shortage incidents prior to buffer automation
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {stockouts.length} Recorded Incidents
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Product</th>
                <th className="py-2 px-3">Units Lost</th>
                <th className="py-2 px-3">Estimated Loss</th>
                <th className="py-2 px-3">Impact Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stockouts.map((so) => (
                <tr key={so.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-600 font-mono">{so.date}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{so.product_name}</td>
                  <td className="py-2.5 px-3 text-slate-700 font-mono">{so.estimated_units_lost} units</td>
                  <td className="py-2.5 px-3 font-bold text-rose-600 font-mono">
                    {formatCurrencyINR(so.estimated_revenue_lost)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">{so.notes || 'Shortage'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
