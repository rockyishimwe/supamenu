"use client";
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore, useDataStore, useUIStore } from '../lib/store';
import { useNotificationStore } from '../lib/useNotifications';
import { useThemeStore } from '../lib/useTheme';
import ToastContainer from '../components/Toast';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

export function DineFlowProvider({ children }) {
  const hydrate = useDataStore((s) => s.hydrate);
  const hydrated = useDataStore((s) => s.hydrated);
  const hydrateAuth = useAuthStore((s) => s.hydrateAuth);
  const hydrateUI = useUIStore((s) => s.hydrateUI);
  const initTheme = useThemeStore((s) => s.initTheme);
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    initTheme();
    hydrateAuth();
    hydrateUI();
    if (!hydrated) hydrate();

    // Seed sample notifications
    if (!localStorage.getItem('dineflow_notif_seeded')) {
      addNotification({ title: 'Welcome to DineFlow!', message: 'Explore restaurants and place your first order.', type: 'info' });
      addNotification({ title: 'Wallet Credit', message: 'You received $10 bonus for signing up!', type: 'payment' });
      addNotification({ title: 'Reservation Reminder', message: 'Your table at The Garden Bistro is tomorrow at 7pm.', type: 'reservation' });
      localStorage.setItem('dineflow_notif_seeded', 'true');
    }
  }, [hydrate, hydrated, hydrateAuth, hydrateUI, initTheme, addNotification]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToastContainer />
    </QueryClientProvider>
  );
}

export function useDineFlow() {
  const auth = useAuthStore();
  const data = useDataStore();
  const ui = useUIStore();
  return {
    token: auth.token,
    currentUser: auth.currentUser,
    activeRole: auth.activeRole,
    login: auth.login,
    register: auth.register,
    logout: auth.logout,
    topUpWallet: auth.topUpWallet,
    updateProfile: auth.updateProfile,
    setActiveRole: auth.setActiveRole,

    restaurants: data.restaurants,
    menuItems: data.menuItems,
    tables: data.tables,
    reservations: data.reservations,
    orders: data.orders,
    loading: data.loading,
    mode: data.mode,
    analytics: data.analytics,
    createReservation: data.createReservation,
    updateReservationStatus: data.updateReservationStatus,
    checkout: data.checkout,
    updateTableStatus: data.updateTableStatus,
    updateOrderStatus: data.updateOrderStatus,
    addMenuItem: data.addMenuItem,
    addTable: data.addTable,
    deleteTable: data.deleteTable,

    selectedTableId: ui.selectedTableId,
    sidebarCollapsed: ui.sidebarCollapsed,
    cart: ui.cart,
    addToCart: ui.addToCart,
    removeFromCart: ui.removeFromCart,
    updateCartQty: ui.updateCartQty,
    clearCart: ui.clearCart,
    setSelectedTableId: ui.setSelectedTableId,
    setSidebarCollapsed: ui.setSidebarCollapsed,
  };
}
