import { mongodbAdapter } from '@better-auth/mongo-adapter';
import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'student-management';

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const globalForMongo = globalThis as typeof globalThis & {
  betterAuthMongoClient?: MongoClient;
};

const client = globalForMongo.betterAuthMongoClient ?? new MongoClient(uri);

if (process.env.NODE_ENV !== 'production') {
  globalForMongo.betterAuthMongoClient = client;
}

export const auth = betterAuth({
  database: mongodbAdapter(client.db(dbName), {
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustedOrigins: [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_AUTH_URL,
    process.env.NEXT_PUBLIC_API_URL,
  ].filter(Boolean) as string[],
  plugins: [nextCookies()],
});
