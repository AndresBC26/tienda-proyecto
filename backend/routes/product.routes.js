// routes/product.routes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const { storage } = require('../config/cloudinary'); // ✅ 1. Importamos la nueva configuración

// Usamos el 'storage' de Cloudinary en lugar del local
const upload = multer({ storage });

// --- ENDPOINTS DE LA API ---

// Endpoint para obtener TODOS los productos (GET) - Sin cambios
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ 2. Endpoint para AGREGAR un producto (POST) - CORREGIDO PARA CLOUDINARY
router.post('/', upload.array('imageFiles'), async (req, res) => {
  try {
    const { name, description, price, category, variants } = req.body;
    
    const initialVariants = JSON.parse(variants);
    let fileIndex = 0;

    const finalVariants = initialVariants.map(variant => {
      const newImages = variant.images.map(imgPlaceholder => {
        if ((imgPlaceholder === 'placeholder' || imgPlaceholder === 'new_file_placeholder') && req.files[fileIndex]) {
          // req.files[fileIndex].path ahora contiene la URL segura de Cloudinary
          const imageUrl = req.files[fileIndex].path;
          fileIndex++;
          return imageUrl;
        }
        return imgPlaceholder;
      });
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

// ✅ 3. Endpoint para EDITAR un producto (PUT) - CORREGIDO PARA CLOUDINARY
router.put('/:id', upload.array('imageFiles'), async (req, res) => {
    try {
        const { name, description, price, category, variants } = req.body;
        
        const initialVariants = JSON.parse(variants);
        let fileIndex = 0;

        const finalVariants = initialVariants.map(variant => {
            const newImages = variant.images.map(img => {
                if (img === 'new_file_placeholder' && req.files[fileIndex]) {
                    // La URL de la nueva imagen viene directamente de Cloudinary
                    const newUrl = req.files[fileIndex].path;
                    fileIndex++;
                    return newUrl;
                }
                return img; // Mantiene las URLs existentes
            });
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

// Endpoint para ELIMINAR un producto (DELETE) - Sin cambios
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