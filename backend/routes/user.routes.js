// routes/user.routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail'); // Asegúrate de tener este archivo utilitario

// Middleware para proteger rutas
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No hay token, autorización denegada' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ message: 'Token no válido' });
  }
};

// --- GESTIÓN DE USUARIOS (ADMIN) ---
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true }
    ).select('-password');
    if (!updatedUser) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- AUTENTICACIÓN Y SESIÓN ---
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).send('Error del Servidor');
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, wantsEmails, acceptedTerms, role } = req.body;
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const userRole = email === 'admin@tienda.com' ? 'admin' : role || 'user';
    
    const newUser = new User({
      name, email, password: hashedPassword,
      wantsEmails, acceptedTerms, role: userRole,
      verificationToken
    });
    
    await newUser.save();

    const verificationUrl = `http://localhost:3000/verify-email/${verificationToken}`;
    console.log(`URL de Verificación para ${email}: ${verificationUrl}`); // Log para desarrollo

    // Lógica para enviar el correo (si tienes 'sendEmail' configurado)
    /*
    await sendEmail({
      to: newUser.email,
      subject: 'Verificación de cuenta - Elegancia Urban',
      html: `<h1>¡Bienvenido!</h1><p>Haz clic <a href="${verificationUrl}">aquí</a> para verificar tu cuenta.</p>`,
    });
    */

    res.status(201).json({ message: 'Usuario registrado. Por favor, revisa tu correo para verificar tu cuenta.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/verify-email/:token', async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });
        if (!user) {
            return res.status(400).json({ message: 'Token de verificación inválido o expirado.' });
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        res.status(200).json({ message: '¡Correo electrónico verificado con éxito!' });
    } catch (err) {
        res.status(500).json({ message: 'Error del servidor al verificar el correo.' });
    }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // ===== CAMBIO REALIZADO AQUÍ =====
    // Se comenta temporalmente el chequeo de verificación.
    /*
    if (!user.isVerified) {
        return res.status(403).json({ message: 'Por favor, verifica tu correo electrónico antes de iniciar sesión.' });
    }
    */
    // ===== FIN DEL CAMBIO =====

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }
    const payload = { id: user._id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
    
    res.json({
        token,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).send('Error del servidor');
  }
});

// --- GESTIÓN DE FAVORITOS Y CARRITO ---
// (Estas rutas ya estaban bien, se incluyen por completitud)

// Favoritos
router.get('/:userId/favorites', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('favorites');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json({ favorites: user.favorites });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/:userId/favorites', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user.favorites.includes(req.body.productId)) {
            user.favorites.push(req.body.productId);
            await user.save();
        }
        res.status(200).json({ message: 'Producto añadido a favoritos' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:userId/favorites/:productId', auth, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.userId, { $pull: { favorites: req.params.productId } });
        res.status(200).json({ message: 'Producto eliminado de favoritos' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Carrito
router.get('/:userId/cart', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('cart.product');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json({ cart: user.cart || [] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:userId/cart', auth, async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.userId,
            { cart: req.body.cart },
            { new: true, runValidators: true }
        );
        if (!updatedUser) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.status(200).json({ message: 'Carrito actualizado con éxito' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;