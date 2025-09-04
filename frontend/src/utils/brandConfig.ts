// src/utils/brandConfig.ts
// Configuración de marca personalizada

export const brandConfig = {
  // INFORMACIÓN BÁSICA DE LA MARCA
  name: 'InnoVibe', // Reemplazar con tu nombre
  slogan: 'Tu idea, nuestra vibra.', // Reemplazar con tu slogan

  // LOGO E IMÁGENES
  logo: {
    icon: '🛍️', // Emoji temporal (puedes cambiarlo)
    url: 'https://innovibe.org/', // Si tienes logo, poner ruta aquí
    alt: 'InnoVibe', // Texto alternativo
  },

  // INFORMACIÓN DE CONTACTO
  contact: {
    email: 'estebanleal547@gmail.com', // Tu email (real o simulado)
    phone: '+57 (320) 397-3733', // Tu teléfono (real o simulado)
    whatsapp: '+573203973733', // WhatsApp sin espacios ni símbolos
    address: {
      street: 'Calle Principal #3-14',
      city: 'Garzón-Huila',
      country: 'Colombia',
      zipCode: '414020',
    },
  },

  // REDES SOCIALES
  social: {
    facebook: 'https://facebook.com/tunombre',
    instagram: 'https://instagram.com/tunombre',
    twitter: 'https://twitter.com/tunombre',
    linkedin: 'https://linkedin.com/company/tunombre',
  },

  // INFORMACIÓN EMPRESARIAL
  company: {
    foundedYear: 2024,
    description:
      'InnoVibe es una empresa enfocada en la creación de soluciones tecnológicas y creativas que conectan la innovación con las personas. Nos especializamos en transformar ideas en realidades tangibles, combinando estrategia, diseño y tecnología para generar experiencias modernas, eficientes y con impacto. Nuestro enfoque es ser aliados de emprendedores, empresas y organizaciones que buscan crecer y diferenciarse en un mundo digital en constante evolución.',
    mission:
      'Impulsar el crecimiento de personas y empresas a través de soluciones innovadoras y accesibles, que integren creatividad, tecnología y estrategia, ofreciendo un acompañamiento cercano donde cada idea encuentre su vibra y se convierta en resultados reales.',
    vision:
      'Ser reconocidos en el 2030 como una empresa líder en innovación y desarrollo tecnológico a nivel regional y global, destacándonos por nuestra capacidad de vibrar con las ideas de nuestros clientes y convertirlas en proyectos sostenibles, creativos y con impacto positivo en la sociedad.',
    values: ['Calidad excepcional', 'Servicio al cliente', 'Innovación constante'],
  },

  // CONFIGURACIÓN DE NEGOCIO
  business: {
    currency: 'USD',
    freeShippingThreshold: 100, // Envío gratis desde este monto
    returnDays: 30, // Días para devoluciones
    warrantyYears: 2, // Años de garantía
    supportHours: 'Lun - Vie: 9AM - 6PM',
  },
};
