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
  const [errorMessage, setErrorMessage] = useState<string>('');

  const product = products.find((p) => p.id === selectedProductId);
  const estimatedCost = product ? Math.round(quantity * product.cost_price) : 0;
  const isExceeding = product ? quantity > product.current_stock : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) {
      setErrorMessage('Please select a valid product.');
      return;
    }
    if (quantity <= 0 || isNaN(quantity)) {
      setErrorMessage('Quantity must be greater than 0.');
      return;
    }
    if (isExceeding) {
      setErrorMessage(`Quantity cannot exceed on-hand stock (${product.current_stock} ${product.unit}).`);
      return;
    }

    setErrorMessage('');
    const res = logWaste(product.id, quantity, reason);
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
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 flex items-center justify-center font-bold border border-rose-200/60 dark:border-rose-800/50 shadow-2xs">
              <Trash2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Log Wastage & Shrinkage
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Record spoiled, expired, or damaged inventory
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
        <form id="log-waste-form" onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Select Product */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Ingredient / Finished Product *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setQuantity(1);
                setErrorMessage('');
              }}
              className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-amber-500"
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
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Available On-Hand:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {product.current_stock} {product.unit}
              </span>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Quantity to Write Off ({product?.unit || 'units'}) *
            </label>
            <input
              type="number"
              min="0.1"
              step="any"
              max={product?.current_stock}
              value={quantity}
              onChange={(e) => {
                setQuantity(parseFloat(e.target.value) || 0);
                if (errorMessage) setErrorMessage('');
              }}
              className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-amber-500 font-bold"
            />
            {isExceeding && (
              <p className="text-rose-600 dark:text-rose-400 font-medium text-[11px] mt-1.5 flex items-center">
                <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                Cannot exceed current on-hand stock ({product?.current_stock} {product?.unit}).
              </p>
            )}
            {errorMessage && !isExceeding && (
              <p className="text-rose-600 dark:text-rose-400 font-medium text-[11px] mt-1.5 flex items-center">
                <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                {errorMessage}
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Shrinkage Reason *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as WasteReason)}
              className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-amber-500"
            >
              {WASTE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Financial Loss Preview */}
          <div className="p-3.5 bg-rose-50/70 dark:bg-rose-950/40 rounded-2xl border border-rose-200/80 dark:border-rose-800 flex items-center justify-between">
            <div>
              <span className="text-rose-700 dark:text-rose-400 block text-[11px] font-bold uppercase tracking-wider">
                Estimated Material Loss
              </span>
              <span className="text-[11px] text-rose-600 dark:text-rose-400">
                At cost price {formatCurrencyINR(product?.cost_price || 0)} / {product?.unit}
              </span>
            </div>
            <span className="text-base font-mono font-black text-rose-900 dark:text-rose-300">
              {formatCurrencyINR(estimatedCost)}
            </span>
          </div>
        </form>

        {/* Pinned Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold rounded-xl transition cursor-pointer text-xs min-h-[40px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="log-waste-form"
            disabled={isExceeding || quantity <= 0}
            className={`px-5 py-2.5 font-bold rounded-xl transition text-xs shadow-sm min-h-[40px] ${
              !isExceeding && quantity > 0
                ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer active:scale-95'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            Record Waste Log
          </button>
        </div>
      </div>
    </div>
  );
};
