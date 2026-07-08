import 'dotenv/config.js';
import connectDB from '../config/db.js';
import app from '../src/components/app.js';

// Initialize Firebase on cold start (Vercel supports top-level await in Node.js)
await connectDB();

export default app;

