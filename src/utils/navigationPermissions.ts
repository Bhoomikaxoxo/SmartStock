import { ActiveTab, UserRole } from '../types';

/**
 * Role-based tab authorization check.
 * - owner: Full access across all modules
 * - purchasing: Dashboard, Inventory, Production, Analytics, Alerts (no EOQ calculator / business strategy)
 * - staff: Dashboard, Inventory, Production, Alerts
 */
export const canAccessTab = (tabId: ActiveTab, role: UserRole): boolean => {
  if (role === 'owner') return true;
  if (role === 'purchasing') {
    return (
      tabId === 'dashboard' ||
      tabId === 'inventory' ||
      tabId === 'production' ||
      tabId === 'analytics' ||
      tabId === 'alerts'
    );
  }
  // Staff
  return (
    tabId === 'dashboard' ||
    tabId === 'inventory' ||
    tabId === 'production' ||
    tabId === 'alerts'
  );
};
