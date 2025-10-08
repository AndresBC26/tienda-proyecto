// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configura Cloudinary usando las variables de entorno que acabas de agregar
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY, // Esta línea está correcta
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configura el almacenamiento para que Multer suba los archivos a Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'elegancia_urban_products', // El nombre de la carpeta está bien
    allowed_formats: ['jpeg', 'png', 'jpg', 'webp'], // Formatos permitidos
  },
});

module.exports = {
  cloudinary,
  storage,
};