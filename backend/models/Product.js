// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String },
  sizes: [{
    size: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 }
  }],
  rating: { type: Number, default: 0 }, // 🔹 NUEVO: Calificación promedio
  reviewCount: { type: Number, default: 0 }, // 🔹 NUEVO: Contador de reseñas
});

module.exports = mongoose.model('Product', productSchema);