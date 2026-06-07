const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { GARDEN_BISTRO_LAYOUT, SAKURA_SUSHI_LAYOUT } = require('./seed/floor-layouts');
const logger = require('./utils/logger');

dotenv.config();

const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const Table = require('./models/Table');
const MenuItem = require('./models/MenuItem');
const Reservation = require('./models/Reservation');
const Order = require('./models/Order');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dineflow';

const DEMO_PASSWORD = 'password123';

function buildTables(restaurantId, layout, statusOverrides = {}) {
  return layout.map((t) => ({
    restaurantId,
    tableNumber: t.tableNumber,
    capacity: t.capacity,
    location: 'Main Floor',
    x: t.x,
    y: t.y,
    width: t.width,
    height: t.height,
    shape: t.shape,
    status: statusOverrides[t.tableNumber]?.status || 'available',
    ...statusOverrides[t.tableNumber],
  }));
}

const GARDEN_MENU = [
  { name: 'Truffle Mushroom Pasta', category: 'Pasta', price: 24.99, tags: ['Bestseller', 'Healthy'], image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400', stockLevel: 45 },
  { name: 'Margherita Pizza', category: 'Pizzas', price: 18.99, tags: ['Bestseller'], image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400', stockLevel: 80 },
  { name: 'Quinoa Avocado Salad', category: 'Salads', price: 16.99, tags: ['Healthy'], image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', stockLevel: 25 },
  { name: 'Classic Tiramisu', category: 'Desserts', price: 9.99, tags: ['Bestseller'], image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', stockLevel: 15 },
  { name: 'Sparkling Lemonade', category: 'Beverages', price: 5.99, tags: [], image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400', stockLevel: 100 },
  { name: 'Garlic Bread', category: 'Appetizers', price: 7.99, tags: [], image: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=400', stockLevel: 60 },
];

const SAKURA_MENU = [
  { name: 'Dragon Roll', category: 'Sushi Rolls', price: 16.99, tags: ['Bestseller'], image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400', stockLevel: 40 },
  { name: 'Salmon Sashimi', category: 'Sashimi', price: 22.99, tags: ['Healthy', 'Bestseller'], image: 'https://images.unsplash.com/photo-1563612262-2676381f4550?w=400', stockLevel: 30 },
  { name: 'Tonkotsu Ramen', category: 'Ramen', price: 14.99, tags: [], image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400', stockLevel: 50 },
  { name: 'Edamame', category: 'Appetizers', price: 6.99, tags: ['Healthy'], image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', stockLevel: 80 },
  { name: 'Mochi Ice Cream', category: 'Desserts', price: 8.99, tags: [], image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', stockLevel: 35 },
  { name: 'Green Tea', category: 'Beverages', price: 3.99, tags: ['Healthy'], image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9de57?w=400', stockLevel: 120 },
];

async function seedDatabase({ force = false } = {}) {
  await mongoose.connect(MONGO_URI);
  logger.info('Connected to MongoDB for seeding...');

  const restaurantCount = await Restaurant.countDocuments();

  if (!force && restaurantCount > 0) {
    logger.info('Database already seeded. Skipping.');
    return { skipped: true };
  }

  if (force) {
    await Promise.all([
      User.deleteMany({}),
      Restaurant.deleteMany({}),
      Table.deleteMany({}),
      MenuItem.deleteMany({}),
      Reservation.deleteMany({}),
      Order.deleteMany({}),
    ]);
    logger.info('Existing data cleared.');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, salt);

  const customer = await User.create({
    name: 'Sarah Jenkins',
    email: 'customer@demo.com',
    password: hashedPassword,
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    walletBalance: 250.0,
    customerDetails: { points: 350, loyaltyTier: 'Gold Member' },
  });

  const gardenOwner = await User.create({
    name: 'John Doe',
    email: 'owner@garden.com',
    password: hashedPassword,
    role: 'owner',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  });

  const sakuraOwner = await User.create({
    name: 'Yuki Tanaka',
    email: 'owner@sakura.com',
    password: hashedPassword,
    role: 'owner',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  });

  const garden = await Restaurant.create({
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
    owner: gardenOwner._id,
  });

  const sakura = await Restaurant.create({
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
    owner: sakuraOwner._id,
  });

  const gardenStaff = await User.insertMany([
    { name: 'Alex Morgan', email: 'staff@garden.com', password: hashedPassword, role: 'staff', staffDetails: { role: 'Waiter', restaurantId: garden._id } },
    { name: 'Emma Wilson', email: 'emma@garden.com', password: hashedPassword, role: 'staff', staffDetails: { role: 'Waiter', restaurantId: garden._id } },
    { name: 'David Lee', email: 'david@garden.com', password: hashedPassword, role: 'staff', staffDetails: { role: 'Manager', restaurantId: garden._id } },
  ]);

  await User.insertMany([
    { name: 'Ken Sato', email: 'staff@sakura.com', password: hashedPassword, role: 'staff', staffDetails: { role: 'Kitchen Staff', restaurantId: sakura._id } },
    { name: 'Mia Chen', email: 'mia@sakura.com', password: hashedPassword, role: 'staff', staffDetails: { role: 'Waiter', restaurantId: sakura._id } },
    { name: 'Leo Park', email: 'leo@sakura.com', password: hashedPassword, role: 'staff', staffDetails: { role: 'Cashier', restaurantId: sakura._id } },
  ]);

  const gardenTables = await Table.insertMany(
    buildTables(garden._id, GARDEN_BISTRO_LAYOUT, {
      2: { status: 'occupied', currentDuration: 35, currentGuestName: 'Sarah Johnson', currentGuestsCount: 4, currentOrderTotal: 50.97, assignedServer: 'Alex Morgan' },
      3: { status: 'occupied', currentDuration: 22, currentGuestName: 'Mike Davis', currentGuestsCount: 3, currentOrderTotal: 34.5, assignedServer: 'Emma Wilson' },
      4: { status: 'reserved', currentGuestName: 'John Smith', currentGuestsCount: 2 },
      6: { status: 'occupied', currentDuration: 15, currentGuestName: 'Lisa Brown', currentGuestsCount: 2, currentOrderTotal: 28, assignedServer: 'David Lee' },
      8: { status: 'cleaning', currentDuration: 5 },
    })
  );

  const sakuraTables = await Table.insertMany(buildTables(sakura._id, SAKURA_SUSHI_LAYOUT, {
    2: { status: 'occupied', currentGuestName: 'Tom H.', currentGuestsCount: 2, currentOrderTotal: 42 },
    5: { status: 'reserved', currentGuestName: 'Anna K.', currentGuestsCount: 4 },
  }));

  const gardenMenuDocs = await MenuItem.insertMany(
    GARDEN_MENU.map((m) => ({ ...m, restaurantId: garden._id, status: 'in_stock', rating: 4.5 + Math.random() * 0.4, reviewsCount: Math.floor(Math.random() * 300) + 50 }))
  );

  const sakuraMenuDocs = await MenuItem.insertMany(
    SAKURA_MENU.map((m) => ({ ...m, restaurantId: sakura._id, status: 'in_stock', rating: 4.5 + Math.random() * 0.4, reviewsCount: Math.floor(Math.random() * 300) + 50 }))
  );

  const reservations = await Reservation.insertMany([
    { restaurantId: garden._id, restaurantName: garden.name, userId: customer._id, userName: customer.name, tableId: gardenTables[0]._id, tableNumber: 1, guestsCount: 2, reservationDate: '2026-06-10', reservationTime: '7:30 PM', status: 'confirmed', notes: 'Anniversary dinner' },
    { restaurantId: garden._id, restaurantName: garden.name, userId: customer._id, userName: customer.name, tableId: gardenTables[3]._id, tableNumber: 4, guestsCount: 2, reservationDate: '2026-06-05', reservationTime: '8:00 PM', status: 'confirmed', notes: '' },
    { restaurantId: garden._id, restaurantName: garden.name, userId: customer._id, userName: customer.name, guestsCount: 4, reservationDate: '2026-05-20', reservationTime: '7:00 PM', status: 'completed' },
    { restaurantId: garden._id, restaurantName: garden.name, userId: customer._id, userName: customer.name, guestsCount: 2, reservationDate: '2026-04-15', reservationTime: '6:30 PM', status: 'cancelled' },
    { restaurantId: sakura._id, restaurantName: sakura.name, userId: customer._id, userName: customer.name, tableId: sakuraTables[4]._id, tableNumber: 5, guestsCount: 4, reservationDate: '2026-06-12', reservationTime: '6:00 PM', status: 'confirmed' },
    { restaurantId: sakura._id, restaurantName: sakura.name, userId: customer._id, userName: customer.name, guestsCount: 2, reservationDate: '2026-06-08', reservationTime: '7:00 PM', status: 'confirmed' },
    { restaurantId: garden._id, restaurantName: garden.name, userId: customer._id, userName: customer.name, guestsCount: 3, reservationDate: '2026-06-15', reservationTime: '12:30 PM', status: 'confirmed' },
    { restaurantId: garden._id, restaurantName: garden.name, userId: customer._id, userName: customer.name, guestsCount: 2, reservationDate: '2026-05-01', reservationTime: '8:30 PM', status: 'completed' },
    { restaurantId: sakura._id, restaurantName: sakura.name, userId: customer._id, userName: customer.name, guestsCount: 2, reservationDate: '2026-03-10', reservationTime: '7:30 PM', status: 'completed' },
    { restaurantId: sakura._id, restaurantName: sakura.name, userId: customer._id, userName: customer.name, guestsCount: 6, reservationDate: '2026-02-14', reservationTime: '6:00 PM', status: 'cancelled' },
  ]);

  const orders = await Order.insertMany([
    { restaurantId: garden._id, restaurantName: garden.name, userId: customer._id, userName: customer.name, tableId: gardenTables[1]._id, tableNumber: 2, items: [{ menuItemId: gardenMenuDocs[0]._id, name: gardenMenuDocs[0].name, quantity: 1, price: 24.99 }], subtotal: 24.99, tax: 2.12, serviceCharge: 2.5, total: 29.61, status: 'new', paymentMethod: 'card' },
    { restaurantId: garden._id, restaurantName: garden.name, userId: customer._id, userName: customer.name, tableId: gardenTables[5]._id, tableNumber: 6, items: [{ menuItemId: gardenMenuDocs[1]._id, name: gardenMenuDocs[1].name, quantity: 2, price: 18.99 }], subtotal: 37.98, tax: 3.23, serviceCharge: 3.8, total: 45.01, status: 'preparing', paymentMethod: 'wallet' },
    { restaurantId: garden._id, restaurantName: garden.name, userId: customer._id, userName: customer.name, tableId: gardenTables[6]._id, tableNumber: 7, items: [{ menuItemId: gardenMenuDocs[2]._id, name: gardenMenuDocs[2].name, quantity: 1, price: 16.99 }], subtotal: 16.99, tax: 1.44, serviceCharge: 1.7, total: 20.13, status: 'ready', paymentMethod: 'mobile_money' },
    { restaurantId: sakura._id, restaurantName: sakura.name, userId: customer._id, userName: customer.name, tableId: sakuraTables[1]._id, tableNumber: 2, items: [{ menuItemId: sakuraMenuDocs[0]._id, name: sakuraMenuDocs[0].name, quantity: 1, price: 16.99 }], subtotal: 16.99, tax: 1.36, serviceCharge: 1.7, total: 20.05, status: 'served', paymentMethod: 'card' },
    { restaurantId: garden._id, restaurantName: garden.name, userId: customer._id, userName: customer.name, tableId: gardenTables[9]._id, tableNumber: 10, items: [{ menuItemId: gardenMenuDocs[3]._id, name: gardenMenuDocs[3].name, quantity: 2, price: 9.99 }], subtotal: 19.98, tax: 1.7, serviceCharge: 2.0, total: 23.68, status: 'paid', paymentMethod: 'wallet' },
  ]);

  logger.info('Seeded:', {
    users: await User.countDocuments(),
    restaurants: 2,
    tables: gardenTables.length + sakuraTables.length,
    menuItems: gardenMenuDocs.length + sakuraMenuDocs.length,
    reservations: reservations.length,
    orders: orders.length,
    staff: gardenStaff.length + 3,
  });

  return { skipped: false };
}

if (require.main === module) {
  seedDatabase({ force: true })
    .then(() => { logger.info('Database seeding completed!'); process.exit(0); })
    .catch((err) => { logger.error('Seeding error:', err); process.exit(1); });
}

module.exports = seedDatabase;
