/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fbf2ea',
          100: '#f6e1ce',
          200: '#ebc29d',
          300: '#de9e68',
          400: '#cc7c3d',
          500: '#b0530f',
          600: '#96430c',
          700: '#7a370d',
          800: '#632d0f',
          900: '#4f250f',
          950: '#2b1207',
        },
        ink: {
          700: '#2a2c33',
          800: '#1c1e24',
          850: '#16181d',
          900: '#111318',
          950: '#0a0b0e',
        },
        stock: {
          healthy: '#059669',
          low: '#d97706',
          critical: '#e11d48',
          out: '#475569',
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 2px 0 rgba(17, 19, 24, 0.04), 0 0 0 1px rgba(17, 19, 24, 0.045)',
        'card-hover': '0 4px 14px -4px rgba(17, 19, 24, 0.12), 0 0 0 1px rgba(17, 19, 24, 0.06)',
        'elevated': '0 16px 40px -12px rgba(10, 11, 14, 0.28), 0 0 0 1px rgba(17, 19, 24, 0.06)',
        'chrome': '0 1px 0 0 rgba(255, 255, 255, 0.06) inset, 0 1px 12px 0 rgba(0, 0, 0, 0.35)',
      }
    },
  },
  plugins: [],
}

