// backend/tests/setup.js
// Vitest setup file — runs before test files are loaded
// Starts an in-memory MongoDB server and sets env vars

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

/**
 * Called once before all test files load.
 */
export async function setup() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = 'test-secret-key';

  await mongoose.connect(uri);
}

/**
 * Called once after all test files finish.
 */
export async function teardown() {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}
