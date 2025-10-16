// src/utils/brandConfig.ts
// Configuración de marca personalizada

export const brandConfig = {
  // INFORMACIÓN BÁSICA DE LA MARCA
  name: 'Elegancia Urban', // Nombre actualizado
  slogan: 'El arte de vestir la ciudad.', // Slogan actualizado

  // LOGO E IMÁGENES
  logo: {
    icon: '🔥', // Emoji representativo
    url: '/', // Enlace al inicio
    alt: 'Logo de Elegancia Urban', // Texto alternativo
  },

  // INFORMACIÓN DE CONTACTO
  contact: {
    email: 'eleganciaurban7@gmil.com', // Email de la tienda
    phone: '+57 (320) 366-4711', // Teléfono de la tienda
    whatsapp: '+573203664711', // WhatsApp sin espacios ni símbolos
    address: {
      street: 'Avenida Siempre Viva #12-34',
      city: 'Bogotá D.C.',
      country: 'Colombia',
      zipCode: '110111',
    },
  },

  // REDES SOCIALES (con placeholders)
  social: {
    facebook: 'https://www.facebook.com/andresborreroc',
    instagram: 'https://www.instagram.com/andresborreroc/',
    tiktok: 'https://www.tiktok.com/@_andresborreroc_',
  },

  // INFORMACIÓN EMPRESARIAL
  company: {
    foundedYear: 2022,
    description:
      'Elegancia Urban es una marca de moda enfocada en camisetas con diseños urbanos y contemporáneos. Creemos que la ropa es una forma de expresión personal y ofrecemos prendas de alta calidad que reflejan las últimas tendencias de la cultura urbana.',
    mission:
      'Ofrecer diseños de camisetas únicos y de calidad premium que permitan a nuestros clientes expresar su estilo individual y sentirse seguros en cualquier entorno urbano.',
    vision:
      'Ser la marca líder de moda urbana en Colombia para 2028, reconocida por nuestra creatividad, calidad y por construir una comunidad apasionada por el estilo y la autoexpresión.',
    values: ['Calidad Excepcional', 'Creatividad Constante', 'Comunidad Auténtica'],
  },

  // CONFIGURACIÓN DE NEGOCIO
  business: {
    currency: 'COP',
    freeShippingThreshold: 100000,
    shippingCost: 12000,
    // ===== AÑADIMOS EL DESCUENTO AQUÍ =====
    discountPercentage: 0.10, // 10% de descuento general
    // =====================================
    returnDays: 30,
    warrantyYears: 1,
    supportHours: 'Lun - Sab: 9AM - 7PM',
  },
};