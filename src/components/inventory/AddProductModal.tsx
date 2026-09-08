import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UnitType } from '../../types';
import { X, Plus, PackagePlus } from 'lucide-react';

interface AddProductModalProps {
  onClose: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ onClose }) => {
  const { addProduct, suppliers } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Dry Staples');
  const [unit, setUnit] = useState<UnitType>('kg');
  const [costPrice, setCostPrice] = useState<number | ''>(50);
  const [sellingPrice, setSellingPrice] = useState<number | ''>(75);
  const [currentStock, setCurrentStock] = useState<number | ''>(20);
  const [minimumRequired, setMinimumRequired] = useState<number | ''>(15);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [expiryDate, setExpiryDate] = useState('');
  const [description, setDescription] = useState('');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <PackagePlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Add New Inventory Product</h2>
              <p className="text-xs text-slate-500">Track stock levels and automated replenishment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Product Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Product / Ingredient Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sourdough Starter, Cocoa Butter"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
            />
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 bg-white"
              >
                <option value="Dry Staples">Dry Staples</option>
                <option value="Dairy">Dairy</option>
                <option value="Poultry & Dairy">Poultry & Dairy</option>
                <option value="Baking Essentials">Baking Essentials</option>
                <option value="Flavors & Extracts">Flavors & Extracts</option>
                <option value="Packaging">Packaging</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Stock Unit *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 bg-white"
              >
                <option value="kg">kg (Kilograms)</option>
                <option value="pieces">pieces (Units)</option>
                <option value="liters">liters (Liters)</option>
                <option value="bottles">bottles</option>
                <option value="tins">tins</option>
                <option value="packs">packs</option>
              </select>
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Cost Price (₹ per {unit}) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Selling Price (₹ per {unit}) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
              />
            </div>
          </div>

          {/* Initial Stock & Minimum Required */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Initial Stock Count ({unit}) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Minimum Required Buffer ({unit}) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={minimumRequired}
                onChange={(e) => setMinimumRequired(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
              />
            </div>
          </div>

          {/* Supplier & Expiry */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Supplier *</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 bg-white"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.lead_time_days}d lead)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes / Description</label>
            <textarea
              rows={2}
              placeholder="e.g. For artisanal sourdough baguettes only"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition shadow-xs flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Save Product</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
