// routes/order.routes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

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

// GET /api/orders/my-orders (sin cambios)
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

// ✅ NUEVA RUTA: DELETE /api/orders/:id
// Permite al usuario cancelar uno de sus propios pedidos pendientes.
router.delete('/:id', auth, async (req, res) => {
    try {
        const orderId = req.params.id;
        const userEmail = req.user.email; // Email del usuario que hace la petición

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }

        // Verificación de seguridad: solo el dueño del pedido puede cancelarlo.
        if (order.shippingAddress.email !== userEmail) {
            return res.status(403).json({ message: 'No tienes permiso para cancelar este pedido.' });
        }

        // Solo se pueden cancelar pedidos que aún están pendientes.
        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'No puedes cancelar un pedido que ya fue procesado.' });
        }

        // Eliminar el pedido de la base de datos
        await Order.findByIdAndDelete(orderId);

        res.status(200).json({ message: 'Pedido cancelado exitosamente.' });

    } catch (err) {
        console.error("Error al cancelar el pedido:", err);
        res.status(500).json({ message: 'Error del servidor al cancelar el pedido.' });
    }
});

module.exports = router;