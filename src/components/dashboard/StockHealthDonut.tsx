import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Product } from '../../types';
import { getStockStatus } from '../../services/reorderEngine';

interface StockHealthDonutProps {
  products: Product[];
}

export const StockHealthDonut: React.FC<StockHealthDonutProps> = ({ products }) => {
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
    { name: 'Healthy', value: counts['Healthy'], color: '#059669' },
    { name: 'Low Stock', value: counts['Low Stock'], color: '#d97706' },
    { name: 'Critical', value: counts['Critical'], color: '#e11d48' },
    { name: 'Out of Stock', value: counts['Out of Stock'], color: '#475569' },
  ].filter((item) => item.value > 0);

  const total = products.length;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Stock Health Breakdown</h3>
          <p className="text-xs text-slate-500">Real-time inventory stability status</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          {total} Products
        </span>
      </div>

      <div className="h-48 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={52}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any, name: any) => [
                `${value} items (${Math.round((Number(value) / total) * 100)}%)`,
                name,
              ]}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-slate-900">
            {Math.round((counts.Healthy / (total || 1)) * 100)}%
          </span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Healthy
          </span>
        </div>
      </div>

      {/* Legend & Count Grid */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50/50">
          <span className="flex items-center space-x-1.5 text-slate-700 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Healthy</span>
          </span>
          <span className="font-bold text-emerald-700">{counts['Healthy']}</span>
        </div>

        <div className="flex items-center justify-between p-1.5 rounded-lg bg-amber-50/50">
          <span className="flex items-center space-x-1.5 text-slate-700 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Low Stock</span>
          </span>
          <span className="font-bold text-amber-700">{counts['Low Stock']}</span>
        </div>

        <div className="flex items-center justify-between p-1.5 rounded-lg bg-rose-50/50">
          <span className="flex items-center space-x-1.5 text-slate-700 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Critical</span>
          </span>
          <span className="font-bold text-rose-700">{counts['Critical']}</span>
        </div>

        <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50">
          <span className="flex items-center space-x-1.5 text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
            <span>Out of Stock</span>
          </span>
          <span className="font-bold text-slate-700">{counts['Out of Stock']}</span>
        </div>
      </div>
    </div>
  );
};
