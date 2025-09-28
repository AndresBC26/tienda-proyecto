// routes/product.routes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');

// Configuración de Multer (sin cambios)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/products');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

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

// ========================================================================
// =====            ✅ INICIO DE LA CORRECCIÓN DEFINITIVA             =====
// ========================================================================

// Endpoint para AGREGAR un producto (POST) - CORREGIDO
router.post('/', upload.array('imageFiles'), async (req, res) => {
  try {
    const { name, description, price, category, variants } = req.body;
    
    const initialVariants = JSON.parse(variants);
    let fileIndex = 0;

    // CLAVE DE LA SOLUCIÓN: Usamos .map() para crear un nuevo array de variantes
    // en lugar de modificar el original con .forEach(). Esto evita errores de sincronización.
    const finalVariants = initialVariants.map(variant => {
      const newImages = variant.images.map(imgPlaceholder => {
        // Si el 'placeholder' corresponde a un nuevo archivo y aún hay archivos en la cola...
        if ((imgPlaceholder === 'placeholder' || imgPlaceholder === 'new_file_placeholder') && req.files[fileIndex]) {
          // Se construye la URL y se avanza el contador de forma segura.
          const imageUrl = `${req.protocol}://${req.get('host')}/public/images/products/${req.files[fileIndex].filename}`;
          fileIndex++;
          return imageUrl;
        }
        // Si no, se mantiene la URL existente (importante para editar).
        return imgPlaceholder;
      });
      // Devolvemos la variante actualizada con su array de imágenes correcto.
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

// Endpoint para EDITAR un producto (PUT) - CORREGIDO con la misma lógica robusta
router.put('/:id', upload.array('imageFiles'), async (req, res) => {
    try {
        const { name, description, price, category, variants } = req.body;
        
        const initialVariants = JSON.parse(variants);
        let fileIndex = 0;

        // Se aplica la misma lógica segura de .map() para la edición.
        const finalVariants = initialVariants.map(variant => {
            const newImages = variant.images.map(img => {
                if (img === 'new_file_placeholder' && req.files[fileIndex]) {
                    const newUrl = `${req.protocol}://${req.get('host')}/public/images/products/${req.files[fileIndex].filename}`;
                    fileIndex++;
                    return newUrl;
                }
                return img; // Mantiene las URLs existentes que no se cambiaron.
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
        console.error("Error al actualizar producto:", err);
        res.status(400).json({ message: err.message });
    }
});

// ========================================================================
// =====             FIN DE LA CORRECCIÓN DEFINITIVA                  =====
// ========================================================================

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