const mongoose = require('mongoose');
const logger = require('./logger');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('MongoDB connected successfully');
  } catch (err) {
    logger.error({ err }, 'MongoDB connection failed');
    process.exit(1);
  }
}

module.exports = connectDB;