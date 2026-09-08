import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Activity,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  Clock,
  DollarSign,
  Zap,
  Lock,
} from 'lucide-react';
import { formatCurrencyINR, computeReorderRecommendation, BUFFER_DAYS_DEFAULT } from '../../services/reorderEngine';

export const SupplyChainStressSimulator: React.FC = () => {
  const { products, sales, suppliers, reorderRecommendations } = useApp();
  const { currentUser } = useAuth();

  // Owner only gate
  const isOwner = currentUser?.role === 'owner';

  // Simulation Parameters
  const [delayDays, setDelayDays] = useState<number>(3); // +0 to +10 days
  const [inflationPct, setInflationPct] = useState<number>(15); // 0% to +50%
  const [demandShockPct, setDemandShockPct] = useState<number>(25); // -20% to +100%

  // Compute Stressed Recommendations
  const stressedRecommendations = useMemo(() => {
    const demandFactor = Math.max(0.1, 1 + demandShockPct / 100);
    const inflationFactor = 1 + inflationPct / 100;

    return products.map((product) => {
      const supplier = suppliers.find((s) => s.id === product.supplier_id);
      const simulatedLeadTime = (supplier?.lead_time_days || 3) + delayDays;
      const simulatedProduct = {
        ...product,
        cost_price: Math.round(product.cost_price * inflationFactor),
      };

      const customSupplier = supplier
        ? { ...supplier, lead_time_days: simulatedLeadTime }
        : { id: 'sim-sup', name: 'Simulated Supplier', lead_time_days: simulatedLeadTime, contact: '', phone: '', email: '', products_supplied: [] };

      const baseRec = computeReorderRecommendation(
        simulatedProduct,
        sales,
        customSupplier,
        BUFFER_DAYS_DEFAULT,
        demandFactor
      );

      return {
        ...baseRec,
        simulatedLeadTime,
        simulatedCostPrice: simulatedProduct.cost_price,
      };
    });
  }, [products, sales, suppliers, delayDays, inflationPct, demandShockPct]);

  // Aggregate Comparative Metrics
  const normalTotalCost = useMemo(() => {
    return reorderRecommendations.reduce((sum, r) => sum + r.estimated_cost, 0);
  }, [reorderRecommendations]);

  const stressedTotalCost = useMemo(() => {
    return stressedRecommendations.reduce((sum, r) => sum + r.estimated_cost, 0);
  }, [stressedRecommendations]);

  const normalStockoutRisks = useMemo(() => {
    return reorderRecommendations.filter((r) => r.days_until_stockout <= r.lead_time_days).length;
  }, [reorderRecommendations]);

  const stressedStockoutRisks = useMemo(() => {
    return stressedRecommendations.filter((r) => r.days_until_stockout <= r.simulatedLeadTime).length;
  }, [stressedRecommendations]);

  const costDifference = stressedTotalCost - normalTotalCost;

  const handleReset = () => {
    setDelayDays(0);
    setInflationPct(0);
    setDemandShockPct(0);
  };

  if (!isOwner) {
    return (
      <div className="glass-card rounded-2xl border border-slate-200 p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-black text-slate-900">Restricted Executive Tool</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Supply Chain Stress Test Simulation is restricted to Business Owners. Floor and Purchasing roles do not have authorization to view executive capital impact models.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl border border-slate-200/90 p-5 shadow-2xs bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold border border-white/20">
              <Activity className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  Supply Chain Stress Test Simulator
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950">
                  OWNER ONLY
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Dynamic "what-if" modeling: test supplier delays, raw commodity inflation, and sudden customer demand surges
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="self-start sm:self-auto inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition border border-white/20 cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sliders</span>
          </button>
        </div>
      </div>

      {/* Simulator Interactive Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Slider 1: Lead Time Delay */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900">Supplier Delay</span>
            </div>
            <span className="text-sm font-mono font-black text-amber-700">+{delayDays} Days</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={delayDays}
            onChange={(e) => setDelayDays(parseInt(e.target.value))}
            className="w-full accent-amber-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>0d (Normal)</span>
            <span>+5d (Severe Port Delay)</span>
            <span>+10d (Lockdown)</span>
          </div>
        </div>

        {/* Slider 2: Commodity Inflation */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-800 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900">Raw Material Inflation</span>
            </div>
            <span className="text-sm font-mono font-black text-rose-700">+{inflationPct}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={inflationPct}
            onChange={(e) => setInflationPct(parseInt(e.target.value))}
            className="w-full accent-rose-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>0% (Baseline)</span>
            <span>+25% (Grain Spike)</span>
            <span>+50% (Crisis)</span>
          </div>
        </div>

        {/* Slider 3: Demand Shock */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900">Demand Surge Shock</span>
            </div>
            <span className="text-sm font-mono font-black text-blue-700">+{demandShockPct}%</span>
          </div>
          <input
            type="range"
            min="-20"
            max="100"
            step="10"
            value={demandShockPct}
            onChange={(e) => setDemandShockPct(parseInt(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>-20% (Lull)</span>
            <span>+50% (Holiday)</span>
            <span>+100% (Double Draw)</span>
          </div>
        </div>
      </div>

      {/* Comparative Simulation KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="glass-card p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block mb-1">
            Reorder Working Capital Required
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black font-mono text-slate-900">
              {formatCurrencyINR(stressedTotalCost)}
            </span>
            <span
              className={`text-xs font-mono font-bold ${
                costDifference > 0 ? 'text-rose-600' : 'text-slate-500'
              }`}
            >
              {costDifference >= 0 ? `+${formatCurrencyINR(costDifference)}` : formatCurrencyINR(costDifference)}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Baseline capital was {formatCurrencyINR(normalTotalCost)}
          </span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block mb-1">
            Items Exposed to Imminent Stockout
          </span>
          <div className="flex items-baseline space-x-2">
            <span
              className={`text-2xl font-black font-mono ${
                stressedStockoutRisks > normalStockoutRisks ? 'text-rose-700' : 'text-slate-900'
              }`}
            >
              {stressedStockoutRisks} / {products.length}
            </span>
            <span className="text-xs font-mono font-bold text-rose-600">
              +{Math.max(0, stressedStockoutRisks - normalStockoutRisks)} newly at risk
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Baseline at risk: {normalStockoutRisks} items
          </span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block mb-1">
            Sandbox Isolation Status
          </span>
          <div className="flex items-center space-x-1.5 text-emerald-700 font-bold mt-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Non-Persistent Read-Only</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Simulated values do not modify live inventory or database records.
          </span>
        </div>
      </div>

      {/* Comparative Simulation Table */}
      <div className="glass-card rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Product-by-Product Stress Impact
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Comparison of baseline vs. stressed lead time, trigger point, and reorder budget
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4 text-right">Lead Time (Base → Stress)</th>
                <th className="py-3 px-4 text-right">Burn Rate / Day</th>
                <th className="py-3 px-4 text-right">Days to Stockout</th>
                <th className="py-3 px-4 text-right">Base Reorder Qty</th>
                <th className="py-3 px-4 text-right">Stressed Reorder Qty</th>
                <th className="py-3 px-4 text-right">Stressed Budget</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stressedRecommendations.map((stressed) => {
                const base = reorderRecommendations.find((r) => r.product_id === stressed.product_id);
                const isThreatened = stressed.days_until_stockout <= stressed.simulatedLeadTime;

                return (
                  <tr
                    key={stressed.product_id}
                    className={`hover:bg-slate-50/60 transition ${
                      isThreatened ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{stressed.product_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Current: {stressed.current_stock} {stressed.unit}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <span className="text-slate-500">{base?.lead_time_days || 3}d</span>
                      <span className="mx-1 text-slate-400">→</span>
                      <strong className="text-amber-800">{stressed.simulatedLeadTime}d</strong>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                      {stressed.avg_daily_consumption} {stressed.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <span
                        className={`font-black ${
                          isThreatened ? 'text-rose-700' : 'text-slate-900'
                        }`}
                      >
                        {stressed.days_until_stockout}d
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {base?.recommended_quantity} {stressed.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                      {stressed.recommended_quantity} {stressed.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900">
                      {formatCurrencyINR(stressed.estimated_cost)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
