import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Recipe, Product } from '../../types';
import {
  X,
  ChefHat,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShoppingCart,
} from 'lucide-react';
import { sounds } from '../../utils/audio';
import { CreatePOModal } from '../alerts/CreatePOModal';

interface BakeBatchModalProps {
  recipe: Recipe;
  onClose: () => void;
}

export const BakeBatchModal: React.FC<BakeBatchModalProps> = ({ recipe, onClose }) => {
  const { products, getLotsForProduct, produceBatch } = useApp();
  const [batchCount, setBatchCount] = useState<number>(1);
  const [poProduct, setPoProduct] = useState<Product | null>(null);

  // Compute ingredient feasibility and FIFO lot previews
  const ingredientChecks = recipe.ingredients.map((ing) => {
    const product = products.find((p) => p.id === ing.product_id);
    const required = parseFloat((ing.quantity * batchCount).toFixed(2));
    const available = product ? product.current_stock : 0;
    const isSufficient = available >= required;
    const deficit = parseFloat((required - available).toFixed(2));

    // FIFO lots simulation preview
    const activeLots = product
      ? [...getLotsForProduct(product.id)]
          .filter((l) => l.quantity > 0)
          .sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime())
      : [];

    let remaining = required;
    const lotAllocations: {
      lotNumber: string;
      deducted: number;
      daysLeft: number;
      fullyDepleted: boolean;
    }[] = [];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="glass-modal rounded-3xl shadow-elevated max-w-lg w-full max-h-[85vh] sm:max-h-[90vh] flex flex-col border border-slate-200/90 dark:border-slate-800 relative animate-scale-in overflow-hidden">
        {/* Pinned Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-200/60 dark:border-emerald-800/50 shadow-2xs">
              <ChefHat className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Schedule Batch Production
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[240px]">
                {recipe.name}
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
          {/* Batch Count Stepper */}
          <div className="p-4 bg-slate-50/90 dark:bg-slate-800/60 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">
                Production Multiplier
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Yield: <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-base">{totalYield}</strong> {recipe.yield_unit}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setBatchCount((c) => Math.max(1, c - 1))}
                className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-black hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-sm flex items-center justify-center min-w-[36px]"
              >
                -
              </button>
              <span className="w-10 text-center font-mono font-black text-slate-900 dark:text-slate-100 text-base">
                {batchCount}x
              </span>
              <button
                type="button"
                onClick={() => setBatchCount((c) => c + 1)}
                className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-black hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-sm flex items-center justify-center min-w-[36px]"
              >
                +
              </button>
            </div>
          </div>

          {/* BOM Ingredients Check Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                Bill of Materials (BOM) Requirements
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {ingredientChecks.length} raw ingredients
              </span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
              {ingredientChecks.map((check, idx) => (
                <div
                  key={idx}
                  className={`p-3 transition-colors ${
                    !check.isSufficient ? 'bg-rose-50/50 dark:bg-rose-950/20' : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">
                        {check.product ? check.product.name : check.ingredient.product_id}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Need: <strong className="font-mono text-slate-800 dark:text-slate-200">{check.required}</strong> {check.ingredient.unit} • On hand: <strong className={`font-mono ${check.isSufficient ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>{check.available}</strong> {check.ingredient.unit}
                      </span>
                    </div>

                    <div className="text-right flex items-center space-x-2">
                      {check.isSufficient ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
                          Sufficient
                        </span>
                      ) : (
                        <div className="flex items-center space-x-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300">
                            Deficit: {check.deficit} {check.ingredient.unit}
                          </span>
                          {check.product && (
                            <button
                              type="button"
                              onClick={() => setPoProduct(check.product!)}
                              className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] transition flex items-center space-x-1 cursor-pointer"
                              title="Create PO to replenish shortage"
                            >
                              <ShoppingCart className="w-2.5 h-2.5" />
                              <span>PO</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* FIFO lot deductions preview */}
                  {check.isSufficient && check.lotAllocations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2 flex-wrap text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      <span className="font-bold text-slate-400">FIFO Lots:</span>
                      {check.lotAllocations.map((alloc, lIdx) => (
                        <span
                          key={lIdx}
                          className="inline-block bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
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
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 flex items-start space-x-2 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">Production Blocked</strong>
                <span>
                  Insufficient raw material stock to bake {batchCount} batch(es). Replenish missing ingredients via Purchase Order before deducting.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-start space-x-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">Feasibility Verified (FIFO Automated)</strong>
                <span>
                  All {ingredientChecks.length} ingredients are available. Executing bake will deduct raw materials strictly from the oldest active stock lots first.
                </span>
              </div>
            </div>
          )}
        </div>

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
            type="button"
            disabled={hasShortage}
            onClick={handleBake}
            className={`px-5 py-2.5 font-bold rounded-xl transition text-xs flex items-center space-x-1.5 shadow-sm min-h-[40px] ${
              hasShortage
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95'
            }`}
          >
            <span>Execute Bake & Deduct</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
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
