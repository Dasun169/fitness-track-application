const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (mongoURI && mongoURI !== 'memory') {
    try {
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`MongoDB Connected to Atlas/External DB: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.error(`External MongoDB connection failed: ${err.message}`);
      if (process.env.NODE_ENV === 'production') {
        console.error(
          'CRITICAL: In production mode, please ensure MongoDB Atlas IP Whitelist allows "0.0.0.0/0" and MONGODB_URI is correctly set in Render environment variables.'
        );
        throw err;
      }
      console.warn('Falling back to In-Memory MongoDB for local development...');
    }
  }

  // Fallback to MongoMemoryServer for local development only
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected via In-Memory Server: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Memory Server error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
