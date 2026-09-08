import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Recipe, Product } from '../../types';
import { X, ChefHat, AlertTriangle, CheckCircle2, ShoppingCart, ArrowRight, Layers } from 'lucide-react';
import { CreatePOModal } from '../alerts/CreatePOModal';
import { sounds } from '../../utils/audio';

interface BakeBatchModalProps {
  recipe: Recipe;
  onClose: () => void;
}

export const BakeBatchModal: React.FC<BakeBatchModalProps> = ({ recipe, onClose }) => {
  const { products, produceBatch, getLotsForProduct } = useApp();
  const [batchCount, setBatchCount] = useState<number>(1);
  const [poProduct, setPoProduct] = useState<Product | null>(null);

  // Compute live availability, shortfalls, and FIFO lot allocations
  const ingredientChecks = recipe.ingredients.map((ing) => {
    const product = products.find((p) => p.id === ing.product_id);
    const required = parseFloat((ing.quantity * batchCount).toFixed(2));
    const available = product ? product.current_stock : 0;
    const isSufficient = available >= required;
    const deficit = parseFloat((required - available).toFixed(2));

    // Calculate FIFO lot consumption breakdown
    const activeLots = product ? getLotsForProduct(product.id) : [];
    let remaining = required;
    const lotAllocations: { lotNumber: string; deducted: number; daysLeft: number; fullyDepleted: boolean }[] = [];

    for (const lot of activeLots) {
      if (remaining <= 0) break;
      const take = parseFloat(Math.min(lot.quantity, remaining).toFixed(2));
      const daysLeft = Math.ceil(
        (new Date(lot.expiry_date).getTime() - new Date().setHours(0, 0, 0, 0)) /
          (1000 * 60 * 60 * 24)
      );
      lotAllocations.push({
        lotNumber: lot.lot_number,
        deducted: take,
        daysLeft,
        fullyDepleted: take >= lot.quantity,
      });
      remaining = parseFloat((remaining - take).toFixed(2));
    }

    return {
      ingredient: ing,
      product,
      required,
      available,
      isSufficient,
      deficit: deficit > 0 ? deficit : 0,
      lotAllocations,
    };
  });

  const hasShortage = ingredientChecks.some((c) => !c.isSufficient);
  const totalYield = batchCount * recipe.yield_quantity;

  const handleBake = () => {
    if (hasShortage) return;
    const res = produceBatch(recipe.id, batchCount);
    if (res.success) {
      sounds.playSuccessChime();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 overflow-y-auto animate-fade-in">
      <div className="glass-modal rounded-3xl shadow-elevated max-w-lg w-full p-6 sm:p-7 border border-slate-200/90 relative animate-scale-in my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-200/60 shadow-2xs">
              <ChefHat className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Schedule Batch Production
              </h2>
              <p className="text-xs text-slate-500 font-medium">{recipe.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5 text-xs">
          {/* Batch Count Stepper */}
          <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/70 flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-[11px] font-semibold uppercase tracking-wider">
                Production Multiplier
              </span>
              <span className="text-sm font-bold text-slate-900">
                Yield: <strong className="text-emerald-700 font-mono text-base">{totalYield}</strong> {recipe.yield_unit}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setBatchCount((c) => Math.max(1, c - 1))}
                className="w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-700 font-black hover:bg-slate-100 transition cursor-pointer text-sm"
              >
                -
              </button>
              <span className="w-10 text-center font-mono font-black text-slate-900 text-base">
                {batchCount}x
              </span>
              <button
                type="button"
                onClick={() => setBatchCount((c) => c + 1)}
                className="w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-700 font-black hover:bg-slate-100 transition cursor-pointer text-sm"
              >
                +
              </button>
            </div>
          </div>

          {/* BOM Ingredients Check Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Bill of Materials (BOM) Requirements
              </span>
              <span className="text-[11px] text-slate-500">
                {ingredientChecks.length} raw ingredients
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white shadow-2xs">
              {ingredientChecks.map((check, idx) => (
                <div
                  key={idx}
                  className={`p-3 text-xs transition ${
                    !check.isSufficient ? 'bg-rose-50/50' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900">
                        {check.product ? check.product.name : check.ingredient.product_id}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Needed: <span className="font-bold text-slate-800">{check.required} {check.ingredient.unit}</span> | Available: <span className="font-bold text-slate-800">{check.available} {check.ingredient.unit}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {check.isSufficient ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          In Stock
                        </span>
                      ) : (
                        <div className="flex items-center space-x-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Short {check.deficit} {check.ingredient.unit}
                          </span>
                          {check.product && (
                            <button
                              type="button"
                              onClick={() => setPoProduct(check.product!)}
                              className="inline-flex items-center space-x-1 px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold transition shadow-2xs cursor-pointer"
                              title="Generate PO for missing stock"
                            >
                              <ShoppingCart className="w-3 h-3" />
                              <span>PO</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* FIFO Lot Allocation Breakdown */}
                  {check.isSufficient && check.lotAllocations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100/80 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center">
                        <Layers className="w-3 h-3 mr-1 text-amber-700" />
                        FIFO Deduct:
                      </span>
                      {check.lotAllocations.map((alloc, aIdx) => (
                        <span
                          key={aIdx}
                          className={`inline-flex items-center text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                            alloc.daysLeft <= 3
                              ? 'bg-rose-50 border-rose-200 text-rose-800 font-bold'
                              : 'bg-amber-50/70 border-amber-200/70 text-amber-900 font-semibold'
                          }`}
                          title={`Lot ${alloc.lotNumber} expires in ${alloc.daysLeft}d`}
                        >
                          {alloc.lotNumber} (-{alloc.deducted} {check.ingredient.unit})
                          {alloc.daysLeft <= 3 && ` [${alloc.daysLeft}d left]`}
                          {alloc.fullyDepleted && ' • Depletes'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Feasibility Alert Box */}
          {hasShortage ? (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-2 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">Production Blocked</strong>
                <span>
                  Insufficient raw material stock to bake {batchCount} batch(es). Replenish missing ingredients via Purchase Order before deducting.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start space-x-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">Feasibility Verified (FIFO Automated)</strong>
                <span>
                  All {ingredientChecks.length} ingredients are available. Executing bake will deduct raw materials strictly from the oldest active stock lots first.
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 font-bold rounded-xl transition cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={hasShortage}
              onClick={handleBake}
              className={`px-5 py-2.5 font-bold rounded-xl transition text-xs flex items-center space-x-1.5 shadow-sm ${
                hasShortage
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95'
              }`}
            >
              <span>Execute Bake & Deduct</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Modal: Quick Create PO for deficient ingredient */}
      {poProduct && (
        <CreatePOModal
          product={poProduct}
          initialQuantity={Math.ceil(poProduct.minimum_required * 1.5)}
          onClose={() => setPoProduct(null)}
        />
      )}
    </div>
  );
};
