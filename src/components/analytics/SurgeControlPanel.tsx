import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { CloudRain, TrendingUp, Sparkles, SlidersHorizontal, ShieldAlert } from 'lucide-react';

export const SurgeControlPanel: React.FC = () => {
  const { surgeModifiers, setSurgeModifiers, surgeMultiplier } = useApp();
  const { currentUser } = useAuth();

  const isRestricted = currentUser?.role === 'staff';

  const toggleModifier = (key: keyof typeof surgeModifiers) => {
    if (isRestricted) return;
    setSurgeModifiers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (isRestricted) {
    return null;
  }

  return (
    <div className="glass-card rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-2xs">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Environmental Surge Forecasting Multipliers
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Real-time multiplier applied to 30-day average daily burn rate & safety buffers
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium">Active Burn Factor:</span>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-black ${
              surgeMultiplier > 1
                ? 'bg-amber-50 text-amber-800 border border-amber-300'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {surgeMultiplier.toFixed(2)}x
          </span>
        </div>
      </div>

      {/* 3 Interactive Multiplier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Rainy Weather */}
        <button
          type="button"
          onClick={() => toggleModifier('rainyWeather')}
          className={`p-3.5 rounded-xl border text-left transition relative cursor-pointer shadow-2xs ${
            surgeModifiers.rainyWeather
              ? 'bg-amber-50/40 border-amber-300 border-l-4 border-l-amber-600'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-2">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  surgeModifiers.rainyWeather
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <CloudRain className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900">Rainy Weather Surge</span>
            </div>
            <span
              className={`text-[11px] font-mono font-extrabold ${
                surgeModifiers.rainyWeather ? 'text-amber-800' : 'text-slate-400'
              }`}
            >
              +20%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Elevates hot savories, beverage dairy, and sourdough bun consumption buffers.
          </p>
          <div className="mt-2 text-[10px] font-mono font-bold uppercase tracking-wider">
            {surgeModifiers.rainyWeather ? (
              <span className="text-amber-700">● Factor Active</span>
            ) : (
              <span className="text-slate-400">○ Off</span>
            )}
          </div>
        </button>

        {/* Weekend Rush */}
        <button
          type="button"
          onClick={() => toggleModifier('weekendRush')}
          className={`p-3.5 rounded-xl border text-left transition relative cursor-pointer shadow-2xs ${
            surgeModifiers.weekendRush
              ? 'bg-rose-50/40 border-rose-300 border-l-4 border-l-rose-600'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-2">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  surgeModifiers.weekendRush
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900">Weekend Rush</span>
            </div>
            <span
              className={`text-[11px] font-mono font-extrabold ${
                surgeModifiers.weekendRush ? 'text-rose-800' : 'text-slate-400'
              }`}
            >
              +35%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Surges laminated viennoiserie, croissant butterfat, and breakfast egg draw.
          </p>
          <div className="mt-2 text-[10px] font-mono font-bold uppercase tracking-wider">
            {surgeModifiers.weekendRush ? (
              <span className="text-rose-700">● Factor Active</span>
            ) : (
              <span className="text-slate-400">○ Off</span>
            )}
          </div>
        </button>

        {/* Festival / Holiday Spike */}
        <button
          type="button"
          onClick={() => toggleModifier('festiveSeason')}
          className={`p-3.5 rounded-xl border text-left transition relative cursor-pointer shadow-2xs ${
            surgeModifiers.festiveSeason
              ? 'bg-emerald-50/40 border-emerald-300 border-l-4 border-l-emerald-600'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-2">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  surgeModifiers.festiveSeason
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-900">Festival & Holiday Spike</span>
            </div>
            <span
              className={`text-[11px] font-mono font-extrabold ${
                surgeModifiers.festiveSeason ? 'text-emerald-800' : 'text-slate-400'
              }`}
            >
              +50%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Aggressive safety stock buffer for high-volume celebration cake and chocolate orders.
          </p>
          <div className="mt-2 text-[10px] font-mono font-bold uppercase tracking-wider">
            {surgeModifiers.festiveSeason ? (
              <span className="text-emerald-700">● Factor Active</span>
            ) : (
              <span className="text-slate-400">○ Off</span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};
