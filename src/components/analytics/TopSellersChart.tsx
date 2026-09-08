import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Product, SalesRecord } from '../../types';
import { getTopSellingProducts, formatCurrencyINR } from '../../services/reorderEngine';
import { useTheme } from '../../context/ThemeContext';
import { Award, Flame } from 'lucide-react';

interface TopSellersChartProps {
  products: Product[];
  sales: SalesRecord[];
}

export const TopSellersChart: React.FC<TopSellersChartProps> = ({ products, sales }) => {
  const { theme, tokens } = useTheme();
  const [timeframe, setTimeframe] = useState<30 | 60 | 90>(30);

  const topProducts = getTopSellingProducts(products, sales, timeframe).slice(0, 6);

  // Palette tuned for contrast in both modes
  const colors =
    theme === 'dark'
      ? ['#FBBF24', '#F59E0B', '#E0954A', '#34D399', '#10B981', '#60A5FA']
      : ['#f59e0b', '#d97706', '#b45309', '#10b981', '#059669', '#3b82f6'];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center space-x-1.5">
            <h3 className="text-sm font-bold text-slate-900">Top-Selling Bakery Products</h3>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xs text-slate-500">Volume sold & revenue contribution</p>
        </div>

        {/* Timeframe Toggle: 30 / 60 / 90 days */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl self-start">
          <button
            onClick={() => setTimeframe(30)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
              timeframe === 30
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Last 30d
          </button>
          <button
            onClick={() => setTimeframe(60)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
              timeframe === 60
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Last 60d
          </button>
          <button
            onClick={() => setTimeframe(90)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
              timeframe === 90
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Last 90d
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topProducts} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={tokens.chart.grid} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: tokens.chart.axisText }}
              interval={0}
              tickFormatter={(val) => (val.length > 12 ? `${val.substring(0, 10)}…` : val)}
              angle={-15}
              textAnchor="end"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: tokens.chart.axisText }}
            />
            <Tooltip
              formatter={(value: any, name: any, item: any) => [
                `${value} ${item.payload.unit} (Revenue: ${formatCurrencyINR(item.payload.revenue)})`,
                'Units Sold',
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
            <Bar dataKey="unitsSold" radius={[6, 6, 0, 0]}>
              {topProducts.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center space-x-1">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>Top performer: <strong>{topProducts[0]?.name}</strong></span>
        </span>
        <span className="font-semibold text-slate-700">
          Total {formatCurrencyINR(topProducts.reduce((acc, p) => acc + p.revenue, 0))} revenue
        </span>
      </div>
    </div>
  );
};
