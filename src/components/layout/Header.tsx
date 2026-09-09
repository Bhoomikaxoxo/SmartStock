import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { SEEDED_USERS } from '../../data/usersData';
import { useToast } from '../../context/ToastContext';
import {
  Package,
  AlertTriangle,
  LogOut,
  Settings,
  ChevronDown,
  CheckCircle2,
  ScanBarcode,
  Search,
  Menu,
} from 'lucide-react';
import { BarcodeScannerModal } from '../scanner/BarcodeScannerModal';
import { MobileNavDrawer } from './MobileNavDrawer';

export const Header: React.FC = () => {
  const { alerts, setActiveTab } = useApp();
  const { currentUser, logout, switchUser } = useAuth();
  const { showToast } = useToast();

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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

  // Chrome (permanently dark header bar) badge treatment — independent of content theme
  const getRoleBadgeStyleChrome = (role?: string) => {
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

  // Panel (theme-reactive dropdown surface) badge treatment
  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case 'owner':
        return 'bg-brand-100/80 dark:bg-brand-950/40 text-brand-800 dark:text-brand-300 border-brand-300/80 dark:border-brand-800/50';
      case 'purchasing':
        return 'bg-purple-100/80 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-300/80 dark:border-purple-800/50';
      case 'staff':
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600';
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
    <header className="glass-header sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Brand Identity */}
          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="md:hidden p-2 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center -ml-1"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-chrome group-hover:bg-brand-500 transition-colors duration-150">
                <Package className="w-[18px] h-[18px] stroke-[2.2]" />
              </div>
              <span className="font-bold text-[15px] tracking-tight text-white">
                Smart<span className="text-brand-400">Stock</span>
              </span>
            </div>
          </div>

          {/* Right: Search, Quick Actions, Alert Pill, Persona Switcher */}
          <div className="flex items-center space-x-2">
            {/* Command Palette Trigger */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
              className="hidden md:flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/15 transition-all cursor-pointer w-48 lg:w-64 group"
              title="Search or jump to... (Ctrl/Cmd K)"
            >
              <Search className="w-3.5 h-3.5 text-white/35 group-hover:text-white/55 transition-colors shrink-0" />
              <span className="text-white/35 group-hover:text-white/55 transition-colors flex-1 text-left truncate">Search or jump to...</span>
              <kbd className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-white/12 text-white/40 shrink-0">
                ⌘K
              </kbd>
            </button>

            {/* Quick Action: Barcode Receiving Terminal */}
            <button
              onClick={() => setIsScannerOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/75 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/15 transition-all cursor-pointer active:scale-95"
              title="Shortcut: Press R"
            >
              <ScanBarcode className="w-3.5 h-3.5 text-white/60" />
              <span>Receiving</span>
              <kbd className="hidden lg:inline-block font-mono text-[9px] px-1 py-0.2 rounded bg-white/10 text-white/60 border border-white/15">
                R
              </kbd>
            </button>

            {/* Alert Indicator Pill */}
            <button
              onClick={() => setActiveTab('alerts')}
              className={`relative inline-flex items-center px-3 py-1.5 rounded-lg transition cursor-pointer text-xs font-semibold border ${
                criticalCount > 0
                  ? 'text-rose-300 bg-rose-500/10 hover:bg-rose-500/15 border-rose-400/25'
                  : activeAlertsCount > 0
                  ? 'text-amber-300 bg-amber-500/10 hover:bg-amber-500/15 border-amber-400/25'
                  : 'text-white/55 hover:bg-white/10 border-white/10'
              }`}
              title="View Active Threshold Alerts"
            >
              <AlertTriangle
                className={`w-4 h-4 ${
                  criticalCount > 0 ? 'text-rose-400 animate-pulse' : 'text-white/40'
                }`}
              />
              <span className="ml-1.5 hidden sm:inline">Alerts</span>
              {activeAlertsCount > 0 && (
                <span
                  className={`ml-1.5 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                    criticalCount > 0
                      ? 'bg-rose-500 text-white'
                      : 'bg-amber-500 text-ink-950'
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
                className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/15 transition cursor-pointer text-xs"
              >
                <div className="w-7 h-7 rounded-md bg-white/10 border border-white/10 text-white font-bold flex items-center justify-center text-xs">
                  {currentUser?.avatarInitial || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="font-semibold text-white/90 block leading-tight">
                    {currentUser?.name || 'Account'}
                  </span>
                  <span
                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border inline-block mt-0.5 ${getRoleBadgeStyleChrome(
                      currentUser?.role
                    )}`}
                  >
                    {getRoleLabel(currentUser?.role)}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-white/40" />
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
                                ? 'bg-brand-50/90 text-brand-900 font-bold border border-brand-200/70'
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
                              <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
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

      <MobileNavDrawer
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onOpenScanner={() => setIsScannerOpen(true)}
      />
    </header>
  );
};
