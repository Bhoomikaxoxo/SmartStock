import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Product, SalesRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { getMonthlyDemandTrend } from '../../services/reorderEngine';
import { TrendingUp, Sparkles, AlertCircle, ArrowUpRight, BarChart3 } from 'lucide-react';

interface MonthlyDemandTrendProps {
  products: Product[];
  sales: SalesRecord[];
}

export const MonthlyDemandTrend: React.FC<MonthlyDemandTrendProps> = ({ products, sales }) => {
  const { surgeMultiplier } = useApp();
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products.find((p) => p.id === 'prod-flour')?.id || products[0]?.id || ''
  );

  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const trendData = currentProduct
    ? getMonthlyDemandTrend(currentProduct.id, sales, surgeMultiplier)
    : {
        chartData: [],
        m1Total: 0,
        m2Total: 0,
        m3Total: 0,
        projectedM4: 0,
        slope: 0,
        avgGrowthPct: 0,
        trendBadge: { text: 'Stable', color: 'amber' as const },
      };

  const badgeColorStyles = {
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
    amber: 'bg-amber-50 text-amber-900 border-amber-200/90',
    rose: 'bg-rose-50 text-rose-800 border-rose-200/90',
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60">
              <TrendingUp className="w-4 h-4 stroke-[2]" />
            </div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Demand Trend & 30-Day Forward Projection
            </h3>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-extrabold border ${
                badgeColorStyles[trendData.trendBadge.color]
              }`}
            >
              {trendData.trendBadge.text}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Linear regression trend fit over 90 days historical consumption
          </p>
        </div>

        {/* Product selector dropdown */}
        <div className="flex items-center space-x-2 text-xs">
          <label className="font-bold text-slate-500 shrink-0">Ingredient:</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs cursor-pointer"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.unit})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Regression & Growth Stats summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/60 text-xs">
          <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">
            Month -2
          </span>
          <span className="font-black text-slate-800 text-base font-mono tabular-nums mt-0.5 block">
            {trendData.m1Total} <span className="text-xs font-normal text-slate-400">{currentProduct?.unit}</span>
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/60 text-xs">
          <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">
            Month -1
          </span>
          <span className="font-black text-slate-800 text-base font-mono tabular-nums mt-0.5 block">
            {trendData.m2Total} <span className="text-xs font-normal text-slate-400">{currentProduct?.unit}</span>
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs">
          <span className="text-amber-800 block text-[11px] font-bold uppercase tracking-wider">
            Past 30 Days (Actual)
          </span>
          <span className="font-black text-amber-950 text-base font-mono tabular-nums mt-0.5 block">
            {trendData.m3Total} <span className="text-xs font-normal text-amber-700">{currentProduct?.unit}</span>
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/70 text-xs">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Forecast (Next 30d)</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
          <span className="font-black text-emerald-950 text-base font-mono tabular-nums mt-0.5 block">
            {trendData.projectedM4} <span className="text-xs font-normal text-emerald-700">{currentProduct?.unit}</span>
          </span>
        </div>
      </div>

      {/* Recharts Area Curve Chart */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData.chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              unit={` ${currentProduct?.unit}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: 'rgba(51, 65, 85, 0.8)',
                color: '#fff',
                borderRadius: '12px',
                fontSize: '12px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                padding: '8px 12px',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            />
            <Area
              type="monotone"
              dataKey="actual"
              name="Historical Daily Sales"
              stroke="#d97706"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#actualGradient)"
            />
            <Area
              type="monotone"
              dataKey="forecast"
              name="30-Day Trend Fit"
              stroke="#059669"
              strokeWidth={2.5}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#forecastGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
