const mongoose = require('mongoose');

let mongoMemoryServerInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // In production, MONGODB_URI is strictly required
  if (!uri && process.env.NODE_ENV === 'production') {
    console.error('❌ FATAL: MONGODB_URI environment variable is not defined.');
    console.error('Please configure MONGODB_URI in your Render service environment settings.');
    process.exit(1);
  }

  const connectionUri = uri || 'mongodb://localhost:27017/smilecraft';

  try {
    // Attempt connecting to the configured MongoDB URI with a 10-second timeout
    const conn = await mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host} (Database: ${conn.connection.name})`);

    // Auto-seed only in development if explicitly requested — never overwrite production data
    if (process.env.NODE_ENV !== 'production' && process.env.AUTO_SEED === 'true') {
      try {
        const { seedData } = require('../seeder');
        await seedData();
      } catch (e) {
        console.warn('Auto-seed check note:', e.message);
      }
    }

    return conn;
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);

    // Strictly remove in-memory fallback for production or when MONGODB_URI is configured
    if (process.env.NODE_ENV === 'production' || uri) {
      console.error('❌ Database connection to MongoDB Atlas failed. Stopping server.');
      console.error('👉 Please verify in Render:');
      console.error('   1. MONGODB_URI matches your MongoDB Atlas connection string with the new password.');
      console.error('   2. Network Access in MongoDB Atlas allows access from 0.0.0.0/0.');
      process.exit(1);
    }

    // Fallback to in-memory MongoDB ONLY in local development when no MONGODB_URI is provided
    try {
      console.log('ℹ️  Local MongoDB connection failed. Falling back to in-memory MongoDB server for local development...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServerInstance = await MongoMemoryServer.create();
      const memUri = mongoMemoryServerInstance.getUri();

      const conn = await mongoose.connect(memUri);
      console.log(`✅ In-Memory MongoDB Connected at: ${memUri}`);

      const { seedData } = require('../seeder');
      await seedData();
      console.log('✅ In-Memory database initialized with demo data');
      return conn;
    } catch (memErr) {
      console.error(`❌ Failed to start in-memory MongoDB: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
