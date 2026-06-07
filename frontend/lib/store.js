// Domain stores (split for maintainability)
import { useAuthStore } from './stores/authStore';
import { useDataStore } from './stores/dataStore';
import { useUIStore } from './stores/uiStore';

export { useAuthStore, useDataStore, useUIStore };

// Legacy combined store — keeps all existing imports working
export function useStore() {
  return { ...useAuthStore(), ...useDataStore(), ...useUIStore() };
}

// Convenience selectors (backward-compatible)
export const useRestaurants = () => useDataStore((s) => s.restaurants);
export const useTables = () => useDataStore((s) => s.tables);
export const useOrders = () => useDataStore((s) => s.orders);
export const useReservations = () => useDataStore((s) => s.reservations);
export const useUser = () => {
  const { currentUser, activeRole } = useAuthStore();
  return { user: currentUser, role: activeRole };
};
export const useCart = () => {
  const s = useUIStore();
  return { cart: s.cart, addToCart: s.addToCart, removeFromCart: s.removeFromCart, updateCartQty: s.updateCartQty, clearCart: s.clearCart };
};
export const useAnalytics = () => useDataStore((s) => s.analytics);
