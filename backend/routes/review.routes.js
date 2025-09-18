// routes/review.routes.js
const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

// Middleware para proteger rutas
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No hay token, autorización denegada' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ message: 'Token no válido' });
  }
};

// Endpoint para crear una nueva reseña (POST /api/reviews)
router.post('/', auth, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;
    const userName = req.user.name;

    const newReview = new Review({
      product: productId,
      user: userId,
      userName,
      rating,
      comment,
    });

    const savedReview = await newReview.save();

    // Actualizar el rating y reviewCount del producto
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const reviews = await Review.find({ product: productId });
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating = totalRating / reviews.length;
    product.reviewCount = reviews.length;
    await product.save();

    res.status(201).json(savedReview);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Endpoint para obtener todas las reseñas de un producto (GET /api/reviews/product/:productId)
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Endpoint para obtener TODAS las reseñas (GET /api/reviews)
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().populate('product', 'name').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 NUEVO: Endpoint para ELIMINAR una reseña (DELETE /api/reviews/:id)
router.delete('/:id', async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);
    if (!deletedReview) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }
    res.json({ message: 'Reseña eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;