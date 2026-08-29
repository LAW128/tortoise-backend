const Subscriber = require('../models/Subscriber');

exports.getAll = async (req, res) => {
  try {
    const subscribers = await Subscriber.findAll();
    res.json(subscribers);
  } catch (err) {
    console.error('Get subscribers error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteOne = async (req, res) => {
  try {
    const { id } = req.params;
    await Subscriber.delete(id);
    res.json({ message: 'Subscriber deleted' });
  } catch (err) {
    console.error('Delete subscriber error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteAll = async (req, res) => {
  try {
    await Subscriber.deleteAll();
    res.json({ message: 'All subscribers deleted' });
  } catch (err) {
    console.error('Delete all subscribers error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};