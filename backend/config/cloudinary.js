// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

// ✅ MEJORA 1: Verificación estricta de variables de entorno al inicio.
// Si falta alguna variable, la aplicación se detendrá con un error claro.
const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Error de configuración: La variable de entorno ${envVar} es requerida.`);
  }
}

// ========== CONFIGURACIÓN DE CLOUDINARY ==========
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('☁️  Cloudinary Configurado Correctamente.');

// ========== CONFIGURACIÓN DEL STORAGE ==========
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // ✅ MEJORA 2: Organización dinámica de carpetas por fecha (Año/Mes).
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    
    // ✅ MEJORA 3: Nombre de archivo único y descriptivo.
    // Se extrae el nombre original sin la extensión y se le añade un timestamp.
    const originalName = path.parse(file.originalname).name;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

    return {
      folder: `products/${year}/${month}`, // Ej: products/2025/10
      public_id: `${originalName}-${uniqueSuffix}`, // Ej: camiseta-negra-1665432109876-123456789
      
      // ✅ MEJORA 4: Formatos permitidos actualizados (incluye avif).
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'],

      // ✅ MEJORA 5: Transformación optimizada para la web.
      transformation: [
        { 
          width: 1200, 
          height: 1200, 
          crop: 'limit' // Limita las dimensiones sin deformar la imagen
        },
        { 
          quality: 'auto:good', // Calidad optimizada automáticamente
          fetch_format: 'auto' // Cloudinary elige el mejor formato para el navegador (ej: webp, avif)
        }
      ]
    };
  }
});

// ========== FUNCIÓN PARA ELIMINAR IMÁGENES ==========
// ✅ MEJORA 6: Función de eliminación más robusta.
const deleteImage = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    console.warn('⚠️  URL no válida o no es de Cloudinary. No se puede eliminar:', imageUrl);
    return false;
  }

  try {
    // Extrae el public_id de la URL de forma más segura.
    // Funciona para URLs con o sin extensiones de archivo.
    const publicId = imageUrl.split('/').slice(-3).join('/').split('.')[0];
    
    console.log('🗑️  Intentando eliminar imagen de Cloudinary:', publicId);
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log('✅ Imagen eliminada exitosamente de Cloudinary:', publicId);
      return true;
    } else {
      // Si el resultado no es 'ok', pero tampoco es 'not found', lo advertimos.
      if (result.result !== 'not found') {
        console.warn('⚠️  Cloudinary no pudo eliminar la imagen:', result);
      } else {
        console.log('ℹ️  La imagen ya no existía en Cloudinary:', publicId);
      }
      return false;
    }
  } catch (error) {
    console.error('❌ Error crítico al intentar eliminar imagen de Cloudinary:', error.message);
    return false;
  }
};

// ========== TEST DE CONEXIÓN ==========
const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    if (result.status === 'ok') {
      console.log('✅ Conexión con Cloudinary verificada exitosamente.');
      return true;
    }
    throw new Error('La respuesta de ping de Cloudinary no fue "ok".');
  } catch (error) {
    console.error('❌ Error crítico al conectar con Cloudinary:', error.message);
    return false;
  }
};

module.exports = { 
  cloudinary, 
  storage,
  deleteImage,
  testCloudinaryConnection
};