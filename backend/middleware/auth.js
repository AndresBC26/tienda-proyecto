// backend/middleware/auth.js - Middleware de autenticación mejorado
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      console.log('❌ Auth Error: No token provided', {
        headers: req.headers,
        url: req.url,
        method: req.method
      });
      return res.status(401).json({ 
        message: 'No hay token, autorización denegada',
        code: 'NO_TOKEN'
      });
    }

    const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
    
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        console.log('❌ Auth Error: Invalid token', {
          error: err.message,
          token: token.substring(0, 20) + '...',
          url: req.url,
          method: req.method
        });
        
        if (err.name === 'TokenExpiredError') {
          return res.status(403).json({ 
            message: 'Token expirado, inicia sesión nuevamente',
            code: 'TOKEN_EXPIRED'
          });
        }
        
        return res.status(403).json({ 
          message: 'Token no válido',
          code: 'INVALID_TOKEN'
        });
      }
      
      req.user = decoded;
      console.log('✅ Auth Success:', {
        userId: decoded.id,
        email: decoded.email,
        role: decoded.role,
        url: req.url,
        method: req.method
      });
      
      next();
    });
    
  } catch (error) {
    console.error('❌ Auth Middleware Error:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method
    });
    
    res.status(500).json({ 
      message: 'Error interno en autenticación',
      code: 'AUTH_ERROR'
    });
  }
};

// Middleware específico para admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Autenticación requerida',
      code: 'NO_AUTH'
    });
  }
  
  if (req.user.role !== 'admin') {
    console.log('❌ Admin Access Denied:', {
      userId: req.user.id,
      role: req.user.role,
      url: req.url,
      method: req.method
    });
    
    return res.status(403).json({ 
      message: 'Acceso denegado. Se requieren permisos de administrador.',
      code: 'ADMIN_REQUIRED'
    });
  }
  
  console.log('✅ Admin Access Granted:', {
    userId: req.user.id,
    email: req.user.email,
    url: req.url,
    method: req.method
  });
  
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin
};
