import { create } from 'zustand';
import api, { checkHealth } from './api';
import { getInitialMockState, DEMO_USER } from './mock-data';

const saveLocal = (key, value) => {
  if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(value));
};

const parseJson = (raw, fallback) => {
  if (!raw || raw === 'null') return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const parseLocal = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  return parseJson(localStorage.getItem(key), fallback);
};

// Set cookies that the proxy can read on the server side
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

export const useStore = create((set, get) => {
  // Helper: try API call in live mode, return null to fallback to demo
  async function callAPI(apiCall, tokenRequired = true) {
    const { mode, token } = get();
    if (mode === 'live' && (!tokenRequired || token)) {
      try {
        return await apiCall(token);
      } catch (err) {
        return { _error: err.message };
      }
    }
    return null;
  }

  return {
  mode: 'demo',
  hydrated: false,
  loading: true,
  token: null,
  currentUser: null,
  activeRole: 'customer',
  restaurants: [],
  menuItems: [],
  tables: [],
  reservations: [],
  orders: [],
  cart: [],
  analytics: null,
  selectedTableId: null,
  sidebarCollapsed: false,

  hydrate: async () => {
    const mock = getInitialMockState();

    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('dineflow_token') : null;
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('dineflow_user') : null;
    const storedRole = typeof window !== 'undefined' ? localStorage.getItem('dineflow_role') : null;
    const storedCart = typeof window !== 'undefined' ? localStorage.getItem('dineflow_cart') : null;

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
      token: storedToken,
      currentUser: parseJson(storedUser, null),
      activeRole: storedRole || 'customer',
      cart: parseJson(storedCart, []),
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
      const menuItems = (
        await Promise.all(restaurants.map((r) => api.getRestaurantMenu(r._id).catch(() => [])))
      ).flat();
      set({ restaurants, menuItems });
      saveLocal('dineflow_restaurants', restaurants);
      saveLocal('dineflow_menu', menuItems);

      if (!storedToken) return;

      const [tables, reservations, orders, summary, salesChart, reservationsChart] = await Promise.all([
        api.getTables(storedToken),
        api.getReservations(storedToken),
        api.getOrders(storedToken),
        api.analyticsSummary(storedToken).catch(() => mock.analytics.summary),
        api.analyticsSalesChart(storedToken).catch(() => mock.analytics.salesChart),
        api.analyticsReservationsChart(storedToken).catch(() => mock.analytics.reservationsChart),
      ]);

      set({
        tables,
        reservations,
        orders,
        analytics: { summary, salesChart, reservationsChart },
      });

      saveLocal('dineflow_tables', tables);
      saveLocal('dineflow_reservations', reservations);
      saveLocal('dineflow_orders', orders);
    } catch {
    }
  },

  setSelectedTableId: (id) => set({ selectedTableId: id }),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
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
        return { success: false, message: err.message };
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
        return { success: false, message: err.message };
      }
    }

    const id = `u-${Date.now()}`;
    let user;

    if (role === 'staff') {
      user = { ...DEMO_USER, id, name, email, role: 'staff', staffDetails: { role: 'Waiter', restaurantCode: restaurantCode || '' } };
    } else if (role === 'owner') {
      user = { ...DEMO_USER, id, name, email, role: 'owner', ownerDetails: { restaurantId: 'res-new' } };
    } else {
      user = { ...DEMO_USER, id, name, email, role: 'customer', walletBalance: 120.0, customerDetails: { points: 0, loyaltyTier: 'Bronze' } };
    }

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

  createReservation: async (data) => {
    const { mode, token, currentUser, reservations, tables } = get();
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
    const newRes = { _id: `rv-${Date.now()}`, ...data, userId: currentUser?.id, status: 'confirmed' };
    const updated = [newRes, ...reservations];
    saveLocal('dineflow_reservations', updated);
    set({ reservations: updated });
    return { success: true };
  },

  updateReservationStatus: async (id, status) => {
    const { mode, token, reservations } = get();
    if (mode === 'live' && token) await api.patchReservation(id, { status }, token).catch(() => {});
    const updated = reservations.map((r) => (r._id === id ? { ...r, status } : r));
    saveLocal('dineflow_reservations', updated);
    set({ reservations: updated });
  },

  checkout: async (paymentMethod = 'wallet') => {
    const { cart, currentUser, orders, mode, token } = get();
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const total = subtotal * 1.185;
    const orderData = {
      items: cart.map((c) => ({ menuItemId: c._id, name: c.name, quantity: c.quantity, price: c.price })),
      total: +total.toFixed(2),
      paymentMethod,
    };
    if (mode === 'live' && token) {
      try {
        const newOrder = await api.createOrder(orderData, token);
        const updated = [newOrder, ...orders];
        saveLocal('dineflow_orders', updated);
        get().clearCart();
        set({ orders: updated });
        return { success: true, order: newOrder };
      } catch (err) {
        return { success: false, message: err.message };
      }
    }
    const newOrder = { _id: `ord-${Date.now()}`, ...orderData, status: 'preparing', createdAt: new Date().toISOString() };
    const updated = [newOrder, ...orders];
    saveLocal('dineflow_orders', updated);
    get().clearCart();
    set({ orders: updated });
    return { success: true, order: newOrder };
  },

  updateTableStatus: async (id, details) => {
    const { mode, token, tables } = get();
    if (mode === 'live') await api.patchTableStatus(id, details, token).catch(() => {});
    const updated = tables.map((t) => (t._id === id ? { ...t, ...details } : t));
    saveLocal('dineflow_tables', updated);
    set({ tables: updated });
  },

  updateOrderStatus: async (id, status) => {
    const { mode, token, orders } = get();
    if (mode === 'live' && token) await api.patchOrderStatus(id, status, token).catch(() => {});
    const updated = orders.map((o) => (o._id === id ? { ...o, status } : o));
    saveLocal('dineflow_orders', updated);
    set({ orders: updated });
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

  addMenuItem: async (item) => {
    const { mode, token, currentUser, menuItems } = get();
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
    const { mode, token, tables } = get();
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
    const { mode, token, tables } = get();
    if (mode === 'live' && token) try { await api.deleteTable(id, token); } catch {}
    const updated = tables.filter((t) => t._id !== id);
    saveLocal('dineflow_tables', updated);
    set({ tables: updated });
    return { success: true };
  },
};

});

export const useRestaurants = () => useStore((s) => s.restaurants);
export const useTables = () => useStore((s) => s.tables);
export const useOrders = () => useStore((s) => s.orders);
export const useReservations = () => useStore((s) => s.reservations);
export const useUser = () => useStore((s) => ({ user: s.currentUser, role: s.activeRole }));
export const useCart = () => useStore((s) => ({ cart: s.cart, addToCart: s.addToCart, removeFromCart: s.removeFromCart, updateCartQty: s.updateCartQty, clearCart: s.clearCart }));
export const useAnalytics = () => useStore((s) => s.analytics);
