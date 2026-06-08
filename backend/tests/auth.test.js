import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Set env vars before any imports that read them
process.env.MONGO_URI = 'mongodb://test:27017/dineflow_test';
process.env.JWT_SECRET = 'test_secret_key_for_tests';

vi.mock('../utils/logger', () => ({
  default: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

// Mock User model so auth middleware and auth routes compile
vi.mock('../models/User', () => {
  const mockFindOne = vi.fn();
  const User = function(data) {
    Object.assign(this, data || {});
    this._id = this._id || 'mock_id';
    this.save = vi.fn().mockResolvedValue(this);
  };
  User.findOne = mockFindOne;
  return User;
});

vi.mock('../models/Restaurant', () => {
  const MockRestaurant = function(data) {
    Object.assign(this, data || {});
    this.save = vi.fn().mockResolvedValue(this);
    return this;
  };
  MockRestaurant.findOne = vi.fn();
  MockRestaurant.findByIdAndUpdate = vi.fn();
  return MockRestaurant;
});

import authRoutes from '../routes/auth';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes — Input Validation', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('POST /api/auth/register rejects empty body', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({})
      .expect(400);

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/auth/register rejects invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'not-an-email', password: '123', role: 'customer' })
      .expect(400);

    expect(res.body.errors).toBeDefined();
  });

  it('POST /api/auth/login rejects empty body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({})
      .expect(400);

    expect(res.body).toHaveProperty('errors');
  });

  it('POST /api/auth/login rejects empty password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: '' })
      .expect(400);

    expect(res.body).toHaveProperty('errors');
  });

  it('POST /api/auth/register rejects invalid role', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@test.com', password: '123', role: 'superadmin' })
      .expect(400);

    expect(res.body.errors).toBeDefined();
  });
});
