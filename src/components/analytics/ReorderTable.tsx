import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Product } from '../../types';
import { CreatePOModal } from '../alerts/CreatePOModal';
import {
  Calendar,
  ShoppingCart,
  AlertTriangle,
  Code2,
  Clock,
  CheckCircle2,
  Boxes,
} from 'lucide-react';
import { formatCurrencyINR } from '../../services/reorderEngine';

export const ReorderTable: React.FC = () => {
  const { reorderRecommendations, products } = useApp();
  const { currentUser } = useAuth();
  const [selectedProductForPo, setSelectedProductForPo] = useState<{
    product: Product;
    qty: number;
  } | null>(null);

  const [showFormulaTooltip, setShowFormulaTooltip] = useState(false);
  const canCreatePo = currentUser?.role === 'owner' || currentUser?.role === 'purchasing';

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60">
              <ShoppingCart className="w-4 h-4 stroke-[2]" />
            </div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Automated Reorder Recommendations
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic replenishment based on 30-day burn rate, supplier lead time, and safety buffer.
          </p>
        </div>

        <button
          onClick={() => setShowFormulaTooltip(!showFormulaTooltip)}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl border border-slate-200 flex items-center space-x-1.5 self-start cursor-pointer transition"
        >
          <Code2 className="w-3.5 h-3.5 text-slate-500" />
          <span>{showFormulaTooltip ? 'Hide Formulas' : 'Formula Logic'}</span>
        </button>
      </div>

      {showFormulaTooltip && (
        <div className="mb-5 p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs space-y-2 font-mono border border-slate-800 animate-scale-in shadow-xl">
          <div className="text-amber-400 font-extrabold text-[11px] uppercase tracking-wider">
            MATHEMATICAL SPECIFICATION (SECTION 4.3):
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[11px] text-slate-300">
            <div>avg_daily_consumption = sum(units_sold_last_30_days) / 30</div>
            <div>days_until_stockout = current_stock / avg_daily_consumption</div>
            <div>reorder_trigger_point = avg_daily_consumption * lead_time_days</div>
            <div>recommended_quantity = (avg_daily * (lead_time + buffer_days)) - current_stock</div>
          </div>
          <p className="text-slate-400 text-[10px] pt-1.5 border-t border-slate-800 font-sans">
            Safety buffer: 2 days. Reorder alert triggered whenever days_until_stockout ≤ supplier lead time.
          </p>
        </div>
      )}

      {/* Recommendations Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-3">Product</th>
              <th className="py-3.5 px-3">On Hand</th>
              <th className="py-3.5 px-3">Daily Burn</th>
              <th className="py-3.5 px-3">Days to Stockout</th>
              <th className="py-3.5 px-3">Lead Time</th>
              <th className="py-3.5 px-3">Suggested Order</th>
              <th className="py-3.5 px-3">Order Target</th>
              <th className="py-3.5 px-3">Algorithmic Reasoning</th>
              {canCreatePo && <th className="py-3.5 px-3 text-right">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reorderRecommendations.map((rec) => {
              const product = products.find((p) => p.id === rec.product_id);
              const isUrgent = rec.days_until_stockout <= rec.lead_time_days;
              const daysRemainingToOrder = Math.max(1, Math.floor(rec.days_until_stockout - rec.lead_time_days));

              return (
                <tr
                  key={rec.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isUrgent ? 'bg-amber-50/30 font-medium' : ''
                  }`}
                >
                  <td className="py-3.5 px-3 font-bold text-slate-900">
                    <span className="text-xs">{rec.product_name}</span>
                  </td>

                  <td className="py-3.5 px-3 font-mono text-slate-800 tabular-nums font-bold">
                    {rec.current_stock} {rec.unit}
                  </td>

                  <td className="py-3.5 px-3 font-mono text-slate-600 tabular-nums">
                    {rec.avg_daily_consumption.toFixed(1)} {rec.unit}/d
                  </td>

                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono tabular-nums ${
                        isUrgent
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : rec.days_until_stockout <= rec.lead_time_days * 2
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{rec.days_until_stockout} days</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-mono text-slate-600 tabular-nums">
                    {rec.lead_time_days} days
                  </td>

                  <td className="py-3.5 px-3 font-mono font-black text-amber-900 text-xs tabular-nums">
                    {rec.recommended_quantity} {rec.unit}
                  </td>

                  <td className="py-3.5 px-3 text-slate-700">
                    {isUrgent ? (
                      <span className="font-extrabold text-rose-700 flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Reorder Immediately</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 font-medium">
                        Order in {daysRemainingToOrder} days
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-slate-600 text-[11px] max-w-xs leading-snug">
                    {rec.reasoning}
                  </td>

                  {canCreatePo && (
                    <td className="py-3.5 px-3 text-right">
                      {product && (
                        <button
                          onClick={() =>
                            setSelectedProductForPo({
                              product,
                              qty: rec.recommended_quantity,
                            })
                          }
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center space-x-1 ml-auto shadow-2xs ${
                            isUrgent
                              ? 'bg-amber-600 hover:bg-amber-700 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                          }`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Dispatch PO</span>
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PO Modal with Pre-filled quantity */}
      {selectedProductForPo && (
        <CreatePOModal
          preselectedProduct={selectedProductForPo.product}
          initialQuantity={selectedProductForPo.qty}
          onClose={() => setSelectedProductForPo(null)}
        />
      )}
    </div>
  );
};
