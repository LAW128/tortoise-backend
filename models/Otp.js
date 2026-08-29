const pool = require('../config/database');

const Otp = {
  async create({ email, code, expires_at }) {
    await pool.query('DELETE FROM otp_codes WHERE email = $1', [email]); // one active OTP per email
    const { rows } = await pool.query(
      `INSERT INTO otp_codes (email, code, expires_at) VALUES ($1, $2, $3) RETURNING *`,
      [email, code, expires_at]
    );
    return rows[0];
  },

  async findValidOtp(email, code) {
    const { rows } = await pool.query(
      `SELECT * FROM otp_codes 
       WHERE email = $1 AND code = $2 AND expires_at > NOW()`,
      [email, code]
    );
    return rows[0];
  },

  async deleteByEmail(email) {
    await pool.query('DELETE FROM otp_codes WHERE email = $1', [email]);
  }
};

module.exports = Otp;