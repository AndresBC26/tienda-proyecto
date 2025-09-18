// models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: String, // Puede ser ObjectId si tienes usuarios registrados, o String para guests
    required: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.Mixed, // Permite guardar el objeto completo del producto
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    selectedSize: {
      type: String,
      required: true
    }
  }],
  total: {
    type: Number,
    required: true,
    min: 0
  },
  shippingAddress: {
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    department: {
      type: String,
      required: true
    },
    postalCode: {
      type: String
    },
    country: {
      type: String,
      default: 'Colombia'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'in_process'],
    default: 'pending'
  },
  paymentId: {
    type: String // ID del pago de Mercado Pago
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar updatedAt
OrderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', OrderSchema);