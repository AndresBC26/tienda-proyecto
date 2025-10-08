// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// NO es necesario volver a configurar las credenciales aquí.
// El archivo server.js ya lo hizo por toda la aplicación.

// Simplemente crea el objeto de almacenamiento para que Multer lo use.
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'elegancia_urban_products', // El nombre de tu carpeta en Cloudinary
    allowed_formats: ['jpeg', 'png', 'jpg', 'webp'],
    // Opcional: optimiza y estandariza el tamaño de las imágenes subidas
    transformation: [{ width: 1024, height: 1024, crop: 'limit' }]
  },
});

module.exports = {
  cloudinary,
  storage,
};