// ============================================================
// BLOODLIFE BACKEND — Express Server
// ============================================================
// Runs BOTH locally (via npm run dev) AND on Vercel (serverless)
// ============================================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================

// CORS — allow localhost + all *.vercel.app deployments
app.use(
  cors({
    origin: (origin, callback) => {
      // No origin (Postman, mobile apps)
      if (!origin) return callback(null, true);

      // Localhost (dev)
      if (origin.startsWith('http://localhost')) return callback(null, true);

      // Any Vercel deployment (preview + production)
      if (origin.endsWith('.vercel.app')) return callback(null, true);

      // Allow all for now — tighten in production
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// ROUTES
// ============================================================

const authRoutes = require('./routes/authRoutes');
const donorRoutes = require('./routes/donorRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const requestRoutes = require('./routes/requestRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/', (req, res) => {
  res.json({ message: '🩸 BloodLife API is running!' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// ============================================================
// 404 HANDLER
// ============================================================
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

// ============================================================
// MONGODB CONNECTION — CACHED FOR SERVERLESS
// ============================================================
// Serverless functions restart frequently. We cache the
// connection in a global so it persists across invocations.
// ============================================================

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const MONGO_URI =
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bloodlife';
    await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log('✅ Database connected successfully');
  } catch (err) {
    console.error('❌ DB connection error:', err);
    throw err;
  }
};

// Seed admin on first connect
const seedAdmin = async () => {
  try {
    const Admin = require('./models/Admin');
    const bcrypt = require('bcryptjs');

    const existing = await Admin.findOne({ email: 'admin@bloodlife.com' });
    if (!existing) {
      const hashed = await bcrypt.hash('Admin@123', 10);
      await Admin.create({
        fullName: 'System Admin',
        email: 'admin@bloodlife.com',
        password: hashed,
      });
      console.log('✅ Admin account seeded');
    }
  } catch (err) {
    console.error('⚠️  Admin seed failed:', err.message);
  }
};

// Middleware to ensure DB is connected before handling requests
// This runs on EVERY request in serverless mode
app.use(async (req, res, next) => {
  try {
    await connectDB();
    await seedAdmin();
  } catch (err) {
    return res.status(500).json({ message: 'Database connection failed' });
  }
  next();
});

// ============================================================
// LOCAL DEVELOPMENT — Only start server when run directly
// ============================================================
// On Vercel, this file is IMPORTED (not run directly), so
// `require.main === module` will be false and we skip app.listen().
// ============================================================

if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  connectDB()
    .then(async () => {
      await seedAdmin();
      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('❌ Failed to start server:', err);
      process.exit(1);
    });
}

module.exports = app;