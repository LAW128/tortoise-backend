const { validationResult } = require('express-validator');
const Partner = require('../models/Partner');

// GET /api/partners (public) or /admin/partners
exports.getAll = async (req, res) => {
  try {
    const partners = await Partner.findAll();
    res.json(partners);
  } catch (err) {
    console.error('Error fetching partners:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /admin/partners
exports.create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, logo_url, website } = req.body;
    const partner = await Partner.create({ name, logo_url, website });
    res.status(201).json(partner);
  } catch (err) {
    console.error('Error creating partner:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /admin/partners/:id
exports.update = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, logo_url, website } = req.body;
    const partner = await Partner.update(req.params.id, { name, logo_url, website });
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    res.json(partner);
  } catch (err) {
    console.error('Error updating partner:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /admin/partners/:id
exports.delete = async (req, res) => {
  try {
    await Partner.delete(req.params.id);
    res.json({ message: 'Partner deleted' });
  } catch (err) {
    console.error('Error deleting partner:', err);
    res.status(500).json({ message: 'Server error' });
  }
};