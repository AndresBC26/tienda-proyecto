// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
// 🔹 CORRECCIÓN 1: Importar la librería 'cors' correctamente
const cors = require('cors');

// ===============================================================
// 1. CONFIGURACIÓN DE SERVICIOS EXTERNOS (Cloudinary)
// ===============================================================
const { testCloudinaryConnection } = require('./config/cloudinary');

// ===============================================================
// 2. IMPORTACIÓN DE RUTAS
// ===============================================================
const productRoutes = require('./routes/product.routes');
const userRoutes = require('./routes/user.routes');
const paymentRoutes = require('./routes/payment.routes');
const contactRoutes = require('./routes/contact.routes');
const reviewRoutes = require('./routes/review.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const healthRoutes = require('./routes/health.routes');
const orderRoutes = require('./routes/order.routes');

const app = express();

// ===============================================================
// 3. CONFIGURACIÓN DE MIDDLEWARES
// ===============================================================

// ========== CONFIGURACIÓN DE CORS ==========
const allowedOrigins = [
  process.env.FRONTEND_URL, // Tu dominio de producción
  'http://localhost:3000',     // Para desarrollo local
  'https://eleganciaurban.shop' // Añadido explícitamente para seguridad
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// 🔹 CORRECCIÓN 2: Aplicar la configuración de CORS a la app
app.use(cors(corsOptions));

// --- Cabeceras de Seguridad (Solución para Google Login) ---
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  // Esta cabecera puede ser restrictiva, si tienes problemas coméntala.
  // res.setHeader("Cross-Origin-Embedder-Policy", "require-corp"); 
  next();
});

// --- Body Parsers ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- Logging (Opcional pero útil) ---
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// ===============================================================
// 4. DEFINICIÓN DE RUTAS DE LA API
// ===============================================================
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/orders', orderRoutes);

// --- Ruta Raíz ---
app.get('/', (req, res) => {
  res.json({
    message: 'API de E-commerce funcionando',
    version: '1.0.0'
  });
});

// ===============================================================
// 5. MANEJO DE ERRORES (Debe ir después de las rutas)
// ===============================================================

// --- Manejador de Errores Global ---
app.use((err, req, res, next) => {
  console.error('❌ Error Global:', { message: err.message });
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
  });
});

// --- Manejador para Rutas no Encontradas (404) ---
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada en el servidor',
    path: req.originalUrl
  });
});

// ===============================================================
// 6. INICIO DEL SERVIDOR Y CONEXIÓN A LA BASE DE DATOS
// ===============================================================
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