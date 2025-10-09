// backend/routes/product-simple.routes.js - Versión simplificada para debugging
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const { storage } = require('../config/cloudinary');

// Configuración básica de multer
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 20
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo imágenes permitidas'), false);
    }
  }
});

// Middleware de autenticación simple
const simpleAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  console.log('🔍 Simple Auth Check:', {
    hasAuthHeader: !!authHeader,
    hasToken: !!token,
    tokenStart: token ? token.substring(0, 20) + '...' : 'none',
    url: req.url,
    method: req.method
  });
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ 
      message: 'Token requerido',
      debug: 'No authorization header or token found'
    });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    
    console.log('✅ Auth successful:', {
      userId: decoded.id,
      email: decoded.email,
      role: decoded.role
    });
    
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    return res.status(403).json({ 
      message: 'Token inválido',
      debug: error.message
    });
  }
};

// GET - Listar productos (sin autenticación)
router.get('/', async (req, res) => {
  try {
    console.log('📋 Getting products...');
    const products = await Product.find({});
    console.log(`✅ Found ${products.length} products`);
    res.json(products);
  } catch (err) {
    console.error('❌ Error getting products:', err);
    res.status(500).json({ 
      message: 'Error al obtener productos',
      debug: err.message 
    });
  }
});

// POST - Crear producto (con autenticación)
router.post('/', simpleAuth, upload.array('imageFiles'), async (req, res) => {
  try {
    console.log('📝 Creating product...', {
      body: req.body,
      filesCount: req.files ? req.files.length : 0,
      user: req.user ? req.user.id : 'none'
    });
    
    const { name, description, price, category, variants } = req.body;
    
    // Validaciones básicas
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        message: 'Faltan campos requeridos',
        required: ['name', 'description', 'price', 'category']
      });
    }
    
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) {
      return res.status(400).json({ message: 'Precio debe ser un número válido' });
    }
    
    if (!variants) {
      return res.status(400).json({ message: 'Faltan datos de variantes' });
    }
    
    let parsedVariants;
    try {
      parsedVariants = JSON.parse(variants);
    } catch (parseError) {
      return res.status(400).json({ 
        message: 'Error al parsear variantes',
        debug: parseError.message 
      });
    }
    
    // Procesar imágenes
    let fileIndex = 0;
    const finalVariants = parsedVariants.map(variant => {
      const newImages = variant.images.map(imgPlaceholder => {
        if (imgPlaceholder === 'placeholder' && req.files && req.files[fileIndex]) {
          const imageUrl = req.files[fileIndex].path;
          console.log(`✅ Image uploaded: ${imageUrl}`);
          fileIndex++;
          return imageUrl;
        }
        return null;
      }).filter(img => img !== null);
      
      return { ...variant, images: newImages };
    });
    
    // Crear producto
    const newProduct = new Product({
      name,
      description,
      price: numericPrice,
      category,
      variants: finalVariants
    });
    
    const savedProduct = await newProduct.save();
    console.log('✅ Product created:', savedProduct._id);
    
    res.status(201).json(savedProduct);
    
  } catch (err) {
    console.error('❌ Error creating product:', {
      message: err.message,
      stack: err.stack,
      body: req.body,
      filesCount: req.files ? req.files.length : 0
    });
    
    res.status(500).json({
      message: 'Error interno del servidor',
      debug: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// PUT - Actualizar producto
router.put('/:id', simpleAuth, upload.array('imageFiles'), async (req, res) => {
  try {
    console.log('📝 Updating product:', req.params.id);
    
    const productToUpdate = await Product.findById(req.params.id);
    if (!productToUpdate) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    const { name, description, price, category, variants } = req.body;
    const numericPrice = parseFloat(price);
    
    if (isNaN(numericPrice)) {
      return res.status(400).json({ message: 'Precio debe ser un número válido' });
    }
    
    let parsedVariants;
    try {
      parsedVariants = JSON.parse(variants);
    } catch (parseError) {
      return res.status(400).json({ 
        message: 'Error al parsear variantes',
        debug: parseError.message 
      });
    }
    
    // Procesar imágenes para actualización
    let fileIndex = 0;
    const finalVariants = parsedVariants.map(variant => {
      const processedImages = variant.images.map(img => {
        if (img === 'new_file_placeholder' && req.files && req.files[fileIndex]) {
          const newUrl = req.files[fileIndex].path;
          console.log(`✅ New image uploaded: ${newUrl}`);
          fileIndex++;
          return newUrl;
        }
        if (typeof img === 'string' && img.startsWith('http')) {
          return img; // Imagen existente
        }
        return null;
      }).filter(img => img !== null);
      
      return { ...variant, images: processedImages };
    });
    
    // Actualizar producto
    productToUpdate.name = name;
    productToUpdate.description = description;
    productToUpdate.price = numericPrice;
    productToUpdate.category = category;
    productToUpdate.variants = finalVariants;
    
    const updatedProduct = await productToUpdate.save();
    console.log('✅ Product updated:', updatedProduct._id);
    
    res.json(updatedProduct);
    
  } catch (err) {
    console.error('❌ Error updating product:', {
      message: err.message,
      productId: req.params.id,
      filesCount: req.files ? req.files.length : 0
    });
    
    res.status(500).json({
      message: 'Error al actualizar producto',
      debug: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// DELETE - Eliminar producto
router.delete('/:id', simpleAuth, async (req, res) => {
  try {
    console.log('🗑️ Deleting product:', req.params.id);
    
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    console.log('✅ Product deleted:', req.params.id);
    res.json({ message: 'Producto eliminado correctamente' });
    
  } catch (err) {
    console.error('❌ Error deleting product:', {
      message: err.message,
      productId: req.params.id
    });
    
    res.status(500).json({
      message: 'Error al eliminar producto',
      debug: err.message
    });
  }
});

// Endpoint de prueba simple
router.post('/test', simpleAuth, upload.single('testImage'), (req, res) => {
  console.log('🧪 Test endpoint called:', {
    hasFile: !!req.file,
    user: req.user ? req.user.id : 'none',
    body: req.body
  });
  
  if (req.file) {
    console.log('✅ Test file uploaded:', req.file.path);
  }
  
  res.json({
    success: true,
    message: 'Test endpoint funcionando',
    file: req.file ? {
      url: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    } : null,
    user: req.user
  });
});

module.exports = router;
