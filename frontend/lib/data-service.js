// frontend/lib/data-service.js
// Handles API calls, localStorage persistence, and demo data fallback.
// Separated from the zustand store for better testability and separation of concerns.

import api, { checkHealth } from './api';
import { getInitialMockState } from './mock-data';
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';
import { STORAGE_KEYS, DEFAULTS, DATA_MODE } from './constants';

// ──────────────────────────────────────────────
// localStorage helpers
// ──────────────────────────────────────────────

const saveLocal = (key, value) => {
  if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(value));
};

const parseLocal = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};


// ──────────────────────────────────────────────
// Cross-store helpers
// ──────────────────────────────────────────────

export function getCartFromStore() {
  return useUIStore.getState().cart;
}

export function clearCartInStore() {
  useUIStore.getState().clearCart();
}

export function getUserFromStore() {
  return useAuthStore.getState().currentUser;
}

// ──────────────────────────────────────────────
// Health check & mode detection
// ──────────────────────────────────────────────

export async function detectMode() {
  try {
    const ok = await checkHealth();
    return ok ? 'live' : 'demo';
  } catch {
    return 'demo';
  }
}

// ──────────────────────────────────────────────
// Data loaders (return data, no state mutations)
// ──────────────────────────────────────────────

export function seedDemoDataIfNeeded() {
  if (typeof window === 'undefined') return false;
  if (localStorage.getItem(STORAGE_KEYS.SEEDED)) return false;

  const mock = getInitialMockState();
  saveLocal(STORAGE_KEYS.RESTAURANTS, mock.restaurants);
  saveLocal(STORAGE_KEYS.MENU, mock.menuItems);
  saveLocal(STORAGE_KEYS.TABLES, mock.tables);
  saveLocal(STORAGE_KEYS.RESERVATIONS, mock.reservations);
  saveLocal(STORAGE_KEYS.ORDERS, mock.orders);
  saveLocal(STORAGE_KEYS.ANALYTICS, mock.analytics);
  localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
  return true;
}

export function loadDemoData() {
  const mock = getInitialMockState();
  return {
    restaurants: parseLocal(STORAGE_KEYS.RESTAURANTS, mock.restaurants),
    menuItems: parseLocal(STORAGE_KEYS.MENU, mock.menuItems),
    tables: parseLocal(STORAGE_KEYS.TABLES, mock.tables),
    reservations: parseLocal(STORAGE_KEYS.RESERVATIONS, mock.reservations),
    orders: parseLocal(STORAGE_KEYS.ORDERS, mock.orders),
    analytics: parseLocal(STORAGE_KEYS.ANALYTICS, mock.analytics),
  };
}

export async function loadLiveData(token) {
  const restaurants = await api.getRestaurants();
  const menuItems = (
    await Promise.all(restaurants.map((r) => api.getRestaurantMenu(r._id).catch(() => [])))
  ).flat();
  saveLocal(STORAGE_KEYS.RESTAURANTS, restaurants);
  saveLocal(STORAGE_KEYS.MENU, menuItems);

  if (!token) return { restaurants, menuItems };

  const mock = getInitialMockState();
  const [tables, reservations, orders, summary, salesChart, reservationsChart] =
    await Promise.all([
      api.getTables(token).catch(() => []),
      api.getReservations(token).catch(() => []),
      api.getOrders(token).catch(() => []),
      api.analyticsSummary(token).catch(() => mock.analytics.summary),
      api.analyticsSalesChart(token).catch(() => mock.analytics.salesChart),
      api.analyticsReservationsChart(token).catch(() => mock.analytics.reservationsChart),
    ]);

  saveLocal(STORAGE_KEYS.TABLES, tables);
  saveLocal(STORAGE_KEYS.RESERVATIONS, reservations);
  saveLocal(STORAGE_KEYS.ORDERS, orders);

  return {
    restaurants,
    menuItems,
    tables,
    reservations,
    orders,
    analytics: { summary, salesChart, reservationsChart },
  };
}

// ──────────────────────────────────────────────
// Data mutators (handle API + local persistence)
// ──────────────────────────────────────────────

function getToken() {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

function getMode() {
  return localStorage.getItem('dineflow_mode') || 'demo';
}

/**
 * Try a live API call that returns data.
 * Returns { ok: true, data } on success,
 *         { ok: false, message } on API error,
 *         null if not in live mode (caller uses demo fallback).
 */
async function tryLiveCall(fn) {
  const mode = getMode();
  const token = getToken();
  if (mode !== 'live' || !token) return null;
  try {
    const result = await fn(token);
    return { ok: true, data: result };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

/**
 * Fire a live API call and ignore the result (fire-and-forget).
 * Returns true if call was attempted, false if not in live mode.
 */
async function tryFireForget(fn) {
  const mode = getMode();
  const token = getToken();
  if (mode !== 'live') return false;
  try { await fn(token); } catch { /* silent — local state always updated */ }
  return true;
}

export async function createReservation(data) {
  const reservations = parseLocal(STORAGE_KEYS.RESERVATIONS, []);

  const live = await tryLiveCall(t => api.createReservation(data, t));
  if (live) {
    if (!live.ok) return { success: false, message: live.message };
    const updated = [live.data, ...reservations];
    saveLocal(STORAGE_KEYS.RESERVATIONS, updated);
    return { success: true, data: live.data, list: updated };
  }

  const newRes = { _id: `rv-${Date.now()}`, ...data, status: 'confirmed' };
  const updated = [newRes, ...reservations];
  saveLocal(STORAGE_KEYS.RESERVATIONS, updated);
  return { success: true, data: newRes, list: updated };
}

export async function updateReservationStatus(id, status) {
  await tryFireForget(t => api.patchReservation(id, { status }, t));
  const reservations = parseLocal(STORAGE_KEYS.RESERVATIONS, []);
  const updated = reservations.map((r) => (r._id === id ? { ...r, status } : r));
  saveLocal(STORAGE_KEYS.RESERVATIONS, updated);
  return updated;
}

export async function checkout(paymentMethod = 'wallet') {
  const cart = getCartFromStore();
  const orders = parseLocal(STORAGE_KEYS.ORDERS, []);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal * 1.185;
  const orderData = {
    items: cart.map((c) => ({
      menuItemId: c._id,
      name: c.name,
      quantity: c.quantity,
      price: c.price,
    })),
    total: +total.toFixed(2),
    paymentMethod,
  };

  const live = await tryLiveCall(t => api.createOrder(orderData, t));
  if (live) {
    if (!live.ok) return { success: false, message: live.message };
    const updated = [live.data, ...orders];
    saveLocal(STORAGE_KEYS.ORDERS, updated);
    clearCartInStore();
    return { success: true, order: live.data, list: updated };
  }

  const newOrder = {
    _id: `ord-${Date.now()}`,
    ...orderData,
    status: 'preparing',
    createdAt: new Date().toISOString(),
  };
  const updated = [newOrder, ...orders];
  saveLocal(STORAGE_KEYS.ORDERS, updated);
  clearCartInStore();
  return { success: true, order: newOrder, list: updated };
}

export async function updateTableStatus(id, details) {
  await tryFireForget(t => api.patchTableStatus(id, details, t));
  const tables = parseLocal(STORAGE_KEYS.TABLES, []);
  const updated = tables.map((t) => (t._id === id ? { ...t, ...details } : t));
  saveLocal(STORAGE_KEYS.TABLES, updated);
  return updated;
}

export async function updateOrderStatus(id, status) {
  await tryFireForget(t => api.patchOrderStatus(id, status, t));
  const orders = parseLocal(STORAGE_KEYS.ORDERS, []);
  const updated = orders.map((o) => (o._id === id ? { ...o, status } : o));
  saveLocal(STORAGE_KEYS.ORDERS, updated);
  return updated;
}

export async function addMenuItem(item) {
  const currentUser = getUserFromStore();
  const restaurantId =
    currentUser?.ownerDetails?.restaurantId || currentUser?.staffDetails?.restaurantId;
  const menuItems = parseLocal(STORAGE_KEYS.MENU, []);

  if (restaurantId) {
    const live = await tryLiveCall(t => api.addMenuItem(restaurantId, item, t));
    if (live) {
      if (!live.ok) return { success: false, message: live.message };
      const updated = [...menuItems, live.data];
      saveLocal(STORAGE_KEYS.MENU, updated);
      return { success: true, data: live.data, list: updated };
    }
  }

  const newItem = {
    _id: `menu-${Date.now()}`,
    restaurantId: restaurantId || 'res-garden',
    ...item,
    rating: 4.5,
    reviewsCount: 1,
    status: 'in_stock',
  };
  const updated = [...menuItems, newItem];
  saveLocal(STORAGE_KEYS.MENU, updated);
  return { success: true, data: newItem, list: updated };
}

export async function addTable(data) {
  const tables = parseLocal(STORAGE_KEYS.TABLES, []);

  const live = await tryLiveCall(t => api.addTable(data, t));
  if (live) {
    if (!live.ok) return { success: false, message: live.message };
    const updated = [...tables, live.data];
    saveLocal(STORAGE_KEYS.TABLES, updated);
    return { success: true, data: live.data, list: updated };
  }

  const newTable = {
    _id: `t-${Date.now()}`,
    ...data,
    width: 80,
    height: 80,
    status: 'available',
  };
  const updated = [...tables, newTable];
  saveLocal(STORAGE_KEYS.TABLES, updated);
  return { success: true, data: newTable, list: updated };
}

export async function deleteTable(id) {
  await tryFireForget(t => api.deleteTable(id, t));
  const tables = parseLocal(STORAGE_KEYS.TABLES, []);
  const updated = tables.filter((t) => t._id !== id);
  saveLocal(STORAGE_KEYS.TABLES, updated);
  return updated;
}
