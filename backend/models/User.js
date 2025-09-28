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
  acceptedTerms: {
    type: Boolean,
    required: [true, 'Debes aceptar los términos y condiciones para registrarte.'],
  },
  role: { type: String, default: 'user' },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  cart: [cartItemSchema],
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },

  // ===== CAMPOS AÑADIDOS PARA RESETEO DE CONTRASEÑA =====
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  // =======================================================
});

module.exports = mongoose.model('User', userSchema);