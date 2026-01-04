import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';
import { startCronJobs } from './utils/cronJobs.js';

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Start cron jobs
startCronJobs();

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║   🚀 Contest Platform Server          ║
  ║   📡 Running on port ${PORT}            ║
  ║   🌍 Environment: ${process.env.NODE_ENV || 'development'}      ║
  ║   ⏰ Cron jobs: Active                 ║
  ╚═══════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});
