import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, AlertSeverity } from '../../types';
import { AlertCard } from './AlertCard';
import { CreatePOModal } from './CreatePOModal';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Calendar,
  Search,
  X,
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { alerts, products, resolveAlert } = useApp();

  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'resolved' | 'all'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductForPo, setSelectedProductForPo] = useState<Product | null>(null);

  const productMap = useMemo(() => {
    return new Map(products.map((p) => [p.id, p]));
  }, [products]);

  // Counts
  const activeAlerts = alerts.filter((a) => !a.resolved);
  const criticalCount = activeAlerts.filter((a) => a.severity === 'critical').length;
  const warningCount = activeAlerts.filter((a) => a.severity === 'warning').length;
  const infoCount = activeAlerts.filter((a) => a.severity === 'info').length;
  const expiryCount = activeAlerts.filter((a) => a.type === 'expiring_soon').length;

  const filteredAlerts = useMemo(() => {
    return alerts
      .filter((a) => {
        if (statusFilter === 'active' && a.resolved) return false;
        if (statusFilter === 'resolved' && !a.resolved) return false;

        if (severityFilter === 'critical' && a.severity !== 'critical') return false;
        if (severityFilter === 'warning' && a.severity !== 'warning') return false;
        if (severityFilter === 'info' && a.severity !== 'info') return false;
        if (severityFilter === 'expiring' && a.type !== 'expiring_soon') return false;

        if (searchTerm) {
          const lower = searchTerm.toLowerCase();
          return (
            a.product_name.toLowerCase().includes(lower) ||
            a.message.toLowerCase().includes(lower)
          );
        }

        return true;
      })
      .sort((a, b) => {
        if (a.resolved !== b.resolved) return a.resolved ? 1 : -1;
        const severityOrder: Record<AlertSeverity, number> = {
          critical: 3,
          warning: 2,
          info: 1,
        };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });
  }, [alerts, statusFilter, severityFilter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2.5">
            <AlertOctagon className="w-6 h-6 text-rose-600 stroke-[2.2]" />
            <span>Priority Reorder & Threshold Alerts</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Automated alerts prioritized by severity. Take immediate restocking action to prevent stockouts.
          </p>
        </div>
      </div>

      {/* Severity Counters Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <button
          onClick={() => {
            setSeverityFilter('critical');
            setStatusFilter('active');
          }}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer relative overflow-hidden shadow-card hover:shadow-card-hover ${
            severityFilter === 'critical'
              ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-400'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
          <div className="flex items-center justify-between">
            <span className="font-bold text-rose-900 uppercase tracking-wider text-[11px]">
              Critical Priority
            </span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 font-mono tabular-nums mt-1.5">
            {criticalCount}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Below emergency buffer</span>
        </button>

        <button
          onClick={() => {
            setSeverityFilter('warning');
            setStatusFilter('active');
          }}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer relative overflow-hidden shadow-card hover:shadow-card-hover ${
            severityFilter === 'warning'
              ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-900 uppercase tracking-wider text-[11px]">
              Reorder Warnings
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono tabular-nums mt-1.5">
            {warningCount}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Runout in ≤ lead time</span>
        </button>

        <button
          onClick={() => {
            setSeverityFilter('expiring');
            setStatusFilter('active');
          }}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer relative overflow-hidden shadow-card hover:shadow-card-hover ${
            severityFilter === 'expiring'
              ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-500" />
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Expiring Batches
            </span>
            <Calendar className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-800 font-mono tabular-nums mt-1.5">
            {expiryCount}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Shelf life ≤ 7 days</span>
        </button>

        <button
          onClick={() => {
            setSeverityFilter('info');
            setStatusFilter('active');
          }}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer relative overflow-hidden shadow-card hover:shadow-card-hover ${
            severityFilter === 'info'
              ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-400'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-900 uppercase tracking-wider text-[11px]">
              Buffer Advisories
            </span>
            <Info className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 font-mono tabular-nums mt-1.5">
            {infoCount}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Approaching buffer point</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter alerts by ingredient, reason, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto border border-slate-200/60">
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 font-bold rounded-lg transition cursor-pointer ${
              statusFilter === 'active' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Active ({activeAlerts.length})
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-3 py-1 font-bold rounded-lg transition cursor-pointer ${
              statusFilter === 'resolved' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Resolved ({alerts.filter((a) => a.resolved).length})
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 font-bold rounded-lg transition cursor-pointer ${
              statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All History
          </button>
        </div>

        {severityFilter !== 'all' && (
          <button
            onClick={() => setSeverityFilter('all')}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 underline cursor-pointer shrink-0"
          >
            Reset Filter ({severityFilter})
          </button>
        )}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200/80 shadow-card">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Alerts Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              All inventory items are currently well above their replenishment buffers.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              product={productMap.get(alert.product_id)}
              onResolve={resolveAlert}
              onCreatePO={(product) => setSelectedProductForPo(product)}
            />
          ))
        )}
      </div>

      {/* Create Purchase Order Modal */}
      {selectedProductForPo && (
        <CreatePOModal
          preselectedProduct={selectedProductForPo}
          onClose={() => setSelectedProductForPo(null)}
        />
      )}
    </div>
  );
};
