const mongoose = require('mongoose');
const tenantPlugin = require('../utils/tenantPlugin');

// Apply multi-tenancy plugin to all schemas globally
mongoose.plugin(tenantPlugin);

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('MongoDB is already connected');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stocksense', {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000
    });
    isConnected = conn.connections[0].readyState;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Don't process.exit(1) in a serverless function environment
  }
};

module.exports = connectDB;
