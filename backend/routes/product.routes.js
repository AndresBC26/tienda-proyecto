// routes/product.routes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const { storage } = require('../config/cloudinary'); // Asumo que este archivo está bien configurado

const upload = multer({ storage });

// GET y DELETE no necesitan cambios...
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

    // ✅ CORRECCIÓN AQUÍ: Asegúrate de que req.files existe antes de mapear
    const finalVariants = initialVariants.map(variant => {
      const newImages = variant.images
        .map(imgPlaceholder => {
          // Si el placeholder es para un archivo nuevo y hay archivos subidos
          if (imgPlaceholder === 'placeholder' && req.files && req.files[fileIndex]) {
            const imageUrl = req.files[fileIndex].path; // Esta es la URL de Cloudinary
            fileIndex++;
            return imageUrl;
          }
          return null; // Ignora placeholders si no hay más archivos
        })
        .filter(img => img !== null); // Limpia los nulos

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
// =====      ✅ RUTA PUT CON DIAGNÓSTICO DETALLADO AÑADIDO ✅        =====
// ========================================================================
router.put('/:id', upload.array('imageFiles'), async (req, res) => {
    console.log('\n--- INICIANDO PETICIÓN PUT /api/products/:id ---');
    try {
        const { name, description, price, category, variants } = req.body;
        console.log('1. req.body recibido:', req.body);
        console.log('2. req.files recibido:', req.files);

        if (!variants) {
            return res.status(400).json({ message: 'Faltan los datos de las variantes (variants).' });
        }

        const initialVariants = JSON.parse(variants);
        let fileIndex = 0;

        const finalVariants = initialVariants.map(variant => {
            const newImages = variant.images.map(img => {
                // ✅ CORRECCIÓN AQUÍ: Reemplaza el placeholder con la URL de Cloudinary
                if (img === 'new_file_placeholder' && req.files && req.files[fileIndex]) {
                    const newUrl = req.files[fileIndex].path; // Esta es la URL de Cloudinary
                    console.log(`🔄 Reemplazando placeholder con nueva URL: ${newUrl}`);
                    fileIndex++;
                    return newUrl;
                }
                // Mantiene las URLs existentes que no son placeholders
                return img;
            }).filter(imgUrl => typeof imgUrl === 'string' && imgUrl.startsWith('http')); // Filtro de seguridad para solo guardar URLs válidas

            return { ...variant, images: newImages };
        });
        
        console.log('5. Objeto final de variantes para la BD:', JSON.stringify(finalVariants, null, 2));

        const updateData = { name, description, price, category, variants: finalVariants };

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        console.log('--- PETICIÓN PUT COMPLETADA EXITOSAMENTE ---');
        res.json(updatedProduct);

    } catch (err) {
        console.error('❌❌❌ ERROR FATAL EN EL BLOQUE TRY-CATCH ❌❌❌');
        console.error('El error es:', err);
        res.status(500).json({ 
            message: 'Error interno del servidor. Revisa la consola del backend.',
            error: err.message 
        });
    }
});


module.exports = router;