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

app.use(cors());
app.use(express.json());

// Sirve la carpeta 'public' como recurso estático
app.use('/public', express.static(path.join(__dirname, 'public')));

// 📌 Montar rutas y registrar que se han montado
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

// ===== AÑADE ESTA LÍNEA AQUÍ PARA PAGOS =====
const paymentRoutes = require('./routes/payment.routes');
app.use('/api/payment', paymentRoutes);
console.log('Ruta de pagos montada en /api/payment');
// ============================================

app.get('/', (req, res) => {
  res.json({ message: '🛍️ Backend funcionando con MongoDB Atlas!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Express corriendo en puerto ${PORT}`);
});