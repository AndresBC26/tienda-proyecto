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

// ✅ MEJORA: Aumentamos el límite de tamaño para los datos.
// Esto previene errores si los datos del formulario (incluyendo imágenes) son grandes.
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Sirve la carpeta 'public' (aunque ya no la usemos para productos)
app.use('/public', express.static(path.join(__dirname, 'public')));

// --- 📌 Montar rutas (sin cambios) ---
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/contact', require('./routes/contact.routes'));
app.use('/api/payment', require('./routes/payment.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

app.get('/', (req, res) => {
  res.json({ message: '🛍️ Backend de Elegancia Urban funcionando!' });
});

// ✅ MEJORA CRUCIAL: Manejador de Errores Global
// Este middleware se ejecutará si ocurre cualquier error en las rutas anteriores (incluyendo un fallo en Cloudinary).
// Nos enviará un mensaje de error detallado en lugar de un "500 Internal Server Error" genérico.
app.use((err, req, res, next) => {
  console.error('--- ERROR GLOBAL CAPTURADO ---');
  console.error(err.stack); // Muestra el error completo en los logs de Render
  res.status(500).json({ 
    message: 'Algo salió muy mal en el servidor.',
    // La clave es que ahora enviamos el mensaje de error específico
    error: err.message 
  });
});


app.listen(PORT, () => {
  console.log(`🚀 Servidor Express corriendo en puerto ${PORT}`);
});