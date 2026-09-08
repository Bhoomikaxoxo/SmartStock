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
import { Lock } from 'lucide-react';

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
      case 'analytics':
        if (userRole === 'staff') {
          return (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-2xs max-w-md mx-auto my-12">
              <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Access Restricted</h2>
              <p className="text-xs text-slate-500 mt-1">
                Demand Forecasting and automated reorders are reserved for Purchasing Staff and Owners.
              </p>
              <button
                onClick={() => setActiveTab('inventory')}
                className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition cursor-pointer"
              >
                Return to Inventory
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
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-2xs max-w-md mx-auto my-12">
              <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Owner Access Required</h2>
              <p className="text-xs text-slate-500 mt-1">
                Financial impact calculation and margin metrics are confidential to business owners.
              </p>
              <button
                onClick={() => setActiveTab('inventory')}
                className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition cursor-pointer"
              >
                Return to Inventory
              </button>
            </div>
          );
        }
        return <ImpactPage />;
      case 'settings':
        if (userRole !== 'owner') {
          return (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-2xs max-w-md mx-auto my-12">
              <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Owner Access Required</h2>
              <p className="text-xs text-slate-500 mt-1">
                System administration and staging controls are restricted to bakery owners.
              </p>
              <button
                onClick={() => setActiveTab('inventory')}
                className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition cursor-pointer"
              >
                Return to Inventory
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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {renderContent()}
      </main>

      {/* Production Operational Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <span className="font-semibold text-slate-700">SmartStock Systems</span>
            <span className="text-slate-300 mx-2">•</span>
            <span>Sweet Crust Bakery (Branch #104)</span>
            <span className="text-slate-300 mx-2">•</span>
            <span>Inventory Forecasting & Automated Buffer Replenishment</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            Session Active ({currentUser?.email})
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
