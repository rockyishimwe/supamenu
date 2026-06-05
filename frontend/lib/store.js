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

export const useStore = create((set, get) => ({
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

    // Seed localStorage if first time
    if (typeof window !== 'undefined' && !localStorage.getItem('dineflow_seeded')) {
      saveLocal('dineflow_restaurants', mock.restaurants);
      saveLocal('dineflow_menu', mock.menuItems);
      saveLocal('dineflow_tables', mock.tables);
      saveLocal('dineflow_reservations', mock.reservations);
      saveLocal('dineflow_orders', mock.orders);
      saveLocal('dineflow_analytics', mock.analytics);
      localStorage.setItem('dineflow_seeded', 'true');
    }

    // Set demo state immediately — page renders NOW, no waiting
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

    // Check backend in background AFTER page already rendered
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
        api.getTables(),
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
      // backend unreachable, already in demo mode, nothing to do
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
        set({ token: data.token, currentUser: data.user, activeRole: data.user.role });
        return { success: true };
      } catch (err) {
        return { success: false, message: err.message };
      }
    }
    // Demo mode login — use role-based demo names
    const names = { customer: 'Sarah Jenkins', staff: 'Alex Morgan', owner: 'John Doe' };
    const user = { ...DEMO_USER, id: `u-${role}`, name: names[role] || 'Guest', email, role };
    localStorage.setItem('dineflow_token', `mock-${role}`);
    localStorage.setItem('dineflow_user', JSON.stringify(user));
    localStorage.setItem('dineflow_role', role);
    set({ token: `mock-${role}`, currentUser: user, activeRole: role });
    return { success: true };
  },

  // ✅ FIXED: register now properly saves the user's actual name
  register: async (name, email, password, role = 'customer') => {
    const { mode } = get();

    if (mode === 'live') {
      try {
        const data = await api.register({ name, email, password, role });
        localStorage.setItem('dineflow_token', data.token);
        localStorage.setItem('dineflow_user', JSON.stringify(data.user));
        localStorage.setItem('dineflow_role', data.user.role);
        set({ token: data.token, currentUser: data.user, activeRole: data.user.role });
        return { success: true };
      } catch (err) {
        return { success: false, message: err.message };
      }
    }

    // Demo mode — create user with the actual name they entered
    const user = {
      ...DEMO_USER,
      id: `u-${Date.now()}`,
      name,
      email,
      role,
      walletBalance: 120.00,
      customerDetails: {
        points: 0,
        loyaltyTier: 'Bronze',
        totalOrders: 0,
      },
    };
    localStorage.setItem('dineflow_token', `mock-${role}`);
    localStorage.setItem('dineflow_user', JSON.stringify(user));
    localStorage.setItem('dineflow_role', role);
    set({ token: `mock-${role}`, currentUser: user, activeRole: role });
    return { success: true };
  },

  logout: () => {
    localStorage.removeItem('dineflow_token');
    localStorage.removeItem('dineflow_user');
    localStorage.removeItem('dineflow_role');
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
    const newRes = {
      _id: `rv-${Date.now()}`,
      restaurantId: data.restaurantId || 'res-garden',
      restaurantName: data.restaurantName || 'The Garden Bistro',
      userId: currentUser?.id,
      userName: currentUser?.name || 'Guest',
      ...data,
      status: 'confirmed',
    };
    const updated = [newRes, ...reservations];
    saveLocal('dineflow_reservations', updated);
    if (data.tableNumber) {
      const restaurantId = data.restaurantId || newRes.restaurantId;
      const updatedTables = tables.map((t) =>
        t.restaurantId === restaurantId && t.tableNumber === data.tableNumber
          ? { ...t, status: 'reserved', currentGuestName: currentUser?.name }
          : t
      );
      saveLocal('dineflow_tables', updatedTables);
      set({ reservations: updated, tables: updatedTables });
    } else {
      set({ reservations: updated });
    }
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
    const tax = subtotal * 0.085;
    const serviceCharge = subtotal * 0.1;
    const total = subtotal + tax + serviceCharge;
    const orderData = {
      restaurantId: cart[0]?.restaurantId || 'res-garden',
      restaurantName: 'The Garden Bistro',
      tableNumber: 2,
      items: cart.map((c) => ({ menuItemId: c._id, name: c.name, quantity: c.quantity, price: c.price })),
      subtotal: +subtotal.toFixed(2),
      tax: +tax.toFixed(2),
      serviceCharge: +serviceCharge.toFixed(2),
      total: +total.toFixed(2),
      paymentMethod,
    };
    if (paymentMethod === 'wallet' && currentUser && currentUser.walletBalance < total) {
      return { success: false, message: 'Insufficient wallet balance' };
    }
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
    if (paymentMethod === 'wallet' && currentUser) {
      const updatedUser = {
        ...currentUser,
        walletBalance: +(currentUser.walletBalance - total).toFixed(2),
        customerDetails: {
          ...currentUser.customerDetails,
          points: currentUser.customerDetails.points + Math.floor(total),
        },
      };
      localStorage.setItem('dineflow_user', JSON.stringify(updatedUser));
      set({ currentUser: updatedUser });
    }
    const newOrder = {
      _id: `ord-${Date.now()}`,
      ...orderData,
      status: paymentMethod === 'wallet' ? 'preparing' : 'new',
      createdAt: new Date().toISOString(),
    };
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

  addMenuItem: (item) => {
    const newItem = { _id: `menu-${Date.now()}`, restaurantId: 'res-garden', ...item, rating: 4.5, reviewsCount: 1 };
    const updated = [...get().menuItems, newItem];
    saveLocal('dineflow_menu', updated);
    set({ menuItems: updated });
  },

  topUpWallet: (amount) => {
    const { currentUser } = get();
    if (!currentUser) return;
    const updated = { ...currentUser, walletBalance: currentUser.walletBalance + parseFloat(amount) };
    localStorage.setItem('dineflow_user', JSON.stringify(updated));
    set({ currentUser: updated });
  },

  addTable: async (data) => {
    const { mode, token, tables, restaurants } = get();
    const restaurantId = data.restaurantId || restaurants[0]?._id;
    const payload = {
      restaurantId,
      tableNumber: parseInt(data.tableNumber, 10),
      capacity: parseInt(data.capacity, 10) || 4,
      location: data.location || 'Main Floor',
      x: parseFloat(data.x) || 0,
      y: parseFloat(data.y) || 0,
      shape: data.shape || 'square',
    };

    if (mode === 'live' && token) {
      try {
        const newTable = await api.addTable(payload, token);
        const updated = [...tables, newTable];
        saveLocal('dineflow_tables', updated);
        set({ tables: updated });
        return { success: true };
      } catch (err) {
        return { success: false, message: err.message };
      }
    }

    const newTable = {
      _id: `t-${Date.now()}`,
      ...payload,
      width: 80,
      height: 80,
      status: 'available',
    };
    const updated = [...tables, newTable];
    saveLocal('dineflow_tables', updated);
    set({ tables: updated });
    return { success: true };
  },

  deleteTable: async (id) => {
    const { mode, token, tables } = get();

    if (mode === 'live' && token) {
      try {
        await api.deleteTable(id, token);
      } catch (err) {
        return { success: false, message: err.message };
      }
    }

    const updated = tables.filter((t) => t._id !== id);
    saveLocal('dineflow_tables', updated);
    set({ tables: updated });
    return { success: true };
  },
}));

export const useRestaurants = () => useStore((s) => s.restaurants);
export const useTables = () => useStore((s) => s.tables);
export const useOrders = () => useStore((s) => s.orders);
export const useReservations = () => useStore((s) => s.reservations);
export const useUser = () => useStore((s) => ({ user: s.currentUser, role: s.activeRole }));
export const useCart = () => useStore((s) => ({ cart: s.cart, addToCart: s.addToCart, removeFromCart: s.removeFromCart, updateCartQty: s.updateCartQty, clearCart: s.clearCart }));
export const useAnalytics = () => useStore((s) => s.analytics);