import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActivityItem } from '../../context/AppContext';
import {
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  CheckCircle2,
  Package,
  History,
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
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'restock':
      case 'alert_resolved':
        return <CheckCircle2 className="w-4 h-4 text-teal-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getActorBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'purchasing':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'staff':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60">
            <History className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Identity-Linked Audit Log
            </h3>
            <p className="text-xs text-slate-500">Live operational events tracked by user identity</p>
          </div>
        </div>

        {/* Segmented Filter Pills */}
        <div className="flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 self-start sm:self-center">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All ({activities.length})
          </button>
          <button
            onClick={() => setFilter('reorders')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filter === 'reorders'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Reorders
          </button>
          <button
            onClick={() => setFilter('stockouts')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filter === 'stockouts'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Stockouts
          </button>
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-2.5 max-h-84 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400 font-medium">
            No events match the selected filter.
          </div>
        ) : (
          filtered.slice(0, 8).map((act) => (
            <div
              key={act.id}
              className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200/90 hover:bg-slate-50/70 transition-all flex items-start space-x-3 text-xs"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100/80 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200/50">
                {getIcon(act.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="font-bold text-slate-900 truncate">{act.title}</span>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border shrink-0 ${getActorBadge(
                        act.actorRole
                      )}`}
                    >
                      {act.actorRole}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 shrink-0 font-mono">
                    {act.timestamp}
                  </span>
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed text-xs">
                  {act.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium">
          <strong className="text-slate-800 font-mono">{purchaseOrders.length}</strong> POs dispatched •{' '}
          <strong className="text-slate-800 font-mono">{stockouts.length}</strong> historic stockouts
        </span>
        <button
          onClick={() => setActiveTab('inventory')}
          className="font-bold text-amber-700 hover:text-amber-800 flex items-center space-x-1.5 cursor-pointer group"
        >
          <span>Catalog View</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};
