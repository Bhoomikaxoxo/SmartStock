import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { X, Sliders, CheckCircle2, AlertCircle } from 'lucide-react';

interface AdjustStockModalProps {
  product: Product;
  onClose: () => void;
}

export const AdjustStockModal: React.FC<AdjustStockModalProps> = ({ product, onClose }) => {
  const { updateStock } = useApp();
  const [newStock, setNewStock] = useState<number>(product.current_stock);
  const [reason, setReason] = useState('Shipment Received / Restock');

  const isNegative = newStock < 0 || isNaN(newStock);
  const diff = (newStock || 0) - product.current_stock;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNegative) return;
    updateStock(product.id, newStock, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="glass-modal rounded-3xl shadow-elevated max-w-md w-full max-h-[85vh] sm:max-h-[90vh] flex flex-col border border-slate-200/90 dark:border-slate-800 relative animate-scale-in overflow-hidden">
        {/* Pinned Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold border border-amber-200/60 dark:border-amber-800/50 shadow-2xs">
              <Sliders className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Adjust Physical Stock Count
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[240px]">
                {product.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="adjust-stock-form" onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">
                Current On-Hand
              </span>
              <span className="text-base font-black text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                {product.current_stock} {product.unit}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">
                Minimum Buffer
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono tabular-nums">
                {product.minimum_required} {product.unit}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              New Verified Stock Count ({product.unit}) *
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={newStock}
                onChange={(e) => setNewStock(parseFloat(e.target.value) || 0)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 font-mono tabular-nums ${
                  isNegative
                    ? 'border-rose-300 dark:border-rose-600 focus:ring-rose-500 bg-rose-50/30'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-amber-500'
                }`}
              />
              <div className="flex space-x-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setNewStock((prev) => Math.max(0, prev + 10))}
                  className="px-2.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl cursor-pointer text-xs transition min-h-[40px]"
                >
                  +10
                </button>
                <button
                  type="button"
                  onClick={() => setNewStock((prev) => Math.max(0, prev + 50))}
                  className="px-2.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl cursor-pointer text-xs transition min-h-[40px]"
                >
                  +50
                </button>
              </div>
            </div>

            {isNegative && (
              <p className="mt-2 text-rose-600 dark:text-rose-400 font-bold flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Stock quantity cannot be negative.</span>
              </p>
            )}
          </div>

          {/* Variance / Delta Pill */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-400">Net Inventory Adjustment:</span>
            <span
              className={`font-mono font-extrabold px-2 py-0.5 rounded-md ${
                diff > 0
                  ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                  : diff < 0
                  ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)} {product.unit}
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Adjustment Reason / Audit Trail Tag *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 text-xs font-medium"
            >
              <option value="Shipment Received / Restock">Shipment Received / Restock</option>
              <option value="Physical Inventory Cycle Count">Physical Inventory Cycle Count</option>
              <option value="Damaged / Spoiled Goods Write-off">Damaged / Spoiled Goods Write-off</option>
              <option value="Batch Production Usage Correction">Batch Production Usage Correction</option>
              <option value="Supplier Return">Supplier Return</option>
            </select>
          </div>
        </form>

        {/* Pinned Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold rounded-xl transition cursor-pointer text-xs min-h-[40px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="adjust-stock-form"
            disabled={isNegative}
            className={`px-5 py-2.5 text-white font-bold rounded-xl transition cursor-pointer flex items-center space-x-1.5 text-xs shadow-sm min-h-[40px] ${
              !isNegative
                ? 'bg-amber-600 hover:bg-amber-700 active:scale-95'
                : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-60'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Update Stock</span>
          </button>
        </div>
      </div>
    </div>
  );
};
