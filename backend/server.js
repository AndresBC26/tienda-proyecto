// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// ========== IMPORTAR RUTAS ==========
// Se importan todos tus archivos de rutas con los nombres correctos
const productRoutes = require('./routes/product.routes');
const userRoutes = require('./routes/user.routes');
const paymentRoutes = require('./routes/payment.routes');
const contactRoutes = require('./routes/contact.routes');
const reviewRoutes = require('./routes/review.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const healthRoutes = require('./routes/health.routes');
// Asegúrate de tener este archivo 'order.routes.js' o elimínalo si no lo usas
const orderRoutes = require('./routes/order.routes'); 

// ========== CONFIGURACIÓN DE CLOUDINARY (INTACTA) ==========
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
// Se configuran todas las rutas importadas
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

// Ruta no encontrada (debe ir al final)
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Ruta no encontrada',
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
    
    // Test de conexión a Cloudinary (INTACTO)
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