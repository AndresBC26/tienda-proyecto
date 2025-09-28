// models/Product.js
const mongoose = require('mongoose');

// Define el sub-esquema para las tallas dentro de una variante
const sizeSchema = new mongoose.Schema({
  size: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 }
}, { _id: false });

// Define el sub-esquema para las variantes de color
const variantSchema = new mongoose.Schema({
  colorName: { type: String, required: true },
  colorHex: { type: String, required: true },
  images: [{ type: String }], // Un arreglo de URLs para las imágenes de este color
  sizes: [sizeSchema] // Tallas específicas para este color
}, { _id: false });

// Esquema principal del producto
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  
  // El campo 'variants' reemplaza a 'image' y 'sizes'
  variants: [variantSchema],
  
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
});

module.exports = mongoose.model('Product', productSchema);