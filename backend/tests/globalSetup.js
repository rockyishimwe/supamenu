// backend/tests/globalSetup.js
// Vitest global setup — runs once before/after all test files
// Starts an in-memory MongoDB server and shares the URI via process.env + env file

import { MongoMemoryServer } from 'mongodb-memory-server';

export async function setup() {
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = '***';

  // Store the instance so teardown can access it
  globalThis.__MONGO_SERVER__ = mongoServer;
}

export async function teardown() {
  const mongoServer = globalThis.__MONGO_SERVER__;
  if (mongoServer) {
    await mongoServer.stop();
  }
}
