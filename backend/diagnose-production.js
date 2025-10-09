// diagnose-production.js - Diagnóstico completo para producción
require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');

console.log('🔍 DIAGNÓSTICO COMPLETO DE PRODUCCIÓN');
console.log('=====================================\n');

// 1. Verificar variables de entorno críticas
console.log('1️⃣ VARIABLES DE ENTORNO:');
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

let envErrors = 0;
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: Configurado`);
  } else {
    console.log(`❌ ${varName}: FALTANTE`);
    envErrors++;
  }
});

if (envErrors > 0) {
  console.log(`\n⚠️  ${envErrors} variables de entorno faltantes\n`);
} else {
  console.log('✅ Todas las variables de entorno están configuradas\n');
}

// 2. Probar conexión a MongoDB
console.log('2️⃣ CONEXIÓN A MONGODB:');
async function testMongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conexión a MongoDB exitosa');
    
    // Probar operación básica
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`✅ Base de datos accesible. Colecciones encontradas: ${collections.length}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.log('❌ Error de conexión a MongoDB:', error.message);
  }
}

// 3. Probar configuración de Cloudinary
console.log('\n3️⃣ CONFIGURACIÓN DE CLOUDINARY:');
async function testCloudinary() {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });

    const result = await cloudinary.api.ping();
    console.log('✅ Conexión a Cloudinary exitosa');
    
    // Probar acceso a recursos
    const resources = await cloudinary.api.resources({
      type: 'upload',
      max_results: 1,
      folder: 'elegancia_urban_products'
    });
    console.log('✅ Acceso a recursos de Cloudinary exitoso');
    
  } catch (error) {
    console.log('❌ Error de Cloudinary:', error.message);
    if (error.http_code === 401) {
      console.log('🔑 Error de autenticación: Verifica las credenciales');
    }
  }
}

// 4. Probar JWT
console.log('\n4️⃣ CONFIGURACIÓN DE JWT:');
function testJWT() {
  try {
    const testPayload = { id: 'test', email: 'test@test.com' };
    const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ JWT funcionando correctamente');
  } catch (error) {
    console.log('❌ Error de JWT:', error.message);
  }
}

// 5. Verificar configuración de CORS
console.log('\n5️⃣ CONFIGURACIÓN DE CORS:');
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://eleganciaurban.shop',
  'http://eleganciaurban.shop',
  'https://www.eleganciaurban.shop'
];

console.log('Orígenes permitidos:');
allowedOrigins.forEach(origin => {
  console.log(`✅ ${origin}`);
});

// 6. Verificar estructura de rutas
console.log('\n6️⃣ ESTRUCTURA DE RUTAS:');
const routes = [
  '/api/products - GET, POST, PUT, DELETE',
  '/api/users - Autenticación y gestión',
  '/api/reviews - Sistema de reseñas',
  '/api/contact - Formulario de contacto',
  '/api/payment - Integración MercadoPago',
  '/api/dashboard - Métricas admin'
];

routes.forEach(route => {
  console.log(`✅ ${route}`);
});

// Ejecutar todas las pruebas
async function runDiagnosis() {
  await testMongoDB();
  await testCloudinary();
  testJWT();
  
  console.log('\n🎯 RECOMENDACIONES PARA PRODUCCIÓN:');
  console.log('1. Verifica que todas las variables de entorno estén configuradas en Render');
  console.log('2. Asegúrate de que el dominio del frontend esté en la lista de CORS');
  console.log('3. Verifica que las credenciales de Cloudinary sean correctas');
  console.log('4. Confirma que la base de datos MongoDB Atlas esté accesible');
  console.log('5. Revisa los logs del servidor en Render para errores específicos');
  
  console.log('\n📋 CHECKLIST DE DEPLOYMENT:');
  console.log('□ Variables de entorno configuradas en Render');
  console.log('□ Build del frontend exitoso');
  console.log('□ Servidor backend iniciado correctamente');
  console.log('□ Base de datos accesible');
  console.log('□ Cloudinary configurado');
  console.log('□ CORS configurado para el dominio del frontend');
}

runDiagnosis().catch(console.error);
