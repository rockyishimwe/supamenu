import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock document.documentElement
document.documentElement.classList.toggle = vi.fn();

import { useThemeStore } from '../lib/useTheme';

describe('useThemeStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    // Reset the store state
    useThemeStore.setState({ theme: 'dark' });
  });

  it('starts with dark theme by default', () => {
    const { theme } = useThemeStore.getState();
    expect(theme).toBe('dark');
  });

  it('toggles from dark to light', () => {
    useThemeStore.getState().toggleTheme();
    const { theme } = useThemeStore.getState();
    expect(theme).toBe('light');
  });

  it('toggles from light to dark', () => {
    useThemeStore.setState({ theme: 'light' });
    useThemeStore.getState().toggleTheme();
    const { theme } = useThemeStore.getState();
    expect(theme).toBe('dark');
  });

  it('persists theme to localStorage on toggle', () => {
    useThemeStore.getState().toggleTheme();
    expect(localStorageMock.setItem).toHaveBeenCalledWith('dineflow_theme', 'light');
  });

  it('toggles document class on theme change', () => {
    useThemeStore.getState().toggleTheme();
    expect(document.documentElement.classList.toggle).toHaveBeenCalledWith('light', true);
  });
});
