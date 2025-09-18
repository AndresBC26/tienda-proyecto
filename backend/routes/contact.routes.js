// routes/contact.routes.js
const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const jwt = require('jsonwebtoken');

// Middleware para proteger rutas y obtener info del usuario
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No hay token, autorización denegada' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded; // Añade el payload del token (id, name, etc.) a la request
    next();
  } catch (e) {
    res.status(401).json({ message: 'Token no válido' });
  }
};

// POST /api/contact - Crear un nuevo mensaje (Ruta protegida)
router.post('/', auth, async (req, res) => {
  try {
    const { subject, message } = req.body;
    
    const newContactMessage = new Contact({
      subject,
      message,
      user: req.user.id,
      name: req.user.name,
      email: req.user.email, // Asumiendo que el email está en el token
    });

    const savedMessage = await newContactMessage.save();
    res.status(201).json({ message: 'Mensaje enviado con éxito', data: savedMessage });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/contact - Obtener todos los mensajes (para el admin)
router.get('/', auth, async (req, res) => {
  // Opcional: podrías añadir un middleware para verificar si el rol es 'admin'
  try {
    const messages = await Contact.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/contact/:id - Eliminar un mensaje
router.delete('/:id', auth, async (req, res) => {
    try {
        const deletedMessage = await Contact.findByIdAndDelete(req.params.id);
        if (!deletedMessage) {
            return res.status(404).json({ message: 'Mensaje no encontrado' });
        }
        res.json({ message: 'Mensaje eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;