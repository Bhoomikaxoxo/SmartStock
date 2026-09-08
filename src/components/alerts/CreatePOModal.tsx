import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { X, Send, ShoppingCart, CheckCircle2, ShieldAlert, ArrowLeft, ArrowRight, FileText, Building2 } from 'lucide-react';
import { formatCurrencyINR } from '../../services/reorderEngine';
import confetti from 'canvas-confetti';

interface CreatePOModalProps {
  product?: Product;
  preselectedProduct?: Product;
  defaultQuantity?: number;
  initialQuantity?: number;
  onClose: () => void;
}

export const CreatePOModal: React.FC<CreatePOModalProps> = ({
  product,
  preselectedProduct,
  defaultQuantity = 50,
  initialQuantity,
  onClose,
}) => {
  const activeProduct = product || preselectedProduct;
  const initQty = initialQuantity !== undefined ? initialQuantity : defaultQuantity;

  if (!activeProduct) return null;

  const { suppliers, createPurchaseOrder } = useApp();

  const [step, setStep] = useState<1 | 2>(1);
  const [quantity, setQuantity] = useState<number>(initQty);
  const [supplierId, setSupplierId] = useState<string>(activeProduct.supplier_id);
  const [unitCost, setUnitCost] = useState<number>(activeProduct.cost_price);
  const [notes, setNotes] = useState(`Automated replenishment for ${activeProduct.name}`);
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
      product_id: activeProduct.id,
      quantity,
      unit_cost: unitCost,
      notes,
    });

    if (po) {
      setCreatedPoNumber(po.po_number);
      setIsSuccess(true);
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.65 },
        });
      } catch {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="glass-modal rounded-3xl shadow-elevated max-w-lg w-full p-6 sm:p-7 border border-slate-200/90 relative animate-scale-in">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold border border-amber-200/60 shadow-2xs">
              <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                {step === 1 ? 'Configure Purchase Order' : 'Review & Confirm Order'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">{activeProduct.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4 animate-scale-in">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200/80 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Purchase Order Dispatched
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                PO <strong className="font-mono text-slate-800">{createdPoNumber}</strong> sent to{' '}
                <strong className="text-slate-800">{selectedSupplier?.name}</strong>.
              </p>
            </div>

            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/70 text-xs text-left max-w-xs mx-auto space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Quantity:</span>
                <span className="font-bold text-slate-900">
                  {quantity} {activeProduct.unit}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Est. Delivery:</span>
                <span className="font-bold text-slate-900">
                  {selectedSupplier?.lead_time_days || 2} Days
                </span>
              </div>
              <div className="flex justify-between text-slate-900 font-extrabold pt-1.5 border-t border-slate-200">
                <span>Total Value:</span>
                <span className="text-amber-800">{formatCurrencyINR(totalCost)}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        ) : step === 1 ? (
          /* Step 1: Configuration Form */
          <form onSubmit={handleReview} className="mt-5 space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px] font-semibold uppercase tracking-wider">
                  Current On-Hand
                </span>
                <span className="text-base font-black text-slate-900 font-mono tabular-nums">
                  {activeProduct.current_stock} {activeProduct.unit}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[11px] font-semibold uppercase tracking-wider">
                  Replenishment Buffer
                </span>
                <span className="text-xs font-bold text-slate-700 font-mono tabular-nums">
                  {activeProduct.minimum_required} {activeProduct.unit}
                </span>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Reorder Quantity ({activeProduct.unit}) *
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold text-sm text-slate-900 tabular-nums"
                />
                <div className="flex space-x-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => prev + 25)}
                    className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl cursor-pointer text-xs transition"
                  >
                    +25
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => prev + 50)}
                    className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl cursor-pointer text-xs transition"
                  >
                    +50
                  </button>
                </div>
              </div>
            </div>

            {/* Supplier & Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Supplier / Vendor *</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 bg-white font-medium"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.lead_time_days}d)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Contract Cost (INR) *</label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  required
                  value={unitCost}
                  onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold text-sm text-slate-900 tabular-nums"
                />
              </div>
            </div>

            {/* Estimated Total */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex items-center justify-between text-xs">
              <span className="font-bold text-amber-900">Estimated Total Cost:</span>
              <span className="text-base font-black text-amber-900 font-mono tabular-nums">
                {formatCurrencyINR(totalCost)}
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Notes & Delivery Instructions</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 font-medium"
              />
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
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition cursor-pointer flex items-center space-x-1.5 text-xs shadow-sm active:scale-95"
              >
                <span>Review Order</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        ) : (
          /* Step 2: 2-Step Confirmation Invoice View */
          <div className="mt-5 space-y-4 text-xs animate-scale-in">
            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/70 pb-2.5">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-800 text-xs">Vendor Dispatch Voucher</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 uppercase tracking-wider">
                  Ready to Transmit
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Supplier</span>
                  <span className="font-bold text-slate-900 text-sm block">{selectedSupplier?.name}</span>
                  <span className="text-slate-500 text-[11px]">Lead time: {selectedSupplier?.lead_time_days} days</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">Product & Quantity</span>
                  <span className="font-bold text-slate-900 text-sm block">
                    {quantity} {activeProduct.unit}
                  </span>
                  <span className="text-slate-500 text-[11px]">@{formatCurrencyINR(unitCost)} / unit</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/70 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">Total Purchase Commitment:</span>
                <span className="text-base font-black text-amber-800 font-mono tabular-nums">
                  {formatCurrencyINR(totalCost)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl text-blue-900 text-[11px] leading-relaxed flex items-start space-x-2">
              <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Dispatching will record an official audit log entry under your active identity and generate an authorized purchase order number.
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 font-bold rounded-xl transition cursor-pointer flex items-center space-x-1.5 text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmDispatch}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition cursor-pointer flex items-center space-x-1.5 text-xs shadow-sm active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm & Dispatch PO</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
