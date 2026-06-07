import { create } from 'zustand';
import api, { checkHealth } from '../api';
import { getInitialMockState } from '../mock-data';
import { useUIStore } from './uiStore';
import { useAuthStore } from './authStore';

const saveLocal = (key, value) => {
  if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(value));
};
const parseLocal = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};

export const useDataStore = create((set, get) => ({
  mode: 'demo',
  hydrated: false,
  loading: true,
  restaurants: [],
  menuItems: [],
  tables: [],
  reservations: [],
  orders: [],
  analytics: null,

  hydrate: async () => {
    const mock = getInitialMockState();
    const storedToken = localStorage.getItem('dineflow_token');

    if (typeof window !== 'undefined' && !localStorage.getItem('dineflow_seeded')) {
      saveLocal('dineflow_restaurants', mock.restaurants);
      saveLocal('dineflow_menu', mock.menuItems);
      saveLocal('dineflow_tables', mock.tables);
      saveLocal('dineflow_reservations', mock.reservations);
      saveLocal('dineflow_orders', mock.orders);
      saveLocal('dineflow_analytics', mock.analytics);
      localStorage.setItem('dineflow_seeded', 'true');
    }

    set({
      mode: 'demo',
      hydrated: true,
      loading: false,
      restaurants: parseLocal('dineflow_restaurants', mock.restaurants),
      menuItems: parseLocal('dineflow_menu', mock.menuItems),
      tables: parseLocal('dineflow_tables', mock.tables),
      reservations: parseLocal('dineflow_reservations', mock.reservations),
      orders: parseLocal('dineflow_orders', mock.orders),
      analytics: parseLocal('dineflow_analytics', mock.analytics),
    });

    try {
      const ok = await checkHealth();
      if (!ok) return;
      set({ mode: 'live' });

      const restaurants = await api.getRestaurants();
      const menuItems = (await Promise.all(restaurants.map((r) => api.getRestaurantMenu(r._id).catch(() => [])))).flat();
      set({ restaurants, menuItems });
      saveLocal('dineflow_restaurants', restaurants);
      saveLocal('dineflow_menu', menuItems);

      if (!storedToken) return;

      const [tables, reservations, orders, summary, salesChart, reservationsChart] = await Promise.all([
        api.getTables(storedToken).catch(() => []),
        api.getReservations(storedToken).catch(() => []),
        api.getOrders(storedToken).catch(() => []),
        api.analyticsSummary(storedToken).catch(() => mock.analytics.summary),
        api.analyticsSalesChart(storedToken).catch(() => mock.analytics.salesChart),
        api.analyticsReservationsChart(storedToken).catch(() => mock.analytics.reservationsChart),
      ]);
      set({ tables, reservations, orders, analytics: { summary, salesChart, reservationsChart } });
      saveLocal('dineflow_tables', tables);
      saveLocal('dineflow_reservations', reservations);
      saveLocal('dineflow_orders', orders);
    } catch { /* backend unreachable */ }
  },

  createReservation: async (data) => {
    const { mode, reservations } = get();
    const token = localStorage.getItem('dineflow_token');
    if (mode === 'live' && token) {
      try {
        const newRes = await api.createReservation(data, token);
        const updated = [newRes, ...reservations];
        saveLocal('dineflow_reservations', updated);
        set({ reservations: updated });
        return { success: true };
      } catch (err) {
        return { success: false, message: err.message };
      }
    }
    const newRes = { _id: `rv-${Date.now()}`, ...data, status: 'confirmed' };
    const updated = [newRes, ...reservations];
    saveLocal('dineflow_reservations', updated);
    set({ reservations: updated });
    return { success: true };
  },

  updateReservationStatus: async (id, status) => {
    const { mode, reservations } = get();
    const token = localStorage.getItem('dineflow_token');
    if (mode === 'live' && token) await api.patchReservation(id, { status }, token).catch(() => {});
    const updated = reservations.map((r) => (r._id === id ? { ...r, status } : r));
    saveLocal('dineflow_reservations', updated);
    set({ reservations: updated });
  },

  checkout: async (paymentMethod = 'wallet') => {
    const { mode, orders } = get();
    const token = localStorage.getItem('dineflow_token');
    const cart = getCartFromStore();
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const total = subtotal * 1.185;
    const orderData = { items: cart.map((c) => ({ menuItemId: c._id, name: c.name, quantity: c.quantity, price: c.price })), total: +total.toFixed(2), paymentMethod };
    if (mode === 'live' && token) {
      try {
        const newOrder = await api.createOrder(orderData, token);
        const updated = [newOrder, ...orders];
        saveLocal('dineflow_orders', updated);
        clearCartInStore();
        set({ orders: updated });
        return { success: true, order: newOrder };
      } catch (err) {
        return { success: false, message: err.message };
      }
    }
    const newOrder = { _id: `ord-${Date.now()}`, ...orderData, status: 'preparing', createdAt: new Date().toISOString() };
    const updated = [newOrder, ...orders];
    saveLocal('dineflow_orders', updated);
    clearCartInStore();
    set({ orders: updated });
    return { success: true, order: newOrder };
  },

  updateTableStatus: async (id, details) => {
    const { mode, tables } = get();
    const token = localStorage.getItem('dineflow_token');
    if (mode === 'live') await api.patchTableStatus(id, details, token).catch(() => {});
    const updated = tables.map((t) => (t._id === id ? { ...t, ...details } : t));
    saveLocal('dineflow_tables', updated);
    set({ tables: updated });
  },

  updateOrderStatus: async (id, status) => {
    const { mode, orders } = get();
    const token = localStorage.getItem('dineflow_token');
    if (mode === 'live' && token) await api.patchOrderStatus(id, status, token).catch(() => {});
    const updated = orders.map((o) => (o._id === id ? { ...o, status } : o));
    saveLocal('dineflow_orders', updated);
    set({ orders: updated });
  },

  addMenuItem: async (item) => {
    const { mode, menuItems } = get();
    const token = localStorage.getItem('dineflow_token');
    const currentUser = getUserFromStore();
    const restaurantId = currentUser?.ownerDetails?.restaurantId || currentUser?.staffDetails?.restaurantId;
    if (mode === 'live' && token && restaurantId) {
      try {
        const newItem = await api.addMenuItem(restaurantId, item, token);
        const updated = [...menuItems, newItem];
        saveLocal('dineflow_menu', updated);
        set({ menuItems: updated });
        return { success: true };
      } catch (err) {
        return { success: false, message: err.message };
      }
    }
    const newItem = { _id: `menu-${Date.now()}`, restaurantId: restaurantId || 'res-garden', ...item, rating: 4.5, reviewsCount: 1, status: 'in_stock' };
    const updated = [...menuItems, newItem];
    saveLocal('dineflow_menu', updated);
    set({ menuItems: updated });
    return { success: true };
  },

  addTable: async (data) => {
    const { mode, tables } = get();
    const token = localStorage.getItem('dineflow_token');
    if (mode === 'live' && token) {
      try {
        const newTable = await api.addTable(data, token);
        const updated = [...tables, newTable];
        saveLocal('dineflow_tables', updated);
        set({ tables: updated });
        return { success: true };
      } catch (err) {
        return { success: false, message: err.message };
      }
    }
    const newTable = { _id: `t-${Date.now()}`, ...data, width: 80, height: 80, status: 'available' };
    const updated = [...tables, newTable];
    saveLocal('dineflow_tables', updated);
    set({ tables: updated });
    return { success: true };
  },

  deleteTable: async (id) => {
    const { mode, tables } = get();
    const token = localStorage.getItem('dineflow_token');
    if (mode === 'live' && token) try { await api.deleteTable(id, token); } catch {}
    const updated = tables.filter((t) => t._id !== id);
    saveLocal('dineflow_tables', updated);
    set({ tables: updated });
    return { success: true };
  },
}));

// Cross-store helpers
function getCartFromStore() {
  return useUIStore.getState().cart;
}
function clearCartInStore() {
  useUIStore.getState().clearCart();
}
function getUserFromStore() {
  return useAuthStore.getState().currentUser;
}
