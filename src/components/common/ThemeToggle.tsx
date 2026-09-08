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
      className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full flex items-center justify-center border shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 bg-white text-amber-600 border-[#E4D9C3] dark:bg-[#26201A] dark:text-[#E0954A] dark:border-[#3A3128]"
      style={{
        boxShadow:
          theme === 'dark'
            ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 12px 1px rgba(224, 149, 74, 0.2)'
            : '0 10px 25px -5px rgba(43, 36, 28, 0.12), 0 2px 6px -1px rgba(43, 36, 28, 0.08)',
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
