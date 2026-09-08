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
      <div className="glass-modal rounded-3xl shadow-elevated max-w-md w-full p-6 sm:p-7 border border-slate-200/90 relative animate-scale-in">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold border border-amber-200/60 shadow-2xs">
              <Sliders className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Adjust Physical Stock Count
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
          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-[11px] font-semibold uppercase tracking-wider">
                Current On-Hand
              </span>
              <span className="text-base font-black text-slate-900 font-mono tabular-nums">
                {product.current_stock} {product.unit}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[11px] font-semibold uppercase tracking-wider">
                Minimum Buffer
              </span>
              <span className="text-xs font-bold text-slate-700 font-mono tabular-nums">
                {product.minimum_required} {product.unit}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
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
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 font-mono tabular-nums ${
                  isNegative
                    ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/30'
                    : 'border-slate-200 focus:ring-amber-500'
                }`}
              />
              <div className="flex space-x-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setNewStock((prev) => Math.max(0, prev + 10))}
                  className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl cursor-pointer text-xs transition"
                >
                  +10
                </button>
                <button
                  type="button"
                  onClick={() => setNewStock((prev) => Math.max(0, prev + 50))}
                  className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl cursor-pointer text-xs transition"
                >
                  +50
                </button>
              </div>
            </div>

            {isNegative && (
              <p className="mt-2 text-rose-600 font-bold flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Stock quantity cannot be negative.</span>
              </p>
            )}
          </div>

          {/* Variance / Delta Pill */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/80 text-xs font-semibold">
            <span className="text-slate-600">Net Inventory Adjustment:</span>
            <span
              className={`font-mono font-extrabold px-2 py-0.5 rounded-md ${
                diff > 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : diff < 0
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)} {product.unit}
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Adjustment Reason / Audit Trail Tag *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 bg-white text-xs font-medium"
            >
              <option value="Shipment Received / Restock">Shipment Received / Restock</option>
              <option value="Physical Inventory Cycle Count">Physical Inventory Cycle Count</option>
              <option value="Damaged / Spoiled Goods Write-off">Damaged / Spoiled Goods Write-off</option>
              <option value="Batch Production Usage Correction">Batch Production Usage Correction</option>
              <option value="Supplier Return">Supplier Return</option>
            </select>
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
              disabled={isNegative}
              className={`px-5 py-2.5 text-white font-bold rounded-xl transition cursor-pointer flex items-center space-x-1.5 text-xs shadow-sm ${
                !isNegative
                  ? 'bg-amber-600 hover:bg-amber-700 active:scale-95'
                  : 'bg-slate-300 cursor-not-allowed opacity-60'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Update Stock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
