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
        bg: {
          DEFAULT: '#0B0F19',
          elevated: '#0D1424',
          subtle: '#111827'
        },
        surface: {
          DEFAULT: '#0F172A',
          hover: '#17233D',
          active: '#1E2D4A',
          card: '#0D1527'
        },
        border: {
          DEFAULT: '#1E293B',
          subtle: '#152136',
          strong: '#334155'
        },
        primary: {
          DEFAULT: '#4F46E5',
          hover: '#4338CA',
          light: '#6366F1',
          dim: 'rgba(79, 70, 229, 0.15)'
        },
        success: {
          DEFAULT: '#10B981',
          hover: '#059669',
          dim: 'rgba(16, 185, 129, 0.15)'
        },
        warning: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
          dim: 'rgba(245, 158, 11, 0.15)'
        },
        danger: {
          DEFAULT: '#F43F5E',
          hover: '#E11D48',
          dim: 'rgba(244, 63, 94, 0.15)'
        }
      },
      fontFamily: {
        sans: ['Geist Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-primary': '0 0 25px -5px rgba(79, 70, 229, 0.45)',
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.4)',
        'premium': '0 20px 40px -15px rgba(0, 0, 0, 0.7)'
      }
    },
  },
  plugins: [],
}
