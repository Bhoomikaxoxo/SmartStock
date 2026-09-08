import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Product } from '../../types';
import { getStockStatus } from '../../services/reorderEngine';
import { useTheme } from '../../context/ThemeContext';

interface StockHealthDonutProps {
  products: Product[];
}

export const StockHealthDonut: React.FC<StockHealthDonutProps> = ({ products }) => {
  const { tokens } = useTheme();

  const counts = {
    Healthy: 0,
    'Low Stock': 0,
    Critical: 0,
    'Out of Stock': 0,
  };

  products.forEach((p) => {
    const { status } = getStockStatus(p.current_stock, p.minimum_required);
    counts[status]++;
  });

  const data = [
    { name: 'Healthy', value: counts['Healthy'], color: tokens.status.healthy },
    { name: 'Low Stock', value: counts['Low Stock'], color: tokens.status.low },
    { name: 'Critical', value: counts['Critical'], color: tokens.status.critical },
    { name: 'Out of Stock', value: counts['Out of Stock'], color: tokens.status.out },
  ].filter((item) => item.value > 0);

  const total = products.length;
  const healthyPercentage = Math.round((counts.Healthy / (total || 1)) * 100);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Stock Buffer Health</h3>
          <p className="text-xs text-slate-500 mt-0.5">Real-time inventory stability status</p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100/90 text-slate-700 border border-slate-200/60 font-mono tabular-nums">
          {total} Skus
        </span>
      </div>

      <div className="h-48 relative flex items-center justify-center my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={54}
              outerRadius={78}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any, name: any) => [
                `${value} items (${Math.round((Number(value) / total) * 100)}%)`,
                name,
              ]}
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
          </PieChart>
        </ResponsiveContainer>

        {/* High-craft central badge */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-black text-slate-900 tracking-tight font-mono tabular-nums">
            {healthyPercentage}%
          </span>
          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 uppercase tracking-wider mt-0.5">
            Buffer Safe
          </span>
        </div>
      </div>

      {/* Legend & Count Grid with interactive pill styling */}
      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 text-xs">
        <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60 border border-emerald-200/40">
          <span className="flex items-center space-x-1.5 text-slate-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tokens.status.healthy }}></span>
            <span>Healthy</span>
          </span>
          <span className="font-extrabold text-emerald-800 font-mono tabular-nums">
            {counts['Healthy']}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/60 border border-amber-200/40">
          <span className="flex items-center space-x-1.5 text-slate-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tokens.status.low }}></span>
            <span>Low Stock</span>
          </span>
          <span className="font-extrabold text-amber-800 font-mono tabular-nums">
            {counts['Low Stock']}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50/60 border border-rose-200/40">
          <span className="flex items-center space-x-1.5 text-slate-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tokens.status.critical }}></span>
            <span>Critical</span>
          </span>
          <span className="font-extrabold text-rose-800 font-mono tabular-nums">
            {counts['Critical']}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/50">
          <span className="flex items-center space-x-1.5 text-slate-600 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tokens.status.out }}></span>
            <span>Out of Stock</span>
          </span>
          <span className="font-extrabold text-slate-700 font-mono tabular-nums">
            {counts['Out of Stock']}
          </span>
        </div>
      </div>
    </div>
  );
};

