// backend/routes/product.routes.js (Versión con Lógica de Actualización Mejorada)
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Configuración mejorada de multer con validaciones
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por archivo
    files: 20 // máximo 20 archivos
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
}); 

// GET y DELETE (sin cambios)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Endpoint de prueba para subida de imágenes
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
      message: 'Imagen subida exitosamente',
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

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar producto:', {
      message: err.message,
      stack: err.stack,
      productId: req.params.id,
      user: req.user ? req.user.id : 'No user'
    });
    res.status(500).json({ message: err.message });
  }
});

// Middleware para manejar errores de Multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
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

// POST - Crear producto (requiere autenticación de admin)
router.post('/', authenticateToken, requireAdmin, upload.array('imageFiles'), handleMulterError, async (req, res) => {
    try {
        const { name, description, price, category, variants } = req.body;
        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice)) {
            return res.status(400).json({ message: 'El precio debe ser un número válido.' });
        }
        if (!variants) {
            return res.status(400).json({ message: 'Faltan los datos de las variantes.' });
        }
        const initialVariants = JSON.parse(variants);
        let fileIndex = 0;
        const finalVariants = initialVariants.map(variant => {
            const newImages = variant.images.map(imgPlaceholder => {
                if (imgPlaceholder === 'placeholder' && req.files && req.files[fileIndex]) {
                    const imageUrl = req.files[fileIndex].path;
                    fileIndex++;
                    return imageUrl;
                }
                return null;
            }).filter(img => img !== null);
            return { ...variant, images: newImages };
        });
        const newProduct = new Product({ name, description, price: numericPrice, category, variants: finalVariants });
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        console.error("Error detallado al crear producto:", {
            message: err.message,
            stack: err.stack,
            body: req.body,
            files: req.files ? req.files.length : 0,
            user: req.user ? req.user.id : 'No user'
        });
        
        // Manejo específico de errores de Cloudinary
        if (err.message && err.message.includes('cloudinary')) {
            return res.status(500).json({ 
                message: 'Error al subir imágenes a Cloudinary', 
                error: err.message 
            });
        }
        
        // Manejo específico de errores de Multer
        if (err.message && err.message.includes('imagen')) {
            return res.status(400).json({ 
                message: 'Error en el archivo de imagen', 
                error: err.message 
            });
        }
        
        res.status(500).json({ 
            message: 'Error interno del servidor al crear el producto', 
            error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
        });
    }
});


// ====================== INICIO DE LA CORRECCIÓN DEFINITIVA ======================
// PUT /api/products/:id - Actualizar un producto existente (requiere autenticación de admin)
router.put('/:id', authenticateToken, requireAdmin, upload.array('imageFiles'), handleMulterError, async (req, res) => {
    try {
        const { name, description, price, category, variants } = req.body;

        // 1. Busca el producto existente en la base de datos.
        const productToUpdate = await Product.findById(req.params.id);
        if (!productToUpdate) {
            return res.status(404).json({ message: 'Producto no encontrado para actualizar' });
        }

        // 2. Procesa los datos y las imágenes como antes.
        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice)) {
            return res.status(400).json({ message: 'El precio debe ser un número válido.' });
        }

        if (!variants) {
            return res.status(400).json({ message: 'Faltan los datos de las variantes.' });
        }

        const initialVariants = JSON.parse(variants);
        let fileIndex = 0;

        const finalVariants = initialVariants.map(variant => {
            const processedImages = variant.images.map(img => {
                if (img === 'new_file_placeholder' && req.files && req.files[fileIndex]) {
                    const newUrl = req.files[fileIndex].path;
                    fileIndex++;
                    return newUrl;
                }
                if (typeof img === 'string' && img.startsWith('http')) {
                    return img;
                }
                return null;
            }).filter(img => img !== null);
            return { ...variant, images: processedImages };
        });

        // 3. Actualiza el documento campo por campo de forma explícita.
        productToUpdate.name = name;
        productToUpdate.description = description;
        productToUpdate.price = numericPrice;
        productToUpdate.category = category;
        productToUpdate.variants = finalVariants; // Reemplaza el array completo

        // 4. Guarda el documento modificado. Mongoose se encarga del resto.
        const updatedProduct = await productToUpdate.save();

        res.json(updatedProduct);

    } catch (err) {
        console.error('Error detallado al actualizar producto:', {
            message: err.message,
            stack: err.stack,
            body: req.body,
            files: req.files ? req.files.length : 0,
            productId: req.params.id,
            user: req.user ? req.user.id : 'No user'
        });
        
        // Manejo específico de errores de Cloudinary
        if (err.message && err.message.includes('cloudinary')) {
            return res.status(500).json({ 
                message: 'Error al subir imágenes a Cloudinary', 
                error: err.message 
            });
        }
        
        // Manejo específico de errores de Multer
        if (err.message && err.message.includes('imagen')) {
            return res.status(400).json({ 
                message: 'Error en el archivo de imagen', 
                error: err.message 
            });
        }
        
        res.status(500).json({ 
            message: 'Error interno del servidor al actualizar producto',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
        });
    }
});
// ======================= FIN DE LA CORRECCIÓN DEFINITIVA =======================

module.exports = router;