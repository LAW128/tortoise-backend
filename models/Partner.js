const pool = require('../config/database');

const Partner = {
  async findAll() {
    const { rows } = await pool.query('SELECT * FROM partners ORDER BY id');
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM partners WHERE id = $1', [id]);
    return rows[0];
  },

  async create({ name, logo_url, website }) {
    const { rows } = await pool.query(
      `INSERT INTO partners (name, logo_url, website)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, logo_url, website]
    );
    return rows[0];
  },

  async update(id, { name, logo_url, website }) {
    const { rows } = await pool.query(
      `UPDATE partners SET name = $1, logo_url = $2, website = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [name, logo_url, website, id]
    );
    return rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM partners WHERE id = $1', [id]);
  }
};

module.exports = Partner;