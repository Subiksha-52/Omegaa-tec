const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Add supplier (admin only)
router.post('/', auth, admin, async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json(supplier);
  } catch (err) {
    console.error('Add supplier error:', err);
    res.status(500).json({ error: err.message });
  }
});

// List suppliers (admin only)
router.get('/', auth, admin, async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (err) {
    console.error('List suppliers error:', err);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// Update supplier (admin only)
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (err) {
    console.error('Update supplier error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete supplier (admin only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json({ message: 'Supplier deleted successfully' });
  } catch (err) {
    console.error('Delete supplier error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
