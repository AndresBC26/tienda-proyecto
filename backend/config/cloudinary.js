// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ========== CONFIGURACIÓN DE CLOUDINARY ==========
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verificar configuración al iniciar
console.log('☁️  Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✅ Configurado' : '❌ Falta',
  api_key: process.env.CLOUDINARY_API_KEY ? '✅ Configurado' : '❌ Falta',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '✅ Configurado' : '❌ Falta'
});

// ========== CONFIGURACIÓN DEL STORAGE ==========
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products', // Carpeta en Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      { 
        width: 1200, 
        height: 1200, 
        crop: 'limit',
        quality: 'auto:good'
      }
    ]
  }
});

// ========== FUNCIÓN PARA ELIMINAR IMÁGENES ==========
const deleteImage = async (imageUrl) => {
  try {
    // Extraer el public_id de la URL de Cloudinary
    // Ejemplo: https://res.cloudinary.com/xxx/image/upload/v123456/products/abc123.jpg
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) {
      console.warn('⚠️  URL no parece ser de Cloudinary:', imageUrl);
      return false;
    }
    
    // Obtener todo después de 'upload/vXXXXXX/'
    const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join('/');
    const publicId = publicIdWithExtension.split('.')[0];
    
    console.log('🗑️  Intentando eliminar imagen:', publicId);
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log('✅ Imagen eliminada exitosamente:', publicId);
      return true;
    } else {
      console.warn('⚠️  No se pudo eliminar la imagen:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Error al eliminar imagen:', error.message);
    return false;
  }
};

// ========== TEST DE CONEXIÓN ==========
const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary conectado exitosamente:', result);
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con Cloudinary:', error.message);
    return false;
  }
};

module.exports = { 
  cloudinary, 
  storage,
  deleteImage,
  testCloudinaryConnection
};