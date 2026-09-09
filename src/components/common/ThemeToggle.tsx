import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      id="smartstock-theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
      title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
      className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full flex items-center justify-center border shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 bg-white text-brand-600 border-[#E3E3E8] dark:bg-[#1B2030] dark:text-[#DE9E68] dark:border-[#22293C]"
      style={{
        boxShadow:
          theme === 'dark'
            ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 12px 1px rgba(222, 158, 104, 0.18)'
            : '0 10px 25px -5px rgba(17, 19, 24, 0.12), 0 2px 6px -1px rgba(17, 19, 24, 0.08)',
      }}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {/* Sun Icon (shown when light mode is active) */}
        <Sun
          className={`w-5 h-5 transition-all duration-300 ease-out transform ${
            theme === 'light'
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 rotate-90 scale-50 absolute pointer-events-none'
          }`}
          strokeWidth={2.2}
        />

        {/* Moon Icon (shown when dark mode is active) */}
        <Moon
          className={`w-5 h-5 transition-all duration-300 ease-out transform ${
            theme === 'dark'
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 -rotate-90 scale-50 absolute pointer-events-none'
          }`}
          strokeWidth={2.2}
        />
      </div>
    </button>
  );
};
