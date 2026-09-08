import React from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, AlertTriangle, ChefHat, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/audio';

export const ExpiryWatchBanner: React.FC = () => {
  const { getExpiringLots, setActiveTab } = useApp();
  const expiringLots = getExpiringLots(7);

  const handlePrioritize = (productName: string) => {
    sounds.playClick();
    setActiveTab('production');
  };

  if (expiringLots.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Freshness & Shelf-Life Inactive Risks</h4>
            <p className="text-[11px] text-slate-500">All active ingredient lots have healthy shelf-life (&gt; 7 days remaining).</p>
          </div>
        </div>
        <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
          Zero Spoilage Risk
        </span>
      </div>
    );
  }

  // Group by urgency: critical (<= 2 days) vs warning (3-7 days)
  const urgentCount = expiringLots.filter((l) => l.daysUntilExpiry <= 2).length;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card space-y-3 relative overflow-hidden transition-all">
      {/* Top accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          urgentCount > 0 ? 'bg-rose-500' : 'bg-amber-500'
        }`}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              urgentCount > 0
                ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                : 'bg-amber-50 text-amber-700 border-amber-200/80'
            }`}
          >
            <Clock className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                FIFO Expiry Watch & Shelf-Life Risk
              </h3>
              {urgentCount > 0 && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200/90 animate-pulse">
                  {urgentCount} Urgent
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Perishable bakery lots expiring soon — prioritize in upcoming bakes to prevent shrinkage
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('production');
          }}
          className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center space-x-1 transition cursor-pointer self-start sm:self-auto"
        >
          <span>Open Production Plan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Lot Chips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
        {expiringLots.map((lot) => {
          const isUrgent = lot.daysUntilExpiry <= 2;
          return (
            <div
              key={lot.id}
              className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                isUrgent
                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/70 dark:border-rose-900/40 hover:border-rose-300 dark:hover:border-rose-800'
                  : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/40 hover:border-amber-300 dark:hover:border-amber-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {lot.product?.name || 'Ingredient'}
                  </h4>
                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 font-mono mt-0.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{lot.lot_number}</span>
                    <span>•</span>
                    <span className="text-slate-500 dark:text-slate-400">Bal: {lot.quantity} {lot.product?.unit}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border tabular-nums shrink-0 ${
                    isUrgent
                      ? 'bg-rose-100/90 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border-rose-300/80 dark:border-rose-800/50'
                      : 'bg-amber-100/90 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-300/80 dark:border-amber-800/50'
                  }`}
                >
                  {lot.daysUntilExpiry <= 0
                    ? 'Expires Today'
                    : lot.daysUntilExpiry === 1
                    ? 'Expires Tomorrow'
                    : `Expires in ${lot.daysUntilExpiry}d`}
                </span>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Use-by: {lot.expiry_date}
                </span>
                <button
                  type="button"
                  onClick={() => handlePrioritize(lot.product?.name || '')}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-lg text-[10px] font-bold transition shadow-2xs inline-flex items-center space-x-1 cursor-pointer"
                >
                  <ChefHat className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>Prioritize Bake</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
