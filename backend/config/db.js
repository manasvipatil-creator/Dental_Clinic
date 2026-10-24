const mongoose = require('mongoose');

let mongoMemoryServerInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smilecraft';
  
  try {
    // Attempt connecting to the configured MongoDB URI with a short timeout
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Auto-seed if empty
    try {
      const { seedData } = require('../seeder');
      await seedData();
    } catch (e) {
      console.warn('Auto-seed check note:', e.message);
    }
  } catch (err) {
    console.log(`ℹ️  Local MongoDB connection failed (${err.message}). Falling back to in-memory MongoDB server...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServerInstance = await MongoMemoryServer.create();
      const memUri = mongoMemoryServerInstance.getUri();
      
      const conn = await mongoose.connect(memUri);
      console.log(`✅ In-Memory MongoDB Connected at: ${memUri}`);

      // Auto seed memory database
      const { seedData } = require('../seeder');
      await seedData();
      console.log('✅ In-Memory database initialized with demo data');
    } catch (memErr) {
      console.error(`❌ Failed to start in-memory MongoDB: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
