const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Otp = require('../models/Otp');
const sendEmail = require('../utils/sendEmail');

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;
    const user = await User.findByUsername(username);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email } = req.body;
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await Otp.create({ email, code: otp, expires_at: expiresAt });

    // Prepare email content
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2d6a4f;">Password Reset Request</h2>
        <p>You requested a password reset for the admin panel.</p>
        <p>Your one‑time code is:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 5px; background: #f0f0f0; padding: 15px; text-align: center; border-radius: 8px;">
          ${otp}
        </p>
        <p style="color: #666;">This code expires in 10 minutes.</p>
      </div>
    `;

    // Send email
    await sendEmail(email, 'Your OTP for Password Reset', html);

    res.json({ message: 'If the email is registered, an OTP has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error while sending email.' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, otp } = req.body;
    const validOtp = await Otp.findValidOtp(email, otp);
    if (!validOtp) return res.status(400).json({ message: 'Invalid or expired OTP' });

    res.json({ message: 'OTP verified', email });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, otp, newPassword } = req.body;
    const validOtp = await Otp.findValidOtp(email, otp);
    if (!validOtp) return res.status(400).json({ message: 'Invalid or expired OTP' });

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    await User.updatePassword('admin', passwordHash);
    await Otp.deleteByEmail(email);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};