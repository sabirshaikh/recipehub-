import "server-only";
import mongoose, { type Mongoose } from "mongoose";
import { getEnv } from "@/lib/env";

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Cache on globalThis so hot reloads (dev) and warm serverless invocations
// reuse a single connection instead of opening a new one each time.
const globalForMongoose = globalThis as typeof globalThis & { _mongoose?: MongooseCache };
const cache: MongooseCache = (globalForMongoose._mongoose ??= { conn: null, promise: null });

export async function connectDB(): Promise<Mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    const { MONGODB_URI } = getEnv();
    mongoose.set("strictQuery", true);
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10_000,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    // Allow the next call to retry instead of caching a rejected promise
    cache.promise = null;
    throw error;
  }
  return cache.conn;
}

export default connectDB;
