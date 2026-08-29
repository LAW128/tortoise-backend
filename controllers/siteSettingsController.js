const SiteSettings = require('../models/SiteSettings');

exports.get = async (req, res) => {
  try {
    const settings = await SiteSettings.get();
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    res.json(settings);
  } catch (err) {
    console.error('Get site settings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await SiteSettings.update(req.body);
    res.json(updated);
  } catch (err) {
    console.error('Update site settings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};