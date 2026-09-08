import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, PurchaseOrder } from '../../types';
import {
  X,
  ScanBarcode,
  PackageCheck,
  CheckCircle2,
  FileCheck2,
  ArrowRight,
  Search,
  Building2,
  Plus,
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
    receiveStock(scannedProduct.id, qty, poId);
    setScannedProduct(null);
    setManualInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 overflow-y-auto animate-fade-in">
      <div className="glass-modal rounded-3xl shadow-elevated max-w-lg w-full p-6 sm:p-7 border border-slate-200/90 relative animate-scale-in my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-2xs">
              <ScanBarcode className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Barcode Receiving Terminal
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Simulated dockside scanning & 1-click PO stock intake
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

        <div className="mt-5 space-y-5 text-xs">
          {/* Mock Scanner Viewport / Status */}
          <div className="relative p-6 rounded-2xl bg-slate-950 text-slate-100 border border-slate-800 text-center overflow-hidden shadow-inner">
            {/* Ambient optical laser sweep */}
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
            <div className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-2">
              Incoming Bakery Goods (Tap to simulate scan)
            </div>
            <div className="grid grid-cols-2 gap-2">
              {products.slice(0, 6).map((p) => {
                const hasPO = purchaseOrders.some((po) => po.product_id === p.id && po.status === 'Sent');
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleScanCode(p.barcode || p.id)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50/80 text-left transition flex items-center justify-between group cursor-pointer shadow-2xs"
                  >
                    <div className="truncate mr-2">
                      <div className="font-bold text-slate-900 truncate">{p.name}</div>
                      <div className="font-mono text-[10px] text-slate-500">{p.barcode}</div>
                    </div>
                    {hasPO ? (
                      <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        PO OPEN
                      </span>
                    ) : (
                      <span className="shrink-0 font-mono text-[10px] text-slate-400">
                        {p.current_stock} {p.unit}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manual Barcode Input */}
          <form onSubmit={handleManualSubmit} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Scan or enter barcode (e.g. BAR-FLOUR-101)..."
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition shadow-2xs cursor-pointer"
            >
              Lookup
            </button>
          </form>

          {/* Scanned Product Resolution Card */}
          {scannedProduct && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-scale-in">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider flex items-center mb-0.5">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Product Recognized
                  </span>
                  <div className="text-sm font-black text-slate-900">{scannedProduct.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    SKU: {scannedProduct.id} • Barcode: {scannedProduct.barcode}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Current On-Hand</span>
                  <span className="text-base font-black font-mono text-slate-900">
                    {scannedProduct.current_stock} {scannedProduct.unit}
                  </span>
                </div>
              </div>

              {/* Matching Open PO Banner */}
              {matchingOpenPO ? (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center text-xs">
                      <FileCheck2 className="w-3.5 h-3.5 mr-1 text-amber-700" />
                      Matching Open Order: {matchingOpenPO.po_number}
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-800">
                      Ordered: {matchingOpenPO.quantity} {matchingOpenPO.unit}
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-700 flex items-center space-x-1">
                    <Building2 className="w-3 h-3" />
                    <span>Vendor: {matchingOpenPO.supplier_name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleReceiveStock(matchingOpenPO.quantity, matchingOpenPO.id)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition text-xs flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer active:scale-95"
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>Receive PO Quantity ({matchingOpenPO.quantity} {matchingOpenPO.unit})</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-600 font-medium">Quantity ({scannedProduct.unit}):</span>
                    <input
                      type="number"
                      min="1"
                      value={receiveQuantity}
                      onChange={(e) => setReceiveQuantity(parseFloat(e.target.value) || 1)}
                      className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg font-mono font-bold text-xs text-center"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleReceiveStock(receiveQuantity)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition text-xs flex items-center space-x-1 shadow-2xs cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Accept Stock</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Modal Close Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold rounded-xl transition cursor-pointer text-xs"
            >
              Done Receiving
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
