import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Recipe, Product } from '../../types';
import {
  ChefHat,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Trash2,
  Scale,
  DollarSign,
  TrendingUp,
  PackageCheck,
  ShieldAlert,
} from 'lucide-react';
import { formatCurrencyINR } from '../../services/reorderEngine';
import { BakeBatchModal } from './BakeBatchModal';
import { LogWasteModal } from './LogWasteModal';

export const ProductionPage: React.FC = () => {
  const { recipes, products, wasteLogs } = useApp();
  const { currentUser } = useAuth();

  const [selectedRecipeForBake, setSelectedRecipeForBake] = useState<Recipe | null>(null);
  const [isWasteModalOpen, setIsWasteModalOpen] = useState(false);
  const [wastePreselectedProduct, setWastePreselectedProduct] = useState<Product | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const canViewFinancials = currentUser?.role === 'owner' || currentUser?.role === 'purchasing';

  const categories = useMemo(() => {
    return Array.from(new Set(recipes.map((r) => r.category)));
  }, [recipes]);

  // Feasibility calculation for each recipe
  const recipeFeasibility = useMemo(() => {
    return recipes.map((recipe) => {
      let maxBatches = Infinity;
      const shortagesForOneBatch: { name: string; deficit: number; unit: string }[] = [];
      let totalIngredientCost = 0;

      for (const ing of recipe.ingredients) {
        const prod = products.find((p) => p.id === ing.product_id);
        const available = prod ? prod.current_stock : 0;
        const possibleForIng = Math.floor(available / ing.quantity);
        if (possibleForIng < maxBatches) {
          maxBatches = possibleForIng;
        }

        if (available < ing.quantity) {
          shortagesForOneBatch.push({
            name: prod?.name || ing.product_id,
            deficit: parseFloat((ing.quantity - available).toFixed(2)),
            unit: ing.unit,
          });
        }

        if (prod) {
          totalIngredientCost += ing.quantity * prod.cost_price;
        }
      }

      if (maxBatches === Infinity) maxBatches = 0;

      const totalBatchRevenue = recipe.yield_quantity * recipe.selling_price;
      const batchMargin = totalBatchRevenue > 0
        ? Math.round(((totalBatchRevenue - totalIngredientCost) / totalBatchRevenue) * 100)
        : 0;

      return {
        recipe,
        maxBatches,
        isReady: maxBatches >= 1,
        shortagesForOneBatch,
        totalIngredientCost: Math.round(totalIngredientCost),
        batchMargin,
      };
    });
  }, [recipes, products]);

  const filteredFeasibility = useMemo(() => {
    if (selectedCategory === 'all') return recipeFeasibility;
    return recipeFeasibility.filter((rf) => rf.recipe.category === selectedCategory);
  }, [recipeFeasibility, selectedCategory]);

  const totalReadyToBake = recipeFeasibility.filter((r) => r.isReady).length;
  const totalWasteLoss = useMemo(() => {
    return wasteLogs.reduce((sum, log) => sum + log.estimated_cost, 0);
  }, [wasteLogs]);

  const handleOpenWaste = (prod?: Product) => {
    setWastePreselectedProduct(prod);
    setIsWasteModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Bakery Production & Recipe BOM Engine
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Bill of Materials feasibility, live stock reconciliation, and kitchen shrinkage logging
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenWaste()}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Log Kitchen Waste</span>
          </button>
        </div>
      </div>

      {/* Production KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="glass-card p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Catalog Recipes</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">{recipes.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Standard bakery formulas</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Ready to Bake</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-700">
            {totalReadyToBake} / {recipes.length}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">100% ingredient stock on-hand</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Shrinkage Logged</span>
            <Trash2 className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">{wasteLogs.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {canViewFinancials ? `₹${totalWasteLoss.toLocaleString('en-IN')} cumulative loss` : 'Tracked waste events'}
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">BOM Reconciliation</span>
            <PackageCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-base font-black text-slate-900 mt-1">Active Engine</div>
          <div className="text-[11px] text-slate-500 mt-1">Feeds directly to 30-day forecast</div>
        </div>
      </div>

      {/* Recipe Catalog Grid */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Bakery Bill of Materials (BOM) Catalog
          </h2>
          <span className="text-xs text-slate-500">
            Click "Bake Batch" to scale ingredients and execute deduction
          </span>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-1 mb-4">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            All Formulas ({recipes.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFeasibility.map(({ recipe, maxBatches, isReady, shortagesForOneBatch, totalIngredientCost, batchMargin }) => (
            <div
              key={recipe.id}
              className={`glass-card rounded-2xl border border-slate-200/90 p-5 flex flex-col justify-between shadow-2xs card-hover ${
                isReady ? 'border-l-4 border-l-emerald-600' : 'border-l-4 border-l-rose-600'
              }`}
            >
              <div>
                {/* Top Row: Title & Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-black text-slate-900 tracking-tight">{recipe.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {recipe.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{recipe.description}</p>
                  </div>

                  {/* Feasibility Badge */}
                  {isReady ? (
                    <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Ready ({maxBatches}x)
                    </span>
                  ) : (
                    <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                      Missing Stock
                    </span>
                  )}
                </div>

                {/* Specs bar */}
                <div className="flex items-center space-x-4 text-xs text-slate-600 py-2 border-y border-slate-100 my-3">
                  <div className="flex items-center space-x-1">
                    <Scale className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Yield: <strong className="text-slate-900 font-mono">{recipe.yield_quantity}</strong> {recipe.yield_unit}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{recipe.prep_time_mins} mins</span>
                  </div>
                  {/* Financials: Hidden for Floor Staff */}
                  {canViewFinancials && (
                    <>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                        <span>BOM Cost: <strong className="text-slate-900 font-mono">{formatCurrencyINR(totalIngredientCost)}</strong></span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">{batchMargin}% margin</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Ingredients List */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Required per batch
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {recipe.ingredients.map((ing, idx) => {
                      const prod = products.find((p) => p.id === ing.product_id);
                      const isAvailable = prod && prod.current_stock >= ing.quantity;
                      return (
                        <span
                          key={idx}
                          className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-mono ${
                            isAvailable
                              ? 'bg-slate-100 text-slate-800 border border-slate-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200 font-bold'
                          }`}
                        >
                          {prod?.name || ing.product_id}: {ing.quantity} {ing.unit}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Shortage notice if blocked */}
                {!isReady && shortagesForOneBatch.length > 0 && (
                  <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200/70 text-[11px] text-rose-800 space-y-0.5 mb-3">
                    <strong className="block font-bold">Shortfall for 1 batch:</strong>
                    {shortagesForOneBatch.map((s, idx) => (
                      <div key={idx} className="font-mono">
                        • {s.name}: Missing {s.deficit} {s.unit}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Card Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {isReady ? `Up to ${maxBatches} batches bakeable` : 'Replenish stock to enable'}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedRecipeForBake(recipe)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Bake Batch</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Kitchen Waste & Shrinkage Log Table */}
      <div className="glass-card rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <span>Perishable Expiry & Kitchen Waste Log</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Itemized shrinkage, over-proofing, and expiry write-offs with identity attribution
            </p>
          </div>
          <button
            onClick={() => handleOpenWaste()}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl transition cursor-pointer self-start sm:self-auto shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Record Shrinkage</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                {canViewFinancials && <th className="py-3 px-4 text-right">Estimated Loss</th>}
                <th className="py-3 px-4">Logged By</th>
                <th className="py-3 px-4 text-right">Logged Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {wasteLogs.slice(0, 10).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{log.product_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">ID: {log.product_id}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                      {log.reason}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {log.quantity} {log.unit}
                  </td>
                  {canViewFinancials && (
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-700">
                      {formatCurrencyINR(log.estimated_cost)}
                    </td>
                  )}
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{log.logged_by}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{log.logged_by_role}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-500">
                    {log.logged_at}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bake Batch Modal */}
      {selectedRecipeForBake && (
        <BakeBatchModal
          recipe={selectedRecipeForBake}
          onClose={() => setSelectedRecipeForBake(null)}
        />
      )}

      {/* Log Waste Modal */}
      {isWasteModalOpen && (
        <LogWasteModal
          preselectedProduct={wastePreselectedProduct}
          onClose={() => {
            setIsWasteModalOpen(false);
            setWastePreselectedProduct(undefined);
          }}
        />
      )}
    </div>
  );
};
