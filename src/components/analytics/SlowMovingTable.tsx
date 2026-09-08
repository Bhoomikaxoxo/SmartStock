import React from 'react';
import { Product, SalesRecord } from '../../types';
import { getSlowMovingProducts, formatCurrencyINR } from '../../services/reorderEngine';
import { AlertCircle, IndianRupee, Hourglass } from 'lucide-react';

interface SlowMovingTableProps {
  products: Product[];
  sales: SalesRecord[];
}

export const SlowMovingTable: React.FC<SlowMovingTableProps> = ({ products, sales }) => {
  const slowItems = getSlowMovingProducts(products, sales).slice(0, 5);
  const totalCapitalLocked = slowItems.reduce((sum, item) => sum + item.capitalTiedUp, 0);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-1.5">
            <h3 className="text-sm font-bold text-slate-900">Slow-Moving Inventory Alert</h3>
            <Hourglass className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xs text-slate-500">Bottom items by inventory turnover velocity</p>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 block font-medium">Capital Tied Up</span>
          <span className="text-sm font-black text-rose-600">
            {formatCurrencyINR(totalCapitalLocked)}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-2.5 px-2">Item Name</th>
              <th className="py-2.5 px-2">Stock On Hand</th>
              <th className="py-2.5 px-2">90-Day Sold</th>
              <th className="py-2.5 px-2">Turnover Velocity</th>
              <th className="py-2.5 px-2 text-right">Locked Capital</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {slowItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/60 transition">
                <td className="py-2.5 px-2 font-bold text-slate-800">
                  <span>{item.name}</span>
                  <span className="block text-[10px] text-slate-400 font-normal">{item.category}</span>
                </td>
                <td className="py-2.5 px-2 text-slate-600 font-semibold">
                  {item.currentStock} {item.unit}
                </td>
                <td className="py-2.5 px-2 text-slate-600">
                  {item.totalSold90Days} {item.unit}
                </td>
                <td className="py-2.5 px-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.turnoverRate < 2
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {item.turnoverRate}x / 90d
                  </span>
                </td>
                <td className="py-2.5 px-2 text-right font-extrabold text-slate-900">
                  {formatCurrencyINR(item.capitalTiedUp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs text-amber-900 flex items-start space-x-2">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Cash Flow Insight:</strong> High-value slow movers like Bourbon Vanilla Extract tie up cash reserves. Consider smaller, more frequent lot purchases.
        </p>
      </div>
    </div>
  );
};
