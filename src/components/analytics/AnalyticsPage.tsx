import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp, Activity, SlidersHorizontal } from 'lucide-react';
import { TopSellersChart } from './TopSellersChart';
import { SlowMovingTable } from './SlowMovingTable';
import { MonthlyDemandTrend } from './MonthlyDemandTrend';
import { ReorderTable } from './ReorderTable';
import { SurgeControlPanel } from './SurgeControlPanel';
import { SupplyChainStressSimulator } from '../simulator/SupplyChainStressSimulator';

export const AnalyticsPage: React.FC = () => {
  const { products, sales } = useApp();
  const { currentUser } = useAuth();
  const [subTab, setSubTab] = useState<'forecasting' | 'stress_test'>('forecasting');

  const isOwner = currentUser?.role === 'owner';

  return (
    <div className="space-y-6">
      {/* Header with Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2.5">
            <TrendingUp className="w-6 h-6 text-amber-600" />
            <span>Demand Forecasting & Sales Analytics</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Predictive consumption modeling, environmental surges, and automated reorder buffers.
          </p>
        </div>

        {/* Executive Sub-Tabs for Owner */}
        {isOwner && (
          <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => setSubTab('forecasting')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                subTab === 'forecasting'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Forecasting & Surge</span>
            </button>
            <button
              type="button"
              onClick={() => setSubTab('stress_test')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                subTab === 'stress_test'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Stress Simulator</span>
            </button>
          </div>
        )}
      </div>

      {subTab === 'stress_test' && isOwner ? (
        <SupplyChainStressSimulator />
      ) : (
        <>
          {/* Environmental Surge Multiplier Control Panel */}
          <SurgeControlPanel />

          {/* Reorder Recommendation Engine Section (High Priority Action Table) */}
          <ReorderTable />

          {/* Demand Forecast & Monthly Trend Line Chart */}
          <MonthlyDemandTrend products={products} sales={sales} />

          {/* Two Column Grid: Top Sellers Bar Chart + Slow Moving Inventory Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopSellersChart products={products} sales={sales} />
            <SlowMovingTable products={products} sales={sales} />
          </div>
        </>
      )}
    </div>
  );
};
