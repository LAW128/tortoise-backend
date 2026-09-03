const pool = require('../config/database');

const ContactMessage = {
  async create({ form_type, full_name, email, message }) {
    const { rows } = await pool.query(
      `INSERT INTO contact_messages (form_type, full_name, email, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [form_type, full_name, email, message]
    );
    return rows[0];
  },

  async getAll() {
    const { rows } = await pool.query(
      'SELECT * FROM contact_messages ORDER BY created_at DESC'
    );
    return rows;
  }
};

module.exports = ContactMessage;
