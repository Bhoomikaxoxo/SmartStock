import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UnitType } from '../../types';
import { X, PackagePlus, CheckCircle2, AlertCircle } from 'lucide-react';

interface AddProductModalProps {
  onClose: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ onClose }) => {
  const { addProduct, suppliers } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Flour & Grains');
  const [unit, setUnit] = useState<UnitType>('kg');
  const [costPrice, setCostPrice] = useState<number | ''>(50);
  const [sellingPrice, setSellingPrice] = useState<number | ''>(75);
  const [currentStock, setCurrentStock] = useState<number | ''>(20);
  const [minimumRequired, setMinimumRequired] = useState<number | ''>(15);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [expiryDate, setExpiryDate] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const numCost = Number(costPrice) || 0;
  const numSell = Number(sellingPrice) || 0;
  const marginPct = numCost > 0 ? Math.round(((numSell - numCost) / numCost) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Product name is required.';
    }
    if (costPrice === '' || Number(costPrice) < 0) {
      newErrors.costPrice = 'Valid wholesale cost is required (≥ ₹0).';
    }
    if (sellingPrice === '' || Number(sellingPrice) < 0) {
      newErrors.sellingPrice = 'Valid retail selling price is required (≥ ₹0).';
    }
    if (currentStock === '' || Number(currentStock) < 0) {
      newErrors.currentStock = 'Initial stock cannot be negative.';
    }
    if (minimumRequired === '' || Number(minimumRequired) < 0) {
      newErrors.minimumRequired = 'Minimum buffer cannot be negative.';
    }
    if (!supplierId) {
      newErrors.supplierId = 'Please select a supplier.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addProduct({
      name: name.trim(),
      category,
      unit,
      cost_price: Number(costPrice),
      selling_price: Number(sellingPrice),
      current_stock: Number(currentStock),
      minimum_required: Number(minimumRequired),
      supplier_id: supplierId,
      expiry_date: expiryDate || undefined,
      description: description.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="glass-modal rounded-3xl shadow-elevated max-w-lg w-full max-h-[85vh] sm:max-h-[90vh] flex flex-col border border-slate-200/90 dark:border-slate-800 relative animate-scale-in overflow-hidden">
        {/* Pinned Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold border border-amber-200/60 dark:border-amber-800/50 shadow-2xs">
              <PackagePlus className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Add Inventory Product
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Set baseline replenishment buffers and wholesale costs
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
        <form id="add-product-form" onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Product Name */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Product / Ingredient Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sourdough Starter, Cocoa Butter, Rye Flour"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border ${
                errors.name
                  ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
              } focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100 font-medium`}
            />
            {errors.name && (
              <p className="text-rose-600 dark:text-rose-400 text-[11px] font-semibold mt-1 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 font-medium"
              >
                <option value="Flour & Grains">Flour & Grains</option>
                <option value="Dairy & Eggs">Dairy & Eggs</option>
                <option value="Fats & Oils">Fats & Oils</option>
                <option value="Sugars & Sweeteners">Sugars & Sweeteners</option>
                <option value="Chocolate & Cocoa">Chocolate & Cocoa</option>
                <option value="Nuts & Seeds">Nuts & Seeds</option>
                <option value="Fruit & Purees">Fruit & Purees</option>
                <option value="Packaging & Consumables">Packaging & Consumables</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Measurement Unit *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitType)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 font-medium"
              >
                <option value="kg">kg (Kilograms)</option>
                <option value="g">g (Grams)</option>
                <option value="liters">liters (Liters)</option>
                <option value="trays">trays (Trays)</option>
                <option value="boxes">boxes (Boxes)</option>
                <option value="units">units (Units / Count)</option>
              </select>
            </div>
          </div>

          {/* Pricing Row with Margin Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Wholesale Cost (INR) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={costPrice}
                onChange={(e) => {
                  setCostPrice(e.target.value === '' ? '' : Number(e.target.value));
                  if (errors.costPrice) setErrors((prev) => ({ ...prev, costPrice: '' }));
                }}
                className={`w-full px-3 py-2.5 rounded-xl border ${
                  errors.costPrice
                    ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                } focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100 font-mono tabular-nums font-bold`}
              />
              {errors.costPrice && (
                <p className="text-rose-600 dark:text-rose-400 text-[11px] font-semibold mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.costPrice}</span>
                </p>
              )}
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Retail Selling Price (INR) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={sellingPrice}
                onChange={(e) => {
                  setSellingPrice(e.target.value === '' ? '' : Number(e.target.value));
                  if (errors.sellingPrice) setErrors((prev) => ({ ...prev, sellingPrice: '' }));
                }}
                className={`w-full px-3 py-2.5 rounded-xl border ${
                  errors.sellingPrice
                    ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                } focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100 font-mono tabular-nums font-bold`}
              />
              {errors.sellingPrice && (
                <p className="text-rose-600 dark:text-rose-400 text-[11px] font-semibold mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.sellingPrice}</span>
                </p>
              )}
            </div>
          </div>

          {/* Margin Indicator Pill */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500 dark:text-slate-400">Gross Margin Estimate:</span>
            <span
              className={`font-mono font-bold ${
                marginPct >= 35
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : marginPct > 0
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-rose-700 dark:text-rose-400'
              }`}
            >
              {marginPct}% markup
            </span>
          </div>

          {/* Stock Levels & Buffer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Current Initial Stock *
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                required
                value={currentStock}
                onChange={(e) => {
                  setCurrentStock(e.target.value === '' ? '' : Number(e.target.value));
                  if (errors.currentStock) setErrors((prev) => ({ ...prev, currentStock: '' }));
                }}
                className={`w-full px-3 py-2.5 rounded-xl border ${
                  errors.currentStock
                    ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                } focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100 font-mono tabular-nums font-bold`}
              />
              {errors.currentStock && (
                <p className="text-rose-600 dark:text-rose-400 text-[11px] font-semibold mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.currentStock}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Minimum Buffer Threshold *
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                required
                value={minimumRequired}
                onChange={(e) => {
                  setMinimumRequired(e.target.value === '' ? '' : Number(e.target.value));
                  if (errors.minimumRequired) setErrors((prev) => ({ ...prev, minimumRequired: '' }));
                }}
                className={`w-full px-3 py-2.5 rounded-xl border ${
                  errors.minimumRequired
                    ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                } focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100 font-mono tabular-nums font-bold`}
              />
              {errors.minimumRequired && (
                <p className="text-rose-600 dark:text-rose-400 text-[11px] font-semibold mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.minimumRequired}</span>
                </p>
              )}
            </div>
          </div>

          {/* Supplier & Expiry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Primary Supplier *</label>
              <select
                value={supplierId}
                onChange={(e) => {
                  setSupplierId(e.target.value);
                  if (errors.supplierId) setErrors((prev) => ({ ...prev, supplierId: '' }));
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 font-medium"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.lead_time_days}d lead)
                  </option>
                ))}
              </select>
              {errors.supplierId && (
                <p className="text-rose-600 dark:text-rose-400 text-[11px] font-semibold mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.supplierId}</span>
                </p>
              )}
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Storage Location & Preparation Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Dry Pantry A, requires refrigeration after opening"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 font-medium"
            />
          </div>
        </form>

        {/* Pinned Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold rounded-xl transition cursor-pointer text-xs min-h-[40px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-product-form"
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition cursor-pointer flex items-center space-x-1.5 text-xs shadow-sm active:scale-95 min-h-[40px]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Create Product</span>
          </button>
        </div>
      </div>
    </div>
  );
};
