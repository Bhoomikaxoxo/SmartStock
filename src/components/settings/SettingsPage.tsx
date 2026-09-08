import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth, SEEDED_USERS } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Settings,
  Users,
  Shield,
  Zap,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Smartphone,
  ScanLine,
  MessageSquareCode,
  CheckCircle2,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { simulateWeekendEggStockout, resetToDemoData } = useApp();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [roadmapOpen, setRoadmapOpen] = useState(false);

  const handleSimulateCrisis = () => {
    simulateWeekendEggStockout();
    showToast('warning', 'Friday Egg Crisis triggered: Eggs inventory dropped to 6 units.');
  };

  const handleResetData = () => {
    resetToDemoData();
    showToast('success', 'Reset demo environment to benchmark 90-day bakery dataset.');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2.5">
          <Settings className="w-6 h-6 text-amber-600" />
          <span>System Administration & Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage user access roles, audit configurations, and staging demonstration utilities.
        </p>
      </div>

      {/* User Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-900">Bakery User Directory & Roles</h2>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
            {SEEDED_USERS.length} Active Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] border-b border-slate-200">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Accessible Modules</th>
                <th className="py-3 px-4">Purchase Order Authority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SEEDED_USERS.map((user) => {
                const isCurrent = currentUser?.id === user.id;
                let permissions = '';
                let poAuthority = '';

                if (user.role === 'owner') {
                  permissions = 'All Modules (Dashboard, Inventory, Forecast, Alerts, Impact, Settings)';
                  poAuthority = 'Full Authorization (Any Spend)';
                } else if (user.role === 'purchasing') {
                  permissions = 'Dashboard, Inventory, Demand Forecast, Priority Alerts';
                  poAuthority = 'Direct PO Generation Authorized';
                } else {
                  permissions = 'Dashboard, Inventory (Sales/Audits), Priority Alerts';
                  poAuthority = 'View & Resolve Alerts Only';
                }

                return (
                  <tr key={user.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                        {user.avatarInitial}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span>{user.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.2 rounded">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 font-normal text-[11px] block">
                          {user.email}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          user.role === 'owner'
                            ? 'bg-amber-100 text-amber-800'
                            : user.role === 'purchasing'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs">{permissions}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{poAuthority}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staging & Demonstration Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-amber-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Staging Demonstration Utilities</h2>
            <p className="text-xs text-slate-500">
              Tools to test edge cases without contaminating normal day-to-day operations
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Friday Crisis Tool */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-rose-900 text-xs">Simulate Friday Morning Egg Stockout</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                  Scenario Test
                </span>
              </div>
              <p className="text-xs text-rose-800/80 mt-1 leading-relaxed">
                Immediately sets on-hand egg stock to 6 units on a Friday morning, triggering critical threshold alerts and lead-time reorders.
              </p>
            </div>
            <button
              onClick={handleSimulateCrisis}
              className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer self-start"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Trigger Egg Crisis Test</span>
            </button>
          </div>

          {/* Reset Baseline Tool */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs">Reset Benchmark Dataset</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  Clean Slate
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Restores the seeded 90-day daily sales history, resets ingredient stock levels, and restores initial benchmark alerts.
              </p>
            </div>
            <button
              onClick={handleResetData}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer self-start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Benchmark Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Collapsed Roadmap Note */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <button
          onClick={() => setRoadmapOpen(!roadmapOpen)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-800">
              Future Architecture & Planned Enhancements (What&apos;s Next)
            </span>
          </div>
          {roadmapOpen ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {roadmapOpen && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/40 text-xs space-y-3 text-slate-600">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <h4 className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <ScanLine className="w-3.5 h-3.5 text-amber-600" />
                  <span>Barcode & QR Receiving</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Camera-based batch scanning for receiving flour and dairy shipments error-free.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <h4 className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <MessageSquareCode className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Reorder Push</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Automated alerts with 1-tap WhatsApp message generation sent straight to suppliers.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <h4 className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Mobile Floor App</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Offline-capable tablet app for daily staff morning inventory physical counts.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <h4 className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>AI Time-Series Forecasting</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Replacing linear regression with local holiday and festival demand models.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
