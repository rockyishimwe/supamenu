/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    borderRadius: {
      none: '0',
      sm: '12px',
      DEFAULT: '20px',
      md: '20px',
      lg: '24px',
      xl: '32px',
      full: '9999px',
    },
    extend: {
      colors: {
        primary: '#FF6B00',
        panel: '#0F1115',
        surface: '#07090e',
        border: '#1f2228',
        available: '#22c55e',
        occupied: '#ef4444',
        reserved: '#f59e0b',
        cleaning: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"SF Pro Display"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        elevated: '0 12px 40px -12px rgba(0, 0, 0, 0.55), 0 4px 12px rgba(0,0,0,0.25)',
      },
      spacing: {
        sidebar: '240px',
        'sidebar-collapsed': '64px',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.glass-panel': {
          background: 'rgba(15, 17, 21, 0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        },
        '.gradient-border': {
          border: '1px solid transparent',
          backgroundImage:
            'linear-gradient(rgba(15,17,21,0.9), rgba(15,17,21,0.9)), linear-gradient(135deg, rgba(255,107,0,0.4), rgba(255,255,255,0.08))',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
        },
      });
    },
  ],
};
