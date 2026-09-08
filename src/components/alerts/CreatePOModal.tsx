import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { X, Send, ShoppingCart, CheckCircle, ShieldAlert, ArrowLeft, ArrowRight } from 'lucide-react';
import { formatCurrencyINR } from '../../services/reorderEngine';
import confetti from 'canvas-confetti';

interface CreatePOModalProps {
  product: Product;
  defaultQuantity?: number;
  onClose: () => void;
}

export const CreatePOModal: React.FC<CreatePOModalProps> = ({
  product,
  defaultQuantity = 50,
  onClose,
}) => {
  const { suppliers, createPurchaseOrder } = useApp();

  const [step, setStep] = useState<1 | 2>(1);
  const [quantity, setQuantity] = useState<number>(defaultQuantity);
  const [supplierId, setSupplierId] = useState<string>(product.supplier_id);
  const [unitCost, setUnitCost] = useState<number>(product.cost_price);
  const [notes, setNotes] = useState(`Automated replenishment for ${product.name}`);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdPoNumber, setCreatedPoNumber] = useState('');

  const selectedSupplier = suppliers.find((s) => s.id === supplierId) || suppliers[0];
  const totalCost = Math.round(quantity * unitCost);

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;
    setStep(2);
  };

  const handleConfirmDispatch = () => {
    const po = createPurchaseOrder({
      supplier_id: supplierId,
      product_id: product.id,
      quantity,
      unit_cost: unitCost,
      notes,
    });

    if (po) {
      setCreatedPoNumber(po.po_number);
      setIsSuccess(true);
      try {
        confetti({
          particleCount: 60,
          spread: 50,
          origin: { y: 0.7 },
        });
      } catch {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {step === 1 ? 'Configure Purchase Order' : 'Review & Confirm Order'}
              </h2>
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

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Purchase Order Dispatched</h3>
              <p className="text-xs text-slate-500 mt-1">
                Order <span className="font-bold text-slate-900">{createdPoNumber}</span> transmitted to{' '}
                <span className="font-semibold text-slate-800">{selectedSupplier?.name}</span>.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 max-w-xs mx-auto">
              Delivery expected within {selectedSupplier?.lead_time_days || 2} business days. Low-stock alerts marked resolved.
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : step === 1 ? (
          <form onSubmit={handleReview} className="mt-4 space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Vendor / Supplier *</label>
              <select
                value={supplierId}
                onChange={(e) => {
                  setSupplierId(e.target.value);
                  setUnitCost(product.cost_price);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 bg-white"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.lead_time_days}d lead time • Contact: {s.contact})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Order Quantity ({product.unit}) *
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Contract Cost (₹) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  required
                  value={unitCost}
                  onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-500 text-[11px] block font-medium">Estimated Order Cost</span>
                <span className="text-lg font-black text-slate-900 font-mono">{formatCurrencyINR(totalCost)}</span>
              </div>
              <div className="text-right text-slate-600 text-[11px]">
                <span className="font-semibold block">Expected Delivery</span>
                <span>{selectedSupplier?.lead_time_days || 2} Business Days</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Logistics / Delivery Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please deliver to bakery dock before 8 AM."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
              />
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
                className="px-5 py-2 font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Review Order Summary</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          /* Step 2: Confirmation Summary */
          <div className="mt-4 space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200/60 font-semibold text-amber-950">
                <span>Vendor:</span>
                <span className="font-bold text-slate-900">{selectedSupplier?.name}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-amber-200/60 text-slate-700">
                <span>Item Ordered:</span>
                <span className="font-bold text-slate-900">
                  {quantity} {product.unit} of {product.name}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-amber-200/60 text-slate-700">
                <span>Unit Cost:</span>
                <span className="font-mono text-slate-900">₹{unitCost} / {product.unit}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-amber-200/60 text-slate-700">
                <span>Lead Time:</span>
                <span className="font-semibold text-slate-900">{selectedSupplier?.lead_time_days} days</span>
              </div>
              <div className="flex items-center justify-between pt-1 text-sm font-bold text-slate-900">
                <span>Total Financial Commitment:</span>
                <span className="font-black text-base font-mono text-slate-900">
                  {formatCurrencyINR(totalCost)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              * Confirming will log a purchase order record and update inventory replenishment schedules.
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition flex items-center space-x-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Edit</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmDispatch}
                className="px-5 py-2 font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Confirm & Transmit Order</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
