import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { canAccessTab } from '../../utils/navigationPermissions';
import { ActiveTab } from '../../types';
import {
  Search,
  LayoutDashboard,
  Boxes,
  ChefHat,
  TrendingUp,
  AlertOctagon,
  Calculator,
  Settings,
  Sun,
  Moon,
  LogOut,
  ReceiptText,
} from 'lucide-react';

interface PaletteAction {
  id: string;
  label: string;
  group: 'Go to' | 'Actions';
  icon: React.ComponentType<{ className?: string }>;
  onRun: () => void;
}

/**
 * Global quick-navigation & command overlay. Purely additive UI: it only
 * reads existing context (no new app state) and dispatches the same
 * setActiveTab / toggleTheme / logout calls the rest of the app already uses.
 * Opens via Ctrl/Cmd+K, or the "open-command-palette" window event (used by
 * the header's search trigger button).
 */
export const CommandPalette: React.FC = () => {
  const { activeTab, setActiveTab, alerts } = useApp();
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const userRole = currentUser?.role || 'staff';
  const activeAlertsCount = alerts.filter((a) => !a.resolved).length;

  const close = () => {
    setIsOpen(false);
    setQuery('');
    setHighlighted(0);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (event.key === 'Escape') {
        close();
      }
    };
    const handleOpenEvent = () => setIsOpen(true);

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleOpenEvent);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(() => inputRef.current?.focus());
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        cancelAnimationFrame(raf);
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isOpen]);

  const navActions: PaletteAction[] = useMemo(() => {
    const tabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'inventory', label: 'Inventory Catalog', icon: Boxes },
      { id: 'production', label: 'Production BOM', icon: ChefHat },
      { id: 'analytics', label: 'Demand Forecasting', icon: TrendingUp },
      { id: 'alerts', label: 'Priority Alerts', icon: AlertOctagon },
      { id: 'impact', label: 'Financial Impact', icon: Calculator },
      { id: 'settings', label: 'System Settings', icon: Settings },
    ];
    return tabs
      .filter((tab) => canAccessTab(tab.id, userRole))
      .map((tab) => ({
        id: `nav-${tab.id}`,
        label: tab.label,
        group: 'Go to' as const,
        icon: tab.icon,
        onRun: () => {
          setActiveTab(tab.id);
          close();
        },
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  const actionItems: PaletteAction[] = useMemo(
    () => [
      {
        id: 'log-sale',
        label: 'Log a sale',
        group: 'Actions',
        icon: ReceiptText,
        onRun: () => {
          setActiveTab('inventory');
          showToast('info', 'Navigate to Inventory to log POS transactions.');
          close();
        },
      },
      {
        id: 'toggle-theme',
        label: theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme',
        group: 'Actions',
        icon: theme === 'light' ? Moon : Sun,
        onRun: () => {
          toggleTheme();
          close();
        },
      },
      {
        id: 'sign-out',
        label: 'Sign out',
        group: 'Actions',
        icon: LogOut,
        onRun: () => {
          close();
          logout();
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  );

  const allActions = [...navActions, ...actionItems];
  const filtered = query.trim()
    ? allActions.filter((action) => action.label.toLowerCase().includes(query.trim().toLowerCase()))
    : allActions;

  useEffect(() => {
    setHighlighted(0);
  }, [query, isOpen]);

  const handleInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      filtered[highlighted]?.onRun();
    }
  };

  if (!isOpen) return null;

  const groups: PaletteAction['group'][] = ['Go to', 'Actions'];

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[14vh] px-4" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="fixed inset-0 bg-ink-950/70" onClick={close} aria-hidden="true" />

      <div className="relative w-full max-w-lg glass-modal rounded-xl shadow-elevated overflow-hidden animate-scale-in">
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search or jump to..."
            className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-400 shrink-0">
            esc
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-center text-xs text-slate-400">No matching commands.</p>
          )}
          {groups.map((group) => {
            const groupActions = filtered.filter((action) => action.group === group);
            if (groupActions.length === 0) return null;
            return (
              <div key={group} className="mb-1 last:mb-0">
                <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {group}
                </p>
                {groupActions.map((action) => {
                  const idx = filtered.indexOf(action);
                  const Icon = action.icon;
                  const isHighlighted = idx === highlighted;
                  const isCurrentTab = action.id === `nav-${activeTab}`;
                  return (
                    <button
                      key={action.id}
                      onClick={() => action.onRun()}
                      onMouseEnter={() => setHighlighted(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm cursor-pointer transition-colors ${
                        isHighlighted
                          ? 'bg-brand-50 dark:bg-brand-950/30 text-brand-800 dark:text-brand-300'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isHighlighted ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                      <span className="flex-1 truncate">{action.label}</span>
                      {isCurrentTab && <span className="text-[10px] text-slate-400 shrink-0">current</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span>{activeAlertsCount} active alert{activeAlertsCount === 1 ? '' : 's'}</span>
          <span className="flex items-center gap-1.5">
            <kbd className="font-mono px-1 py-0.2 rounded border border-slate-200 dark:border-slate-700">↑↓</kbd>
            <span>navigate</span>
            <kbd className="font-mono px-1 py-0.2 rounded border border-slate-200 dark:border-slate-700 ml-1">↵</kbd>
            <span>select</span>
          </span>
        </div>
      </div>
    </div>
  );
};
