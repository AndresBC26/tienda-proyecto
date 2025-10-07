// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/database');

// Conectar a MongoDB Atlas
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Lista de orígenes permitidos
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://eleganciaurban.shop',
  'http://eleganciaurban.shop',
  'https://www.eleganciaurban.shop'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS no permitido'), false);
    }
  },
  credentials: true
}));

app.use(express.json());

// Sirve la carpeta 'public' como recurso estático
app.use('/public', express.static(path.join(__dirname, 'public')));

// 📌 Montar rutas
const productRoutes = require('./routes/product.routes');
app.use('/api/products', productRoutes);
console.log('Ruta de productos montada en /api/products');

const userRoutes = require('./routes/user.routes');
app.use('/api/users', userRoutes);
console.log('Ruta de usuarios montada en /api/users');

const reviewRoutes = require('./routes/review.routes');
app.use('/api/reviews', reviewRoutes);
console.log('Ruta de reseñas montada en /api/reviews');

const contactRoutes = require('./routes/contact.routes');
app.use('/api/contact', contactRoutes);
console.log('Ruta de contacto montada en /api/contact');

const paymentRoutes = require('./routes/payment.routes');
app.use('/api/payment', paymentRoutes);
console.log('Ruta de pagos montada en /api/payment');

// ===== ✅ RUTA DEL DASHBOARD AÑADIDA AQUÍ =====
const dashboardRoutes = require('./routes/dashboard.routes');
app.use('/api/dashboard', dashboardRoutes);
console.log('Ruta de dashboard montada en /api/dashboard');
// =============================================

app.get('/', (req, res) => {
  res.json({ message: '🛍️ Backend funcionando con MongoDB Atlas!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Express corriendo en puerto ${PORT}`);
});