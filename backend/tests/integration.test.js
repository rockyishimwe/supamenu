// backend/tests/integration.test.js
// Integration tests using mongodb-memory-server (started via globalSetup which sets env vars)
// Tests the real route-handler chain with a real MongoDB instance.

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Env vars (MONGO_URI, JWT_SECRET) are set by globalSetup.js before this file loads
import app from '../app.js';

// Helper: add X-Requested-With for CSRF protection on unauthenticated requests
const csrf = { 'X-Requested-With': 'XMLHttpRequest' };

// Models — loaded lazily after connection
let User, Order, Restaurant, MenuItem;

// Shared test data
let customerToken;
let testCustomer, testOwner, testRestaurant, testMenuItem;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  User = mongoose.model('User');
  Order = mongoose.model('Order');
  Restaurant = mongoose.model('Restaurant');
  MenuItem = mongoose.model('MenuItem');

  // Pass plaintext — User model's pre('save') hook hashes it
  testOwner = await User.create({
    name: 'Test Owner',
    email: 'owner@test.com',
    password: 'Testpass123',
    role: 'owner',
  });

  testCustomer = await User.create({
    name: 'Test Customer',
    email: 'customer@test.com',
    password: 'Testpass123',
    role: 'customer',
    walletBalance: 500,
  });

  testRestaurant = await Restaurant.create({
    name: 'Test Restaurant',
    cuisines: ['Italian'],
    address: '123 Test St',
  });

  testMenuItem = await MenuItem.create({
    restaurantId: testRestaurant._id,
    name: 'Margherita Pizza',
    price: 12.99,
    category: 'Pizza',
    description: 'Classic cheese and tomato',
  });

  customerToken = jwt.sign({ id: testCustomer._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

beforeEach(async () => {
  await Order.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Auth Integration', () => {

  it('POST /api/auth/register creates a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set(csrf)
      .send({
        name: 'New User',
        email: 'newuser@test.com',
        password: 'MyPass1234',
        role: 'customer',
      })
      .expect(201);

    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'newuser@test.com');
    expect(res.body.user.role).toBe('customer');
  });

  it('POST /api/auth/register rejects duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set(csrf)
      .send({
        name: 'Duplicate',
        email: 'customer@test.com',
        password: 'Testpass123',
        role: 'customer',
      })
      .expect(400);

    expect(res.body.message).toMatch(/email|already exists/i);
  });

  it('POST /api/auth/login returns token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set(csrf)
      .send({
        email: 'customer@test.com',
        password: 'Testpass123',
        role: 'customer',
      })
      .expect(200);

    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('customer@test.com');
  });

  it('POST /api/auth/login rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set(csrf)
      .send({
        email: 'customer@test.com',
        password: 'wrongpassword',
        role: 'customer',
      })
      .expect(400);

    expect(res.body.message).toMatch(/invalid|credentials/i);
  });

  it('GET /api/auth/profile returns user profile with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(res.body.email).toBe('customer@test.com');
    expect(res.body).not.toHaveProperty('password');
  });

  it('GET /api/auth/profile rejects without token', async () => {
    await request(app)
      .get('/api/auth/profile')
      .expect(401);
  });
});

describe('Orders Integration', () => {

  it('POST /api/orders creates an order for authenticated customer', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        restaurantId: String(testRestaurant._id),
        restaurantName: 'Test Restaurant',
        items: [
          {
            menuItemId: String(testMenuItem._id),
            name: testMenuItem.name,
            quantity: 2,
            price: testMenuItem.price,
          },
        ],
        total: 25.98,
        paymentMethod: 'wallet',
      })
      .expect(201);

    expect(res.body).toHaveProperty('_id');
    expect(res.body.userId).toBe(String(testCustomer._id));
    expect(res.body.total).toBe(25.98);
  });

  it('POST /api/orders rejects orders without items', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        restaurantId: String(testRestaurant._id),
        restaurantName: 'Test Restaurant',
        items: [],
        total: 0,
        paymentMethod: 'wallet',
      })
      .expect(400);

    expect(res.body.errors || res.body.message).toBeDefined();
  });

  it('GET /api/orders returns own orders for customer', async () => {
    await Order.create({
      userId: testCustomer._id,
      restaurantId: testRestaurant._id,
      restaurantName: 'Test Restaurant',
      items: [{ menuItemId: testMenuItem._id, name: testMenuItem.name, quantity: 1, price: testMenuItem.price }],
      subtotal: 10.95,
      tax: 1.10,
      serviceCharge: 1.30,
      total: 12.99,
      status: 'new',
      paymentStatus: 'unpaid',
    });

    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].userId).toBe(String(testCustomer._id));
  });

  it('GET /api/orders rejects without authentication', async () => {
    await request(app)
      .get('/api/orders')
      .expect(401);
  });
});

describe('Registration Validation — block cheap sign-ups', () => {

  const testCases = [
    ['purely numeric name',       { name: '123',       email: 'a@b.co',      password: 'TestPass1' }, 'name'],
    ['too short name',            { name: 'x',         email: 'a@b.co',      password: 'TestPass1' }, 'name'],
    ['symbols-only name',         { name: '!!!',       email: 'a@b.co',      password: 'TestPass1' }, 'name'],
    ['no @ in email',             { name: 'Alice',     email: '123',         password: 'TestPass1' }, 'email'],
    ['missing domain TLD',        { name: 'Alice',     email: 'abc@xyz',     password: 'TestPass1' }, 'email'],
    ['password too short (3)',    { name: 'Alice',     email: 'a@b.co',      password: '123'       }, 'password'],
    ['all-digit password',        { name: 'Alice',     email: 'a@b.co',      password: '12345678'  }, 'password'],
    ['no-uppercase password',     { name: 'Alice',     email: 'a@b.co',      password: 'password1' }, 'password'],
    ['no-digit password',         { name: 'Alice',     email: 'a@b.co',      password: 'Password!' }, 'password'],
  ];

  testCases.forEach(([label, payload, triggerField]) => {
    it(`rejects ${label}`, async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set(csrf)
        .send(payload)
        .expect(400);

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some(e => e.field === triggerField)).toBe(true);
    });
  });
});

describe('Error Leakage Protection', () => {

  it('does not leak internal error details in 500 responses', async () => {
    // Malformed ID triggers Mongoose CastError (no status property → 500)
    const res = await request(app)
      .get('/api/restaurants/not-a-valid-id')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(500);

    expect(res.body.message).toBe('Internal server error');
    expect(res.body).not.toHaveProperty('error');
    expect(res.body).not.toHaveProperty('stack');
  });
});
