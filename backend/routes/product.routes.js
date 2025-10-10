// backend/routes/product.routes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const { storage, deleteImage } = require('../config/cloudinary');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// ========== CONFIGURACIÓN DE MULTER ==========
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por archivo
    files: 20 // máximo 20 archivos
  },
  fileFilter: (req, file, cb) => {
    console.log('📁 Archivo recibido:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// ========== MIDDLEWARE DE ERRORES DE MULTER ==========
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('❌ Multer Error:', err.code);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'El archivo es demasiado grande. Máximo 10MB por imagen.' 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        message: 'Demasiados archivos. Máximo 20 imágenes por producto.' 
      });
    }
    return res.status(400).json({ 
      message: 'Error en la subida de archivos: ' + err.message 
    });
  }
  if (err.message === 'Solo se permiten archivos de imagen') {
    return res.status(400).json({ 
      message: 'Solo se permiten archivos de imagen (JPEG, PNG, JPG, WEBP)' 
    });
  }
  next(err);
};

// ========== GET - LISTAR PRODUCTOS (PÚBLICO) ==========
router.get('/', async (req, res) => {
  try {
    console.log('📋 Obteniendo productos...');
    const products = await Product.find({});
    console.log(`✅ ${products.length} productos encontrados`);
    res.json(products);
  } catch (err) {
    console.error('❌ Error al obtener productos:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ========== GET - OBTENER UN PRODUCTO (PÚBLICO) ==========
router.get('/:id', async (req, res) => {
  try {
    console.log('🔍 Buscando producto:', req.params.id);
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    console.log('✅ Producto encontrado:', product.name);
    res.json(product);
  } catch (err) {
    console.error('❌ Error al obtener producto:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ========== POST - TEST DE SUBIDA (ADMIN) ==========
router.post('/test-upload', authenticateToken, requireAdmin, upload.single('testImage'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No se recibió ningún archivo',
        success: false
      });
    }
    
    console.log('✅ Test Upload Success:', {
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      user: req.user.id
    });
    
    res.json({
      success: true,
      message: 'Imagen subida exitosamente a Cloudinary',
      file: {
        url: req.file.path,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('❌ Test Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir imagen de prueba',
      error: error.message
    });
  }
});

// ========== POST - CREAR PRODUCTO (ADMIN) ==========
router.post('/', authenticateToken, requireAdmin, upload.array('imageFiles'), handleMulterError, async (req, res) => {
  try {
    console.log('📝 Creando producto...', {
      user: req.user.id,
      filesReceived: req.files ? req.files.length : 0,
      bodyKeys: Object.keys(req.body)
    });
    
    const { name, description, price, category, variants } = req.body;
    
    // Validaciones
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        message: 'Faltan campos requeridos',
        required: ['name', 'description', 'price', 'category']
      });
    }
    
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) {
      return res.status(400).json({ message: 'El precio debe ser un número válido' });
    }
    
    if (!variants) {
      return res.status(400).json({ message: 'Faltan los datos de las variantes' });
    }
    
    // Parsear variantes
    let initialVariants;
    try {
      initialVariants = JSON.parse(variants);
    } catch (parseError) {
      console.error('❌ Error al parsear variantes:', parseError);
      return res.status(400).json({ 
        message: 'Error al parsear variantes',
        error: parseError.message 
      });
    }
    
    // Procesar imágenes
    let fileIndex = 0;
    const finalVariants = initialVariants.map((variant, variantIndex) => {
      const newImages = variant.images.map((imgPlaceholder, imgIndex) => {
        if (imgPlaceholder === 'placeholder' && req.files && req.files[fileIndex]) {
          const imageUrl = req.files[fileIndex].path;
          console.log(`✅ Imagen ${fileIndex + 1} subida:`, imageUrl);
          fileIndex++;
          return imageUrl;
        }
        return null;
      }).filter(img => img !== null);
      
      console.log(`Variante ${variantIndex + 1} (${variant.colorName}): ${newImages.length} imágenes`);
      
      return { 
        ...variant, 
        images: newImages 
      };
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
    console.log('✅ Producto creado exitosamente:', savedProduct._id);
    
    res.status(201).json(savedProduct);
    
  } catch (err) {
    console.error('❌ Error al crear producto:', {
      message: err.message,
      stack: err.stack,
      body: req.body,
      files: req.files ? req.files.length : 0,
      user: req.user ? req.user.id : 'No user'
    });
    
    // Manejo de errores específicos
    if (err.message && err.message.includes('cloudinary')) {
      return res.status(500).json({ 
        message: 'Error al subir imágenes a Cloudinary', 
        error: err.message 
      });
    }
    
    res.status(500).json({ 
      message: 'Error interno del servidor al crear el producto', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
    });
  }
});

// ========== PUT - ACTUALIZAR PRODUCTO (ADMIN) ==========
router.put('/:id', authenticateToken, requireAdmin, upload.array('imageFiles'), handleMulterError, async (req, res) => {
  try {
    console.log('📝 Actualizando producto:', req.params.id, {
      user: req.user.id,
      filesReceived: req.files ? req.files.length : 0
    });
    
    const { name, description, price, category, variants } = req.body;
    
    // Buscar producto existente
    const productToUpdate = await Product.findById(req.params.id);
    if (!productToUpdate) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    // Validar precio
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) {
      return res.status(400).json({ message: 'El precio debe ser un número válido' });
    }
    
    if (!variants) {
      return res.status(400).json({ message: 'Faltan los datos de las variantes' });
    }
    
    // Parsear variantes
    let initialVariants;
    try {
      initialVariants = JSON.parse(variants);
    } catch (parseError) {
      console.error('❌ Error al parsear variantes:', parseError);
      return res.status(400).json({ 
        message: 'Error al parsear variantes',
        error: parseError.message 
      });
    }
    
    // Procesar imágenes (nuevas y existentes)
    let fileIndex = 0;
    const finalVariants = initialVariants.map((variant, variantIndex) => {
      const processedImages = variant.images.map((img, imgIndex) => {
        // Nueva imagen
        if (img === 'new_file_placeholder' && req.files && req.files[fileIndex]) {
          const newUrl = req.files[fileIndex].path;
          console.log(`✅ Nueva imagen subida:`, newUrl);
          fileIndex++;
          return newUrl;
        }
        // Imagen existente (URL de Cloudinary)
        if (typeof img === 'string' && img.startsWith('http')) {
          return img;
        }
        return null;
      }).filter(img => img !== null);
      
      console.log(`Variante ${variantIndex + 1} (${variant.colorName}): ${processedImages.length} imágenes`);
      
      return { 
        ...variant, 
        images: processedImages 
      };
    });
    
    // Actualizar campos
    productToUpdate.name = name;
    productToUpdate.description = description;
    productToUpdate.price = numericPrice;
    productToUpdate.category = category;
    productToUpdate.variants = finalVariants;
    
    // Guardar cambios
    const updatedProduct = await productToUpdate.save();
    console.log('✅ Producto actualizado exitosamente:', updatedProduct._id);
    
    res.json(updatedProduct);
    
  } catch (err) {
    console.error('❌ Error al actualizar producto:', {
      message: err.message,
      stack: err.stack,
      productId: req.params.id,
      files: req.files ? req.files.length : 0,
      user: req.user ? req.user.id : 'No user'
    });
    
    // Manejo de errores específicos
    if (err.message && err.message.includes('cloudinary')) {
      return res.status(500).json({ 
        message: 'Error al subir imágenes a Cloudinary', 
        error: err.message 
      });
    }
    
    res.status(500).json({ 
      message: 'Error al actualizar producto',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
    });
  }
});

// ========== DELETE - ELIMINAR PRODUCTO (ADMIN) ==========
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('🗑️  Eliminando producto:', req.params.id);
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    // Eliminar imágenes de Cloudinary
    console.log('🗑️  Eliminando imágenes de Cloudinary...');
    for (const variant of product.variants) {
      for (const imageUrl of variant.images) {
        await deleteImage(imageUrl);
      }
    }
    
    // Eliminar producto de la DB
    await Product.findByIdAndDelete(req.params.id);
    console.log('✅ Producto eliminado exitosamente');
    
    res.json({ message: 'Producto eliminado correctamente' });
    
  } catch (err) {
    console.error('❌ Error al eliminar producto:', {
      message: err.message,
      productId: req.params.id,
      user: req.user ? req.user.id : 'No user'
    });
    
    res.status(500).json({ 
      message: 'Error al eliminar producto',
      error: err.message 
    });
  }
});

module.exports = router;