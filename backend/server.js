// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// ========== IMPORTAR RUTAS ==========
const productRoutes = require('./routes/product.routes'); // ✅ Usar product.routes.js
const authRoutes = require('./routes/auth.routes'); // Si tienes auth
const orderRoutes = require('./routes/order.routes'); // Si tienes orders

// ========== TEST CLOUDINARY ==========
const { testCloudinaryConnection } = require('./config/cloudinary');

const app = express();

// ========== CONFIGURACIÓN DE CORS ==========
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// ========== MIDDLEWARES ==========
// ⚠️ IMPORTANTE: NO usar express.json() globalmente si usas multer
// Solo usarlo en rutas que NO suben archivos

// Middleware condicional: solo parsea JSON para rutas que no son /api/products
app.use((req, res, next) => {
  // Si la ruta incluye /products y el método es POST o PUT, no parsear JSON
  if (req.path.includes('/products') && (req.method === 'POST' || req.method === 'PUT')) {
    return next();
  }
  // Para otras rutas, sí parsear JSON
  express.json()(req, res, next);
});

app.use(express.urlencoded({ extended: true }));

// ========== LOGGING MIDDLEWARE (OPCIONAL) ==========
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`, {
    contentType: req.headers['content-type'],
    hasAuth: !!req.headers.authorization
  });
  next();
});

// ========== RUTAS ==========
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de E-commerce funcionando',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      auth: '/api/auth',
      orders: '/api/orders',
      health: '/health'
    }
  });
});

// ========== MANEJO DE ERRORES GLOBAL ==========
app.use((err, req, res, next) => {
  console.error('❌ Error Global:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Ruta no encontrada
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// ========== CONEXIÓN A MONGODB Y CLOUDINARY ==========
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI no está definida en las variables de entorno');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB conectado exitosamente');
    
    // Test de conexión a Cloudinary
    const cloudinaryOk = await testCloudinaryConnection();
    if (!cloudinaryOk) {
      console.warn('⚠️  Cloudinary no está conectado. Verifica tus variables de entorno.');
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   🚀 SERVIDOR INICIADO EXITOSAMENTE   ║
╠════════════════════════════════════════╣
║  Puerto: ${PORT}                       
║  Entorno: ${process.env.NODE_ENV || 'development'}
║  MongoDB: ✅ Conectado                
║  Cloudinary: ${cloudinaryOk ? '✅ Conectado' : '⚠️  Revisar config'}
╚════════════════════════════════════════╝
      `);
    });
  })
  .catch((error) => {
    console.error('❌ Error al conectar con MongoDB:', error.message);
    process.exit(1);
  });

// ========== MANEJO DE ERRORES DE PROCESO ==========
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;