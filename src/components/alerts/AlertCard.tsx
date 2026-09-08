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
        cardBorder: 'border-l-4 border-l-slate-400 border-slate-200 bg-slate-50 opacity-70',
        badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
        iconColor: 'text-slate-400',
        icon: CheckCircle2,
        label: 'Resolved',
      };
    }

    switch (alert.severity) {
      case 'critical':
        return {
          cardBorder: 'border-l-4 border-l-rose-600 border-slate-200 bg-white shadow-2xs',
          badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
          iconColor: 'text-rose-600',
          icon: AlertOctagon,
          label: 'Critical Priority',
        };
      case 'warning':
        return {
          cardBorder: 'border-l-4 border-l-amber-600 border-slate-200 bg-white shadow-2xs',
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
          iconColor: 'text-amber-600',
          icon: alert.type === 'expiring_soon' ? Calendar : AlertTriangle,
          label: alert.type === 'expiring_soon' ? 'Batch Expiring' : 'Reorder Warning',
        };
      case 'info':
      default:
        return {
          cardBorder: 'border-l-4 border-l-blue-600 border-slate-200 bg-white shadow-2xs',
          badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
          iconColor: 'text-blue-600',
          icon: Info,
          label: 'Planning Buffer',
        };
    }
  };

  const style = getSeverityStyle();
  const Icon = style.icon;

  return (
    <div
      className={`rounded-xl p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${style.cardBorder}`}
    >
      <div className="flex items-start space-x-3">
        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${style.iconColor}`}>
          <Icon className="w-5 h-5 stroke-[2]" />
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${style.badgeBg}`}>
              {style.label}
            </span>
            <span className="text-xs font-bold text-slate-900">
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
            <p className="text-[11px] text-emerald-700 font-medium flex items-center space-x-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>Resolved on {new Date(alert.resolved_at).toLocaleDateString()}</span>
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      {!alert.resolved && (
        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
          {product && canCreatePo && (
            <button
              onClick={() => onCreatePO(product)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg shadow-2xs transition flex items-center space-x-1 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Create PO</span>
            </button>
          )}

          <button
            onClick={() => onResolve(alert.id)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition flex items-center space-x-1 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mark Resolved</span>
          </button>
        </div>
      )}
    </div>
  );
};
