// routes/product.routes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({ storage });

// --- ENDPOINTS DE LA API ---

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

// POST (con las mejoras de robustez)
router.post('/', upload.array('imageFiles'), async (req, res) => {
  try {
    const { name, description, price, category, variants } = req.body;
    
    if (!variants) {
        return res.status(400).json({ message: 'Faltan los datos de las variantes.' });
    }
    const initialVariants = JSON.parse(variants);
    let fileIndex = 0;

    const finalVariants = initialVariants.map(variant => {
      const newImages = variant.images
        .map(imgPlaceholder => {
          if (imgPlaceholder === 'placeholder' && req.files && req.files[fileIndex]) {
            const imageUrl = req.files[fileIndex].path;
            fileIndex++;
            return imageUrl;
          }
          return null; 
        })
        .filter(img => img !== null);

      return { ...variant, images: newImages };
    });

    const newProduct = new Product({ name, description, price, category, variants: finalVariants });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error("Error al crear producto:", err);
    res.status(400).json({ message: err.message });
  }
});

// ========================================================================
// =====      ✅ RUTA PUT CON LA CORRECCIÓN DEFINITIVA PARA LOCALHOST ✅   =====
// ========================================================================
router.put('/:id', upload.array('imageFiles'), async (req, res) => {
    try {
        const { name, description, price, category, variants } = req.body;

        if (!variants) {
            return res.status(400).json({ message: 'Faltan los datos de las variantes (variants).' });
        }

        const initialVariants = JSON.parse(variants);
        let fileIndex = 0;

        const finalVariants = initialVariants.map(variant => {
            const newImages = variant.images.map(img => {
                // Caso 1: Es un placeholder para un archivo nuevo, lo reemplazamos con la URL de Cloudinary.
                if (img === 'new_file_placeholder' && req.files && req.files[fileIndex]) {
                    const newUrl = req.files[fileIndex].path;
                    fileIndex++;
                    return newUrl;
                }
                
                // Caso 2: Es una URL de Cloudinary válida que ya existía, la conservamos.
                if (typeof img === 'string' && (img.startsWith('https://res.cloudinary.com') || img.startsWith('http://res.cloudinary.com'))) {
                    return img;
                }
                
                // ❗️ LA CLAVE ESTÁ AQUÍ ❗️
                // Caso 3: Es cualquier otra cosa (una URL de localhost, un placeholder corrupto, etc.),
                // la ignoramos por completo devolviendo null.
                return null;

            }).filter(img => img !== null); // Finalmente, limpiamos el array de todos los nulos.

            return { ...variant, images: newImages };
        });
        
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { name, description, price, category, variants: finalVariants },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        
        res.json(updatedProduct);

    } catch (err) {
        console.error('Error fatal al actualizar el producto:', err);
        res.status(500).json({ 
            message: 'Error interno del servidor al actualizar.',
            error: err.message 
        });
    }
});


module.exports = router;