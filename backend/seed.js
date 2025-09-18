// backend/seed.js
const axios = require('axios');

// URL base de tu backend
const BASE_URL = 'http://localhost:5000/api';

const products = [
  {
    name: "Camiseta 'Distrito Neo'",
    description: "Diseño minimalista con un toque futurista. Tela 100% algodón premium.",
    price: 85000,
    category: "Camisetas",
    image: "https://images.unsplash.com/photo-1579854728514-c102a468d6f9?q=80&w=1770&auto=format&fit=crop",
    stock: 25,
    rating: 4.8,
    reviewCount: 34
  },
  {
    name: "Camiseta 'Graffiti Soul'",
    description: "Inspirada en el arte urbano de las calles. Perfecta para un look atrevido y auténtico.",
    price: 92000,
    category: "Camisetas",
    image: "https://images.unsplash.com/photo-1627916664984-7ac138e2d4d9?q=80&w=1770&auto=format&fit=crop",
    stock: 12,
    rating: 4.5,
    reviewCount: 18
  },
  {
    name: "Camiseta 'Silent Night'",
    description: "Estilo monocromático y discreto. Ideal para combinar con cualquier prenda. Ajuste holgado.",
    price: 78000,
    category: "Camisetas",
    image: "https://images.unsplash.com/photo-1548039750-f80e3223063f?q=80&w=1770&auto=format&fit=crop",
    stock: 0,
    rating: 4.9,
    reviewCount: 56
  },
  {
    name: "Camiseta 'Urban Flow'",
    description: "Gráficos fluidos que representan el movimiento de la ciudad. Comodidad y estilo en una sola prenda.",
    price: 89000,
    category: "Camisetas",
    image: "https://images.unsplash.com/photo-1627225132213-90d1ed026c48?q=80&w=1770&auto=format&fit=crop",
    stock: 40,
    rating: 4.6,
    reviewCount: 22
  },
  {
    name: "Camiseta 'Neon Pulse'",
    description: "Diseño audaz con acentos de color neón. El centro de atención de cualquier outfit.",
    price: 95000,
    category: "Camisetas",
    image: "https://images.unsplash.com/photo-1606775796328-9366d0392f3a?q=80&w=1770&auto=format&fit=crop",
    stock: 5,
    rating: 4.7,
    reviewCount: 30
  },
  {
    name: "Camiseta 'Concrete Jungle'",
    description: "Patrón abstracto que evoca la naturaleza en medio de la ciudad. Confección de alta resistencia.",
    price: 88000,
    category: "Camisetas",
    image: "https://images.unsplash.com/photo-1616801948483-a75d1d61c6b1?q=80&w=1770&auto=format&fit=crop",
    stock: 30,
    rating: 4.2,
    reviewCount: 15
  }
];

const seedDatabase = async () => {
  try {
    console.log('Iniciando la inserción de productos en la base de datos...');
    for (const product of products) {
      await axios.post(`${BASE_URL}/products`, product);
      console.log(`✅ Producto "${product.name}" insertado.`);
    }
    console.log('✨ ¡Todos los productos han sido insertados exitosamente!');
  } catch (error) {
    console.error('❌ Error al insertar productos:', error.response?.data?.message || error.message);
  }
};

seedDatabase();