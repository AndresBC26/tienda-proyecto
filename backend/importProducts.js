// importProducts.js
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product'); // tu modelo de productos

// ⬇️ Aquí pega tu array actual de productos
const productos = [
  {
    name: "iPhone 14",
    price: 999,
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400",
    images: [
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600",
      "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600"
    ],
    category: "Smartphones",
    description: "Potencia, estilo y seguridad en tus manos...",
    features: [
      "Pantalla Super Retina XDR",
      "Chip A15 Bionic",
      "Sistema de cámaras avanzado",
      "Resistencia al agua y polvo",
      "Batería de larga duración"
    ],
    specifications: {
      "Pantalla": "6.1\" Super Retina XDR OLED",
      "Procesador": "A15 Bionic",
      "Almacenamiento": "128GB, 256GB, 512GB",
      "Cámara": "12MP Dual",
      "Sistema Operativo": "iOS 16"
    },
    stock: 15,
    rating: 4.8,
    reviewCount: 127
  },
  // ... el resto de tus productos
];

(async () => {
  try {
    // Conectar a MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');

    // Limpiar colección antes de insertar (opcional)
    await Product.deleteMany({});
    console.log('🗑️ Productos anteriores eliminados');

    // Insertar productos nuevos
    await Product.insertMany(productos);
    console.log(`🎉 ${productos.length} productos importados con éxito`);

    // Cerrar conexión
    mongoose.connection.close();
    console.log('👋 Conexión cerrada');
  } catch (error) {
    console.error('❌ Error importando productos:', error);
    mongoose.connection.close();
  }
})();
