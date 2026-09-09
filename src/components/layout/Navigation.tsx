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
    <nav className="glass-nav sticky top-16 z-30 hidden md:block border-b border-white/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto scrollbar-none">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center space-x-2 px-3.5 pt-3 pb-2.5 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-white/45 hover:text-white/80'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-brand-400' : 'text-white/30 group-hover:text-white/60'
                  }`}
                />
                <span>{tab.label}</span>

                {/* Alert Counter Badge */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`ml-1 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full leading-tight transition-colors ${
                      isActive
                        ? 'bg-brand-500/20 text-brand-300'
                        : criticalCount > 0
                        ? 'bg-rose-500/15 text-rose-300'
                        : 'bg-white/10 text-white/50'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}

                {/* Active indicator underline */}
                <span
                  className={`absolute left-0 right-0 -bottom-px h-[2px] rounded-full transition-all ${
                    isActive ? 'bg-brand-500' : 'bg-transparent'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
