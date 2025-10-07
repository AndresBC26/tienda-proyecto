// routes/product.routes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const { storage } = require('../config/cloudinary');

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
// =====      ✅ RUTA PUT CON DIAGNÓSTICO DETALLADO AÑADIDO ✅        =====
// ========================================================================
router.put('/:id', upload.array('imageFiles'), async (req, res) => {
    console.log('\n--- INICIANDO PETICIÓN PUT /api/products/:id ---');
    try {
        // 1. Ver qué datos de texto llegan del formulario
        console.log('1. req.body recibido:', req.body);
        const { name, description, price, category, variants } = req.body;

        // 2. Ver si los archivos se están subiendo correctamente
        console.log('2. req.files recibido:', req.files);

        if (!variants) {
            console.error('🔥 ERROR: El campo "variants" no llegó en el body.');
            return res.status(400).json({ message: 'Faltan los datos de las variantes (variants).' });
        }

        // 3. Ver el JSON de variantes antes de parsearlo
        console.log('3. String JSON de variantes:', variants);
        const initialVariants = JSON.parse(variants);
        console.log('4. Variantes parseadas (objeto JS):', JSON.stringify(initialVariants, null, 2));

        let fileIndex = 0;

        const finalVariants = initialVariants.map(variant => {
            const newImages = variant.images.map(img => {
                if (img === 'new_file_placeholder' && req.files && req.files[fileIndex]) {
                    const newUrl = req.files[fileIndex].path;
                    console.log(`🔄 Reemplazando placeholder con nueva URL: ${newUrl}`);
                    fileIndex++;
                    return newUrl;
                }
                return img;
            }).filter(imgUrl => typeof imgUrl === 'string' && imgUrl.length > 0); // Filtro extra de seguridad

            return { ...variant, images: newImages };
        });
        
        console.log('5. Objeto final de variantes para la BD:', JSON.stringify(finalVariants, null, 2));

        const updateData = { name, description, price, category, variants: finalVariants };
        console.log('6. Datos completos para enviar a Mongoose:', JSON.stringify(updateData, null, 2));

        // 7. Llamada a la base de datos
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true } // runValidators es clave
        );

        console.log('7. Producto actualizado en la BD con éxito.');

        if (!updatedProduct) {
            console.error('🔥 ERROR: Producto no encontrado con ID:', req.params.id);
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        console.log('--- PETICIÓN PUT COMPLETADA EXITOSAMENTE ---');
        res.json(updatedProduct);

    } catch (err) {
        // Si algo falla, este bloque nos dirá exactamente qué fue
        console.error('❌❌❌ ERROR FATAL EN EL BLOQUE TRY-CATCH ❌❌❌');
        console.error('El error es:', err); // ¡Este es el log más importante!
        res.status(500).json({ 
            message: 'Error interno del servidor. Revisa la consola del backend.',
            error: err.message 
        });
    }
});


module.exports = router;