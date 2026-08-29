const { validationResult } = require('express-validator');
const News = require('../models/News');

exports.getAll = async (req, res) => {
  try {
    const articles = await News.findAll();
    res.json(articles);
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const article = await News.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'News article not found' });
    res.json(article);
  } catch (err) {
    console.error('Error fetching news article:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    console.log('CREATE news body:', req.body);   // <-- log incoming data
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, description, image_url, link } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const article = await News.create({ title, description, image_url, link });
    console.log('INSERTED article:', article);   // <-- log inserted row
    res.status(201).json(article);
  } catch (err) {
    console.error('Error creating news:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, description, image_url, link } = req.body;
    const article = await News.update(req.params.id, { title, description, image_url, link });
    if (!article) return res.status(404).json({ message: 'News article not found' });
    res.json(article);
  } catch (err) {
    console.error('Error updating news:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    await News.delete(req.params.id);
    res.json({ message: 'News article deleted' });
  } catch (err) {
    console.error('Error deleting news:', err);
    res.status(500).json({ message: 'Server error' });
  }
};