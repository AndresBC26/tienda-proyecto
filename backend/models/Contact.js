// models/Contact.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  // Vincula el mensaje al usuario que lo envió
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Guardamos el nombre y email para referencia rápida
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false }, // Para saber si ya leíste el mensaje
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Contact', contactSchema);