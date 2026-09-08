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
      <div className="glass-modal rounded-3xl shadow-elevated max-w-md w-full p-6 sm:p-7 border border-slate-200/90 relative animate-scale-in">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-200/60 shadow-2xs">
              <TrendingUp className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Record Product Sale
              </h2>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[240px]">
                {product.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 grid grid-cols-2 gap-3">
            <div>
              <span className="text-slate-500 block text-[11px] font-semibold uppercase tracking-wider">
                Available Stock
              </span>
              <span className="text-base font-black text-slate-900 font-mono tabular-nums">
                {product.current_stock} {product.unit}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-semibold uppercase tracking-wider">
                Selling Price
              </span>
              <span className="text-base font-black text-slate-900 font-mono tabular-nums">
                ₹{product.selling_price} <span className="text-xs font-medium text-slate-400">/{product.unit}</span>
              </span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
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
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 font-mono tabular-nums ${
                  isExceeding
                    ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/30'
                    : 'border-slate-200 focus:ring-amber-500'
                }`}
              />
              <div className="flex space-x-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setUnitsSold((prev) => Math.min(product.current_stock, prev + 5))}
                  className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl cursor-pointer text-xs transition"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={() => setUnitsSold((prev) => Math.min(product.current_stock, prev + 20))}
                  className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl cursor-pointer text-xs transition"
                >
                  +20
                </button>
              </div>
            </div>

            {/* Validation Error Message */}
            {isExceeding && (
              <p className="mt-2 text-rose-600 font-bold flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Cannot sell {unitsSold} {product.unit} — only {product.current_stock} {product.unit} available in store.</span>
              </p>
            )}
          </div>

          {/* Live Revenue & Stock Depletion Preview */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-1.5">
            <div className="flex justify-between text-slate-700">
              <span className="font-medium">Total Retail Sale Value:</span>
              <span className="font-black text-amber-900 font-mono text-sm tabular-nums">
                {formatCurrencyINR(totalRevenue)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 text-[11px] pt-1 border-t border-amber-200/60">
              <span>Remaining On-Hand Stock:</span>
              <span className={`font-bold font-mono tabular-nums ${remainingStock < product.minimum_required ? 'text-amber-800' : 'text-slate-800'}`}>
                {remainingStock.toFixed(1)} {product.unit}{' '}
                {remainingStock < product.minimum_required && '(Below Buffer)'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 font-bold rounded-xl transition cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`px-5 py-2.5 text-white font-bold rounded-xl transition cursor-pointer flex items-center space-x-1.5 text-xs shadow-sm ${
                canSubmit
                  ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
                  : 'bg-slate-300 cursor-not-allowed opacity-60'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Sale</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
