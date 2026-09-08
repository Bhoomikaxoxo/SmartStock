import React from 'react';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { InventoryPage } from './components/inventory/InventoryPage';
import { AnalyticsPage } from './components/analytics/AnalyticsPage';
import { AlertsPage } from './components/alerts/AlertsPage';
import { ImpactPage } from './components/impact/ImpactPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { ProductionPage } from './components/production/ProductionPage';
import { Lock, ArrowLeft } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const userRole = currentUser?.role || 'staff';

  // Permission guard
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'production':
        return <ProductionPage />;
      case 'analytics':
        if (userRole === 'staff') {
          return (
            <div className="glass-card rounded-3xl p-10 text-center border border-slate-200/80 shadow-card max-w-md mx-auto my-16 animate-scale-in">
              <div className="w-12 h-12 bg-amber-50 text-amber-800 rounded-2xl flex items-center justify-center mx-auto mb-3.5 border border-amber-200/80">
                <Lock className="w-6 h-6 stroke-[2]" />
              </div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Access Restricted</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Demand Forecasting and automated reorders are reserved for Purchasing Staff and Bakery Owners.
              </p>
              <button
                onClick={() => setActiveTab('inventory')}
                className="mt-5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer inline-flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Inventory Catalog</span>
              </button>
            </div>
          );
        }
        return <AnalyticsPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'impact':
        if (userRole !== 'owner') {
          return (
            <div className="glass-card rounded-3xl p-10 text-center border border-slate-200/80 shadow-card max-w-md mx-auto my-16 animate-scale-in">
              <div className="w-12 h-12 bg-amber-50 text-amber-800 rounded-2xl flex items-center justify-center mx-auto mb-3.5 border border-amber-200/80">
                <Lock className="w-6 h-6 stroke-[2]" />
              </div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Owner Access Required</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Financial impact calculation and margin metrics are confidential to business owners.
              </p>
              <button
                onClick={() => setActiveTab('inventory')}
                className="mt-5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer inline-flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Inventory Catalog</span>
              </button>
            </div>
          );
        }
        return <ImpactPage />;
      case 'settings':
        if (userRole !== 'owner') {
          return (
            <div className="glass-card rounded-3xl p-10 text-center border border-slate-200/80 shadow-card max-w-md mx-auto my-16 animate-scale-in">
              <div className="w-12 h-12 bg-amber-50 text-amber-800 rounded-2xl flex items-center justify-center mx-auto mb-3.5 border border-amber-200/80">
                <Lock className="w-6 h-6 stroke-[2]" />
              </div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Owner Access Required</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                System administration and staging controls are restricted to bakery owners.
              </p>
              <button
                onClick={() => setActiveTab('inventory')}
                className="mt-5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer inline-flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Inventory Catalog</span>
              </button>
            </div>
          );
        }
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-amber-100 selection:text-amber-900">
      <Header />
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full animate-fade-in">
        {renderContent()}
      </main>

      {/* Production Operational Footer */}
      <footer className="glass-nav py-6 text-xs text-slate-500 mt-auto border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left flex items-center space-x-2 flex-wrap justify-center">
            <span className="font-extrabold text-slate-800">SmartStock</span>
            <span className="text-slate-300">•</span>
            <span>Sweet Crust Artisan Bakery #104</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">Inventory Forecasting & Automated Buffer Replenishment</span>
          </div>
          <div className="flex items-center space-x-2 font-mono text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Session: {currentUser?.email}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export function App() {
  return (
    <ToastProvider>
      <AuthProviderWrapper />
    </ToastProvider>
  );
}

// Wrapper to pass toast callback on session expiry
const AuthProviderWrapper: React.FC = () => {
  const { showToast } = useToast();

  const handleSessionExpired = (reason: string) => {
    showToast('error', reason);
  };

  return (
    <AuthProvider onSessionExpired={handleSessionExpired}>
      <AuthenticatedApp />
    </AuthProvider>
  );
};

export default App;
