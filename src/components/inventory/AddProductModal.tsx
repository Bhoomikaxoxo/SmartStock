import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UnitType } from '../../types';
import { X, Plus, PackagePlus, CheckCircle2 } from 'lucide-react';

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

  const numCost = Number(costPrice) || 0;
  const numSell = Number(sellingPrice) || 0;
  const marginPct = numCost > 0 ? Math.round(((numSell - numCost) / numCost) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || costPrice === '' || sellingPrice === '' || currentStock === '' || minimumRequired === '') {
      alert('Please complete all mandatory fields.');
      return;
    }

    addProduct({
      name,
      category,
      unit,
      cost_price: Number(costPrice),
      selling_price: Number(sellingPrice),
      current_stock: Number(currentStock),
      minimum_required: Number(minimumRequired),
      supplier_id: supplierId,
      expiry_date: expiryDate || undefined,
      description,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="glass-modal rounded-3xl shadow-elevated max-w-lg w-full p-6 sm:p-7 border border-slate-200/90 relative max-h-[92vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold border border-amber-200/60 shadow-2xs">
              <PackagePlus className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Add Inventory Product
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Set baseline replenishment buffers and wholesale costs
              </p>
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
          {/* Product Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Product / Ingredient Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sourdough Starter, Cocoa Butter, Rye Flour"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 font-medium"
            />
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 bg-white font-medium"
              >
                <option value="Flour & Grains">Flour & Grains</option>
                <option value="Dairy & Eggs">Dairy & Eggs</option>
                <option value="Sweeteners">Sweeteners</option>
                <option value="Yeast & Leaveners">Yeast & Leaveners</option>
                <option value="Fats & Oils">Fats & Oils</option>
                <option value="Dry Staples">Dry Staples</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Measurement Unit *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitType)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 bg-white font-medium"
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Wholesale Cost (INR) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 font-mono tabular-nums font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Retail Selling Price (INR) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 font-mono tabular-nums font-bold"
              />
            </div>
          </div>

          {/* Margin Indicator Pill */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">Calculated Gross Markup:</span>
            <span className={`font-mono font-bold ${marginPct >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {marginPct >= 0 ? `+${marginPct}% margin` : `${marginPct}% loss`}
            </span>
          </div>

          {/* Stock Counts */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Opening On-Hand Stock *
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                required
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 font-mono tabular-nums font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Minimum Safety Buffer *
              </label>
              <input
                type="number"
                min="1"
                step="0.1"
                required
                value={minimumRequired}
                onChange={(e) => setMinimumRequired(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 font-mono tabular-nums font-bold"
              />
            </div>
          </div>

          {/* Supplier & Expiry */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Primary Supplier *</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 bg-white font-medium"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.lead_time_days}d lead)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 bg-white font-medium"
              >
              </input>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Storage Location & Preparation Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Dry Pantry A, requires refrigeration after opening"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 font-medium"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
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
              <CheckCircle2 className="w-4 h-4" />
              <span>Create Product</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
