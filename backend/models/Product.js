const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: String,
  images: [String],
  category: String,
  description: String,
  features: [String],
  specifications: Object,
  stock: Number,
  rating: Number,
  reviewCount: Number,
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);


