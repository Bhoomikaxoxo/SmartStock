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
    <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Automated Reorder Recommendations
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamic replenishment based on 30-day burn rate, supplier lead time, and safety buffer.
          </p>
        </div>

        <button
          onClick={() => setShowFormulaTooltip(!showFormulaTooltip)}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center space-x-1.5 self-start cursor-pointer"
        >
          <Code2 className="w-3.5 h-3.5 text-slate-500" />
          <span>{showFormulaTooltip ? 'Hide Formula' : 'Formula Specification'}</span>
        </button>
      </div>

      {showFormulaTooltip && (
        <div className="mb-4 p-4 rounded-xl bg-slate-900 text-slate-200 text-xs space-y-2 font-mono border border-slate-800 animate-in fade-in duration-150">
          <div className="text-amber-400 font-bold text-[11px]">
            SPECIFICATION LOGIC (SECTION 4.3):
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
            <div>avg_daily_consumption = sum(units_sold_last_30_days) / 30</div>
            <div>days_until_stockout = current_stock / avg_daily_consumption</div>
            <div>reorder_trigger_point = avg_daily_consumption * lead_time_days</div>
            <div>recommended_quantity = (avg_daily * (lead_time + buffer_days)) - current_stock</div>
          </div>
          <p className="text-slate-400 text-[10px] pt-1 border-t border-slate-800 font-sans">
            Safety buffer: 2 days. Reorder alert triggered whenever days_until_stockout ≤ supplier lead time.
          </p>
        </div>
      )}

      {/* Recommendations Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3">Product</th>
              <th className="py-3 px-3">On Hand</th>
              <th className="py-3 px-3">Daily Burn</th>
              <th className="py-3 px-3">Days to Stockout</th>
              <th className="py-3 px-3">Lead Time</th>
              <th className="py-3 px-3">Recommended Quantity</th>
              <th className="py-3 px-3">Order Target</th>
              <th className="py-3 px-3">Algorithmic Reasoning</th>
              {canCreatePo && <th className="py-3 px-3 text-right">Action</th>}
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
                  className={`hover:bg-slate-50/70 transition-colors ${
                    isUrgent ? 'bg-amber-50/30' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-bold text-slate-900">
                    <span>{rec.product_name}</span>
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-700">
                    {rec.current_stock} {rec.unit}
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-600">
                    {rec.avg_daily_consumption} {rec.unit}/day
                  </td>

                  <td className="py-3 px-3 font-mono">
                    <span
                      className={`inline-flex items-center space-x-1 font-bold ${
                        isUrgent ? 'text-rose-600' : 'text-slate-800'
                      }`}
                    >
                      {isUrgent && <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                      <span>{rec.days_until_stockout} days</span>
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-600">
                    {rec.lead_time_days} days
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-extrabold text-slate-900 font-mono">
                      {rec.recommended_quantity} {rec.unit}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Est. {formatCurrencyINR(rec.estimated_cost)}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-1 text-slate-700 font-medium">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{rec.recommended_by_date}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold ${
                        isUrgent ? 'text-rose-600' : 'text-slate-400'
                      }`}
                    >
                      {isUrgent ? `Order within ${daysRemainingToOrder}d!` : `In ${daysRemainingToOrder}d`}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-slate-600 text-[11px] max-w-xs leading-relaxed">
                    <span className="font-semibold text-slate-900 block mb-0.5">
                      Order {rec.recommended_quantity} {rec.unit} within {daysRemainingToOrder} day{daysRemainingToOrder === 1 ? '' : 's'}
                    </span>
                    <span className="text-slate-500">{rec.reasoning}</span>
                  </td>

                  {canCreatePo && (
                    <td className="py-3 px-3 text-right">
                      {product && (
                        <button
                          onClick={() =>
                            setSelectedProductForPo({
                              product,
                              qty: rec.recommended_quantity,
                            })
                          }
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg shadow-2xs transition flex items-center space-x-1 ml-auto cursor-pointer"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          <span>Order</span>
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

      {selectedProductForPo && (
        <CreatePOModal
          product={selectedProductForPo.product}
          defaultQuantity={selectedProductForPo.qty}
          onClose={() => setSelectedProductForPo(null)}
        />
      )}
    </div>
  );
};
