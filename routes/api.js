const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const contactController = require('../controllers/contactController');
const heroController = require('../controllers/heroController');
const highlightController = require('../controllers/highlightController');
const newsController = require('../controllers/newsController');
const partnerController = require('../controllers/partnerController');
const subscriberController = require('../controllers/subscriberController');
const siteSettingsController = require('../controllers/siteSettingsController');

// ========================
// Public routes
// ========================

// Hero slides
router.get('/hero/:pageId', heroController.getByPage);

// Highlights
router.get('/highlights/:pageId', highlightController.getByPage);

// News
router.get('/news', newsController.getAll);

// Partners
router.get('/partners', partnerController.getAll);

// Newsletter subscription
router.post('/subscribe', [
  body('email').isEmail().withMessage('A valid email is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email } = req.body;
    const sub = await require('../models/Subscriber').create(email);
    res.json({ message: 'Successfully subscribed', subscriber: sub });
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Site settings
router.get('/settings', siteSettingsController.get);

// Contact form (support/volunteer)
router.post('/contact', [
  body('form_type').isIn(['support', 'volunteer']).withMessage('Invalid form type'),
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('message').optional()
], contactController.sendMessage);

module.exports = router;
