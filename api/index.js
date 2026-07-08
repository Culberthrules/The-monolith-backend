import 'dotenv/config.js';
import connectDB from '../config/db.js';
import app from '../src/components/app.js';

// Initialize Firebase on cold start
let isInitialized = false;

const handler = async (req, res) => {
  if (!isInitialized) {
    await connectDB();
    isInitialized = true;
  }
  return app(req, res);
};

export default handler;
