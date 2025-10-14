// routes/order.routes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

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

// GET /api/orders/my-orders - Obtener los pedidos del usuario logueado
router.get('/my-orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ 'shippingAddress.email': req.user.email }).sort({ createdAt: -1 });

        if (!orders) {
            return res.json([]);
        }

        res.json(orders);
    } catch (err) {
        console.error("Error al obtener las órdenes del usuario:", err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;