// routes/product.routes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const { storage } = require('../config/cloudinary'); // Importa la configuración de Cloudinary

const upload = multer({ storage }); // Usa el almacenamiento de Cloudinary

// GET /api/products - Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/products/:id - Eliminar un producto
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

// POST /api/products - Crear un nuevo producto
router.post('/', upload.array('imageFiles'), async (req, res) => {
  try {
    const { name, description, price, category, variants } = req.body;
    
    if (!variants) {
        return res.status(400).json({ message: 'Faltan los datos de las variantes.' });
    }
    const initialVariants = JSON.parse(variants);
    let fileIndex = 0;

    const finalVariants = initialVariants.map(variant => {
      const newImages = variant.images.map(imgPlaceholder => {
          if (imgPlaceholder === 'placeholder' && req.files[fileIndex]) {
            const imageUrl = req.files[fileIndex].path; // <- Esta es la URL de Cloudinary
            fileIndex++;
            return imageUrl;
          }
          return null; // Será filtrado después
        }).filter(img => img !== null); // Elimina cualquier nulo

      return { ...variant, images: newImages };
    });

    const newProduct = new Product({ name, description, price, category, variants: finalVariants });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error("Error al crear producto:", err);
    res.status(400).json({ message: 'Error al crear el producto: ' + err.message });
  }
});

// PUT /api/products/:id - Actualizar un producto existente
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
                // Si es un placeholder para un archivo nuevo, reemplázalo con la URL de Cloudinary
                if (img === 'new_file_placeholder' && req.files && req.files[fileIndex]) {
                    const newUrl = req.files[fileIndex].path; // <- Esta es la URL de Cloudinary
                    fileIndex++;
                    return newUrl;
                }
                // Si ya es una URL (una imagen existente), consérvala
                if (typeof img === 'string' && img.startsWith('http')) {
                    return img;
                }
                // Si no es ninguno de los dos, es un placeholder sin archivo, ignóralo
                return null;
            }).filter(img => img !== null); // Limpia los nulos

            return { ...variant, images: processedImages };
        });
        
        const updateData = { name, description, price, category, variants: finalVariants };

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