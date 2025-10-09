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
    transformation: [{ width: 1024, height: 1024, crop: 'limit' }],
    // Configuración adicional para manejo de errores
    resource_type: 'image',
    public_id: (req, file) => {
      // Genera un nombre único para cada imagen
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      return `product_${timestamp}_${randomString}`;
    }
  },
});

// Función para verificar la configuración de Cloudinary
const verifyCloudinaryConfig = () => {
  try {
    const config = cloudinary.config();
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      console.error('❌ Error: Configuración de Cloudinary incompleta');
      console.error('Verifica que las variables de entorno estén configuradas:');
      console.error('- CLOUDINARY_CLOUD_NAME');
      console.error('- CLOUDINARY_API_KEY');
      console.error('- CLOUDINARY_API_SECRET');
      return false;
    }
    console.log('✅ Configuración de Cloudinary verificada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al verificar configuración de Cloudinary:', error.message);
    return false;
  }
};

module.exports = {
  cloudinary,
  storage,
  verifyCloudinaryConfig,
};