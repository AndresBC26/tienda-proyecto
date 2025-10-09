// backend/routes/health.routes.js - Rutas de diagnóstico y salud del servidor
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

// Endpoint básico de salud
router.get('/ping', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Endpoint de diagnóstico completo
router.get('/diagnosis', async (req, res) => {
  const diagnosis = {
    server: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform
    },
    database: {
      status: 'Unknown',
      connected: false
    },
    cloudinary: {
      status: 'Unknown',
      configured: false
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 5000,
      hasMongoUri: !!process.env.MONGODB_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasCloudinaryConfig: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
    }
  };

  // Verificar MongoDB
  try {
    if (mongoose.connection.readyState === 1) {
      diagnosis.database.status = 'Connected';
      diagnosis.database.connected = true;
      diagnosis.database.host = mongoose.connection.host;
      diagnosis.database.name = mongoose.connection.name;
    } else {
      diagnosis.database.status = 'Disconnected';
      diagnosis.database.readyState = mongoose.connection.readyState;
    }
  } catch (error) {
    diagnosis.database.status = 'Error';
    diagnosis.database.error = error.message;
  }

  // Verificar Cloudinary
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      diagnosis.cloudinary.configured = true;
      diagnosis.cloudinary.cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      
      // Intentar ping a Cloudinary
      try {
        await cloudinary.api.ping();
        diagnosis.cloudinary.status = 'Connected';
      } catch (cloudError) {
        diagnosis.cloudinary.status = 'Error';
        diagnosis.cloudinary.error = cloudError.message;
      }
    } else {
      diagnosis.cloudinary.status = 'Not Configured';
    }
  } catch (error) {
    diagnosis.cloudinary.status = 'Error';
    diagnosis.cloudinary.error = error.message;
  }

  res.json(diagnosis);
});

// Endpoint para verificar rutas
router.get('/routes', (req, res) => {
  const routes = {
    available: [
      'GET /api/health/ping',
      'GET /api/health/diagnosis',
      'GET /api/health/routes',
      'GET /api/products',
      'POST /api/products',
      'PUT /api/products/:id',
      'DELETE /api/products/:id',
      'POST /api/products/test-upload',
      'POST /api/users/login',
      'POST /api/users/register'
    ],
    middleware: [
      'CORS enabled',
      'JSON parser (50mb limit)',
      'URL encoded parser (50mb limit)',
      'Static files (/public)',
      'Authentication middleware',
      'Error handler'
    ]
  };
  
  res.json(routes);
});

module.exports = router;
