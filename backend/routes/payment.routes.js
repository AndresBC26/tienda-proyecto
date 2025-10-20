// routes/payment.routes.js
const express = require('express');
const router = express.Router();
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const Order = require('../models/Order'); // Asegúrate de que la ruta al modelo Order sea correcta

// Configura Mercado Pago con tu Access Token
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN, // Lee el token desde las variables de entorno
});

// ===== CONSTANTES DE NEGOCIO (COINCIDEN CON TU FRONTEND Y .ENV) =====
const FREE_SHIPPING_THRESHOLD = 100000;
// Lee el costo de envío desde las variables de entorno, o usa 12000 como valor por defecto
const SHIPPING_COST = Number(process.env.SHIPPING_COST) || 12000;
// ================================================================

// Ruta para crear la preferencia de pago en Mercado Pago
router.post('/create-preference', async (req, res) => {
  console.log('🔥 === INICIO CREATE-PREFERENCE ===');
  console.log('📦 Cuerpo recibido:', JSON.stringify(req.body, null, 2));

  try {
    const { cartItems, userId, shippingAddress } = req.body;

    // Validación básica del carrito
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      console.log('❌ Error: Carrito vacío.');
      return res.status(400).json({ message: 'El carrito de compras no puede estar vacío.' });
    }

    // Calcula el subtotal (precio ya incluye descuento si aplica)
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Calcula el costo de envío basado en el subtotal
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const finalTotal = subtotal + shippingCost; // El total que se cobrará

    console.log(`💰 Subtotal: ${subtotal}, Envío: ${shippingCost}, Total Final: ${finalTotal}`);

    // Crea una nueva orden en tu base de datos con estado 'pending'
    const newOrder = new Order({
      user: userId || 'guest', // Guarda el ID del usuario o 'guest'
      products: cartItems.map(item => ({
        product: item, // Guarda la info completa del producto en la orden
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        // podrías añadir selectedColor aquí si lo tienes en cartItems
      })),
      total: finalTotal, // Guarda el total final calculado
      shippingAddress,
      status: 'pending', // Estado inicial
    });

    const savedOrder = await newOrder.save();
    console.log('💾 Orden guardada en DB con ID:', savedOrder._id, 'y Total:', finalTotal);

    // Prepara los ítems para la preferencia de Mercado Pago
    const items = cartItems.map(item => ({
      id: item._id || item.id, // ID del producto
      title: item.name, // Nombre del producto
      unit_price: Number(item.price), // Precio unitario
      quantity: Number(item.quantity), // Cantidad
      currency_id: 'COP', // Moneda (Pesos Colombianos)
      picture_url: item.image, // URL de la imagen del producto
      description: `Talla: ${item.selectedSize}`, // Descripción (ej: talla)
    }));

    // ====[ ✅ CORRECCIÓN CLAVE ]=====
    // **Añade el costo de envío como un ítem separado si es mayor que cero**
    if (shippingCost > 0) {
      items.push({
        id: 'costo-envio', // Un ID único para el envío
        title: 'Costo de Envío',
        description: `Envío estándar (compras < ${FREE_SHIPPING_THRESHOLD.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })})`,
        unit_price: shippingCost, // El costo de envío calculado
        quantity: 1, // Siempre es 1
        currency_id: 'COP',
      });
      console.log('➕ Ítem de envío agregado a la preferencia.');
    }
    // ================================

    console.log('🛒 Items preparados para MP:', JSON.stringify(items, null, 2));

    // URLs de tu frontend y backend (leídas desde .env)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

    // Datos completos para crear la preferencia
    const preferenceData = {
      items: items, // Array con los productos Y el envío (si aplica)
      external_reference: savedOrder._id.toString(), // ID de tu orden para vincularla
      back_urls: {
        // URLs a donde redirigir al usuario según el resultado del pago
        // Asegúrate de que usan '#' si usas HashRouter en React
        success: `${frontendUrl}/#/payment-success?order_id=${savedOrder._id}`,
        failure: `${frontendUrl}/#/payment-failure?order_id=${savedOrder._id}`,
        pending: `${frontendUrl}/#/payment-pending?order_id=${savedOrder._id}` // Opcional
      },
      auto_return: 'approved', // Redirige automáticamente solo si el pago es aprobado
      notification_url: `${backendUrl}/api/payment/webhook`, // URL de tu backend para recibir notificaciones de MP
      // Puedes añadir más datos como 'payer', etc. si los tienes
    };

    console.log('⚙️ Datos completos de la preferencia:', JSON.stringify(preferenceData, null, 2));

    // Crea la preferencia usando el SDK de Mercado Pago
    const preference = new Preference(client);
    const result = await preference.create({ body: preferenceData });

    console.log('✅ Preferencia creada exitosamente en MP con ID:', result.id);

    // Devuelve el ID de la preferencia al frontend para redirigir al usuario
    res.json({
      id: result.id, // ID de la preferencia
      init_point: result.init_point, // URL de pago para producción
      sandbox_init_point: result.sandbox_init_point // URL de pago para pruebas (sandbox)
    });

  } catch (error) {
    // Manejo de errores detallado
    console.error('❌ === ERROR EN CREATE-PREFERENCE ===');
    console.error('Mensaje:', error.message);
    // Mercado Pago a veces incluye detalles en 'error.cause'
    if (error.cause) {
      console.error('Causa del error (MP):', JSON.stringify(error.cause, null, 2));
    }
    res.status(500).json({
      message: 'Error al crear la preferencia de pago',
      error: error.message,
      details: error.cause ? error.cause : null // Devuelve detalles si existen
    });
  }
});

// Ruta para verificar el estado de una orden específica (útil para la página de éxito/fallo)
router.get('/order-status/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      console.log('❌ Orden no encontrada para verificar estado:', req.params.orderId);
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    console.log('ℹ️ Estado de la orden', req.params.orderId, ':', order.status);
    res.json({
      status: order.status,
      paymentId: order.paymentId, // ID del pago en Mercado Pago (si existe)
      total: order.total
    });
  } catch (error) {
    console.error('❌ Error al obtener estado de orden:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Ruta para recibir Webhooks (notificaciones) de Mercado Pago
router.post('/webhook', async (req, res) => {
  console.log('🔔 Webhook de Mercado Pago recibido!');
  console.log('Query Params:', req.query); // Info como tipo de notificación y ID de datos
  console.log('Body:', req.body); // Cuerpo de la notificación (puede estar vacío a veces)

  const paymentQuery = req.query; // Los datos importantes suelen venir en la query

  try {
    // Verifica si la notificación es sobre un pago ('payment')
    if (paymentQuery.type === 'payment' && paymentQuery['data.id']) {
      const paymentId = paymentQuery['data.id'];
      console.log(`⏳ Obteniendo detalles del pago con ID: ${paymentId}`);

      // Usa el SDK para obtener la información completa del pago
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: paymentId });

      console.log('💳 Datos completos del pago obtenidos:', JSON.stringify(paymentData, null, 2));

      // Busca la orden en tu DB usando la 'external_reference' que guardaste
      const orderId = paymentData.external_reference;
      const order = await Order.findById(orderId);

      if (order) {
        // Actualiza el estado de tu orden y guarda el ID del pago de MP
        order.status = paymentData.status; // 'approved', 'rejected', 'pending', etc.
        order.paymentId = paymentData.id; // Guarda el ID del pago de MP
        await order.save();
        console.log('✅ Orden', orderId, 'actualizada en DB. Nuevo estado:', paymentData.status);

        // ---[ Aquí podrías añadir lógica adicional ]---
        // Ej: Enviar email de confirmación, actualizar stock, etc.
        // if (paymentData.status === 'approved') {
        //   // Lógica para pago aprobado...
        // }
        // ---------------------------------------------

      } else {
        console.log('❌ Orden no encontrada en DB con external_reference:', orderId);
      }
    } else {
      console.log('ℹ️ Notificación recibida no es de tipo "payment" o falta data.id. Ignorando.');
    }

    // Responde a Mercado Pago con un status 200 OK para confirmar recepción
    res.status(200).send('Webhook recibido correctamente.');

  } catch (error) {
    console.error('❌ Error procesando webhook de Mercado Pago:', error);
    // Responde con error, pero MP podría reintentar
    res.status(500).json({ message: 'Error al procesar webhook' });
  }
});

module.exports = router;