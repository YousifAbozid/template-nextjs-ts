/**
 * Database configuration
 */
export const dbConfig = {
  url: process.env.MONGODB_URI || 'mongodb://localhost:27017/nextjs-backend',
  options: {
    // Add mongoose connection options here if needed
  }
};
