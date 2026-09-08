import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, StockLot } from '../../types';
import { X, Layers, Plus, Calendar, Clock, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface ProductLotsModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductLotsModal: React.FC<ProductLotsModalProps> = ({ product, onClose }) => {
  const { getLotsForProduct, addStockLot } = useApp();
  const lots = getLotsForProduct(product.id);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuantity, setNewQuantity] = useState<number>(10);
  const [newLotNumber, setNewLotNumber] = useState<string>(
    `LOT-${product.category.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`
  );

  // Compute default expiry based on shelf-life
  const defaultExpiryDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + (product.shelf_life_days || 14));
    return d.toISOString().split('T')[0];
  };

  const [newExpiryDate, setNewExpiryDate] = useState<string>(defaultExpiryDate());
  const [newNotes, setNewNotes] = useState<string>('Standard supplier delivery');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleAddLot = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuantity <= 0 || !newLotNumber.trim() || !newExpiryDate) return;

    sounds.playSuccessChime();
    addStockLot({
      product_id: product.id,
      lot_number: newLotNumber.trim(),
      quantity: newQuantity,
      initial_quantity: newQuantity,
      received_date: new Date().toISOString().split('T')[0],
      expiry_date: newExpiryDate,
      notes: newNotes.trim(),
    });

    setShowAddForm(false);
    setNewLotNumber(
      `LOT-${product.category.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`
    );
  };

  const totalLotStock = lots
    .filter((l) => l.quantity > 0)
    .reduce((sum, l) => sum + l.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 overflow-y-auto animate-fade-in">
      <div className="glass-modal rounded-3xl shadow-elevated max-w-2xl w-full p-6 sm:p-7 border border-slate-200/90 relative animate-scale-in my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold border border-amber-200/60 shadow-2xs">
              <Layers className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  FIFO Lots & Batch Traceability
                </h2>
                {product.is_perishable && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
                    Perishable
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {product.name} • Total Active Stock:{' '}
                <strong className="text-slate-800 font-mono">
                  {totalLotStock} {product.unit}
                </strong>
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

        <div className="mt-5 space-y-4 text-xs">
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700">
              Active Batches ({lots.filter((l) => l.quantity > 0).length})
            </span>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setShowAddForm(!showAddForm);
              }}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Cancel New Lot' : 'Register Incoming Lot'}</span>
            </button>
          </div>

          {/* New Lot Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddLot}
              className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-3 animate-scale-in"
            >
              <h3 className="font-bold text-slate-900 text-xs">Register Incoming Ingredient Batch</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-500 text-[11px] mb-1">
                    Lot / Batch Number
                  </label>
                  <input
                    type="text"
                    required
                    value={newLotNumber}
                    onChange={(e) => setNewLotNumber(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 text-[11px] mb-1">
                    Quantity ({product.unit})
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 text-[11px] mb-1">
                    Use-By / Expiry Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newExpiryDate}
                    onChange={(e) => setNewExpiryDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <input
                  type="text"
                  placeholder="Lot inspection notes (optional)..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="flex-1 max-w-sm px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 mr-2"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Save Batch
                </button>
              </div>
            </form>
          )}

          {/* Lots Table */}
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Lot Number</th>
                  <th className="py-2.5 px-3">Remaining Balance</th>
                  <th className="py-2.5 px-3">Received</th>
                  <th className="py-2.5 px-3">Expiry Date</th>
                  <th className="py-2.5 px-3 text-right">FIFO Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {lots.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">
                      No batch lots recorded for this product yet.
                    </td>
                  </tr>
                ) : (
                  lots
                    .sort((a, b) => a.expiry_date.localeCompare(b.expiry_date))
                    .map((lot, idx) => {
                      const exp = new Date(lot.expiry_date);
                      exp.setHours(0, 0, 0, 0);
                      const diffDays = Math.ceil(
                        (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                      );
                      const isDepleted = lot.quantity <= 0;
                      const isUrgent = !isDepleted && diffDays <= 2;
                      const isWarning = !isDepleted && diffDays > 2 && diffDays <= 7;

                      return (
                        <tr
                          key={lot.id}
                          className={`hover:bg-slate-50/60 transition ${
                            isDepleted
                              ? 'opacity-40 bg-slate-50/30'
                              : idx === 0
                              ? 'bg-amber-50/30 font-medium'
                              : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                            <div className="flex items-center space-x-1.5">
                              <span>{lot.lot_number}</span>
                              {idx === 0 && !isDepleted && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 uppercase font-black">
                                  Next to Consume
                                </span>
                              )}
                            </div>
                            {lot.notes && (
                              <p className="text-[10px] text-slate-400 font-sans font-normal mt-0.5">
                                {lot.notes}
                              </p>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            <span className="font-extrabold text-slate-800">
                              {lot.quantity} {product.unit}
                            </span>
                            <span className="text-slate-400 text-[10px] block">
                              of {lot.initial_quantity} {product.unit} initial
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                            {lot.received_date}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px]">
                            <span
                              className={`font-semibold ${
                                isUrgent
                                  ? 'text-rose-700'
                                  : isWarning
                                  ? 'text-amber-700'
                                  : 'text-slate-700'
                              }`}
                            >
                              {lot.expiry_date}
                            </span>
                            {!isDepleted && (
                              <span
                                className={`block text-[10px] font-extrabold mt-0.5 ${
                                  isUrgent
                                    ? 'text-rose-600'
                                    : isWarning
                                    ? 'text-amber-600'
                                    : 'text-emerald-600'
                                }`}
                              >
                                {diffDays <= 0
                                  ? 'Expires today'
                                  : diffDays === 1
                                  ? 'Expires tomorrow'
                                  : `${diffDays} days remaining`}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                isDepleted
                                  ? 'bg-slate-100 text-slate-500 border-slate-200'
                                  : isUrgent
                                  ? 'bg-rose-50 text-rose-700 border-rose-200/90'
                                  : isWarning
                                  ? 'bg-amber-50 text-amber-700 border-amber-200/90'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200/90'
                              }`}
                            >
                              {isDepleted ? 'Depleted' : isUrgent ? 'Expiring Soon' : 'Healthy Shelf'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>FIFO Guarantee: Kitchen bakes strictly deduct from the earliest expiring batch first.</span>
            </span>
            <span className="font-mono text-slate-700 font-bold">Oldest Lot First</span>
          </div>
        </div>
      </div>
    </div>
  );
};
