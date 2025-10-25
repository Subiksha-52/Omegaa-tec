const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  description: { type: String, required: true },
  images: [{ type: String }], // array of image paths
  image: { type: String }, // main image (backward compatibility)
  features: [{ type: String }], // array of key features
  specifications: { 
    type: Map,
    of: String
  }, // key-value pairs for specifications
  rating: { type: Number, default: 0, min: 0, max: 5 },
  sold: { type: Number, default: 0 },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
