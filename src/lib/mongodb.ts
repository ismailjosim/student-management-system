import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'student-management';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached = globalThis.mongoose;

if (!cached) {
  cached = globalThis.mongoose = { conn: null, promise: null };
}

export async function connectDB(): Promise<Mongoose> {
  if (cached!.conn) return cached!.conn;

  if (!cached!.promise) {
    const opts = {
      dbName: MONGODB_DB_NAME,
      maxPoolSize: 10,
      minPoolSize: 2,
      // Helps avoid long-running requests if DB is down
      serverSelectionTimeoutMS: 5000,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log('✅ MongoDB Connected');
      return m;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

// Event handlers should be outside the main connect logic to avoid duplication
mongoose.connection.on('error', (err) => console.error('MongoDB Error:', err));
mongoose.connection.on('disconnected', () => console.warn('MongoDB Disconnected'));

export const isConnected = () => mongoose.connection.readyState === 1;
