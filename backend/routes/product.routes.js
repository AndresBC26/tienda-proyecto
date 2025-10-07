// routes/product.routes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({ storage });

// --- ENDPOINTS DE LA API ---

// GET (Sin cambios)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ POST (CORREGIDO Y MEJORADO)
router.post('/', upload.array('imageFiles'), async (req, res) => {
  try {
    const { name, description, price, category, variants } = req.body;
    
    const initialVariants = JSON.parse(variants);
    let fileIndex = 0;

    const finalVariants = initialVariants.map(variant => {
      const newImages = variant.images
        .map(imgPlaceholder => {
          // 1. Asegurarse de que el placeholder es el correcto y que el archivo existe
          if (imgPlaceholder === 'placeholder' && req.files && req.files[fileIndex]) {
            const imageUrl = req.files[fileIndex].path;
            fileIndex++;
            return imageUrl;
          }
          // 2. Si es una URL existente (no debería pasar en POST, pero es buena práctica), mantenerla
          if (typeof imgPlaceholder === 'string' && imgPlaceholder.startsWith('http')) {
              return imgPlaceholder;
          }
          // 3. Ignorar cualquier placeholder que no tenga un archivo correspondiente
          return null; 
        })
        .filter(img => img !== null); // 4. Limpiar el array de nulos para no guardar basura

      return { ...variant, images: newImages };
    });

    const newProduct = new Product({ name, description, price, category, variants: finalVariants });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error("Error al crear producto con Cloudinary:", err);
    res.status(400).json({ message: err.message });
  }
});

// ✅ PUT (CORREGIDO Y MEJORADO)
router.put('/:id', upload.array('imageFiles'), async (req, res) => {
    try {
        const { name, description, price, category, variants } = req.body;
        
        const initialVariants = JSON.parse(variants);
        let fileIndex = 0;

        const finalVariants = initialVariants.map(variant => {
            const newImages = variant.images.map(img => {
                // 1. Si es un placeholder para un archivo nuevo y el archivo existe
                if (img === 'new_file_placeholder' && req.files && req.files[fileIndex]) {
                    const newUrl = req.files[fileIndex].path;
                    fileIndex++;
                    return newUrl;
                }
                // 2. Si es una URL existente, la mantenemos
                if (typeof img === 'string' && img.startsWith('http')) {
                    return img;
                }
                // 3. Ignoramos cualquier placeholder inválido o sin archivo
                return null;
            }).filter(img => img !== null); // 4. Limpiamos nulos para no guardar basura

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
        console.error("Error al actualizar producto con Cloudinary:", err);
        res.status(400).json({ message: err.message });
    }
});


// DELETE (Sin cambios)
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