// routes/product.routes.js (Versión con Diagnóstico Avanzado)
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({ storage }); 

// GET y DELETE no necesitan cambios
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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

// POST /api/products - Crear un nuevo producto (CON MEJORAS DE DEBUGGING)
router.post('/', upload.array('imageFiles'), async (req, res) => {
  let parsedVariants; 
  try {
    const { name, description, price, category, variants } = req.body;

    // --- PASO 1: Validar datos de texto ---
    if (!name || !price || !category || !variants) {
      return res.status(400).json({ message: 'Faltan campos requeridos: nombre, precio, categoría o variantes.' });
    }

    // --- PASO 2: Parsear y validar variantes ---
    try {
      parsedVariants = JSON.parse(variants);
    } catch (parseError) {
      console.error("Error al parsear JSON de variantes:", variants);
      return res.status(400).json({ message: 'El formato de las variantes es incorrecto.', details: parseError.message });
    }

    // --- PASO 3: Procesar imágenes ---
    let fileIndex = 0;
    const finalVariants = parsedVariants.map(variant => {
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

    // --- PASO 4: Crear y guardar el producto en la base de datos ---
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) {
      return res.status(400).json({ message: 'El precio debe ser un número válido.' });
    }

    const newProduct = new Product({ 
      name, 
      description, 
      price: numericPrice, 
      category, 
      variants: finalVariants 
    });

    const savedProduct = await newProduct.save();

    res.status(201).json(savedProduct);

  } catch (err) {
    // --- MANEJO DE ERRORES DETALLADO ---
    console.error("--- ERROR GRAVE EN POST /api/products ---");
    console.error("Mensaje:", err.message);
    console.error("Stack:", err.stack);
    console.error("Request Body:", req.body);
    console.error("Parsed Variants:", parsedVariants);
    console.error("Uploaded Files:", req.files);

    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Error de validación. Revisa los campos del producto.', details: err.errors });
    }

    res.status(500).json({ 
      message: 'Error interno del servidor al crear el producto.', 
      details: err.message 
    });
  }
});

// PUT /api/products/:id - Actualizar un producto (CON MEJORAS DE DEBUGGING)
router.put('/:id', upload.array('imageFiles'), async (req, res) => {
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

        const updateData = { name, description, price: numericPrice, category, variants: finalVariants };

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(updatedProduct);

    } catch (err) {
        console.error('Error detallado al actualizar producto:', {
            message: err.message,
            stack: err.stack,
            body: req.body,
            files: req.files,
            productId: req.params.id
        });

        if (err.name === 'ValidationError') {
          return res.status(400).json({ message: 'Error de validación al actualizar.', details: err.errors });
        }

        res.status(500).json({ 
            message: 'Error interno del servidor al actualizar.',
            error: err.message 
        });
    }
});

module.exports = router;