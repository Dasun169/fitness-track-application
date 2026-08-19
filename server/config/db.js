const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (mongoURI && mongoURI !== 'memory') {
      try {
        const conn = await mongoose.connect(mongoURI, {
          serverSelectionTimeoutMS: 4000,
        });
        console.log(`MongoDB Connected to Atlas/External DB: ${conn.connection.host}`);
        return conn;
      } catch (err) {
        console.warn(`External MongoDB connection failed (${err.message}). Falling back to In-Memory MongoDB...`);
      }
    }

    // Fallback to MongoMemoryServer for instant seamless execution
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected via In-Memory Server: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
