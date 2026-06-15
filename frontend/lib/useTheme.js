import { create } from 'zustand';
import { THEMES, STORAGE_KEYS } from './constants';

function getInitialTheme() {
  if (typeof window === 'undefined') return THEMES.DARK;
  return localStorage.getItem(STORAGE_KEYS.THEME) || THEMES.DARK;
}

export const useThemeStore = create((set) => ({
  theme: THEMES.DARK, // Always default to dark on server to prevent hydration mismatch
  isClient: false,
  toggleTheme: () => {
    set((state) => {
      const next = state.theme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.THEME, next);
      }
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle(THEMES.LIGHT, next === THEMES.LIGHT);
      }
      return { theme: next };
    });
  },
  initTheme: () => {
    if (typeof window === 'undefined') return;
    const theme = localStorage.getItem(STORAGE_KEYS.THEME) || THEMES.DARK;
    document.documentElement.classList.toggle(THEMES.LIGHT, theme === THEMES.LIGHT);
    set({ theme, isClient: true });
  },
}));
