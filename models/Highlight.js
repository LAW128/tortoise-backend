const pool = require('../config/database');

const Highlight = {
  async findByPage(pageId) {
    const { rows } = await pool.query(
      'SELECT * FROM highlights WHERE page_id = $1',
      [pageId]
    );
    return rows[0];
  },

  async upsert(pageId, { badge, heading, description, read_more_link, top_image, bottom_image }) {
    const { rows } = await pool.query(
      `INSERT INTO highlights (page_id, badge, heading, description, read_more_link, top_image, bottom_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (page_id)
       DO UPDATE SET badge = EXCLUDED.badge,
                     heading = EXCLUDED.heading,
                     description = EXCLUDED.description,
                     read_more_link = EXCLUDED.read_more_link,
                     top_image = EXCLUDED.top_image,
                     bottom_image = EXCLUDED.bottom_image,
                     updated_at = NOW()
       RETURNING *`,
      [pageId, badge, heading, description, read_more_link, top_image, bottom_image]
    );
    return rows[0];
  },

  async getBullets(highlightId) {
    const { rows } = await pool.query(
      'SELECT * FROM highlight_bullets WHERE highlight_id = $1 ORDER BY sort_order',
      [highlightId]
    );
    return rows;
  },

  async setBullets(highlightId, bullets) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM highlight_bullets WHERE highlight_id = $1', [highlightId]);
      for (let i = 0; i < bullets.length; i++) {
        await client.query(
          'INSERT INTO highlight_bullets (highlight_id, text, sort_order) VALUES ($1, $2, $3)',
          [highlightId, bullets[i], i]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
};

module.exports = Highlight;