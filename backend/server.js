// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// ====================== MEJORA INTEGRADA ======================
// 1. Importar y configurar Cloudinary al inicio.
// Esto es crucial para que `multer` pueda autenticarse y subir archivos.
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});
// ===============================================================

// ========== IMPORTAR RUTAS ==========
const productRoutes = require('./routes/product.routes');
const userRoutes = require('./routes/user.routes');
const paymentRoutes = require('./routes/payment.routes');
const contactRoutes = require('./routes/contact.routes');
const reviewRoutes = require('./routes/review.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const healthRoutes = require('./routes/health.routes');
const orderRoutes = require('./routes/order.routes');

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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ========== LOGGING MIDDLEWARE (OPCIONAL) ==========
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// ========== RUTAS ==========
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/orders', orderRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'API de E-commerce funcionando',
    version: '1.0.0'
  });
});

// ========== MANEJO DE ERRORES GLOBAL ==========
app.use((err, req, res, next) => {
  console.error('❌ Error Global:', { message: err.message });
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
  });
});


// Middleware para manejar rutas no encontradas (404). Debe ir al final.
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada en el servidor',
    path: req.originalUrl
  });
});


// ========== CONEXIÓN A LA BASE DE DATOS E INICIO DEL SERVIDOR ==========
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI no está definida en las variables de entorno');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB conectado exitosamente');
    
    const cloudinaryOk = await testCloudinaryConnection();
    
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║    🚀 SERVIDOR INICIADO EXITOSAMENTE   ║
╠════════════════════════════════════════╣
║ Puerto:     ${PORT}
║ Entorno:    ${process.env.NODE_ENV || 'development'}
║ MongoDB:    ✅ Conectado
║ Cloudinary: ${cloudinaryOk ? '✅ Conectado' : '⚠️  Revisar config'}
╚════════════════════════════════════════╝
      `);
    });
  })
  .catch((error) => {
    console.error('❌ Error al conectar con MongoDB:', error.message);
    process.exit(1);
  });

module.exports = app;