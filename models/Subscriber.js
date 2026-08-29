const pool = require('../config/database');

const Subscriber = {
  async findAll() {
    const { rows } = await pool.query('SELECT * FROM subscribers ORDER BY subscribed_at DESC');
    return rows;
  },
  async create(email) {
  if (!email || email.trim() === '') {
    throw new Error('Email cannot be empty');
  }
  const { rows } = await pool.query(
    'INSERT INTO subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING RETURNING *',
    [email.trim().toLowerCase()]
  );
  return rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM subscribers WHERE id = $1', [id]);
  },

  async deleteAll() {
    await pool.query('DELETE FROM subscribers');
  }
};

module.exports = Subscriber;