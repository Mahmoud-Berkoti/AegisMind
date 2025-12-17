/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0E1014',
        panel: '#151922',
        'panel-2': '#1A1F2B',
        text: '#E9ECF1',
        muted: '#8A90A2',
        accentA: '#7C5CFF',
        accentB: '#00C1D4',
        accentC: '#2EE59D',
        accentD: '#FF6FAE',
        warn: '#F9C74F',
        error: '#F94144',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Plus Jakarta Sans', 'SF Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', 'monospace'],
      },
      spacing: {
        'grid-gap': '16px',
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        panel: '0 8px 24px rgba(0, 0, 0, 0.35)',
      },
      gridTemplateColumns: {
        dashboard: 'repeat(12, 1fr)',
      },
      gap: {
        grid: '16px',
      },
    },
  },
  plugins: [],
};

