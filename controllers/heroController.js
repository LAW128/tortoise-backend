const HeroSlide = require('../models/HeroSlide');

exports.getByPage = async (req, res) => {
  try {
    const { pageId } = req.params;
    const slides = await HeroSlide.findByPage(pageId);
    res.json(slides);
  } catch (err) {
    console.error('Get hero slides error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateSlide = async (req, res) => {
  try {
    const { pageId, slideIndex } = req.params;
    const { title, description, image_url } = req.body;

    const updated = await HeroSlide.upsert(pageId, parseInt(slideIndex), {
      title,
      description,
      image_url
    });
    res.json(updated);
  } catch (err) {
    console.error('Update hero slide error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};