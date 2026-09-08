import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ActiveTab, UserRole } from '../../types';
import {
  LayoutDashboard,
  Boxes,
  TrendingUp,
  AlertOctagon,
  Calculator,
  ChefHat,
} from 'lucide-react';

import { canAccessTab } from '../../utils/navigationPermissions';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, alerts } = useApp();
  const { currentUser } = useAuth();

  const activeAlertsCount = alerts.filter((a) => !a.resolved).length;
  const criticalCount = alerts.filter((a) => !a.resolved && a.severity === 'critical').length;
  const userRole: UserRole = currentUser?.role || 'staff';

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

  // Only render tabs that the current user role has privileges to access
  const visibleTabs = tabs.filter((tab) => canAccessTab(tab.id, userRole));

  return (
    <nav className="glass-nav sticky top-16 z-30 transition-all hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-1.5 overflow-x-auto scrollbar-none py-2.5">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer relative ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 border border-transparent hover:border-slate-200/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                    isActive
                      ? 'text-amber-400 stroke-[2.4]'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{tab.label}</span>

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
