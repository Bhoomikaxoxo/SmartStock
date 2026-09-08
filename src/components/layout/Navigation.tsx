import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ActiveTab, UserRole } from '../../types';
import {
  LayoutDashboard,
  Boxes,
  TrendingUp,
  AlertOctagon,
  Calculator,
  Lock,
  ChefHat,
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, alerts } = useApp();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const activeAlertsCount = alerts.filter((a) => !a.resolved).length;
  const criticalCount = alerts.filter((a) => !a.resolved && a.severity === 'critical').length;
  const userRole: UserRole = currentUser?.role || 'staff';

  // Permission definition
  const canAccessTab = (tabId: ActiveTab, role: UserRole): boolean => {
    if (role === 'owner') return true;
    if (role === 'purchasing') {
      return tabId === 'dashboard' || tabId === 'inventory' || tabId === 'production' || tabId === 'analytics' || tabId === 'alerts';
    }
    // Staff
    return tabId === 'dashboard' || tabId === 'inventory' || tabId === 'production' || tabId === 'alerts';
  };

  const tabs: {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory Catalog', icon: Boxes },
    { id: 'production', label: 'Production BOM', icon: ChefHat },
    { id: 'analytics', label: 'Demand Forecasting', icon: TrendingUp },
    { id: 'alerts', label: 'Priority Alerts', icon: AlertOctagon, badge: activeAlertsCount },
    { id: 'impact', label: 'Financial Impact', icon: Calculator },
  ];

  const handleTabClick = (tabId: ActiveTab) => {
    if (!canAccessTab(tabId, userRole)) {
      showToast('error', "Access restricted — this module requires Purchasing or Owner authorization.");
      return;
    }
    setActiveTab(tabId);
  };

  return (
    <nav className="glass-nav sticky top-16 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-1.5 overflow-x-auto scrollbar-none py-2.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isAllowed = canAccessTab(tab.id, userRole);

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`group flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer relative ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/10'
                    : isAllowed
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-white/80 border border-transparent hover:border-slate-200/60'
                    : 'text-slate-400 hover:bg-slate-100/50 opacity-60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                    isActive
                      ? 'text-amber-400 stroke-[2.4]'
                      : isAllowed
                      ? 'text-slate-400 group-hover:text-slate-600'
                      : 'text-slate-300'
                  }`}
                />
                <span>{tab.label}</span>

                {/* Lock icon for restricted tabs */}
                {!isAllowed && (
                  <span title="Restricted Access">
                    <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                  </span>
                )}

                {/* Alert Counter Badge */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`ml-1 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full leading-tight transition-colors ${
                      isActive
                        ? 'bg-amber-500 text-slate-950'
                        : criticalCount > 0
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
