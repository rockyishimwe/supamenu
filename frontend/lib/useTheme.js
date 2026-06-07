import { create } from 'zustand';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  return localStorage.getItem('dineflow_theme') || 'dark';
}

export const useThemeStore = create((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () => {
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('dineflow_theme', next);
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('light', next === 'light');
      }
      return { theme: next };
    });
  },
  initTheme: () => {
    const theme = getInitialTheme();
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('light', theme === 'light');
    }
    set({ theme });
  },
}));
