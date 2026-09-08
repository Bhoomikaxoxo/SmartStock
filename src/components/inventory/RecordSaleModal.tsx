import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { X, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Record Product Sale / Usage</h2>
              <p className="text-xs text-slate-500">{product.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-500 block text-[11px]">Available Stock</span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {product.current_stock} {product.unit}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Selling Price</span>
              <span className="text-base font-bold text-slate-900 font-mono">
                ₹{product.selling_price} / {product.unit}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
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
                className={`w-full px-3 py-2 rounded-xl border text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 ${
                  isExceeding
                    ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-amber-500'
                }`}
              />
              <div className="flex space-x-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setUnitsSold((prev) => Math.min(product.current_stock, prev + 5))}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={() => setUnitsSold((prev) => Math.min(product.current_stock, prev + 20))}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  +20
                </button>
              </div>
            </div>

            {/* Validation errors */}
            {isExceeding && (
              <div className="mt-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center space-x-2 text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Cannot exceed available inventory ({product.current_stock} {product.unit} in stock).</span>
              </div>
            )}
            {unitsSold <= 0 && (
              <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                Quantity must be greater than zero.
              </div>
            )}
          </div>

          {/* Revenue Calculation preview */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-slate-500 text-[11px] block font-medium">
                Recorded Revenue
              </span>
              <span className="text-lg font-black text-slate-900 font-mono">
                {formatCurrencyINR(totalRevenue)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 text-[11px] block font-medium">
                Remaining Stock After Sale
              </span>
              <span
                className={`text-xs font-bold font-mono ${
                  remainingStock === 0 ? 'text-rose-600' : 'text-slate-800'
                }`}
              >
                {remainingStock} {product.unit} {remainingStock === 0 ? '(Depletes to 0)' : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-5 py-2 font-bold bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Record Sale</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
