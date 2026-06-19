/**
 * Test database helper.
 *
 * Priority order:
 * 1. MONGO_TEST_URI env var (set explicitly in CI or locally)
 * 2. mongodb-memory-server (requires binary download on first run)
 * 3. Local MongoDB fallback: mongodb://localhost:27017/smart-it-lab-test
 */

import mongoose from "mongoose";

let mongoServer;

export async function connectTestDB() {
  if (process.env.MONGO_TEST_URI) {
    await mongoose.connect(process.env.MONGO_TEST_URI);
    return;
  }

  try {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    return;
  } catch {
    // Binary not yet downloaded — fall through to local
  }

  await mongoose.connect("mongodb://localhost:27017/smart-it-lab-test");
}

export async function disconnectTestDB() {
  try {
    await mongoose.connection.dropDatabase();
  } catch {
    // ignore
  }
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
}

export async function clearCollections(...models) {
  for (const model of models) {
    await model.deleteMany({});
  }
}
