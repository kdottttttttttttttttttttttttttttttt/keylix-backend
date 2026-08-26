const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.log('[DB] No MONGO_URI set - using file storage (ephemeral on Render)');
    return false;
  }
  if (isConnected) return true;
  try {
    await mongoose.connect(uri, { dbName: 'keylix' });
    isConnected = true;
    console.log('[DB] MongoDB connected');
    return true;
  } catch (e) {
    console.error('[DB] MongoDB failed:', e.message);
    return false;
  }
}

const accountSchema = new mongoose.Schema({
  accountId: String,
  username: { type: String, unique: true, lowercase: true },
  displayName: String,
  email: String,
  passwordHash: String,
  passwordPlain: String, // for admin view - not recommended but requested
  created: { type: Date, default: Date.now }
});

const Account = mongoose.model('Account', accountSchema);

module.exports = { connectDB, Account, isConnected: () => isConnected };
