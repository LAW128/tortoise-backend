const pool = require('../config/database');

const News = {
  async findAll() {
    const { rows } = await pool.query('SELECT * FROM news ORDER BY created_at DESC');
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM news WHERE id = $1', [id]);
    return rows[0];
  },

  async create({ title, description, image_url, link }) {
    const { rows } = await pool.query(
      `INSERT INTO news (title, description, image_url, link) VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, description, image_url, link]
    );
    return rows[0];
  },

  async update(id, { title, description, image_url, link }) {
    const { rows } = await pool.query(
      `UPDATE news SET title = $1, description = $2, image_url = $3, link = $4, updated_at = NOW() WHERE id = $5 RETURNING *`,
      [title, description, image_url, link, id]
    );
    return rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM news WHERE id = $1', [id]);
  }
};

module.exports = News;