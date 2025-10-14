// routes/user.routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client('714367295627-vpeoa81drg97voneiii9drddnnk523ge.apps.googleusercontent.com');

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

router.get('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error("Error al obtener usuarios:", err);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            googleId: user.googleId || null,
            isVerified: user.isVerified,
            wantsEmails: user.wantsEmails,
            hasPassword: !!user.password
        });
    } catch (err) {
        console.error("Error en /me:", err);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

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
            </div>`;
        await sendEmail({ to: newUser.email, subject: 'Verificación de cuenta - Elegancia Urban', html: emailHtml });
        res.status(201).json({ message: '¡Registro exitoso! Por favor, revisa tu correo para verificar tu cuenta.' });
    } catch (err) {
        console.error("Error en registro o envío de correo:", err);
        res.status(500).json({ message: 'Se creó la cuenta, pero falló el envío del correo de verificación.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !user.password) {
            return res.status(400).json({ message: 'Correo electrónico o contraseña incorrectos.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Correo electrónico o contraseña incorrectos.' });
        }
        const payload = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            googleId: user.googleId || null,
            hasPassword: !!user.password
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
        res.json({ message: 'Inicio de sesión exitoso', token, user: payload });
    } catch (err) {
        console.error("Error en login:", err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

router.post('/google-login', async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ message: 'No se proporcionó el token de Google.' });
    }
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: '714367295627-vpeoa81drg97voneiii9drddnnk523ge.apps.googleusercontent.com',
        });
        const { name, email, sub: googleId } = ticket.getPayload();
        let user = await User.findOne({ email });
        if (user) {
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        } else {
            const userRole = email === 'admin@tienda.com' ? 'admin' : 'user';
            user = new User({ name, email, password: null, googleId, isVerified: true, acceptedTerms: true, role: userRole });
            await user.save();
        }
        const payload = { 
            id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role,
            googleId: user.googleId,
            hasPassword: !!user.password
        };
        const jwtToken = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
        res.json({ message: 'Autenticación con Google exitosa', token: jwtToken, user: payload });
    } catch (error) {
        console.error("Error en google-login:", error);
        res.status(400).json({ message: 'La autenticación con Google falló.' });
    }
});

// --- VINCULAR CUENTA DE GOOGLE (USUARIO YA LOGUEADO) ---
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

        // CRÍTICO: Incluir googleId en el payload del token
        const payload = { 
            id: currentUser._id, 
            name: currentUser.name, 
            email: currentUser.email, 
            role: currentUser.role,
            googleId: currentUser.googleId
        };
        
        const jwtToken = jwt.sign(
            payload, 
            process.env.JWT_SECRET || 'your_jwt_secret', 
            { expiresIn: '7d' }
        );

        res.json({
            message: '¡Cuenta de Google vinculada exitosamente!',
            user: payload,
            token: jwtToken
        });

    } catch (error) {
        console.error("Error al vincular cuenta de Google:", error);
        res.status(400).json({ message: 'La autenticación con Google falló durante la vinculación.' });
    }
});

// --- DESVINCULAR CUENTA DE GOOGLE ---
router.post('/unlink-google', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        if (!user.googleId) {
            return res.status(400).json({ message: 'No tienes una cuenta de Google vinculada.' });
        }

        user.googleId = null;
        await user.save();

        const payload = { 
            id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role,
            googleId: null
        };
        
        const jwtToken = jwt.sign(
            payload, 
            process.env.JWT_SECRET || 'your_jwt_secret', 
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Cuenta de Google desvinculada exitosamente.',
            user: payload,
            token: jwtToken
        });

    } catch (error) {
        console.error("Error al desvincular cuenta de Google:", error);
        res.status(500).json({ message: 'Error del servidor al desvincular.' });
    }
});

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
        
        // CRÍTICO: Incluir googleId en el payload del token
        const payload = { 
            id: updatedUser._id, 
            name: updatedUser.name, 
            email: updatedUser.email, 
            role: updatedUser.role,
            googleId: updatedUser.googleId || null
        };
        
        const token = jwt.sign(
            payload, 
            process.env.JWT_SECRET || 'your_jwt_secret', 
            { expiresIn: '7d' }
        );
        
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

// --- CAMBIO DE CONTRASEÑA (USUARIO LOGUEADO) ---
router.put('/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Verificar que el usuario no esté usando login de Google
        if (user.googleId && !user.password) {
            return res.status(400).json({ message: 'No puedes cambiar la contraseña de una cuenta registrada con Google.' });
        }
        
        // Comparar la contraseña actual
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'La contraseña actual es incorrecta.' });
        }

        // Validar nueva contraseña
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
        }

        // Hashear y guardar la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: '¡Contraseña actualizada con éxito!' });

    } catch (err) {
        console.error("Error en change-password:", err);
        res.status(500).json({ message: 'Error del servidor al cambiar la contraseña.' });
    }
});

module.exports = router;