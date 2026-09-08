import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth, SEEDED_USERS } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Package,
  AlertTriangle,
  LogOut,
  Settings,
  ChevronDown,
  User,
  Shield,
  PlusCircle,
  CheckCircle2,
  Sparkles,
  ScanBarcode,
} from 'lucide-react';
import { BarcodeScannerModal } from '../scanner/BarcodeScannerModal';

export const Header: React.FC = () => {
  const { alerts, setActiveTab } = useApp();
  const { currentUser, logout, switchUser } = useAuth();
  const { showToast } = useToast();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeAlertsCount = alerts.filter((a) => !a.resolved).length;
  const criticalCount = alerts.filter((a) => !a.resolved && a.severity === 'critical').length;

  // Close dropdown on outside click & register keyboard shortcuts
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.tagName === 'SELECT';
      if (isInput) return;

      if ((event.key === 'r' || event.key === 'R') && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setIsScannerOpen((prev) => !prev);
      } else if ((event.key === 's' || event.key === 'S') && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setActiveTab('inventory');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [setActiveTab]);

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case 'owner':
        return 'bg-amber-100/80 text-amber-800 border-amber-300/80';
      case 'purchasing':
        return 'bg-purple-100/80 text-purple-800 border-purple-300/80';
      case 'staff':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'owner':
        return 'Owner';
      case 'purchasing':
        return 'Purchasing';
      case 'staff':
      default:
        return 'Floor Staff';
    }
  };

  const handlePersonaSwitch = (userId: string, userName: string, roleName: string) => {
    switchUser(userId);
    setMenuOpen(false);
    showToast('info', `Switched active persona to ${userName} (${roleName}).`);
  };

  return (
    <header className="glass-header sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Identity & Store Branch Pill */}
          <div className="flex items-center space-x-4">
            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-white shadow-sm shadow-amber-600/30 group-hover:scale-105 transition-transform duration-200">
                <Package className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">
                    Smart<span className="text-amber-600">Stock</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                    Artisan OS
                  </span>
                </div>
              </div>
            </div>

            {/* Store Branch Live Status */}
            <div className="hidden md:flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200/60 text-xs text-slate-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-slate-800">Sweet Crust Bakery</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-mono text-[11px]">Branch #104</span>
            </div>
          </div>

          {/* Right: Quick Action, Alert Pill, Persona Switcher */}
          <div className="flex items-center space-x-3">
            {/* Quick Action: Record Sale Shortcut */}
            <button
              onClick={() => {
                setActiveTab('inventory');
                showToast('info', 'Navigate to Inventory to log POS transactions.');
              }}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Shortcut: Press S"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-700" />
              <span>Log Sale</span>
              <kbd className="hidden lg:inline-block font-mono text-[9px] px-1 py-0.2 rounded bg-amber-200/60 text-amber-900 border border-amber-300/60">
                S
              </kbd>
            </button>

            {/* Quick Action: Barcode Receiving Terminal */}
            <button
              onClick={() => setIsScannerOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Shortcut: Press R"
            >
              <ScanBarcode className="w-3.5 h-3.5 text-slate-700" />
              <span>Receiving</span>
              <kbd className="hidden lg:inline-block font-mono text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                R
              </kbd>
            </button>

            {/* Alert Indicator Pill */}
            <button
              onClick={() => setActiveTab('alerts')}
              className={`relative inline-flex items-center px-3 py-1.5 rounded-xl transition cursor-pointer text-xs font-semibold ${
                criticalCount > 0
                  ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 shadow-2xs'
                  : activeAlertsCount > 0
                  ? 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80'
                  : 'text-slate-600 hover:bg-slate-100/80 border border-slate-200/60'
              }`}
              title="View Active Threshold Alerts"
            >
              <AlertTriangle
                className={`w-4 h-4 ${
                  criticalCount > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-500'
                }`}
              />
              <span className="ml-1.5 hidden sm:inline">Alerts</span>
              {activeAlertsCount > 0 && (
                <span
                  className={`ml-1.5 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                    criticalCount > 0
                      ? 'bg-rose-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {activeAlertsCount}
                </span>
              )}
            </button>

            {/* Account & Persona Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-xl border border-slate-200/80 bg-white/90 hover:bg-white hover:border-slate-300 transition shadow-2xs cursor-pointer text-xs"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-800 to-slate-950 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                  {currentUser?.avatarInitial || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="font-bold text-slate-800 block leading-tight">
                    {currentUser?.name || 'Account'}
                  </span>
                  <span
                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border inline-block mt-0.5 ${getRoleBadgeStyle(
                      currentUser?.role
                    )}`}
                  >
                    {getRoleLabel(currentUser?.role)}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 glass-card rounded-2xl shadow-elevated py-2 z-50 text-xs animate-scale-in">
                  {/* Current Active Account Card */}
                  <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60 rounded-t-xl">
                    <p className="font-bold text-slate-900 text-sm">{currentUser?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                    <div className="mt-1.5 flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getRoleBadgeStyle(
                          currentUser?.role
                        )}`}
                      >
                        {getRoleLabel(currentUser?.role)}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Active Session</span>
                      </span>
                    </div>
                  </div>

                  {/* Persona Quick Switcher Section (Demo Tool) */}
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1">
                      Quick Persona Switch
                    </p>
                    <div className="space-y-1">
                      {SEEDED_USERS.map((user) => {
                        const isCurrent = currentUser?.id === user.id;
                        return (
                          <button
                            key={user.id}
                            onClick={() =>
                              handlePersonaSwitch(user.id, user.name, getRoleLabel(user.role))
                            }
                            className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left transition cursor-pointer ${
                              isCurrent
                                ? 'bg-amber-50/90 text-amber-900 font-bold border border-amber-200/70'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                                {user.avatarInitial}
                              </span>
                              <div>
                                <span className="block text-xs leading-none">{user.name}</span>
                                <span className="text-[10px] text-slate-400 capitalize">
                                  {user.role}
                                </span>
                              </div>
                            </div>
                            {isCurrent && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Owner Administration Shortcut */}
                  {currentUser?.role === 'owner' && (
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>System Settings & Staging</span>
                    </button>
                  )}

                  {/* Sign out */}
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="w-full px-4 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition border-t border-slate-100 cursor-pointer font-medium"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isScannerOpen && (
        <BarcodeScannerModal onClose={() => setIsScannerOpen(false)} />
      )}
    </header>
  );
};
