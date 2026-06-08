import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';

process.env.MONGO_URI = 'mongodb://test:27017/dineflow_test';
process.env.JWT_SECRET='test_secret_key';

vi.mock('../utils/logger', () => ({
  default: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

import healthRoutes from '../routes/health';

const app = express();
app.use('/api/health', healthRoutes);

describe('Health Endpoint', () => {
  it('returns ok when MongoDB is connected', async () => {
    vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(1);
    const res = await request(app).get('/api/health').expect(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.mongodb).toBe('connected');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('returns degraded when MongoDB is disconnected', async () => {
    vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(0);
    const res = await request(app).get('/api/health').expect(503);
    expect(res.body.status).toBe('degraded');
    expect(res.body.mongodb).toBe('disconnected');
  });
});
