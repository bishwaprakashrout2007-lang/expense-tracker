const mongoose = require('mongoose');

const runMigration = async () => {
  try {
    const User = require('../models/User');
    const phoneRes = await User.updateMany({ phone: '' }, { $unset: { phone: "" } });
    const firebaseRes = await User.updateMany({ firebaseUid: '' }, { $unset: { firebaseUid: "" } });
    if (phoneRes.modifiedCount > 0 || firebaseRes.modifiedCount > 0) {
      console.log(`Database migration complete. Cleaned up empty unique fields (Phone modified: ${phoneRes.modifiedCount}, Firebase modified: ${firebaseRes.modifiedCount}).`);
    }
  } catch (err) {
    console.error(`Database migration failed: ${err.message}`);
  }
};

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const fallbackUri = 'mongodb://127.0.0.1:27017/financeflow';

  // Check if primary URI exists and is not a placeholder
  const isPlaceholder = primaryUri && primaryUri.includes('<db_password>');

  if (primaryUri && !isPlaceholder) {
    try {
      console.log('Attempting to connect to primary MongoDB Atlas...');
      const conn = await mongoose.connect(primaryUri);
      console.log(`MongoDB Connected (Primary): ${conn.connection.host}`);
      await runMigration();
      return;
    } catch (error) {
      console.warn(`Primary MongoDB connection failed: ${error.message}`);
      console.log('Attempting connection to local MongoDB fallback...');
    }
  } else if (isPlaceholder) {
    console.warn('Primary MONGO_URI in .env contains placeholder <db_password>. Skipping primary connection.');
    console.log('Attempting connection to local MongoDB...');
  } else {
    console.log('No primary MONGO_URI defined. Attempting connection to local MongoDB...');
  }

  try {
    const conn = await mongoose.connect(fallbackUri);
    console.log(`MongoDB Connected (Local Fallback): ${conn.connection.host}`);
    await runMigration();
  } catch (error) {
    console.error(`Error connecting to local MongoDB fallback: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
