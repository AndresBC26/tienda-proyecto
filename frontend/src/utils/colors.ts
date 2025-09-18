// src/utils/colors.ts
// Paleta de colores basada en "Northern Lights in the Canadian Rockies, Jasper"

export const colors = {
  // Colores principales
  primary: {
    main: '#5FCDD9', // Azul verdoso brillante (color principal)
    hover: '#04BFAD', // Verde aqua (hover principal)
    dark: '#027373', // Verde azulado profundo
  },

  // Colores de fondo
  background: {
    main: '#F5F7FA', // Fondo gris claro (neutro para contraste)
    card: '#FFFFFF', // Blanco puro (tarjetas)
    cardHover: '#FAFBFC', // Blanco con tinte gris (hover)
    overlay: 'rgba(23, 32, 38, 0.05)', // Overlay sutil con el tono oscuro principal
  },

  // Colores de texto
  text: {
    primary: '#172026', // Azul oscuro (texto principal)
    secondary: '#027373', // Verde azulado (texto secundario)
    light: '#5FCDD9', // Azul verdoso claro
    white: '#FFFFFF', // Blanco puro
  },

  // Colores de acento
  accent: {
    cyan: '#5FCDD9', // Azul verdoso brillante
    teal: '#04BFAD', // Verde agua
    emerald: '#04BF9D', // Verde esmeralda
    deep: '#027373', // Verde profundo
  },

  // Estados y feedback
  state: {
    success: '#04BF9D', // Verde éxito
    warning: '#F59E0B', // Amarillo advertencia (mantenido)
    error: '#EF4444', // Rojo error (mantenido)
    info: '#5FCDD9', // Azul verdoso info
  },

  // Bordes y sombras
  border: {
    light: '#E5E7EB', // Borde claro
    medium: '#D1D5DB', // Borde medio
    dark: '#9CA3AF', // Borde oscuro
  },

  // Sombras (para usar en box-shadow)
  shadow: {
    sm: '0 1px 2px 0 rgba(23, 32, 38, 0.05)',
    md: '0 4px 6px -1px rgba(23, 32, 38, 0.1), 0 2px 4px -1px rgba(23, 32, 38, 0.06)',
    lg: '0 10px 15px -3px rgba(23, 32, 38, 0.1), 0 4px 6px -2px rgba(23, 32, 38, 0.05)',
    xl: '0 20px 25px -5px rgba(23, 32, 38, 0.1), 0 10px 10px -5px rgba(23, 32, 38, 0.04)',
    card: '0 4px 12px rgba(23, 32, 38, 0.08)',
  },
};

// Clases de Tailwind CSS personalizadas
export const tailwindClasses = {
  // Botones principales
  primaryButton:
    'bg-[#5FCDD9] hover:bg-[#04BFAD] text-[#172026] font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]',

  // Cards
  card: 'bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden',
  cardHover: 'hover:bg-gray-50 hover:-translate-y-1',

  // Texto
  headingPrimary: 'text-[#172026] font-bold',
  textSecondary: 'text-[#027373]',
  textLight: 'text-[#5FCDD9]',

  // Contenedores
  container: 'bg-gray-50 min-h-screen',
  section: 'py-12 px-4',

  // Inputs
  input:
    'w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#5FCDD9] focus:border-transparent transition-all duration-200',

  // Badges/Pills
  badge: 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
};

// Función helper para generar gradientes
export const gradients = {
  hero: 'bg-gradient-to-br from-[#5FCDD9] via-[#04BFAD] to-[#027373]',
  card: 'bg-gradient-to-br from-white to-[#F5F7FA]',
  button: 'bg-gradient-to-r from-[#5FCDD9] to-[#04BFAD]',
  accent: 'bg-gradient-to-r from-[#027373] via-[#04BFAD] to-[#5FCDD9]',
};
