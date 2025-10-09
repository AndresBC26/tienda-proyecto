// test-cloudinary.js - Script para probar la configuración de Cloudinary
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

async function testCloudinaryConnection() {
  console.log('🧪 Probando conexión con Cloudinary...');
  
  try {
    // Verificar configuración
    const config = cloudinary.config();
    console.log('📋 Configuración:');
    console.log('- Cloud Name:', config.cloud_name ? '✅ Configurado' : '❌ Faltante');
    console.log('- API Key:', config.api_key ? '✅ Configurado' : '❌ Faltante');
    console.log('- API Secret:', config.api_secret ? '✅ Configurado' : '❌ Faltante');
    
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      console.log('\n❌ Error: Configuración incompleta de Cloudinary');
      console.log('Verifica que las siguientes variables estén en tu archivo .env:');
      console.log('- CLOUDINARY_CLOUD_NAME');
      console.log('- CLOUDINARY_API_KEY');
      console.log('- CLOUDINARY_API_SECRET');
      return;
    }
    
    // Probar conexión con una operación simple
    console.log('\n🔍 Probando conexión...');
    const result = await cloudinary.api.ping();
    console.log('✅ Conexión exitosa con Cloudinary!');
    console.log('📊 Respuesta:', result);
    
    // Probar listado de recursos (opcional)
    console.log('\n📁 Probando acceso a recursos...');
    const resources = await cloudinary.api.resources({
      type: 'upload',
      max_results: 5,
      folder: 'elegancia_urban_products'
    });
    console.log(`✅ Acceso a recursos exitoso. Encontrados ${resources.resources.length} archivos en la carpeta.`);
    
  } catch (error) {
    console.log('\n❌ Error al conectar con Cloudinary:');
    console.log('Mensaje:', error.message);
    
    if (error.http_code === 401) {
      console.log('🔑 Error de autenticación: Verifica tus credenciales de Cloudinary');
    } else if (error.http_code === 404) {
      console.log('📁 La carpeta especificada no existe (esto es normal para nuevos proyectos)');
    } else {
      console.log('🔧 Error técnico:', error);
    }
  }
}

// Ejecutar la prueba
testCloudinaryConnection();
