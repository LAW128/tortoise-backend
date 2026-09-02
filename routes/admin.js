const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const multer = require('multer');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const auth = require('../middleware/auth');

// Import controllers
const heroController = require('../controllers/heroController');
const highlightController = require('../controllers/highlightController');
const newsController = require('../controllers/newsController');
const partnerController = require('../controllers/partnerController');
const subscriberController = require('../controllers/subscriberController');
const siteSettingsController = require('../controllers/siteSettingsController');
const userController = require('../controllers/userController');

// Multer memory storage (no disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },  // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },  // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  }
});

// ========================
// All admin routes require JWT authentication
// ========================
router.use(auth);

// Helper to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder = 'general') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

// File upload endpoint (now Cloudinary)
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer, 'tortoise_project');
    res.json({ image_url: imageUrl });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ message: 'Image upload failed' });
  }
});
// Hero slides
router.get('/hero/:pageId', heroController.getByPage);
router.put('/hero/:pageId/:slideIndex', [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional(),
  body('image_url').optional()
], heroController.updateSlide);

// Highlights
router.get('/highlights/:pageId', highlightController.getByPage);
router.put('/highlights/:pageId', [
  body('badge').optional(),
  body('heading').optional(),
  body('description').optional(),
  body('read_more_link').optional(),
  body('top_image').optional(),
  body('bottom_image').optional(),
  body('bullets').optional().isArray()
], highlightController.update);

// News CRUD
router.get('/news', newsController.getAll);
router.get('/news/:id', newsController.getById);
router.post('/news', [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional(),
  body('image_url').optional(),
  body('link').optional()
], newsController.create);
router.put('/news/:id', [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional(),
  body('image_url').optional(),
  body('link').optional()
], newsController.update);
router.delete('/news/:id', newsController.delete);

// Partners CRUD
router.get('/partners', partnerController.getAll);
router.post('/partners', [
  body('name').notEmpty().withMessage('Partner name is required'),
  body('logo_url').optional(),
  body('website').optional()
], partnerController.create);
router.put('/partners/:id', [
  body('name').notEmpty().withMessage('Partner name is required'),
  body('logo_url').optional(),
  body('website').optional()
], partnerController.update);
router.delete('/partners/:id', partnerController.delete);

// Subscribers
router.get('/subscribers', subscriberController.getAll);
router.delete('/subscribers/:id', subscriberController.deleteOne);
router.delete('/subscribers', subscriberController.deleteAll);

// Site Settings
router.get('/settings', siteSettingsController.get);
router.put('/settings', siteSettingsController.update);

// User profile (logged-in admin)
router.get('/profile', userController.getProfile);
router.put('/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], userController.changePassword);

module.exports = router;
