const pool = require('../config/database');

const HeroSlide = {
  async findByPage(pageId) {
    const { rows } = await pool.query(
      'SELECT * FROM hero_slides WHERE page_id = $1 ORDER BY slide_index',
      [pageId]
    );
    return rows;
  },

  async upsert(pageId, slideIndex, { title, description, image_url }) {
    const { rows } = await pool.query(
      `INSERT INTO hero_slides (page_id, slide_index, title, description, image_url)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (page_id, slide_index)
       DO UPDATE SET title = EXCLUDED.title,
                     description = EXCLUDED.description,
                     image_url = EXCLUDED.image_url,
                     updated_at = NOW()
       RETURNING *`,
      [pageId, slideIndex, title, description, image_url]
    );
    return rows[0];
  },

  async deleteByPageAndIndex(pageId, slideIndex) {
    await pool.query(
      'DELETE FROM hero_slides WHERE page_id = $1 AND slide_index = $2',
      [pageId, slideIndex]
    );
  }
};

module.exports = HeroSlide;