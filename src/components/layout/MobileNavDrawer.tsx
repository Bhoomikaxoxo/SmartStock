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
        return 'bg-brand-500/15 text-brand-300 border-brand-400/25';
      case 'purchasing':
        return 'bg-purple-500/15 text-purple-300 border-purple-400/25';
      case 'staff':
      default:
        return 'bg-white/8 text-white/60 border-white/12';
    }
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Drawer Container */}
      <div className="relative w-4/5 max-w-sm bg-ink-950 h-full shadow-elevated flex flex-col z-10 border-r border-white/10 animate-slide-in-right overflow-hidden">
        {/* Drawer Header */}
        <div className="p-4 border-b border-white/8 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-chrome">
              <Package className="w-[18px] h-[18px] stroke-[2.2]" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block leading-tight">
                Smart<span className="text-brand-400">Stock</span>
              </span>
              <span className="text-[10px] text-white/40 font-medium">
                Sweet Crust Bakery #104
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Pill */}
        <div className="p-4 border-b border-white/8 bg-white/[0.03] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-md bg-white/10 border border-white/10 text-white font-bold flex items-center justify-center text-xs">
              {currentUser?.avatarInitial || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs text-white/90 truncate">
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
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Active</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Operations Bar */}
        <div className="p-3 border-b border-white/8 grid grid-cols-2 gap-2 shrink-0">
          <button
            onClick={() => {
              handleSelectTab('inventory');
            }}
            className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-brand-300 bg-brand-500/10 border border-brand-400/20 min-h-[40px] cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-brand-400" />
            <span>Log Sale</span>
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenScanner();
            }}
            className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white/75 bg-white/5 border border-white/10 min-h-[40px] cursor-pointer"
          >
            <ScanBarcode className="w-3.5 h-3.5 text-white/60" />
            <span>Receiving</span>
          </button>
        </div>

        {/* Navigation Tabs List */}
        <nav className="p-3 overflow-y-auto flex-1 space-y-1">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider px-3 py-1">
            Station Navigation
          </p>
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[42px] ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-300'
                    : 'text-white/55 hover:bg-white/8 hover:text-white/80'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-brand-400' : 'text-white/30'
                    }`}
                  />
                  <span>{tab.label}</span>
                </div>

                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-brand-500/25 text-brand-200'
                        : criticalCount > 0
                        ? 'bg-rose-500/15 text-rose-300'
                        : 'bg-white/10 text-white/50'
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
        <div className="p-3 border-t border-white/8 shrink-0">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full px-3.5 py-2.5 text-left text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center space-x-2.5 transition font-semibold text-xs cursor-pointer min-h-[40px]"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign out from Station</span>
          </button>
        </div>
      </div>
    </div>
  );
};
