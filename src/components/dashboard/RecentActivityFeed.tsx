import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActivityItem } from '../../context/AppContext';
import {
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  CheckCircle,
  Package,
} from 'lucide-react';

export const RecentActivityFeed: React.FC = () => {
  const { activities, stockouts, purchaseOrders, setActiveTab } = useApp();
  const [filter, setFilter] = useState<'all' | 'reorders' | 'stockouts'>('all');

  const filtered = activities.filter((act) => {
    if (filter === 'reorders') return act.type === 'reorder';
    if (filter === 'stockouts') return act.type === 'stockout';
    return true;
  });

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'reorder':
        return <ShoppingCart className="w-4 h-4 text-amber-600" />;
      case 'stockout':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'sale':
        return <TrendingUp className="w-4 h-4 text-slate-600" />;
      case 'restock':
      case 'alert_resolved':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Inventory Activity Audit Trail</h3>
          <p className="text-xs text-slate-500">Live operational events tracked by user identity</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg self-start">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All ({activities.length})
          </button>
          <button
            onClick={() => setFilter('reorders')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
              filter === 'reorders' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Reorders
          </button>
          <button
            onClick={() => setFilter('stockouts')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
              filter === 'stockouts' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Stockouts
          </button>
        </div>
      </div>

      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No events match the selected filter.
          </div>
        ) : (
          filtered.slice(0, 8).map((act) => (
            <div
              key={act.id}
              className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition flex items-start space-x-3 text-xs"
            >
              <div className="p-1.5 rounded-md bg-slate-100 shrink-0 mt-0.5">
                {getIcon(act.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900 truncate">{act.title}</span>
                  <span className="text-[11px] text-slate-400 shrink-0">{act.timestamp}</span>
                </div>
                <p className="text-slate-600 mt-0.5 leading-relaxed">{act.description}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>{purchaseOrders.length} POs dispatched • {stockouts.length} historic stockouts</span>
        <button
          onClick={() => setActiveTab('inventory')}
          className="font-semibold text-amber-700 hover:text-amber-800 flex items-center space-x-1 cursor-pointer"
        >
          <span>View Inventory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
