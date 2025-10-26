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

// GET /api/products?category=XYZ&search=abc&min=100&max=500&page=1&limit=10&sortBy=price&sortOrder=asc
router.get('/', async (req, res) => {
  try {
    const {
      category,
      search,
      min,
      max,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    // Category filter
    if (category) filter.category = category;

    // Price range filter
    if (min || max) {
      filter.price = {};
      if (min) filter.price.$gte = Number(min);
      if (max) filter.price.$lte = Number(max);
    }

    // Search filter - use regex search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination info
    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalProducts: total,
        hasNextPage: Number(page) * Number(limit) < total,
        hasPrevPage: Number(page) > 1
      }
    });
  } catch (err) {
    console.error('Product search error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id (for product details)
// GET /api/products/related/:id - related products by category (exclude current)
router.get('/related/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Find other products in same category, exclude current
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    }).limit(10);

    res.json(related);
  } catch (err) {
    console.error('Related products error:', err);
    res.status(500).json({ error: err.message });
  }
});

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

const auth = require('../middleware/auth');

// POST /api/products/:id/reviews - Add a new review (requires authentication)
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ error: 'Rating and comment are required' });
    }

    const review = new Review({
      productId: req.params.id,
      userId: req.user.id,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      rating: parseInt(rating),
      comment
    });

    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add product
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, category, stock, price, description, rating, features, specifications } = req.body;

    // Parse features from comma-separated string to array
    let parsedFeatures = [];
    if (features) {
      try {
        parsedFeatures = features.split(',').map(f => f.trim()).filter(f => f);
      } catch (e) {
        parsedFeatures = [];
      }
    }

    // Parse specifications from JSON string to object
    let parsedSpecifications = {};
    if (specifications) {
      try {
        parsedSpecifications = JSON.parse(specifications);
      } catch (e) {
        parsedSpecifications = {};
      }
    }

    const image = req.file ? `/images/${req.file.filename}` : '';
    const product = new Product({
      name,
      category,
      stock: Number(stock),
      price: Number(price),
      description,
      image,
      rating: rating ? Number(rating) : 0,
      features: parsedFeatures,
      specifications: parsedSpecifications
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update product
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, category, stock, price, description, rating, features, specifications } = req.body;

    // Parse features from comma-separated string to array
    let parsedFeatures = [];
    if (features) {
      try {
        parsedFeatures = features.split(',').map(f => f.trim()).filter(f => f);
      } catch (e) {
        parsedFeatures = [];
      }
    }

    // Parse specifications from JSON string to object
    let parsedSpecifications = {};
    if (specifications) {
      try {
        parsedSpecifications = JSON.parse(specifications);
      } catch (e) {
        parsedSpecifications = {};
      }
    }

    const updateData = {
      name,
      category,
      stock: Number(stock),
      price: Number(price),
      description,
      rating: rating ? Number(rating) : 0,
      features: parsedFeatures,
      specifications: parsedSpecifications
    };
    if (req.file) updateData.image = `/images/${req.file.filename}`;
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(product);
  } catch (err) {
    console.error('Error updating product:', err);
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
router.post('/:id/purchase', async (req, res) => {
  try {
    const { stock, supplierId } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    const oldStock = product.stock;
    product.stock += Number(stock);
    product.supplier = supplierId;
    await product.save();

    // Low stock alert check
    if (product.stock < 5 && oldStock >= 5) {
      console.log(`LOW STOCK ALERT: ${product.name} stock is now ${product.stock}. Consider restocking.`);
      // Optionally send email to admin here
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST sell
router.post('/:id/sell', async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    if (product.stock < stock) return res.status(400).json({ error: 'Not enough stock' });
    product.stock -= Number(stock);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET low stock products (admin only)
router.get('/low-stock', async (req, res) => {
  try {
    const lowStockProducts = await Product.find({ stock: { $lt: 5 } });
    res.json(lowStockProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product stock/inventory (admin only)
router.put('/:id/stock', async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    product.stock = Number(stock);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
