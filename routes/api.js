const { body, validationResult } = require('express-validator');

// In the route file, after imports:
router.post('/subscribe', [
  body('email').isEmail().withMessage('A valid email is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;
    // Trim and validate again
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    const sub = await require('../models/Subscriber').create(email);
    console.log('Subscriber created:', sub);
    res.json({ message: 'Successfully subscribed', subscriber: sub });
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});