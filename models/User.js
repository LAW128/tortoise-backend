const pool = require('../config/database');

const User = {
  async findByUsername(username) {
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return rows[0];
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0];
  },

  async create({ username, password_hash }) {
    const { rows } = await pool.query(
      `INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *`,
      [username, password_hash]
    );
    return rows[0];
  },

  async updatePassword(username, newPasswordHash) {
    await pool.query('UPDATE users SET password_hash = $1 WHERE username = $2', [newPasswordHash, username]);
  }
};

module.exports = User;