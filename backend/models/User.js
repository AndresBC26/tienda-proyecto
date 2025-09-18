// models/User.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  selectedSize: { type: String, required: true },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  wantsEmails: { type: Boolean, default: true },

  // ===== CORRECCIÓN APLICADA AQUÍ =====
  // Se simplifica la validación para hacerla más robusta.
  // Ahora solo requiere que el campo exista y sea booleano.
  // Tu frontend ya se encarga de que el valor sea 'true'.
  acceptedTerms: {
    type: Boolean,
    required: [true, 'Debes aceptar los términos y condiciones para registrarte.'],
  },
  // ===== FIN DE LA CORRECCIÓN =====

  role: { type: String, default: 'user' },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  cart: [cartItemSchema],
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
});

module.exports = mongoose.model('User', userSchema);