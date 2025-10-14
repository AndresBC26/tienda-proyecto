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

// --- RUTA PARA OBTENER TODOS LOS USUARIOS (SOLO ADMIN) ---
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
  }
  try {
    const users = await User.find({}).select('-password -__v');
    res.json(users);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ message: 'Error del servidor al obtener usuarios.' });
  }
});

// --- RUTA PARA VERIFICAR SESIÓN (SOLUCIONA EL REFRESCAR PÁGINA) ---
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -__v');
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
    // ... Tu código de registro se mantiene exactamente igual ...
});

// --- RUTA DE VERIFICACIÓN DE EMAIL ---
router.get('/verify-email/:token', async (req, res) => {
    // ... Tu código de verificación de email se mantiene exactamente igual ...
});

// --- RUTA DE LOGIN ---
router.post('/login', async (req, res) => {
    // ... Tu código de login se mantiene exactamente igual ...
});


// ========================================================================
// =====      ✅ INICIO DE LA MEJORA: LÓGICA DE GOOGLE REFORZADA       =====
// ========================================================================
router.post('/google-login', async (req, res) => {
  const { token, intent } = req.body;

  if (!intent || !['login', 'register'].includes(intent)) {
    return res.status(400).json({ message: 'Intento no especificado (debe ser login o register).' });
  }

  try {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: '714367295627-vpeoa81drg97voneiii9drddnnk523ge.apps.googleusercontent.com',
    });
    const { sub: googleId, name, email } = ticket.getPayload();

    // --- LÓGICA MEJORADA ---
    // 1. Busca primero por Google ID. Es la forma más segura de encontrar al usuario.
    let user = await User.findOne({ googleId });

    // 2. Si no lo encuentra por Google ID, busca por email.
    if (!user) {
      user = await User.findOne({ email });
    }

    // --- LÓGICA PARA EL INTENTO DE REGISTRO ---
    if (intent === 'register') {
      if (user) {
        return res.status(409).json({ message: 'Este correo ya está registrado. Por favor, inicia sesión.' });
      }
      // Si no existe, crea un nuevo usuario ya vinculado a Google.
      const newUser = new User({
        name,
        email,
        googleId, // Se guarda el ID de Google desde el registro
        isVerified: true,
        acceptedTerms: true,
        role: email === 'admin@tienda.com' ? 'admin' : 'user'
      });
      await newUser.save();
      user = newUser; // Asignamos el nuevo usuario para el proceso de login
    
    // --- LÓGICA PARA EL INTENTO DE LOGIN ---
    } else if (intent === 'login') {
      if (user) {
        // Si el usuario existe (por email) pero no tiene googleId, lo vinculamos automáticamente.
        if (!user.googleId) {
          user.googleId = googleId;
          await user.save();
          console.log(`🔄 Cuenta de Google vinculada automáticamente al email: ${email}`);
        }
      } else {
        // Auto-registro si el usuario no existe en absoluto
        console.log(`✨ Auto-registrando nuevo usuario con Google: ${email}`);
        const newUser = new User({
          name,
          email,
          googleId,
          isVerified: true,
          acceptedTerms: true,
          role: email === 'admin@tienda.com' ? 'admin' : 'user'
        });
        await newUser.save();
        user = newUser;
      }
    }

    // --- PROCESO FINAL DE LOGIN (COMÚN PARA AMBOS INTENTOS) ---
    const payload = { id: user._id, name: user.name, email: user.email, role: user.role };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
    
    return res.json({ token: jwtToken, user: payload });

  } catch (error) {
    console.error("Error en google-login:", error);
    res.status(400).json({ message: 'La autenticación con Google falló.' });
  }
});
// ========================================================================
// =====       FIN DE LA MEJORA: LÓGICA DE GOOGLE REFORZADA          =====
// ========================================================================


// =================================================================
// --- ✨ NUEVA RUTA: VINCULAR CUENTA DE GOOGLE (YA LOGUEADO) ---
// =================================================================
router.post('/link-google', auth, async (req, res) => {
  const { token } = req.body;
  const userId = req.user.id;

  if (!token) {
    return res.status(400).json({ message: 'No se proporcionó el token de Google.' });
  }

  try {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: '714367295627-vpeoa81drg97voneiii9drddnnk523ge.apps.googleusercontent.com',
    });
    const { sub: googleId } = ticket.getPayload();

    const existingGoogleUser = await User.findOne({ googleId });
    if (existingGoogleUser && existingGoogleUser._id.toString() !== userId) {
      return res.status(409).json({ message: 'Esta cuenta de Google ya está vinculada a otro usuario.' });
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    currentUser.googleId = googleId;
    await currentUser.save();

    const payload = { id: currentUser._id, name: currentUser.name, email: currentUser.email, role: currentUser.role };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });

    res.json({
      message: '¡Cuenta de Google vinculada exitosamente!',
      user: { ...payload, googleId: currentUser.googleId }, // Devolvemos el googleId en el user
      token: jwtToken
    });

  } catch (error) {
    console.error("Error al vincular cuenta de Google:", error);
    res.status(400).json({ message: 'La autenticación con Google falló durante la vinculación.' });
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