const ContactMessage = require('../models/ContactMessage');
const { Resend } = require('resend');

// Initialize Resend (same as your OTP code)
const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendMessage = async (req, res) => {
  try {
    const { form_type, full_name, email, message } = req.body;

    // Basic validation
    if (!form_type || !full_name || !email) {
      return res.status(400).json({ message: 'Full name, email, and form type are required' });
    }

    // Save to database
    const saved = await ContactMessage.create({
      form_type,
      full_name,
      email,
      message: message || ''
    });

    // Send email to the admin
    const emailSubject = form_type === 'volunteer'
      ? 'New Volunteer Message'
      : 'New Support Message';

    const emailBody = `
      <h3>${emailSubject}</h3>
      <p><strong>Name:</strong> ${full_name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message || 'No message provided'}</p>
    `;

    await resend.emails.send({
      from: 'onboarding@resend.dev',   // You can change this to a verified domain later
      to: 'lawrencekofiamoako@gmail.com',
      subject: emailSubject,
      html: emailBody,
    });

    res.status(201).json({ message: 'Message sent successfully', data: saved });
  } catch (error) {
    console.error('Contact message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const messages = await ContactMessage.getAll();
    res.json(messages);
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
