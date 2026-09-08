import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import {
  X,
  ScanBarcode,
  PackageCheck,
  CheckCircle2,
  FileCheck2,
  Search,
  Building2,
  Plus,
  Layers,
} from 'lucide-react';
import { sounds } from '../../utils/audio';

interface BarcodeScannerModalProps {
  onClose: () => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({ onClose }) => {
  const { products, purchaseOrders, receiveStock } = useApp();
  const [manualInput, setManualInput] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [receiveQuantity, setReceiveQuantity] = useState<number>(10);
  const [lotNumber, setLotNumber] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [isScanningAnim, setIsScanningAnim] = useState(false);

  // Match open POs for the selected product
  const matchingOpenPO = scannedProduct
    ? purchaseOrders.find(
        (po) => po.product_id === scannedProduct.id && po.status === 'Sent'
      )
    : undefined;

  const handleScanCode = (code: string) => {
    setIsScanningAnim(true);
    sounds.playScanBeep();
    setTimeout(() => {
      setIsScanningAnim(false);
      const match = products.find(
        (p) => p.barcode?.toLowerCase() === code.trim().toLowerCase() || p.id.toLowerCase() === code.trim().toLowerCase()
      );
      if (match) {
        setScannedProduct(match);
        // Default receive quantity to open PO quantity if present, else 10
        const po = purchaseOrders.find((p) => p.product_id === match.id && p.status === 'Sent');
        setReceiveQuantity(po ? po.quantity : match.unit === 'pieces' ? 24 : 10);
        
        // Auto-generate realistic bakery lot and use-by date based on product shelf life
        const suggestedLot = `LOT-${match.id.toUpperCase().replace('PROD-', '')}-${Date.now().toString().slice(-4)}`;
        const days = match.shelf_life_days || 30;
        const suggestedExp = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];
        setLotNumber(suggestedLot);
        setExpiryDate(suggestedExp);
      }
    }, 250);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleScanCode(manualInput);
    }
  };

  const handleReceiveStock = (qty: number, poId?: string) => {
    if (!scannedProduct || qty <= 0) return;
    sounds.playSuccessChime();
    receiveStock(scannedProduct.id, qty, poId, lotNumber.trim() || undefined, expiryDate || undefined);
    setScannedProduct(null);
    setManualInput('');
    setLotNumber('');
    setExpiryDate('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="glass-modal rounded-3xl shadow-elevated max-w-lg w-full max-h-[85vh] sm:max-h-[90vh] flex flex-col border border-slate-200/90 dark:border-slate-800 relative animate-scale-in overflow-hidden">
        {/* Pinned Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-amber-600 text-white flex items-center justify-center font-bold shadow-2xs">
              <ScanBarcode className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Barcode Receiving Terminal
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Simulated dockside scanning & 1-click PO stock intake
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
          {/* Mock Scanner Viewport / Status */}
          <div className="relative p-6 rounded-2xl bg-slate-950 text-slate-100 border border-slate-800 text-center overflow-hidden shadow-inner">
            <div className="absolute inset-x-8 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-laser pointer-events-none" />
            {isScanningAnim && (
              <div className="absolute inset-x-0 h-1 bg-emerald-400 shadow-[0_0_16px_#34d399] animate-pulse top-1/2 -translate-y-1/2 pointer-events-none" />
            )}
            <div className="flex flex-col items-center justify-center py-2 relative z-10">
              <div className="relative p-3 rounded-2xl bg-slate-900/80 border border-slate-800/90 mb-2">
                <ScanBarcode className={`w-10 h-10 transition-transform duration-200 ${isScanningAnim ? 'text-emerald-400 scale-110' : 'text-slate-300'}`} />
              </div>
              <div className="font-mono text-xs font-bold tracking-wider text-slate-200 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
                <span>{isScanningAnim ? 'DECODING OPTICAL BARCODE...' : 'SCANNING HARDWARE ACTIVE'}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Tap any seeded incoming raw ingredient below or enter code manually
              </div>
            </div>
          </div>

          {/* Quick Mock Barcode Selector */}
          <div>
            <div className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2">
              Dockside Mock Scanners (Click to simulate scan)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {products.slice(0, 4).map((prod) => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => handleScanCode(prod.barcode || prod.id)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 text-left transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="truncate pr-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block truncate text-xs group-hover:text-amber-700 dark:group-hover:text-amber-400">
                      {prod.name}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                      {prod.barcode || prod.id}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 group-hover:text-amber-800 dark:group-hover:text-amber-300 shrink-0">
                    Scan
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input Fallback */}
          <form onSubmit={handleManualSubmit} className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Or manually type barcode / product ID..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 dark:bg-amber-600 hover:bg-slate-800 dark:hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition cursor-pointer min-h-[40px]"
            >
              Verify
            </button>
          </form>

          {/* Scanned Intake Resolution Card */}
          {scannedProduct && (
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3 animate-scale-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                    Identified: {scannedProduct.name}
                  </span>
                </div>
                <span className="font-mono text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 font-bold px-2 py-0.5 rounded-md">
                  {scannedProduct.barcode}
                </span>
              </div>

              {/* Linked Open PO Detection */}
              {matchingOpenPO ? (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-300 dark:border-emerald-800 flex items-start justify-between space-x-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5 text-emerald-800 dark:text-emerald-400 font-bold text-xs">
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Linked to Open PO #{matchingOpenPO.po_number}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Matches outstanding replenishment order. Receiving will mark this PO as Fulfilled and log full inventory value.
                    </p>
                  </div>
                  <span className="font-mono font-black text-slate-900 dark:text-slate-100 text-xs shrink-0">
                    {matchingOpenPO.quantity} {matchingOpenPO.unit}
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-2 text-slate-600 dark:text-slate-400 text-xs">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>No open PO found. Performing direct intake into on-hand buffer.</span>
                </div>
              )}

              {/* Lot Number & Expiry Date Capture Form */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                  <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Batch Lot & Expiry Registration</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">
                      Assigned Lot Number
                    </label>
                    <input
                      type="text"
                      value={lotNumber}
                      onChange={(e) => setLotNumber(e.target.value)}
                      placeholder="e.g. LOT-FLR-01"
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-amber-500"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  Lots will be indexed in FIFO order and consumed oldest-first during recipe batch production.
                </p>
              </div>

              {matchingOpenPO ? (
                <button
                  type="button"
                  onClick={() => handleReceiveStock(matchingOpenPO.quantity, matchingOpenPO.id)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition text-xs flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer active:scale-95 min-h-[40px]"
                >
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>Receive PO Quantity ({matchingOpenPO.quantity} {matchingOpenPO.unit}) into Lot</span>
                </button>
              ) : (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Quantity ({scannedProduct.unit}):</span>
                    <input
                      type="number"
                      min="1"
                      value={receiveQuantity}
                      onChange={(e) => setReceiveQuantity(parseFloat(e.target.value) || 1)}
                      className="w-20 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-bold text-xs text-center text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleReceiveStock(receiveQuantity)}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-900 dark:bg-amber-600 hover:bg-slate-800 dark:hover:bg-amber-500 text-white font-bold rounded-xl transition text-xs flex items-center justify-center space-x-1 shadow-2xs cursor-pointer active:scale-95 min-h-[40px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Accept Stock into Lot</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pinned Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl transition cursor-pointer text-xs min-h-[40px]"
          >
            Done Receiving
          </button>
        </div>
      </div>
    </div>
  );
};
