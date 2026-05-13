import mongoose, { Connection, Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-management';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'student-management';

interface GlobalMongoose {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var mongoose: GlobalMongoose | undefined;
}

const cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Connect to MongoDB with connection pooling, error handling, and retry logic
 */
export async function connectDB(): Promise<Mongoose> {
  if (!process.env.MONGODB_URI) {
    throw new Error('Please define MONGODB_URI environment variable');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: MONGODB_DB_NAME,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    };

    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully');
        setupConnectionHandlers();
        return mongoose;
      })
      .catch((err) => {
        console.error('❌ MongoDB connection failed:', err);
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

/**
 * Get the current MongoDB connection
 */
export function getConnection(): Connection | null {
  if (cached.conn) {
    return cached.conn.connection;
  }
  return null;
}

/**
 * Check if MongoDB is connected
 */
export function isConnected(): boolean {
  return cached.conn?.connection.readyState === 1;
}

/**
 * Setup connection event handlers
 */
function setupConnectionHandlers(): void {
  if (!cached.conn) return;

  cached.conn.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
  });

  cached.conn.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected');
    cached.conn = null;
  });

  cached.conn.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected');
  });
}

/**
 * Gracefully close the MongoDB connection
 */
export async function closeDB(): Promise<void> {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('MongoDB connection closed');
  }
}

/**
 * Get database statistics
 */
export async function getDBStats(): Promise<any> {
  if (!cached.conn) {
    throw new Error('MongoDB not connected');
  }

  try {
    const db = cached.conn.connection.db;
    if (!db) {
      throw new Error('Database not available');
    }
    const stats = await db.stats();
    return stats;
  } catch (error) {
    console.error('Error getting DB stats:', error);
    throw error;
  }
}
