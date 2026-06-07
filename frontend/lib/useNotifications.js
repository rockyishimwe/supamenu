import { create } from 'zustand';

let notifId = 0;

export const useNotificationStore = create((set, get) => ({
  notifications: [],

  addNotification: ({ title, message, type = 'info', link = null }) => {
    const id = ++notifId;
    set((state) => ({
      notifications: [
        { id, title, message, type, link, read: false, timestamp: new Date().toISOString() },
        ...state.notifications,
      ],
    }));
    return id;
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  clearAll: () => {
    set({ notifications: [] });
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.read).length;
  },
}));
