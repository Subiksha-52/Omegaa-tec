  const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const auth = require('../middleware/auth');

// Get cart for user - requires authentication
router.get('/', auth, async (req, res) => {
  const userId = req.user.id; // Get user ID from authenticated request
  try {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) {
      return res.json({ items: [], totalAmount: 0 });
    }
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity, 0
    );
    res.json({ items: cart.items, totalAmount });
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart", error });
  }
});

// Add/update item - requires authentication
router.post('/add', auth, async (req, res) => {
  const userId = req.user.id; // Get user ID from authenticated request
  const { productId, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, items: [] });
    const item = cart.items.find(i => i.product.equals(productId));
    if (item) item.quantity += quantity;
    else cart.items.push({ product: productId, quantity });
    await cart.save();
    await cart.populate('items.product');
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity, 0
    );
    res.json({ items: cart.items, totalAmount });
  } catch (error) {
    res.status(500).json({ message: "Error updating cart", error });
  }
});

// Remove item - requires authentication
router.post('/remove', auth, async (req, res) => {
  const userId = req.user.id; // Get user ID from authenticated request
  const { productId } = req.body;
  try {
    let cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items = cart.items.filter(i => !i.product.equals(productId));
      await cart.save();
      await cart.populate('items.product');
    }
    const totalAmount = cart?.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity, 0
    ) || 0;
    res.json({ items: cart?.items || [], totalAmount });
  } catch (error) {
    res.status(500).json({ message: "Error removing item from cart", error });
  }
});

// Edit quantity - requires authentication
router.post('/edit', auth, async (req, res) => {
  const userId = req.user.id; // Get user ID from authenticated request
  const { productId, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ user: userId });
    if (cart) {
      const item = cart.items.find(i => i.product.equals(productId));
      if (item) item.quantity = quantity;
      await cart.save();
      await cart.populate('items.product');
    }
    const totalAmount = cart?.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity, 0
    ) || 0;
    res.json({ items: cart?.items || [], totalAmount });
  } catch (error) {
    res.status(500).json({ message: "Error editing cart item", error });
  }
});

module.exports = router;
