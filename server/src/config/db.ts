import mongoose from 'mongoose';
import { env } from './env';

let memoryServerInstance: any = null;

export async function connectDatabase(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  let mongoUri = env.MONGODB_URI;

  try {
    // Attempt standard connection
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] Connected to MongoDB at ${mongoUri}`);
    return mongoose;
  } catch (initialError: any) {
    // In development or test, fallback to MongoMemoryServer if local mongod is not reachable
    if (env.NODE_ENV !== 'production') {
      console.warn(
        `[Database] Local MongoDB unreachable at ${mongoUri}. Initializing embedded MongoDB engine for seamless execution...`
      );
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create();
        mongoUri = memoryServerInstance.getUri();
        await mongoose.connect(mongoUri);
        console.log(`[Database] Connected to in-memory MongoDB at ${mongoUri}`);
        return mongoose;
      } catch (memErr) {
        console.error('[Database] Failed to start in-memory MongoDB:', memErr);
        throw initialError;
      }
    }
    throw initialError;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
    memoryServerInstance = null;
  }
}
