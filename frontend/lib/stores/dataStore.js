import { create } from 'zustand';
import * as dataService from '../data-service';

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
    // Seed demo data on first visit
    dataService.seedDemoDataIfNeeded();

    // Load demo data from localStorage
    const demoData = dataService.loadDemoData();
    set({
      mode: 'demo',
      hydrated: true,
      loading: false,
      ...demoData,
    });

    // Try to connect to live backend
    const mode = await dataService.detectMode();
    if (mode !== 'live') return;
    set({ mode: 'live' });

    const storedToken = localStorage.getItem('dineflow_token');

    try {
      const liveData = await dataService.loadLiveData(storedToken);
      set(liveData);
    } catch {
      // backend unreachable — stick with demo data
    }
  },

  createReservation: async (data) => {
    const result = await dataService.createReservation(data);
    if (result.success) {
      set({ reservations: result.list });
      return { success: true };
    }
    return { success: false, message: result.message };
  },

  updateReservationStatus: async (id, status) => {
    const updated = await dataService.updateReservationStatus(id, status);
    set({ reservations: updated });
  },

  checkout: async (paymentMethod = 'wallet') => {
    const result = await dataService.checkout(paymentMethod);
    if (result.success) {
      set({ orders: result.list });
      return { success: true, order: result.order };
    }
    return { success: false, message: result.message };
  },

  updateTableStatus: async (id, details) => {
    const updated = await dataService.updateTableStatus(id, details);
    set({ tables: updated });
  },

  updateOrderStatus: async (id, status) => {
    const updated = await dataService.updateOrderStatus(id, status);
    set({ orders: updated });
  },

  addMenuItem: async (item) => {
    const result = await dataService.addMenuItem(item);
    if (result.success) {
      set({ menuItems: result.list });
      return { success: true };
    }
    return { success: false, message: result.message };
  },

  addTable: async (data) => {
    const result = await dataService.addTable(data);
    if (result.success) {
      set({ tables: result.list });
      return { success: true };
    }
    return { success: false, message: result.message };
  },

  deleteTable: async (id) => {
    const updated = await dataService.deleteTable(id);
    set({ tables: updated });
    return { success: true };
  },
}));
