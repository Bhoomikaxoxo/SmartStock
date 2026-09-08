import React from 'react';
import { useApp } from '../../context/AppContext';
import { TrendingUp, BarChart3, LineChart, ShieldCheck } from 'lucide-react';
import { TopSellersChart } from './TopSellersChart';
import { SlowMovingTable } from './SlowMovingTable';
import { MonthlyDemandTrend } from './MonthlyDemandTrend';
import { ReorderTable } from './ReorderTable';

export const AnalyticsPage: React.FC = () => {
  const { products, sales } = useApp();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2.5">
            <TrendingUp className="w-6 h-6 text-amber-600" />
            <span>Demand Forecasting & Sales Analytics</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Predictive consumption modeling, linear regression projections, and automated reorder buffers.
          </p>
        </div>
      </div>

      {/* Reorder Recommendation Engine Section (High Priority Action Table) */}
      <ReorderTable />

      {/* Demand Forecast & Monthly Trend Line Chart */}
      <MonthlyDemandTrend products={products} sales={sales} />

      {/* Two Column Grid: Top Sellers Bar Chart + Slow Moving Inventory Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopSellersChart products={products} sales={sales} />
        <SlowMovingTable products={products} sales={sales} />
      </div>
    </div>
  );
};
