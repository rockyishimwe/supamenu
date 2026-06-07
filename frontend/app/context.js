"use client";
import { useEffect } from 'react';
import { useStore } from '../lib/store';
import ToastContainer from '../components/Toast';

export function DineFlowProvider({ children }) {
  const hydrate = useStore((s) => s.hydrate);
  const hydrated = useStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrate, hydrated]);

  return <>
    {children}
    <ToastContainer />
  </>;
}

export function useDineFlow() {
  const store = useStore();
  return {
    token: store.token,
    currentUser: store.currentUser,
    activeRole: store.activeRole,
    restaurants: store.restaurants,
    menuItems: store.menuItems,
    tables: store.tables,
    reservations: store.reservations,
    orders: store.orders,
    cart: store.cart,
    loading: store.loading,
    mode: store.mode,
    analytics: store.analytics,
    selectedTableId: store.selectedTableId,
    sidebarCollapsed: store.sidebarCollapsed,
    login: store.login,
    register: store.register,
    logout: store.logout,
    topUpWallet: store.topUpWallet,
    createReservation: store.createReservation,
    updateReservationStatus: store.updateReservationStatus,
    addToCart: store.addToCart,
    removeFromCart: store.removeFromCart,
    updateCartQty: store.updateCartQty,
    clearCart: store.clearCart,
    checkout: store.checkout,
    updateTableStatus: store.updateTableStatus,
    updateOrderStatus: store.updateOrderStatus,
    addMenuItem: store.addMenuItem,
    setActiveRole: store.setActiveRole,
    setSelectedTableId: store.setSelectedTableId,
    setSidebarCollapsed: store.setSidebarCollapsed,
    addTable: store.addTable,
    deleteTable: store.deleteTable,
  };
}
