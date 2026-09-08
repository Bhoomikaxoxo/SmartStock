import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Alert, Product } from '../../types';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Calendar,
  CheckCircle2,
  ShoppingCart,
  Clock,
  AlertOctagon,
} from 'lucide-react';

interface AlertCardProps {
  alert: Alert;
  product?: Product;
  onResolve: (alertId: string) => void;
  onCreatePO: (product: Product) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  product,
  onResolve,
  onCreatePO,
}) => {
  const { currentUser } = useAuth();
  const canCreatePo = currentUser?.role === 'owner' || currentUser?.role === 'purchasing';

  const getSeverityStyle = () => {
    if (alert.resolved) {
      return {
        cardBorder: 'border-l-4 border-l-slate-400 border-slate-200/80 bg-slate-50/80 opacity-75',
        badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
        iconColor: 'text-slate-400 bg-slate-100',
        icon: CheckCircle2,
        label: 'Resolved',
      };
    }

    switch (alert.severity) {
      case 'critical':
        return {
          cardBorder: 'border-l-4 border-l-rose-600 border-rose-200/80 bg-white shadow-card',
          badgeBg: 'bg-rose-50 text-rose-800 border-rose-200 font-extrabold',
          iconColor: 'text-rose-600 bg-rose-50 border border-rose-200/60',
          icon: AlertOctagon,
          label: 'Critical Priority',
        };
      case 'warning':
        return {
          cardBorder: 'border-l-4 border-l-amber-600 border-amber-200/80 bg-white shadow-card',
          badgeBg: 'bg-amber-50 text-amber-900 border-amber-200 font-extrabold',
          iconColor: 'text-amber-600 bg-amber-50 border border-amber-200/60',
          icon: alert.type === 'expiring_soon' ? Calendar : AlertTriangle,
          label: alert.type === 'expiring_soon' ? 'Batch Expiring' : 'Reorder Warning',
        };
      case 'info':
      default:
        return {
          cardBorder: 'border-l-4 border-l-blue-600 border-slate-200/80 bg-white shadow-card',
          badgeBg: 'bg-blue-50 text-blue-900 border-blue-200 font-bold',
          iconColor: 'text-blue-600 bg-blue-50 border border-blue-200/60',
          icon: Info,
          label: 'Buffer Advisory',
        };
    }
  };

  const style = getSeverityStyle();
  const Icon = style.icon;

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${style.cardBorder}`}
    >
      <div className="flex items-start space-x-3.5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${style.iconColor}`}>
          <Icon className="w-5 h-5 stroke-[2.2]" />
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${style.badgeBg}`}>
              {style.label}
            </span>
            <span className="text-xs font-black text-slate-900">
              {alert.product_name}
            </span>
            <span className="text-[11px] text-slate-400 flex items-center space-x-1 font-mono">
              <Clock className="w-3 h-3 text-slate-300" />
              <span>{alert.created_at}</span>
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {alert.message}
          </p>

          {alert.resolved && alert.resolved_at && (
            <p className="text-[11px] text-emerald-700 font-bold flex items-center space-x-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>Resolved on {new Date(alert.resolved_at).toLocaleDateString()}</span>
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {!alert.resolved && (
        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0">
          {product && canCreatePo && (
            <button
              onClick={() => onCreatePO(product)}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5 cursor-pointer active:scale-95"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Create PO</span>
            </button>
          )}

          <button
            onClick={() => onResolve(alert.id)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mark Resolved</span>
          </button>
        </div>
      )}
    </div>
  );
};
