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
  if (!token) { return res.status(401).json({ message: 'No hay token, autorización denegada' }); }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ message: 'Token no válido' });
  }
};

// --- RUTA DE REGISTRO (SIN CAMBIOS) ---
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
    console.log(`Usuario ${email} registrado. Token de verificación guardado en la DB.`); // Log de registro
    
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


// ======================================================================================
// --- RUTA DE VERIFICACIÓN (CORREGIDA CON LOGS DE DEPURACIÓN) 🔑 ---
// ======================================================================================
router.get('/verify-email/:token', async (req, res) => {
  try {
    // 1. REGISTRO DE ENTRADA
    console.log(`\n--- [INICIO] Proceso de Verificación de Email ---`);
    const receivedToken = req.params.token;
    console.log(`[PASO 1] Token recibido desde la URL: ${receivedToken}`);
    
    // 2. BÚSQUEDA EN LA BASE DE DATOS
    console.log(`[PASO 2] Buscando usuario en la base de datos con ese token...`);
    const user = await User.findOne({ verificationToken: receivedToken });
    
    // 3. VERIFICACIÓN CRÍTICA: ¿SE ENCONTRÓ AL USUARIO?
    if (!user) {
      console.error(`[ERROR CRÍTICO] No se encontró ningún usuario con el token.`);
      console.log(`Búsqueda realizada con el token: "${receivedToken}"`);
      console.log(`--- [FIN] Proceso de Verificación con ERROR ---`);
      return res.status(400).json({ message: 'El enlace de verificación es inválido o ha expirado.' });
    }

    // 4. USUARIO ENCONTRADO, PROCEDEMOS A ACTUALIZAR
    console.log(`[ÉXITO] Usuario encontrado: ${user.email}.`);
    console.log(`       -> Estado de verificación ANTES: ${user.isVerified}`);

    // 5. ACTUALIZAR LOS DATOS
    user.isVerified = true; 
    user.verificationToken = undefined;
    
    console.log(`[PASO 3] Actualizando el documento del usuario en la base de datos...`);
    await user.save();
    
    console.log(`[ÉXITO] Usuario guardado en la DB.`);
    console.log(`       -> Estado de verificación DESPUÉS: ${user.isVerified}`);
    
    // 6. GENERAR TOKEN JWT PARA AUTO-LOGIN
    const payload = { id: user._id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
    
    console.log(`[PASO 4] Token JWT generado para el inicio de sesión automático.`);
    console.log(`--- [FIN] Proceso de Verificación EXITOSO ---`);
    
    // 7. ENVIAR RESPUESTA AL FRONTEND
    res.status(200).json({ 
      message: '¡Tu cuenta ha sido verificada exitosamente e iniciaste sesión!',
      token, 
      user: payload
    });

  } catch (err) {
    console.error("--- [ERROR FATAL] Ocurrió un error inesperado en la ruta de verificación ---"); 
    console.error(err);
    res.status(500).json({ message: 'Error interno en el servidor.' });
  }
});
// ======================================================================================


// --- RUTA DE LOGIN (SIN CAMBIOS) ---
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

// --------------------------------------------------------------------------------------
// --- RUTA DE LOGIN (SIN CAMBIOS) ---
// --------------------------------------------------------------------------------------
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

// --------------------------------------------------------------------------------------
// --- RUTA PARA LOGIN CON GOOGLE (SIN CAMBIOS) ---
// --------------------------------------------------------------------------------------
router.post('/google-login', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: '714367295627-vpeoa81drg97voneiii9drddnnk523ge.apps.googleusercontent.com',
    });
    const { name, email } = ticket.getPayload();

    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
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

    if (isNewUser) {
      const welcomeHtml = `
        <div style="font-family: Arial, sans-serif; text-align: center; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 12px; max-width: 600px; margin: auto; background-color: #f9f9f9;">
          <h1 style="color: #60caba;">¡Hola ${name}, te damos la bienvenida a Elegancia Urban!</h1>
          <p style="font-size: 16px;">Tu cuenta ha sido creada exitosamente...</p>
          <a href="${process.env.FRONTEND_URL}/#/products" style="background: linear-gradient(to right, #60caba, #FFD700); color: #000; padding: 15px 25px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; margin: 20px 0;">Explorar la Colección</a>
        </div>
      `;

      await sendEmail({
        to: user.email,
        subject: '¡Bienvenido a Elegancia Urban!',
        html: welcomeHtml
      });
    }

    const payload = { id: user._id, name: user.name, email: user.email, role: user.role };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });

    res.json({ token: jwtToken, user: payload });

  } catch (error) {
    console.error("Error en google-login:", error);
    res.status(400).json({ message: 'La autenticación con Google falló.' });
  }
});

// RECUPERACIÓN DE CONTRASEÑA
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

// RESETEO DE CONTRASEÑA
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

// ACTUALIZAR PERFIL
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

// ELIMINAR USUARIO
router.delete('/:id', auth, async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
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

// RUTAS DE FAVORITOS
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

// RUTAS DE CARRITO
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