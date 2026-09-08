import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, PurchaseOrder } from '../../types';
import {
  X,
  Send,
  ShoppingCart,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  FileText,
  Building2,
  Printer,
  AlertCircle,
} from 'lucide-react';
import { formatCurrencyINR } from '../../services/reorderEngine';
import confetti from 'canvas-confetti';
import { PrintablePOModal } from './PrintablePOModal';

interface CreatePOModalProps {
  product?: Product;
  preselectedProduct?: Product;
  defaultQuantity?: number;
  initialQuantity?: number;
  onClose: () => void;
}

interface InnerProps {
  activeProduct: Product;
  initQty: number;
  onClose: () => void;
}

const CreatePOModalContent: React.FC<InnerProps> = ({ activeProduct, initQty, onClose }) => {
  const { suppliers, createPurchaseOrder } = useApp();

  const [step, setStep] = useState<1 | 2>(1);
  const [quantity, setQuantity] = useState<number>(initQty);
  const [supplierId, setSupplierId] = useState<string>(activeProduct.supplier_id);
  const [unitCost, setUnitCost] = useState<number>(activeProduct.cost_price);
  const [notes, setNotes] = useState(`Automated replenishment for ${activeProduct.name}`);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdPo, setCreatedPo] = useState<PurchaseOrder | null>(null);
  const [showVoucher, setShowVoucher] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ quantity?: string; unitCost?: string }>({});

  const selectedSupplier = suppliers.find((s) => s.id === supplierId) || suppliers[0];
  const totalCost = Math.round(quantity * unitCost);

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { quantity?: string; unitCost?: string } = {};

    if (!quantity || quantity <= 0) {
      errors.quantity = 'Quantity must be at least 1 unit.';
    }
    if (unitCost === undefined || unitCost <= 0) {
      errors.unitCost = 'Unit cost must be greater than ₹0.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
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
      setCreatedPo(po);
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
      <div className="glass-modal rounded-3xl shadow-elevated max-w-lg w-full max-h-[85vh] sm:max-h-[90vh] flex flex-col border border-slate-200/90 dark:border-slate-800 relative animate-scale-in overflow-hidden">
        {/* Pinned Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold border border-amber-200/60 dark:border-amber-800/50 shadow-2xs">
              <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {isSuccess ? 'Order Confirmation' : step === 1 ? 'Configure Purchase Order' : 'Review & Confirm Order'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[240px]">
                {activeProduct.name}
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

        {/* Scrollable Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {isSuccess ? (
            <div className="py-6 text-center space-y-4 animate-scale-in">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  Purchase Order Dispatched
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  PO <strong className="font-mono text-slate-800 dark:text-slate-200">{createdPo?.po_number}</strong> sent to{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{selectedSupplier?.name}</strong>.
                </p>
              </div>

              <div className="p-4 bg-slate-50/90 dark:bg-slate-800/60 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 text-xs text-left max-w-xs mx-auto space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Quantity:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">
                    {quantity} {activeProduct.unit}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Est. Delivery:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">
                    {selectedSupplier?.lead_time_days || 2} Days
                  </span>
                </div>
                <div className="flex justify-between text-slate-900 dark:text-slate-100 font-extrabold pt-1.5 border-t border-slate-200 dark:border-slate-700">
                  <span>Total Value:</span>
                  <span className="text-amber-700 dark:text-amber-400">{formatCurrencyINR(totalCost)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVoucher(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs rounded-xl transition shadow-xs cursor-pointer min-h-[40px]"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                  <span>View Printable Voucher</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 dark:bg-amber-600 hover:bg-slate-800 dark:hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer min-h-[40px]"
                >
                  Done & Close
                </button>
              </div>
            </div>
          ) : step === 1 ? (
            /* Step 1: Configuration Form */
            <form id="create-po-step1-form" onSubmit={handleReview} className="space-y-4">
              <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">
                    Current On-Hand
                  </span>
                  <span className="text-base font-black text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                    {activeProduct.current_stock} {activeProduct.unit}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">
                    Replenishment Buffer
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono tabular-nums">
                    {activeProduct.minimum_required} {activeProduct.unit}
                  </span>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Reorder Quantity ({activeProduct.unit}) *
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={quantity}
                    onChange={(e) => {
                      setQuantity(Math.max(1, parseInt(e.target.value) || 0));
                      if (fieldErrors.quantity) setFieldErrors((prev) => ({ ...prev, quantity: undefined }));
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${
                      fieldErrors.quantity
                        ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                    } focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold text-sm text-slate-900 dark:text-slate-100 tabular-nums`}
                  />
                  <div className="flex space-x-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => prev + 25)}
                      className="px-2.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl cursor-pointer text-xs transition min-h-[40px]"
                    >
                      +25
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => prev + 50)}
                      className="px-2.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl cursor-pointer text-xs transition min-h-[40px]"
                    >
                      +50
                    </button>
                  </div>
                </div>
                {fieldErrors.quantity && (
                  <p className="text-rose-600 dark:text-rose-400 text-[11px] font-semibold mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.quantity}</span>
                  </p>
                )}
              </div>

              {/* Supplier & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Supplier / Vendor *
                  </label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 font-medium"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.lead_time_days}d lead)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Contract Cost (INR) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={unitCost}
                    onChange={(e) => {
                      setUnitCost(parseFloat(e.target.value) || 0);
                      if (fieldErrors.unitCost) setFieldErrors((prev) => ({ ...prev, unitCost: undefined }));
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${
                      fieldErrors.unitCost
                        ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                    } focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold text-sm text-slate-900 dark:text-slate-100 tabular-nums`}
                  />
                  {fieldErrors.unitCost && (
                    <p className="text-rose-600 dark:text-rose-400 text-[11px] font-semibold mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.unitCost}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Estimated Total */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50 flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900 dark:text-amber-300">Estimated Total Cost:</span>
                <span className="text-base font-black text-amber-900 dark:text-amber-300 font-mono tabular-nums">
                  {formatCurrencyINR(totalCost)}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Notes & Delivery Instructions
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 font-medium"
                />
              </div>
            </form>
          ) : (
            /* Step 2: Confirmation Invoice View */
            <div className="space-y-4 animate-scale-in">
              <div className="p-4 bg-slate-50/90 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-700/60 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">Vendor Dispatch Voucher</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/60 uppercase tracking-wider">
                    Ready to Transmit
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Supplier</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">{selectedSupplier?.name}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Lead time: {selectedSupplier?.lead_time_days} days</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">Product & Quantity</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">
                      {quantity} {activeProduct.unit}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">@{formatCurrencyINR(unitCost)} / unit</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/60 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Total Purchase Commitment:</span>
                  <span className="text-base font-black text-amber-700 dark:text-amber-400 font-mono tabular-nums">
                    {formatCurrencyINR(totalCost)}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 rounded-xl text-blue-900 dark:text-blue-300 text-[11px] leading-relaxed flex items-start space-x-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>
                  Dispatching will record an official audit log entry under your active identity and generate an authorized purchase order number.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Pinned Modal Footer Actions (only when not success screen) */}
        {!isSuccess && (
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            {step === 1 ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold rounded-xl transition cursor-pointer text-xs min-h-[40px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="create-po-step1-form"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition cursor-pointer flex items-center space-x-1.5 text-xs shadow-sm active:scale-95 min-h-[40px]"
                >
                  <span>Review Order</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold rounded-xl transition cursor-pointer flex items-center space-x-1.5 text-xs min-h-[40px]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDispatch}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition cursor-pointer flex items-center space-x-1.5 text-xs shadow-sm active:scale-95 min-h-[40px]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirm & Dispatch PO</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {showVoucher && createdPo && (
        <PrintablePOModal
          po={createdPo}
          onClose={() => {
            setShowVoucher(false);
            onClose();
          }}
        />
      )}
    </div>
  );
};

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

  return (
    <CreatePOModalContent
      activeProduct={activeProduct}
      initQty={initQty}
      onClose={onClose}
    />
  );
};
