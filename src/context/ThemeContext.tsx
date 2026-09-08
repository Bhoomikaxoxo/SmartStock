import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeTokens {
  bgBase: string;
  bgSurface: string;
  bgElevated: string;
  textPrimary: string;
  textSecondary: string;
  borderDefault: string;
  accent: string;
  status: {
    healthy: string;
    healthyBg: string;
    low: string;
    lowBg: string;
    critical: string;
    criticalBg: string;
    out: string;
    outBg: string;
  };
  chart: {
    grid: string;
    axisText: string;
    tooltipBg: string;
    tooltipBorder: string;
  };
}

const LIGHT_TOKENS: ThemeTokens = {
  bgBase: '#FAF6EE',
  bgSurface: '#FFFFFF',
  bgElevated: '#F5EFE3',
  textPrimary: '#2B241C',
  textSecondary: '#8B7F6B',
  borderDefault: '#E4D9C3',
  accent: '#C97A2B',
  status: {
    healthy: '#059669',
    healthyBg: 'rgba(5, 150, 105, 0.08)',
    low: '#d97706',
    lowBg: 'rgba(217, 119, 6, 0.08)',
    critical: '#e11d48',
    criticalBg: 'rgba(225, 29, 72, 0.08)',
    out: '#475569',
    outBg: 'rgba(71, 85, 105, 0.08)',
  },
  chart: {
    grid: 'rgba(228, 217, 195, 0.45)',
    axisText: '#8B7F6B',
    tooltipBg: 'rgba(43, 36, 28, 0.95)',
    tooltipBorder: '#E4D9C3',
  },
};

const DARK_TOKENS: ThemeTokens = {
  bgBase: '#0B0E14',
  bgSurface: '#131722',
  bgElevated: '#1B2030',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  borderDefault: '#22293C',
  accent: '#F59E0B',
  status: {
    healthy: '#34D399',
    healthyBg: 'rgba(52, 211, 153, 0.10)',
    low: '#FBBF24',
    lowBg: 'rgba(245, 158, 11, 0.10)',
    critical: '#FB7185',
    criticalBg: 'rgba(244, 63, 94, 0.10)',
    out: '#94A3B8',
    outBg: 'rgba(148, 163, 184, 0.10)',
  },
  chart: {
    grid: 'rgba(255, 255, 255, 0.06)',
    axisText: '#94A3B8',
    tooltipBg: 'rgba(19, 23, 34, 0.96)',
    tooltipBorder: '#22293C',
  },
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  tokens: ThemeTokens;
}

const STORAGE_KEY = 'smartstock_theme_v1';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // Ignore storage errors
    }
    return 'light';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Ignore storage errors
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Synchronize document attributes
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Optional: listen to OS color scheme changes if user hasn't explicitly set a preference in this tab
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const tokens = useMemo(() => (theme === 'dark' ? DARK_TOKENS : LIGHT_TOKENS), [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, tokens }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
