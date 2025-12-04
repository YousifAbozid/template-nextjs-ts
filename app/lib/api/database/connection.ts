import mongoose from 'mongoose';
import { dbConfig } from '../config';

// Global variable to track connection status
let isConnected = false;

/**
 * Connect to MongoDB using Mongoose
 * Implements connection caching for serverless environments
 */
const connectDB = async (): Promise<void> => {
  // If already connected, reuse the connection
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    // Set mongoose connection options for production
    mongoose.set('strictQuery', false);

    const conn = await mongoose.connect(dbConfig.url, {
      bufferCommands: false, // Disable command buffering for serverless
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      ...dbConfig.options,
    });

    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    isConnected = false;
    // In serverless environments, don't exit the process
    if (process.env.NODE_ENV === 'production') {
      throw error;
    } else {
      process.exit(1);
    }
  }
};

/**
 * Disconnect from MongoDB
 */
const disconnectDB = async (): Promise<void> => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB Disconnected');
  }
};

/**
 * Get connection status
 */
const getConnectionStatus = (): boolean => {
  return isConnected && mongoose.connection.readyState === 1;
};

export { connectDB, disconnectDB, getConnectionStatus };
export default connectDB;
