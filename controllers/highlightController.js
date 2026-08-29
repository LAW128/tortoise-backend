const Highlight = require('../models/Highlight');

exports.getByPage = async (req, res) => {
  try {
    const { pageId } = req.params;
    const highlight = await Highlight.findByPage(pageId);

    // If no highlight exists, return an empty structure instead of 404
    if (!highlight) {
      return res.json({
        id: null,
        page_id: pageId,
        badge: '',
        heading: '',
        description: '',
        read_more_link: '#',
        top_image: '',
        bottom_image: '',
        bullets: []
      });
    }

    const bullets = await Highlight.getBullets(highlight.id);
    res.json({ ...highlight, bullets });
  } catch (err) {
    console.error('Get highlight error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { badge, heading, description, read_more_link, top_image, bottom_image, bullets } = req.body;

    const updated = await Highlight.upsert(pageId, {
      badge,
      heading,
      description,
      read_more_link,
      top_image,
      bottom_image
    });

    if (bullets && Array.isArray(bullets)) {
      await Highlight.setBullets(updated.id, bullets);
    }

    // Return the full updated highlight with bullets
    const fullHighlight = {
      ...updated,
      bullets: await Highlight.getBullets(updated.id)
    };

    res.json(fullHighlight);
  } catch (err) {
    console.error('Update highlight error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};