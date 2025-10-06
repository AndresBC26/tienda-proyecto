// routes/payment.routes.js
const express = require('express');
const router = express.Router();
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const Order = require('../models/Order');

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

// ===== CONSTANTES DE NEGOCIO (PARA COHERENCIA) =====
const FREE_SHIPPING_THRESHOLD = 100000;
const SHIPPING_COST = 0;
// =================================================

router.post('/create-preference', async (req, res) => {
  console.log('🔥 === INICIO CREATE-PREFERENCE ===');
  console.log('📦 Cuerpo recibido:', JSON.stringify(req.body, null, 2));

  try {
    const { cartItems, userId, shippingAddress } = req.body;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: 'El carrito de compras no puede estar vacío.' });
    }
    
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // ===== PORCENTAJE DE DESCUENTO CORREGIDO AL 10% =====
    const discountPercentage = 0.10; 
    const discountAmount = subtotal * discountPercentage;

    // LÓGICA DE ENVÍO EN EL BACKEND
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const finalTotal = subtotal - discountAmount + shippingCost;

    console.log(`💰 Subtotal: ${subtotal}, Descuento: ${discountAmount}, Envío: ${shippingCost}, Total Final: ${finalTotal}`);
    
    const newOrder = new Order({
      user: userId,
      products: cartItems.map(item => ({
        product: item,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
      })),
      total: finalTotal, // Usamos el total final que incluye el envío
      shippingAddress,
      status: 'pending',
    });
    const savedOrder = await newOrder.save();
    console.log('💾 Orden guardada con ID:', savedOrder._id, 'y Total:', finalTotal);

    const items = cartItems.map(item => ({
      id: item._id || item.id,
      title: item.name,
      unit_price: Number(item.price),
      quantity: Number(item.quantity),
      currency_id: 'COP',
      picture_url: item.image,
      description: `Talla: ${item.selectedSize}`,
    }));

    if (discountAmount > 0) {
      items.push({
        id: 'descuento-general',
        title: 'Descuento Especial',
        description: 'Descuento del 10% aplicado en tu compra', // Descripción corregida
        unit_price: -discountAmount,
        quantity: 1,
        currency_id: 'COP',
      });
    }

    // AÑADIR EL ENVÍO COMO UN ÍTEM PARA MERCADO PAGO
    if (shippingCost > 0) {
        items.push({
            id: 'costo-envio',
            title: 'Costo de Envío',
            description: 'Tarifa de envío estándar para compras menores a $100.000',
            unit_price: shippingCost,
            quantity: 1,
            currency_id: 'COP',
        });
    }

    console.log('🛒 Items preparados para MP:', JSON.stringify(items, null, 2));

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

    const preferenceData = {
      items: items,
      external_reference: savedOrder._id.toString(),
      back_urls: {
        success: `${frontendUrl}/payment-success?order_id=${savedOrder._id}`,
        failure: `${frontendUrl}/payment-failure?order_id=${savedOrder._id}`,
        pending: `${frontendUrl}/payment-pending?order_id=${savedOrder._id}`
      },
      notification_url: `${backendUrl}/api/payment/webhook`
    };

    console.log('⚙️ Preference data completa:', JSON.stringify(preferenceData, null, 2));

    const preference = new Preference(client);
    const result = await preference.create({ body: preferenceData });

    console.log('✅ Preferencia creada exitosamente:', result.id);

    res.json({ 
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point
    });

  } catch (error) {
    console.error('❌ === ERROR EN CREATE-PREFERENCE ===');
    console.error('Mensaje:', error.message);
    if (error.cause) {
      console.error('Causa del error:', JSON.stringify(error.cause, null, 2));
    }
    res.status(500).json({ 
      message: 'Error al crear la preferencia de pago', 
      error: error.message,
      details: error.cause ? error.cause : null
    });
  }
});

// Endpoint para verificar el estado de una orden
router.get('/order-status/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    res.json({ 
      status: order.status,
      paymentId: order.paymentId,
      total: order.total 
    });
  } catch (error) {
    console.error('Error al obtener estado de orden:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});
  
// Endpoint para Webhook de Mercado Pago
router.post('/webhook', async (req, res) => {
  console.log('🔔 Webhook recibido');
  console.log('Query params:', req.query);
  console.log('Body:', req.body);
  
  const paymentQuery = req.query;
  try {
    if (paymentQuery.type === 'payment') {
      const payment = new Payment(client);
      const data = await payment.get({ id: paymentQuery['data.id'] });
      
      console.log('💳 Datos del pago:', JSON.stringify(data, null, 2));
      
      const orderId = data.external_reference;
      const order = await Order.findById(orderId);
      
      if (order) {
        order.status = data.status;
        order.paymentId = data.id;
        await order.save();
        console.log('✅ Orden actualizada:', orderId, 'Estado:', data.status);
      } else {
        console.log('❌ Orden no encontrada:', orderId);
      }
    }
    res.status(200).send('ok');
  } catch (error) {
    console.error('❌ Error en webhook:', error);
    res.status(500).json({ message: 'Error en webhook' });
  }
});

module.exports = router;