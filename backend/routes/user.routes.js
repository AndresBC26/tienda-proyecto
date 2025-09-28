// routes/user.routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { OAuth2Client } = require('google-auth-library');

// ... (Middleware 'auth' y otras rutas existentes se mantienen igual)
// --- USA TU ID DE CLIENTE AQUÍ ---
const client = new OAuth2Client('714367295627-vpeoa81drg97voneiii9drddnnk523ge.apps.googleusercontent.com');

// Middleware de autenticación
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

// --- GESTIÓN DE USUARIOS (SOLO PARA ADMINS) ---
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
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

// ✅ RUTA DE REGISTRO
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
        <p style="font-size: 16px;">Gracias por registrarte. Solo falta un paso más. Por favor, haz clic en el siguiente botón para verificar tu cuenta:</p>
        <a href="${verificationUrl}" style="background: linear-gradient(to right, #60caba, #FFD700); color: #000; padding: 15px 25px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; margin: 20px 0;">Verificar mi Cuenta</a>
        <p style="font-size: 12px; color: #888;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
        <p style="font-size: 12px; color: #888; word-break: break-all;">${verificationUrl}</p>
      </div>
    `;

    await sendEmail({ to: newUser.email, subject: 'Verificación de cuenta - Elegancia Urban', html: emailHtml });

    res.status(201).json({ message: '¡Registro exitoso! Por favor, revisa tu correo para verificar tu cuenta.' });
  } catch (err) {
    console.error("Error en registro:", err);
    res.status(400).json({ message: 'Ocurrió un error durante el registro. Inténtalo de nuevo.' });
  }
});

// ✅ RUTA DE VERIFICACIÓN
router.get('/verify-email/:token', async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });
        if (!user) {
            return res.status(400).json({ message: 'Token de verificación inválido o ya ha sido utilizado.' });
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        
        res.redirect(`${process.env.FRONTEND_URL}/#/login?verified=true`);

    } catch (err) {
        res.redirect(`${process.env.FRONTEND_URL}/#/login?verified=false`);
    }
});

// ✅ RUTA DE LOGIN
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

// --- RUTA PARA LOGIN CON GOOGLE ---
router.post('/google-login', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: '714367295627-vpeoa81drg97voneiii9drddnnk523ge.apps.googleusercontent.com',
    });
    const { name, email } = ticket.getPayload();

    let user = await User.findOne({ email });

    // Si el usuario no existe, lo creamos
    if (!user) {
      // Creamos una contraseña aleatoria y la hasheamos, ya que es requerida por el modelo.
      const password = email + process.env.JWT_SECRET;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const userRole = email === 'admin@tienda.com' ? 'admin' : 'user';

      user = new User({
        name,
        email,
        password: hashedPassword,
        isVerified: true,
        acceptedTerms: true,
        role: userRole
      });
      await user.save();
    }

    // Creamos un token JWT para nuestra aplicación
    const payload = { id: user._id, name: user.name, email: user.email, role: user.role };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });

    res.json({ token: jwtToken, user: payload });

  } catch (error) {
    console.error("Error en google-login:", error);
    res.status(400).json({ message: 'La autenticación con Google falló. Inténtalo de nuevo.' });
  }
});

// ==========================================================
// ===== NUEVA RUTA: SOLICITUD DE RESETEO DE CONTRASEÑA =====
// ==========================================================
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            // Nota: Enviamos una respuesta genérica para no revelar si un email existe o no.
            return res.status(200).json({ message: 'Si tu correo está registrado, recibirás un enlace para resetear tu contraseña.' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');

        // Guardar el token hasheado en la BD por seguridad
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutos de validez

        await user.save({ validateBeforeSave: false });

        // Enviar el token SIN hashear por correo
        const resetUrl = `${process.env.FRONTEND_URL}/#/reset-password/${resetToken}`;
        
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; text-align: center; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 12px; max-width: 600px; margin: auto; background-color: #f9f9f9;">
            <h1 style="color: #60caba;">Solicitud de Reseteo de Contraseña</h1>
            <p style="font-size: 16px;">Para cambiar tu contraseña, haz clic en el botón. Si no solicitaste esto, ignora este mensaje.</p>
            <a href="${resetUrl}" style="background: linear-gradient(to right, #60caba, #FFD700); color: #000; padding: 15px 25px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; margin: 20px 0;">Cambiar Contraseña</a>
            <p style="font-size: 12px; color: #888;">El enlace es válido por 15 minutos.</p>
          </div>`;

        await sendEmail({
            to: user.email,
            subject: 'Reseteo de Contraseña - Elegancia Urban',
            html: emailHtml
        });

        res.status(200).json({ message: 'Si tu correo está registrado, recibirás un enlace para resetear tu contraseña.' });

    } catch (err) {
        console.error("Error en forgot-password:", err);
        // Limpiar tokens si hay un error para evitar problemas
        const user = await User.findOne({ email });
        if(user) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
        }
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// ========================================================
// ===== NUEVA RUTA: EJECUTAR EL RESETEO DE CONTRASEÑA =====
// ========================================================
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

        // Establecer la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ message: '¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.' });

    } catch (err) {
        console.error("Error en reset-password:", err);
        res.status(500).json({ message: 'Error del servidor al actualizar la contraseña' });
    }
});


// 🔹 Endpoint para ACTUALIZAR el perfil de un usuario
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const userIdToUpdate = req.params.id;

    if (req.user.id !== userIdToUpdate && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para actualizar este perfil.' });
    }

    const user = await User.findById(userIdToUpdate);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
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

// ... (El resto de tus rutas: DELETE, favorites, cart... se mantienen igual)
// ================== BLOQUE AÑADIDO ==================
// ❌ Endpoint para ELIMINAR un usuario (DELETE)
router.delete('/:id', auth, async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // 🚩 VERIFICACIÓN DEL ROL DE ADMINISTRADOR
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    
    // Un admin no puede eliminarse a sí mismo
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
// ========================================================

// --- RUTAS DE FAVORITOS Y CARRITO ---
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