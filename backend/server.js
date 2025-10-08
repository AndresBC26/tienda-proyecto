// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/database');

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

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

// Aumentamos el límite de tamaño para los datos JSON y URL-encoded
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/public', express.static(path.join(__dirname, 'public')));

// Montar rutas
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/contact', require('./routes/contact.routes'));
app.use('/api/payment', require('./routes/payment.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

app.get('/', (req, res) => {
  res.json({ message: '🛍️ Backend de Elegancia Urban funcionando!' });
});

// Manejador de Errores Global (muy importante)
app.use((err, req, res, next) => {
  console.error('--- ERROR GLOBAL CAPTURADO ---');
  console.error(err.stack); 
  res.status(500).json({ 
    message: 'Algo salió muy mal en el servidor.',
    error: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Express corriendo en puerto ${PORT}`);
});