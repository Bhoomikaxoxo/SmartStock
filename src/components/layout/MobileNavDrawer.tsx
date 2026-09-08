import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ActiveTab, UserRole } from '../../types';
import { canAccessTab } from '../../utils/navigationPermissions';
import {
  X,
  LayoutDashboard,
  Boxes,
  ChefHat,
  TrendingUp,
  AlertOctagon,
  Calculator,
  Settings,
  LogOut,
  ScanBarcode,
  PlusCircle,
  Package,
} from 'lucide-react';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenScanner: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  onOpenScanner,
}) => {
  const { activeTab, setActiveTab, alerts } = useApp();
  const { currentUser, logout } = useAuth();

  const userRole: UserRole = currentUser?.role || 'staff';
  const activeAlertsCount = alerts.filter((a) => !a.resolved).length;
  const criticalCount = alerts.filter((a) => !a.resolved && a.severity === 'critical').length;

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

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
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  const visibleTabs = tabs.filter((t) => canAccessTab(t.id, userRole));

  const handleSelectTab = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    onClose();
  };

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case 'owner':
        return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      case 'purchasing':
        return 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
      case 'staff':
      default:
        return 'bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Drawer Container */}
      <div className="relative w-4/5 max-w-sm bg-white dark:bg-[#1E1813] h-full shadow-2xl flex flex-col z-10 border-r border-slate-200/90 dark:border-slate-800/80 animate-slide-in-right overflow-hidden">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-white shadow-sm shadow-amber-600/30">
              <Package className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-slate-900 dark:text-slate-100 block leading-tight">
                Smart<span className="text-amber-600 dark:text-amber-500">Stock</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Sweet Crust Bakery #104
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Pill */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-amber-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
              {currentUser?.avatarInitial || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                {currentUser?.name}
              </p>
              <div className="flex items-center space-x-2 mt-0.5">
                <span
                  className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${getRoleBadgeStyle(
                    currentUser?.role
                  )}`}
                >
                  {currentUser?.role === 'owner'
                    ? 'Owner'
                    : currentUser?.role === 'purchasing'
                    ? 'Purchasing'
                    : 'Floor Staff'}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Active</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Operations Bar */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 shrink-0">
          <button
            onClick={() => {
              handleSelectTab('inventory');
            }}
            className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 min-h-[40px] cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Log Sale</span>
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenScanner();
            }}
            className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 min-h-[40px] cursor-pointer"
          >
            <ScanBarcode className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>Receiving</span>
          </button>
        </div>

        {/* Navigation Tabs List */}
        <nav className="p-3 overflow-y-auto flex-1 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
            Station Navigation
          </p>
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[42px] ${
                  isActive
                    ? 'bg-slate-900 dark:bg-amber-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-amber-400 dark:text-white'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span>{tab.label}</span>
                </div>

                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-amber-500 text-slate-950'
                        : criticalCount > 0
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Drawer Footer Actions */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full px-3.5 py-2.5 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl flex items-center space-x-2.5 transition font-bold text-xs cursor-pointer min-h-[40px]"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Sign out from Station</span>
          </button>
        </div>
      </div>
    </div>
  );
};
