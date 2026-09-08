import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { X, Layers, Plus, CheckCircle2 } from 'lucide-react';
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
    () => `LOT-${product.category.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="glass-modal rounded-3xl shadow-elevated max-w-2xl w-full max-h-[85vh] sm:max-h-[90vh] flex flex-col border border-slate-200/90 dark:border-slate-800 relative animate-scale-in overflow-hidden">
        {/* Pinned Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold border border-amber-200/60 dark:border-amber-800/50 shadow-2xs">
              <Layers className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  FIFO Lots & Batch Traceability
                </h2>
                {product.is_perishable && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 uppercase tracking-wider">
                    Perishable
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {product.name} • Total Active Stock:{' '}
                <strong className="text-slate-800 dark:text-slate-200 font-mono">
                  {totalLotStock} {product.unit}
                </strong>
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
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Active Batches ({lots.filter((l) => l.quantity > 0).length})
            </span>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setShowAddForm(!showAddForm);
              }}
              className="px-3.5 py-2 bg-slate-900 dark:bg-amber-600 hover:bg-slate-800 dark:hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-2xs min-h-[40px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Cancel New Lot' : 'Register New Batch Lot'}</span>
            </button>
          </div>

          {/* Add Form Accordion */}
          {showAddForm && (
            <form
              onSubmit={handleAddLot}
              className="p-4 bg-slate-50/90 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-3 animate-fade-in"
            >
              <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">Register Incoming Batch Lot</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Lot / Batch Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLotNumber}
                    onChange={(e) => setNewLotNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Received Quantity ({product.unit}) *
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Expiration Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newExpiryDate}
                    onChange={(e) => setNewExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Notes / Origin</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Millers Gold shipment, invoice #7712"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition text-xs shadow-xs min-h-[40px]"
                >
                  Confirm Batch Entry
                </button>
              </div>
            </form>
          )}

          {/* Batches Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2.5 px-3">Lot Code</th>
                  <th className="py-2.5 px-3">Available / Initial</th>
                  <th className="py-2.5 px-3">Received</th>
                  <th className="py-2.5 px-3">Expiration Date</th>
                  <th className="py-2.5 px-3 text-right">FIFO Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {lots.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No tracked batch lots found for this product.
                    </td>
                  </tr>
                ) : (
                  [...lots]
                    .sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime())
                    .map((lot) => {
                      const exp = new Date(lot.expiry_date);
                      exp.setHours(0, 0, 0, 0);
                      const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      const isDepleted = lot.quantity <= 0;
                      const isUrgent = !isDepleted && diffDays <= 2;
                      const isWarning = !isDepleted && diffDays > 2 && diffDays <= 5;

                      return (
                        <tr
                          key={lot.id}
                          className={`transition ${
                            isDepleted
                              ? 'opacity-45 bg-slate-50/50 dark:bg-slate-900/30'
                              : isUrgent
                              ? 'bg-rose-50/40 dark:bg-rose-950/20'
                              : isWarning
                              ? 'bg-amber-50/30 dark:bg-amber-950/20'
                              : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                            <span>{lot.lot_number}</span>
                            {lot.notes && (
                              <span className="block text-[10px] text-slate-400 font-sans font-normal truncate max-w-[150px]">
                                {lot.notes}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                            {lot.quantity} / {lot.initial_quantity} {product.unit}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                            {lot.received_date}
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            <span className="text-slate-800 dark:text-slate-200 font-bold block">{lot.expiry_date}</span>
                            {!isDepleted && (
                              <span
                                className={`block text-[10px] font-extrabold mt-0.5 ${
                                  isUrgent
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : isWarning
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-emerald-600 dark:text-emerald-400'
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
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <span
                              className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-extrabold border whitespace-nowrap shrink-0 leading-none ${
                                isDepleted
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                                  : isUrgent
                                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/90 dark:border-rose-800'
                                  : isWarning
                                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/90 dark:border-amber-800'
                                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/90 dark:border-emerald-800'
                              }`}
                            >
                              {isDepleted ? 'Depleted' : isUrgent ? 'Expiring Soon' : isWarning ? 'Use Soon' : 'Healthy Shelf'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pinned Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>FIFO Guarantee: Kitchen bakes strictly deduct from earliest expiring batch first.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 dark:bg-amber-600 hover:bg-slate-800 dark:hover:bg-amber-500 text-white font-bold rounded-xl transition text-xs min-h-[40px] shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
