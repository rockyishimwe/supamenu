// frontend/lib/constants.js
// Centralized constants for the DineFlow frontend

// ──────────────────────────────────────────────
// Theme
// ──────────────────────────────────────────────
export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
};

// ──────────────────────────────────────────────
// Data mode
// ──────────────────────────────────────────────
export const DATA_MODE = {
  DEMO: 'demo',
  LIVE: 'live',
};

// ──────────────────────────────────────────────
// User roles
// ──────────────────────────────────────────────
export const USER_ROLES = {
  CUSTOMER: 'customer',
  STAFF: 'staff',
  OWNER: 'owner',
};

// ──────────────────────────────────────────────
// Staff sub-roles
// ──────────────────────────────────────────────
export const STAFF_ROLES = {
  WAITER: 'Waiter',
  CASHIER: 'Cashier',
  KITCHEN: 'Kitchen Staff',
  MANAGER: 'Manager',
};

// ──────────────────────────────────────────────
// Reservation statuses
// ──────────────────────────────────────────────
export const RESERVATION_STATUS = {
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
};

// ──────────────────────────────────────────────
// Table statuses
// ──────────────────────────────────────────────
export const TABLE_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  CLEANING: 'cleaning',
};

// ──────────────────────────────────────────────
// Order statuses
// ──────────────────────────────────────────────
export const ORDER_STATUS = {
  NEW: 'new',
  PREPARING: 'preparing',
  READY: 'ready',
  SERVED: 'served',
  PAID: 'paid',
};

// ──────────────────────────────────────────────
// Payment methods
// ──────────────────────────────────────────────
export const PAYMENT_METHODS = {
  CARD: 'card',
  WALLET: 'wallet',
  MOBILE_MONEY: 'mobile_money',
};

// ──────────────────────────────────────────────
// Menu item statuses
// ──────────────────────────────────────────────
export const MENU_STATUS = {
  IN_STOCK: 'in_stock',
  OUT_OF_STOCK: 'out_of_stock',
};

// ──────────────────────────────────────────────
// localStorage keys
// ──────────────────────────────────────────────
export const STORAGE_KEYS = {
  TOKEN: 'dineflow_token',
  THEME: 'dineflow_theme',
  SEEDED: 'dineflow_seeded',
  MODE: 'dineflow_mode',
  RESTAURANTS: 'dineflow_restaurants',
  MENU: 'dineflow_menu',
  TABLES: 'dineflow_tables',
  RESERVATIONS: 'dineflow_reservations',
  ORDERS: 'dineflow_orders',
  ANALYTICS: 'dineflow_analytics',
};

// ──────────────────────────────────────────────
// Category filter
// ──────────────────────────────────────────────
export const CATEGORY_ALL = 'All';

// ──────────────────────────────────────────────
// Loyalty tiers
// ──────────────────────────────────────────────
export const LOYALTY_TIERS = {
  GOLD: 'Gold Member',
  SILVER: 'Silver Member',
  BRONZE: 'Bronze Member',
};

// ──────────────────────────────────────────────
// Default values
// ──────────────────────────────────────────────
export const DEFAULTS = {
  WALLET_BALANCE: 128.50,
  LOYALTY_POINTS: 350,
  LOYALTY_TIER: 'Gold Member',
  TABLE_WIDTH: 80,
  TABLE_HEIGHT: 80,
  TAX_RATE: 8.5,
  SERVICE_CHARGE: 10.0,
  TOKEN_EXPIRY: '7d',
};
