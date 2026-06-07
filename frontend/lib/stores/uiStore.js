import { create } from 'zustand';

const saveLocal = (key, value) => {
  if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(value));
};
const parseLocal = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};

export const useUIStore = create((set, get) => ({
  cart: [],
  selectedTableId: null,
  sidebarCollapsed: false,

  hydrateUI: () => {
    const storedCart = parseLocal('dineflow_cart', []);
    set({ cart: storedCart });
  },

  setSelectedTableId: (id) => set({ selectedTableId: id }),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

  addToCart: (item, qty = 1) => {
    const { cart } = get();
    const existing = cart.find((c) => c._id === item._id);
    const newCart = existing
      ? cart.map((c) => (c._id === item._id ? { ...c, quantity: c.quantity + qty } : c))
      : [...cart, { ...item, quantity: qty }];
    saveLocal('dineflow_cart', newCart);
    set({ cart: newCart });
  },

  removeFromCart: (id) => {
    const newCart = get().cart.filter((c) => c._id !== id);
    saveLocal('dineflow_cart', newCart);
    set({ cart: newCart });
  },

  updateCartQty: (id, qty) => {
    if (qty <= 0) return get().removeFromCart(id);
    const newCart = get().cart.map((c) => (c._id === id ? { ...c, quantity: qty } : c));
    saveLocal('dineflow_cart', newCart);
    set({ cart: newCart });
  },

  clearCart: () => {
    saveLocal('dineflow_cart', []);
    set({ cart: [] });
  },
}));
