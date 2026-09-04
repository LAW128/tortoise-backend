require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { body } = require('express-validator');
const contactController = require('./controllers/contactController');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// ========================
// CORS FIRST – for all routes
// ========================
app.use(cors({
  origin: 'https://tortoise-project.onrender.com',
  credentials: true
}));

// ========================
// Body parsers
// ========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Prevent caching of API responses
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// ========================
// CONTACT ROUTE – directly on app
// ========================
app.post('/api/contact', [
  body('form_type').isIn(['support', 'volunteer']).withMessage('Invalid form type'),
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('message').optional()
], (req, res, next) => {
  console.log('✅ Contact route hit');
  contactController.sendMessage(req, res, next);
});

// ========================
// Serve static frontend
// ========================
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ========================
// Mount other routes
// ========================
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', apiRoutes);

// SEO routes
app.get('/sitemap.xml', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'sitemap.xml'));
});
app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'robots.txt'));
});

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Tortoise People Project API is running' });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack || err.message);
  if (err.message && err.message.startsWith('Only image files')) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: 'Internal server error' });
});

// Catch uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
