// routes/product.routes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({ storage });

// --- GET Y DELETE NO CAMBIAN ---
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

// --- POST CON MÁS LOGS PARA DEPURACIÓN ---
router.post('/', upload.array('imageFiles'), async (req, res) => {
  console.log('--- INICIANDO POST /api/products ---');
  try {
    console.log('1. Archivos recibidos por multer:', req.files ? req.files.length : 0);
    console.log('2. Body recibido:', req.body);
    
    const { name, description, price, category, variants } = req.body;
    
    if (!variants) {
        console.error('ERROR: No se encontró el campo "variants" en el body.');
        return res.status(400).json({ message: 'Faltan los datos de las variantes.' });
    }

    console.log('3. Parseando variantes...');
    const initialVariants = JSON.parse(variants);
    let fileIndex = 0;

    console.log('4. Mapeando variantes y reemplazando placeholders...');
    const finalVariants = initialVariants.map(variant => {
      const newImages = variant.images.map(imgPlaceholder => {
          if (imgPlaceholder === 'placeholder' && req.files && req.files[fileIndex]) {
            const imageUrl = req.files[fileIndex].path;
            console.log(`  -> Reemplazando placeholder con URL: ${imageUrl}`);
            fileIndex++;
            return imageUrl;
          }
          return null;
        }).filter(img => img !== null);

      return { ...variant, images: newImages };
    });

    const productData = { name, description, price: Number(price), category, variants: finalVariants };
    console.log('5. Datos finales para guardar en la BD:', JSON.stringify(productData, null, 2));

    const newProduct = new Product(productData);
    
    console.log('6. Guardando producto en la BD...');
    const savedProduct = await newProduct.save();
    
    console.log('--- PRODUCTO CREADO EXITOSAMENTE ---');
    res.status(201).json(savedProduct);

  } catch (err) {
    console.error('❌ ERROR FATAL en la ruta POST /api/products:', err);
    res.status(500).json({ message: 'Error interno del servidor: ' + err.message });
  }
});

// --- PUT (ACTUALIZAR) - SIN CAMBIOS ---
router.put('/:id', upload.array('imageFiles'), async (req, res) => {
    try {
        const { name, description, price, category, variants } = req.body;
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
        const updateData = { name, description, price: Number(price), category, variants: finalVariants };
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
        console.error('Error al actualizar producto:', err);
        res.status(500).json({ 
            message: 'Error interno del servidor al actualizar.',
            error: err.message 
        });
    }
});


module.exports = router;