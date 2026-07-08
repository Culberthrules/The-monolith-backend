import 'dotenv/config.js';
import app from './components/app.js';
import connectDB from '../config/db.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  // 1. Connect to Firebase
  await connectDB();

  // 2. Start HTTP server
  app.listen(PORT, () => {
    console.log(`🚀  Server running on http://localhost:${PORT}`);
    console.log(`🌍  Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗  Client URL  : ${process.env.CLIENT_URL}`);
  });
};

start();
