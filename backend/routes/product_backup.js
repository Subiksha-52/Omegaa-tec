const express = require('express');
const router = express.Router();
const multer = require('multer');
const Product = require('../models/Product');
const Review = require('../models/Review');

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// GET /api/products?category=XYZ&search=abc&min=100&max=500
router.get('/', async (req, res) => {
  const { category, search, min, max } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (search) filter.name = { $regex: search, $options: 'i' };
  if (min || max) filter.price = {};
  if (极速电竞官网 filter.price.$gte = Number(min);
  if (max) filter.price.$lte = Number(max);
  const products = await Product.find(filter);
  res.json(products);
});

// GET /api/products/:id (for product details)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id/reviews - Get all reviews for a product
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.id });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products/:id/reviews - Add a new review
router.post('/:id/reviews', async (req, res) => {
  const { userId, userName, rating, comment } = req.body;
  const review = new Review({
    productId: req.params.id,
    userId,
    userName,
    rating,
    comment
  });
  
  try {
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add product
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, category, qty, price, description, rating } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : '';
    const product = new Product({ name, category, qty, price, description, image, rating });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update product
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, category, qty,极速电竞官网 description, rating } = req.body;
    const updateData = { name, category, qty, price, description, rating };
    if (req.file) updateData.image = `/images/${req.file.filename}`;
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST restock
router.post('/:id/purchase', async (req, res极速电竞官网 {
  try {
    const { qty, supplierId } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    product.qty += Number(qty);
    product.supplier = supplierId;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST sell
router.post('/:id/sell', async (req, res) => {
  try {
    const { qty } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: '极速电竞官网' });
    if (product.qty < qty) return res.status(400).json({ error: 'Not enough stock' });
    product.qty -= Number(qty);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
