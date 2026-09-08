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
  Clock,
} from 'lucide-react';
import { StatCard } from './StatCard';
import { StockHealthDonut } from './StockHealthDonut';
import { KpiProgress } from './KpiProgress';
import { RecentActivityFeed } from './RecentActivityFeed';
import { ExpiryWatchBanner } from './ExpiryWatchBanner';
import { formatCurrencyINR, getStockStatus } from '../../services/reorderEngine';

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

  const healthyCount = products.filter((p) => {
    const { status } = getStockStatus(p.current_stock, p.minimum_required);
    return status === 'Healthy';
  }).length;
  const healthyPercentage = Math.round((healthyCount / (totalProducts || 1)) * 100);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Top Greeting & Shift Overview Banner */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{todayFormatted}</span>
            <span className="text-slate-300">•</span>
            <span>Morning Bake Shift</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Welcome back, {currentUser?.name?.split(' ')[0] || 'Baker'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            Bakery buffer health is currently at{' '}
            <strong className="text-emerald-700 font-bold">{healthyPercentage}%</strong>.{' '}
            {criticalAlerts.length > 0 ? (
              <span className="text-rose-700 font-semibold">
                {criticalAlerts.length} critical inventory shortage requires replenishment.
              </span>
            ) : (
              <span className="text-slate-600">All essential ingredient safety buffers are stable.</span>
            )}
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start md:self-center">
          <button
            onClick={() => setActiveTab('inventory')}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer flex items-center space-x-1.5"
          >
            <span>Master Inventory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Critical Shortage Notification Strip (Only shown if critical stock exists) */}
      {criticalAlerts.length > 0 && (
        <div className="bg-rose-50/80 dark:bg-rose-950/25 border border-rose-200/90 dark:border-rose-900/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-xl shrink-0 mt-0.5 sm:mt-0 border border-rose-200 dark:border-rose-800/40">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-rose-900 dark:text-rose-200 block sm:inline mr-2 uppercase tracking-wide text-[11px]">
                Critical Inventory Shortage:
              </span>
              <span className="text-rose-800 dark:text-rose-300 font-medium">
                {criticalAlerts[0]?.message}
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('alerts')}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition self-start sm:self-center shrink-0 cursor-pointer shadow-2xs"
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
          subtitle="8 core bakery ingredients"
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
              : 'All ingredients nominal'
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
        <div className="bg-amber-50/80 dark:bg-amber-950/25 border border-amber-200/90 dark:border-amber-900/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-xl shrink-0 border border-amber-200 dark:border-amber-800/40">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-amber-900 dark:text-amber-200 mr-2 uppercase tracking-wide text-[11px]">
                Reorder Trigger Active:
              </span>
              <span className="text-amber-800 dark:text-amber-300 font-medium">
                {urgentReorders.length === 1
                  ? `Order ${urgentReorders[0].recommended_quantity} ${urgentReorders[0].unit} of ${urgentReorders[0].product_name} within ${urgentReorders[0].days_until_stockout} days to avoid stockout.`
                  : `${urgentReorders.length} items have days-until-stockout ≤ vendor lead time.`}
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('analytics')}
            className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition self-start sm:self-center shrink-0 cursor-pointer flex items-center space-x-1.5 shadow-2xs"
          >
            <span>Review Reorders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* FIFO Shelf-Life & Expiry Watch Strip */}
      <ExpiryWatchBanner />

      {/* Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockHealthDonut products={products} />
        <KpiProgress />
      </div>

      {/* Activity Feed & Financial Summary (Executive financial metrics visible only to Bakery Owner) */}
      {currentUser?.role === 'owner' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentActivityFeed />
          </div>

          {/* Financial Summary Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                <TrendingDown className="w-4 h-4 text-emerald-600 stroke-[2.2]" />
                <span>Stockout Impact Tracking</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Estimated ₹96,000 Annual Benefit
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Eliminating avoidable weekend shortages preserves ₹8,000/month in retail bakery sales that would otherwise be lost to cancelled orders.
              </p>

              <div className="my-4 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/60 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Loss before SmartStock:</span>
                  <span className="font-extrabold text-rose-600 font-mono">₹10,000 / mo</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>With automated buffer:</span>
                  <span className="font-extrabold text-emerald-700 font-mono">₹2,000 / mo</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                  <span>Net Monthly Savings:</span>
                  <span className="text-emerald-700 font-mono font-extrabold">₹8,000 / mo</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('impact')}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-300/80 hover:bg-slate-50 font-bold text-xs text-slate-800 transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
            >
              <span>Open Impact Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full">
          <RecentActivityFeed />
        </div>
      )}
    </div>
  );
};
