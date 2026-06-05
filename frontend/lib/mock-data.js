import { GARDEN_BISTRO_LAYOUT, SAKURA_SUSHI_LAYOUT } from './floor-layouts';

export const MOCK_RESTAURANTS = [
  {
    _id: 'res-garden',
    name: 'The Garden Bistro',
    description: 'Italian and Continental cuisines made from the freshest ingredients.',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
    logo: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=150',
    rating: 4.6,
    reviewsCount: 1240,
    cuisines: ['Italian', 'Continental'],
    address: '123 Green Street, New York, NY 10001',
    contactNumber: '(212) 555-1234',
    website: 'thegardenbistro.com',
    openingHours: '10:00 AM - 11:00 PM',
    settings: { taxes: 8.5, serviceCharges: 10.0 },
    categories: ['Appetizers', 'Pizzas', 'Pasta', 'Salads', 'Desserts', 'Beverages'],
  },
  {
    _id: 'res-sakura',
    name: 'Sakura Sushi',
    description: 'Authentic Japanese sushi and sashimi prepared by seasoned chefs.',
    coverImage: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200',
    logo: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=150',
    rating: 4.7,
    reviewsCount: 932,
    cuisines: ['Japanese', 'Sushi'],
    address: '12 East 41st Street, New York, NY 10017',
    contactNumber: '(212) 555-9876',
    website: 'sakurasushi.com',
    openingHours: '11:30 AM - 10:00 PM',
    settings: { taxes: 8.0, serviceCharges: 10.0 },
    categories: ['Sushi Rolls', 'Sashimi', 'Ramen', 'Appetizers', 'Desserts', 'Beverages'],
  },
];

function buildMockTables(restaurantId, layout, overrides = {}) {
  return layout.map((t, i) => ({
    _id: `t-${restaurantId}-${t.tableNumber}`,
    restaurantId,
    tableNumber: t.tableNumber,
    capacity: t.capacity,
    location: 'Main Floor',
    x: t.x,
    y: t.y,
    width: t.width,
    height: t.height,
    shape: t.shape,
    status: overrides[t.tableNumber]?.status || 'available',
    ...overrides[t.tableNumber],
  }));
}

export const MOCK_TABLES = [
  ...buildMockTables('res-garden', GARDEN_BISTRO_LAYOUT, {
    2: { status: 'occupied', currentDuration: 35, currentGuestName: 'Sarah Johnson', currentGuestsCount: 4, currentOrderTotal: 50.97, assignedServer: 'Alex Morgan' },
    3: { status: 'occupied', currentDuration: 22, currentGuestName: 'Mike Davis', currentGuestsCount: 3, currentOrderTotal: 34.5, assignedServer: 'Emma Wilson' },
    4: { status: 'reserved', currentGuestName: 'John Smith', currentGuestsCount: 2 },
    6: { status: 'occupied', currentDuration: 15, currentGuestName: 'Lisa Brown', currentGuestsCount: 2, currentOrderTotal: 28, assignedServer: 'David Lee' },
    8: { status: 'cleaning', currentDuration: 5 },
  }),
  ...buildMockTables('res-sakura', SAKURA_SUSHI_LAYOUT, {
    2: { status: 'occupied', currentGuestName: 'Tom H.', currentGuestsCount: 2, currentOrderTotal: 42 },
    5: { status: 'reserved', currentGuestName: 'Anna K.', currentGuestsCount: 4 },
  }),
];

export const MOCK_MENU = [
  { _id: 'menu-g1', restaurantId: 'res-garden', name: 'Truffle Mushroom Pasta', category: 'Pasta', price: 24.99, tags: ['Bestseller', 'Healthy'], image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400', stockLevel: 45, rating: 4.8 },
  { _id: 'menu-g2', restaurantId: 'res-garden', name: 'Margherita Pizza', category: 'Pizzas', price: 18.99, tags: ['Bestseller'], image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400', stockLevel: 80, rating: 4.7 },
  { _id: 'menu-g3', restaurantId: 'res-garden', name: 'Quinoa Avocado Salad', category: 'Salads', price: 16.99, tags: ['Healthy'], image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', stockLevel: 25, rating: 4.6 },
  { _id: 'menu-g4', restaurantId: 'res-garden', name: 'Classic Tiramisu', category: 'Desserts', price: 9.99, tags: ['Bestseller'], image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', stockLevel: 15, rating: 4.9 },
  { _id: 'menu-g5', restaurantId: 'res-garden', name: 'Sparkling Lemonade', category: 'Beverages', price: 5.99, tags: [], image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400', stockLevel: 100, rating: 4.5 },
  { _id: 'menu-s1', restaurantId: 'res-sakura', name: 'Dragon Roll', category: 'Sushi Rolls', price: 16.99, tags: ['Bestseller'], image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400', stockLevel: 40, rating: 4.8 },
  { _id: 'menu-s2', restaurantId: 'res-sakura', name: 'Salmon Sashimi', category: 'Sashimi', price: 22.99, tags: ['Healthy', 'Bestseller'], image: 'https://images.unsplash.com/photo-1563612262-2676381f4550?w=400', stockLevel: 30, rating: 4.9 },
  { _id: 'menu-s3', restaurantId: 'res-sakura', name: 'Tonkotsu Ramen', category: 'Ramen', price: 14.99, tags: [], image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400', stockLevel: 50, rating: 4.7 },
];

export const MOCK_RESERVATIONS = [
  { _id: 'rv-1', restaurantId: 'res-garden', restaurantName: 'The Garden Bistro', userId: 'u-customer', userName: 'Sarah Jenkins', tableNumber: 1, guestsCount: 2, reservationDate: '2026-06-10', reservationTime: '7:30 PM', status: 'confirmed', notes: 'Anniversary dinner' },
  { _id: 'rv-2', restaurantId: 'res-garden', restaurantName: 'The Garden Bistro', userId: 'u-customer', userName: 'Sarah Jenkins', tableNumber: 4, guestsCount: 2, reservationDate: '2026-06-05', reservationTime: '8:00 PM', status: 'confirmed' },
  { _id: 'rv-3', restaurantId: 'res-garden', restaurantName: 'The Garden Bistro', userId: 'u-customer', userName: 'Sarah Jenkins', guestsCount: 4, reservationDate: '2026-05-20', reservationTime: '7:00 PM', status: 'completed' },
  { _id: 'rv-4', restaurantId: 'res-garden', restaurantName: 'The Garden Bistro', userId: 'u-customer', userName: 'Sarah Jenkins', guestsCount: 2, reservationDate: '2026-04-15', reservationTime: '6:30 PM', status: 'cancelled' },
  { _id: 'rv-5', restaurantId: 'res-sakura', restaurantName: 'Sakura Sushi', userId: 'u-customer', userName: 'Sarah Jenkins', tableNumber: 5, guestsCount: 4, reservationDate: '2026-06-12', reservationTime: '6:00 PM', status: 'confirmed' },
];

export const MOCK_ORDERS = [
  { _id: 'ord-1', restaurantId: 'res-garden', restaurantName: 'The Garden Bistro', tableNumber: 2, items: [{ name: 'Truffle Mushroom Pasta', quantity: 1, price: 24.99 }], subtotal: 24.99, tax: 2.12, serviceCharge: 2.5, total: 29.61, status: 'new', paymentMethod: 'card', createdAt: new Date().toISOString() },
  { _id: 'ord-2', restaurantId: 'res-garden', restaurantName: 'The Garden Bistro', tableNumber: 6, items: [{ name: 'Margherita Pizza', quantity: 2, price: 18.99 }], subtotal: 37.98, tax: 3.23, serviceCharge: 3.8, total: 45.01, status: 'preparing', paymentMethod: 'wallet', createdAt: new Date().toISOString() },
  { _id: 'ord-3', restaurantId: 'res-garden', restaurantName: 'The Garden Bistro', tableNumber: 7, items: [{ name: 'Quinoa Avocado Salad', quantity: 1, price: 16.99 }], subtotal: 16.99, tax: 1.44, serviceCharge: 1.7, total: 20.13, status: 'ready', paymentMethod: 'mobile_money', createdAt: new Date().toISOString() },
  { _id: 'ord-4', restaurantId: 'res-sakura', restaurantName: 'Sakura Sushi', tableNumber: 2, items: [{ name: 'Dragon Roll', quantity: 1, price: 16.99 }], subtotal: 16.99, tax: 1.36, serviceCharge: 1.7, total: 20.05, status: 'served', paymentMethod: 'card', createdAt: new Date().toISOString() },
  { _id: 'ord-5', restaurantId: 'res-garden', restaurantName: 'The Garden Bistro', tableNumber: 10, items: [{ name: 'Classic Tiramisu', quantity: 2, price: 9.99 }], subtotal: 19.98, tax: 1.7, serviceCharge: 2.0, total: 23.68, status: 'paid', paymentMethod: 'wallet', createdAt: new Date().toISOString() },
];

export const MOCK_ANALYTICS = {
  summary: { revenue: 12650, orders: 128, reservations: 32, customers: 240, activeTables: 24, pendingOrders: 12 },
  salesChart: Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return { date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), sales: 800 + Math.round(Math.sin(i / 3) * 400) + i * 15 };
  }),
  reservationsChart: [
    { day: 'Mon', covers: 42 }, { day: 'Tue', covers: 38 }, { day: 'Wed', covers: 55 },
    { day: 'Thu', covers: 61 }, { day: 'Fri', covers: 88 }, { day: 'Sat', covers: 102 }, { day: 'Sun', covers: 76 },
  ],
};

export const DEMO_USER = {
  id: 'u-customer',
  name: 'Sarah Jenkins',
  email: 'customer@demo.com',
  role: 'customer',
  walletBalance: 250,
  customerDetails: { points: 350, loyaltyTier: 'Gold Member' },
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
};

export function getInitialMockState() {
  return {
    restaurants: MOCK_RESTAURANTS,
    menuItems: MOCK_MENU,
    tables: MOCK_TABLES,
    reservations: MOCK_RESERVATIONS,
    orders: MOCK_ORDERS,
    analytics: MOCK_ANALYTICS,
  };
}
