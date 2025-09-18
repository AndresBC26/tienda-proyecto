// routes/product.routes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/products');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Endpoint para obtener TODOS los productos (GET)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Endpoint para AGREGAR un producto (POST)
router.post('/', upload.single('imageFile'), async (req, res) => {
  try {
    const { name, description, price, category, sizes } = req.body;
    
    let imageUrl = req.body.image;
    if (req.file) {
      imageUrl = `${req.protocol}://${req.get('host')}/public/images/products/${req.file.filename}`;
    }

    // 🔹 IMPORTANTE: Parsear la cadena 'sizes' a un array de objetos
    const parsedSizes = sizes ? JSON.parse(sizes) : [];

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      image: imageUrl,
      sizes: parsedSizes,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Endpoint para EDITAR un producto (PUT)
router.put('/:id', upload.single('imageFile'), async (req, res) => {
  try {
    const { name, description, price, category, sizes } = req.body;
    
    let imageUrl = req.body.image;
    if (req.file) {
      imageUrl = `${req.protocol}://${req.get('host')}/public/images/products/${req.file.filename}`;
    }

    // 🔹 IMPORTANTE: Parsear la cadena 'sizes' a un array de objetos
    const parsedSizes = sizes ? JSON.parse(sizes) : [];

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, category, image: imageUrl, sizes: parsedSizes },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Endpoint para ELIMINAR un producto (DELETE)
router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;