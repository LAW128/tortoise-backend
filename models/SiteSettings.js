const pool = require('../config/database');

const SiteSettings = {
  async get() {
    const { rows } = await pool.query('SELECT * FROM site_settings WHERE id = 1');
    return rows[0];
  },

  async update(settings) {
    const fields = [
      'vision', 'mission', 'core_purpose',
      'contact_address', 'contact_phone', 'contact_email',
      'facebook_url', 'twitter_url', 'instagram_url', 'linkedin_url', 'youtube_url'
    ];
    const sets = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map(f => settings[f] || null);

    const { rows } = await pool.query(
      `UPDATE site_settings SET ${sets}, updated_at = NOW() WHERE id = 1 RETURNING *`,
      values
    );
    return rows[0];
  }
};

module.exports = SiteSettings;