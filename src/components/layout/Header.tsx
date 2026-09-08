import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Package,
  AlertTriangle,
  LogOut,
  Settings,
  ChevronDown,
  User,
  Shield,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { alerts, setActiveTab } = useApp();
  const { currentUser, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeAlertsCount = alerts.filter((a) => !a.resolved).length;
  const criticalCount = alerts.filter((a) => !a.resolved && a.severity === 'critical').length;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case 'owner':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'purchasing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
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
        return 'Purchasing Staff';
      case 'staff':
      default:
        return 'Floor Staff';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand & Business Name */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">
                  Smart<span className="text-amber-600">Stock</span>
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                <span className="font-medium text-slate-700">Sweet Crust Artisan Bakery</span>
                <span className="text-slate-300">•</span>
                <span>Branch #104</span>
              </div>
            </div>
          </div>

          {/* Right: Alert Indicator & User Account Menu */}
          <div className="flex items-center space-x-3">
            {/* Alert Indicator Pill */}
            <button
              onClick={() => setActiveTab('alerts')}
              className={`relative inline-flex items-center p-2 rounded-xl transition cursor-pointer ${
                criticalCount > 0
                  ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                  : 'text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
              title="View Active Alerts"
            >
              <AlertTriangle className="w-4 h-4" />
              {activeAlertsCount > 0 && (
                <span
                  className={`ml-1.5 text-xs font-bold px-1.5 py-0.2 rounded-full ${
                    criticalCount > 0 ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                  }`}
                >
                  {activeAlertsCount}
                </span>
              )}
            </button>

            {/* Account Dropdown Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center space-x-2.5 p-1.5 pr-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer text-xs"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                  {currentUser?.avatarInitial || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="font-bold text-slate-800 block leading-tight">
                    {currentUser?.name || 'Account'}
                  </span>
                  <span
                    className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded border inline-block mt-0.5 ${getRoleBadgeStyle(
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
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-lg py-1.5 z-40 text-xs animate-in fade-in duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="font-bold text-slate-900">{currentUser?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                    <div className="mt-1.5">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getRoleBadgeStyle(
                          currentUser?.role
                        )}`}
                      >
                        {getRoleLabel(currentUser?.role)}
                      </span>
                    </div>
                  </div>

                  {/* Settings Item - Only visible to Owner */}
                  {currentUser?.role === 'owner' && (
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>Administration & Staging</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="w-full px-4 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition border-t border-slate-100 cursor-pointer"
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
    </header>
  );
};
