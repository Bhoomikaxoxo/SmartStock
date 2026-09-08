import React from 'react';
import { PurchaseOrder } from '../../types';
import { X, Printer, ShieldCheck, QrCode } from 'lucide-react';
import { formatCurrencyINR } from '../../services/reorderEngine';

interface PrintablePOModalProps {
  po: PurchaseOrder;
  onClose: () => void;
}

export const PrintablePOModal: React.FC<PrintablePOModalProps> = ({ po, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto animate-fade-in print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl shadow-elevated max-w-2xl w-full border border-slate-200 overflow-hidden relative animate-scale-in my-8 print:shadow-none print:border-none print:my-0 print:max-w-none print:w-full">
        {/* Top Control Bar (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-900 text-white font-mono">
              PO VOUCHER
            </span>
            <span className="text-xs text-slate-500 font-medium font-mono">{po.po_number}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Voucher</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-10 space-y-6 text-slate-900 bg-white" id="printable-po-voucher">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-xs">
                  SS
                </div>
                <h1 className="text-xl font-black tracking-tight text-slate-900">
                  SMARTSTOCK BAKERY OPERATIONS
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Artisan Viennoiserie & Kitchen Supply Network
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                44/2 Commercial Guild Way, Bengaluru, Karnataka 560001 • GSTIN: 29AAAAA0000A1Z5
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Purchase Order</div>
              <div className="text-lg font-black font-mono text-slate-900 mt-0.5">{po.po_number}</div>
              <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 mr-1" />
                OFFICIALLY AUTHORIZED
              </div>
            </div>
          </div>

          {/* Dates & Supplier Meta */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1.5">
                Vendor / Supplier
              </div>
              <div className="text-sm font-bold text-slate-900">{po.supplier_name}</div>
              <div className="text-slate-600 mt-1 space-y-0.5">
                <div>Supplier ID: <span className="font-mono text-slate-800">{po.supplier_id}</span></div>
                <div>Terms: <span className="font-medium text-slate-800">Net 15 Days</span></div>
                <div>Status: <span className="font-medium text-slate-800">Direct Contract Fulfillment</span></div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1.5">
                Order Logistics
              </div>
              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Issued Date:</span>
                  <span className="font-mono font-bold text-slate-800">{po.order_date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Expected:</span>
                  <span className="font-mono font-bold text-slate-800">{po.expected_delivery_date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Authorized By:</span>
                  <span className="font-medium text-slate-800">{po.issued_by || 'Operations Lead'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Item & Description</th>
                  <th className="py-3 px-4 text-right">Unit Rate</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 text-center font-mono text-slate-400">01</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{po.product_name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">SKU: {po.product_id}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">
                    {formatCurrencyINR(po.unit_cost)} / {po.unit}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {po.quantity} {po.unit}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900">
                    {formatCurrencyINR(po.total_cost)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals & Notes */}
          <div className="grid grid-cols-2 gap-6 pt-2">
            <div className="text-xs space-y-2">
              <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                Special Receiving Instructions
              </div>
              <p className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-slate-600 italic">
                "{po.notes || 'Deliver to loading bay before 06:00 AM. Inspect temperature seal upon delivery.'}"
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrencyINR(po.total_cost)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (0% Essential Foodstuff):</span>
                <span className="font-mono text-slate-600">₹0</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Payable:</span>
                <span className="font-mono text-base text-slate-900">{formatCurrencyINR(po.total_cost)}</span>
              </div>
            </div>
          </div>

          {/* Verification & Signature Section */}
          <div className="pt-6 border-t-2 border-slate-100 flex items-end justify-between text-xs">
            {/* QR Code Verification Block */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                <QrCode className="w-14 h-14 text-slate-800 stroke-[1.5]" />
              </div>
              <div className="space-y-0.5 text-[10px] text-slate-500">
                <div className="font-bold text-slate-700">Digital Audit Verification</div>
                <div className="font-mono">ID: {po.id.toUpperCase()}</div>
                <div>Scan with receiving terminal to verify PO authenticity</div>
              </div>
            </div>

            {/* Signature authorization */}
            <div className="w-52 text-center">
              <div className="border-b border-slate-400 pb-1 mb-1 font-serif italic text-slate-600 text-sm">
                Bhoomika K.
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Authorized Signatory
              </div>
              <div className="text-[9px] text-slate-400">Head of Bakery Purchasing</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
