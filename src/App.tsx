import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeToggle } from './components/common/ThemeToggle';
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
import { NotFoundPage } from './components/common/NotFoundPage';
import { canAccessTab } from './utils/navigationPermissions';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const { currentUser } = useAuth();

  const userRole = currentUser?.role || 'staff';

  // Dynamic route document title
  React.useEffect(() => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard · SmartStock',
      inventory: 'Inventory Catalog · SmartStock',
      production: 'Production BOM · SmartStock',
      analytics: 'Demand Forecasting · SmartStock',
      alerts: 'Priority Alerts · SmartStock',
      impact: 'Financial Impact · SmartStock',
      settings: 'System Settings · SmartStock',
    };
    document.title = titles[activeTab] || 'SmartStock — Artisan Inventory OS';
  }, [activeTab]);

  // Automatically ensure active tab is allowed for current role, otherwise silently fallback to dashboard
  React.useEffect(() => {
    if (!canAccessTab(activeTab, userRole)) {
      setActiveTab('dashboard');
    }
  }, [activeTab, userRole, setActiveTab]);

  // Clean content rendering without showing lock screens to lower access tiers
  const renderContent = () => {
    if (!canAccessTab(activeTab, userRole)) {
      return <DashboardPage />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'production':
        return <ProductionPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'impact':
        return <ImpactPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <NotFoundPage onReturn={() => setActiveTab('dashboard')} />;
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
    <ThemeProvider>
      <ToastProvider>
        <AuthProviderWrapper />
        <ThemeToggle />
      </ToastProvider>
    </ThemeProvider>
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
