const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables FIRST
dotenv.config();

const app = express();

// ============ MIDDLEWARE ============
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ ROUTES ============
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

// ============ HEALTH CHECK ============
app.get('/', (req, res) => {
  res.json({ message: '🩸 BloodLife API is running!' });
});

// ============ 404 HANDLER ============
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ============ GLOBAL ERROR HANDLER ============
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

// ============ AUTO-SEED ADMIN ACCOUNT ============
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
      console.log('✅ Admin account seeded: admin@bloodlife.com / Admin@123');
    } else {
      console.log('ℹ️  Admin account already exists.');
    }
  } catch (err) {
    console.error('⚠️  Admin seed failed:', err.message);
  }
};

// ============ START SERVER ============
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bloodlife';
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Database connected successfully1');
    await seedAdmin();
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error('❌ DB connection error:', err));