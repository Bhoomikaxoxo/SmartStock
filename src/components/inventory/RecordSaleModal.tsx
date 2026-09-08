import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { X, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrencyINR } from '../../services/reorderEngine';

interface RecordSaleModalProps {
  product: Product;
  onClose: () => void;
}

export const RecordSaleModal: React.FC<RecordSaleModalProps> = ({ product, onClose }) => {
  const { recordSale } = useApp();
  const [unitsSold, setUnitsSold] = useState<number>(1);

  const isExceeding = unitsSold > product.current_stock;
  const isInvalid = unitsSold <= 0 || isNaN(unitsSold);
  const canSubmit = !isExceeding && !isInvalid && product.current_stock > 0;

  const totalRevenue = Math.round((unitsSold || 0) * product.selling_price);
  const remainingStock = Math.max(0, product.current_stock - (unitsSold || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const res = recordSale(product.id, unitsSold);
    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="glass-modal rounded-3xl shadow-elevated max-w-md w-full max-h-[85vh] sm:max-h-[90vh] flex flex-col border border-slate-200/90 dark:border-slate-800 relative animate-scale-in overflow-hidden">
        {/* Pinned Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-200/60 dark:border-emerald-800/50 shadow-2xs">
              <TrendingUp className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Record Product Sale
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
        <form id="record-sale-form" onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 grid grid-cols-2 gap-3">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">
                Available Stock
              </span>
              <span className="text-base font-black text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                {product.current_stock} {product.unit}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">
                Selling Price
              </span>
              <span className="text-base font-black text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                ₹{product.selling_price} <span className="text-xs font-medium text-slate-400">/{product.unit}</span>
              </span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Units Sold / Dispatched ({product.unit}) *
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="0.1"
                min="0.1"
                max={product.current_stock}
                required
                value={unitsSold || ''}
                onChange={(e) => setUnitsSold(parseFloat(e.target.value) || 0)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 font-mono tabular-nums ${
                  isExceeding
                    ? 'border-rose-300 dark:border-rose-600 focus:ring-rose-500 bg-rose-50/30'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-amber-500'
                }`}
              />
              <div className="flex space-x-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setUnitsSold((prev) => Math.min(product.current_stock, prev + 5))}
                  className="px-2.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl cursor-pointer text-xs transition min-h-[40px]"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={() => setUnitsSold((prev) => Math.min(product.current_stock, prev + 20))}
                  className="px-2.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl cursor-pointer text-xs transition min-h-[40px]"
                >
                  +20
                </button>
              </div>
            </div>

            {/* Validation Error Message */}
            {isExceeding && (
              <p className="mt-2 text-rose-600 dark:text-rose-400 font-bold flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Cannot sell {unitsSold} {product.unit} — only {product.current_stock} {product.unit} available in store.</span>
              </p>
            )}
            {isInvalid && (
              <p className="mt-2 text-rose-600 dark:text-rose-400 font-bold flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Please enter a valid quantity greater than 0.</span>
              </p>
            )}
          </div>

          {/* Live Revenue & Stock Depletion Preview */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50 space-y-1.5">
            <div className="flex justify-between text-slate-700 dark:text-slate-300">
              <span className="font-medium">Total Retail Sale Value:</span>
              <span className="font-black text-amber-900 dark:text-amber-300 font-mono text-sm tabular-nums">
                {formatCurrencyINR(totalRevenue)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px] pt-1 border-t border-amber-200/60 dark:border-amber-800/40">
              <span>Remaining On-Hand Stock:</span>
              <span className={`font-bold font-mono tabular-nums ${remainingStock < product.minimum_required ? 'text-amber-700 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                {remainingStock.toFixed(1)} {product.unit}{' '}
                {remainingStock < product.minimum_required && '(Below Buffer)'}
              </span>
            </div>
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
            form="record-sale-form"
            disabled={!canSubmit}
            className={`px-5 py-2.5 text-white font-bold rounded-xl transition cursor-pointer flex items-center space-x-1.5 text-xs shadow-sm min-h-[40px] ${
              canSubmit
                ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
                : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-60'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Record Sale</span>
          </button>
        </div>
      </div>
    </div>
  );
};
