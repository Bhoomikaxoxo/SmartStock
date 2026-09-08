import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Product, SalesRecord } from '../../types';
import { getMonthlyDemandTrend } from '../../services/reorderEngine';
import { TrendingUp, Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react';

interface MonthlyDemandTrendProps {
  products: Product[];
  sales: SalesRecord[];
}

export const MonthlyDemandTrend: React.FC<MonthlyDemandTrendProps> = ({ products, sales }) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products.find((p) => p.id === 'prod-flour')?.id || products[0]?.id || ''
  );

  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const trendData = currentProduct
    ? getMonthlyDemandTrend(currentProduct.id, sales)
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
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-900">Demand Trend & 30-Day Forward Projection</h3>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                badgeColorStyles[trendData.trendBadge.color]
              }`}
            >
              {trendData.trendBadge.text}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Linear regression trend fit over 90 days historical consumption
          </p>
        </div>

        {/* Product selector dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-500 shrink-0">Product:</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <span className="text-slate-400 block text-[10px]">Month -2</span>
          <span className="font-extrabold text-slate-800 text-sm">
            {trendData.m1Total} {currentProduct?.unit}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <span className="text-slate-400 block text-[10px]">Month -1</span>
          <span className="font-extrabold text-slate-800 text-sm">
            {trendData.m2Total} {currentProduct?.unit}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs">
          <span className="text-amber-700 block text-[10px] font-semibold">Past 30 Days (Actual)</span>
          <span className="font-extrabold text-amber-900 text-sm">
            {trendData.m3Total} {currentProduct?.unit}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
          <span className="text-emerald-700 block text-[10px] font-bold flex items-center space-x-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Projected Demand</span>
          </span>
          <span className="font-black text-emerald-900 text-sm">
            {trendData.projectedM4} {currentProduct?.unit}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData.chartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: any, name: any) => [
                `${value} ${currentProduct?.unit}`,
                name === 'demand' ? 'Recorded Consumption' : 'Linear Projection',
              ]}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
            
            {/* Actual Demand Solid Line */}
            <Line
              type="monotone"
              dataKey="demand"
              name="Historical Demand"
              stroke="#d97706"
              strokeWidth={3}
              dot={{ r: 5, fill: '#d97706', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7 }}
              connectNulls={false}
            />

            {/* Projected Demand Dotted Line */}
            <Line
              type="monotone"
              dataKey="projected"
              name="Projected Next Month"
              stroke="#10b981"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
        <span>
          Mathematical trend slope: <strong>+{trendData.slope} {currentProduct?.unit}/month</strong>
        </span>
        <span className="text-emerald-700 font-semibold flex items-center space-x-1">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Average Growth: {trendData.avgGrowthPct}%</span>
        </span>
      </div>
    </div>
  );
};
