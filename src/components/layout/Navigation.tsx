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
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, alerts } = useApp();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const activeAlertsCount = alerts.filter((a) => !a.resolved).length;
  const userRole: UserRole = currentUser?.role || 'staff';

  // Permission definition
  const canAccessTab = (tabId: ActiveTab, role: UserRole): boolean => {
    if (role === 'owner') return true;
    if (role === 'purchasing') {
      return tabId === 'dashboard' || tabId === 'inventory' || tabId === 'analytics' || tabId === 'alerts';
    }
    // Staff
    return tabId === 'dashboard' || tabId === 'inventory' || tabId === 'alerts';
  };

  const tabs: {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'analytics', label: 'Demand Forecasting', icon: TrendingUp },
    { id: 'alerts', label: 'Priority Alerts', icon: AlertOctagon, badge: activeAlertsCount },
    { id: 'impact', label: 'Financial Impact', icon: Calculator },
  ];

  const handleTabClick = (tabId: ActiveTab) => {
    if (!canAccessTab(tabId, userRole)) {
      showToast('error', "You don't have access to this section — ask an Owner for access.");
      return;
    }
    setActiveTab(tabId);
  };

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isAllowed = canAccessTab(tab.id, userRole);

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs font-bold'
                    : isAllowed
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-400 hover:bg-slate-50 opacity-60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-amber-600 stroke-[2.2]' : isAllowed ? 'text-slate-400' : 'text-slate-300'
                  }`}
                />
                <span>{tab.label}</span>

                {/* Lock icon for restricted tabs */}
                {!isAllowed && <Lock className="w-3 h-3 text-slate-400 shrink-0" />}

                {/* Badge for Active Alerts */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-amber-600 text-white' : 'bg-rose-100 text-rose-700'
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
