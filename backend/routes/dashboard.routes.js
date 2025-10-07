// routes/dashboard.routes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

// Middleware de autenticación (puedes copiarlo de tus otras rutas)
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


// GET /api/dashboard/stats - Ruta principal para obtener todas las estadísticas
router.get('/stats', auth, async (req, res) => {
  // Verificamos que solo el admin pueda acceder
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado.' });
  }

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Cálculos de las tarjetas
    const totalUsersPromise = User.countDocuments();
    const totalProductsPromise = Product.countDocuments();
    
    const totalSalesPromise = Order.aggregate([
      { $match: { status: 'approved' } }, // Solo contar ordenes aprobadas
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const monthlyIncomePromise = Order.aggregate([
      { $match: { status: 'approved', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    // 2. Datos para la gráfica de ventas por mes
    const salesByMonthPromise = Order.aggregate([
        { $match: { status: 'approved' } },
        {
            $group: {
                _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                totalVentas: { $sum: '$total' }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // 3. Datos para la gráfica de nuevos usuarios por mes
    const usersByMonthPromise = User.aggregate([
        {
            $group: {
                _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);


    // Ejecutar todas las consultas en paralelo para mayor eficiencia
    const [
      totalUsers, 
      totalProducts, 
      totalSalesData, 
      monthlyIncomeData,
      salesByMonth,
      usersByMonth
    ] = await Promise.all([
      totalUsersPromise,
      totalProductsPromise,
      totalSalesPromise,
      monthlyIncomePromise,
      salesByMonthPromise,
      usersByMonthPromise
    ]);

    // Formatear la respuesta
    const stats = {
      totalUsers: totalUsers || 0,
      totalProducts: totalProducts || 0,
      totalSales: totalSalesData[0]?.total || 0,
      monthlyIncome: monthlyIncomeData[0]?.total || 0,
      salesByMonth,
      usersByMonth,
    };

    res.json(stats);

  } catch (error) {
    console.error("Error al obtener estadísticas del dashboard:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

module.exports = router;