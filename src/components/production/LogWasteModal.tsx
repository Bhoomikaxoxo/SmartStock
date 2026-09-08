import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, WasteReason } from '../../types';
import { X, Trash2, AlertCircle } from 'lucide-react';
import { formatCurrencyINR } from '../../services/reorderEngine';

interface LogWasteModalProps {
  preselectedProduct?: Product;
  onClose: () => void;
}

const WASTE_REASONS: WasteReason[] = [
  'Expired',
  'Damaged in Kitchen',
  'Over-Proofed / Burned',
  'Quality Reject',
];

export const LogWasteModal: React.FC<LogWasteModalProps> = ({
  preselectedProduct,
  onClose,
}) => {
  const { products, logWaste } = useApp();
  const [selectedProductId, setSelectedProductId] = useState<string>(
    preselectedProduct?.id || products[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<WasteReason>('Expired');

  const product = products.find((p) => p.id === selectedProductId);
  const estimatedCost = product ? Math.round(quantity * product.cost_price) : 0;
  const isExceeding = product ? quantity > product.current_stock : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || quantity <= 0 || isExceeding) return;

    const res = logWaste(product.id, quantity, reason);
    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 overflow-y-auto animate-fade-in">
      <div className="glass-modal rounded-3xl shadow-elevated max-w-md w-full p-6 sm:p-7 border border-slate-200/90 relative animate-scale-in my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold border border-rose-200/60 shadow-2xs">
              <Trash2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Log Wastage & Shrinkage
              </h2>
              <p className="text-xs text-slate-500 font-medium">Record spoiled, expired, or damaged inventory</p>
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
          {/* Select Product */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Ingredient / Finished Product *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setQuantity(1);
              }}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.current_stock} {p.unit} in stock)
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock Banner */}
          {product && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Available On-Hand:</span>
              <span className="font-mono font-bold text-slate-900">
                {product.current_stock} {product.unit}
              </span>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Quantity to Write Off ({product?.unit || 'units'}) *
            </label>
            <input
              type="number"
              min="0.1"
              step="any"
              max={product?.current_stock}
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            {isExceeding && (
              <p className="text-rose-600 font-medium text-[11px] mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                Cannot exceed current on-hand stock ({product?.current_stock} {product?.unit}).
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Shrinkage Reason *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as WasteReason)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {WASTE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Financial Loss Preview */}
          <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200/80 flex items-center justify-between">
            <div>
              <span className="text-rose-700 block text-[11px] font-bold uppercase tracking-wider">
                Estimated Material Loss
              </span>
              <span className="text-[11px] text-rose-600">
                At cost price {formatCurrencyINR(product?.cost_price || 0)} / {product?.unit}
              </span>
            </div>
            <span className="text-base font-mono font-black text-rose-900">
              {formatCurrencyINR(estimatedCost)}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold rounded-xl transition cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={quantity <= 0 || isExceeding}
              className={`px-5 py-2.5 font-bold rounded-xl transition text-xs shadow-sm ${
                quantity <= 0 || isExceeding
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer active:scale-95'
              }`}
            >
              Record Shrinkage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
