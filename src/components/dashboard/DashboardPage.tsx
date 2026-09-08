import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Package,
  IndianRupee,
  AlertTriangle,
  BellRing,
  ShoppingCart,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { StatCard } from './StatCard';
import { StockHealthDonut } from './StockHealthDonut';
import { KpiProgress } from './KpiProgress';
import { RecentActivityFeed } from './RecentActivityFeed';
import { formatCurrencyINR } from '../../services/reorderEngine';

export const DashboardPage: React.FC = () => {
  const {
    products,
    alerts,
    reorderRecommendations,
    setActiveTab,
  } = useApp();
  const { currentUser } = useAuth();

  // Metrics
  const totalProducts = products.length;
  const totalInventoryValue = products.reduce(
    (acc, curr) => acc + curr.current_stock * curr.cost_price,
    0
  );
  const lowStockItems = products.filter(
    (p) => p.current_stock < p.minimum_required
  );
  const activeAlerts = alerts.filter((a) => !a.resolved);
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical');

  const urgentReorders = reorderRecommendations.filter(
    (r) => r.days_until_stockout <= r.lead_time_days
  );

  return (
    <div className="space-y-6">
      {/* Functional Alert Banner (Only shown if critical low stock exists) */}
      {criticalAlerts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-rose-900 block sm:inline mr-2">
                Critical Inventory Shortage:
              </span>
              <span className="text-rose-800">
                {criticalAlerts[0]?.message}
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('alerts')}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition self-start sm:self-center shrink-0 cursor-pointer"
          >
            Review Alerts ({criticalAlerts.length})
          </button>
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Products Tracked"
          value={totalProducts.toString()}
          subtitle="8 core bakery items"
          icon={Package}
          change="+2"
          isPositive={true}
          onClick={() => setActiveTab('inventory')}
        />

        <StatCard
          title="Total Stock Value"
          value={formatCurrencyINR(totalInventoryValue)}
          subtitle="At wholesale cost price"
          icon={IndianRupee}
          change="+4.2%"
          isPositive={true}
          onClick={() => setActiveTab('inventory')}
        />

        <StatCard
          title="Below Minimum Buffer"
          value={lowStockItems.length.toString()}
          subtitle={
            lowStockItems.length > 0
              ? `${lowStockItems.map((p) => p.name.split(' ')[0]).join(', ')}`
              : 'All items healthy'
          }
          icon={AlertTriangle}
          alertLevel={lowStockItems.length > 0 ? 'critical' : 'none'}
          change={lowStockItems.length > 0 ? `${lowStockItems.length} low` : 'Normal'}
          isPositive={lowStockItems.length === 0}
          onClick={() => setActiveTab('inventory')}
        />

        <StatCard
          title="Active Alerts"
          value={activeAlerts.length.toString()}
          subtitle={
            criticalAlerts.length > 0
              ? `${criticalAlerts.length} require action`
              : 'All buffers nominal'
          }
          icon={BellRing}
          alertLevel={criticalAlerts.length > 0 ? 'critical' : activeAlerts.length > 0 ? 'warning' : 'none'}
          change={activeAlerts.length > 0 ? 'Pending' : 'Clear'}
          isPositive={activeAlerts.length === 0}
          onClick={() => setActiveTab('alerts')}
        />
      </div>

      {/* Urgent Reorder Trigger Strip */}
      {urgentReorders.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-amber-900 mr-2">Reorder Trigger:</span>
              <span className="text-amber-800">
                {urgentReorders.length === 1
                  ? `Order ${urgentReorders[0].recommended_quantity} ${urgentReorders[0].unit} of ${urgentReorders[0].product_name} within ${urgentReorders[0].days_until_stockout} days.`
                  : `${urgentReorders.length} items have days-until-stockout ≤ vendor lead time.`}
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('analytics')}
            className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs rounded-lg transition self-start sm:self-center shrink-0 cursor-pointer flex items-center space-x-1"
          >
            <span>Review Reorders</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockHealthDonut products={products} />
        <KpiProgress />
      </div>

      {/* Activity Feed & Financial Teaser */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivityFeed />
        </div>

        {/* Financial Summary Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              <span>Stockout Impact Tracking</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Estimated ₹96,000 Annual Savings
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Eliminating avoidable weekend shortages preserves ₹8,000/month in retail bakery sales that would otherwise be lost to cancelled orders.
            </p>

            <div className="my-4 p-3 rounded-lg bg-slate-50 border border-slate-200/60 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Loss before system:</span>
                <span className="font-semibold text-rose-600">₹10,000 / mo</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>With automated buffer:</span>
                <span className="font-semibold text-emerald-700">₹2,000 / mo</span>
              </div>
              <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                <span>Net Monthly Benefit:</span>
                <span className="text-emerald-700">₹8,000 / mo</span>
              </div>
            </div>
          </div>

          {currentUser?.role === 'owner' ? (
            <button
              onClick={() => setActiveTab('impact')}
              className="w-full py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 font-semibold text-xs text-slate-800 transition flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>Open Impact Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <p className="text-[11px] text-slate-400 italic text-center">
              Detailed financial models restricted to Owner
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
