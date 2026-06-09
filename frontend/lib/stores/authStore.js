import { create } from 'zustand';
import api from '../api';
import { DEMO_USER } from '../mock-data';

function setAuthCookies(token, role) {
  if (typeof window === 'undefined') return;
  document.cookie = `dineflow_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  document.cookie = `dineflow_role=${role}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

function clearAuthCookies() {
  if (typeof window === 'undefined') return;
  document.cookie = 'dineflow_token=; path=/; max-age=0';
  document.cookie = 'dineflow_role=; path=/; max-age=0';
}

const getStored = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};

export const useAuthStore = create((set, get) => ({
  mode: 'demo',
  token: null,
  currentUser: null,
  activeRole: 'customer',

  hydrateAuth: () => {
    const storedToken = localStorage.getItem('dineflow_token');
    const storedUser = getStored('dineflow_user', null);
    const storedRole = localStorage.getItem('dineflow_role') || 'customer';
    set({ token: storedToken, currentUser: storedUser, activeRole: storedRole });
  },

  setActiveRole: (role) => {
    localStorage.setItem('dineflow_role', role);
    set({ activeRole: role });
  },

  login: async (email, password, role) => {
    const { mode } = get();
    if (mode === 'live') {
      try {
        const data = await api.login({ email, password, role });
        localStorage.setItem('dineflow_token', data.token);
        localStorage.setItem('dineflow_user', JSON.stringify(data.user));
        localStorage.setItem('dineflow_role', data.user.role);
        setAuthCookies(data.token, data.user.role);
        set({ token: data.token, currentUser: data.user, activeRole: data.user.role });
        return { success: true };
      } catch (err) {
        return { success: false, message: err.message, errors: err.data?.errors };
      }
    }
    const names = { customer: 'Sarah Jenkins', staff: 'Alex Morgan', owner: 'John Doe' };
    const user = { ...DEMO_USER, id: `u-${role}`, name: names[role] || 'Guest', email, role };
    localStorage.setItem('dineflow_token', `mock-${role}`);
    localStorage.setItem('dineflow_user', JSON.stringify(user));
    localStorage.setItem('dineflow_role', role);
    setAuthCookies(`mock-${role}`, role);
    set({ token: `mock-${role}`, currentUser: user, activeRole: role });
    return { success: true };
  },

  register: async (name, email, password, role = 'customer', options = {}) => {
    const { mode } = get();
    const { restaurantCode, restaurantName } = options;
    if (mode === 'live') {
      try {
        const data = await api.register({ name, email, password, role, restaurantCode, restaurantName });
        localStorage.setItem('dineflow_token', data.token);
        localStorage.setItem('dineflow_user', JSON.stringify(data.user));
        localStorage.setItem('dineflow_role', data.user.role);
        setAuthCookies(data.token, data.user.role);
        set({ token: data.token, currentUser: data.user, activeRole: data.user.role });
        return { success: true };
      } catch (err) {
        return { success: false, message: err.message, errors: err.data?.errors };
      }
    }
    const id = `u-${Date.now()}`;
    const userMap = {
      staff: { ...DEMO_USER, id, name, email, role: 'staff', staffDetails: { role: 'Waiter', restaurantCode: restaurantCode || '' } },
      owner: { ...DEMO_USER, id, name, email, role: 'owner', ownerDetails: { restaurantId: 'res-new' } },
    };
    const user = userMap[role] || { ...DEMO_USER, id, name, email, role: 'customer', walletBalance: 120.0, customerDetails: { points: 0, loyaltyTier: 'Bronze' } };
    localStorage.setItem('dineflow_token', `mock-${role}`);
    localStorage.setItem('dineflow_user', JSON.stringify(user));
    localStorage.setItem('dineflow_role', role);
    setAuthCookies(`mock-${role}`, role);
    set({ token: `mock-${role}`, currentUser: user, activeRole: role });
    return { success: true };
  },

  logout: () => {
    localStorage.removeItem('dineflow_token');
    localStorage.removeItem('dineflow_user');
    localStorage.removeItem('dineflow_role');
    clearAuthCookies();
    set({ token: null, currentUser: null });
  },

  updateProfile: async (body) => {
    const { mode, token, currentUser } = get();
    if (mode === 'live' && token) {
      try {
        const updatedUser = await api.updateProfile(body, token);
        localStorage.setItem('dineflow_user', JSON.stringify(updatedUser));
        set({ currentUser: updatedUser });
        return { success: true };
      } catch (err) {
        return { success: false, message: err.message };
      }
    }
    const updated = { ...currentUser, ...body };
    localStorage.setItem('dineflow_user', JSON.stringify(updated));
    set({ currentUser: updated });
    return { success: true };
  },

  topUpWallet: async (amount, token) => {
    const { mode, currentUser } = get();
    if (mode === 'live' && token) {
      try {
        const data = await api.walletTopUp(amount, token);
        const updated = { ...currentUser, walletBalance: data.walletBalance };
        localStorage.setItem('dineflow_user', JSON.stringify(updated));
        set({ currentUser: updated });
        return { success: true };
      } catch (err) {
        return { success: false, message: err.message };
      }
    }
    if (!currentUser) return { success: false };
    const updated = { ...currentUser, walletBalance: currentUser.walletBalance + parseFloat(amount) };
    localStorage.setItem('dineflow_user', JSON.stringify(updated));
    set({ currentUser: updated });
    return { success: true };
  },
}));
