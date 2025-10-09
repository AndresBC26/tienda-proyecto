const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User'); 
const sendEmail = require('../utils/sendEmail');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client('714367295627-vpeoa81drg97voneiii9drddnnk523ge.apps.googleusercontent.com');

// Middleware de autenticación (sin cambios)
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

// =================================================================
// --- ✨ MEJORA: RUTA PARA OBTENER TODOS LOS USUARIOS (SOLO ADMIN) ---
// =================================================================
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
  }

  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ message: 'Error del servidor al obtener usuarios.' });
  }
});


// =================================================================
// --- ✅ RUTA PARA VERIFICAR SESIÓN (SOLUCIONA EL REFRESCAR PÁGINA) ---
// =================================================================
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    res.json(user);
  } catch (err) {
    console.error("Error en la ruta /me:", err);
    res.status(500).send('Error del servidor');
  }
});

// --- RUTA DE REGISTRO ---
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, wantsEmails, acceptedTerms } = req.body;
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const userRole = email === 'admin@tienda.com' ? 'admin' : 'user';
    
    const newUser = new User({
      name, email, password: hashedPassword,
      wantsEmails, acceptedTerms, role: userRole,
      verificationToken,
      isVerified: false
    });
    
    await newUser.save();
    
    const verificationUrl = `${process.env.FRONTEND_URL}/#/verify-email/${verificationToken}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; text-align: center; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 12px; max-width: 600px; margin: auto; background-color: #f9f9f9;">
        <h1 style="color: #60caba;">¡Bienvenido a Elegancia Urban!</h1>
        <p style="font-size: 16px;">Gracias por registrarte. Por favor, haz clic en el botón para verificar tu cuenta:</p>
        <a href="${verificationUrl}" style="background: linear-gradient(to right, #60caba, #FFD700); color: #000; padding: 15px 25px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; margin: 20px 0;">Verificar mi Cuenta</a>
        <p style="font-size: 12px; color: #888;">Si el botón no funciona, copia y pega este enlace: ${verificationUrl}</p>
      </div>
    `;
    await sendEmail({ to: newUser.email, subject: 'Verificación de cuenta - Elegancia Urban', html: emailHtml });

    res.status(201).json({ message: '¡Registro exitoso! Por favor, revisa tu correo.' });
  } catch (err) {
    console.error("Error en registro:", err);
    res.status(400).json({ message: 'Ocurrió un error durante el registro.' });
  }
});


// --- RUTA DE VERIFICACIÓN DE EMAIL ---
router.get('/verify-email/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    
    if (!user) {
      return res.status(400).json({ message: 'El enlace de verificación es inválido o ha expirado.' });
    }

    user.isVerified = true; 
    user.verificationToken = undefined;
    
    await user.save();
    
    const payload = { id: user._id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
    
    res.status(200).json({ 
      message: '¡Tu cuenta ha sido verificada exitosamente e iniciaste sesión!',
      token, 
      user: payload
    });

  } catch (err) {
    console.error("Error en la ruta de verificación:", err);
    res.status(500).json({ message: 'Error interno en el servidor.' });
  }
});


// --- RUTA DE LOGIN ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    if (!user.isVerified) { 
      return res.status(403).json({ message: 'Por favor, verifica tu correo electrónico antes de iniciar sesión.' });
    }

    const payload = { id: user._id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
    
    res.json({ token, user: payload });
  } catch (err) {
    res.status(500).send('Error del servidor');
  }
});


// ======================= CAMBIO IMPORTANTE AQUÍ =======================
// --- RUTA PARA LOGIN CON GOOGLE (CON LÓGICA SEPARADA) ---
router.post('/google-login', async (req, res) => {
  // 1. Obtenemos el token y la nueva variable 'intent'
  const { token, intent } = req.body;

  if (!intent) {
    return res.status(400).json({ message: 'Intento no especificado (login o register).' });
  }

  try {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: '714367295627-vpeoa81drg97voneiii9drddnnk523ge.apps.googleusercontent.com',
    });
    const { name, email } = ticket.getPayload();

    const user = await User.findOne({ email });

    // 2. Lógica condicional basada en la intención
    if (intent === 'register') {
      // Si la intención es registrarse...
      if (user) {
        // ...pero el usuario ya existe, devolvemos un error.
        return res.status(400).json({ message: 'Este correo ya está registrado. Por favor, inicia sesión.' });
      }
      
      // Si no existe, procedemos a crearlo (el flujo feliz de registro)
      const password = email + process.env.JWT_SECRET;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const userRole = email === 'admin@tienda.com' ? 'admin' : 'user';

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        isVerified: true,
        acceptedTerms: true, // Asumimos que al usar Google aceptan los términos
        role: userRole
      });
      await newUser.save();
      
      const payload = { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role };
      const jwtToken = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
      return res.json({ token: jwtToken, user: payload });

    } else if (intent === 'login') {
      // Si la intención es iniciar sesión...
      if (!user) {
        // ...pero el usuario NO existe, devolvemos un error.
        return res.status(404).json({ message: 'Usuario no encontrado. Por favor, regístrate primero.' });
      }

      // Si el usuario existe, procedemos a iniciar sesión (el flujo feliz de login)
      const payload = { id: user._id, name: user.name, email: user.email, role: user.role };
      const jwtToken = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
      return res.json({ token: jwtToken, user: payload });
    }

  } catch (error) {
    console.error("Error en google-login:", error);
    res.status(400).json({ message: 'La autenticación con Google falló.' });
  }
});
// ====================================================================


// --- RECUPERACIÓN DE CONTRASEÑA ---
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: 'Si tu correo está registrado, recibirás un enlace.' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.FRONTEND_URL}/#/reset-password/${resetToken}`;
        
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; text-align: center; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 12px; max-width: 600px; margin: auto; background-color: #f9f9f9;">
            <h1 style="color: #60caba;">Solicitud de Reseteo de Contraseña</h1>
            <p style="font-size: 16px;">Para cambiar tu contraseña, haz clic en el botón.</p>
            <a href="${resetUrl}" style="background: linear-gradient(to right, #60caba, #FFD700); color: #000; padding: 15px 25px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; margin: 20px 0;">Cambiar Contraseña</a>
            <p style="font-size: 12px; color: #888;">El enlace es válido por 15 minutos.</p>
          </div>`;

        await sendEmail({ to: user.email, subject: 'Reseteo de Contraseña - Elegancia Urban', html: emailHtml });
        res.status(200).json({ message: 'Si tu correo está registrado, recibirás un enlace.' });
    } catch (err) {
        console.error("Error en forgot-password:", err);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// --- RESETEO DE CONTRASEÑA ---
router.put('/reset-password/:token', async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: 'El enlace de reseteo es inválido o ha expirado.' });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        res.status(200).json({ message: '¡Contraseña actualizada con éxito!' });
    } catch (err) {
        console.error("Error en reset-password:", err);
        res.status(500).json({ message: 'Error del servidor al actualizar la contraseña' });
    }
});

// --- ACTUALIZAR PERFIL ---
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const userIdToUpdate = req.params.id;

    const isOwner = req.user.id === userIdToUpdate;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'No tienes permiso para actualizar este perfil.' });
    }

    const user = await User.findById(userIdToUpdate);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userIdToUpdate) {
        return res.status(400).json({ message: 'El correo electrónico ya está en uso.' });
      }
      user.email = email;
    }
    if (name) {
      user.name = name;
    }
    const updatedUser = await user.save();
    const payload = { id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
    res.json({
        message: 'Perfil actualizado exitosamente',
        user: payload,
        token: token 
    });
  } catch (err) {
    console.error("Error al actualizar perfil:", err);
    res.status(500).json({ message: 'Error del servidor al actualizar el perfil.' });
  }
});

// --- ELIMINAR USUARIO ---
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    if (userToDelete._id.toString() === req.user.id) {
        return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta de administrador.' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    res.status(500).json({ message: 'Error del servidor al eliminar el usuario.' });
  }
});

// --- RUTAS DE FAVORITOS ---
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
        await User.findByIdAndUpdate(req.params.userId, { $addToSet: { favorites: req.body.productId } });
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

// --- RUTAS DE CARRITO ---
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