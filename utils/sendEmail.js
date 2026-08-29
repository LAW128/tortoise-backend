const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, subject, html) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Resend error:', error);
    throw new Error('Failed to send email');
  }
}

module.exports = sendEmail;