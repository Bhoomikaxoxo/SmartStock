import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { X, Sliders, CheckCircle, AlertCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Adjust Physical Stock Count</h2>
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
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-[11px]">Current On-Hand Stock</span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {product.current_stock} {product.unit}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[11px]">Minimum Buffer</span>
              <span className="text-xs font-semibold text-slate-700 font-mono">
                {product.minimum_required} {product.unit}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
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
                className={`w-full px-3 py-2 rounded-xl border text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 ${
                  isNegative
                    ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-amber-500'
                }`}
              />
              <div className="flex space-x-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setNewStock((prev) => Math.max(0, prev + 10))}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  +10
                </button>
                <button
                  type="button"
                  onClick={() => setNewStock((prev) => Math.max(0, prev + 50))}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  +50
                </button>
              </div>
            </div>

            {isNegative && (
              <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center space-x-1.5 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Physical stock count cannot be negative.</span>
              </div>
            )}

            {!isNegative && diff !== 0 && (
              <p
                className={`mt-1.5 font-semibold text-[11px] ${
                  diff > 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {diff > 0 ? `+${diff}` : diff} {product.unit} net adjustment
              </p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Adjustment Reason *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 bg-white"
            >
              <option value="Shipment Received / Restock">Shipment Received / Restock</option>
              <option value="Physical Inventory Audit">Physical Inventory Audit</option>
              <option value="Damaged / Spoiled / Expired">Damaged / Spoiled / Expired</option>
              <option value="Batch Production Usage">Batch Production Usage</option>
              <option value="Data Entry Correction">Data Entry Correction</option>
            </select>
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
              disabled={isNegative}
              className="px-5 py-2 font-bold bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Confirm Adjustment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
